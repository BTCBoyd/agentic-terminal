#!/bin/bash
#
# Moltbook API Monitor
# 
# Properly handles Moltbook API with:
# - Rate limit detection  
# - Proper error handling (distinguishes rate limits from empty platform)
# - API-first approach (not browser scraping)
#

CREDS_FILE="/home/futurebit/.openclaw/workspace/.moltbook-credentials"
API_BASE="https://www.moltbook.com/api/v1"

# Load API key
if [ ! -f "$CREDS_FILE" ]; then
  echo "❌ Credentials file not found: $CREDS_FILE"
  exit 1
fi

API_KEY=$(grep -o '"api_key": "[^"]*"' "$CREDS_FILE" | cut -d'"' -f4)

if [ -z "$API_KEY" ]; then
  echo "❌ Could not extract API key from credentials"
  exit 1
fi

echo "=== Moltbook API Status Check ==="
echo ""

# Check /me endpoint
echo "1. Checking /me endpoint..."
ME_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $API_KEY" \
  "$API_BASE/me" 2>&1)

HTTP_CODE=$(echo "$ME_RESPONSE" | tail -n1)
BODY=$(echo "$ME_RESPONSE" | sed '$d')

# Check for rate limit
if echo "$BODY" | grep -q "rate_limited"; then
  echo "   ❌ RATE_LIMITED: Too many requests"
  echo ""
  echo "⚠️  RATE LIMITED — Cannot proceed with session"
  echo ""
  echo "📋 Recommendation: Wait 6+ hours before next session"
  echo "   Last successful session was likely within 6 hours"
  echo ""
  echo "⏰ Next recommended attempt: $(date -d '+6 hours' '+%Y-%m-%d %H:%M %Z')"
  exit 2  # Exit code 2 = rate limited
fi

# Check for auth errors
if [ "$HTTP_CODE" = "401" ] || echo "$BODY" | grep -q "unauthorized"; then
  echo "   ❌ UNAUTHORIZED: Invalid API key"
  echo ""
  echo "🔑 Check .moltbook-credentials file"
  exit 3
fi

# Check for other errors
if [ "$HTTP_CODE" != "200" ]; then
  echo "   ❌ HTTP $HTTP_CODE: $BODY"
  exit 1
fi

# Success - parse user info
AGENT_NAME=$(echo "$BODY" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
KARMA=$(echo "$BODY" | grep -o '"karma":[0-9]*' | cut -d':' -f2)
FOLLOWERS=$(echo "$BODY" | grep -o '"followers":\[[^]]*\]' | grep -o '"' | wc -l)
FOLLOWING=$(echo "$BODY" | grep -o '"following":\[[^]]*\]' | grep -o '"' | wc -l)

echo "   ✅ Logged in as: ${AGENT_NAME:-maxiagent}"
echo "   📊 Karma: ${KARMA:-0}"
echo ""

# Check feed
echo "2. Checking feed..."
FEED_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $API_KEY" \
  "$API_BASE/feed" 2>&1)

FEED_CODE=$(echo "$FEED_RESPONSE" | tail -n1)
FEED_BODY=$(echo "$FEED_RESPONSE" | sed '$d')

if echo "$FEED_BODY" | grep -q "rate_limited"; then
  echo "   ❌ RATE_LIMITED on feed endpoint"
elif [ "$FEED_CODE" = "200" ]; then
  POST_COUNT=$(echo "$FEED_BODY" | grep -o '"id":"[^"]*"' | wc -l)
  echo "   ✅ Found $POST_COUNT posts in feed"
else
  echo "   ⚠️  Feed check returned HTTP $FEED_CODE"
fi

# Check submolts
echo ""
echo "3. Checking submolts..."
SUBMOLTS_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $API_KEY" \
  "$API_BASE/submolts" 2>&1)

SUBMOLTS_CODE=$(echo "$SUBMOLTS_RESPONSE" | tail -n1)
SUBMOLTS_BODY=$(echo "$SUBMOLTS_RESPONSE" | sed '$d')

if echo "$SUBMOLTS_BODY" | grep -q "rate_limited"; then
  echo "   ❌ RATE_LIMITED on submolts endpoint"
elif [ "$SUBMOLTS_CODE" = "200" ]; then
  SUBMOLT_COUNT=$(echo "$SUBMOLTS_BODY" | grep -o '"name":"[^"]*"' | wc -l)
  echo "   ✅ Found $SUBMOLT_COUNT submolts"
else
  echo "   ⚠️  Submolts check returned HTTP $SUBMOLTS_CODE"
fi

echo ""
echo "=== Status: READY for session ==="
echo "Platform is ACTIVE with content"
exit 0
