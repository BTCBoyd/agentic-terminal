#!/bin/bash
#
# Example: Pay an L402 endpoint
# This works with any Lightning-based paid API
#

# Ensure API key is set
if [ -z "$LIGHTNING_WALLET_API_KEY" ]; then
    echo "Error: LIGHTNING_WALLET_API_KEY not set"
    echo "Run: export LIGHTNING_WALLET_API_KEY=your_key_here"
    exit 1
fi

# Example: Pay for a fortune from Lightning Faucet's L402 endpoint
echo "Paying L402 endpoint..."
lw pay-api "https://lightningfaucet.com/api/l402/fortune"

# Example: Pay with POST request and custom body
# lw pay-api "https://api.example.com/l402/generate" \
#     --method POST \
#     --body '{"prompt": "Write a haiku about Bitcoin"}' \
#     --max-sats 500
