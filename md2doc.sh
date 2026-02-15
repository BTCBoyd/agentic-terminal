#!/bin/bash
# md2doc.sh - Convert Markdown to shareable document (HTML or PDF)
# Usage: ./md2doc.sh input.md [output.html|output.pdf]

set -e

if [ $# -lt 1 ]; then
    echo "Usage: $0 input.md [output]"
    echo "  If no output specified, creates input.html"
    exit 1
fi

INPUT="$1"
OUTPUT="${2:-${INPUT%.md}.html}"

# Determine output format
EXT="${OUTPUT##*.}"

case "$EXT" in
    pdf)
        # Try PDF generation methods in order of preference
        TEMP_HTML="/tmp/md2doc_$$.html"
        
        # Create styled HTML first
        pandoc "$INPUT" -s -o "$TEMP_HTML" \
            --metadata title="Document" \
            --metadata date="$(date '+%B %d, %Y')" \
            -c "data:text/css,
                body { font-family: Georgia, serif; margin: 60px auto; max-width: 750px; line-height: 1.7; color: %23333; }
                h1 { color: %231a1a1a; font-size: 2.5em; border-bottom: 2px solid %23ddd; padding-bottom: 10px; }
                h2 { color: %232a2a2a; font-size: 2em; margin-top: 1.5em; }
                h3 { color: %233a3a3a; font-size: 1.5em; }
                code { background: %23f4f4f4; padding: 2px 6px; border-radius: 3px; }
                pre { background: %23f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
                blockquote { border-left: 4px solid %23ddd; margin-left: 0; padding-left: 20px; color: %23666; }
                a { color: %23007bff; text-decoration: none; }
                a:hover { text-decoration: underline; }
                ul, ol { line-height: 1.8; }
            "
        
        # Try different PDF converters
        if command -v wkhtmltopdf >/dev/null 2>&1; then
            wkhtmltopdf -q --enable-local-file-access "$TEMP_HTML" "$OUTPUT" 2>/dev/null
            rm "$TEMP_HTML"
        elif command -v weasyprint >/dev/null 2>&1; then
            weasyprint "$TEMP_HTML" "$OUTPUT"
            rm "$TEMP_HTML"
        else
            echo "⚠️  PDF converters not installed. Creating HTML instead..."
            mv "$TEMP_HTML" "${OUTPUT%.pdf}.html"
            echo "📄 HTML created: ${OUTPUT%.pdf}.html"
            echo ""
            echo "To install PDF support, run:"
            echo "  sudo apt install -y wkhtmltopdf"
            exit 0
        fi
        ;;
        
    html|htm)
        # Create beautiful standalone HTML
        pandoc "$INPUT" -s -o "$OUTPUT" \
            --metadata title="$(basename ${INPUT%.md})" \
            --metadata date="$(date '+%B %d, %Y')" \
            -c "data:text/css,
                body { font-family: Georgia, serif; margin: 60px auto; max-width: 750px; line-height: 1.7; color: %23333; }
                h1 { color: %231a1a1a; font-size: 2.5em; border-bottom: 2px solid %23ddd; padding-bottom: 10px; }
                h2 { color: %232a2a2a; font-size: 2em; margin-top: 1.5em; }
                h3 { color: %233a3a3a; font-size: 1.5em; }
                code { background: %23f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
                pre { background: %23f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
                pre code { background: none; padding: 0; }
                blockquote { border-left: 4px solid %23ddd; margin-left: 0; padding-left: 20px; color: %23666; font-style: italic; }
                a { color: %23007bff; text-decoration: none; }
                a:hover { text-decoration: underline; }
                ul, ol { line-height: 1.8; }
                table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                th, td { border: 1px solid %23ddd; padding: 12px; text-align: left; }
                th { background-color: %23f8f8f8; font-weight: bold; }
            "
        ;;
        
    *)
        echo "Error: Unsupported output format: $EXT"
        echo "Supported formats: .html, .pdf"
        exit 1
        ;;
esac

echo "✅ Created: $OUTPUT"
ls -lh "$OUTPUT"
