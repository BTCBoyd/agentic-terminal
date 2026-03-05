#!/usr/bin/env python3
"""Test server-side verification directly"""

import sys
sys.path.insert(0, '/home/futurebit/.openclaw/workspace/observer-protocol')
from crypto_verification import verify_signature_simple
import json

# Test data matching the client
attestation = {
    "agent_id": "maxi-0001",
    "protocol": "lightning", 
    "transaction_reference": "test_verify_123",
    "timestamp": "2026-03-05T12:00:00Z",
}

message = json.dumps(attestation)
message_bytes = message.encode('utf-8')

# This is a real signature from the client side (we need to capture one)
# For now, let's test with known values

# Public key from database
public_key = "033f87be3bdc64355fe611071e1b71bf0637119c021c73c56a9e72acb63ab179be"

print("Testing with:")
print(f"Message: {message}")
print(f"Public key: {public_key}")

# Try to generate a test signature using coincurve or another method
# For now, let's just test the public key parsing

from cryptography.hazmat.primitives.asymmetric import ec

try:
    pk_bytes = bytes.fromhex(public_key)
    print(f"Public key bytes: {len(pk_bytes)} bytes, first byte: {hex(pk_bytes[0])}")
    
    # Try to load compressed key
    public_key_obj = ec.EllipticCurvePublicKey.from_encoded_point(
        ec.SECP256K1(),
        pk_bytes
    )
    print("✅ Public key loaded successfully")
    
    # Get the uncompressed form
    pub_nums = public_key_obj.public_numbers()
    print(f"X: {pub_nums.x}")
    print(f"Y: {pub_nums.y}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
