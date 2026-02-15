import { generateSecretKey, getPublicKey } from 'nostr-tools/pure';
import { nip19 } from 'nostr-tools';

// Generate a new random secret key
const secretKey = generateSecretKey();
const publicKey = getPublicKey(secretKey);

// Convert secret key to hex string
const secretKeyHex = Array.from(secretKey, byte => byte.toString(16).padStart(2, '0')).join('');
const publicKeyHex = publicKey;

// Convert to bech32 format (nsec/npub)
const nsec = nip19.nsecEncode(secretKey);
const npub = nip19.npubEncode(publicKey);

console.log('Secret Key (hex):', secretKeyHex);
console.log('Public Key (hex):', publicKeyHex);
console.log('nsec:', nsec);
console.log('npub:', npub);

// Store the secret key securely!
// The npub is your agent's public identity
