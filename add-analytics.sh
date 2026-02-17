#!/bin/bash

ANALYTICS_CODE='<!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-E7QS7E2R8Y"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag("js", new Date());
        gtag("config", "G-E7QS7E2R8Y");
    </script>'

add_analytics() {
    local file=$1
    if [ -f "$file" ]; then
        if ! grep -q "G-E7QS7E2R8Y" "$file"; then
            # Create temp file with analytics added before </head>
            awk -v code="$ANALYTICS_CODE" '
                /<\/head>/ { print code; print; next }
                { print }
            ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
            echo "✓ Added analytics to $file"
        else
            echo "- Skipped $file (already has analytics)"
        fi
    fi
}

# BitcoinSingularity
cd /home/futurebit/.openclaw/workspace/bitcoinsingularity-website
for file in index.html about.html research.html evidence.html tools.html knowledge.html chat.html btc-20m-countdown.html article-*.html; do
    add_analytics "$file"
done

# AprenderBitcoin
cd /home/futurebit/.openclaw/workspace/aprenderbitcoin-website
for file in *.html; do
    add_analytics "$file"
done

# CapitalDuro
cd /home/futurebit/.openclaw/workspace/capitalduro-website
for file in *.html; do
    add_analytics "$file"
done
