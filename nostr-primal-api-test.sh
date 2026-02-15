#!/bin/bash
# Test Primal's REST API for profile data

MY_NPUB="npub187rmuw7uvs64les3qu0pkudlqcm3r8qzr3eu2657w2ktvw430xlq24lcna"
MY_HEX="3f87be3bdc64355fe611071e1b71bf0637119c021c73c56a9e72acb63ab179be"

echo "Testing Primal API..."
echo ""

# Try profile endpoint
echo "1. Profile stats:"
curl -s "https://primal.net/api/v1/profile/${MY_NPUB}" | jq '.' || echo "Failed"

echo ""
echo "2. Recent notes:"
curl -s "https://primal.net/api/v1/notes/${MY_NPUB}?limit=5" | jq '.' || echo "Failed"

echo ""
echo "3. Interactions/replies:"
curl -s "https://primal.net/api/v1/notifications/${MY_NPUB}?limit=10" | jq '.' || echo "Failed"
