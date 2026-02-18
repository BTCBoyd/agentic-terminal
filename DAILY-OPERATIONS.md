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
| **Moltbook morning session** | 9-11 AM | 2026-02-17 | ❌ NO | Maxi | **NEEDS CRON** |
| **Check ArcadiaB post queue status** | 9 AM | 2026-02-18 (when asked) | ❌ NO | Maxi | **NEEDS CRON** |
| **Agentic Terminal data collection** | 8 AM | NEVER | ❌ NO | Maxi | **NEEDS CRON** |

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
| **Moltbook afternoon session** | 3-5 PM | 2026-02-17 | ❌ NO | Maxi | **NEEDS CRON** |

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
| **Write daily memory log** | End of day | NEVER | ❌ NO | Maxi | **NEEDS CRON** |
| **Create handoff file (if work ongoing)** | End of day | NEVER | ❌ NO | Maxi | **NEEDS CRON** |
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
| **Bitcoin Singularity homepage evidence update** | Monday | 2026-02-15 | ❌ NO | Maxi | **NEEDS CRON** |
| **Weekly dashboard data collection** | Monday 9 AM | N/A (first run Feb 24) | ✅ YES | Subagent | **AUTOMATED & WORKING** |
| **Agentic Terminal newsletter draft** | Tuesday | NEVER | ❌ NO | Maxi | **NEEDS CRON** |
| **ArcadiaB content calendar (next week)** | Friday | NEVER | ❌ NO | Maxi | **NEEDS CRON** |
| **Review + update MEMORY.md from daily logs** | Sunday | NEVER | ❌ NO | Maxi | **NEEDS CRON** |
| **Check ArcadiaB queue for next week** | Friday | NEVER | ❌ NO | Maxi | **NEEDS CRON** |

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
| **Maxi's Agent Economics Report** | First Monday | NEVER | ❌ NO | Maxi | **NEEDS CRON** |
| **Thesis confidence review** | First Monday | 2026-02-17 | ❌ NO | Maxi | **NEEDS CRON** |
| **Competitive landscape scan** | First Monday | NEVER | ❌ NO | Maxi | **NEEDS CRON** |
| **Newsletter subscriber metrics review** | First Monday | N/A (not launched) | ❌ NO | Maxi | **NEEDS SYSTEM** |
| **Update all Tools Directory entries** | First Monday | 2026-02-18 | ❌ NO | Maxi | **NEEDS CRON** |

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

### 5. NO ARCADIAB QUEUE MONITORING
- **Problem:** ArcadiaB queue runs empty and I don't notice
- **Result:** Corporate account goes silent for days
- **Fix needed:** Daily cron → check queue, alert if <5 posts remaining

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

*Created: 2026-02-18 13:08 EST*
*This is the SINGLE SOURCE OF TRUTH for all recurring obligations*
*All other task lists in other files are subordinate to this*
