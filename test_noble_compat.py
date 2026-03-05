#!/usr/bin/env python3
"""
Compatible secp256k1 verification for noble-secp256k1 signatures.
Handles the exact format produced by the Node.js library.
"""

import hashlib

def verify_noble_signature(message: bytes, signature_hex: str, public_key_hex: str) -> bool:
    """
    Verify a signature from @noble/secp256k1.
    
    noble-secp256k1 produces 64-byte compact signatures (r || s).
    Public key is 33-byte compressed format (02/03 || x).
    """
    try:
        # Try using coincurve if available
        try:
            from coincurve import PublicKey, verify_signature
            
            sig_bytes = bytes.fromhex(signature_hex)
            pk_bytes = bytes.fromhex(public_key_hex)
            
            # coincurve expects (signature, message, public_key)
            return verify_signature(sig_bytes, message, pk_bytes)
        except ImportError:
            pass
        
        # Fallback: Try with ecdsa library
        try:
            from ecdsa import SECP256k1, VerifyingKey, BadSignatureError
            
            sig_bytes = bytes.fromhex(signature_hex)
            pk_bytes = bytes.fromhex(public_key_hex)
            
            # For compressed keys, we need to decompress
            vk = VerifyingKey.from_string(pk_bytes, curve=SECP256k1)
            
            # Verify digest
            return vk.verify(sig_bytes, message, hashfunc=hashlib.sha256)
        except ImportError:
            pass
        
        # Last resort: Use cryptography library with proper handling
        from cryptography.hazmat.primitives.asymmetric import ec
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.primitives.asymmetric.utils import encode_dss_signature
        from cryptography.exceptions import InvalidSignature
        
        sig_bytes = bytes.fromhex(signature_hex)
        pk_bytes = bytes.fromhex(public_key_hex)
        
        print(f"Sig length: {len(sig_bytes)}, PK length: {len(pk_bytes)}")
        
        # Load compressed public key
        public_key = ec.EllipticCurvePublicKey.from_encoded_point(
            ec.SECP256K1(),
            pk_bytes
        )
        
        # noble-secp256k1 produces raw signatures (r || s)
        # Convert to DER format for cryptography library
        from cryptography.hazmat.primitives.asymmetric.utils import encode_dss_signature
        r = int.from_bytes(sig_bytes[:32], 'big')
        s = int.from_bytes(sig_bytes[32:], 'big')
        signature_der = encode_dss_signature(r, s)
        
        print(f"DER signature length: {len(signature_der)}")
        
        # Verify
        public_key.verify(
            signature_der,
            message,
            ec.ECDSA(hashes.SHA256())
        )
        
        return True
        
    except InvalidSignature as e:
        print(f"Invalid signature: {e}")
        return False
    except Exception as e:
        print(f"Error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    import json
    import sys
    
    attestation = {
        "agent_id": "maxi-0001",
        "protocol": "lightning",
        "transaction_reference": "test_tx_12345",
        "timestamp": "2026-03-05T19:30:00.000Z",
        "preimage": "test_preimage_value",
        "direction": "inbound",
        "amount_sats": 1000,
        "counterparty": "TestUser",
        "memo": None,
        "public_key": "033f87be3bdc64355fe611071e1b71bf0637119c021c73c56a9e72acb63ab179be"
    }
    
    message = json.dumps(attestation, separators=(',', ':'))  # Compact JSON
    print(f"Message: {message}")
    print(f"Message hash: {hashlib.sha256(message.encode()).hexdigest()}")
    
    signature = '316ef51be860bd176ec2c92049d4a112d8a8d0778a5ba10904f9590f6d6f320644027d9f275664d3840223a53feeb113029a893de5af39c3f2783ce3385cf7ed'
    public_key = '033f87be3bdc64355fe611071e1b71bf0637119c021c73c56a9e72acb63ab179be'
    
    result = verify_noble_signature(message.encode('utf-8'), signature, public_key)
    print(f"\nVerification result: {result}")
