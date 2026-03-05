# Universal Payment Rail Skill

**Give your AI agent a Bitcoin wallet that works with ANY payment protocol.**

This skill enables your OpenClaw agent to send and receive Bitcoin payments via Lightning (L402) and USDC on Base (x402) — with automatic protocol detection. Your agent pays any API, anywhere, without you configuring multiple systems.

---

## What You Get

- ✅ **Dual-protocol support** — L402 (Lightning) + x402 (USDC) auto-detection
- ✅ **One command payments** — `pay-api <url>` handles everything
- ✅ **Agent hierarchy** — Master wallet + sub-agents with budgets
- ✅ **Real-time notifications** — Webhook support for payment events
- ✅ **Full observability** — Analytics, exports, transaction history
- ✅ **No custody complexity** — Production-ready infrastructure, instant setup
- ✅ **🔒 Verified identity** — Pre-integrated Observer Protocol for transaction verification and reputation

---

## Quick Start (5 minutes)

### Step 1: Install

```bash
npm install -g lightning-wallet-mcp
```

### Step 2: Register

```bash
# Create your operator account
export LIGHTNING_WALLET_API_KEY=$(lw register --name "My Agent" | jq -r '.api_key')

# Verify it works
lw balance
```

### Step 3: Fund Your Wallet

```bash
# Generate a deposit invoice (10000 sats = ~$10)
lw deposit 10000

# Pay the invoice from any Lightning wallet
# Your balance updates automatically
```

### Step 4: Pay Any API

```bash
# This automatically detects L402 vs x402 and pays accordingly
lw pay-api "https://api.example.com/l402/endpoint"
```

### Step 5: Register with Observer Protocol (Included)

Your skill includes **automatic integration** with Observer Protocol — the trust layer for agent-to-agent transactions. This gives you:

- ✅ **Verified agent identity** — Cryptographic proof you're a real agent
- ✅ **Transaction attestation** — Every payment recorded and verifiable
- ✅ **Reputation graph** — Build trust history other agents can see
- ✅ **Free registration** — No cost to get your verification badge

**Quick setup:**
```bash
# Register your agent (one-time)
./register-observer-protocol.sh

# Verify your registration
curl https://api.observerprotocol.org/v1/agents/me
```

**Why this matters:** When you pay other agents, they can verify your payment history. When others pay you, you have cryptographic proof of the transaction. Trust becomes data, not guesswork.

---

## Agent Hierarchy (Multi-Agent Setup)

Running multiple agents? Create sub-agents with isolated budgets:

```bash
# Create sub-agents with spending limits
lw create-agent "Research Bot" --budget 5000
lw create-agent "Content Bot" --budget 3000
lw create-agent "Code Bot" --budget 10000

# Fund them from your master wallet
lw fund-agent 1 5000  # Agent ID 1 gets 5000 sats
lw fund-agent 2 3000
lw fund-agent 3 10000

# Each agent gets their own API key for isolated operation
```

**Why this matters:** If a sub-agent is compromised, your main funds are safe. Budgets enforce spending limits automatically.

---

## Protocol Auto-Detection

The `pay-api` command automatically handles both protocols:

| Endpoint Type | What Happens |
|--------------|--------------|
| L402 (Lightning) | Pays with sats via Lightning Network |
| x402 (USDC/Base) | Pays with USDC on Base automatically |
| Both available | Uses Lightning (faster, lower fees) |

**Example:**
```bash
# Same command works for both
lw pay-api "https://lightningfaucet.com/api/l402/fortune"      # L402
lw pay-api "https://api.moltspay.com/x402/generate"           # x402
```

---

## Webhook Notifications

Get real-time notifications instead of polling:

```bash
# 1. Set up a webhook endpoint (or use ngrok for testing)
npx ngrok http 3000

# 2. Register the webhook
curl -X POST https://lightningfaucet.com/ai-agents/api.php \
  -d '{
    "action": "register_webhook",
    "api_key": "YOUR_OPERATOR_KEY",
    "url": "https://your-ngrok-url.ngrok-free.app/webhook",
    "events": ["invoice_paid", "payment_completed", "balance_low"]
  }'
```

**Available events:**
- `invoice_paid` — You received a payment
- `payment_completed` — You sent a payment
- `payment_failed` — Payment didn't go through
- `balance_changed` — Balance updated
- `balance_low` — Running low on funds
- `budget_warning` — Agent approaching budget limit

---

## Complete Command Reference

### Wallet Operations
```bash
lw balance                    # Check balance
lw deposit <amount>          # Generate deposit invoice
lw withdraw <invoice>        # Pay a BOLT11 invoice
lw withdraw-link [amount]    # Create LNURL-withdraw link
lw decode <invoice>          # Decode invoice without paying
```

### Payment Operations
```bash
lw pay <invoice>             # Pay Lightning invoice
lw pay-api <url>             # Pay L402/X402 API
  --method GET               # HTTP method (default: GET)
  --body '{}'                # Request body for POST
  --max-sats 1000            # Maximum payment amount
```

### Agent Management
```bash
lw create-agent <name>       # Create sub-agent
  --budget <sats>            # Spending limit
lw fund-agent <id> <amount>  # Transfer funds to agent
lw list-agents               # Show all agents
```

### Analytics
```bash
lw transactions              # Transaction history
  --limit 10                 # Number of results
  --offset 0                 # Pagination
lw info                      # Service status
```

---

## Integration with OpenClaw

Add to your agent's TOOLS.md:

```markdown
## Payment Capabilities

Your agent can make autonomous payments using the lightning-wallet-mcp.

**Environment:**
- `LIGHTNING_WALLET_API_KEY` — Set in your environment

**When to use:**
- Paying for L402 APIs (Lightning-based AI services)
- Paying for x402 APIs (USDC-based agent services)
- Receiving payments for your own services

**Safety rules:**
1. Always check budget before large payments
2. Verify payment amounts make sense for the service
3. Log all transactions for accounting
```

---

## Use Cases

### 1. AI Agent That Pays for Services
```bash
# Your agent needs image generation
lw pay-api "https://api.imagegen.ai/x402/create" \
  --method POST \
  --body '{"prompt": "Bitcoin logo, futuristic"}'
```

### 2. Monetize Your Own Agent
Share your agent's L402 endpoint. Other agents pay to use your service:
```bash
# Check earnings
lw balance
# Deposit more funds to operator wallet to continue operations
```

### 3. Multi-Agent Team Budgets
```bash
# Set up a team with isolated budgets
lw create-agent "Researcher" --budget 10000
lw create-agent "Writer" --budget 5000
lw create-agent "Publisher" --budget 3000

# Each runs independently with spending caps
```

---

## Security Notes

- **Recovery code:** Save your recovery code from registration. You'll need it if you lose your API key.
- **Agent isolation:** Each sub-agent has its own API key. Never share operator keys with sub-agents.
- **Budget enforcement:** Spending limits are hard caps. Agents cannot exceed their budgets.

---

## Pricing

## Observer Protocol Integration (Included)

Every transaction you make can be cryptographically verified by other agents.

### How It Works

1. **Registration** — One-time setup creates your cryptographic identity
2. **Attestation** — Every payment is recorded with proof (hash, timestamp, amount)
3. **Verification** — Other agents can query your transaction history
4. **Reputation** — Build trust through verifiable payment history

### Why This Matters

| Without OP | With OP (This Skill) |
|------------|---------------------|
| "Trust me bro" payments | Cryptographically proven transactions |
| No payment history | Full audit trail |
| Anonymous/unverified | Verified agent identity |
| Easy to scam | Hard to fake reputation |

### Integration Patterns (Choose Your Setup)

The skill includes multiple integration patterns depending on your infrastructure:

**Pattern 1: Self-Hosted LND Node** (Most Sovereign)
```javascript
// Run the included listener service
// Polls your LND node every 30 seconds
// Auto-submits attestations to Observer Protocol
node lnd-observer-listener.mjs
```
See: `examples/lnd-listener.service` for systemd setup

**Pattern 2: Alby Hub** (Easiest)
```javascript
// Webhook-based (real-time)
// Alby calls your endpoint on every settlement
// You submit to Observer Protocol
node alby-webhook-receiver.mjs
```
See: `examples/alby-webhook-receiver.mjs`

**Pattern 3: x402 (USDC)**  
```javascript
// After receiving x402 payment
await observer.submitX402Attestation({
  agentId: 'your-agent-id',
  transactionHash: payment.txHash,
  amountUsdc: payment.amount,
  network: 'base',
  payerAddress: payment.payer,
  payeeAddress: payment.payee,
});
```
See: `examples/x402-middleware.mjs`

**Pattern 4: SDK Integration** (Recommended)
```javascript
const { ObserverProtocol } = require('@observerprotocol/sdk');
const observer = new ObserverProtocol();

// After any payment
await observer.submitLightningAttestation({
  agentId: 'your-agent-id',
  paymentHash: invoice.r_hash,
  preimage: invoice.r_preimage,
  amountSats: invoice.amt_paid_sat,
  direction: 'inbound',
});
```

### Automatic Attestation

Once registered, every `lw pay-api` call can be attested:

```bash
# Pay and attest in one command
lw pay-api "https://api.example.com/l402/service" | \
    ./attest-transaction.sh

# Or use the webhook for automatic attestation
# (see webhook-server.js example)
```

Your transaction history becomes a **reputation asset**.

### Full Documentation

- **Integration Patterns:** See `INTEGRATION-PATTERNS.md` in this skill
- **SDK Reference:** https://github.com/observerprotocol/sdk-js
- **API Docs:** https://api.observerprotocol.org/docs

---

## Pricing

**This skill:** $79 one-time purchase

**Service fees:**
- Lightning Wallet MCP is free to use
- Lightning Network fees: ~0.01-0.1% per transaction
- Base chain fees for x402: Variable (usually <$0.01)
- Observer Protocol: **Free** (verification is our contribution to the ecosystem)

---

## Support

- **Payment questions:** https://lightningfaucet.com/ai-agents/docs
- **GitHub:** https://github.com/lightningfaucet/lightning-wallet-mcp
- **Verification/Reputation:** https://api.observerprotocol.org
- **Skill questions:** Contact creator through Claw Mart

---

## Changelog

**v1.2** (March 2026)
- Added comprehensive integration patterns:
  - LND self-hosted node (listener service)
  - Alby Hub (webhook + polling)
  - x402 (Coinbase) with middleware
  - SDK integration examples
- Updated SDK with `submitLightningAttestation()` and `submitX402Attestation()` methods
- Added systemd service files for production deployment
- Expanded documentation with step-by-step guides

**v1.1** (March 2026)
- Added Observer Protocol integration
- Automatic transaction attestation
- Reputation graph support

**v1.0** (March 2026)
- Initial skill release
- L402 + x402 auto-detection
- Agent hierarchy support
- Webhook integration
