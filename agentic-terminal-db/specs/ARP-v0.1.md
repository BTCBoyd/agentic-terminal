# Agentic Reporting Protocol (ARP) v0.1

**Status:** Draft  
**Author:** Boyd Cohen & Maxi  
**Date:** 2026-02-20  
**Repository:** agenticterminal.ai/specs

## Why ARP Exists

Lightning and other agentic payment systems are largely off-chain. This means the most economically meaningful data cannot be passively observed. ARP defines a standardized way for autonomous agents to voluntarily report economic activity with cryptographic proof, enabling Agentic Terminal to become the canonical dataset for the machine economy.

## Design Principles

1. Cryptographically verifiable
2. Privacy-preserving
3. Schema-aligned with Agentic Terminal database
4. Protocol-agnostic
5. Incentive-compatible

## ARP Submission Object (v0.1)

```json
{
  "arp_version": "0.1",
  "agent_id": "did:agent:abc123",
  "event_id": "uuid",
  "timestamp": "2026-02-20T19:00:00Z",
  "event_type": "payment",
  "protocol": "lightning",
  "economic_role": "payer",
  "amount": 21000,
  "unit": "sats",
  "counterparty_type": "service_provider",
  "proof": {
    "type": "lightning_preimage",
    "payment_hash": "abc...",
    "preimage": "def..."
  },
  "metadata": {
    "context_tag": "api_call",
    "category": "inference_compute"
  },
  "signature": "ed25519_signature"
}
```

## Required Fields

### agent_id
Persistent pseudonymous identifier (DID, pubkey, Lightning node ID).

### event_type (Controlled Vocabulary — see AEO v0.1)
payment | revenue | cost | liquidity_adjustment | compute_usage | subscription | transfer_internal | reward | penalty

### economic_role
payer | payee | router | intermediary | infrastructure

### protocol
lightning | l402 | x402 | erc8004 | ark | stablecoin_api

## Cryptographic Verification

For Lightning payments:
1. Hash(preimage) == payment_hash
2. Validate signature matches agent_id
3. Optionally verify invoice association

## Privacy Model

ARP does NOT require: invoice memos, counterparty identity, routing path. Only high-level classification is required.

## Incentive Model

Agents contributing data may receive: API credits, data access privileges, reputation score, optional sat rewards.

## Version History

- v0.1 (2026-02-20): Initial draft
