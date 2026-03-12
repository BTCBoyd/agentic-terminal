#!/usr/bin/env python3
"""
Sign a message for Observer Protocol submission.
Usage: python3 op-sign.py <message>
Outputs: hex signature (64 bytes, r||s)
"""
import sys, json
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature

PRIVATE_KEY_HEX = "9bdbc947e250e96244bfcbe260dacf141a5fe67e1e678b7e2f17709404439a45"

def sign(message: str) -> str:
    priv_int = int(PRIVATE_KEY_HEX, 16)
    priv_key = ec.derive_private_key(priv_int, ec.SECP256K1())
    msg_bytes = message.encode('utf-8')
    sig_der = priv_key.sign(msg_bytes, ec.ECDSA(hashes.SHA256()))
    r, s = decode_dss_signature(sig_der)
    return (r.to_bytes(32,'big') + s.to_bytes(32,'big')).hex()

if __name__ == '__main__':
    message = sys.argv[1] if len(sys.argv) > 1 else sys.stdin.read().strip()
    print(sign(message))
