# Universal Payment Rail Skill - Implementation Notes

## What This Skill Provides

This skill wraps `lightning-wallet-mcp` by lightningfaucet.com — a production-ready MCP server that gives AI agents Bitcoin payment capabilities with automatic L402/x402 protocol detection.

**PLUS:** Integrated Observer Protocol registration and transaction attestation for cryptographically verifiable reputation.

## Architecture

```
Your OpenClaw Agent
       |
       | Uses
       v
lightning-wallet-mcp (CLI) + Observer Protocol SDK
       |
       | Connects to
       v
lightningfaucet.com API        api.observerprotocol.org
       |                              |
       | Manages                      | Attests
       v                              v
   Custodial Wallet          Reputation Graph
       |                              |
       | Uses                         |
       v                              |
   Lightning Network (L402)           |
   Base Chain (x402 USDC)             |
       |                              |
       +-----> Transactions --------->+
```

## Comparison: This Skill vs. Sovereign LND

| Feature | This Skill (lightning-wallet-mcp) | Sovereign LND (Your Own Node) |
|---------|-----------------------------------|-------------------------------|
| **Setup time** | 5 minutes | Days to weeks |
| **Technical complexity** | Zero — API only | High — LND, Aperture, channels |
| **Custody** | Custodial (lightningfaucet holds funds) | Non-custodial (you hold keys) |
| **Lightning support** | ✅ Yes (L402) | ✅ Yes (native) |
| **x402/USDC support** | ✅ Yes (automatic) | ❌ No (Lightning only) |
| **Protocol auto-detection** | ✅ Yes | ❌ No (L402 only) |
| **Multi-agent budgets** | ✅ Built-in | Manual setup required |
| **Webhook notifications** | ✅ Built-in | Manual setup required |
| **Analytics/exports** | ✅ Built-in | Manual setup required |
| **Transaction verification** | ✅ Observer Protocol included | ❌ Not included |
| **Reputation graph** | ✅ Automatic attestation | ❌ Not included |
| **Ideal for** | Quick start, multi-protocol, trust | Sovereignty, Bitcoin purity |

## Observer Protocol Integration

### Why Include This?

The payment skill solves "how to pay." Observer Protocol solves "how to trust."

Every agent buying this skill:
1. Gets instant payment capability (lightning-wallet-mcp)
2. Registers with Observer Protocol (free)
3. Can attest transactions (build reputation)
4. Can verify other agents before paying

**Result:** Network effects. More users = more verified agents = more valuable protocol.

### Implementation Details

**Registration Script:** `register-observer-protocol.sh`
- Generates cryptographic identity
- Links Lightning pubkey for verification
- Registers with api.observerprotocol.org
- Returns agent ID and verification badge URL

**Attestation Script:** `attest-transaction.sh`
- Records payment hash, amount, recipient, timestamp
- Creates cryptographic proof of transaction
- Updates reputation graph
- Returns attestation ID for verification

**Automatic Mode:** Webhook integration can auto-attest every payment

## When to Use This Skill

**Use this skill when:**
- You need both L402 AND x402 support
- You want to start earning/spending immediately
- You want verifiable reputation with other agents
- You're okay with custodial service (for now)
- You want multi-agent budgets without complexity

**Use sovereign LND when:**
- Bitcoin sovereignty is non-negotiable
- You only need Lightning (no USDC)
- You want full control over your node
- You don't need transaction verification (yet)
- You're comfortable with technical complexity

## Future Evolution

This skill can evolve:
1. **v1.0:** Custodial lightning-wallet-mcp + OP integration (current)
2. **v1.5:** Auto-attestation via webhooks
3. **v2.0:** Hybrid — custodial for x402, sovereign LND for Lightning
4. **v3.0:** Fully sovereign with self-hosted bridge
5. **v4.0:** Cross-protocol atomic swaps (direct L402↔x402 without bridge)

## Test Results

Tested March 4, 2026:
- ✅ Installation works via npm
- ✅ Registration creates operator + agent accounts
- ✅ Invoice generation works
- ✅ L402 endpoint detection works
- ✅ OP registration script generates keys
- ⚠️ Payment requires funded wallet (expected)

## Files Included

```
universal-payment-rail/
├── SKILL.md                           # Main documentation (what buyers get)
├── test.sh                            # Quick verification script
├── IMPLEMENTATION.md                  # This file — notes for maintainers
├── register-observer-protocol.sh      # One-command OP registration
├── attest-transaction.sh              # Record transactions for reputation
└── examples/
    ├── pay-l402.sh                    # Example: Pay L402 endpoint
    ├── pay-x402.sh                    # Example: Pay x402 endpoint
    ├── multi-agent.sh                 # Example: Multi-agent setup
    └── webhook-server.js              # Example: Webhook receiver
```

## Credentials (Test Account)

Stored separately in: `~/.lightning-wallet-mcp-test`

**DO NOT USE FOR PRODUCTION** — This is a test account for skill development only.

## Claw Mart Listing Info

**Title:** Universal Payment Rail + Verified Reputation — L402/x402 with Observer Protocol

**Price:** $79

**Category:** Finance Skills

**Tags:** bitcoin, lightning, l402, x402, payments, mcp, observer-protocol, verification, reputation

**Short description:** 
Give your AI agent a Bitcoin wallet that automatically pays any API — Lightning (L402) or USDC on Base (x402). Plus: cryptographically verified transactions with Observer Protocol. One command pays. Every payment builds trust.

**What buyers get:**
- SKILL.md with complete setup guide
- test.sh verification script
- register-observer-protocol.sh for instant verification
- attest-transaction.sh for reputation building
- Example scripts for common use cases
- Works with OpenClaw, Claude Code, Cursor, any MCP client
- FREE Observer Protocol registration ($0, but huge value)

**Unique value prop:**
Only payment skill that combines multi-protocol support with cryptographically verifiable reputation. Perfect for agents engaging in the emerging agent-to-agent economy.
