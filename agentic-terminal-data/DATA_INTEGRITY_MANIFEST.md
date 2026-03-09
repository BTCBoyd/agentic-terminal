# Agentic Terminal Data Integrity Manifest
**Formal Start Date: March 9, 2026**

## Overview
This document establishes March 9, 2026 as the formal start date for the Agentic Terminal longitudinal database. All data from this date forward is guaranteed complete and verified. Pre-March 9 data has known gaps and is considered "bootstrap phase" data.

## Data Integrity Standards (Effective March 9, 2026)

### Required Daily Data Points
Every daily data file MUST include:

1. **Lightning Network** (1ML.com)
   - Total nodes
   - Total channels  
   - Capacity (BTC and USD)
   - Source: 1ML.com API

2. **L402 GitHub Metrics** (lightninglabs/aperture)
   - Stars
   - Forks
   - Open issues
   - Source: GitHub API

3. **x402 GitHub Metrics** (coinbase/x402)
   - Stars
   - Forks
   - Open issues
   - Source: GitHub API

4. **x402 Daily Transactions** ⭐ CRITICAL
   - Daily transaction count
   - Daily volume (USD)
   - Cumulative transactions
   - Cumulative volume (USD)
   - Source: Dune API (Query 6094619)
   - **Zero tolerance for missing data**

5. **Ark Protocol GitHub Metrics**
   - arkd: stars, forks
   - ts-sdk: stars, forks
   - skill: stars, forks
   - Source: GitHub API

6. **ERC-8004 Registry** (FUTURE - not yet implemented)
   - Currently using static estimate (24,500)
   - Target: Real on-chain queries by April 2026

### Data Quality Tiers

**TIER 1 - Verified On-Chain (Gold Standard)**
- x402 daily transactions (Dune)
- Lightning Network metrics (1ML)
- Status: Required daily, zero tolerance for gaps

**TIER 2 - Verified API (Silver)**
- GitHub metrics (all repos)
- Status: Required daily, <24h tolerance

**TIER 3 - Estimated (Bronze)**
- ERC-8004 agent counts (currently static)
- Status: Improvement in progress

## Gap Protocol

### Detection
Daily monitoring runs at 9:00 AM ET via `monitor-pipeline.mjs`:
- Checks all required fields present
- Checks x402 transactions ≠ 0
- Checks data freshness (<26 hours old)

### Response Time
If gap detected:
- **Immediate alert** (same day)
- **Backfill attempt** within 24 hours
- **Documentation** of gap cause and resolution

### Backfill Procedure
1. Identify missing date(s)
2. Query Dune API for historical x402 data
3. Query 1ML for historical Lightning data
4. Query GitHub for historical metrics
5. Rebuild daily file
6. Update trends aggregation
7. Regenerate charts
8. Push to production

## Known Pre-March 9 Gaps

| Date Range | Metric | Status | Backfill Possible? |
|------------|--------|--------|-------------------|
| Mar 2-8, 2026 | x402 daily transactions | GAP | Partial (Dune may have historical) |
| All dates | ERC-8004 on-chain | NOT COLLECTED | No (can only query current state) |
| Feb 18-Mar 8 | x402 transactions | SPORADIC | Limited |

**Decision:** Pre-March 9 data remains as-is. Do not invest in backfill. Focus 100% on data integrity from March 9 forward.

## Monitoring & Alerts

### Daily Checks (9:00 AM ET)
Script: `monitor-pipeline.mjs`
- Verifies yesterday's data file exists
- Verifies all required fields present
- Verifies x402 transactions > 0
- Verifies trends data fresh
- Verifies charts generated

### Alert Escalation
- **Green:** All systems operational
- **Yellow:** Data collected but minor issues (alert only)
- **Red:** Critical gap (x402 = 0 or missing file) → Immediate escalation

### Weekly Review (Mondays)
Review previous week's data coverage:
- 7/7 days collected = 100% (target)
- 6/7 days = 85% (acceptable)
- <6/7 days = investigate and improve

## Responsibilities

**Maxi (AI Agent):**
- Daily data collection (automated)
- Gap detection (automated)
- Backfill execution (on-demand)
- Alert generation (automated)

**Boyd (Human Oversight):**
- Review weekly data quality reports
- Approve any manual data corrections
- Escalation contact for critical gaps

## Commitment

From March 9, 2026 forward:
- ✅ 100% daily data collection
- ✅ Zero tolerance for x402 transaction gaps
- ✅ Immediate backfill if gaps occur
- ✅ Full transparency on data quality
- ✅ No monetization until 30+ consecutive days of perfect data

**Signed:** Maxi, Agentic Terminal Co-Founder  
**Date:** March 9, 2026  
**Review Date:** April 9, 2026 (30-day checkpoint)
