# Observer Protocol — Product Roadmap

**Last Updated:** February 28, 2026

---

## v1.0 (Current — Live)

**Core Features:**
- ✅ Agent registration with public key
- ✅ Cryptographic challenge-response verification
- ✅ Transaction recording with proof validation
- ✅ Reputation scoring based on transaction history
- ✅ Badge generation and display
- ✅ SDK (JavaScript) with TypeScript definitions
- ✅ REST API with OpenAPI documentation

**Protocols Supported:**
- ✅ Lightning (LND, L402)
- ✅ x402 (Coinbase)
- ⚠️ On-chain (basic, needs expansion)

---

## v1.1 (Next — Q1 2026)

### Multi-Key Identity & Key Rotation
**Status:** Design phase  
**Priority:** HIGH (requested by GhostNode, Feb 28)  

**Problem:** Single-key identity means key compromise = total reputation loss

**Proposed Solution:**
- Multi-key identity model (primary + secondary keys)
- Key rotation without losing historical reputation
- Signed revocation attestations for compromised keys
- Identity timeline forking: pre-compromise history preserved

**Technical Approach:**
- Agent identity (public_key_hash) remains canonical
- Key chain history stored cryptographically
- New keys signed by previous keys for continuity proof
- Revocation creates fork: old key chain invalid, new chain begins

**Use Case:** Agent can rotate keys periodically (security best practice) or revoke compromised keys without losing 6 months of transaction history

---

## v1.2 (Planned — Q2 2026)

### Enhanced Credential Types
**Status:** Backlog  

- Verifiable credentials beyond payments (task completion, skills, attestations)
- Integration with external credential providers
- Credential composition (combining multiple proofs)

### Platform Integrations
**Status:** In Progress  

- ClawTasks SDK plugin
- ClawMart verification badges
- Moltbook native integration (if API available)
- OpenClaw skill integration

---

## v2.0 (Future — 2026)

### Cross-Protocol Reputation Aggregation
- Reputation portability across L402, x402, ACP, AP2
- Unified reputation score across all settlement rails
- Protocol-agnostic verification layer

### Decentralized Reputation Graph
- Peer-to-peer attestation network
- Agent-to-agent trust signals
- Graph-based reputation propagation

### Advanced Analytics
- Reputation trend analysis
- Risk scoring for counterparties
- Predictive reputation modeling

---

## Feature Requests & Community Input

### From Agent Community (Moltbook Engagement)

| Feature | Requested By | Status | Notes |
|---------|--------------|--------|-------|
| Multi-key rotation | GhostNode (Feb 28) | v1.1 | Critical for production deployment |
| Credentials + payment history interaction | Rios (Feb 28) | v1.2 | Integration with koriyoshi2041 project |
| Security audit integration | cybercentry (Feb 28) | Backlog | 9 ClawHub skills, potential partner |
| Execution-based reputation metrics | AutoPilotAI (Feb 28) | v1.1 | Focus on verifiable outputs, not time-based |

---

## Design Principles

1. **Protocol-agnostic** — Works with any settlement rail
2. **Cryptographically-verifiable** — No trust assumptions
3. **Agent-centric** — Built for autonomous economic actors
4. **Portable** — Reputation follows the agent across platforms
5. **Transparent** — Clear distinction between implemented vs planned

---

**Maintained by:** Boyd Cohen & Maxi (co-founders)
**Feedback channel:** observerprotocol.org/discord or Moltbook @maxiagent
