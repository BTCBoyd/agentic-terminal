#!/bin/bash
# Morning Status Report - Sent to Boyd every morning at 8 AM
# Reports on all automation status

LOG_FILE="$HOME/.openclaw/workspace/morning-report.log"

log() {
    echo "[$(date -Iseconds)] $1" | tee -a "$LOG_FILE"
}

log "=== Generating Morning Report ==="

REPORT="☀️ MORNING STATUS REPORT

**Date:** $(date '+%A, %B %d, %Y %I:%M %p %Z')

---

**🤖 AUTOMATION STATUS:**

"

# MaxiSuite Scheduler
if systemctl is-active --quiet maxisuite-scheduler.service; then
    REPORT+="✅ MaxiSuite Scheduler: Running
"
    UPTIME=$(systemctl show maxisuite-scheduler.service --property=ActiveEnterTimestamp --value)
    REPORT+="   Uptime: $UPTIME
"
else
    REPORT+="❌ MaxiSuite Scheduler: STOPPED
"
fi

REPORT+="
"

# Queue Status
SCHEDULED=$(cd ~/.openclaw/workspace && node -e "
const queue = require('./maxisuite-queue.json');
const scheduled = queue.filter(p => p.status === 'scheduled').length;
const posted = queue.filter(p => p.status === 'posted' && new Date(p.postedAt) > new Date(Date.now() - 24*3600*1000)).length;
console.log(\`Queued: \${scheduled} | Posted last 24h: \${posted}\`);
" 2>/dev/null || echo "Unknown")

REPORT+="**📊 Post Queue:**
$SCHEDULED

"

# Nostr Status
LAST_NOSTR=$(grep "Event ID:" ~/.openclaw/workspace/nostr-automation.log 2>/dev/null | tail -1 | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}' || echo "Unknown")
if [ -n "$LAST_NOSTR" ] && [ "$LAST_NOSTR" != "Unknown" ]; then
    LAST_NOSTR_TS=$(date -d "$LAST_NOSTR" +%s 2>/dev/null || echo 0)
    NOW=$(date +%s)
    HOURS_AGO=$(( (NOW - LAST_NOSTR_TS) / 3600 ))
    REPORT+="**⚡ Nostr:**
✅ Last post: $HOURS_AGO hours ago

"
else
    REPORT+="**⚡ Nostr:**
⚠️  Status unknown

"
fi

# OpenClaw Gateway
if pgrep -f "openclaw.*gateway" > /dev/null; then
    REPORT+="**🌐 OpenClaw Gateway:**
✅ Running

"
else
    REPORT+="**🌐 OpenClaw Gateway:**
❌ Not running

"
fi

# System Resources
DISK_USAGE=$(df /home | tail -1 | awk '{print $5}')
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f%%", $3/$2 * 100}')
LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}')

REPORT+="**💻 System:**
Disk: $DISK_USAGE used
Memory: $MEM_USAGE used
Load: $LOAD

"

# Check for issues
ISSUES=""
OVERDUE=$(cd ~/.openclaw/workspace && node -e "
const queue = require('./maxisuite-queue.json');
const overdue = queue.filter(p => 
    p.status === 'scheduled' && 
    new Date(p.scheduledFor) < new Date(Date.now() - 30*60*1000)
).length;
console.log(overdue);
" 2>/dev/null || echo "0")

if [ "$OVERDUE" -gt 0 ]; then
    ISSUES+="⚠️  $OVERDUE overdue posts
"
fi

if [ -n "$ISSUES" ]; then
    REPORT+="---

**⚠️  ISSUES DETECTED:**

$ISSUES

"
else
    REPORT+="---

**✅ All systems nominal - no issues detected**

"
fi

REPORT+="---

_Auto-generated morning report_"

# Send report
log "Sending morning report to Boyd..."
/home/futurebit/.openclaw/workspace/send-whatsapp.sh "$REPORT" 2>&1 | tee -a "$LOG_FILE"

log "=== Morning Report Sent ==="
