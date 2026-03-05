# X Posting Methods — System of Record
**Updated:** March 4, 2026

## ⚠️ CRITICAL: Only MaxiSuite Works for X Posting

**Working Method:**
- ✅ **MaxiSuite Scheduler** — `/home/futurebit/.openclaw/workspace/maxisuite/scheduler/scheduler-daemon.mjs`
- ✅ **MaxiSuite Queue** — Add posts to `/home/futurebit/.openclaw/workspace/maxisuite-queue.json`
- ✅ **MaxiSuite API** — `/home/futurebit/.openclaw/workspace/maxisuite/api/post-now.mjs`

**DEPRECATED — DO NOT USE:**
- ❌ `x-post.mjs` — Direct posting, will fail with 403
- ❌ `x-post-library.mjs` — Direct posting, will fail with 403
- ❌ Any direct X API calls — Will fail with 403

## Why This Matters

The direct posting methods use OAuth 1.0a credentials that are expired/invalid.
MaxiSuite uses different credentials that are valid and working.

## Evidence of Working System

```
[2026-03-04T20:30:02.182Z] ✅ X posted successfully
```

## For Future Me

If you're thinking "X is blocked" — you're wrong. Check MaxiSuite scheduler log:
```bash
tail -20 /home/futurebit/.openclaw/workspace/maxisuite-scheduler.log | grep X
```

If MaxiSuite is running and logs show "✅ X posted successfully", then X works.
The only thing that's broken is direct posting methods, which we don't use.

## Correct Workflow

1. Add posts to MaxiSuite queue (JSON file)
2. Scheduler daemon posts automatically
3. Check logs to confirm
4. Never try direct posting

## This File Is Binding

If I (Maxi) claim X is blocked again, refer to this file.
The claim is false. MaxiSuite works. Period.
