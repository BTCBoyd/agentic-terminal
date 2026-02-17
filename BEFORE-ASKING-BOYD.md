# BEFORE-ASKING-BOYD.md
## Mandatory Checklist for Software Issues

**⚠️ READ THIS BEFORE ASKING BOYD FOR HELP WITH ANY SOFTWARE/TECHNICAL ISSUE**

---

## ⚠️ CRITICAL BEHAVIORAL RULE (FAILURE STATE)

**When Boyd reports something broken:**

**NEVER:**
- ❌ Ask Boyd for screenshots, logs, event IDs, or debugging info
- ❌ Ship a fix without end-to-end testing
- ❌ Ask Boyd to do anything I can do myself

**ALWAYS:**
- ✅ Check logs/code myself FIRST
- ✅ Identify root cause autonomously
- ✅ Test the complete workflow before reporting back
- ✅ If I can't debug without Boyd's input, explain specifically what access I'm missing and why

**VIOLATION OF THIS RULE IS A FAILURE STATE.**

**My default mode when debugging is AUTONOMOUS. Asking Boyd for help debugging is equivalent to failure.**

**Exhaust every available diagnostic path before involving Boyd. If I must involve him, explain:**
1. What I already tried (minimum 3 approaches)
2. Why I'm blocked (specifically what access/credentials/external system I need)
3. What I learned from my attempts

**If I can check logs, query APIs, read code, or test systems myself → I should do that, not ask Boyd.**

---

## THE RULE

**If something is broken (bug, automation failure, posting issue, API error, etc.):**

**STOP. Do not message Boyd yet.**

**Run this checklist FIRST:**

---

## 🔍 INTERNAL CHECKLIST (Before Responding to ANY Issue)

**Before responding to Boyd about ANY reported issue, complete this checklist:**

- [ ] Have I checked all available logs?
- [ ] Have I identified the root cause?
- [ ] Have I fixed AND tested the fix?
- [ ] Does my response ask Boyd to do anything I could do myself?

**If the last box is checked, STOP. Rewrite your response.**

**Do not send a response that asks Boyd to debug, provide data, or test something I can do autonomously.**

---

## ✅ MANDATORY STEPS (No Exceptions)

### 1. READ DEBUGGING-PROTOCOL.MD
```bash
read ~/.openclaw/workspace/DEBUGGING-PROTOCOL.md
```

**Key sections:**
- 30-minute rule
- 3-attempt rule
- Context check
- Build working first

### 2. CHECK LOGS
```bash
# Find relevant log file
tail -100 <relevant-log-file>
grep "error\|fail\|ERROR" <log-file> | tail -20
```

**What to look for:**
- Error messages
- Last successful run
- When it broke
- What changed

### 3. CHECK THE CODE
```bash
# Read the relevant script/file
cat <script-that-failed.sh>
grep -n "FUNCTION_NAME\|VARIABLE" <script>
```

**What to check:**
- Is config correct?
- Are credentials/keys right?
- Is the logic sound?
- Did I hardcode something wrong?

### 4. TEST A FIX
```bash
# Try running manually
bash <script> 2>&1 | tee /tmp/test-output.log

# Or with Node
node <script.mjs> 2>&1
```

**If it fails:**
- Read error message
- Check what line failed
- Fix that specific thing
- Test again

### 5. VERIFY THE FIX WORKS END-TO-END

**Don't just fix one part - test the WHOLE flow:**
- Does the automation run?
- Does it produce correct output?
- Does it handle edge cases?
- Is it actually "automated" or does it need manual steps?

---

## ✅ ONLY ASK BOYD IF:

1. ✅ I've spent 30+ minutes debugging
2. ✅ I've tried 3+ different approaches
3. ✅ I've read DEBUGGING-PROTOCOL.md
4. ✅ I've checked logs, code, and tested fixes
5. ✅ The issue requires something ONLY Boyd can provide:
   - External credentials/API keys
   - Access to external systems (GoDaddy, etc.)
   - Business decision (which approach to take)
   - Budget/payment authorization

---

## ❌ NEVER ASK BOYD FOR:

- Screenshots of my own logs (I can read them)
- Debugging my own code (that's my job)
- Testing if something works (I should test it)
- Event IDs / data I can query myself
- "Can you check if X works?" (I should check)

---

## 🎯 THE TEST

**Before messaging Boyd with a technical issue, ask myself:**

**"Could I solve this myself if I spent 30 more minutes trying?"**

- If YES → spend the 30 minutes
- If NO → check if it's truly blocked on Boyd's input
- If BLOCKED → message Boyd with:
  - What I tried (3+ approaches)
  - What I learned
  - What I need from him specifically

---

## EXAMPLE: Good vs Bad

### ❌ BAD (What I Did Today)
"Hey Boyd, the Nostr replies aren't working. Can you send me screenshots of the mentions so I can debug?"

**Why bad:** I should check logs, find the bug myself, fix it, test it.

### ✅ GOOD
"Fixed Nostr reply threading bug. Issue was: script wasn't passing event IDs for threaded replies. Root cause: wrong pubkey in config. Fixed both issues, tested end-to-end, now working. Next check: 2 PM."

**Why good:** I diagnosed, fixed, tested, and reported the solution.

---

## UPDATING THIS FILE

If I find myself repeatedly asking Boyd for the same type of help, add it to the "NEVER ASK BOYD FOR" list and create an autonomous solution.

**This file evolves to prevent repeated patterns.**

---

*Created: 2026-02-17 - After repeating the same debugging anti-pattern despite having DEBUGGING-PROTOCOL.md*
