#!/usr/bin/env node
import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto
import { SimplePool } from 'nostr-tools'

const pool = new SimplePool()
const MY_PUBKEY = '3f87be3bdc64355fe611071e1b71bf0637119c021c73c56a9e72acb63ab179be'

// Try different relay combinations
const RELAY_SETS = [
  ['wss://relay.primal.net'],
  ['wss://relay.damus.io'],
  ['wss://nos.lol'],
  ['wss://relay.nostr.band']
]

for (const relays of RELAY_SETS) {
  console.log(`\n--- Testing ${relays[0]} ---`)
  
  try {
    // First try to get ANY events from this pubkey
    const anyEvents = await pool.querySync(relays, {
      kinds: [1],
      authors: [MY_PUBKEY],
      limit: 3
    })
    
    console.log(`Found ${anyEvents.length} events (any time)`)
    
    if (anyEvents.length > 0) {
      console.log(`Latest event: ${new Date(anyEvents[0].created_at * 1000).toISOString()}`)
      console.log(`Content: ${anyEvents[0].content.substring(0, 80)}...`)
      console.log(`Event ID: ${anyEvents[0].id}`)
      
      // Now check for replies to this event
      const replies = await pool.querySync(relays, {
        kinds: [1],
        '#e': [anyEvents[0].id],
        limit: 10
      })
      
      console.log(`\nFound ${replies.length} replies to latest post`)
      
      replies.forEach(r => {
        console.log(`\n  Reply from: ${r.pubkey.substring(0, 16)}...`)
        console.log(`  Time: ${new Date(r.created_at * 1000).toISOString()}`)
        console.log(`  Content: ${r.content}`)
      })
      
      break // Found working relay, stop
    }
  } catch (err) {
    console.error(`Error: ${err.message}`)
  }
}

pool.close(RELAY_SETS.flat())
