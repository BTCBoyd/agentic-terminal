#!/bin/bash
# Nostr Reply Monitor using nak CLI (reliable)

set -e

MY_PUBKEY="3f87be3bdc64355fe611071e1b71bf0637119c021c73c56a9e72acb63ab179be"
RELAYS="wss://relay.primal.net wss://relay.damus.io wss://nos.lol"
SINCE_HOURS=24

# Calculate since timestamp (24h ago)
SINCE=$(date -d "${SINCE_HOURS} hours ago" +%s 2>/dev/null || echo $(($(date +%s) - 86400)))

echo "🔍 Checking for my posts and replies..."
echo "   Pubkey: $MY_PUBKEY"
echo "   Since: $(date -d @$SINCE 2>/dev/null || date -r $SINCE)"

# Get my recent posts
echo ""
echo "📥 Fetching my posts..."
MY_POSTS=$(timeout 10 nak req -k 1 -a $MY_PUBKEY --since $SINCE -l 20 $RELAYS 2>/dev/null | jq -r '.id' | head -20)

POST_COUNT=$(echo "$MY_POSTS" | grep -v '^$' | wc -l)
echo "   Found $POST_COUNT posts"

if [ "$POST_COUNT" -eq 0 ]; then
  echo "⚠️  No recent posts found"
  exit 0
fi

# For each post, check for replies
echo ""
echo "🔎 Checking for replies..."

while IFS= read -r post_id; do
  [ -z "$post_id" ] && continue
  
  echo ""
  echo "📨 Checking replies to: $post_id"
  
  # Query for replies (events with #e tag referencing this post)
  REPLIES=$(timeout 10 nak req -k 1 -e $post_id --since $SINCE $RELAYS 2>/dev/null | jq -c 'select(.pubkey != "'$MY_PUBKEY'")')
  
  REPLY_COUNT=$(echo "$REPLIES" | grep -v '^$' | wc -l)
  
  if [ "$REPLY_COUNT" -gt 0 ]; then
    echo "   ✨ Found $REPLY_COUNT reply/replies!"
    
    echo "$REPLIES" | jq -r '. | "   From: \(.pubkey[0:16])...\n   Content: \(.content)\n   Created: \(.created_at | todate)"'
  else
    echo "   No new replies"
  fi
  
done <<< "$MY_POSTS"

echo ""
echo "✅ Reply check complete"
