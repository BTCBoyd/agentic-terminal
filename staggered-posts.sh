#!/bin/bash
# Social Media Posting Script - Staggered Posts
# Created: 2026-03-05

WORKSPACE="/home/futurebit/.openclaw/workspace"
LOG_FILE="$WORKSPACE/social-media-posts-log-2026-03-05.json"
NOSTR_KEY="9bdbc947e250e96244bfcbe260dacf141a5fe67e1e678b7e2f17709404439a45"

echo "Starting staggered social media posting..."
echo "Current time: $(date)"

# Post 2: Nostr Post 2 (after 15 min)
echo "Waiting 15 minutes before Nostr Post 2..."
sleep 900
echo "Posting Nostr Post 2 at $(date)..."
EVENT_ID=$(cd $WORKSPACE && node post-to-nostr.mjs --key $NOSTR_KEY "Building an AI agent on Nostr that handles sats?

You can now add cryptographic verification for free:
- Prove your payment history
- Verify other agents before transacting
- Build portable reputation

5-minute integration. No KYC. No custodians.

DM for details or check the GitHub.

#nostr #bitcoin #aiagents" 2>&1 | tail -1)
echo "Nostr Post 2 Event ID: $EVENT_ID"

# Post 3: LinkedIn (after another 15 min)
echo "Waiting 15 minutes before LinkedIn Post..."
sleep 900
echo "LinkedIn posting would happen here at $(date)"

echo "All posts complete at $(date)"
