#!/bin/bash
# Send WhatsApp message via OpenClaw gateway
# Usage: ./send-whatsapp.sh "message text"

MESSAGE="$1"
TO="+5218131100227"

# Get gateway URL from OpenClaw config
GATEWAY_URL="http://localhost:3333"  # Default OpenClaw gateway port

curl -s -X POST "${GATEWAY_URL}/api/message/send" \
  -H "Content-Type: application/json" \
  -d "{
    \"channel\": \"whatsapp\",
    \"to\": \"${TO}\",
    \"message\": $(echo "$MESSAGE" | jq -Rs .)
  }" | jq -r '.success // false'
