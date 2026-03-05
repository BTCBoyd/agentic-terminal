#!/bin/bash
#
# Universal Payment Rail Skill - Quick Test Script
# Run this after installing to verify everything works
#

set -e

echo "=== Universal Payment Rail Skill - Test Script ==="
echo ""

# Check if lw is installed
if ! command -v lw &> /dev/null; then
    echo "❌ lightning-wallet-mcp not found. Installing..."
    npm install -g lightning-wallet-mcp
fi

echo "✅ lightning-wallet-mcp installed"

# Check for API key
if [ -z "$LIGHTNING_WALLET_API_KEY" ]; then
    echo ""
    echo "⚠️  No API key found. You need to register first:"
    echo ""
    echo "   export LIGHTNING_WALLET_API_KEY=\$(lw register --name \"My Agent\" | jq -r '.api_key')"
    echo ""
    echo "Run that command, then run this test script again."
    exit 1
fi

echo "✅ API key configured"

# Test 1: Check balance
echo ""
echo "Test 1: Checking balance..."
BALANCE=$(lw balance | jq -r '.balance_sats')
echo "   Balance: $BALANCE sats"

if [ "$BALANCE" -eq 0 ]; then
    echo ""
    echo "⚠️  Wallet is empty. To fund it:"
    echo "   lw deposit 10000  # Generate invoice for 10,000 sats"
    echo ""
    echo "Pay the invoice, then continue testing."
else
    echo "✅ Wallet has funds"
fi

# Test 2: Service info
echo ""
echo "Test 2: Checking service status..."
lw info | jq '.capabilities'

# Test 3: List agents (if any)
echo ""
echo "Test 3: Listing agents..."
AGENTS=$(lw list-agents 2>/dev/null || echo "[]")
AGENT_COUNT=$(echo "$AGENTS" | jq length)
echo "   Found $AGENT_COUNT agent(s)"

if [ "$AGENT_COUNT" -eq 0 ]; then
    echo ""
    echo "💡 Tip: Create your first agent:"
    echo "   lw create-agent \"My First Agent\" --budget 5000"
fi

echo ""
echo "=== Test Complete ==="
echo ""
echo "Next steps:"
echo "1. Fund your wallet: lw deposit <amount>"
echo "2. Create agents: lw create-agent <name> --budget <sats>"
echo "3. Pay APIs: lw pay-api <url>"
echo ""
echo "Full documentation: SKILL.md"
