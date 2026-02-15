#!/bin/bash
# Quick check using OpenClaw CLI to fetch Primal profile via browser

openclaw browser snapshot "https://primal.net/p/npub187rmuw7uvs64les3qu0pkudlqcm3r8qzr3eu2657w2ktvw430xlq24lcna" \
  --profile openclaw \
  --timeout 15000 \
  > /tmp/primal-snapshot.txt 2>&1

if [ -f /tmp/primal-snapshot.txt ]; then
  echo "✅ Browser snapshot captured"
  
  # Check for reply indicators in the snapshot
  grep -i "reply\|replies\|1\|comment" /tmp/primal-snapshot.txt | head -10
else
  echo "❌ Failed to capture snapshot"
fi
