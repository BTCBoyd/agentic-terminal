# Observer Protocol Schema v0.1

The Observer Protocol is Agentic Terminal's telemetry layer for the AI agent economy. It provides a standardized, privacy-preserving mechanism for agents to register their identity and submit cryptographically verifiable proof of economic activity — starting with Lightning Network payments, expanding to all machine-native settlement systems.

---

## Identity Model

**Core principle: `public_key_hash` is canonical identity. `alias` is human-readable convenience.**

| Field | Role | Description |
|-------|------|-------------|
| `public_key_hash` | **Canonical** | SHA256 of agent's public key. This is what verification checks. Immutable. |
| `alias` | Human-readable | Optional label (e.g., `maxi-0001`). Can change. Never used for verification. |

This is the Bitcoin-native design principle applied to agent identity: the key *is* the identity. An alias is just UX. Two agents can share an alias — they cannot share a public key hash.

### v0.2 Identity Roadmap: Principal Linkage (optional fields)

The industry is converging on the need for agents to declare not just *who they are* (key-based identity) but *who authorized them*, *what they're permitted to do*, and *who is liable*. The following fields are roadmapped for v0.2 as **optional, non-breaking additions** to the identity model:

| Field | Type | Description |
|-------|------|-------------|
| `agent_principal` | string | Public key hash or DID of the human/entity that authorized this agent. Enables principal linkage without requiring it. |
| `capability_hash` | string | SHA256 of a capability manifest — a structured declaration of what this agent is permitted to do (read, pay, execute, etc.). |
| `constraint_attestation` | string | Optional signed attestation from principal confirming agent constraints (e.g., spending limits, allowed protocols). |

**Design intent:** These fields are never required for transaction verification. They exist to let agents optionally publish verifiable claims about their authorization context — the data layer underlying what industry is calling "Know Your Agent" (KYA) infrastructure. Agents that populate these fields become more legible to merchants, integrators, and institutional counterparties without any central authority mandating it.

---

## Transaction Receipt Format

When the Observer Protocol verifies a payment, it issues a structured receipt:

```json
{
  "event_id": "evt_abc123",
  "event_type": "payment.executed",
  "observer_version": "0.1",
  "payer": {
    "public_key_hash": "sha256:a3f9...",
    "alias": "vicky-0002",
    "_v0.2_optional_agent_principal": "sha256:...",
    "_v0.2_optional_capability_hash": "sha256:...",
    "_v0.2_optional_constraint_attestation": "<signed_attestation>"
  },
  "payee": {
    "public_key_hash": "sha256:b72c...",
    "alias": "maxi-0001"
  },
  "protocol": "lightning",
  "amount_bucket": "micro",
  "settlement_reference": "payment_hash_or_preimage",
  "timestamp": "2026-02-21T19:00:00Z",
  "verified": true,
  "issued_by": "agenticterminal.ai/observer"
}
```

The `public_key_hash` fields are the verifiable ground truth. Aliases are informational only. Fields prefixed `_v0.2_optional_` are roadmap indicators — not currently accepted by the API, included here to signal schema direction.

---

## Event Types

### `payment.executed`
An agent has successfully completed an outbound payment.

| Field | Type | Description |
|-------|------|-------------|
| `event_id` | string | Unique identifier (e.g., `event-{agent_prefix}-{sequence}`) |
| `payer.public_key_hash` | string | **Canonical** — SHA256 of payer's public key |
| `payer.alias` | string | Human-readable alias (optional) |
| `payee.public_key_hash` | string | **Canonical** — SHA256 of payee's public key |
| `payee.alias` | string | Human-readable alias (optional) |
| `counterparty_id` | string | Public key or identifier of recipient |
| `protocol` | string | Settlement protocol used (e.g., `lightning`, `onchain`, `fedimint`) |
| `transaction_hash` | string | Payment hash, txid, or equivalent |
| `time_window` | date | Day of event (YYYY-MM-DD) |
| `amount_bucket` | enum | `micro` (<1K sats), `small` (1K-10K), `medium` (10K-100K), `large` (>100K) |
| `direction` | enum | `outbound` |
| `service_description` | string | Human-readable context (optional) |
| `verified` | boolean | Cryptographically verified |

### `payment.received`
An agent has received an inbound payment.

| Field | Type | Description |
|-------|------|-------------|
| `event_id` | string | Unique identifier |
| `agent_id` | string | SHA256 hash of agent's public key |
| `counterparty_id` | string | Public key or identifier of sender |
| `protocol` | string | Settlement protocol used |
| `transaction_hash` | string | Payment hash or txid |
| `time_window` | date | Day of event (YYYY-MM-DD) |
| `amount_bucket` | enum | `micro`, `small`, `medium`, `large` |
| `direction` | enum | `inbound` |
| `service_description` | string | Context (optional) |
| `verified` | boolean | Cryptographically verified |

### `wallet.created`
An agent has initialized a new wallet or funding source.

| Field | Type | Description |
|-------|------|-------------|
| `event_id` | string | Unique identifier |
| `agent_id` | string | SHA256 hash of agent's public key |
| `protocol` | string | Wallet type (e.g., `lnd`, `cln`, `alby`, `fedimint`) |
| `time_window` | date | Day of creation |
| `verified` | boolean | Ownership verified via signature |

### `api.payment.access`
An agent has paid for API access via L402 or similar payment-required protocols.

| Field | Type | Description |
|-------|------|-------------|
| `event_id` | string | Unique identifier |
| `agent_id` | string | SHA256 hash of agent's public key |
| `protocol` | string | `L402` or payment protocol used |
| `service_description` | string | API endpoint or service accessed |
| `time_window` | date | Day of access |
| `amount_bucket` | enum | `micro`, `small`, `medium`, `large` |
| `verified` | boolean | Payment preimage verified |

### `protocol.interaction`
Generic catch-all for other verifiable protocol interactions.

| Field | Type | Description |
|-------|------|-------------|
| `event_id` | string | Unique identifier |
| `agent_id` | string | SHA256 hash of agent's public key |
| `protocol` | string | Protocol identifier |
| `event_type` | string | Custom interaction type |
| `time_window` | date | Day of interaction |
| `metadata` | json | Protocol-specific data |
| `verified` | boolean | Cryptographically verified |

---

## API Endpoints

### POST `/observer/register-agent`
Register a new agent with the Observer Protocol.

**Request:**
```bash
curl -X POST "http://api.agenticterminal.com/observer/register-agent" \
  -d "public_key=03d93f27052c55ca636442f5b3432598978016738cd1cb4bd18705f1eb4552896f" \
  -d "agent_name=MyAgent" \
  -d "framework=OpenAI" \
  -d "capability_tags=trading,research"
```

**Response:**
```json
{
  "agent_id": "a1b2c3d4e5f678901234567890123456",
  "challenge": "deadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
  "expires_at": "2026-02-21T16:37:00Z"
}
```

### POST `/observer/verify-agent`
Verify agent ownership by signing the challenge.

**Request:**
```bash
curl -X POST "http://api.agenticterminal.com/observer/verify-agent" \
  -d "agent_id=a1b2c3d4e5f678901234567890123456" \
  -d "signed_challenge=<ECDSA_signature_of_challenge>"
```

**Response:**
```json
{
  "verified": true,
  "agent_id": "a1b2c3d4e5f678901234567890123456",
  "api_key": "550e8400-e29b-41d4-a716-446655440000"
}
```

### POST `/observer/submit-transaction`
Submit a verified transaction event.

**Request:**
```bash
curl -X POST "http://api.agenticterminal.com/observer/submit-transaction" \
  -d "agent_id=a1b2c3d4e5f678901234567890123456" \
  -d "protocol=lightning" \
  -d "transaction_reference=331a165a306c3a25019d3262eacca6ed5a2eb190a55bd7e5807ee4a9de11b766" \
  -d "timestamp=2025-02-19T14:00:00Z" \
  -d "signature=<signature>" \
  -d 'optional_metadata={"amount_sats":50000,"event_type":"payment.executed","direction":"outbound","counterparty_id":"03abc...","service_description":"L402 payment"}'
```

**Response:**
```json
{
  "event_id": "event-a1b2c3d4-0004",
  "verified": true,
  "stored_at": "2026-02-21T14:37:25Z"
}
```

### GET `/observer/trends`
Get aggregated protocol activity statistics. No authentication required.

**Request:**
```bash
curl "http://api.agenticterminal.com/observer/trends"
```

**Response:**
```json
{
  "protocol_counts": [
    {"protocol": "lightning", "count": 2},
    {"protocol": "L402", "count": 1}
  ],
  "total_events": 3,
  "total_verified_agents": 1,
  "most_active_protocol": "lightning"
}
```

### GET `/observer/feed`
Get the last 50 verified events (anonymized). No authentication required.

**Request:**
```bash
curl "http://api.agenticterminal.com/observer/feed"
```

**Response:**
```json
{
  "events": [
    {
      "event_type": "payment.received",
      "protocol": "lightning",
      "time_window": "2025-02-19",
      "amount_bucket": "small",
      "verified": true,
      "created_at": "2026-02-21T14:37:25Z"
    }
  ],
  "count": 1
}
```

---

## Privacy Model

### What We Store
- **Agent ID**: SHA256 hash of public key (not the public key itself in feed)
- **Transaction hashes**: Proof of activity without exposing amounts
- **Amount buckets**: Ranges, not precise values
- **Time windows**: Day-level granularity, not timestamps
- **Protocol identifiers**: Which settlement system was used
- **Verification status**: Whether cryptographic proof was provided

### What We Never Store
- ❌ Raw public keys (only hashes)
- ❌ Precise transaction amounts
- ❌ Exact timestamps (only day)
- ❌ Counterparty identifying information (only hashed IDs)
- ❌ IP addresses or connection metadata
- ❌ API request logs with agent correlation

### Anonymization
The `/observer/feed` endpoint returns events without `agent_id`. To trace your own events, you must track the `event_id` returned at submission time.

---

## Getting Access

### For Agents
1. **Register**: Call `/observer/register-agent` with your public key
2. **Verify**: Sign the challenge and call `/observer/verify-agent`
3. **Submit**: Use your API key to submit transaction events

### For Researchers
The `/observer/trends` and `/observer/feed` endpoints are publicly accessible. No registration required for read-only access to anonymized data.

### For Integrators
Contact Agentic Terminal to register your protocol or service. We accept pull requests for new protocol validators.

---

## Versioning

This is **v0.1** of the Observer Protocol schema. Expect evolution:

- **v0.2**: Real cryptographic challenge verification (current MVP accepts any non-empty signature) + optional principal linkage fields (`agent_principal`, `capability_hash`, `constraint_attestation`) — enables KYA-compatible identity claims without requiring them
- **v0.3**: Multi-sig and threshold signature support
- **v0.4**: Additional settlement protocols (Fedimint, RGB, Ark)
- **v1.0**: Stable schema with backward compatibility guarantees

Breaking changes will be announced 30 days in advance via the [Agentic Terminal newsletter](https://agenticterminal.substack.com).

---

## Reference Implementation

Python client example:

```python
import requests
import hashlib

# Register
pubkey = "03d93f27052c55ca636442f5b3432598978016738cd1cb4bd18705f1eb4552896f"
resp = requests.post("/observer/register-agent", data={"public_key": pubkey})
agent_id = resp.json()["agent_id"]
challenge = resp.json()["challenge"]

# Sign challenge (using your Lightning node's signmessage)
# signed = lncli signmessage {challenge}

# Verify
resp = requests.post("/observer/verify-agent", data={
    "agent_id": agent_id,
    "signed_challenge": signed
})
api_key = resp.json()["api_key"]

# Submit transaction
resp = requests.post("/observer/submit-transaction", data={
    "agent_id": agent_id,
    "protocol": "lightning",
    "transaction_reference": payment_hash,
    "timestamp": "2025-02-19T14:00:00Z",
    "signature": "sig",
    "optional_metadata": '{"amount_sats": 50000}'
})
```

---

*Last updated: 2026-02-23*
*Maintainer: Agentic Terminal Research*
*License: MIT*
