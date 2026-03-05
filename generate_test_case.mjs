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

async function generateTestCase() {
  // Build attestation exactly as the server expects it
  const attestation = {
    agent_id: 'maxi-0001',
    protocol: 'lightning',
    transaction_reference: 'test_tx_12345',
    timestamp: '2026-03-05T19:30:00.000Z',
    preimage: 'test_preimage_value',
    direction: 'inbound',
    amount_sats: 1000,
    counterparty: 'TestUser',
    memo: null,
    public_key: PUBLIC_KEY_HEX
  };

  const message = JSON.stringify(attestation);
  const messageHash = crypto.createHash('sha256').update(message).digest();
  
  const privateKeyBytes = Buffer.from(PRIVATE_KEY_HEX, 'hex');
  const signature = await secp256k1.signAsync(messageHash, privateKeyBytes);
  const signatureHex = Buffer.from(signature).toString('hex');
  
  console.log('=== TEST CASE ===');
  console.log('Attestation:', JSON.stringify(attestation, null, 2));
  console.log('\nMessage:', message);
  console.log('\nMessage Hash:', messageHash.toString('hex'));
  console.log('\nSignature:', signatureHex);
  console.log('\nPublic Key:', PUBLIC_KEY_HEX);
  
  // Verify locally
  const publicKeyBytes = Buffer.from(PUBLIC_KEY_HEX, 'hex');
  const isValid = await secp256k1.verifyAsync(signature, messageHash, publicKeyBytes);
  console.log('\nLocal verification:', isValid);
  
  console.log('\n=== FOR PYTHON TEST ===');
  console.log(`python3 << 'PYEOF'
import sys
sys.path.insert(0, '/home/futurebit/.openclaw/workspace/observer-protocol')
from crypto_verification import verify_signature_simple
import json

attestation = ${JSON.stringify(attestation)}
message = json.dumps(attestation)
signature = '${signatureHex}'
public_key = '${PUBLIC_KEY_HEX}'

result = verify_signature_simple(
    message.encode('utf-8'),
    signature,
    public_key
)
print(f"Server verification: {result}")
PYEOF`);
}

generateTestCase();
