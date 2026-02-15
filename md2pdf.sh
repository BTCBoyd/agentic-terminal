#!/bin/bash
# md2pdf.sh - Simple Markdown to PDF converter
# Usage: ./md2pdf.sh input.md output.pdf

set -e

if [ $# -lt 2 ]; then
    echo "Usage: $0 input.md output.pdf"
    exit 1
fi

INPUT="$1"
OUTPUT="$2"
TEMP_HTML="/tmp/md2pdf_$$.html"

# Convert markdown to HTML with pandoc
pandoc "$INPUT" -s -o "$TEMP_HTML" \
    --metadata title="Document" \
    --css=data:text/css,body{font-family:Arial,sans-serif;margin:40px;line-height:1.6;max-width:800px;}h1,h2,h3{color:%23333;}

# Check if wkhtmltopdf is available
if command -v wkhtmltopdf >/dev/null 2>&1; then
    wkhtmltopdf "$TEMP_HTML" "$OUTPUT"
elif command -v weasyprint >/dev/null 2>&1; then
    weasyprint "$TEMP_HTML" "$OUTPUT"
else
    # Fallback: Keep HTML and inform user
    echo "Warning: No HTML→PDF converter found (wkhtmltopdf or weasyprint)"
    echo "Installing wkhtmltopdf..."
    if sudo apt install -y wkhtmltopdf >/dev/null 2>&1; then
        wkhtmltopdf "$TEMP_HTML" "$OUTPUT"
    else
        echo "Error: Could not install converter. HTML saved at: $TEMP_HTML"
        mv "$TEMP_HTML" "${OUTPUT%.pdf}.html"
        exit 1
    fi
fi

# Cleanup
rm -f "$TEMP_HTML"

echo "PDF created: $OUTPUT"
ls -lh "$OUTPUT"
