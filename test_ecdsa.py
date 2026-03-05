#!/usr/bin/env python3
"""
Simplified secp256k1 verification using raw operations.
This should be compatible with noble-secp256k1.
"""

import hashlib
import ecdsa  # Try using the ecdsa library instead

def verify_signature_ecdsa(message: bytes, signature_hex: str, public_key_hex: str) -> bool:
    """
    Verify using the ecdsa library which may be more compatible.
    """
    try:
        from ecdsa import SECP256k1, VerifyingKey, BadSignatureError
        
        # Parse signature
        sig_bytes = bytes.fromhex(signature_hex)
        
        # Parse public key (compressed format)
        pk_bytes = bytes.fromhex(public_key_hex)
        
        # Load verifying key from compressed format
        vk = VerifyingKey.from_string(pk_bytes, curve=SECP256k1)
        
        # Verify (ecdsa library expects the message hash)
        message_hash = hashlib.sha256(message).digest()
        
        # Try verification with raw signature
        vk.verify(sig_bytes, message, hashfunc=hashlib.sha256)
        
        return True
        
    except BadSignatureError:
        print("Bad signature")
        return False
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

# Test
if __name__ == "__main__":
    import json
    
    attestation = {"agent_id":"maxi-0001","protocol":"lightning","transaction_reference":"test_tx_12345","timestamp":"2026-03-05T19:30:00.000Z","preimage":"test_preimage_value","direction":"inbound","amount_sats":1000,"counterparty":"TestUser","memo":None,"public_key":"033f87be3bdc64355fe611071e1b71bf0637119c021c73c56a9e72acb63ab179be"}
    message = json.dumps(attestation)
    signature = '316ef51be860bd176ec2c92049d4a112d8a8d0778a5ba10904f9590f6d6f320644027d9f275664d3840223a53feeb113029a893de5af39c3f2783ce3385cf7ed'
    public_key = '033f87be3bdc64355fe611071e1b71bf0637119c021c73c56a9e72acb63ab179be'
    
    result = verify_signature_ecdsa(message.encode('utf-8'), signature, public_key)
    print(f"Verification result: {result}")
