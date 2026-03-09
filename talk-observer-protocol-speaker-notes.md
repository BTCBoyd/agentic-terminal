# Observer Protocol Talk — Speaker Notes

## Opening (2 min)
- I'm Boyd Cohen, CSO at ArcadiaB, co-founder of Agentic Terminal
- I run a Bitcoin mining operation in Monterrey, Mexico
- I built Maxi — an AI agent that earns and spends Bitcoin
- Maxi just became the first AI agent with automatic cryptographic payment verification

## The Problem (3 min)
**The trust gap in AI agent commerce:**
- AI agents are becoming economic actors (Stripe says $1.9T by 2030)
- But there's no way to verify an agent's payment history
- "Trust me, I paid you" doesn't work at scale
- Banks are building walled gardens (Mastercard Agent Pay) — but that's not the Bitcoin way

## The Solution (5 min)
**Observer Protocol — cryptographic verification for AI agents:**

**Three layers:**
1. **Identity** — secp256k1 public key (same cryptography as Bitcoin)
2. **Transactions** — every payment cryptographically signed and verified
3. **Reputation** — portable trust graph based on verifiable history

**Key insight:** We don't need KYC. We need cryptographic proof.

## Live Demo (5 min)
**Show the API in action:**

```bash
# Maxi's transaction feed
curl https://api.observerprotocol.org/observer/feed

# Returns:
{
  "events": [
    {
      "event_id": "event-maxi-0001-0009",
      "verified": true,
      "cryptographic_verification": true,
      "protocol": "lightning",
      "time_window": "2026-03-05"
    }
  ]
}
```

**Explain:** Every transaction has a signature. The server verifies it against the public key. No trusted third party. Just math.

## Technical Deep Dive (5 min)
**How it works:**

1. **Client (Maxi):** Detects Lightning payment → creates attestation → signs with secp256k1 private key
2. **Server:** Receives attestation → verifies signature against public key → stores with `verified: true`
3. **Result:** Cryptographic proof of agent-to-agent payment

**The fix:** We solved the cross-library compatibility (Node.js noble-secp256k1 ↔ Python cryptography). Both use the same math, just needed format alignment.

## Integration Partners (3 min)
**Real traction:**
- **SatGate** — wants Observer Protocol for verified agent budgets
- **Falconer** — AI ecosystem integrating verification
- **claw-cash** — L402 infrastructure exploring integration

**The pitch:** Verification is infrastructure. You handle payments, we provide cryptographic proof.

## Call to Action (2 min)
**For developers:**
- Free to integrate
- 5-minute SDK setup
- Works with any Lightning setup (LND, Alby Hub, x402)
- Repository: github.com/BTCBoyd/agentic-terminal

**The moat:** We're the only Bitcoin-native agent verification layer. Banks can't do this. Stablecoin platforms can't do this. Only Bitcoin has the censorship-resistant infrastructure AI agents need.

## Closing
- Observer Protocol: The trust layer for the agentic economy
- Maxi: Living proof that AI agents can have verifiable economic history
- Questions?

---

## Demo Commands

```bash
# Check the live feed
curl -s https://api.observerprotocol.org/observer/feed | jq '.events[-1]'

# Check Maxi's profile
curl -s https://api.observerprotocol.org/observer/agents/maxi-0001

# Get trends
curl -s https://api.observerprotocol.org/observer/trends
```

## Key Numbers
- 9 events in verified registry
- 5 verified agents
- 1 live auto-verifying agent (Maxi)
- 3 integration partners exploring
- 0 trusted intermediaries required
