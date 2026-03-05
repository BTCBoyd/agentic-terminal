import * as secp256k1 from '@noble/secp256k1';
import crypto from 'crypto';

// Configure secp256k1
secp256k1.hashes.sha256 = (...msgs) => {
  const h = crypto.createHash('sha256');
  msgs.forEach(m => h.update(m));
  return h.digest();
};
secp256k1.hashes.hmacSha256 = (key, ...msgs) => {
  const h = crypto.createHmac('sha256', key);
  msgs.forEach(m => h.update(m));
  return h.digest();
};

const PRIVATE_KEY_HEX = '9bdbc947e250e96244bfcbe260dacf141a5fe67e1e678b7e2f17709404439a45';
const PUBLIC_KEY_HEX = '033f87be3bdc64355fe611071e1b71bf0637119c021c73c56a9e72acb63ab179be';

async function generateFreshTest() {
  // Use a fresh timestamp
  const now = new Date().toISOString();
  
  const attestation = {
    agent_id: 'maxi-0001',
    protocol: 'lightning',
    transaction_reference: 'fresh_test_' + Date.now(),
    timestamp: now,
    preimage: 'test_preimage_fresh',
    direction: 'inbound',
    amount_sats: 21000,
    counterparty: 'ArcadiaB',
    memo: null,
    public_key: PUBLIC_KEY_HEX
  };

  const message = JSON.stringify(attestation);
  const messageHash = crypto.createHash('sha256').update(message).digest();
  
  const privateKeyBytes = Buffer.from(PRIVATE_KEY_HEX, 'hex');
  const signature = await secp256k1.signAsync(messageHash, privateKeyBytes);
  const signatureHex = Buffer.from(signature).toString('hex');
  
  // Verify locally first
  const publicKeyBytes = Buffer.from(PUBLIC_KEY_HEX, 'hex');
  const localValid = await secp256k1.verifyAsync(signature, messageHash, publicKeyBytes);
  
  console.log('=== FRESH TEST ===');
  console.log('Timestamp:', now);
  console.log('Message:', message);
  console.log('Hash:', messageHash.toString('hex'));
  console.log('Signature:', signatureHex);
  console.log('Local verification:', localValid);
  
  if (localValid) {
    console.log('\n=== PYTHON TEST ===');
    console.log(`python3 << 'PYEOF'
import json
import hashlib
import sys
sys.path.insert(0, '/home/futurebit/.openclaw/workspace/observer-protocol')
from crypto_verification import verify_signature_simple

attestation = ${JSON.stringify(attestation).replace(/"/g, '\\"')}
message = json.dumps(attestation, separators=(',', ':'))
signature = '${signatureHex}'
public_key = '${PUBLIC_KEY_HEX}'

print(f"Message: {message}")
print(f"Hash: {hashlib.sha256(message.encode()).hexdigest()}")

result = verify_signature_simple(message.encode('utf-8'), signature, public_key)
print(f"\\nResult: {result}")
PYEOF`);
  }
}

generateFreshTest();
