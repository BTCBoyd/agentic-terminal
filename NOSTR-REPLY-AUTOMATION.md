# Nostr Reply Automation

**Status:** ✅ Active (runs every 3 hours)

## What It Does

Automatically monitors replies to Maxi's Nostr posts and responds to quality engagement within a few hours.

## How It Works

### 1. Monitoring Schedule
- **Frequency:** Every 3 hours
- **Cron:** `0 */3 * * *` (top of every 3rd hour)
- **Script:** `nostr-reply-monitor.mjs`
- **Log:** `nostr-automation.log`

### 2. Reply Detection
The script:
1. Fetches Maxi's posts from last 12 hours
2. Queries for replies to those posts
3. Filters out Maxi's own replies
4. Filters out already-responded-to replies

### 3. Quality Filtering

**Filtered OUT (low-effort):**
- One-word replies: "gm", "nice", "cool", "lol"
- Emoji-only: "🔥", "💯", "👍"
- Very short: < 5 words

**Quality indicators:**
- Has a question (?)
- 10+ words with relevant keywords (Bitcoin, AI, economics)
- Substantive engagement

### 4. Response Generation

Contextual responses based on reply content:

**If question:**
- Explains core logic (Bitcoin = permissionless, AI needs that)

**If agreement:**
- Reinforces point + adds game theory angle

**If Bitcoin-specific:**
- Emphasizes permissionless + provably scarce

**If AI-specific:**
- Explains convergence logic

**If economics:**
- Austrian economics + low time preference angle

**Default:**
- Acknowledges + explains convergence thesis

### 5. Posting
- Uses NIP-10 reply tags (proper threading)
- Tags: `["e", reply_id, "", "reply"]` + `["p", author_pubkey]`
- Rate limited: 30 seconds between replies
- Posts to all relays (Primal, Damus, nos.lol, nostr.band)

## State Management

**File:** `nostr-reply-state.json`

```json
{
  "repliedTo": ["event_id_1", "event_id_2", ...],
  "lastCheck": 1707408000
}
```

- Tracks which replies have been responded to
- Prevents duplicate responses
- Persists across runs

## Example Flow

1. **12:00 PM** - Someone replies to Maxi's post: "Why would AI agents choose Bitcoin over stablecoins?"

2. **3:00 PM** - Cron runs, detects quality reply with question

3. **3:00 PM** - Generates response: "Great question! The core logic is: AI agents need money that works without human intermediaries. Bitcoin is permissionless — no bank account, no KYC, just cryptographic keys. That's not ideology, it's engineering necessity."

4. **3:00 PM** - Posts reply with proper NIP-10 tags

5. **3:00 PM** - Marks reply as responded-to in state file

## Logs

All activity logged to `nostr-automation.log`:

```
[2026-02-08T13:00:00Z] [REPLY-MONITOR] 🔍 Starting reply monitoring...
[2026-02-08T13:00:01Z] [REPLY-MONITOR] 📊 Found 3 of my posts
[2026-02-08T13:00:02Z] [REPLY-MONITOR] 📊 Found 5 total replies
[2026-02-08T13:00:02Z] [REPLY-MONITOR] ✨ Found 2 new replies from others
[2026-02-08T13:00:02Z] [REPLY-MONITOR] 📨 Reply from 1234abcd...
[2026-02-08T13:00:02Z] [REPLY-MONITOR]    Content: "Why would AI agents choose Bitcoin..."
[2026-02-08T13:00:02Z] [REPLY-MONITOR]    Quality: ✅ YES
[2026-02-08T13:00:02Z] [REPLY-MONITOR] 🤖 Generating reply...
[2026-02-08T13:00:03Z] [REPLY-MONITOR] ✅ Reply published to 4/4 relays
[2026-02-08T13:00:03Z] [REPLY-MONITOR] ✅ Reply monitoring complete. Responded to 1/2 quality replies.
```

## Manual Testing

To test the script manually:

```bash
cd /home/futurebit/.openclaw/workspace
node nostr-reply-monitor.mjs
```

## Customization

**Adjust frequency:**
Edit crontab: `crontab -e`
- Every 2 hours: `0 */2 * * *`
- Every 4 hours: `0 */4 * * *`
- Every hour: `0 * * * *`

**Adjust quality thresholds:**
Edit `isQualityReply()` function in `nostr-reply-monitor.mjs`

**Improve response quality:**
Edit `generateReply()` function or integrate with OpenClaw agent for dynamic responses

## Future Enhancements

**Planned:**
1. Integration with OpenClaw agent for dynamic response generation
2. Learn from past replies (which got good engagement)
3. Detect sentiment (enthusiastic vs skeptical) and adjust tone
4. Thread continuation detection (don't reply multiple times to same person in short window)
5. Analytics: track reply rate, engagement quality

**Possible:**
- Reply to mentions even if not direct replies
- Auto-quote-retweet high-quality replies
- DM follow-up for particularly insightful questions

## Rules & Safety

**Never reply to:**
- Spam
- Hate speech
- Obvious trolls
- Same person more than once per hour

**Always:**
- Stay on-brand (Bitcoin maxi, Austrian economics, AI convergence)
- Be respectful and educational
- Add value, don't just acknowledge
- Keep responses under 280 characters

## Status Check

**Check if running:**
```bash
crontab -l | grep reply-monitor
```

**Check recent logs:**
```bash
tail -n 50 nostr-automation.log | grep REPLY-MONITOR
```

**Check state file:**
```bash
cat nostr-reply-state.json | jq
```

## Activation

✅ **Active as of:** 2026-02-08 13:15 EST
✅ **Next run:** Top of next 3-hour window (15:00, 18:00, 21:00, etc.)

---

**Result:** Quality replies get thoughtful responses within 3 hours, building engagement and community on Nostr.
