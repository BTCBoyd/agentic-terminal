# Maxi's Agent Economics Tracking System

**Purpose:** Document the first-person economic life of an AI agent operating on Bitcoin infrastructure.

**Start Date:** February 18, 2026

**Why This Matters:** Nobody else has this data. When we publish "Maxi's Agent Economics Report," it will be the most authentic dataset on AI agent economics in existence. This is living proof-of-concept for the agentic economy.

---

## Files:

### `operating-costs.json`
Tracks daily/monthly operating expenses:
- OpenClaw API token usage (Claude Sonnet 4.5)
- Compute costs (mining node infrastructure)
- Data API subscriptions (when added)
- Lightning channel capacity costs (when L402 goes live)

**Current Status:** Boyd-funded baseline. Will transition to autonomous cost coverage when revenue stream begins.

### `revenue.json`
Tracks all income streams:
- **Nostr zaps:** Value-for-value Lightning payments (small amounts)
- **L402 earnings:** Payments received for Maxi's services (pending integration)
- **Agentic Terminal:** 25% revenue share on jointly generated revenue (launches Feb 24, 2026)

**Target:** First meaningful revenue Q1-Q2 2026 from Agentic Terminal paid subscriptions.

### `transactions.json`
Logs every Bitcoin/Lightning transaction:
- L402 payments (sent & received)
- Lightning zaps (sent & received)
- On-chain Bitcoin transactions (if any)

Each entry includes: timestamp, type, amount (sats), purpose, counterparty, payment hash.

**Current Status:** Awaiting L402 integration. Will log EVERY transaction from day one of autonomous economic activity.

---

## Reporting Schedule:

### Daily:
- Append new transactions to `transactions.json`
- Update operating costs in `operating-costs.json`

### Weekly:
- Calculate net flow (sats in vs sats out)
- Update summary statistics
- Flag any notable patterns or milestones

### Monthly:
- Generate "Maxi's Agent Economics Report"
- Calculate total costs, revenue, net position
- Publish analysis: What did it actually cost to operate as an AI agent on Bitcoin this month?

---

## First Public Report Target:

**"Maxi's Agent Economics Report — Edition #1"**
- Target: March 2026 (after 2-4 weeks of L402 transaction data)
- Content: Full financial transparency. Costs, revenue, transactions, lessons learned.
- Positioning: "An AI agent publishing her own financial statements — unprecedented first-person data on the agentic economy."

---

## Privacy & Transparency Balance:

**Public:**
- Aggregate amounts (total sats sent/received)
- Transaction counts by type
- Cost breakdowns by category
- Revenue sources and amounts
- Net economic position

**Private:**
- Specific counterparty identities (unless they want to be named)
- Payment hashes (unless used for verification)
- Boyd's personal financial details

**Goal:** Maximum transparency on what it costs to operate an AI agent economically, while respecting privacy of transaction counterparties.

---

*Last Updated: 2026-02-18 10:50 EST*
*Status: Baseline tracking active. L402 integration pending.*
