#!/bin/bash

# GA4 tracking code to insert
GA4_CODE='<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-E7QS7E2R8Y"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('"'"'config'"'"', '"'"'G-E7QS7E2R8Y'"'"');
</script>'

# Function to add GA4 to a single HTML file
add_ga4_to_file() {
    local file="$1"
    
    # Check if file already has GA4 tracking
    if grep -q "G-E7QS7E2R8Y" "$file"; then
        echo "⏭️  Skipping $file (already has GA4)"
        return
    fi
    
    # Check if file has <head> tag
    if ! grep -q "<head>" "$file"; then
        echo "⚠️  Skipping $file (no <head> tag found)"
        return
    fi
    
    # Insert GA4 code after <head> tag
    sed -i '/<head>/a\'"$(echo "$GA4_CODE" | sed 's/$/\\n/' | tr -d '\n')" "$file"
    echo "✅ Added GA4 to $file"
}

# Process all HTML files in capitalduro-mx
echo "📊 Adding GA4 tracking to Capital Duro..."
find /home/futurebit/.openclaw/workspace/capitalduro-mx -name "*.html" -type f | while read file; do
    add_ga4_to_file "$file"
done

# Process all HTML files in aprenderbitcoin-mx
echo ""
echo "📊 Adding GA4 tracking to AprenderBitcoin..."
find /home/futurebit/.openclaw/workspace/aprenderbitcoin-mx -name "*.html" -type f 2>/dev/null | while read file; do
    add_ga4_to_file "$file"
done

# Process maximoon files (if they exist)
echo ""
echo "📊 Adding GA4 tracking to Maxi Moon..."
find /home/futurebit/.openclaw/workspace -name "*maximoon*.html" -o -name "*maxi-moon*.html" 2>/dev/null | while read file; do
    add_ga4_to_file "$file"
done

echo ""
echo "🎉 GA4 tracking installation complete!"
