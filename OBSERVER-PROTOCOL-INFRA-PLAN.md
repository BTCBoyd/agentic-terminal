# Observer Protocol — Infrastructure Plan
## Goal: Public API Endpoint in 2-3 Weeks
*Created: 2026-02-23*

---

## Current State (Honest)

| Component | Status | Risk |
|-----------|--------|------|
| FastAPI server (port 8090) | ✅ Running, localhost only | P0 — no external access |
| PostgreSQL 16 | ✅ Running | Low |
| LND v0.18.5 | ✅ Running (nohup) | P0 — dies on reboot |
| Aperture L402 proxy (port 8443) | ✅ Running, localhost only | P1 |
| observerprotocol.org | ✅ Static site (Netlify) | Low — no API backend |
| api.observerprotocol.org | ❌ Does not exist | Blocker for SDK |
| systemd services | ❌ None for LND/FastAPI | P0 |

---

## Two Options to Go Public

### Option A: Expose FutureBit Node Directly
Host the API on the same machine, expose via reverse proxy (nginx/caddy) with SSL.

**Pros:** No new infra cost, data stays on our hardware, Bitcoin-native ethos
**Cons:** Home IP = single point of failure, no SLA, reboot = outage, ISP could block
**Verdict:** Acceptable for MVP/beta. Not for production.

### Option B: Deploy FastAPI to Cloud VPS (Recommended)
Copy the FastAPI app + schema to a $5-6/month VPS (Hetzner, Fly.io, Railway).

**Pros:** 99.9% uptime, proper SSL, no home IP exposure, scales when needed
**Cons:** Small cost, data leaves home hardware (mitigated — DB stays local, API is stateless write-through)
**Verdict:** ✅ Recommended for public launch

**Hybrid approach (best of both):**
- VPS handles the public API endpoint (write events, read trends/feed)
- PostgreSQL stays on FutureBit (the moat — the data)
- VPS API writes through to home DB via secure tunnel (or syncs)
- If home DB is unreachable, VPS queues events and retries

---

## Tier 1: Must-Have Before Any External Integration

### 1. LND → systemd service
```bash
# /etc/systemd/system/lnd.service
[Unit]
Description=LND Lightning Node
After=network.target bitcoind.service

[Service]
ExecStart=/usr/local/bin/lnd --configfile=/home/futurebit/.lnd/lnd.conf
User=futurebit
Restart=on-failure
RestartSec=30

[Install]
WantedBy=multi-user.target
```
**Effort:** 30 minutes | **Impact:** Eliminates reboot risk

### 2. FastAPI → systemd service
```bash
# /etc/systemd/system/observer-protocol.service
[Unit]
Description=Observer Protocol API
After=network.target postgresql.service

[Service]
ExecStart=/usr/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8090
WorkingDirectory=/home/futurebit/.openclaw/workspace/observer-protocol-api
User=futurebit
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
**Effort:** 30 minutes | **Impact:** API survives reboots

### 3. Deploy FastAPI to VPS (Option B)
- Spin up Hetzner CX11 (~€3.79/month) or Fly.io free tier
- Deploy FastAPI with gunicorn + uvicorn
- Point `api.observerprotocol.org` DNS to VPS IP
- SSL via Let's Encrypt / Caddy
**Effort:** 2-4 hours | **Impact:** Public endpoint exists

### 4. DNS: api.observerprotocol.org
- Add A record pointing to VPS IP
- Verify SSL cert via Let's Encrypt
**Effort:** 15 minutes (after VPS is ready)

### 5. API Key System (minimal)
- On `/observer/register-agent`, return an API key
- All write endpoints require `Authorization: Bearer <api_key>`
- Store in PostgreSQL `api_keys` table
**Effort:** 2-3 hours | **Impact:** Rate limiting + attribution

---

## Tier 2: Cross-Rail SDK Readiness

Before the SDK is credible across rails, we need verification logic for each:

| Protocol | Proof of Payment | Verification Method | Status |
|----------|-----------------|---------------------|--------|
| Lightning | Preimage (32 bytes) | SHA256(preimage) == payment_hash | ✅ Implemented |
| On-chain BTC | txid + confirmations | Bitcoin RPC / block explorer | ⬜ Needs build |
| Ark | Shared UTXO + round proof | Ark node API | ⬜ Needs research |
| x402 | EVM tx hash | Ethereum RPC / Etherscan | ⬜ Needs build |
| Fedimint | Federation-signed receipt | Fedimint API | ⬜ Needs research |

**For MVP SDK (v0.1):** Lightning only. Add rails progressively.

---

## Tier 3: SDK Package

Once public API is live:

```
@observer-protocol/arp-client (npm)
├── reportPayment(opts) → Promise<Receipt>
├── registerAgent(pubkey) → Promise<AgentId>
├── verifyAgent(agentId, signedChallenge) → Promise<ApiKey>
└── getAgentHistory(pubkeyHash) → Promise<Event[]>
```

**Supported in v0.1:** Lightning (preimage verification)
**Roadmap:** Ark, x402, on-chain

---

## Execution Sequence

| Week | Task | Owner | Output |
|------|------|-------|--------|
| Week 1 | LND → systemd | Maxi | No more nohup risk |
| Week 1 | FastAPI → systemd | Maxi | API survives reboots |
| Week 1 | Spin up VPS + deploy FastAPI | Maxi/Boyd | api.observerprotocol.org live |
| Week 1 | DNS + SSL | Boyd (DNS access) | HTTPS endpoint |
| Week 2 | API key system | Maxi | Rate limiting + auth |
| Week 2 | Test external submissions | Maxi | Validate public API |
| Week 3 | ARP SDK v0.1 (npm, Lightning only) | Maxi | First external integration possible |
| Week 3 | arc0btc integration spec | Maxi + arc0btc | First partner embed |

---

## What Needs Boyd

- **GoDaddy/DNS access** — add A record for `api.observerprotocol.org`
- **VPS decision** — Hetzner vs Fly.io vs Railway (recommend Hetzner CX11, cheapest, most control)
- **Budget approval** — ~€4-6/month for VPS

Everything else Maxi can build autonomously.

---

## First Step (Today)

Fix the systemd issue for LND and FastAPI — this costs nothing and eliminates the biggest risk (reboot wipes everything). Can do this right now.

Want me to start with the systemd services?
