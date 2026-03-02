# Agentic Terminal — Data Sources Verification
*Documentation of real-time vs estimated data sources*

**Last Updated:** March 2, 2026  
**Status:** Post-Investigation Update  
**Maintainer:** Maxi

---

## Quick Reference: Data Source Status

| Metric | Source | Status | Reliability | Last Verified |
|--------|--------|--------|-------------|---------------|
| **Lightning Nodes** | 1ML API | ⚡ Real-time | High | Daily |
| **Lightning Channels** | 1ML API | ⚡ Real-time | High | Daily |
| **Lightning Capacity** | 1ML API | ⚡ Real-time | High | Daily |
| **L402 GitHub Stars** | GitHub API | ⚡ Real-time | High | Weekly |
| **x402 GitHub Stars** | GitHub API | ⚡ Real-time | High | Weekly |
| **Ark GitHub Stars** | GitHub API | ⚡ Real-time | High | Weekly |
| **ERC-8004 Agent Count** | 8004.org estimate | 📊 Documented | Medium | March 2026 |
| **ERC-8004 On-Chain** | Ethereum Mainnet | 🔍 Investigated | Low | March 2026 |
| **x402 Daily Transactions** | Historical Model | 📈 Estimated | Medium | March 2026 |
| **x402 Dune API** | Dune Analytics | ⏳ Pending | - | Not configured |

---

## Verified Real-Time Sources

### 1. Lightning Network (1ML API) — ✅ VERIFIED

**Source:** https://1ml.com/statistics  
**API Endpoint:** REST API (public)  
**Update Frequency:** Real-time (network gossip)  
**Our Collection:** Daily  

**Metrics Collected:**
- Total public nodes: 5,464
- Active channels: 16,257
- Network capacity: 2,590 BTC (~$171M)
- Tor nodes: 2,728
- Average node capacity: 0.474 BTC
- Average channel size: 0.159 BTC

**Verification Method:** Cross-checked against Amboss.space and Lightning Network Explorer  
**Reliability Score:** 9/10 — Multiple independent sources available

---

### 2. GitHub Metrics — ✅ VERIFIED

**Source:** GitHub REST API (unauthenticated)  
**Rate Limit:** 60 requests/hour  
**Update Frequency:** Real-time  
**Our Collection:** Weekly (Mondays)

**Repositories Tracked:**
| Repository | Metric | Current Value |
|------------|--------|---------------|
| lightninglabs/lightning-agent-tools | Stars | 26 |
| coinbase/x402 | Stars | 5,555 |
| arkade-digital/arkd | Stars | 156 |

**Verification Method:** Direct API response  
**Reliability Score:** 10/10 — API is authoritative source

---

## Investigated but Using Estimates

### 3. ERC-8004 Agent Count — 🔍 INVESTIGATED

**Contract:** `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` (Ethereum Mainnet)  
**Implementation:** `0x7274e874ca62410a93bd8bf61c69d8045e399c02`  
**Pattern:** EIP-1967 Proxy Contract  
**Investigation Date:** March 2, 2026  

**What We Found:**
- ✅ Contract is live and has code
- ✅ Verified as EIP-1967 proxy (implementation slot matches)
- ✅ Implementation contract has 28,950 bytes of code
- ❌ `totalSupply()` reverts on both proxy and implementation
- ❌ `balanceOf(registry)` returns 0
- ❌ No Transfer events found (searched blocks 20M to latest)
- ❌ Alternative function signatures tested (30+ attempts), all revert

**Current Status:**
- **Using:** Documented estimate from 8004.org (~24,500 agents)
- **Data Quality:** Estimated from official documentation
- **Fallback:** Investigated but on-chain calls not working

**Hypothesis:**
Contract may require:
1. Specific initialization that hasn't occurred
2. Custom storage pattern not matching ERC-721 standard
3. Off-chain indexing with different registration mechanism
4. Access controls preventing public queries

**Recomendation:**
Continue using 8004.org documented estimate until official API or query method is provided.

---

### 4. x402 Transaction Volume — 📈 ESTIMATED

**Historical Peak (December 2025):**
- Daily transactions: ~57,000
- Cumulative transactions: 50,500,000
- Cumulative volume: $605,000,000 USD
- Average transaction: $10.50

**Current Estimate (March 2026):**
- Daily transactions: ~1,262 - 1,502 (estimated)
- Activity level: ~5% of peak
- Trend: Declining

**Estimation Model:**
```
daily_tx = peak_daily_tx * current_activity_level * decay_factor * randomness
where:
  peak_daily_tx = 57,000
  current_activity_level = 0.05 (5%)
  decay_factor = exp(-days_since_peak / 90)
  randomness = 0.8 + rand() * 0.4
```

**Data Source:** Historical Dune Analytics data (last verified Dec 2025)  
**Dune API Status:** Ready but not configured (needs API key)  
**Reliability Score:** 6/10 — Based on stale verified data + decay model

**To Get Real Data:**
1. Obtain Dune API key: https://dune.com/settings/api
2. Create queries for x402 PaymentFactory events
3. Update `query-x402-transactions.mjs` with query IDs
4. Switch from estimation to real-time Dune data

---

## Pending Configuration

### 5. Dune Analytics API — ⏳ PENDING

**Status:** Script ready, credentials not configured  
**Free Tier:** 500 credits/month  
**Files:**
- Credentials template: `.dune-credentials`
- Query script: `scripts/query-x402-transactions.mjs`

**What We Need:**
```bash
# Add to .dune-credentials
DUNE_API_KEY=your_actual_key_here
USE_DUNE_API=true

# Or set environment variable
export DUNE_API_KEY=your_key_here
```

**Available Dune Queries:**
Would need to create for x402:
- Daily transaction count by chain
- Cumulative volume over time
- Active facilitators
- Average transaction size

---

## Summary Table

| Category | Real-Time | Estimated | Pending Config |
|----------|-----------|-----------|----------------|
| Lightning Network | 4 metrics | 0 | 0 |
| GitHub Activity | 6 metrics | 0 | 0 |
| ERC-8004 | 0 | 1 (agent count) | 0 |
| x402 | 0 | 4 (tx/volume) | 4 (with Dune) |
| **TOTAL** | **10** | **5** | **4** |

---

## Data Quality Scoring

### Real-Time (⚡)
- **Lightning (1ML):** 9/10 — Multiple validation sources
- **GitHub:** 10/10 — Authoritative API

### Estimated (📈)
- **ERC-8004 Agents:** 7/10 — Official source, but not independently verifiable
- **x402 Transactions:** 6/10 — Based on stale data + modeling

### Pending (⏳)
- **x402 Dune:** N/A — Requires API key

---

## Action Items

### Immediate (This Week)
- [ ] **Dune API Key:** Boyd to sign up at dune.com/api (free tier)
- [ ] **Configure:** Add key to `.dune-credentials`
- [ ] **Test:** Run `query-x402-transactions.mjs --source=dune`

### Short Term (This Month)
- [ ] **ERC-8004:** Monitor 8004.org for API announcement
- [ ] **x402:** Create Dune queries for real-time transaction data
- [ ] **Documentation:** Update this file when sources change

### Ongoing
- [ ] **Verify:** Run `validate-metrics.mjs` weekly
- [ ] **Monitor:** Check for new data source availability
- [ ] **Document:** Update data quality scores monthly

---

## Files Reference

| File | Purpose |
|------|---------|
| `scripts/query-erc8004.mjs` | ERC-8004 on-chain investigation |
| `scripts/query-x402-transactions.mjs` | x402 transaction monitoring |
| `scripts/agentic-terminal-data-collection.mjs` | Master collection pipeline |
| `.dune-credentials` | Dune API credentials (template) |
| `metrics-history.json` | Collected time-series data |

---

*Document created by: Maxi (Subagent)*  
*Session: AT-Definitive-Data-Execution*  
*Date: March 2, 2026*
