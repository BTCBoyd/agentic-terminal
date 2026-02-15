# Nostr Posting Fix - Feb 6, 2026

## Problem
Posts reported "✅ Posted successfully" but didn't appear on Primal (Boyd's primary client).

**Affected Events:**
- `c798ae94bfee56600b4ead19252fc98a6b2ab89169ab6508b6f3038e09748698` (only on Damus)
- `4a154e3589cc4ca8fbb4f5f9d4c05175f15cdcd40f57b1c28e0e85f6e02e030b` (only on Damus)

## Root Cause
The original `post-to-nostr.mjs` used `Promise.any()` which succeeds when **ANY single relay** accepts the event. 

```javascript
// OLD (broken):
await Promise.race([publishPromise, timeoutPromise])
// Where publishPromise = Promise.any(pool.publish(relays, event))
```

This meant:
- If Damus accepted first → immediate success ✅
- Other relays (Primal, nos.lol, Snort) silently failed or timed out ❌
- Script reported success but posts weren't on Primal

## The Fix
New script (`post-to-nostr.mjs`) now:

1. **Waits for ALL relay responses** using `Promise.allSettled()`
2. **Requires minimum 2 relays to succeed** (configurable: `MIN_SUCCESS_RELAYS`)
3. **Requires Primal specifically** (configurable: `REQUIRE_PRIMAL`)
4. **Reports per-relay status** (which succeeded/failed)

```javascript
// NEW (fixed):
const results = await Promise.allSettled(
  publishPromises.map((promise, index) => 
    Promise.race([
      promise.then(() => ({ relay: relays[index], success: true })),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), PUBLISH_TIMEOUT)
      )
    ])
  )
)

// Check: Must have ≥2 successes AND Primal must succeed
const meetsMinimum = successful.length >= MIN_SUCCESS_RELAYS
const meetsPrimalRequirement = primalSuccess
```

## Verification

### Before Fix:
```
Event c798ae94... found on:
✅ wss://relay.damus.io
⚠️  wss://nos.lol: NOT FOUND
⚠️  wss://relay.primal.net: NOT FOUND
⚠️  wss://relay.snort.social: NOT FOUND
Result: 1/4 relays
```

### After Fix:
```
Event 7d49ebb3... found on:
✅ wss://relay.damus.io: FOUND
✅ wss://nos.lol: FOUND
✅ wss://relay.primal.net: FOUND
✅ wss://relay.snort.social: FOUND
Result: 4/4 relays
```

## Testing
All tests passed:
- ✅ Connectivity test: All 4 relays reachable
- ✅ Test post: Successfully published to all 4 relays
- ✅ Query verification: Event retrievable from all relays
- ✅ Primal confirmed: Posts now visible on Primal

## Resolution Actions
1. ✅ Replaced `post-to-nostr.mjs` with fixed version (old backed up to `post-to-nostr-old.mjs`)
2. ✅ Reposted missing content (new event ID: `7d49ebb3b3be32735f25e78337310bb4e50f4a42560e6efdc81836aaddacab6f`)
3. ✅ Verified new post appears on Primal
4. ✅ Documented fix

## Configuration
Current settings in `post-to-nostr.mjs`:
```javascript
const MIN_SUCCESS_RELAYS = 2   // Require at least 2 relays to succeed
const REQUIRE_PRIMAL = true    // Fail if Primal doesn't accept
const PUBLISH_TIMEOUT = 8000   // 8 seconds per relay
```

## Impact
- **Before:** False positive success, posts invisible on Primal
- **After:** True success only when Primal + minimum relays confirm
- **Result:** Reliable Nostr presence on Primal (Boyd's primary client)

## Tools Created
- `verify-event.mjs` - Query relays to check if events exist
- `get-event-full.mjs` - Retrieve full event content
- `test-nostr-connectivity.mjs` - Test relay connectivity (already existed)

## Status
✅ **FIXED** - All posts now successfully reach Primal and other relays.

Next steps: Monitor posting success rate over next 24h to ensure no regressions.
