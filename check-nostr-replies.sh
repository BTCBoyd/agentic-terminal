#!/bin/bash
# Manual Nostr reply monitoring - runs every 2 hours
# Creates a reminder for me to check Boyd's Nostr feed

cd /home/futurebit/.openclaw/workspace

echo "[$(date)] Nostr reply check triggered" >> nostr-automation.log

# Create a system event for me to check
echo "🔔 Time to check Nostr for replies!"
echo ""
echo "1. Visit: https://primal.net/p/npub187rmuw7uvs64les3qu0pkudlqcm3r8qzr3eu2657w2ktvw430xlq24lcna"
echo "2. Look at notifications/replies"
echo "3. For quality engagement, generate response via OpenClaw"
echo "4. Give Boyd the response to copy-paste"
echo ""
echo "Quality reply = question, substantive content, or on-topic engagement"
echo "Skip = emoji-only, 'gm', one-word replies"
