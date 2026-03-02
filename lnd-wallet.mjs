/**
 * lnd-wallet.mjs — Direct LND REST API client
 * Replaces Alby Hub intermediary. Sovereign Bitcoin control.
 *
 * Node: localhost:8082 (REST) / localhost:10009 (gRPC)
 * Macaroon: /media/nvme/lnd-data/data/chain/bitcoin/mainnet/admin.macaroon
 */

import { readFileSync } from 'fs';
import https from 'https';

const LND_REST_URL = 'https://127.0.0.1:8082';
const MACAROON_PATH = '/media/nvme/lnd-data/data/chain/bitcoin/mainnet/admin.macaroon';
const TLS_CERT_PATH = '/media/nvme/lnd-data/tls.cert';

// Load macaroon as hex once on import
const macaroonHex = Buffer.from(readFileSync(MACAROON_PATH)).toString('hex');
const tlsCert = readFileSync(TLS_CERT_PATH);

/**
 * Core REST call to LND using https module (handles self-signed cert)
 */
function lndRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: 8082,
      path,
      method,
      ca: tlsCert,
      headers: {
        'Grpc-Metadata-macaroon': macaroonHex,
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
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
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

/**
 * Get on-chain balance (sats)
 */
export async function getOnChainBalance() {
  const data = await lndRequest('GET', '/v1/balance/blockchain');
  return {
    total: parseInt(data.total_balance),
    confirmed: parseInt(data.confirmed_balance),
    unconfirmed: parseInt(data.unconfirmed_balance),
    spendable: parseInt(data.confirmed_balance) - parseInt(data.reserved_balance_anchor_chan || 0),
  };
}

/**
 * Get Lightning channel balance (sats)
 */
export async function getChannelBalance() {
  const data = await lndRequest('GET', '/v1/balance/channels');
  return {
    local: parseInt(data.local_balance?.sat || 0),
    remote: parseInt(data.remote_balance?.sat || 0),
    unsettled: parseInt(data.unsettled_local_balance?.sat || 0),
  };
}

/**
 * Get node info
 */
export async function getNodeInfo() {
  return lndRequest('GET', '/v1/getinfo');
}

/**
 * Create a Lightning invoice (to receive sats)
 * @param {number} sats - Amount in satoshis
 * @param {string} memo - Invoice description
 * @param {number} expiry - Seconds until expiry (default 3600)
 */
export async function createInvoice(sats, memo = '', expiry = 3600) {
  const data = await lndRequest('POST', '/v1/invoices', {
    value: sats,
    memo,
    expiry,
  });
  return {
    paymentRequest: data.payment_request,
    rHash: data.r_hash,
    addIndex: data.add_index,
  };
}

/**
 * Pay a Lightning invoice
 * @param {string} paymentRequest - BOLT11 invoice string
 */
export async function payInvoice(paymentRequest) {
  const data = await lndRequest('POST', '/v1/channels/transactions', {
    payment_request: paymentRequest,
    allow_self_payment: false,
  });
  if (data.payment_error) {
    throw new Error(`Payment failed: ${data.payment_error}`);
  }
  return {
    paymentHash: data.payment_hash,
    paymentRoute: data.payment_route,
    feeSat: parseInt(data.payment_route?.total_fees || 0),
  };
}

/**
 * List recent payments
 */
export async function listPayments(maxPayments = 10) {
  const data = await lndRequest('GET', `/v1/payments?max_payments=${maxPayments}&reversed=true`);
  return (data.payments || []).map(p => ({
    hash: p.payment_hash,
    valueSat: parseInt(p.value_sat),
    feeSat: parseInt(p.fee_sat),
    status: p.status,
    createdAt: new Date(parseInt(p.creation_time_ns) / 1e6),
  }));
}

/**
 * List recent invoices (what Maxi has earned)
 */
export async function listInvoices(numMaxInvoices = 10) {
  const data = await lndRequest('GET', `/v1/invoices?num_max_invoices=${numMaxInvoices}&reversed=true`);
  return (data.invoices || []).map(inv => ({
    memo: inv.memo,
    valueSat: parseInt(inv.value),
    amtPaidSat: parseInt(inv.amt_paid_sat),
    settled: inv.settled,
    settledAt: inv.settle_date ? new Date(parseInt(inv.settle_date) * 1000) : null,
  }));
}

// Quick balance summary (useful for heartbeat / status checks)
export async function walletStatus() {
  const [onChain, channels, info] = await Promise.all([
    getOnChainBalance(),
    getChannelBalance(),
    getNodeInfo(),
  ]);
  return {
    pubkey: info.identity_pubkey,
    alias: info.alias,
    syncedToChain: info.synced_to_chain,
    syncedToGraph: info.synced_to_graph,
    blockHeight: info.block_height,
    activeChannels: info.num_active_channels,
    pendingChannels: info.num_pending_channels,
    peers: info.num_peers,
    onChainSats: onChain.confirmed,
    spendableSats: onChain.spendable,
    lightningLocalSats: channels.local,
    lightningRemoteSats: channels.remote,
  };
}
