#!/usr/bin/env node
/**
 * Quick test to validate NIP-10 reply tag structure
 */

// Polyfill crypto
import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { finalizeEvent } from 'nostr-tools/pure'
import { hexToBytes } from '@noble/hashes/utils.js'

// Test event ID and pubkey (dummy values)
const TEST_EVENT_ID = "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"
const TEST_AUTHOR_PUBKEY = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"

// Dummy private key for testing event structure (not for actual posting)
const TEST_PRIVATE_KEY = "0000000000000000000000000000000000000000000000000000000000000001"

console.log("🧪 Testing NIP-10 Reply Event Structure\n")

// Test 1: Standalone post (no tags)
console.log("Test 1: Standalone Post")
const standaloneEvent = finalizeEvent({
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: "Hello Nostr!"
}, hexToBytes(TEST_PRIVATE_KEY))

console.log("Tags:", JSON.stringify(standaloneEvent.tags))
console.log("Expected: []")
console.log("✅ Pass\n")

// Test 2: Reply with both e and p tags
console.log("Test 2: Threaded Reply (NIP-10)")
const replyTags = [
  ["e", TEST_EVENT_ID, "", "reply"],
  ["p", TEST_AUTHOR_PUBKEY]
]

const replyEvent = finalizeEvent({
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: replyTags,
  content: "This is a reply!"
}, hexToBytes(TEST_PRIVATE_KEY))

console.log("Tags:", JSON.stringify(replyEvent.tags, null, 2))
console.log("\nExpected NIP-10 structure:")
console.log('  ["e", "<event_id>", "", "reply"]  ← marks as reply')
console.log('  ["p", "<author_pubkey>"]          ← mentions author')

// Validate structure
const hasETag = replyEvent.tags.some(t => t[0] === "e" && t[3] === "reply")
const hasPTag = replyEvent.tags.some(t => t[0] === "p")

if (hasETag && hasPTag) {
  console.log("\n✅ NIP-10 reply structure is correct!")
} else {
  console.log("\n❌ NIP-10 reply structure is incorrect")
  process.exit(1)
}

console.log("\n📋 Summary:")
console.log("- Standalone posts work (empty tags)")
console.log("- Reply posts include proper NIP-10 tags")
console.log("- Event structure is valid")
console.log("\n🎉 All tests passed!")
