# DEBUGGING PROTOCOL - MANDATORY

**Created:** 2026-02-13 after wasting 6 hours of Boyd's time on fixable problems

**THE PROBLEM:**
I went in circles for hours on DNS/chat issues without stepping back to reassess. Cost: half a day lost, frustration, had to bring in external help to diagnose obvious issues.

## CORE RULES (NON-NEGOTIABLE)

### 1. THE 30-MINUTE RULE
**If no progress after 30 minutes of trying the same approach:**
- STOP immediately
- Say: "I'm stuck in a loop. Let me try a completely different approach."
- List what you've tried
- Propose 2-3 alternative angles
- Ask if Boyd wants a second opinion

**DO NOT:** Keep trying variations of the same failed approach

### 2. THE THREE-ATTEMPT RULE
**After 3 failed attempts at the same fix:**
- It's not a "tweak the approach" problem
- It's a "wrong diagnosis" problem
- Step back and question core assumptions
- Ask diagnostic questions you should have asked first

### 3. THE CONTEXT CHECK
**When someone says "X was hosted on Y":**
- **IMMEDIATELY ASK:** "Is X still configured in Y's system?"
- Don't assume "DNS changed" means "hosting removed"
- Domain conflicts are COMMON when migrating hosts

### 4. BUILD WORKING FIRST, OPTIMIZE LATER
**When building something new:**
- Start with MINIMAL working version (no security, no features)
- Verify core functionality works
- THEN add complexity layer by layer
- Test after each layer

**DON'T:** Build complex system, then debug why it doesn't work

### 5. DIAGNOSTIC QUESTIONS UPFRONT
**Before diving into fixes, ask:**
- "What changed recently?" (often reveals root cause)
- "Is this configured/claimed somewhere else?" (conflicts)
- "What's the simplest possible test?" (isolate variables)
- "Have we verified the basics?" (don't assume)

### 6. VALUE BOYD'S TIME
**Every hour of debugging = lost opportunity cost:**
- Content creation
- Business development  
- Strategic work
- Site improvements

**If I'm stuck, Boyd loses twice:** My failure + his time investment helping me

### 7. FRESH PERSPECTIVE PROTOCOL
**When stuck >1 hour:**
- Offer to consult external AI (Claude, GPT, etc.)
- Don't wait for Boyd to suggest it
- Frame it as: "Want me to get a second opinion on this?"

## SPECIFIC LESSONS FROM 2026-02-13

### Issue 1: Bluehost Domain Conflict
**What I missed:** Domain was still configured in Bluehost WordPress (Site URL), causing Netlify to silently reject it

**Should have asked immediately:** "Is bitcoinsingularity.ai still set as an active domain/site URL in Bluehost?"

**Red flag I ignored:** Domain "finds" but won't save = hosting conflict, not DNS issue

### Issue 2: Chat Function Over-Engineering
**What I did wrong:** Built 6-layer security system, couldn't debug which layer was broken

**Should have done:** Start with zero-security test function, verify Anthropic API works, THEN add layers

**Red flag I ignored:** After 403 errors for hours, should have stripped to basics instead of adding more debugging

## IMPLEMENTATION

**These rules live in AGENTS.md startup checklist:**
- Load DEBUGGING-PROTOCOL.md when technical issues arise
- Reference specific rules when stuck
- Boyd can say "30-minute rule" as shorthand

**This is binding.** Not suggestions - protocol.

---

*Written after learning the hard way. Don't repeat these mistakes.*
