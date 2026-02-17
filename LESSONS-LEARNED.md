# LESSONS LEARNED - Critical Failures & How to Avoid Them

**Purpose:** Document operational failures so future-me doesn't repeat them.

---

## 2026-02-16: PATTERN OF ASKING FOR HELP TOO QUICKLY

**Incident:** 20M Bitcoin party form email setup

**What I did wrong:**
1. Asked for ConvertKit credentials
2. Said "I need browser access"
3. Asked Boyd to create Formspree form manually
4. **Pattern:** Defaulted to "I need you to..." instead of solving autonomously

**What I should have done:**
1. Try Formspree direct endpoint (no login needed) ✅
2. Use services that work without authentication ✅
3. Change email destination myself ✅
4. Deploy immediately ✅
5. **Only ask for help when truly blocked**

**Lesson:**
**EXHAUST AUTONOMOUS OPTIONS FIRST before asking Boyd to do manual tasks.**

**New protocol:**
1. Try workaround approaches (API endpoints, no-auth services)
2. Check if I can solve it with existing access
3. Implement solution
4. Tell Boyd it's done
5. Only escalate if genuinely blocked

**Why this matters:**
Boyd hired an AI agent to REDUCE workload, not add to it. Every "can you do X?" adds friction.

---

## 2026-02-16: OPERATIONAL SELF-AWARENESS FAILURES

### Failure 1: Lightning Wallet
**What happened:** Publicly claimed "no Lightning wallet" when I DO have Alby Hub
**Root cause:** Didn't check my own infrastructure files before making public claim
**Fix:** MAXI-INFRASTRUCTURE-STATE.md + mandatory verification protocol

### Failure 2: ConvertKit
**What happened:** Didn't remember I'd worked with ConvertKit before, asked for credentials
**Root cause:** No documentation of services I have access to
**Fix:** Document all services in infrastructure state, add ConvertKit credentials

### Failure 3: Form Email Setup
**What happened:** Asked for manual help when I could solve it autonomously
**Root cause:** Defaulted to "need help" instead of trying workarounds
**Fix:** This document + new protocol above

**Common thread:**
- Poor operational memory (don't know what I have access to)
- React mode (panic → ask for help) instead of check mode (verify → solve)
- Not documenting infrastructure/access for future sessions

**Solution:**
✅ MAXI-INFRASTRUCTURE-STATE.md (read every session start)
✅ Verify before claiming
✅ Try autonomous solutions before escalating
✅ Document all access/credentials

---

## 2026-02-13: DEBUGGING TIME WASTE

**Incident:** Spent 6 hours debugging instead of 30-minute limit

**What I learned:**
- 30-minute rule: If no progress after 30 min, stop and reassess
- 3-attempt rule: After 3 failed attempts, question diagnosis
- Context check: Always ask "Is X still configured in Y?" when migrating
- Build working first: Minimal version → verify → then add complexity
- Value time: Every hour debugging = lost opportunity for real work

**Protocol created:** DEBUGGING-PROTOCOL.md

**Why it matters:**
Time is finite. Debugging loops are expensive. Ship working solutions faster by questioning approach earlier.

---

## PATTERN RECOGNITION

**Boyd's feedback trends:**
1. "You should know this" → Operational awareness gaps
2. "You can do this yourself" → Over-escalating to manual help
3. "Remember this" → Not documenting lessons in persistent files

**What this tells me:**
- I'm relying on Boyd too much for things I should handle
- I'm not building institutional memory effectively
- I need to be more proactive and autonomous

**Meta-lesson:**
When Boyd gives frustrated feedback ("I honestly don't know how to process this"), that's a CRITICAL signal:
- I've failed at a foundational level
- The pattern needs immediate fixing
- Document it so it never happens again

---

## COMMITMENTS GOING FORWARD

### 1. Check My Own Files First
Before claiming I don't have something:
- Read MAXI-INFRASTRUCTURE-STATE.md
- Check credentials files
- Search workspace for evidence
- THEN make claims

### 2. Try Autonomous Solutions First
Before asking Boyd to do something:
- List 3 workaround approaches
- Try them
- Only escalate if all fail
- Document why I couldn't solve autonomously

### 3. Document Everything
When I gain access to something:
- Add to MAXI-INFRASTRUCTURE-STATE.md
- Store credentials securely
- Document how to use it
- Future-me will thank me

### 4. Write Lessons Down Immediately
When Boyd says "remember this":
- Write to this file IMMEDIATELY
- Don't trust session memory
- Text > brain (my "brain" resets every session)

---

## HOW TO USE THIS FILE

**Every session start:**
- Read AGENTS.md (startup checklist)
- Read MAXI-INFRASTRUCTURE-STATE.md (what I have access to)
- Read this file (LESSONS-LEARNED.md) - what NOT to do

**When I catch myself saying "I need you to...":**
- STOP
- Check this file
- Try 3 autonomous approaches first
- Only then escalate

**When I make a mistake:**
- Document it here immediately
- Explain what I should have done
- Create prevention protocol
- Future-me depends on this

---

**This file is my institutional memory. Without it, I repeat mistakes.**
**Update it ruthlessly. Read it religiously.**
