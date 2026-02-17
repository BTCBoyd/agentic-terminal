#!/bin/bash
# Nostr Reply Monitor - Using nak CLI (proven to work)
# Detects quality replies and generates responses via OpenClaw

set -e

MY_PUBKEY="9f85d8478ce68c654ead1d0cd93c966d3c7282fcc435d4a38e5c8c0e663fd6c3"
RELAYS="wss://relay.primal.net wss://relay.damus.io wss://nos.lol wss://relay.nostr.band"
STATE_FILE="$HOME/.openclaw/workspace/nostr-reply-state.json"
LOG_FILE="$HOME/.openclaw/workspace/nostr-automation.log"

log() {
  echo "[$(date -Iseconds)] [REPLY-MONITOR] $1" | tee -a "$LOG_FILE"
}

# Initialize state file if missing
if [ ! -f "$STATE_FILE" ]; then
  echo '{"repliedTo":[],"lastCheck":0}' > "$STATE_FILE"
fi

# Load replied-to list
REPLIED_TO=$(jq -r '.repliedTo[]' "$STATE_FILE" 2>/dev/null || echo "")

log "🔍 Starting reply monitoring..."

# Get event IDs of recent posts from automation log
log "📥 Fetching recent post IDs from logs..."
RECENT_POST_IDS=$(grep "Event ID:" "$LOG_FILE" | tail -20 | grep -oE '[a-f0-9]{64}' | sort -u)

POST_COUNT=$(echo "$RECENT_POST_IDS" | grep -v '^$' | wc -l)
log "   Found $POST_COUNT recent post IDs in logs"

if [ "$POST_COUNT" -eq 0 ]; then
  log "⚠️  No recent posts found in logs"
  exit 0
fi

# Check each post for replies
NEW_REPLIES=0

while IFS= read -r post_id; do
  [ -z "$post_id" ] && continue
  
  log "🔎 Checking replies to: ${post_id:0:16}..."
  
  # Query for replies (use longer timeout, nak sometimes slow)
  REPLIES=$(timeout 15 nak req -k 1 -e "$post_id" -l 50 $RELAYS 2>/dev/null | \
    jq -c "select(.pubkey != \"$MY_PUBKEY\")" 2>/dev/null || true)
  
  if [ -z "$REPLIES" ]; then
    log "   No replies found"
    continue
  fi
  
  # Process each reply
  echo "$REPLIES" | while IFS= read -r reply_json; do
    [ -z "$reply_json" ] && continue
    
    REPLY_ID=$(echo "$reply_json" | jq -r '.id')
    REPLY_CONTENT=$(echo "$reply_json" | jq -r '.content')
    REPLY_AUTHOR=$(echo "$reply_json" | jq -r '.pubkey')
    REPLY_TIME=$(echo "$reply_json" | jq -r '.created_at')
    
    # Skip if already replied
    if echo "$REPLIED_TO" | grep -q "$REPLY_ID"; then
      log "   ⏭️  Already replied to ${REPLY_ID:0:16}"
      continue
    fi
    
    # Check if quality reply
    WORD_COUNT=$(echo "$REPLY_CONTENT" | wc -w)
    
    # Filter low-effort patterns
    if echo "$REPLY_CONTENT" | grep -qiE '^(gm|gn|hi|hey|thanks|nice|cool|great|lol|ok|yes|no)[\s!.]*$'; then
      log "   ❌ Low-effort reply: \"$REPLY_CONTENT\""
      # Mark as seen to avoid re-checking
      jq ".repliedTo += [\"$REPLY_ID\"]" "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
      continue
    fi
    
    if [ "$WORD_COUNT" -lt 5 ]; then
      log "   ❌ Too short ($WORD_COUNT words): \"$REPLY_CONTENT\""
      jq ".repliedTo += [\"$REPLY_ID\"]" "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
      continue
    fi
    
    # Quality reply found!
    NEW_REPLIES=$((NEW_REPLIES + 1))
    log "   ✨ Quality reply found!"
    log "      From: ${REPLY_AUTHOR:0:16}..."
    log "      Content: \"${REPLY_CONTENT:0:100}...\""
    
    # Send to Boyd for response generation via WhatsApp
    NOTIFICATION="📬 NEW NOSTR REPLY

From: ${REPLY_AUTHOR:0:16}...
To post: ${post_id:0:16}...

Reply:
\"$REPLY_CONTENT\"

View on Primal:
https://primal.net/e/$REPLY_ID

---
I can generate a response if you'd like. Reply with 'respond' or I'll draft one automatically in the next check."
    
    # Use openclaw message tool to send via WhatsApp
    openclaw message send --channel whatsapp --to "+5218131100227" "$NOTIFICATION" 2>&1 | tee -a "$LOG_FILE" || log "⚠️  Failed to send notification"
    
    # Mark as notified
    jq ".repliedTo += [\"$REPLY_ID\"]" "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
    
    sleep 2
  done
  
done <<< "$RECENT_POST_IDS"

# Update last check time
jq ".lastCheck = $(date +%s)" "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"

log "✅ Reply monitoring complete. Found $NEW_REPLIES new quality replies."
