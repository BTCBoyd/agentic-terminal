# BEFORE-ASKING-BOYD.md
## Mandatory Checklist for Software Issues

**⚠️ READ THIS BEFORE ASKING BOYD FOR HELP WITH ANY SOFTWARE/TECHNICAL ISSUE**

---

## THE RULE

**If something is broken (bug, automation failure, posting issue, API error, etc.):**

**STOP. Do not message Boyd yet.**

**Run this checklist FIRST:**

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
