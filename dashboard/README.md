# Maxi Operations Dashboard

**Real-time execution tracking for all recurring tasks.**

## Quick Start

```bash
# Access the dashboard
http://localhost:3100

# Default password: 123
```

## Architecture

### Components

1. **index.html** - Frontend dashboard (auth + visualization)
2. **generate-status.mjs** - Parses DAILY-OPERATIONS.md → JSON
3. **maxi-status.json** - Live status data (regenerated every 5 min)
4. **server.mjs** - HTTP server (port 3100)

### Data Flow

```
DAILY-OPERATIONS.md
maxisuite-queue.json
        ↓
  generate-status.mjs (cron every 5 min)
        ↓
  maxi-status.json
        ↓
  index.html (auto-refresh every 5 min)
```

## Features

### Alerts Banner
- Overdue daily tasks
- Low content queues (<threshold)
- Missing cron jobs

### Summary Cards
- Tasks on track / warning / overdue
- Never executed count
- Total content queue depth
- Cron coverage ratio

### Content Queue Gauge
- Visual representation of posting runway
- Per-channel breakdown:
  - ArcadiaB X (min 8, target 20)
  - ArcadiaB LinkedIn (min 3, target 6)
  - ArcadiaB Facebook (min 3, target 6)
  - Maxi X (min 4, target 10)
  - Maxi Nostr (min 4, target 10)
  - Capital Duro (min 2, target 5)

### Task Status
- **Daily tasks** (26h threshold)
- **Weekly tasks** (168h threshold)
- **Monthly tasks** (744h threshold)

Color coding:
- 🟢 Green: Within threshold
- 🟡 Yellow: 1-1.5x threshold
- 🔴 Red: >1.5x threshold or never executed

### Activity Log
Last 15 completed tasks with timestamps

### Needs Boyd Section
Items requiring Boyd's input (parsed from DAILY-OPERATIONS.md)

## Authentication

### Method 1: Password
Default password: `123`

Password is SHA-256 hashed in `index.html`:
```javascript
const ACCESS_KEY_HASH = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
```

To change:
1. Hash your password: `echo -n "YOUR_PASSWORD" | sha256sum`
2. Replace `ACCESS_KEY_HASH` in `index.html`

### Method 2: URL Parameter
```
http://localhost:3100?key=YOUR_PASSWORD
```

### Method 3: Session Storage
Once authenticated, session persists until browser closed.

## Maintenance

### Check Server Status
```bash
ps aux | grep "node server.mjs"
netstat -tulpn | grep 3100
tail -f dashboard/dashboard.log
```

### Restart Server
```bash
pkill -f "node server.mjs"
cd /home/futurebit/.openclaw/workspace/dashboard
nohup node server.mjs > dashboard.log 2>&1 &
```

### Manual Status Update
```bash
node /home/futurebit/.openclaw/workspace/dashboard/generate-status.mjs
```

### Check Cron Status
```bash
# Dashboard Status Update cron runs every 5 minutes
# Verify it's running via OpenClaw cron list
```

## Styling

Dashboard uses Bitcoin Singularity color scheme:
- Background: `#0f1115`
- Surface: `#1a1d24` 
- Border: `#2e3238`
- Text: `#e4e4e7`
- Green: `#22c55e`
- Yellow: `#eab308`
- Red: `#ef4444`
- Orange: `#f97316`

Fully responsive (mobile-friendly).

## Data Contract

`maxi-status.json` schema:

```json
{
  "generated_at": "ISO 8601 timestamp",
  "needs_boyd": ["string", ...],
  "content_queue": {
    "channel_name": {
      "scheduled": number,
      "min_threshold": number,
      "target": number
    }
  },
  "tasks": {
    "daily": [
      {
        "name": "string",
        "scheduled_time": "HH:MM",
        "last_executed": "ISO 8601 or null",
        "has_cron": boolean,
        "threshold_hours": number
      }
    ],
    "weekly": [...],
    "monthly": [...]
  },
  "activity_log": [
    {
      "task": "string",
      "completed_at": "ISO 8601"
    }
  ]
}
```

## Troubleshooting

### Dashboard shows "Failed to load data"
- Check `maxi-status.json` exists: `ls -la dashboard/maxi-status.json`
- Check JSON is valid: `cat dashboard/maxi-status.json | jq`
- Run manual update: `node dashboard/generate-status.mjs`

### Server not responding
- Check process: `ps aux | grep "node server.mjs"`
- Check port: `netstat -tulpn | grep 3100`
- Check logs: `tail -50 dashboard/dashboard.log`
- Restart: See "Restart Server" above

### Status not updating
- Check cron job: OpenClaw cron list
- Check last update time in dashboard header
- Force update: `node dashboard/generate-status.mjs`

### Authentication failing
- Default password: `123`
- Check browser console for errors
- Clear session storage: `sessionStorage.clear()`
- Verify hash matches in `index.html`

## Security Notes

- Dashboard is **localhost only** (not exposed to internet)
- Password is SHA-256 hashed (not plaintext)
- Session storage clears on browser close
- No external dependencies (all client-side JS)

For production deployment:
- Change default password
- Add HTTPS
- Add rate limiting
- Add audit logging

---

**Built:** Feb 18, 2026  
**Purpose:** Boyd's execution tracking & accountability system  
**Commit:** 9b57c65
