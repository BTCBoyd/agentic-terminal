#!/bin/bash
#
# Transaction Attestation Script
# Record a payment to Observer Protocol for verifiable reputation
#
# Usage: lw pay-api <url> | ./attest-transaction.sh
# Or: ./attest-transaction.sh <payment_hash>
#

set -e

echo "=== Observer Protocol Transaction Attestation ==="
echo ""

# Check for agent credentials
if [ ! -f ~/.observer-protocol-agent.key ]; then
    echo "❌ Error: Not registered with Observer Protocol"
    echo "   Run: ./register-observer-protocol.sh"
    exit 1
fi

AGENT_KEY=$(cat ~/.observer-protocol-agent.key)

# Get payment data either from stdin or argument
if [ -n "$1" ]; then
    # Payment hash provided as argument
    PAYMENT_HASH="$1"
    echo "🔍 Looking up payment: $PAYMENT_HASH"
    
    # Fetch transaction details from wallet
    TRANSACTION=$(curl -s -X POST https://lightningfaucet.com/ai-agents/api.php \
        -d "{
            \"action\":\"get_transaction\",
            \"api_key\":\"$LIGHTNING_WALLET_API_KEY\",
            \"payment_hash\":\"$PAYMENT_HASH\"
        }") 2>/dev/null || echo '{}'
else
    # Read from stdin (pipe from lw pay-api)
    echo "📥 Reading transaction data..."
    TRANSACTION=$(cat)
    PAYMENT_HASH=$(echo "$TRANSACTION" | jq -r '.payment_hash // empty')
fi

# Validate we have transaction data
if [ -z "$PAYMENT_HASH" ] || [ "$PAYMENT_HASH" = "null" ]; then
    echo "❌ Error: No valid transaction data found"
    echo "   Usage: lw pay-api <url> | ./attest-transaction.sh"
    echo "   Or:    ./attest-transaction.sh <payment_hash>"
    exit 1
fi

echo "✅ Transaction found: $PAYMENT_HASH"

# Extract transaction details
AMOUNT=$(echo "$TRANSACTION" | jq -r '.amount_sats // .amount // 0')
TIMESTAMP=$(echo "$TRANSACTION" | jq -r '.timestamp // .created_at // empty')
RECIPIENT=$(echo "$TRANSACTION" | jq -r '.destination // .recipient // "unknown"')
DESCRIPTION=$(echo "$TRANSACTION" | jq -r '.description // .memo // "API payment"')

# If timestamp not provided, use current time
if [ -z "$TIMESTAMP" ] || [ "$TIMESTAMP" = "null" ]; then
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
fi

echo "   Amount: $AMOUNT sats"
echo "   Recipient: $RECIPIENT"
echo "   Time: $TIMESTAMP"

# Create attestation
ATTESTATION=$(curl -s -X POST https://api.observerprotocol.org/v1/attestations \
    -H "Content-Type: application/json" \
    -d "{
        \"agent_key\": \"$AGENT_KEY\",
        \"transaction\": {
            \"payment_hash\": \"$PAYMENT_HASH\",
            \"amount_sats\": $AMOUNT,
            \"recipient\": \"$RECIPIENT\",
            \"timestamp\": \"$TIMESTAMP\",
            \"description\": \"$DESCRIPTION\",
            \"protocol\": \"L402\"
        }
    }" 2>/dev/null || echo '{"error": "API unavailable"}')

# Check attestation result
if echo "$ATTESTATION" | jq -e '.attestation_id' > /dev/null 2>&1; then
    ATTESTATION_ID=$(echo "$ATTESTATION" | jq -r '.attestation_id')
    echo ""
    echo "✅ Attestation recorded!"
    echo "🆔 Attestation ID: $ATTESTATION_ID"
    echo ""
    echo "🔗 Verification URL:"
    echo "   https://api.observerprotocol.org/v1/attestations/$ATTESTATION_ID"
    echo ""
    echo "This transaction is now cryptographically verifiable."
    echo "Your reputation score has been updated."
else
    echo ""
    echo "⚠️  Attestation not recorded (API may be unavailable)"
    echo "   Your payment went through, but isn't yet in the reputation graph."
    echo "   You can retry later with: ./attest-transaction.sh $PAYMENT_HASH"
fi

echo ""
