#!/usr/bin/env python3
"""Debug the exact message being verified"""

import sys
sys.path.insert(0, '/home/futurebit/.openclaw/workspace/observer-protocol')
from crypto_verification import verify_signature_simple
import json
import hashlib

# Simulating what the server does
agent_id = "maxi-0001"
protocol = "lightning"
transaction_reference = "test"  # Will be different each time
timestamp = "2026-03-05T12:00:00Z"
optional_metadata = json.dumps({
    "preimage": "test_preimage_123",
    "direction": "inbound",
    "amount_sats": 1000,
    "counterparty": "Test",
    "memo": None
})

public_key = "033f87be3bdc64355fe611071e1b71bf0637119c021c73c56a9e72acb63ab179be"

# Build attestation exactly as server does
attestation = {
    "agent_id": agent_id,
    "protocol": protocol,
    "transaction_reference": transaction_reference,
    "timestamp": timestamp,
}

if optional_metadata:
    try:
        metadata = json.loads(optional_metadata)
        attestation["preimage"] = metadata.get("preimage")
        attestation["direction"] = metadata.get("direction", "outbound")
        attestation["amount_sats"] = metadata.get("amount_sats", 0)
        attestation["counterparty"] = metadata.get("counterparty", "unknown")
        attestation["memo"] = metadata.get("memo")
    except:
        pass

attestation["public_key"] = public_key

message = json.dumps(attestation)
message_bytes = message.encode('utf-8')

print("Server-side message:")
print(message)
print()
print("Message hash (SHA256):")
print(hashlib.sha256(message_bytes).hexdigest())
print()

# Now we need a valid signature for this message
# Let's generate one using the same method as the client
print("To test, we need to generate a signature with the private key...")
print("Run this in Node.js:")
print(f"""
const attestation = {json.dumps(attestation, indent=2)};
const message = JSON.stringify(attestation);
console.log("Message:", message);
// ... sign with secp256k1 ...
""")
