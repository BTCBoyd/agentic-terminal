#!/bin/bash
# Quick script to convert and send documents to Boyd via WhatsApp
# Usage: ./send-pdf-to-boyd.sh my-document.md "Optional caption"

set -e

if [ $# -lt 1 ]; then
    echo "Usage: $0 document.md [caption]"
    echo ""
    echo "Example:"
    echo "  $0 business-plan.md \"Here's the business plan!\""
    exit 1
fi

INPUT="$1"
CAPTION="${2:-Document from Maxi}"
BASENAME=$(basename "${INPUT%.md}")

# Step 1: Convert to HTML
echo "📝 Converting $INPUT to HTML..."
./md2doc.sh "$INPUT" "${BASENAME}.html"

# Step 2: Send via WhatsApp
echo "📤 Sending to Boyd via WhatsApp..."

# Method 1: Try sending to Boyd by name
if openclaw message send --channel=whatsapp --target="Boyd" \
    --file-path="${BASENAME}.html" --caption="$CAPTION" 2>/dev/null; then
    echo "✅ Sent successfully to Boyd!"
else
    echo "⚠️  Auto-send failed. Use this command manually:"
    echo ""
    echo "openclaw message send --channel=whatsapp \\"
    echo "    --target=\"Boyd\" \\"
    echo "    --file-path=\"$(pwd)/${BASENAME}.html\" \\"
    echo "    --caption=\"$CAPTION\""
    echo ""
    echo "Or use Boyd's phone number:"
    echo "openclaw message send --channel=whatsapp \\"
    echo "    --target=\"+1234567890\" \\"
    echo "    --file-path=\"$(pwd)/${BASENAME}.html\" \\"
    echo "    --caption=\"$CAPTION\""
fi

echo ""
echo "📄 File ready: ${BASENAME}.html"
ls -lh "${BASENAME}.html"
