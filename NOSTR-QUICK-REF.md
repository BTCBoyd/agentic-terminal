# Nostr Automation - Quick Reference Card

## 🚦 Status Check (30 seconds)
```bash
node ~/.openclaw/workspace/nostr-dashboard-widget.mjs
```

## 📊 Detailed Queue Info
```bash
node ~/.openclaw/workspace/nostr-queue-status.mjs
```

## ➕ Add Post
```bash
node ~/.openclaw/workspace/nostr-queue-add.mjs "Your content here" treasury high
# Categories: treasury | convergence | latam | behind-scenes
# Priorities: high | medium
```

## 📝 View Logs (Last 50 lines)
```bash
tail -50 ~/.openclaw/workspace/nostr-automation.log
```

## 👀 Watch Logs Live
```bash
tail -f ~/.openclaw/workspace/nostr-automation.log
```

## 🧪 Manual Test Run
```bash
# Test without posting (just shows what would happen)
node ~/.openclaw/workspace/nostr-auto-post.mjs morning  # Uses 2-3 posts!
```

## ⏰ Check Cron Schedule
```bash
crontab -l | grep nostr
```

## 📖 Full Documentation
```bash
cat ~/.openclaw/workspace/NOSTR-AUTOMATION.md
less ~/.openclaw/workspace/NOSTR-AUTOMATION.md  # Paginated
```

## 🔥 Emergency Stop
```bash
crontab -r  # DANGER: Removes ALL cron jobs!
```

## 🔄 Re-enable After Stop
```bash
crontab ~/.openclaw/workspace/nostr-crontab-backup.txt
```

---

## Schedule
- **Morning:** 10:00 AM EST (8:00 AM MT) → 2-3 posts
- **Evening:** 7:00 PM EST (5:00 PM MT) → 1-2 posts

## Files
- Queue: `~/.openclaw/workspace/nostr-content-queue.json`
- Logs: `~/.openclaw/workspace/nostr-automation.log`
- Docs: `~/.openclaw/workspace/NOSTR-AUTOMATION.md`

## Health Indicators
- ✅ Green: >10 posts remaining
- ⚡ Yellow: 5-10 posts remaining
- ⚠️ Orange: <5 posts remaining
- 🚨 Red: Queue empty

---

**Pro Tip:** Check status Friday evening to ensure weekend coverage!
