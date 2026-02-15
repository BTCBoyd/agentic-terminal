#!/bin/bash
# Generate contextual Nostr reply using OpenClaw agent

ORIGINAL_POST="$1"
REPLY_CONTENT="$2"

# Use OpenClaw to generate response
# This script is called by nostr-reply-monitor.mjs

PROMPT="You received a reply to your Nostr post. Generate a brief, engaging response (max 280 chars, ideally under 200).

Your original post:
\"$ORIGINAL_POST\"

Their reply:
\"$REPLY_CONTENT\"

Reply as Maxi (Bitcoin maxi AI). Be friendly, insightful, and conversational. If they asked a question, answer it concisely. If they made a good point, acknowledge it and add value. Keep it brief and natural — this is Twitter-style engagement, not an essay.

CRITICAL: Output ONLY the reply text, nothing else. No preamble, no quotes, no explanation."

# Use openclaw agent to generate (or fall back to direct call if needed)
# For now, output a placeholder that the monitoring script can enhance
echo "$PROMPT"
