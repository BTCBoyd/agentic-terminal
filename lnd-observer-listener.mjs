#!/usr/bin/env node
/**
 * LND Observer Listener Service
 * 
 * Polls LND node for settled invoices every 30 seconds
 * Automatically submits cryptographically signed attestations to Observer Protocol
 * Logs all activity with timestamps
 * 
 * Run: node lnd-observer-listener.mjs
 * Or: systemd service (recommended for production)
 */

import { readFileSync, appendFileSync, existsSync, writeFileSync } from 'fs';
import https from 'https';
import crypto from 'crypto';
import * as secp256k1 from '@noble/secp256k1';

// Configure secp256k1 to use Node.js crypto for hashing
secp256k1.hashes.sha256 = (...msgs) => {
  const h = crypto.createHash('sha256');
  msgs.forEach(m => h.update(m));
  return h.digest();
};
secp256k1.hashes.hmacSha256 = (key, ...msgs) => {
  const h = crypto.createHmac('sha256', key);
  msgs.forEach(m => h.update(m));
  return h.digest();
};

// Configuration
const CONFIG = {
  pollIntervalMs: 30000, // 30 seconds
  observerProtocolUrl: 'https://api.observerprotocol.org',
  agentId: 'maxi-0001',
  agentAlias: 'maxi',
  logFile: '/home/futurebit/.openclaw/workspace/observer-listener.log',
  stateFile: '/home/futurebit/.openclaw/workspace/observer-listener-state.json',
};

// LND Connection
const LND_CONFIG = {
  restUrl: 'https://127.0.0.1:8082',
  macaroonPath: '/media/nvme/lnd-data/data/chain/bitcoin/mainnet/admin.macaroon',
  tlsCertPath: '/media/nvme/lnd-data/tls.cert',
};

// Load LND credentials
const macaroonHex = Buffer.from(readFileSync(LND_CONFIG.macaroonPath)).toString('hex');
const tlsCert = readFileSync(LND_CONFIG.tlsCertPath);

// Maxi's secp256k1 private key (from Nostr identity)
// This is used to cryptographically sign all attestations
const PRIVATE_KEY_HEX = '9bdbc947e250e96244bfcbe260dacf141a5fe67e1e678b7e2f17709404439a45';

// Derive public key from private key (ensures they match)
const PUBLIC_KEY_BYTES = secp256k1.getPublicKey(Buffer.from(PRIVATE_KEY_HEX, 'hex'));
const PUBLIC_KEY_HEX = Buffer.from(PUBLIC_KEY_BYTES).toString('hex');

// Load or initialize state
function loadState() {
  if (existsSync(CONFIG.stateFile)) {
    try {
      return JSON.parse(readFileSync(CONFIG.stateFile, 'utf8'));
    } catch (e) {
      log('warn', `Failed to load state: ${e.message}, starting fresh`);
    }
  }
  return {
    lastProcessedIndex: 0,
    processedPaymentHashes: [],
    totalSubmitted: 0,
    startTime: new Date().toISOString(),
  };
}

function saveState(state) {
  writeFileSync(CONFIG.stateFile, JSON.stringify(state, null, 2));
}

// Logging
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  console.log(logEntry);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
  
  // Append to log file
  try {
    appendFileSync(CONFIG.logFile, logEntry + '\n');
    if (data) {
      appendFileSync(CONFIG.logFile, JSON.stringify(data, null, 2) + '\n');
    }
  } catch (e) {
    console.error(`Failed to write to log: ${e.message}`);
  }
}

// LND API helper
function lndRequest(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 8082,
      path,
      method,
      ca: tlsCert,
      headers: {
        'Grpc-Metadata-macaroon': macaroonHex,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`LND ${method} ${path} failed (${res.statusCode}): ${data}`));
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error: ${data}`)); }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Get settled invoices since last check
async function getNewSettledInvoices(lastIndex) {
  try {
    const data = await lndRequest('GET', `/v1/invoices?num_max_invoices=50&reversed=true`);
    const invoices = data.invoices || [];
    
    // Filter for settled invoices with index > lastProcessedIndex
    const newInvoices = invoices.filter(inv => 
      inv.settled && 
      inv.settle_index > lastIndex
    );
    
    return newInvoices.sort((a, b) => a.settle_index - b.settle_index);
  } catch (e) {
    log('error', `Failed to fetch invoices: ${e.message}`);
    return [];
  }
}

// Create cryptographic attestation with real secp256k1 signing
async function createAttestation(invoice) {
  const timestamp = new Date(parseInt(invoice.settle_date) * 1000).toISOString();
  const paymentHash = Buffer.from(invoice.r_hash, 'base64').toString('hex');
  const preimage = invoice.r_preimage ? Buffer.from(invoice.r_preimage, 'base64').toString('hex') : null;

  // Build attestation payload
  const attestation = {
    agent_id: CONFIG.agentId,
    protocol: 'lightning',
    transaction_reference: paymentHash,
    timestamp: timestamp,
    preimage: preimage, // Cryptographic proof of payment
    direction: 'inbound',
    amount_sats: parseInt(invoice.amt_paid_sat || invoice.value),
    counterparty: extractCounterparty(invoice.memo),
    memo: invoice.memo ? invoice.memo.replace(/[^\x00-\x7F]/g, '-') : null, // sanitize non-ASCII for URL-safe signing
    public_key: PUBLIC_KEY_HEX, // Include public key for verification
    // NOTE: settle_index intentionally excluded — backend doesn't include it in signature verification
  };

  // Sign the attestation with real secp256k1 ECDSA
  const message = JSON.stringify(attestation);
  const signature = await createRealSignature(message);

  log('info', `Created real secp256k1 signature: ${signature.substring(0, 32)}...`);

  return {
    ...attestation,
    signature: signature,
  };
}

// Extract counterparty from memo (heuristic)
function extractCounterparty(memo) {
  if (!memo) return 'unknown';
  
  // Known patterns
  if (memo.toLowerCase().includes('arcadia')) return 'ArcadiaB';
  if (memo.toLowerCase().includes('boyd')) return 'Boyd';
  if (memo.toLowerCase().includes('vicky')) return 'vicky-0002';
  if (memo.toLowerCase().includes('l402')) return 'L402-Client';
  
  return 'unknown';
}

// Create real secp256k1 ECDSA signature
// Uses Maxi's Nostr private key for cryptographic proof of identity
async function createRealSignature(message) {
  try {
    // Use Python cryptography library via stdin pipe — avoids shell escaping issues
    // Python backend verifies with ECDSA(SHA256); this produces exactly compatible signatures
    const { spawnSync } = await import('child_process');
    const result = spawnSync(
      'python3',
      ['/home/futurebit/.openclaw/workspace/op-sign.py'],
      { input: message, encoding: 'utf-8', timeout: 5000 }
    );
    if (result.status !== 0) throw new Error(result.stderr || 'python signing failed');
    return result.stdout.trim();
  } catch (e) {
    log('error', `Failed to create signature: ${e.message}`);
    throw e;
  }
}

// Legacy placeholder function - kept for reference but not used
function createDeterministicSignature(message) {
  const hash = crypto.createHash('sha256').update(message).digest('hex');
  return `sig_placeholder_${hash.substring(0, 32)}_${Date.now()}`;
}

// Submit to Observer Protocol
async function submitToObserverProtocol(attestation) {
  try {
    // Build query parameters (Observer Protocol uses query params, not JSON body)
    const params = new URLSearchParams({
      agent_id: attestation.agent_id,
      protocol: attestation.protocol,
      transaction_reference: attestation.transaction_reference,
      timestamp: attestation.timestamp,
      signature: attestation.signature,
      optional_metadata: JSON.stringify({
        preimage: attestation.preimage,   // must match what's signed
        direction: attestation.direction,
        amount_sats: attestation.amount_sats,
        counterparty: attestation.counterparty,
        memo: attestation.memo,
      }),
    });
    
    const url = `${CONFIG.observerProtocolUrl}/observer/submit-transaction?${params.toString()}`;
    
    log('info', `Submitting to Observer Protocol: ${attestation.transaction_reference.substring(0, 16)}...`);
    
    // Make actual submission
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    log('info', `  ✓ Submitted to Observer Protocol`, { event_id: result.event_id, verified: result.verified });
    
    return { success: true, submitted: true, result };
  } catch (e) {
    log('error', `Failed to submit to Observer Protocol: ${e.message}`);
    return { success: false, error: e.message };
  }
}

// Process a single invoice
async function processInvoice(invoice, state) {
  const paymentHash = Buffer.from(invoice.r_hash, 'base64').toString('hex');
  
  // Check if already processed
  if (state.processedPaymentHashes.includes(paymentHash)) {
    log('debug', `Skipping already processed invoice: ${paymentHash.substring(0, 16)}...`);
    return false;
  }
  
  log('info', `Processing settled invoice #${invoice.settle_index}: ${paymentHash.substring(0, 16)}...`);
  log('info', `  Amount: ${invoice.amt_paid_sat || invoice.value} sats`);
  log('info', `  Memo: ${invoice.memo || '(no memo)'}`);

  // Create attestation with real cryptographic signing
  const attestation = await createAttestation(invoice);
  log('info', `  Created attestation with signature: ${attestation.signature.substring(0, 50)}...`);
  
  // Submit to Observer Protocol
  const result = await submitToObserverProtocol(attestation);
  
  if (result.success) {
    log('info', `  ✓ Successfully processed`, result);
    
    // Update state
    state.processedPaymentHashes.push(paymentHash);
    state.lastProcessedIndex = Math.max(state.lastProcessedIndex, invoice.settle_index);
    state.totalSubmitted++;
    saveState(state);
    
    return true;
  } else {
    log('error', `  ✗ Failed to process`, result);
    return false;
  }
}

// Main poll cycle
async function pollCycle(state) {
  log('info', `Polling LND for new settled invoices (last index: ${state.lastProcessedIndex})...`);
  
  const invoices = await getNewSettledInvoices(state.lastProcessedIndex);
  
  if (invoices.length === 0) {
    log('info', 'No new settled invoices found');
    return;
  }
  
  log('info', `Found ${invoices.length} new settled invoice(s)`);
  
  for (const invoice of invoices) {
    await processInvoice(invoice, state);
  }
  
  log('info', `Cycle complete. Total processed: ${state.totalSubmitted}`);
}

// Health check
async function healthCheck() {
  try {
    const info = await lndRequest('GET', '/v1/getinfo');
    return {
      healthy: true,
      node: info.alias,
      pubkey: info.identity_pubkey.substring(0, 20) + '...',
      synced: info.synced_to_chain,
      channels: info.num_active_channels,
    };
  } catch (e) {
    return { healthy: false, error: e.message };
  }
}

// Main loop
async function main() {
  log('info', '=== LND Observer Listener Starting ===');
  log('info', `Agent: ${CONFIG.agentId} (${CONFIG.agentAlias})`);
  log('info', `Poll interval: ${CONFIG.pollIntervalMs}ms`);
  log('info', `Observer Protocol: ${CONFIG.observerProtocolUrl}`);
  
  // Load state
  const state = loadState();
  log('info', `Loaded state: ${state.totalSubmitted} previously processed`);
  
  // Initial health check
  const health = await healthCheck();
  if (!health.healthy) {
    log('error', 'LND health check failed', health);
    process.exit(1);
  }
  log('info', 'LND health check passed', health);
  
  // Run initial poll
  await pollCycle(state);
  
  // Set up interval
  log('info', `Starting poll loop (every ${CONFIG.pollIntervalMs}ms)...`);
  setInterval(() => pollCycle(state), CONFIG.pollIntervalMs);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('info', 'Shutting down gracefully...');
    saveState(state);
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    log('info', 'Shutting down gracefully...');
    saveState(state);
    process.exit(0);
  });
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(e => {
    log('error', 'Fatal error', e);
    process.exit(1);
  });
}

export { pollCycle, createAttestation, submitToObserverProtocol };
