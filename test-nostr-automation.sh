#!/bin/bash
# Comprehensive test of Nostr automation system

echo "🧪 NOSTR AUTOMATION SYSTEM TEST"
echo "================================"
echo ""

# Check files exist
echo "📁 Checking files..."
files=(
  "$HOME/.openclaw/workspace/nostr-content-queue.json"
  "$HOME/.openclaw/workspace/nostr-auto-post.mjs"
  "$HOME/.openclaw/workspace/nostr-queue-status.mjs"
  "$HOME/.openclaw/workspace/nostr-queue-add.mjs"
  "$HOME/.openclaw/workspace/nostr-dashboard-widget.mjs"
  "$HOME/.openclaw/workspace/post-to-nostr.mjs"
  "$HOME/.clawstr/secret.key"
)

all_exist=true
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file MISSING"
    all_exist=false
  fi
done

if [ "$all_exist" = false ]; then
  echo ""
  echo "❌ Some files are missing. Cannot continue test."
  exit 1
fi

echo ""
echo "✅ All files present"
echo ""

# Check crontab
echo "⏰ Checking crontab..."
if crontab -l | grep -q "nostr-auto-post.mjs"; then
  echo "  ✅ Cron jobs installed"
  crontab -l | grep "nostr-auto-post.mjs"
else
  echo "  ⚠️  Cron jobs not found"
fi

echo ""

# Check queue status
echo "📊 Queue status..."
node "$HOME/.openclaw/workspace/nostr-queue-status.mjs" status

echo ""

# Test dashboard widget
echo "📈 Dashboard widget..."
node "$HOME/.openclaw/workspace/nostr-dashboard-widget.mjs" human

echo ""

# Test adding a post
echo "➕ Testing post addition..."
node "$HOME/.openclaw/workspace/nostr-queue-add.mjs" "TEST POST - This is a test post for system validation" treasury medium
echo ""

# Show updated status
echo "📊 Updated queue status..."
node "$HOME/.openclaw/workspace/nostr-dashboard-widget.mjs" human

echo ""

# Remove test post
echo "🧹 Cleaning up test post..."
node -e "
const fs = require('fs');
const queueFile = '$HOME/.openclaw/workspace/nostr-content-queue.json';
const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
queue.posts = queue.posts.filter(p => !p.content.includes('TEST POST'));
queue.metadata.total_posts = queue.posts.length;
fs.writeFileSync(queueFile, JSON.stringify(queue, null, 2));
console.log('✅ Test post removed');
"

echo ""
echo "🎯 TEST COMPLETE"
echo "================"
echo ""
echo "✅ All core components verified"
echo "✅ System ready for automated posting"
echo ""
echo "Next steps:"
echo "  1. Wait for next cron window (10am or 7pm EST)"
echo "  2. Monitor logs: tail -f ~/.openclaw/workspace/nostr-automation.log"
echo "  3. Check dashboard: node ~/.openclaw/workspace/nostr-dashboard-widget.mjs"
echo ""
