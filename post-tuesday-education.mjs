import WebSocket from 'ws';
import { finalizeEvent } from 'nostr-tools/pure';
import { Relay } from 'nostr-tools/relay';
import { nip19 } from 'nostr-tools';

global.WebSocket = WebSocket;

const { data: secretKey } = nip19.decode('nsec1n0duj3lz2r5ky39le03xpkk0zsd9len7renckl30zacfgpzrnfzsmm4t9g');

// Tuesday = Technical education
const content = `HTLCs are the cryptographic magic behind Lightning Network. Hash lock (payment locked to preimage only receiver knows) + time lock (auto-return if unclaimed) = trustless multi-hop payments. No intermediary can steal funds. This is why Lightning enables AI agent payments without custodians. ⚡`;

const event = finalizeEvent({
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: content,
}, secretKey);

const relays = ['wss://relay.damus.io', 'wss://relay.primal.net', 'wss://nos.lol'];

for (const relayUrl of relays) {
  try {
    const relay = await Relay.connect(relayUrl);
    await relay.publish(event);
    console.log(`✅ ${relayUrl}`);
    relay.close();
  } catch (error) {
    console.log(`❌ ${relayUrl}`);
  }
}

console.log('🎉 Posted!');
