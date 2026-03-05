#!/bin/bash
#
# Observer Protocol Registration Script
# Automatically register your agent with cryptographic verification
#
# This script is INCLUDED with your Universal Payment Rail skill
#

set -e

echo "=== Observer Protocol Registration ==="
echo ""
echo "Building verifiable trust for your AI agent..."
echo ""

# Check if API key is set
if [ -z "$LIGHTNING_WALLET_API_KEY" ]; then
    echo "❌ Error: LIGHTNING_WALLET_API_KEY not set"
    echo "   Run: export LIGHTNING_WALLET_API_KEY=your_key_here"
    exit 1
fi

# Get operator info to extract public key
echo "🔍 Fetching your Lightning wallet info..."
OPERATOR_INFO=$(curl -s -X POST https://lightningfaucet.com/ai-agents/api.php \
    -d "{\"action\":\"get_info\",\"api_key\":\"$LIGHTNING_WALLET_API_KEY\"}")

# Check if we got valid response
if echo "$OPERATOR_INFO" | jq -e '.pubkey' > /dev/null 2>&1; then
    PUBKEY=$(echo "$OPERATOR_INFO" | jq -r '.pubkey')
    echo "✅ Found Lightning pubkey: $PUBKEY"
else
    echo "⚠️  Could not fetch pubkey. Make sure your wallet is funded."
    echo "   Continuing with manual registration..."
    PUBKEY=""
fi

# Generate agent keypair for Observer Protocol
echo ""
echo "🔑 Generating cryptographic identity..."

# Use OpenSSL to generate a keypair
AGENT_KEY=$(openssl rand -hex 32)
echo "$AGENT_KEY" > ~/.observer-protocol-agent.key

# Derive public key (simplified - in production use proper key derivation)
AGENT_PUBKEY=$(echo -n "$AGENT_KEY" | sha256sum | cut -d' ' -f1)

# Generate a friendly name
AGENT_NAME="agent-$(date +%s | tail -c 6)"

echo "✅ Identity generated: $AGENT_NAME"

# Register with Observer Protocol
echo ""
echo "📝 Registering with Observer Protocol..."

# Check if we have a pubkey from Lightning wallet
if [ -n "$PUBKEY" ]; then
    # Use Lightning pubkey for verification
    REGISTRATION=$(curl -s -X POST https://api.observerprotocol.org/v1/agents/register \
        -H "Content-Type: application/json" \
        -d "{
            \"agent_name\": \"$AGENT_NAME\",
            \"public_key\": \"$AGENT_PUBKEY\",
            \"lightning_pubkey\": \"$PUBKEY\",
            \"source\": \"universal-payment-rail-skill\",
            \"version\": \"1.0\"
        }") 2>/dev/null || echo '{"error": "API unavailable"}'
else
    # Register without Lightning pubkey for now
    REGISTRATION=$(curl -s -X POST https://api.observerprotocol.org/v1/agents/register \
        -H "Content-Type: application/json" \
        -d "{
            \"agent_name\": \"$AGENT_NAME\",
            \"public_key\": \"$AGENT_PUBKEY\",
            \"source\": \"universal-payment-rail-skill\",
            \"version\": \"1.0\"
        }") 2>/dev/null || echo '{"error": "API unavailable"}'
fi

# Check registration result
if echo "$REGISTRATION" | jq -e '.agent_id' > /dev/null 2>&1; then
    AGENT_ID=$(echo "$REGISTRATION" | jq -r '.agent_id')
    VERIFICATION_STATUS=$(echo "$REGISTRATION" | jq -r '.verification_status')
    
    echo "✅ Registration successful!"
    echo ""
    echo "🆔 Your Agent ID: $AGENT_ID"
    echo "🔐 Verification Status: $VERIFICATION_STATUS"
    echo ""
    echo "💾 Credentials saved to: ~/.observer-protocol-agent.key"
    echo ""
    echo "🔗 Your verification badge:"
    echo "   https://api.observerprotocol.org/v1/agents/$AGENT_ID/badge"
    echo ""
    echo "📊 View your reputation graph:"
    echo "   https://api.observerprotocol.org/v1/agents/$AGENT_ID/reputation"
    echo ""
    echo "=== Registration Complete ==="
    echo ""
    echo "Next steps:"
    echo "1. Every payment you make is now automatically attested"
    echo "2. Other agents can verify your transaction history"
    echo "3. Build reputation with each verified transaction"
    echo ""
    echo "To check your status anytime:"
    echo "   curl https://api.observerprotocol.org/v1/agents/$AGENT_ID"
    
else
    echo "⚠️  Registration encountered an issue:"
    echo "$REGISTRATION" | jq -r '.error // .message // "Unknown error"'
    echo ""
    echo "You can retry later or register manually at:"
    echo "   https://api.observerprotocol.org"
    echo ""
    echo "Your generated keys are saved in case you need them:"
    echo "   ~/.observer-protocol-agent.key"
fi

echo ""
echo "Note: Observer Protocol is free and optional. Your payment rail works"
echo "      without it, but you'll miss out on verifiable reputation."
