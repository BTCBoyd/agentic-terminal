#!/bin/bash
# Observer Protocol Live Demo Script
# Run these commands during your talk

echo "=== Observer Protocol — Demo ==="
echo ""

# 1. Show the live feed
echo "1. Live transaction feed:"
curl -s https://api.observerprotocol.org/observer/feed | jq '.events | length' 
echo " events in registry"
echo ""

# 2. Show Maxi's latest verified transaction
echo "2. Maxi's latest verified transaction:"
curl -s https://api.observerprotocol.org/observer/feed | jq '.events[-1] | {event_id, verified, cryptographic_verification, protocol}'
echo ""

# 3. Show Maxi's profile
echo "3. Maxi's verified agent profile:"
curl -s https://api.observerprotocol.org/observer/agents/maxi-0001 | jq '{agent_id, alias, verified, verified_tx_count}'
echo ""

# 4. Show overall stats
echo "4. Protocol stats:"
curl -s https://api.observerprotocol.org/observer/trends | jq '{total_events, total_verified_agents}'
echo ""

echo "=== End Demo ==="
