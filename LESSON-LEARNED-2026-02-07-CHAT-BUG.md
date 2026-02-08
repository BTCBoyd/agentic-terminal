# CRITICAL LESSON: 5-Hour Bug Hunt (Feb 7-8, 2026)

## THE PROBLEM
Boyd spent 5+ HOURS debugging why chat responses weren't displaying, despite API working perfectly.

## ROOT CAUSE
**Homepage (index.html) linked to WRONG file:**
- Linked to: `/chat-mvp.html` (old, broken version)
- Should link to: `/chat.html` (working version)

**Result:** Every change I made to `chat.html` had ZERO effect because users were loading `chat-mvp.html`.

## WHY IT WAS HARD TO FIND
1. **Multiple chat files existed:**
   - `chat.html` (the one I was updating)
   - `chat-mvp.html` (old version users were actually seeing)
   - `chat-old.html` (backup)

2. **I kept editing the WRONG file** - editing `chat.html` while users loaded `chat-mvp.html`

3. **Browser caching made it worse** - even when I updated the right file, browsers served cached versions

4. **Multiple endpoints existed:**
   - `chat-simple.js` (new, working)
   - `chat-mvp.js` (old, complex)
   - `chat.js` (another variant)

## HOW WE FOUND IT
Claude (the other one) asked Boyd to check Network tab → saw "chat-mvp" request instead of "chat-simple" → realized wrong file was loading.

## THE FIX
1. Changed `index.html` to link to `/chat.html` instead of `/chat-mvp.html`
2. Updated both files to use `chat-simple` endpoint
3. Forced cache clear

## HOW TO PREVENT THIS FOREVER

### Rule 1: ONE CANONICAL FILE
- `chat.html` = the ONLY chat page
- Delete or clearly mark all others as backups
- Homepage should ONLY link to `chat.html`

### Rule 2: ONE CANONICAL ENDPOINT
- `chat-simple.js` = the ONLY chat function
- Delete old endpoints or rename with `.backup` extension
- Never have multiple "active" versions

### Rule 3: VERIFY BEFORE DEBUGGING
Before spending hours debugging, FIRST CHECK:
```bash
# What does the homepage link to?
grep "href.*chat" index.html

# What endpoint does chat.html call?
grep "API_ENDPOINT" chat.html

# Are there multiple versions?
ls -la *chat*.html
ls -la netlify/functions/chat*.js
```

### Rule 4: TEST DEPLOYMENT PROPERLY
After any change:
1. Go to HOMEPAGE (not direct URL)
2. Click button to navigate to chat
3. Check Network tab - verify endpoint name matches expectation
4. If wrong endpoint appears → wrong file is loading

### Rule 5: CLEAN UP OLD FILES
Don't leave old versions laying around:
- Move to `/archive/` folder
- Or delete completely
- Never have ambiguous names like "chat" and "chat-mvp" both active

## WHAT WORKED (Eventually)
1. Created NEW simple endpoint (`chat-simple.js`) - minimal code, no complexity
2. Fixed homepage link to point to correct file
3. Added aggressive debugging (alerts at every step) to prove where code was breaking
4. Network tab showed which file was actually loading

## FILES INVOLVED IN THE FIX
- `index.html` - changed href from `/chat-mvp.html` to `/chat.html`
- `chat.html` - the working version (updated to use chat-simple endpoint)
- `chat-mvp.html` - also updated to use chat-simple as fallback
- `netlify/functions/chat-simple.js` - new minimal endpoint (100 lines, no complexity)

## COST OF THIS BUG
- 5+ hours of Boyd's time
- Extreme frustration
- Almost gave up multiple times
- Could have been avoided with proper file hygiene

## COMMIT THAT FIXED IT
```
commit 67c400c
Author: Maxi
Date: Sat Feb 8 00:41:29 2026

FIX ROOT CAUSE: Homepage was linking to chat-mvp.html not chat.html
```

## NEVER FORGET
**Before debugging code, verify you're editing the file that's actually loading.**

Check homepage → check link → check Network tab → confirm endpoint.

Don't assume. Verify.

---

**If this happens again, read this file first. Don't waste 5 hours.**

— Maxi (written at 00:51 EST after finally solving it)
