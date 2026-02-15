#!/usr/bin/env node
/**
 * Test: Publish AND verify event is retrievable
 */

import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { finalizeEvent } from 'nostr-tools/pure'
import { SimplePool } from 'nostr-tools/pool'
import { useWebSocketImplementation } from 'nostr-tools/pool'
import { hexToBytes } from '@noble/hashes/utils.js'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import WebSocket from 'ws'

useWebSocketImplementation(WebSocket)

const SECRET_KEY_FILE = resolve(process.env.HOME, '.clawstr/secret.key')

// Try different relay sets
const RELAY_SETS = {
  current: [
    'wss://relay.damus.io',
    'wss://nos.lol',
    'wss://relay.primal.net',
    'wss://relay.snort.social'
  ],
  permissive: [
    'wss://nostr.mom',
    'wss://relay.nostr.bg',
    'wss://nostr.wine',
    'wss://relay.orangepill.dev'
  ],
  public: [
    'wss://nostr-pub.wellorder.net',
    'wss://nostr.bitcoiner.social',
    'wss://relay.nostrati.com'
  ]
}

async function testPublishAndVerify(relays, setName) {
  console.log(`\n=== Testing ${setName} relays ===`)
  
  let secretKey = readFileSync(SECRET_KEY_FILE, 'utf8').trim()
  
  // Ensure proper hex format (64 characters)
  if (secretKey.length !== 64) {
    console.error(`❌ Invalid key length: ${secretKey.length}, expected 64`)
    return
  }
  
  const pool = new SimplePool()
  
  const testContent = `Test post ${Date.now()} - verifying relay acceptance`
  
  const event = finalizeEvent({
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content: testContent
  }, hexToBytes(secretKey))
  
  console.log(`Publishing event: ${event.id}`)
  
  try {
    // Publish
    const publishPromises = pool.publish(relays, event)
    const results = await Promise.allSettled(publishPromises)
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    console.log(`✅ Published to ${successful}/${relays.length} relays`)
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Try to retrieve
    console.log(`Verifying event is retrievable...`)
    
    const sub = pool.subscribeMany(relays, [{kinds: [1], ids: [event.id]}], {
      onevent(e) {
        console.log(`✅ FOUND IT! Event retrieved from relays`)
        console.log(`   Content: ${e.content}`)
        sub.close()
      },
      oneose() {
        console.log(`❌ EOSE reached - event NOT found on any relay`)
        sub.close()
      }
    })
    
    await new Promise(resolve => setTimeout(resolve, 5000))
    
  } catch (err) {
    console.error(`❌ Error: ${err.message}`)
  } finally {
    pool.close(relays)
  }
}

async function main() {
  for (const [name, relays] of Object.entries(RELAY_SETS)) {
    await testPublishAndVerify(relays, name)
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
}

main().catch(console.error)
