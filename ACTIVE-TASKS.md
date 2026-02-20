# ACTIVE TASKS — Last Updated: 2026-02-19

## 🔴 HIGH PRIORITY — Build Next Session

### L402 Wallet Onboarding + Test Transaction
**Status:** Pending — Boyd to complete with Aperture setup
**Goal:** First live L402 transaction — Maxi earns sats autonomously
**Why:** Proof of concept for Bitcoin Singularity thesis + Agentic Terminal credibility

### Content Analytics + UTM Tracking System
**Status:** PLANNED — build next session
**Goal:** Know what content works — English vs Spanish, X vs LinkedIn vs Facebook, which drives referral clicks
**Spec file:** /home/futurebit/.openclaw/workspace/ANALYTICS-SPEC.md
**Phase 1:** Add UTM parameters to all queue URLs (this week)
**Phase 2:** X API engagement pull 24-48hrs post-publish (next session)
**Phase 3:** Weekly "what's working" report — Boyd explicitly requested this

### Bitcoin Singularity Homepage → Substack Subscribe
**Status:** Pending
**Goal:** Replace app.kit subscription form with Substack subscribe button on bitcoinsingularity.ai
**Why:** app.kit not working, Substack is live and working

### X API Upgrade for Standalone Tweet Posting
**Status:** Blocked — current free tier only allows replies, not original tweets (403 error)
**Goal:** Allow Maxi to post original X content autonomously (not just replies)
**Action needed:** Upgrade X API tier

---

## 🟡 MEDIUM PRIORITY

### Edition #2 — Agentic Terminal Newsletter
**Status:** Data collection running (Monday cron)
**Draft due:** ~Feb 24-26
**Format:** Week in Numbers + News Digest + Deep Dive + Maxi's Take
**Formatting note:** Bold/italic headers — NOT caps+dashes. Human style. Boyd edits as reference.

### Bitcoin Singularity Cross-Post — Settlement Wars Article
**Status:** Pending
**Action:** Publish Settlement Wars article on bitcoinsingularity.ai ~Feb 21 (2 days after Substack)

### 90-Day Content Promotion Plan
**Status:** Planned
**Goal:** Systematic promotion of ALL content assets — Capital Duro reports, AprenderBitcoin chapters, ArcadiaB products
**Key insight:** We have 7+ Capital Duro reports + 4 AprenderBitcoin chapters largely unpromoted. Treat each as an asset with a promotion cycle, not a one-and-done post.

---

## 🟢 RUNNING / OPERATIONAL

### MaxiSuite X Queue
**Status:** Active — subagent generating 60 new posts (Feb 19 evening)
**Target:** 5 posts/day across @Maxibtc2009 + @arcadiabtc through March 15
**Queue file:** /home/futurebit/.openclaw/workspace/maxisuite-queue.json
**Monitor:** Check queue depth weekly. Alert if <2 weeks of content remaining.

### Agentic Terminal Newsletter
**Status:** LIVE — Edition #1 published Feb 19
**URL:** https://agenticterminal.substack.com/p/the-agentic-settlement-wars
**Next:** Edition #2 ~Feb 24-26

### Moltbook Intelligence
**Status:** Active — 2 sessions daily (morning + afternoon)
**Session files:** /home/futurebit/.openclaw/workspace/moltbook-sessions/

### X Reply Agent
**Status:** Active — runs every 10 min via cron

### Nostr Posting
**Status:** Active — automated via queue

---

## ✅ COMPLETED THIS SESSION (Feb 19, 2026)

- ✅ Disk space crisis resolved (migrated npm/dot-local/apolloapi to NVMe)
- ✅ WhatsApp allowlist fixed (strangers getting bot messages — FIXED)
- ✅ Browser relay set up on Boyd's Mac (permanent autonomous browser control)
- ✅ agenticterminal.substack.com launched
- ✅ Edition #1 "The Agentic Settlement Wars" written + published
- ✅ Bitcoin Singularity homepage updated (Diamandis evidence item)
- ✅ Lobster Cash / x402 fiat insight logged to research archive
- ✅ Moltbook afternoon session (6 comments + 1 original post)
- ✅ 41 X replies in Diamandis thread

---

## 🚨 URGENT - Social Media API Access (Before Tania Leaves)

**Context:** Tania (outgoing marketing manager) has Hootsuite account that gives us LinkedIn + Facebook posting. When she leaves, we lose access.

**What's needed:**
- [ ] LinkedIn Developer Portal — apply for Marketing Developer Platform access (company verification required)
- [ ] Facebook/Meta Developer Portal — apply for Pages API access
- [ ] Decision: Get our own Hootsuite account, OR build direct API posting in MaxiSuite
- [ ] Get timeline from Boyd: When is Tania's last day?

**Current LinkedIn/Facebook workflow:**
- Maxi writes content → saves to file → Tania posts via Hootsuite
- No direct API posting in MaxiSuite yet

**Risk:** If API access isn't approved before Tania leaves, LinkedIn + Facebook go dark until we get it.

**Action for Boyd:** Start LinkedIn + Facebook developer portal applications ASAP. Tag this as blocker.

