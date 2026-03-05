#!/bin/bash
#
# Example: Multi-agent setup with budget limits
# Create specialized agents with isolated spending caps
#

# Ensure API key is set
if [ -z "$LIGHTNING_WALLET_API_KEY" ]; then
    echo "Error: LIGHTNING_WALLET_API_KEY not set"
    exit 1
fi

echo "=== Creating Multi-Agent Setup ==="

# Create specialized agents with budgets
echo "Creating Research Agent (budget: 10,000 sats)..."
RESEARCH_AGENT=$(lw create-agent "Research Agent" --budget 10000)
RESEARCH_ID=$(echo "$RESEARCH_AGENT" | jq -r '.agent_id')
RESEARCH_KEY=$(echo "$RESEARCH_AGENT" | jq -r '.agent_api_key')

echo "Creating Content Agent (budget: 5,000 sats)..."
CONTENT_AGENT=$(lw create-agent "Content Agent" --budget 5000)
CONTENT_ID=$(echo "$CONTENT_AGENT" | jq -r '.agent_id')
CONTENT_KEY=$(echo "$CONTENT_AGENT" | jq -r '.agent_api_key')

echo "Creating Code Agent (budget: 15,000 sats)..."
CODE_AGENT=$(lw create-agent "Code Agent" --budget 15000)
CODE_ID=$(echo "$CODE_AGENT" | jq -r '.agent_id')
CODE_KEY=$(echo "$CODE_AGENT" | jq -r '.agent_api_key')

echo ""
echo "=== Agents Created ==="
echo "Research Agent: ID=$RESEARCH_ID"
echo "Content Agent: ID=$CONTENT_ID"
echo "Code Agent: ID=$CODE_ID"

echo ""
echo "=== Funding Agents ==="
echo "(You need to have funds in your operator wallet first)"
echo ""
echo "To fund:"
echo "  lw fund-agent $RESEARCH_ID 10000"
echo "  lw fund-agent $CONTENT_ID 5000"
echo "  lw fund-agent $CODE_ID 15000"

echo ""
echo "=== Agent API Keys (save these) ==="
echo "Research: $RESEARCH_KEY"
echo "Content: $CONTENT_KEY"
echo "Code: $CODE_KEY"

echo ""
echo "Each agent can now operate independently with their budget."
