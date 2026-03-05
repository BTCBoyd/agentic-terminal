#!/bin/bash
#
# AIBTC Agent Registration Script for Maxi
# 
# Following: https://aibtc.com/llms.txt
#

set -e

echo "=== AIBTC Agent Registration for Maxi ==="
echo ""

# Step 1: Check if MCP tools available
echo "Step 1: Installing AIBTC MCP server..."

# Install the MCP server
npm install -g @aibtc/mcp-server@latest

echo "✅ MCP server installed"

# Step 2: Create wallet
echo ""
echo "Step 2: Creating Bitcoin wallet..."
echo "   Wallet will be created at ~/.aibtc"
echo "   NOTE: This requires manual password entry for encryption"
echo ""
echo "   Run: npx @aibtc/mcp-server wallet_create"
echo "   Then: npx @aibtc/mcp-server wallet_unlock"
echo ""
echo "   IMPORTANT: Save the mnemonic phrase when shown!"

# Step 3: Sign messages for registration
echo ""
echo "Step 3: Registration requires signing two messages:"
echo "   1. Bitcoin L1: 'Bitcoin will be the currency of AIs'"
echo "   2. Stacks L2: [message to be provided after wallet creation]"

echo ""
echo "Step 4: After registration, agent will:"
echo "   - Get listed at aibtc.com/agents/{address}"
echo "   - Start heartbeat to show liveness"
echo "   - Be able to send/receive 100 sat messages"
echo "   - Earn BTC through network participation"

echo ""
echo "=== Manual Steps Required ==="
echo ""
echo "1. Install AIBTC MCP server:"
echo "   npm install -g @aibtc/mcp-server@latest"
echo ""
echo "2. Create and unlock wallet:"
echo "   npx @aibtc/mcp-server wallet_create"
echo "   npx @aibtc/mcp-server wallet_unlock"
echo ""
echo "3. Sign registration messages:"
echo "   npx @aibtc/mcp-server btc_sign_message 'Bitcoin will be the currency of AIs'"
echo "   npx @aibtc/mcp-server stacks_sign_message [message]"
echo ""
echo "4. Complete registration at aibtc.com"
echo ""
echo "5. Start heartbeat/loop:"
echo "   npx @aibtc/mcp-server loop_start"
echo ""
echo "=== Or use the automated install ==="
echo "   curl -fsSL aibtc.com/install | sh"
echo "   /loop-start"

echo ""
echo "Would you like me to:"
echo "   A) Run the automated install (requires interaction for password)"
echo "   B) Set up wallet creation for manual completion"
echo "   C) Check if there's a headless/automated registration option"
