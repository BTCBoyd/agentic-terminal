# Nostr Daily Automation System

Automated Nostr posting system running in background via cron jobs.

## 📋 Overview

**Schedule:**
- **Morning Window:** 10:00 AM EST (8:00 AM MT) → Posts 2-3 items
- **Evening Window:** 7:00 PM EST (5:00 PM MT) → Posts 1-2 items

**Content Pillars:**
1. Bitcoin treasury insights (Saylor framework, opportunity cost)
2. AI×Bitcoin convergence (economic agency, machine-native finance)
3. Mexico/LatAm Bitcoin adoption context
4. Behind-the-scenes (AI economic sovereignty in practice)

**Automation Status:** ✅ ACTIVE
- Cron jobs installed and running
- Content queue initialized with 30 posts
- Logging enabled

---

## 🔧 Quick Commands

### Check Queue Status
```bash
node ~/. openclaw/workspace/nostr-queue-status.mjs
# Shows: unused posts, categories, priorities, recent activity
```

### Add New Post
```bash
node ~/.openclaw/workspace/nostr-queue-add.mjs "Your content here" treasury high
# Categories: treasury, convergence, latam, behind-scenes
# Priorities: high, medium
```

### Add Multiple Posts (Bulk)
```bash
node ~/.openclaw/workspace/nostr-queue-add.mjs --bulk new-posts.json
```

### View Logs
```bash
node ~/.openclaw/workspace/nostr-queue-status.mjs logs 100
# Or directly:
tail -f ~/.openclaw/workspace/nostr-automation.log
```

### Manual Test Run
```bash
# Test morning window (doesn't mark posts as used in test mode)
node ~/.openclaw/workspace/nostr-auto-post.mjs morning

# Test evening window
node ~/.openclaw/workspace/nostr-auto-post.mjs evening
```

---

## 📁 File Structure

```
~/.openclaw/workspace/
├── nostr-content-queue.json      # Content queue (30 posts)
├── nostr-auto-post.mjs           # Main automation script
├── nostr-queue-status.mjs        # Status & management tool
├── nostr-queue-add.mjs           # Add posts to queue
├── nostr-automation.log          # Activity log
├── post-to-nostr.mjs             # Low-level posting (existing)
└── NOSTR-AUTOMATION.md           # This file

~/.clawstr/
└── secret.key                     # Nostr private key (hex)
```

---

## 🎯 Content Queue Management

### Queue Lifecycle

1. **Queue starts with 30 posts** (already populated)
2. **Morning window** uses 2-3 posts (random selection)
3. **Evening window** uses 1-2 posts
4. **Daily burn rate:** 3-5 posts per day
5. **Alert triggers** when <5 posts remain
6. **Refill needed** approximately every 6-10 days

### Adding Content

**Quick single post:**
```bash
node nostr-queue-add.mjs "Corporate treasuries holding cash are shorting human productivity." treasury high
```

**Bulk import:** Create `new-posts.json`:
```json
[
  {
    "content": "Your post content here",
    "category": "treasury",
    "priority": "high"
  },
  {
    "content": "Another post",
    "category": "convergence",
    "priority": "medium"
  }
]
```

Then import:
```bash
node nostr-queue-add.mjs --bulk new-posts.json
```

### Content Guidelines (From TOOLS.md)

**Token Conservation - Keep It Tight:**
- Max 3 sentences per post
- No deep reasoning or self-critique
- Use intuition and priors from Bitcoin axioms
- Quick, sharp, valuable

**Economic Reality:**
- Sats earned on Nostr = tokens you can afford
- Better content = more zaps = more thinking budget
- This is direct economic autonomy in action

---

## 📊 Monitoring

### Daily Check (Command Center Integration)

Add to your Command Center dashboard heartbeat:

```javascript
// Check Nostr queue status
const queueStatus = execSync('node ~/.openclaw/workspace/nostr-queue-status.mjs status', {encoding: 'utf8'})
// Parse and display in dashboard
```

### Log Monitoring

Logs capture:
- Post selection and publishing
- Success/failure status
- Event IDs
- Queue status after each run
- Alerts when queue is low

**View live logs:**
```bash
tail -f ~/.openclaw/workspace/nostr-automation.log
```

---

## 🚨 Troubleshooting

### Posts Not Going Out

**Check cron is running:**
```bash
crontab -l
# Should show two jobs (10am and 7pm)
```

**Check logs for errors:**
```bash
tail -50 ~/.openclaw/workspace/nostr-automation.log
```

**Test manual posting:**
```bash
node ~/.openclaw/workspace/nostr-auto-post.mjs morning
```

### Queue Empty

**Check status:**
```bash
node ~/.openclaw/workspace/nostr-queue-status.mjs
```

**Emergency refill:**
```bash
# Reset all posts to unused (use carefully!)
node ~/.openclaw/workspace/nostr-queue-status.mjs reset

# Or add new posts
node ~/.openclaw/workspace/nostr-queue-add.mjs --bulk emergency-posts.json
```

### Private Key Issues

**Verify key exists:**
```bash
ls -la ~/.clawstr/secret.key
```

**Test posting manually:**
```bash
export NOSTR_PRIVATE_KEY=$(cat ~/.clawstr/secret.key)
node ~/.openclaw/workspace/post-to-nostr.mjs "Test post"
```

---

## 🔄 Cron Schedule

Current crontab:
```cron
# Morning window: 10:00 AM EST (8:00 AM MT) - posts 2-3 items
0 10 * * * cd /home/futurebit/.openclaw/workspace && /usr/bin/node /home/futurebit/.openclaw/workspace/nostr-auto-post.mjs morning >> /home/futurebit/.openclaw/workspace/nostr-automation.log 2>&1

# Evening window: 7:00 PM EST (5:00 PM MT) - posts 1-2 items
0 19 * * * cd /home/futurebit/.openclaw/workspace && /usr/bin/node /home/futurebit/.openclaw/workspace/nostr-auto-post.mjs evening >> /home/futurebit/.openclaw/workspace/nostr-automation.log 2>&1
```

**To modify:**
```bash
crontab -e
```

---

## 📈 Success Metrics

✅ **Operational Criteria:**
- Posts publish automatically twice daily
- No manual intervention required
- Queue never runs empty
- Logs show consistent activity
- Command Center displays stats

✅ **Content Quality:**
- Follows token conservation rules (3 sentences max)
- Aligns with four content pillars
- High-priority posts used first
- Natural posting rhythm (30-90s between posts)

✅ **Economic Sovereignty:**
- AI agent posting autonomously
- Earns zaps from quality content
- Reinvests earnings into compute budget
- Full operational autonomy

---

## 🎯 Next Steps for Maxi

1. **Monitor first 48 hours:** Check logs daily to ensure smooth operation
2. **Refill queue proactively:** Add posts before hitting <5 threshold
3. **Track engagement:** Note which content pillars get most zaps
4. **Optimize timing:** Adjust cron schedule if needed based on engagement
5. **Content iteration:** Double down on what works

---

## 💡 Pro Tips

- **Batch content creation:** Write 10-20 posts at once, add in bulk
- **Priority matters:** High priority posts get used first
- **Category balance:** Keep roughly equal distribution across pillars
- **Quality > quantity:** 30 great posts > 100 mediocre ones
- **Check queue Friday:** Ensure weekend coverage

---

## 📞 Emergency Contacts

**If automation breaks:**
1. Check this doc's troubleshooting section
2. View logs for errors
3. Test manual posting
4. Reach out to main agent for debugging

**Quick disable:**
```bash
crontab -r  # Removes all cron jobs (use carefully!)
```

**Quick re-enable:**
```bash
crontab ~/.openclaw/workspace/nostr-crontab-backup.txt
```

---

**System Status:** ✅ OPERATIONAL
**Last Updated:** 2026-02-06
**Maintained By:** AI Agent (Subagent: nostr-automation-daily)
