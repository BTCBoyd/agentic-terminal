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

async function testSubmission() {
  const attestation = {
    agent_id: 'maxi-0001',
    protocol: 'lightning',
    transaction_reference: 'test_verify_' + Date.now(),
    timestamp: new Date().toISOString(),
    preimage: 'test_preimage_123',
    direction: 'inbound',
    amount_sats: 1000,
    counterparty: 'Test',
  };

  const message = JSON.stringify(attestation);
  const messageHash = crypto.createHash('sha256').update(message).digest();
  const privateKeyBytes = Buffer.from(PRIVATE_KEY_HEX, 'hex');
  const signature = await secp256k1.signAsync(messageHash, privateKeyBytes);
  const signatureHex = Buffer.from(signature).toString('hex');

  console.log('Testing server-side verification...');
  console.log('Signature:', signatureHex.substring(0, 64) + '...');

  // Submit to API
  const params = new URLSearchParams({
    agent_id: attestation.agent_id,
    protocol: attestation.protocol,
    transaction_reference: attestation.transaction_reference,
    timestamp: attestation.timestamp,
    signature: signatureHex,
    optional_metadata: JSON.stringify({
      amount_sats: attestation.amount_sats,
      direction: attestation.direction,
      counterparty: attestation.counterparty,
      preimage: attestation.preimage,
    }),
  });

  try {
    const response = await fetch(`http://127.0.0.1:8090/observer/submit-transaction?${params}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
    });

    const result = await response.json();
    console.log('\nResponse:', JSON.stringify(result, null, 2));

    if (result.verified && result.cryptographic_verification) {
      console.log('\n✅ SERVER-SIDE VERIFICATION IS WORKING!');
    } else {
      console.log('\n❌ Verification failed');
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testSubmission();
