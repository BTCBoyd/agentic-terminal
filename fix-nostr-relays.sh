#!/bin/bash
# Systematic Nostr relay debugging and fixing

set -e

echo "=== NOSTR RELAY DIAGNOSIS & FIX ==="
echo

cd /home/futurebit/.openclaw/workspace

# Test 1: Can we connect to relays at all?
echo "Test 1: Testing relay connectivity..."
node test-nostr-connectivity.mjs 2>&1 | head -20

echo
echo "Test 2: Post a message and immediately subscribe to see if it appears..."

cat > test-post-and-subscribe.mjs << 'EOFTEST'
#!/usr/bin/env node
import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { finalizeEvent, verifyEvent } from 'nostr-tools/pure'
import { Relay } from 'nostr-tools/relay'
import { nip19 } from 'nostr-tools'

const nsec = 'nsec1n0duj3lz2r5ky39le03xpkk0zsd9len7renckl30zacfgpzrnfzsmm4t9g'
const decoded = nip19.decode(nsec)
const secretKey = decoded.data

// Get pubkey
const { getPublicKey } = await import('nostr-tools')
const pubkey = getPublicKey(secretKey)

console.log('My pubkey:', pubkey)

// Connect to relay
const relay = await Relay.connect('wss://relay.primal.net')
console.log('Connected to Primal')

// Subscribe BEFORE posting
console.log('\nSubscribing to my posts...')

let foundOurPost = false
const testContent = `Test post ${Date.now()}`

const sub = relay.subscribe([
  {
    kinds: [1],
    authors: [pubkey],
    limit: 1
  }
], {
  onevent(event) {
    console.log('\n✅ Got event from subscription!')
    console.log('Content:', event.content)
    if (event.content === testContent) {
      foundOurPost = true
      console.log('🎉 THIS IS OUR TEST POST!')
    }
  },
  oneose() {
    console.log('(End of stored events)')
  }
})

// Wait a moment for subscription to be established
await new Promise(resolve => setTimeout(resolve, 2000))

// Now post
console.log('\nPosting test message...')
const event = finalizeEvent({
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: testContent
}, secretKey)

console.log('Event ID:', event.id)
console.log('Valid:', verifyEvent(event))

await relay.publish(event)
console.log('Published!')

// Wait to see if subscription picks it up
console.log('\nWaiting 10s to see if it appears in subscription...')
await new Promise(resolve => setTimeout(resolve, 10000))

if (foundOurPost) {
  console.log('\n✅ SUCCESS! Post was published and retrieved via subscription')
} else {
  console.log('\n❌ FAILURE! Post was published but never appeared in subscription')
}

relay.close()
EOFTEST

chmod +x test-post-and-subscribe.mjs
timeout 30 node test-post-and-subscribe.mjs 2>&1 || echo "Test timed out or failed"

echo
echo "=== DIAGNOSIS COMPLETE ==="
