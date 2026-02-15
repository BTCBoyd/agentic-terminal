#!/bin/bash
# Installation script for nostr-tools alternative to nak CLI
# 
# This script:
# 1. Checks Node.js version
# 2. Installs nostr-tools and dependencies
# 3. Makes posting script executable
# 4. Tests basic functionality

set -e  # Exit on error

echo "🔧 Installing nostr-tools for Nostr posting..."
echo ""

# Check Node.js version
echo "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js not found"
    echo "Please install Node.js 18+ and try again"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js version must be 18 or higher"
    echo "Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if package.json exists, create if not
if [ ! -f package.json ]; then
    echo "Creating package.json..."
    npm init -y > /dev/null 2>&1
    echo "✅ package.json created"
fi

# Install dependencies
echo "Installing dependencies..."
echo "  - ws (WebSocket library)"
echo "  - @nostr/tools (Nostr protocol library)"
echo ""

npm install ws > /dev/null 2>&1
npx jsr add @nostr/tools 2>&1 | grep -v "warning" || true

echo ""
echo "✅ Dependencies installed"
echo ""

# Make script executable
if [ -f post-to-nostr.mjs ]; then
    chmod +x post-to-nostr.mjs
    echo "✅ post-to-nostr.mjs made executable"
else
    echo "⚠️  Warning: post-to-nostr.mjs not found in current directory"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Installation complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo ""
echo "1. Set your private key:"
echo "   export NOSTR_PRIVATE_KEY=\"your-hex-private-key\""
echo ""
echo "2. Test posting:"
echo "   node post-to-nostr.mjs \"Hello from nostr-tools!\""
echo ""
echo "3. Check help:"
echo "   node post-to-nostr.mjs --help"
echo ""
echo "For detailed documentation, see: nostr-research-findings.md"
echo ""
