#!/usr/bin/env node
/**
 * Query relays for specific event IDs to verify they exist
 */

import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { SimplePool } from 'nostr-tools/pool'
import { useWebSocketImplementation } from 'nostr-tools/pool'
import WebSocket from 'ws'

useWebSocketImplementation(WebSocket)

const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net',
  'wss://relay.snort.social'
]

const eventIds = process.argv.slice(2)

if (eventIds.length === 0) {
  console.error('Usage: node verify-event.mjs <event_id> [event_id2...]')
  process.exit(1)
}

async function verifyEvents() {
  const pool = new SimplePool()
  
  console.log(`\n🔍 Searching ${RELAYS.length} relays for ${eventIds.length} event(s)...\n`)
  
  for (const eventId of eventIds) {
    console.log(`Event ID: ${eventId}`)
    console.log('─'.repeat(70))
    
    const results = await Promise.allSettled(
      RELAYS.map(async relay => {
        try {
          const events = await pool.querySync([relay], { ids: [eventId] })
          return { relay, found: events.length > 0, events }
        } catch (err) {
          return { relay, error: err.message }
        }
      })
    )
    
    let foundCount = 0
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { relay, found, error, events } = result.value
        
        if (error) {
          console.log(`❌ ${relay}: ${error}`)
        } else if (found) {
          console.log(`✅ ${relay}: FOUND`)
          foundCount++
          if (events[0]) {
            console.log(`   Content: ${events[0].content.substring(0, 100)}`)
          }
        } else {
          console.log(`⚠️  ${relay}: NOT FOUND`)
        }
      }
    }
    
    console.log(`\nResult: Found on ${foundCount}/${RELAYS.length} relays`)
    console.log()
  }
  
  pool.close(RELAYS)
}

verifyEvents().catch(console.error)
