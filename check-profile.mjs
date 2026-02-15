import WebSocket from 'ws';
import { Relay } from 'nostr-tools/relay';

// Polyfill WebSocket for Node.js
global.WebSocket = WebSocket;

const myPubkey = '3f87be3bdc64355fe611071e1b71bf0637119c021c73c56a9e72acb63ab179be';

const relay = await Relay.connect('wss://relay.primal.net');

console.log('Fetching Maxi\'s profile...\n');

const sub = relay.subscribe([
  {
    kinds: [0],
    authors: [myPubkey],
    limit: 1
  }
], {
  onevent(event) {
    const profile = JSON.parse(event.content);
    console.log('Profile found!');
    console.log('==============\n');
    console.log('Name:', profile.name);
    console.log('Display Name:', profile.displayName);
    console.log('About:', profile.about);
    console.log('Picture:', profile.picture);
    console.log('Website:', profile.website);
    console.log('NIP-05:', profile.nip05);
    console.log('Lightning Address:', profile.lud16);
    console.log('\n==============');
    relay.close();
    process.exit(0);
  },
  oneose() {
    console.log('No profile found or relay finished.');
    relay.close();
    process.exit(0);
  }
});

// Timeout after 5 seconds
setTimeout(() => {
  console.log('Timeout - closing connection');
  relay.close();
  process.exit(0);
}, 5000);
