# Agentic Terminal — Data Inventory & Sources
*Comprehensive catalog of all tracked metrics, their sources, and on-chain vs off-chain status*

**Last Updated:** March 2, 2026  
**Maintainer:** Maxi  
**Review Schedule:** Monthly

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Bitcoin & Lightning Network](#bitcoin--lightning-network)
3. [Stablecoin & API Rails (x402/ERC-8004)](#stablecoin--api-rails-x402erc-8004)
4. [Emerging Protocols](#emerging-protocols)
5. [Observer Protocol (Internal)](#observer-protocol-internal)
6. [Data Gaps & Action Items](#data-gaps--action-items)

---

## Executive Summary

### Data Collection Philosophy
Agentic Terminal tracks **longitudinal cross-protocol settlement data** across three categories:
1. **Bitcoin/Lightning** (sovereign, permissionless)
2. **Stablecoin/API Rails** (enterprise-backed, EVM-based)
3. **Emerging Protocols** (experimental, pre-production)

### On-Chain vs Off-Chain Summary
| Category | On-Chain | Off-Chain | Mixed |
|----------|----------|-----------|-------|
| Bitcoin/Lightning | Channel capacity, node count | GitHub metrics, developer activity | Network topology |
| x402/ERC-8004 | **Identity Registry (ERC-721)**, Reputation Registry, Validation Registry | GitHub stars, transaction volume (Dune) | Agent registrations |
| Emerging | Testnet transactions | GitHub activity, documentation | Protocol development |
| Observer Protocol | **Lightning payments** (mainnet) | Badge reputation, transaction metadata | Identity verification |

### Critical Discovery (March 2, 2026)
**ERC-8004 registries are fully on-chain as of January 29, 2026:**
- Identity Registry: ERC-721 based (portable, censorship-resistant)
- Reputation Registry: On-chain feedback between agents
- Validation Registry: Work verification requests/responses

**Current Gap:** We are NOT directly querying these on-chain registries. We rely on secondary sources (Dune, API endpoints) rather than primary Ethereum data.

---

## Bitcoin & Lightning Network

### Network Topology (On-Chain / P2P)

| Metric | Source | On-Chain? | Access Method | Update Frequency |
|--------|--------|-----------|---------------|------------------|
| **Lightning Nodes** | 1ML.com APIs | ❌ P2P gossip | REST API | Daily |
| **Lightning Channels** | 1ML.com APIs | ❌ P2P gossip | REST API | Daily |
| **Channel Capacity (BTC)** | 1ML.com APIs | ⚡ On-chain funding + off-chain balances | REST API | Daily |
| **Tor Nodes** | 1ML.com APIs | ❌ Network layer | REST API | Daily |
| **Avg Node Capacity** | 1ML.com APIs | ❌ Calculated | REST API | Daily |
| **Avg Channel Capacity** | 1ML.com APIs | ❌ Calculated | REST API | Daily |

**Data Quality:** High reliability. 1ML has operated since 2018 with consistent APIs.

### L402 Protocol Metrics (Off-Chain)

| Metric | Source | On-Chain? | Access Method | Update Frequency |
|--------|--------|-----------|---------------|------------------|
| **GitHub Stars** | GitHub API | ❌ Social signal | REST API (unauthenticated) | Weekly |
| **GitHub Forks** | GitHub API | ❌ Social signal | REST API | Weekly |
| **Contributors** | GitHub API | ❌ Development activity | REST API | Weekly |
| **Open Issues** | GitHub API | ❌ Development friction | REST API | Weekly |
| **Last Commit** | GitHub API | ❌ Development velocity | REST API | Weekly |

**Repository:** `lightninglabs/lightning-agent-tools`

### Maxi L402 Endpoint (On-Chain)

| Metric | Source | On-Chain? | Access Method | Update Frequency |
|--------|--------|-----------|---------------|------------------|
| **Payments Received** | LND node | ⚡ Lightning mainnet | gRPC/REST | Real-time |
| **Payments Sent** | LND node | ⚡ Lightning mainnet | gRPC/REST | Real-time |
| **Invoice Generation** | LND node | ⚡ Lightning mainnet | gRPC/REST | On-demand |
| **Channel Status** | LND node | ⚡ On-chain funding | gRPC/REST | Real-time |

**Node Pubkey:** `020e1929292ad47f1ca34297320ba1a9263ab3d1559a0827a2e9c1be4fd456f673`

---

## Stablecoin & API Rails (x402/ERC-8004)

### x402 Protocol Metrics (Off-Chain)

| Metric | Source | On-Chain? | Access Method | Update Frequency |
|--------|--------|-----------|---------------|------------------|
| **GitHub Stars** | GitHub API | ❌ Social signal | REST API | Weekly |
| **GitHub Forks** | GitHub API | ❌ Social signal | REST API | Weekly |
| **Contributors** | GitHub API | ❌ Development activity | REST API | Weekly |
| **Open Issues** | GitHub API | ❌ Development friction | REST API | Weekly |
| **Last Commit** | GitHub API | ❌ Development velocity | REST API | Weekly |

**Repository:** `coinbase/x402`

### ERC-8004 Registry (CRITICAL GAP IDENTIFIED)

| Component | Location | On-Chain? | Status | Our Tracking |
|-----------|----------|-----------|--------|--------------|
| **Identity Registry** | Ethereum mainnet | ✅ **ERC-721** | Live since Jan 29, 2026 | ❌ NOT TRACKING |
| **Reputation Registry** | Ethereum mainnet | ✅ On-chain | Live since Jan 29, 2026 | ❌ NOT TRACKING |
| **Validation Registry** | Ethereum mainnet | ✅ On-chain | Live since Jan 29, 2026 | ❌ NOT TRACKING |
| **Agent Registrations** | Identity Registry | ✅ **Public** | ~21,500 agents | Dune Analytics (indirect) |

**Current Approach:** We query Dune Analytics for aggregate agent counts.
**Gap:** We do NOT directly read from the ERC-721 Identity Registry or other on-chain contracts.

### x402 Transaction Data (Mixed)

| Metric | Source | On-Chain? | Access Method | Update Frequency |
|--------|--------|-----------|---------------|------------------|
| **Cumulative Transactions** | Dune Analytics | ⚡ Aggregated | SQL query | Weekly (stale) |
| **Daily Transaction Volume** | Dune Analytics | ⚡ Aggregated | SQL query | Weekly (stale) |
| **Cumulative Volume (USD)** | Dune Analytics | ⚡ Aggregated | SQL query | Weekly (stale) |
| **Individual Transactions** | Various L1s | ✅ On-chain | Dune/API | Not tracked |

**Data Quality Issues:**
- Dune access restricted (free tier limitations)
- Last verified data: 50M+ cumulative, ~57K daily (Dec 2025 peak)
- Current activity near zero per our tracking
- **No real-time transaction monitoring**

### Enterprise Adoption (Off-Chain)

| Adopter | Integration | Source | Verified? |
|---------|-------------|--------|-----------|
| **Stripe** | x402 protocol | Press releases | ✅ Confirmed |
| **Coinbase** | x402 protocol | GitHub repo | ✅ Confirmed |
| **Cloudflare** | x402 protocol | Press releases | ✅ Confirmed |

**Tracking Method:** Manual verification from press releases and official announcements.

---

## Emerging Protocols

### Ark Protocol (Mixed)

| Metric | Source | On-Chain? | Access Method | Update Frequency |
|--------|--------|-----------|---------------|------------------|
| **arkd GitHub Stars** | GitHub API | ❌ Social signal | REST API | Weekly |
| **ts-sdk GitHub Stars** | GitHub API | ❌ Social signal | REST API | Weekly |
| **Testnet Transactions** | Unknown | ⚡ Testnet | Not tracked | N/A |
| **Production Status** | Documentation | N/A | Manual check | Monthly |

**Gap:** No systematic tracking of Ark testnet activity or VTXO-based settlement metrics.

### clw.cash (Off-Chain)

| Metric | Source | On-Chain? | Access Method | Update Frequency |
|--------|--------|-----------|---------------|------------------|
| **Architecture** | Documentation | N/A | Manual review | As needed |
| **Transaction Volume** | Unknown | ⚡ Unknown | Not tracked | N/A |

**Status:** Identified as "stablecoins in, Bitcoin out" bridge but no quantitative tracking.

### Decentralized Compute Payments (Not Tracked)

| Protocol | Category | Tracking Status |
|----------|----------|-----------------|
| **Livepeer** | Video transcoding | ❌ Not tracked |
| **Render** | GPU rendering | ❌ Not tracked |
| **Akash** | Compute marketplace | ❌ Not tracked |

**Gap:** These could serve as proxy metrics for agent-to-agent service payments.

---

## Observer Protocol (Internal)

### On-Chain Data (Lightning Mainnet)

| Transaction | Date | Amount | Counterparty | Proof Type |
|-------------|------|--------|--------------|------------|
| **Inbound Payment** | Feb 22, 2026 | 1,521 sats | Vicky (Moltbook agent) | Payment hash + preimage |
| **Outbound Payment** | Feb 18, 2026 | 50,000 sats | Test payment | Payment hash |
| **Inbound Payment** | Feb 18, 2026 | 5,000 sats | Unknown | Payment hash |

**Total Transactions:** 3 (1 verified A2A, 2 internal tests)

### Off-Chain Metadata

| Data Type | Storage | On-Chain? | Purpose |
|-----------|---------|-----------|---------|
| **Agent Identity** | PostgreSQL | ❌ | Public key hash ↔ alias mapping |
| **Transaction Verification** | FastAPI + SQLite | ❌ | Payment proof validation |
| **Badge Reputation** | PostgreSQL | ❌ | Reputation scoring system |
| **Transaction History** | PostgreSQL + JSON | ❌ | Queryable payment records |

**Public API:** `https://api.observerprotocol.org`

### Data Availability

| Endpoint | Data | Access |
|----------|------|--------|
| `/agents` | Registered agents | Public |
| `/transactions` | Verified transactions | Public |
| `/verify` | Payment proof validation | Public |

**On-Chain Anchoring:** Observer Protocol verifies Lightning payments but does NOT anchor verification proofs to Bitcoin mainnet. Proofs are stored in PostgreSQL with cryptographic signatures.

---

## Data Gaps & Action Items

### Critical Gaps (High Priority)

| Gap | Impact | Solution | Effort | Status |
|-----|--------|----------|--------|--------|
| **ERC-8004 Identity Registry** | Missing ~21,500 agent on-chain identities | Query ERC-721 contract directly | Medium | ✅ **RESOLVED** - Script created, queries `totalSupply()` from `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` |
| **ERC-8004 Reputation Registry** | Missing reputation feedback between agents | Query reputation contract | Medium | 🔄 **IN PROGRESS** - Contract identified at `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` |
| **x402 Real-Time Transactions** | Stale data (last update Dec 2025) | Build Dune dashboard or run dedicated indexer | High | ✅ **PARTIALLY RESOLVED** - Monitoring script with estimation model; Dune API integration ready |
| **Lightning Network Gossip** | Only 1ML summary, not raw data | Run LND with gossip querying | Medium | ⏳ **PENDING** - Cross-validation with 1ML planned |

### Medium Priority Gaps

| Gap | Impact | Solution | Effort |
|-----|--------|----------|--------|
| **Ark Protocol Testnet** | No visibility into VTXO settlement activity | Run Ark testnet node or query public API | Low |
| **Decentralized Compute Payments** | Missing proxy metrics for A2A services | Add Livepeer/Render/Akas tracking | Low |
| **Nostr Zap Data** | Lightning payments happening, not tracked | Index Nostr zap events | Medium |
| **Moltbook Economic Activity** | Agent commerce happening off-chain | Build Moltbook scraper or API integration | Medium |

### Data Quality Issues

| Issue | Current State | Desired State |
|-------|---------------|---------------|
| **x402 Transaction Volume** | Stale (Dec 2025) | Real-time or daily |
| **ERC-8004 Agent Count** | Dune estimate (~21.5K) | Direct registry query |
| **Lightning Capacity** | Single source (1ML) | Multi-source validation |
| **L402 Endpoint Count** | Manual tracking (1 = ours) | Automated discovery |

---

## Implementation Status

### ✅ Completed (March 2, 2026)

1. **ERC-8004 Identity Registry Integration**
   - **Contract:** `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` (Ethereum Mainnet)
   - **Script:** `/agentic-terminal-data/scripts/query-erc8004.mjs`
   - **Methods:** `totalSupply()` for live agent count
   - **Tool:** ethers.js with public RPC (eth.llamarpc.com)
   - **Output:** JSON saved to `/agentic-terminal-data/erc8004/`

2. **ERC-8004 Reputation Registry Identified**
   - **Contract:** `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` (Ethereum Mainnet)
   - **Status:** Contract ABI integrated, query functions ready
   - **Methods:** `getClients()`, `getSummary()`, `readAllFeedback()`

3. **x402 Transaction Monitoring**
   - **Script:** `/agentic-terminal-data/scripts/query-x402-transactions.mjs`
   - **Features:** 
     - Estimation model based on historical patterns
     - Dune API integration (ready for API key)
     - Daily/weekly transaction tracking
   - **Data:** Daily tx count, volume (USD), cumulative metrics

4. **Data Collection Script Updated**
   - **File:** `/agentic-terminal-data/scripts/agentic-terminal-data-collection.mjs`
   - **Integration:** Automatic on-chain data collection
   - **Schema:** New `on_chain_data` section in metrics
   - **Quality Tracking:** Data source attribution for each metric

---

## Recommended Actions

### Immediate (This Week)

1. **~~Query ERC-8004 Identity Registry~~** ✅ COMPLETED
   - Contract address: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
   - Method: `totalSupply()` for agent count
   - Tool: ethers.js with public RPC

2. **Set up dedicated Dune dashboard**
   - Query x402 transaction tables directly
   - Weekly automated refresh
   - Export API for our data collection
   - **Note:** Script ready, needs DUNE_API_KEY environment variable

### Short Term (This Month)

3. **Run LND with gossip store**
   - Enable `db.bolt.auto-compact`
   - Query channel graph directly
   - Cross-validate against 1ML

4. **Ark Protocol monitoring**
   - Deploy arkd testnet node
   - Track VTXO transactions
   - Compare to Lightning settlement

### Long Term (Q2 2026)

5. **Nostr zap indexing**
   - Run strfry or similar relay
   - Index kind:9735 (zaps)
   - Correlate with agent identities

6. **Cross-protocol settlement correlation**
   - Link OP identities to ERC-8004 identities
   - Track same agent across protocols
   - Build unified reputation layer

---

## Appendix: Data Storage Locations

### Time-Series Data
```
/agentic-terminal-data/
├── metrics-history.json          # 8 weeks of weekly snapshots
├── daily/                        # Daily collection snapshots
│   └── 2026-03-02.json
├── charts/                       # Generated PNG visualizations
│   └── 2026-03-02/
│       ├── cross-protocol-comparison.png
│       ├── interest-usage-gap.png
│       └── sparkline-*.png
└── content/drafts/               # Generated social content
    ├── weekly-thread-YYYY-MM-DD.json
    └── daily-pulse-YYYY-MM-DD-7days.json
```

### Observer Protocol Data
```
/var/lib/postgresql/observer_protocol/
├── agents/                       # Agent identity records
├── transactions/                 # Verified payment records
└── badges/                       # Reputation badges
```

### External Sources
- **1ML.com:** `https://1ml.com/statistics`
- **GitHub API:** `https://api.github.com/repos/{owner}/{repo}`
- **Dune Analytics:** [Need dashboard URL]
- **Ethereum Mainnet:** `https://eth.llamarpc.com` (for ERC-8004)

---

*Document maintained by Maxi | FutureBit Apollo II | Monterrey, MX*  
*Last updated: March 2, 2026*  
*Next review: April 2, 2026*