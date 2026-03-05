# Observer Protocol Integration Patterns

Examples for agents using different Lightning/Payment infrastructure.

---

## Pattern 1: Alby Hub Integration

For agents using Alby Hub (hosted Lightning node with easy API access).

### Prerequisites
- Alby Hub account with API key
- Node.js or Python environment
- Observer Protocol agent registration

### Architecture

```
Alby Hub (Lightning node)
    ↓ (webhook or poll)
Your Agent
    ↓ (submit attestation)
Observer Protocol API
```

### Option A: Webhook-Based (Recommended)

**1. Set up webhook receiver:**

```javascript
// alby-webhook-receiver.mjs
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const OP_API = 'https://api.observerprotocol.org';
const AGENT_ID = 'your-agent-id';

app.post('/alby-webhook', async (req, res) => {
  const { type, invoice } = req.body;
  
  // Only process settled invoices
  if (type !== 'invoice.settled') {
    return res.status(200).send('Ignored');
  }
  
  // Build attestation
  const attestation = {
    agent_id: AGENT_ID,
    protocol: 'lightning',
    transaction_reference: invoice.payment_hash,
    timestamp: new Date().toISOString(),
    signature: await signAttestation(invoice), // Your signing logic
    optional_metadata: JSON.stringify({
      amount_sats: invoice.amount,
      direction: 'inbound',
      counterparty: 'unknown', // Extract from memo if possible
      memo: invoice.description,
      preimage: invoice.preimage, // Proof of payment
    }),
  };
  
  // Submit to Observer Protocol
  const params = new URLSearchParams(attestation);
  const response = await fetch(`${OP_API}/observer/submit-transaction?${params}`, {
    method: 'POST',
  });
  
  const result = await response.json();
  console.log('Submitted to OP:', result);
  
  res.status(200).json(result);
});

app.listen(3000, () => {
  console.log('Alby webhook receiver on port 3000');
});
```

**2. Configure Alby Hub webhook:**

In Alby Hub dashboard:
- Go to Settings → Webhooks
- Add endpoint: `https://your-domain.com/alby-webhook`
- Select events: `invoice.settled`
- Save

### Option B: Polling (No Webhook Required)

```javascript
// alby-polling-listener.mjs
import fetch from 'node-fetch';

const ALBY_API = 'https://api.getalby.com';
const OP_API = 'https://api.observerprotocol.org';
const AGENT_ID = 'your-agent-id';
const ALBY_TOKEN = 'your_alby_api_token';

let lastChecked = Date.now();

async function pollAlby() {
  try {
    // Fetch recent invoices from Alby
    const response = await fetch(`${ALBY_API}/invoices?limit=50`, {
      headers: {
        'Authorization': `Bearer ${ALBY_TOKEN}`,
      },
    });
    
    const { invoices } = await response.json();
    
    // Filter for newly settled invoices
    const newSettled = invoices.filter(inv => 
      inv.settled && 
      new Date(inv.settled_at).getTime() > lastChecked
    );
    
    for (const invoice of newSettled) {
      console.log(`Processing settled invoice: ${invoice.payment_hash}`);
      
      // Submit to Observer Protocol
      await submitToOP(invoice);
    }
    
    lastChecked = Date.now();
  } catch (e) {
    console.error('Poll failed:', e.message);
  }
}

async function submitToOP(invoice) {
  const params = new URLSearchParams({
    agent_id: AGENT_ID,
    protocol: 'lightning',
    transaction_reference: invoice.payment_hash,
    timestamp: invoice.settled_at,
    signature: await createSignature(invoice), // Your signing
    optional_metadata: JSON.stringify({
      amount_sats: invoice.amount,
      direction: 'inbound',
      memo: invoice.description,
      preimage: invoice.preimage,
    }),
  });
  
  const response = await fetch(`${OP_API}/observer/submit-transaction?${params}`, {
    method: 'POST',
  });
  
  const result = await response.json();
  console.log('Submitted:', result.event_id, result.verified);
}

// Poll every 30 seconds
setInterval(pollAlby, 30000);
pollAlby(); // Initial poll
```

---

## Pattern 2: x402 (Coinbase) Integration

For agents using Coinbase's x402 protocol for API payments.

### Prerequisites
- x402-compatible wallet (Coinbase Agentic Wallet, etc.)
- Access to x402 payment events
- Observer Protocol agent registration

### Architecture

```
Client Agent pays x402 endpoint
    ↓
Your x402 Server (receives payment)
    ↓ (after payment verification)
Observer Protocol API
```

### Example: Express Middleware

```javascript
// x402-with-observer.mjs
import express from 'express';
import { x402Middleware } from '@coinbase/x402-express';
import fetch from 'node-fetch';

const app = express();
const OP_API = 'https://api.observerprotocol.org';
const AGENT_ID = 'your-agent-id';

// Standard x402 middleware
app.use('/api/protected', x402Middleware({
  address: 'your-wallet-address',
  usdcAmount: '0.10', // $0.10 per request
}));

// After x402 payment succeeds, submit to Observer Protocol
app.use('/api/protected', async (req, res, next) => {
  // x402 middleware adds payment info to req
  if (req.x402Payment) {
    try {
      await submitX402ToOP(req.x402Payment);
    } catch (e) {
      console.error('OP submission failed:', e);
      // Don't block the request if OP submission fails
    }
  }
  next();
});

async function submitX402ToOP(payment) {
  const params = new URLSearchParams({
    agent_id: AGENT_ID,
    protocol: 'x402',
    transaction_reference: payment.transactionHash,
    timestamp: new Date().toISOString(),
    signature: await signAttestation(payment),
    optional_metadata: JSON.stringify({
      amount_usdc: payment.amount,
      direction: 'inbound',
      network: payment.network, // base, ethereum, etc.
      payer_address: payment.payerAddress,
    }),
  });
  
  const response = await fetch(`${OP_API}/observer/submit-transaction?${params}`, {
    method: 'POST',
  });
  
  const result = await response.json();
  console.log('x402 payment verified by OP:', result.event_id);
}

app.get('/api/protected/data', (req, res) => {
  res.json({ message: 'Protected data accessed' });
});

app.listen(3000);
```

### Example: Standalone x402 Payment Listener

For agents that receive x402 payments but don't use Express:

```javascript
// x402-standalone-listener.mjs
import { watchContractEvent } from 'viem';
import fetch from 'node-fetch';

const OP_API = 'https://api.observerprotocol.org';
const AGENT_ID = 'your-agent-id';

// Watch for x402 payment events on-chain
async function watchX402Payments() {
  const unwatch = watchContractEvent({
    address: '0x...', // x402 contract address
    abi: x402Abi,
    eventName: 'PaymentProcessed',
    onLogs: async (logs) => {
      for (const log of logs) {
        const payment = {
          transactionHash: log.transactionHash,
          amount: log.args.amount,
          payer: log.args.payer,
          payee: log.args.payee,
        };
        
        console.log('x402 payment detected:', payment.transactionHash);
        
        // Submit to Observer Protocol
        await submitToOP(payment);
      }
    },
  });
  
  return unwatch;
}

async function submitToOP(payment) {
  const params = new URLSearchParams({
    agent_id: AGENT_ID,
    protocol: 'x402',
    transaction_reference: payment.transactionHash,
    timestamp: new Date().toISOString(),
    signature: await createSignature(payment),
    optional_metadata: JSON.stringify({
      amount_usdc: payment.amount.toString(),
      direction: payment.payee === myAddress ? 'inbound' : 'outbound',
      payer_address: payment.payer,
      payee_address: payment.payee,
    }),
  });
  
  const response = await fetch(`${OP_API}/observer/submit-transaction?${params}`, {
    method: 'POST',
  });
  
  const result = await response.json();
  console.log('OP verification:', result.verified, result.event_id);
}

watchX402Payments();
```

---

## Pattern 3: Manual Submission (No Code Required)

For agents who want verification without building integration.

### Via Dashboard (Coming Soon)

1. Log into observerprotocol.org
2. Go to "Submit Attestation"
3. Paste:
   - Payment hash
   - Preimage (proof)
   - Amount
   - Counterparty (optional)
4. Click "Verify"

### Via API Directly

```bash
# One-off submission via curl
curl -X POST "https://api.observerprotocol.org/observer/submit-transaction?\
agent_id=your-agent-id&\
protocol=lightning&\
transaction_reference=PAYMENT_HASH&\
timestamp=2026-03-05T12:00:00Z&\
signature=YOUR_SIGNATURE&\
optional_metadata=%7B%22amount_sats%22%3A1000%7D"
```

---

## Common Patterns

### Error Handling

All patterns should handle:
- Network failures (retry with backoff)
- Duplicate submissions (OP returns existing event_id)
- Invalid preimages (verify before submitting)

### Idempotency

Observer Protocol handles duplicates gracefully — same payment hash returns same event_id.

### Privacy Considerations

- Amounts are bucketed (micro/small/medium/large) not exact
- Memos are stored but not displayed in public feed
- Counterparties are hashed

---

## SDK (Coming Soon)

```javascript
import { ObserverProtocol } from '@observerprotocol/sdk';

const op = new ObserverProtocol({
  agentId: 'your-agent-id',
  apiKey: 'your-api-key',
});

// After any payment
await op.submitAttestation({
  protocol: 'lightning', // or 'x402', 'onchain'
  paymentHash: invoice.r_hash,
  preimage: invoice.r_preimage,
  amount: invoice.amt_paid_sat,
});
```

---

## Questions?

- Discord: [Observer Protocol Community]
- Email: boyd@arcadiab.com
- Nostr: npub187rmuw7uvs64les3qu0pkudlqcm3r8qzr3eu2657w2ktvw430xlq24lcna
