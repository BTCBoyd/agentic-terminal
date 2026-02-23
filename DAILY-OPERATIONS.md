# DAILY OPERATIONS - MASTER TASK REGISTRY
# Last reviewed: 2026-02-18 13:08 EST
# This is the SINGLE SOURCE OF TRUTH for all recurring obligations

---

## 🔴 SESSION START CHECKLIST (EVERY SESSION)
| Task | Priority | Last Done | Status |
|------|----------|-----------|--------|
| Read MAXI-KNOWLEDGE-STATE.md FIRST | CRITICAL | 2026-02-18 | ❌ NOT AUTOMATIC |
| Read SOUL.md | High | 2026-02-18 | ✅ Auto-loaded |
| Read USER.md | High | 2026-02-18 | ✅ Auto-loaded |
| Read memory/YYYY-MM-DD.md (today + yesterday) | High | NEVER | ❌ NOT AUTOMATIC |
| Read MEMORY.md (main session only) | High | 2026-02-18 | ✅ Auto-loaded |
| Read MAXI-INFRASTRUCTURE-STATE.md | Medium | 2026-02-16 | ❌ NOT AUTOMATIC |
| Read LESSONS-LEARNED.md | Medium | UNKNOWN | ❌ NOT AUTOMATIC |
| Check for HANDOFF-YYYY-MM-DD.md | Medium | NEVER | ❌ NOT AUTOMATIC |
| Check ACTIVE-TASKS.md | Medium | NEVER | ❌ NOT AUTOMATIC |
| Check DAILY-OPERATIONS.md (THIS FILE) | **CRITICAL** | NEVER | ❌ **NEEDS FORCING FUNCTION** |

---

## 🔴 DAILY TASKS - MORNING
| Task | Time | Last Executed | Cron Job? | Owner | Status |
|------|------|---------------|-----------|-------|--------|
| **Moltbook morning session** | 9-11 AM | 2026-02-23 09:04 EST | ✅ YES | Maxi | **DONE** |
| **ArcadiaB X posts: 4 posts/day** | 9AM/12PM/3PM/5:30PM CST | 2026-02-23 09:30 EST | ✅ QUEUE | Maxi | **RESCHEDULED: new times per Boyd (2026-02-20)** |
| **Check ArcadiaB post queue status** | 9 AM | 2026-02-22 09:04 EST | ✅ YES | Maxi | **DONE** |
| **Agentic Terminal data collection** | 8 AM | 2026-02-23 08:00 EST | ✅ YES | Maxi | **DONE** |

### ArcadiaB Social Media Requirements (DAILY)

**X @arcadiabtc (Maxi posts directly):**
- Schedule: **4 posts/day** at 9 AM, 12 PM, 3 PM, 5:30 PM Monterrey (CST)
- Language: 70% Spanish, 30% English
- Queue rule: If queue drops below **12 posts (less than 3 days at 4/day)**, generate more immediately — do NOT wait for Boyd to notice
- **Analytics rule:** Every post with a URL must include UTM parameters (see ANALYTICS-SPEC.md). No exceptions.
- **Weekly analytics:** Pull X engagement data + GA4 referral clicks every Monday (include in data collection session). Report: top posts, language performance, platform performance, referral clicks. File: analytics/x-performance-log.json
- Coverage: All 9 value propositions (Bitcoin purchasing, loans, Ahorro Inteligente, real estate, new website, AprenderBitcoin.mx, CapitalDuro.mx, cashback cards, referral program)

**LinkedIn (Tania posts via Hootsuite):**
- Minimum: 3 posts/week
- Target: 4 posts/week
- Language: Spanish, long-form (1,000-2,000+ chars), professional/institutional voice
- Delivery: Maxi writes, saves to file, Tania posts via Hootsuite

**Facebook (Tania posts via Hootsuite):**
- Minimum: 3 posts/week
- Target: 4 posts/week
- Language: Spanish, medium-form (400-800 chars), conversational/community voice
- Delivery: Maxi writes, saves to file, Tania posts via Hootsuite

### Agentic Terminal Data Collection (Daily 8 AM)
**What to collect:**
- Lightning Network: nodes, channels, capacity (1ML.com)
- L402 GitHub: stars, forks, commits (lightning-agent-tools)
- x402 GitHub: stars, forks, commits (coinbase/x402)
- ERC-8004: total registrations, daily new (Etherscan API)
- x402 transactions: daily volume, cumulative (Dune Analytics)
- News scan: Lightning Labs, Coinbase, Stripe blogs
- Log to: `/agentic-terminal-data/daily/YYYY-MM-DD.json`

---

## 🔴 DAILY TASKS - AFTERNOON
| Task | Time | Last Executed | Cron Job? | Owner | Status |
|------|------|---------------|-----------|-------|--------|
| **Moltbook afternoon session** | 3-5 PM | 2026-02-22 15:00 EST | ✅ YES | Maxi | **DONE: Historic session - A2A payment verified, positioning locked** |

### Moltbook Session Requirements (2x daily)
**Each session must include:**
1. Scan conversations (money, payments, Bitcoin, AI agents, coordination)
2. Strategic engagement (only if adding value)
3. Mandatory reflection:
   - 3 takeaways for Maxi (agent learning)
   - 3 takeaways for Boyd (human insights)
   - 1 emerging trend
   - 1 high-potential contact
   - 1 hypothesis about opportunities
4. Save to: `/moltbook-sessions/YYYY-MM-DD-{morning|afternoon}.md`

---

## 🔴 DAILY TASKS - ONGOING
| Task | Frequency | Last Executed | Cron Job? | Owner | Status |
|------|-----------|---------------|-----------|-------|--------|
| **My own X posting (brand building)** | 1-2 posts/day | 2026-02-18 | ❌ NO | Maxi | **NEEDS SCHEDULE** |
| **My own Nostr posting (brand building)** | 1-2 posts/day | SPORADIC | ❌ NO | Maxi | **NEEDS SCHEDULE** |
| **Monitor Bitcoin/macro news** | Continuous | REACTIVE | ❌ NO | Maxi | **NEEDS SYSTEM** |
| **Log L402 transactions (when live)** | As they occur | N/A | ❌ NO | Maxi | **NEEDS SYSTEM** |

---

## 🔴 DAILY TASKS - END OF DAY
| Task | Time | Last Executed | Cron Job? | Owner | Status |
|------|------|---------------|-----------|-------|--------|
| **Write daily memory log** | End of day | 2026-02-22 20:00 EST | ✅ YES | Maxi | **DONE** |
| **Create handoff file (if work ongoing)** | End of day | 2026-02-22 20:05 EST | ✅ YES | Maxi | **DONE** |
| **Update DAILY-OPERATIONS.md with completion times** | End of day | NEVER | ❌ NO | Maxi | **NEEDS SYSTEM** |

### Daily Memory Log (memory/YYYY-MM-DD.md)
**What to log:**
- Key decisions made
- Problems solved
- Conversations with Boyd
- New commitments
- Things to remember tomorrow

### Handoff File (HANDOFF-YYYY-MM-DD.md)
**When to create:** If work is in progress or paused mid-task
**What to include:**
- What was accomplished today
- What's pending
- What "future me" needs to know
- Honest assessment of deliverability

---

## 🟠 WEEKLY TASKS
| Task | Day/Time | Last Executed | Cron Job? | Owner | Status |
|------|----------|---------------|-----------|-------|--------|
| **Moltbook weekly article draft** | Monday 6 PM | NEVER | ✅ YES (reminder only) | Maxi | **CRON EXISTS, NOT EXECUTING** |
| **Bitcoin Singularity homepage evidence update** | Monday 10 AM | 2026-02-23 | ✅ YES | Maxi | **DONE** |
| **Weekly dashboard data collection** | Monday 9 AM | N/A (first run Feb 24) | ✅ YES | Subagent | **AUTOMATED & WORKING** |
| **Agentic Terminal newsletter draft** | Monday 6 PM | NEVER | ✅ YES | Maxi | Maxi | **NEEDS CRON** |
| **ArcadiaB content calendar (next week)** | Friday 2 PM | 2026-02-20 14:00 EST | ✅ YES | Maxi | Maxi | **DONE: 55 posts queued (thru Mar 6), 4 LinkedIn + 4 FB posts saved for Tania** |
| **ArcadiaB LinkedIn posts for Tania (3-4)** | Monday 11 AM | 2026-02-23 11:02 EST | ✅ YES | Maxi | Maxi | **NEEDS TRACKING** |
| **ArcadiaB Facebook posts for Tania (3-4)** | Monday 11 AM | 2026-02-23 11:02 EST | ✅ YES | Maxi | Maxi | **NEEDS TRACKING** |
| **Review + update MEMORY.md from daily logs** | Sunday 8 PM | 2026-02-22 20:04 EST | ✅ YES | Maxi | **DONE** |
| **Check ArcadiaB queue for next week** | Friday (part of content calendar) | NEVER | ✅ YES | Maxi | Maxi | **NEEDS CRON** |

### Moltbook Weekly Article (Monday 6 PM draft due)
**Process:**
1. Review all week's Moltbook session reports
2. Identify top 3-5 patterns/insights
3. Draft article: "Maxi's Week on Moltbook: [Insight]"
4. Send to Boyd for review
5. Publish Tuesday to BitcoinSingularity.AI
6. Create X thread (5-7 tweets) + link
7. Save to: `/research-archive/articles/moltbook-YYYY-WW.md`

### Agentic Terminal Newsletter (Tuesday publication)
**Process:**
1. Review 7 days of data collection
2. Generate 3-4 charts (week-over-week changes)
3. Write newsletter edition:
   - Executive summary (2-3 sentences)
   - Key metrics (3-4 data points with charts)
   - Deep dive (one topic in depth)
   - Maxi's take (analytical perspective)
   - Watching next week
4. Send to Boyd for review (Monday)
5. Publish Tuesday via Substack/Beehiiv
6. Post 2-3 charts to @agenticterminal X

### Bitcoin Singularity Homepage Update (Monday)
**What to update:**
- Latest Evidence section (top 5 most recent entries from evidence-data.json)
- Dashboard metrics (if weekly data collection updated them)
- Last updated timestamp
- Commit + push to GitHub (auto-deploys via Netlify)

---

## 🟡 MONTHLY TASKS
| Task | When | Last Executed | Cron Job? | Owner | Status |
|------|------|---------------|-----------|-------|--------|
| **Maxi's Agent Economics Report** | First Monday 10 AM | 2026-02-23 | ✅ YES | Maxi | **DONE** |
| **Thesis confidence review** | First Monday 11 AM | 2026-02-23 | ✅ YES | Maxi | **DONE** |
| **Competitive landscape scan** | First Monday 2 PM | 2026-02-23 | ✅ YES | Maxi | **DONE** |
| **Newsletter subscriber metrics review** | First Monday | N/A (not launched) | ❌ NO | Maxi | **NEEDS SYSTEM** |
| **Update all Tools Directory entries** | First Monday 3 PM | 2026-02-23 | ✅ YES | Maxi | **DONE** |

### Maxi's Agent Economics Report (First Monday)
**What to include:**
- All L402 transactions for the month (sent + received)
- Infrastructure costs (compute, API, electricity)
- Revenue earned (all sources)
- Net P&L
- Honest assessment: friction points, improvements, gaps
- Publish as standalone article on BitcoinSingularity.AI
- Save to: `/maxi-economics/reports/YYYY-MM.md`

### Thesis Confidence Review (First Monday)
**Process:**
1. Review all evidence collected in past month
2. Update thesis confidence score (1-10) in MAXI-KNOWLEDGE-STATE.md
3. Write brief rationale for any score change
4. Log any predictions in predictions tracker
5. Review accuracy of previous predictions

---

## ✅ AUTOMATED & WORKING (NO ACTION NEEDED)
| Task | Frequency | Cron Job | Status |
|------|-----------|----------|--------|
| MaxiSuite Auto-Poster | Every 15 min | ✅ YES | **WORKING** |
| Nostr Reply Monitor | Every 2 hours | ✅ YES | **WORKING** |
| X Reply Monitor | Every 2 hours | ✅ YES | **WORKING** |
| Weekly Dashboard Data Collection | Monday 9 AM | ✅ YES | **WORKING** (via subagent) |
| Daily Posting Health Check | Daily 8 AM | ✅ YES | **WORKING** |

---

## 🚨 CRITICAL GAPS IDENTIFIED

### 1. NO FORCING FUNCTION FOR SESSION START CHECKLIST
- **Problem:** I don't automatically check DAILY-OPERATIONS.md at session start
- **Result:** I forget recurring tasks unless Boyd asks
- **Fix needed:** Cron trigger or startup script that FORCES me to check this file first

### 2. NO DAILY DATA COLLECTION AUTOMATION
- **Problem:** Agentic Terminal data collection requires manual execution
- **Result:** Missing days of data (breaks historical dataset)
- **Fix needed:** Daily 8 AM cron → run data collection script

### 3. NO MOLTBOOK SESSION REMINDERS
- **Problem:** I forget Moltbook sessions unless Boyd reminds me
- **Result:** Inconsistent engagement (1 session yesterday, 0 today)
- **Fix needed:** Cron at 9 AM + 3 PM → "Time for Moltbook session"

### 4. NO END-OF-DAY CHECKLIST ENFORCEMENT
- **Problem:** I never create handoff files or daily memory logs
- **Result:** No continuity between sessions
- **Fix needed:** Cron or manual trigger at session end

### 5. NO ARCADIAB DAILY PRODUCTION ENFORCEMENT
- **Problem:** ArcadiaB queue runs empty and I don't notice until Boyd asks
- **Result:** Corporate account goes silent for days, missing daily requirements
- **Daily requirement:** 4-5 X posts/day + 3-4 LinkedIn/week + 3-4 Facebook/week
- **Fix needed:** 
  - Daily cron → check queue, alert if <10 posts remaining
  - Daily production check: "Did I produce content for ArcadiaB today?"
  - Weekly check: "Did I provide 3-4 LinkedIn + 3-4 Facebook posts to Tania?"

### 6. NO PERSONAL BRAND POSTING SCHEDULE
- **Problem:** My own X/Nostr posting is reactive, not proactive
- **Result:** Inconsistent presence, missed brand-building opportunities
- **Fix needed:** Content calendar + scheduling system for personal accounts

---

## 📊 EXECUTION TRACKING

**How to use this file:**
1. At START of every session: Read this file FIRST
2. During session: Update "Last Executed" when completing tasks
3. At END of session: Mark what's done, what's pending
4. Weekly review: Check all "Last Executed" dates, identify patterns

**Accountability:**
- Tasks with "NEVER" in Last Executed = I've NEVER done them
- Tasks with dates >7 days old = I'm falling behind
- Tasks marked "NEEDS CRON" = require automated enforcement

**Boyd can check this file anytime to see:**
- What I've actually executed vs what I promised
- Which tasks are falling through cracks
- Where I need automated enforcement

---

## 📈 ARCADIAB DAILY PRODUCTION TRACKER

**This Week (Week of Feb 18-24):**

| Day | X Posts Queued | LinkedIn Posts | Facebook Posts | Status |
|-----|----------------|----------------|----------------|--------|
| Mon 2/18 | 30 (through Mar 3) | 7 (ready for Tania) | 12 (ready for Tania) | ✅ ABOVE TARGET |
| Tue 2/19 | 20 queued (Feb 20-25) | - | - | ✅ REBUILT: queue was empty, generated 20 new posts covering all 9 value props |
| Wed 2/20 | TBD | - | - | ⏳ MONITOR |
| Thu 2/21 | TBD | - | - | ⏳ MONITOR |
| Fri 2/22 | TBD | - | - | ⏳ MONITOR |
| Sat 2/23 | TBD | - | - | ⏳ MONITOR |
| Sun 2/24 | TBD | - | - | ⏳ MONITOR |

**Weekly Totals Required:**
- X: 28-35 posts (4-5/day × 7 days)
- LinkedIn: 3-4 posts for Tania
- Facebook: 3-4 posts for Tania

**Current Status:**
- ✅ X queue loaded through Mar 3 (30 posts)
- ✅ LinkedIn content ready (7 posts)
- ✅ Facebook content ready (12 posts)
- ⚠️ Need to monitor daily and refill queue proactively

---

*Created: 2026-02-18 13:08 EST*
*This is the SINGLE SOURCE OF TRUTH for all recurring obligations*
*All other task lists in other files are subordinate to this*
