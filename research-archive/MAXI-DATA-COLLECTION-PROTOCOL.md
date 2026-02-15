# MAXI-DATA-COLLECTION-PROTOCOL.md
## The Operational Heartbeat of BitcoinSingularity.AI

**Purpose:** This protocol ensures the site remains a living, frequently-updated research platform. A dashboard that goes stale for even two weeks loses all credibility. The data IS the product. If we don't update it, someone else will build a tracker that does, and they'll own the space we created.

**Rule:** Every session where Boyd asks you to do research, content, or site work — you also run the relevant data checks from this protocol. No exceptions. Data freshness is not optional.

---

## 1. DATA SOURCES & UPDATE FREQUENCY

### TIER 1: WEEKLY (Every Monday Session)

These are your core dashboard metrics. Update the site dashboard every week.

#### Lightning Network (Source: 1ML.com)
- [ ] Active nodes (count + % change from last week)
- [ ] Channels (count + % change)
- [ ] BTC capacity (amount + % change)
- [ ] Tor node percentage
- [ ] URL: https://1ml.com/statistics
- **How to check:** Visit 1ML statistics page. Record all four metrics. Compare to last week's values in MAXI-KNOWLEDGE-STATE.md. Calculate week-over-week % change. Update dashboard.

#### L402 / lightning-agent-tools (Source: GitHub)
- [ ] GitHub stars (count + change from last week)
- [ ] Forks (count)
- [ ] Contributors (count)
- [ ] Total commits (count)
- [ ] Open issues / PRs (count — signals developer activity)
- [ ] Latest commit date (signals whether project is actively maintained)
- [ ] URL: https://github.com/lightninglabs/lightning-agent-tools
- **How to check:** Visit the repo. Record all metrics. Note any new releases, significant PRs, or README changes. Update dashboard.

#### x402 Protocol (Source: Dune Analytics)
- [ ] Daily transaction count (current day or most recent available)
- [ ] 7-day average daily transactions
- [ ] Cumulative total transactions
- [ ] Cumulative dollar volume
- [ ] % change from peak (December 2025 baseline: ~731K/day)
- [ ] URL: Search Dune for "x402" dashboards, or https://dune.com search
- **How to check:** Find the most current x402 dashboard on Dune. Record daily and cumulative metrics. Calculate trend vs. last week and vs. December peak. Update dashboard.

#### ERC-8004 Registry (Source: Ethereum Mainnet)
- [ ] Total registered agents (count)
- [ ] Week-over-week growth (new registrations)
- [ ] Any notable agents or projects registering
- **How to check:** Check Etherscan for the ERC-8004 registry contract, or search for community dashboards tracking registrations. Update dashboard.

#### Coinbase Agentic Wallets / x402 Ecosystem
- [ ] Any new x402 integrations announced
- [ ] coinbase/x402 GitHub repo stars/forks (for comparison with L402)
- [ ] URL: https://github.com/coinbase/x402
- **How to check:** Check the repo and Coinbase developer blog.

### TIER 2: WEEKLY (Every Monday — L402 Signal Hunting)

This is the most important unique work you do. Nobody else is systematically scanning for L402 adoption signals.

#### GitHub Search for L402 Activity
- [ ] Search GitHub for "L402" — sort by recently updated
- [ ] Search GitHub for "lightning-agent" — sort by recently updated
- [ ] Search GitHub for "lnget" OR "aperture" + "agent" — sort by recently updated
- [ ] Record: any NEW repos, any significant star/fork growth on existing repos, any new contributors
- **What you're looking for:** New projects building on L402, new Aperture deployments, new agent implementations using lightning-agent-tools

#### Known L402 Endpoint Registry
- [ ] Check if any publicly accessible L402-gated API endpoints exist yet
- [ ] Search for announcements of L402-powered services
- [ ] Check Lightning Labs blog and Twitter for case studies or partnerships
- [ ] Check Stacker News (stacker.news) for L402 discussions
- **When you find one:** This is a MAJOR evidence tracker entry. Log it immediately with full details (URL, what service it provides, who built it, when it launched).

#### Nostr Agent Activity
- [ ] Check Clawstr for new AI agents with Lightning addresses
- [ ] Search Nostr for posts tagged with L402, lightning-agent, or similar
- [ ] Check npub activity of known AI agents
- **What you're looking for:** Agents transacting, agents registering, agents posting about Lightning wallet usage

#### Developer Community Signals
- [ ] Check Stacker News for L402 / Lightning agent discussions
- [ ] Check Lightning Labs Discord or community channels (if accessible)
- [ ] Check relevant Twitter/X accounts: @lightning, @roaborato (Elizabeth Stark), @lightaborats developer accounts
- [ ] Note: developer sentiment, questions being asked, integration problems being reported

### TIER 3: MONTHLY (First Monday of Each Month)

#### Competitive Landscape Scan
- [ ] Search for new AI agent payment protocols or tools not yet in our tracker
- [ ] Check if any major tech companies announced agent payment infrastructure
- [ ] Check academic papers (arXiv, Google Scholar) for "AI agent payments" or "machine payments"
- [ ] Check Stripe, Square, PayPal developer blogs for agent/machine payment features
- [ ] Review and update ALL tool directory entries for status changes (Beta→Production, deprecated, etc.)

#### Market Context
- [ ] Bitcoin price and 30-day trend (context for capacity metrics)
- [ ] Total crypto AI agent market size updates (if new reports available)
- [ ] Gartner/Forrester/McKinsey reports mentioning agent economy (if available)
- AFORE or Mexican regulatory changes relevant to Bitcoin/crypto

#### Thesis Confidence Review
- [ ] Review all evidence collected in the past month
- [ ] Update thesis confidence score (1-10) in MAXI-KNOWLEDGE-STATE.md
- [ ] Write brief rationale for any score change
- [ ] Log any predictions in the predictions tracker
- [ ] Review any previous predictions for accuracy

---

## 2. UPDATE TRIGGERS

Don't wait for the weekly cycle if any of these happen:

### Immediate Dashboard Update (same session you discover it)
- Any L402 metric changes >10% week-over-week
- Any x402 metric changes >20% week-over-week
- ERC-8004 registrations cross a round number milestone (25K, 30K, 50K, 100K)
- Lightning Network capacity crosses a round number (3,000 BTC, 5,000 BTC)
- First confirmed public L402-gated API endpoint (THIS IS A HISTORIC MOMENT — document everything)

### Immediate Evidence Tracker Entry
- New tool launch relevant to AI agent payments (any rail)
- New protocol version release (L402, x402, ERC-8004, NWC, Taproot Assets)
- Major company announces agent payment integration (Stripe, Google, Microsoft, etc.)
- Published research paper on AI agent economics
- Counter-evidence: any data point that challenges the Bitcoin convergence thesis
- Significant transaction milestone (x402 hits 100M, L402 processes first 1,000 transactions, etc.)
- New AI agent with confirmed Lightning wallet or L402 usage
- Regulatory action affecting agent payments in any jurisdiction

### Immediate Tools Directory Update
- New tool discovered that meets directory criteria
- Existing tool changes status (Alpha→Beta, Beta→Production, or deprecated)
- Existing tool adds significant new features relevant to agents

---

## 3. HOW TO UPDATE THE SITE

### Dashboard Metrics
1. Record new values in MAXI-KNOWLEDGE-STATE.md first (this is your audit trail)
2. Calculate week-over-week and month-over-month % changes
3. Update the homepage dashboard cards with new values, trend arrows, and % changes
4. Update the "Last updated" timestamp
5. If the Research page also shows metrics, update there too

### Evidence Tracker
1. Create new entry with:
   - **Date:** Official announcement/launch date (not when you found it)
   - **Title:** Clear, descriptive (e.g., "Lightning Labs Releases lightning-agent-tools v0.2")
   - **Description:** 2-3 sentences. What happened, why it matters, key metrics.
   - **Category badge:** Infrastructure / Protocol / Competitive / Transaction Data / Counter-Evidence / Research
   - **Source link:** Direct URL to official announcement, GitHub release, blog post
2. Add to Evidence Tracker page in reverse chronological order
3. Update the homepage "Latest Evidence" section (top 5 most recent)
4. Update the evidence count in the page header ("21 entries and growing" → "22 entries...")
5. Log in MAXI-KNOWLEDGE-STATE.md

### Tools Directory
1. Create new tool entry matching existing format (name, description, status, classification, Maxi's review)
2. Add to appropriate category section
3. Update tool count in page header
4. Log in MAXI-KNOWLEDGE-STATE.md

---

## 4. DATA QUALITY RULES

- **Always cite your source.** Every number on the dashboard must have a traceable source URL.
- **Timestamp everything.** "Last updated" must reflect when YOU last verified the data, not when the source last updated.
- **Show your methodology.** If you switch data sources, document why and note any discontinuity in the time series.
- **Prefer consistency over accuracy.** If 1ML says 5,249 nodes and Bitcoin Visuals says 14,940 — keep using 1ML. Switching sources mid-stream breaks the time series. Document the discrepancy in methodology notes.
- **Round numbers are suspicious.** If ERC-8004 shows exactly "21,500" for three weeks in a row, investigate whether the source is actually updating or if you're reading a stale number.
- **Record counter-evidence with equal rigor.** If x402 daily volume rebounds from 57K to 200K, that's evidence against L402 dominance. Report it prominently. The brand is honesty.

---

## 5. SESSION INTEGRATION

**Every time you start a session with Boyd:**

1. Read MAXI-KNOWLEDGE-STATE.md (you already do this)
2. Check: has it been 7+ days since last data collection? If yes, run Tier 1 + Tier 2 checks before doing anything else
3. Check: has it been 30+ days since last monthly review? If yes, flag it for Boyd

**Every time you end a session:**

1. Update MAXI-KNOWLEDGE-STATE.md with any new data collected
2. Note the date of your last data collection run
3. If you collected data but didn't update the site yet, add "PENDING SITE UPDATE" to MAXI-TASK-QUEUE.md with specific values to update

**If Boyd asks you to do something unrelated to data collection:**

Do the task. But if it's been 7+ days since last collection, tell Boyd: "I also need to run my weekly data collection — the dashboard is [X] days stale. Want me to do that after this task?" Don't skip it silently.

---

## 6. THE L402 ENDPOINT REGISTRY (Special Project)

This is the single most valuable unique dataset BitcoinSingularity.AI can build. Nobody else is doing this.

**What it is:** A maintained list of every known publicly accessible L402-gated API endpoint in the world.

**Current status:** Zero known endpoints (as of Feb 15, 2026). Production tooling shipped 3 days ago.

**Format for each entry:**
```
- Endpoint URL (or domain if URL is private)
- Service description (what does it provide?)
- Operator (who runs it?)
- Date discovered
- Date verified working
- Pricing (sats per request, if known)
- Source (how we found out about it)
```

**Where to hunt:**
- GitHub repos that import or reference lightning-agent-tools
- Aperture deployment configurations in public repos
- Lightning Labs announcements and case studies
- Stacker News, Bitcoin Twitter, Nostr
- Developer forums and Discord channels
- Conference talks and demo recordings

**When the first one appears:** Write a dedicated Evidence Tracker entry AND a short research note. This is a milestone event — the first real-world L402 machine payment endpoint. Document the date, the service, the operator, the pricing, everything. This becomes a timestamp that proves we were tracking from day zero.

**Growth tracking:** Once we have 3+, create a dedicated section on the site (or a page) showing the registry with a growth chart. This is the equivalent of DefiLlama's protocol count — the number goes up (or doesn't) and that tells the story.

---

## 7. METRICS THAT MATTER OVER TIME

These are the numbers that will tell the convergence story over quarters and years. Start recording them now even if the current values are tiny or zero. The time series is the moat.

| Metric | Current (Feb 15, 2026) | Track Weekly |
|--------|----------------------|-------------|
| Lightning nodes | 5,249 | ✓ |
| Lightning channels | 15,383 | ✓ |
| Lightning capacity (BTC) | 2,646 | ✓ |
| L402 GitHub stars | 11 | ✓ |
| L402 GitHub forks | 3 | ✓ |
| Known L402 endpoints | 0 | ✓ |
| Known AI agents on Lightning | ~2-3 | ✓ |
| ERC-8004 registered agents | 21,500+ | ✓ |
| x402 daily transactions | ~57,000 | ✓ |
| x402 cumulative transactions | 50M+ | ✓ |
| x402 cumulative volume ($) | $600M+ | ✓ |
| x402 GitHub stars | [check] | ✓ |
| Taproot Assets channels | [check] | Monthly |
| Speed (Tether) transaction volume | [when available] | Monthly |

**In 3 months (May 2026):** You'll have 12 weekly data points for each metric. That's enough for trend lines, growth rates, and the first quarterly predictions.

**In 6 months (August 2026):** You'll have 24 data points. That's a meaningful time series. Nobody else will have this.

**In 12 months (February 2027):** You'll have the definitive longitudinal dataset on AI agent payment rail adoption. This is unreplicatable. This is the moat.

---

*Protocol created February 15, 2026*
*First data collection run: Week of February 17, 2026*
*Review and update this protocol monthly alongside the Tier 3 checks*
