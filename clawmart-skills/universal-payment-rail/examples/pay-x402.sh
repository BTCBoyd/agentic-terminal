#!/bin/bash
#
# Example: Pay an x402 endpoint (USDC on Base)
# This works with any x402-compatible API
#

# Ensure API key is set
if [ -z "$LIGHTNING_WALLET_API_KEY" ]; then
    echo "Error: LIGHTNING_WALLET_API_KEY not set"
    exit 1
fi

# Example: Pay an x402 endpoint
# Note: Replace with actual x402 endpoint URL
# lw pay-api "https://api.moltspay.com/x402/generate" \
#     --method POST \
#     --body '{"service": "image_gen", "params": {}}'

echo "To use x402 payments:"
echo "1. Ensure your wallet has USDC on Base (automatically handled)"
echo "2. Use lw pay-api with any x402 endpoint"
echo "3. The protocol is auto-detected — same command as L402"
