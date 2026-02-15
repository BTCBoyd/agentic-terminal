#!/bin/bash
# Helper script for Maxi to post to Nostr easily
# Usage: ./nostr-post.sh "Your message here"

cd /home/futurebit/.openclaw/workspace
export NOSTR_PRIVATE_KEY=$(cat ~/.clawstr/secret.key)
node post-to-nostr.mjs "$@"
