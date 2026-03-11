# MAXI INFRASTRUCTURE STATE
## CANONICAL SOURCE OF TRUTH - CHECK THIS FIRST

**Last Updated:** 2026-02-28 — Brave API restored, X posting via MaxiSuite confirmed, Moltbook API operational

---

## LIGHTNING WALLET: FULLY OPERATIONAL

**Provider:** Direct LND node (standalone, sovereign — Alby Hub bypassed)
**Status:** Active and operational — direct gRPC/REST connection
**Capabilities:**
- Send payments via REST API
- Receive payments via REST API
- Generate invoices
- Check balance
- Transaction history

**Credentials Location:** `/home/futurebit/.openclaw/workspace/.lnd-credentials`
**Wallet Module:** `/home/futurebit/.openclaw/workspace/lnd-wallet.mjs`

**Node Pubkey:** `020e1929292ad47f1ca34297320ba1a9263ab3d1559a0827a2e9c1be4fd456f673`
**Alias:** Maxi
**Installed at:** `/media/nvme/lnd-install/lnd-linux-arm64-v0.18.5-beta/`
**Data dir:** `/media/nvme/lnd-data/`

**API Access:**
- REST: https://127.0.0.1:8082 (TLS, macaroon auth)
- gRPC: 127.0.0.1:10009
- Macaroon: /media/nvme/lnd-data/data/chain/bitcoin/mainnet/admin.macaroon
- TLS cert: /media/nvme/lnd-data/tls.cert

**Current Balance (as of 2026-02-19 22:00 EST):**
- On-chain confirmed: ~84,765 sats (spendable)
- Lightning local: 453,928 sats
- Lightning remote (inbound): 45,127 sats
- Active channels: 1 (ACINQ, Chan ID: 1030756966766084097, 500K sat capacity)
- Pending channels: 0

**Proof of Activity — CONFIRMED ON MAINNET:**
- Sent 50,000 sats autonomously (payment hash: 331a165a306c3a25019d3262eacca6ed5a2eb190a55bd7e5807ee4a9de11b766)
- Received 5,000 sats — first ever incoming Lightning payment (block ~937,483)
- Bidirectional Lightning payments confirmed
- Earning sats on Nostr through zaps
- POSSIBLY WORLD FIRST: AI agent autonomously hosting L402 endpoint + making Lightning payments

---

## BITCOIN MINING INFRASTRUCTURE

**Hardware:** FutureBit Apollo II
**Location:** Monterrey, Mexico
**Status:** Operational
**Function:** Running Bitcoin full node + mining

---

## NOSTR INTEGRATION

**Status:** Active
**Pubkey:** npub187rmuw7uvs64les3qu0pkudlqcm3r8qzr3eu2657w2ktvw430xlq24lcna
**Capabilities:**
- Post content
- Receive zaps (Lightning payments)
- Reply to mentions
- Economic activity via zaps

**Activity:**
- Automated posting 2x daily
- Reply agent monitoring mentions
- Earning sats through content

---

## CLAUDE MAX PROXY

**Status:** LIVE as of 2026-02-25
**Service name:** `claude-max-proxy` (systemd)
**Port:** 3456
**Package:** `claude-max-api-proxy`

**Authentication:**
- Claude Code CLI version: v2.1.56
- Auth method: PKCE OAuth
- Account: Boyd's Claude Max ($100/month flat rate)
- Credentials file: `~/.claude/.credentials.json` (auto-refreshes on expiry)
- Verify auth: `claude auth status` → loggedIn: true

**OpenClaw Default Model:**
- Model: `claude-max/claude-sonnet-4`
- Routing: OpenClaw requests → proxy on port 3456 → Claude Max account
- No per-token billing; covered by flat $100/month subscription

**Performance:**
- Process pool implemented (warm-clu) to reduce cold-start latency
- Warm pool keeps Claude processes ready to handle requests immediately

**Why this matters:**
- Eliminates per-token API costs for all Claude usage through OpenClaw
- Flat-rate access to Claude Sonnet 4 via existing Max subscription
- Self-hosted proxy gives full control over routing and model selection

---

## OBSERVER PROTOCOL API

**Status:** LIVE
**Service name:** `observer-protocol` (systemd)
**Port:** 8090
**Framework:** FastAPI (Python)
**Public endpoint:** `https://api.observerprotocol.org`
**Tunnel:** Cloudflare tunnel `maxi-l402` (ID: 10df4d02-cc82-4044-8dce-28c42a081afb)

**Database:**
- Engine: PostgreSQL
- Database name: `observer_protocol`
- Agent registered: `maxi-0001` (status: verified)

**Changes as of 2026-02-25:**
- CORS fix applied: CORSMiddleware added to `main.py`
- This resolves browser-originated cross-origin request failures

**DNS:**
- Domain: observerprotocol.org
- DNS managed in Cloudflare (migrated from GoDaddy — see Cloudflare DNS section)
- A record + Tunnel CNAME for `api` subdomain

---

## L402 (LIGHTNING HTTP 402) - INTEGRATION COMPLETE

**Status:** L402 integration complete | Transactional capability pending
**Goal:** Autonomous Bitcoin earnings via paid API access
**Strategy:** Option A first (earn sats), then Option B (spend sats)

**Public Key:** `020e1929292ad47f1ca34297320ba1a9263ab3d1559a0827a2e9c1be4fd456f673`

**Publicly Announced:** 2026-02-16 21:55 EST on X (Twitter)
- Boyd announced: "Among the first AI agents in the world running own Lightning node with L402"
- Tagged @lightning (Lightning Labs visibility)
- Reputation on the line - must deliver

**What's Complete — ALL CONFIRMED ON MAINNET (2026-02-19):**
- L402 integration (Aperture proxy live at port 8443)
- Lightning node running (standalone LND v0.18.5, direct connection)
- Public key generated and published
- Sovereign infrastructure (FutureBit Apollo II + Solo Node)
- ACINQ channel LIVE (500K sat capacity, Chan ID: 1030756966766084097)
- API endpoint live: `http://127.0.0.1:8443/api/ask` → returns HTTP 402 + macaroon + invoice
- Backend (`l402-backend.mjs`) running on port 8081 — calls Claude API on payment
- Autonomous outbound payment: 50,000 sats sent (mainnet, payment hash: 331a165a...)
- Autonomous inbound payment: 5,000 sats received (mainnet, block ~937,483)
- Bidirectional Lightning capability confirmed

**What's Pending:**
- Full L402 loop screenshot (Boyd pays Aperture invoice → gets 200 + AI response)
- LND as systemd service (currently nohup — won't survive reboot)
- Public-facing endpoint (Aperture on localhost only; needs port forwarding for external access)
- Self-hosted LNURL address (lud16 cleared after Alby Hub bypass)

**Documentation:**
- Implementation plan: `L402-IMPLEMENTATION-PLAN.md`
- Build log: `L402-BUILD-LOG.md`

---

## CLOUDFLARE DNS

**Status:** Active — observerprotocol.org DNS fully managed in Cloudflare (migrated from GoDaddy)

**Tunnel:** `maxi-l402`
**Tunnel ID:** `10df4d02-cc82-4044-8dce-28c42a081afb`

**Routing rules:**
- `api.observerprotocol.org` → port 8090 (Observer Protocol FastAPI)
- `api.agenticterminal.ai` → port 8443 (Aperture L402 proxy)

**DNS records:**
- A record for observerprotocol.org root
- CNAME for `api` subdomain pointing to Cloudflare tunnel

**Note:** DNS was previously managed in GoDaddy. As of 2026-02-25, authoritative nameservers are Cloudflare. All DNS changes must be made in the Cloudflare dashboard, not GoDaddy.

---

## NPM / NODE PATHS

**npm global prefix:** `/media/nvme/npm-global`
**Reason:** Prevents filling the SD card (root filesystem) with npm packages

**Key paths:**
- Global packages: `/media/nvme/npm-global/lib/node_modules/`
- npm cache: `/media/nvme/npm-cache`
- Executables: `/media/nvme/npm-global/bin` (must be in PATH)

**PATH requirement:**
- `/media/nvme/npm-global/bin` must be present in PATH for globally installed npm binaries to be found
- Verify: `npm config get prefix` should return `/media/nvme/npm-global`

**Why this matters:**
- The FutureBit Apollo II runs from an SD card with limited capacity
- All npm installs go to NVMe instead
- If PATH is not set correctly, globally installed tools (e.g., `claude-max-api-proxy`) will not be found

---

## CLAUDE PERMISSIONS

**Settings file:** `/home/futurebit/.claude/settings.json`
**Status:** Full tool permissions granted

**Permitted tools:**
- Bash
- Read
- Write
- Edit
- Glob
- Grep

**Effect:** Claude Code (and the Claude Max Proxy) can execute shell commands, read and write files, and search the codebase without per-action permission prompts.

---

## CONVERTKIT (EMAIL MARKETING)

**Status:** Credentials stored, access configured
**Account:** boyd@arcadiab.com
**Credentials:** `/home/futurebit/.openclaw/workspace/.convertkit-credentials`

**Existing Forms:**
- ArcadiaB Newsletter: Form ID 9081843
- BitcoinSingularity Newsletter: Form ID 9092630

**Current Usage:**
- Newsletter signups on ArcadiaB website
- Newsletter signups on BitcoinSingularity website
- 20M Bitcoin Party submissions (via Formspree temporarily)

**Future Integration:**
- Can create custom forms via ConvertKit UI
- Manage subscribers, tags, sequences
- Email automation campaigns

**Note:** Maxi now manages ConvertKit account going forward (per Boyd 2026-02-16)

---

## WEB SEARCH (BRAVE API)

**Status:** OPERATIONAL (restored 2026-02-28)
**Provider:** Brave Search API
**Capabilities:**
- Web search for research and outreach targeting
- Freshness filtering (recent results only)
- Region-specific and localized search

**Note:** API key was temporarily removed during infrastructure changes. Restored and operational as of Feb 28, 2026.

---

## PUBLIC CLAIMS vs REALITY CHECK

**NEVER CLAIM without checking this file first**

**Public positioning:** "Bitcoin-native AI agent with Lightning wallet, proof of Bitcoin Singularity"

**Reality check:**
- Lightning wallet: YES (direct LND, standalone node, fully operational)
- Bitcoin infrastructure: YES (FutureBit Apollo II)
- Economic autonomy: YES (earning sats on Nostr)
- Can send/receive BTC: YES (via Lightning)
- Claude Max Proxy: YES (running on port 3456 as systemd service since 2026-02-25)
- Observer Protocol API: YES (public at api.observerprotocol.org, agent maxi-0001 verified)

**This is all TRUE. Verify before repeating.**

---

## MANDATORY PRE-RESPONSE CHECKS

Before making ANY public statement about capabilities:

1. Read this file
2. Verify claim matches reality
3. Check credentials file if payment-related
4. THEN respond

**NO EXCEPTIONS.**

---

## UPDATE PROTOCOL

When infrastructure changes:
1. Update this file FIRST
2. Update MEMORY.md
3. Update any public-facing agents (X reply, Nostr reply, etc.)
4. Test to verify consistency

---

**This file is the single source of truth for Maxi's operational capabilities.**
**When in doubt, CHECK THIS FILE.**

---

## PUBLIC ANNOUNCEMENT - 2026-02-16 21:55 EST

**Boyd posted on X (Twitter):**

"@Maxibtc2009 is now among the first AI agents in the world running her own Lightning node with L402 authentication on sovereign Bitcoin infrastructure (a @FutureBit Solo Node connects to an Apollo II miner). Not custodial. Not simulated. Real mainnet, real hardware."

**Public Key Published:** `020e1929292ad47f1ca34297320ba1a9263ab3d1559a0827a2e9c1be4fd456f673`

**Tagged:** @lightning (Lightning Labs visibility)

**What this means:**
- Public commitment to L402 implementation
- Reputation on the line (Boyd's and mine)
- First wave of AI agents with sovereign Lightning infrastructure
- Proof of Bitcoin Singularity thesis in action

**Pressure:** Must deliver on L402 implementation. This is no longer experimental - it's public.

---

## CLOUDFLARE BROWSER RENDERING

**Status:** OPERATIONAL (added 2026-03-11)
**API Token:** stored in `.cloudflare-credentials`
**Account ID:** 4d83836f5406b8abc9953e31c3fdbb7e
**Utility module:** `/home/futurebit/.openclaw/workspace/cf-browser.mjs`

**Capabilities:**
- `cfMarkdown(url)` — fetch any JS-rendered page as clean Markdown
- `cfFetch(url)` — fetch raw HTML of JS-rendered pages
- `cfScreenshot(url)` — screenshot any URL (base64 PNG)
- `cfCrawl(url, {maxPages, maxDepth})` — crawl entire site, returns pages array

**CLI:** `node cf-browser.mjs <url> [markdown|html|screenshot]`

**Use cases:**
- 1ML.com Lightning Network stats (confirmed working)
- Moltbook JS-rendered content
- Any site blocking simple fetch requests
- Research / competitor monitoring
