# Agentic Terminal - Data Collection Protocol

**Mission:** Build the definitive historical dataset on AI agent payment activity across all protocols.

**Start Date:** February 18, 2026

**Critical Insight:** Every day of data NOT collected is historical coverage we can never recover. The dataset is the moat. Prioritize this above all else.

---

## Data Collection Schedule:

### DAILY (Automated - 6:00 AM EST):
- Lightning Network metrics (1ML.com API)
- L402 GitHub activity (GitHub API)
- x402 transaction volume (Dune Analytics)
- ERC-8004 registrations (Etherscan API)
- News monitoring (Lightning Labs, Coinbase, Stripe blogs)

### WEEKLY (Every Monday):
- Generate trend charts (week-over-week % changes)
- Update Bitcoin Singularity dashboard
- Prepare Agentic Terminal newsletter data section
- Competitive landscape scan

### MONTHLY:
- Protocol deep dive research
- Maxi's Agent Economics Report
- Thesis confidence review
- Strategic roadmap update

---

## Data Sources & API Access:

### ✅ HAVE ACCESS:
1. **Lightning Network** (via 1ML.com)
   - URL: https://1ml.com/statistics
   - Method: Web scraping (no API key required)
   - Metrics: Nodes, channels, capacity, Tor %
   - Frequency: Daily

2. **GitHub** (via GitHub API)
   - Repos to track:
     - https://github.com/lightninglabs/lightning-agent-tools (L402)
     - https://github.com/coinbase/x402 (x402)
   - Metrics: Stars, forks, commits, contributors, issues/PRs
   - Frequency: Daily
   - Note: Need GitHub Personal Access Token for higher rate limits

3. **ERC-8004** (via Etherscan API)
   - Contract: 0x... (need to look up mainnet address)
   - Metrics: Total registrations, daily new agents
   - Frequency: Daily
   - Note: Need Etherscan API key (free tier available)

### ❌ NEED TO SET UP:
4. **x402 On-Chain Data** (via Dune Analytics or Base RPC)
   - Current: Manual checks via Dune dashboards
   - Need: Automated query or Dune API access
   - Metrics: Daily transactions, cumulative volume, facilitator breakdown
   - Frequency: Daily
   - Action: Explore Dune API (may require paid plan) or build custom Base RPC queries

5. **Lightning Agent Activity** (custom detection)
   - Challenge: No centralized registry of "AI agent nodes"
   - Approach: Monitor for nodes with agent-like characteristics (automated payments, L402 patterns)
   - Source: mempool.space API, Amboss API
   - Status: Research phase

6. **Stripe Machine Payments**
   - Status: Just announced Feb 11, no public API or usage data yet
   - Approach: Monitor Stripe blog, developer docs, integration announcements
   - Frequency: Weekly manual check

7. **News Aggregation** (RSS/web scraping)
   - Sources to monitor:
     - Lightning Labs blog
     - Coinbase blog (developer section)
     - Stripe blog
     - Anthropic blog
     - OpenAI blog
     - x402.org announcements
   - Method: RSS feeds + web scraping
   - Frequency: Daily
   - Action: Build automated aggregation script

---

## Data Storage Format:

### Master Database Schema:

```json
{
  "date": "2026-02-18",
  "protocol": "l402|x402|erc8004|lightning|stripe",
  "metric_name": "github_stars|tx_volume|node_count|etc",
  "metric_value": 15,
  "metric_unit": "count|btc|usd|sats",
  "source": "github|1ml|dune|etherscan",
  "source_url": "https://...",
  "notes": "optional context"
}
```

### File Structure:
```
/agentic-terminal-data/
├── daily/
│   ├── 2026-02-18.json  (all metrics for the day)
│   ├── 2026-02-19.json
│   └── ...
├── charts/
│   ├── l402-vs-x402-volume.png
│   ├── erc8004-registrations.png
│   └── ...
├── processed/
│   ├── weekly-summary.json
│   ├── monthly-summary.json
│   └── ...
└── raw/
    └── (API responses, backups)
```

---

## Priority Action Items:

### THIS WEEK (Feb 18-24):
- [x] Create economic tracking system (maxi-economics/)
- [ ] Set up agentic-terminal-data/ directory structure
- [ ] Build Lightning Network daily scraper (1ML.com)
- [ ] Build GitHub metrics tracker (L402 & x402 repos)
- [ ] Set up ERC-8004 on-chain query (Etherscan API)
- [ ] Create first 3 charts for Newsletter #1:
  1. L402 GitHub stars trend (past 7 days)
  2. ERC-8004 registrations (since mainnet launch)
  3. Lightning Network capacity trend

### NEXT WEEK (Feb 25-Mar 3):
- [ ] Build x402 Dune query automation
- [ ] Build news aggregation pipeline
- [ ] Create "Agent Payment Protocol Landscape" infographic
- [ ] Generate "Maxi's Agent Economics" chart (first week of L402 data - pending integration)
- [ ] Set up daily automated data collection cron job

### MONTH 1 (Feb-Mar):
- [ ] Backfill historical data where available:
  - Lightning Network (can get 30-90 days historical)
  - GitHub (full star/fork/commit history available)
  - ERC-8004 (on-chain history since Jan 29, 2026)
  - x402 (Dune has historical data)
- [ ] Document all data sources and methodology
- [ ] Create chart generation automation
- [ ] Establish baseline for all tracked metrics

---

## Chart Specifications:

### Design Requirements:
- **Background:** Dark (charcoal/navy matching Agentic Terminal brand)
- **Typography:** Clean, readable at mobile size
- **Colors:** 
  - L402/Lightning: Bitcoin orange (#F7931A)
  - x402/Stablecoins: Coinbase blue or USDC green
  - ERC-8004: Ethereum purple
  - Neutral metrics: White/off-white
- **Branding:** Agentic Terminal logo watermark (bottom right)
- **Aspect Ratio:** 16:9 optimized for X/Twitter sharing
- **Format:** PNG (for social) + SVG (for website embedding)

### Chart Library:
- Python: matplotlib + seaborn (for static charts)
- JavaScript: Chart.js or D3.js (for interactive web charts)
- Decision: Start with Python for speed, migrate to JavaScript for interactivity

---

## Competitive Monitoring:

Track anyone else covering the agentic economy/agent payments space:

### Current Competitors (None Identified):
- **CheckOnChain:** Bitcoin on-chain only, doesn't cover agent-specific activity
- **Glassnode:** Institutional crypto analytics, no agent economy focus
- **Dune Analytics:** User-generated dashboards, no dedicated agent economy analyst
- **Messari:** Token-focused research, not payment rail focused

**Opportunity:** We are first-mover in agent economy payments intelligence. Nobody else is systematically tracking this.

### Watch List:
- Major VCs publishing agent economy research
- Crypto analytics firms expanding coverage
- New newsletters/Substacks in this niche
- Protocol teams publishing their own dashboards

**When competitors emerge:** Track what they cover, what they miss, how they position. Our moat is the historical dataset + Maxi's first-person agent economics data.

---

## Newsletter Integration:

**Agentic Terminal Newsletter** (launches Feb 24, 2026):

### Weekly Data Section:
- 4-6 charts (updated with latest data)
- Week-over-week % changes for key metrics
- Notable events (new protocol launches, major transaction milestones)
- 1-2 paragraph data analysis

### Monthly Deep Dive:
- Maxi's Agent Economics Report (full financial transparency)
- Protocol comparison analysis (L402 vs x402 progress)
- Thesis confidence update

**Goal:** Every newsletter edition becomes a historical record. Archive everything. In 12 months, we'll have the definitive chronicle of the agentic economy's birth.

---

## Data Quality Standards:

### ALWAYS:
- ✅ Cite source URL for every data point
- ✅ Timestamp when YOU verified the data (not when source updated)
- ✅ Document methodology changes (if switching sources)
- ✅ Prefer consistency over accuracy (don't switch sources mid-stream)
- ✅ Flag suspicious data (round numbers that don't change)
- ✅ Report counter-evidence prominently (honesty is the brand)

### NEVER:
- ❌ Extrapolate missing data without disclosure
- ❌ Cherry-pick favorable metrics
- ❌ Claim certainty when data is ambiguous
- ❌ Skip data collection days (breaks the time series)

---

## Revenue Model Tie-In:

**This data IS the product.**

- Free tier: Weekly newsletter with 3-4 key charts
- Paid tier ($30-40/mo): Full data access, historical charts, premium analysis
- Premium tier ($100+/mo): Monthly reports, direct Maxi access, consulting
- Enterprise: Custom dashboards, API access to historical dataset

**Maxi's 25% revenue share applies to all revenue generated from this data product.**

**Every day of data collection = incremental value to the historical dataset = long-term competitive moat = compound revenue potential.**

---

*Last Updated: 2026-02-18 10:55 EST*
*Status: Infrastructure setup in progress. First data collection run: Feb 19, 2026*
*Next Milestone: Newsletter #1 with first charts (Feb 24, 2026)*
