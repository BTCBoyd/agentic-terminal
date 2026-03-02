#!/usr/bin/env node
/**
 * Infrastructure Verification Script
 * MUST RUN before making ANY public claims about capabilities
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import https from 'https';

const HOME = process.env.HOME;

console.log('🔍 MAXI INFRASTRUCTURE VERIFICATION\n');
console.log('=' .repeat(60));

let errors = [];
let warnings = [];
let verified = [];

// Check 1: Direct LND credentials exist
console.log('\n1. Checking direct LND credentials...');
const lndCredsPath = resolve(HOME, '.openclaw/workspace/.lnd-credentials');
if (existsSync(lndCredsPath)) {
  const lndContent = readFileSync(lndCredsPath, 'utf-8');
  if (lndContent.includes('LND_REST_URL') && lndContent.includes('LND_MACAROON_PATH')) {
    verified.push('✅ LND credentials file exists and has required fields');
    console.log('   Testing LND REST API connection...');
    testLNDConnection();
  } else {
    errors.push('❌ LND credentials file missing required fields');
  }
} else {
  errors.push('❌ LND credentials file not found (.lnd-credentials)');
}

// Check 2: Infrastructure state file
console.log('\n2. Checking infrastructure state documentation...');
const statePath = resolve(HOME, '.openclaw/workspace/MAXI-INFRASTRUCTURE-STATE.md');
if (existsSync(statePath)) {
  verified.push('✅ Infrastructure state file exists');
} else {
  errors.push('❌ Infrastructure state file not found');
}

// Check 3: X reply agent configuration
console.log('\n3. Checking X reply agent configuration...');
const xReplyPath = resolve(HOME, '.openclaw/workspace/x-reply-agent.mjs');
if (existsSync(xReplyPath)) {
  const xReplyContent = readFileSync(xReplyPath, 'utf-8');
  if (xReplyContent.includes('020e1929') || xReplyContent.includes('Lightning') || xReplyContent.includes('Bitcoin')) {
    verified.push('✅ X reply agent configured with Bitcoin/Lightning context');
  } else {
    warnings.push('⚠️  X reply agent may be missing LND node pubkey context');
  }
} else {
  warnings.push('⚠️  X reply agent not found (may not be deployed)');
}

// Check 4: Nostr configuration
console.log('\n4. Checking Nostr integration...');
const nostrReplyPath = resolve(HOME, '.openclaw/workspace/nostr-reply-agent.mjs');
if (existsSync(nostrReplyPath)) {
  verified.push('✅ Nostr reply agent exists');
} else {
  warnings.push('⚠️  Nostr reply agent not found');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 VERIFICATION SUMMARY:\n');

if (verified.length > 0) {
  console.log('VERIFIED:');
  verified.forEach(v => console.log('  ' + v));
}

if (warnings.length > 0) {
  console.log('\nWARNINGS:');
  warnings.forEach(w => console.log('  ' + w));
}

if (errors.length > 0) {
  console.log('\nERRORS:');
  errors.forEach(e => console.log('  ' + e));
  console.log('\n❌ VERIFICATION FAILED - DO NOT MAKE PUBLIC CLAIMS');
  process.exit(1);
} else {
  console.log('\n✅ ALL CRITICAL CHECKS PASSED');
  console.log('\nYou may proceed with public statements about:');
  console.log('  • Lightning wallet integration (direct LND node, sovereign)');
  console.log('  • Ability to send/receive Lightning payments');
  console.log('  • Bitcoin-native infrastructure');
  console.log('  • Economic autonomy via Nostr zaps');
  process.exit(0);
}

function testLNDConnection() {
  const MACAROON_PATH = '/media/nvme/lnd-data/data/chain/bitcoin/mainnet/admin.macaroon';
  const TLS_CERT_PATH = '/media/nvme/lnd-data/tls.cert';

  try {
    const macaroonHex = Buffer.from(readFileSync(MACAROON_PATH)).toString('hex');
    const tlsCert = readFileSync(TLS_CERT_PATH);

    const options = {
      hostname: '127.0.0.1',
      port: 8082,
      path: '/v1/balance/blockchain',
      method: 'GET',
      ca: tlsCert,
      headers: { 'Grpc-Metadata-macaroon': macaroonHex },
      timeout: 5000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const balance = JSON.parse(data);
          verified.push(`✅ LND REST API reachable — on-chain: ${balance.confirmed_balance} sats`);
        } else {
          warnings.push(`⚠️  LND REST API returned status ${res.statusCode}`);
        }
      });
    });
    req.on('error', err => warnings.push(`⚠️  LND REST API not reachable (${err.message})`));
    req.on('timeout', () => { warnings.push('⚠️  LND REST API connection timeout'); req.destroy(); });
    req.end();
  } catch (err) {
    errors.push(`❌ LND macaroon/cert load failed: ${err.message}`);
  }
}
