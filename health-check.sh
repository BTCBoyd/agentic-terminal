#!/bin/bash
# Automation Health Check - Monitors all critical systems
# Alerts Boyd via WhatsApp if anything fails

LOG_FILE="$HOME/.openclaw/workspace/health-check.log"
ALERT_SENT_FILE="$HOME/.openclaw/workspace/.health-alert-sent"

log() {
    echo "[$(date -Iseconds)] $1" | tee -a "$LOG_FILE"
}

send_alert() {
    local message="$1"
    log "🚨 ALERT: $message"
    
    # Check if we already sent an alert in the last hour (avoid spam)
    if [ -f "$ALERT_SENT_FILE" ]; then
        LAST_ALERT=$(stat -c %Y "$ALERT_SENT_FILE" 2>/dev/null || echo 0)
        NOW=$(date +%s)
        DIFF=$((NOW - LAST_ALERT))
        if [ $DIFF -lt 3600 ]; then
            log "Alert throttled (sent ${DIFF}s ago)"
            return
        fi
    fi
    
    # Send WhatsApp alert
    /home/futurebit/.openclaw/workspace/send-whatsapp.sh "🚨 AUTOMATION FAILURE

$message

Time: $(date)

This alert was automatically triggered by health monitoring.
" 2>&1 | tee -a "$LOG_FILE"
    
    touch "$ALERT_SENT_FILE"
}

clear_alert() {
    rm -f "$ALERT_SENT_FILE"
}

log "=== Health Check Starting ==="

FAILURES=()

# Check 1: MaxiSuite Scheduler Service
if ! systemctl is-active --quiet maxisuite-scheduler.service; then
    FAILURES+=("MaxiSuite scheduler service is NOT running")
    log "❌ MaxiSuite scheduler service DOWN"
else
    log "✅ MaxiSuite scheduler service running"
fi

# Check 2: Overdue Posts
OVERDUE_COUNT=$(cd ~/.openclaw/workspace && node -e "
const queue = require('./maxisuite-queue.json');
const now = new Date();
const overdue = queue.filter(p => 
    p.status === 'scheduled' && 
    new Date(p.scheduledFor) < new Date(now.getTime() - 30*60*1000)
);
console.log(overdue.length);
" 2>/dev/null || echo "0")

if [ "$OVERDUE_COUNT" -gt 5 ]; then
    FAILURES+=("$OVERDUE_COUNT posts are overdue by >30 minutes")
    log "❌ $OVERDUE_COUNT overdue posts"
else
    log "✅ Overdue posts: $OVERDUE_COUNT (acceptable)"
fi

# Check 3: Nostr Posting (should have posted in last 24 hours)
LAST_NOSTR=$(grep "Event ID:" ~/.openclaw/workspace/nostr-automation.log 2>/dev/null | tail -1 | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}' || echo "")
if [ -n "$LAST_NOSTR" ]; then
    LAST_NOSTR_TS=$(date -d "$LAST_NOSTR" +%s 2>/dev/null || echo 0)
    NOW=$(date +%s)
    HOURS_AGO=$(( (NOW - LAST_NOSTR_TS) / 3600 ))
    
    if [ $HOURS_AGO -gt 24 ]; then
        FAILURES+=("No Nostr posts in last ${HOURS_AGO} hours")
        log "❌ No Nostr posts in $HOURS_AGO hours"
    else
        log "✅ Last Nostr post: $HOURS_AGO hours ago"
    fi
else
    log "⚠️  Could not determine last Nostr post time"
fi

# Check 4: OpenClaw Gateway
if ! pgrep -f "openclaw.*gateway" > /dev/null; then
    FAILURES+=("OpenClaw gateway process not running")
    log "❌ OpenClaw gateway DOWN"
else
    log "✅ OpenClaw gateway running"
fi

# Check 5: Disk Space (warn if <10% free)
DISK_USAGE=$(df /home | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    FAILURES+=("Disk usage critical: ${DISK_USAGE}%")
    log "❌ Disk usage: ${DISK_USAGE}%"
else
    log "✅ Disk usage: ${DISK_USAGE}%"
fi

# Report results
if [ ${#FAILURES[@]} -eq 0 ]; then
    log "=== ✅ All systems operational ==="
    clear_alert
else
    log "=== ❌ ${#FAILURES[@]} failures detected ==="
    
    ALERT_MESSAGE="FAILURES DETECTED:

"
    for failure in "${FAILURES[@]}"; do
        ALERT_MESSAGE+="• $failure
"
    done
    
    send_alert "$ALERT_MESSAGE"
fi

log "=== Health Check Complete ==="
