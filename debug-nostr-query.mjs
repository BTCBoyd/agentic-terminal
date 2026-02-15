#!/usr/bin/env node
import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { SimplePool } from 'nostr-tools'

const RELAYS = [
  'wss://relay.primal.net',
  'wss://relay.damus.io',
  'wss://nos.lol'
]

const MY_PUBKEY = '3f87be3bdc64355fe611071e1b71bf0637119c021c73c56a9e72acb63ab179be'

async function test() {
  const pool = new SimplePool()
  
  const since = Math.floor(Date.now() / 1000) - (2 * 60 * 60) // Last 2 hours
  
  console.log(`Querying for posts since ${new Date(since * 1000).toISOString()}`)
  console.log(`Pubkey: ${MY_PUBKEY}`)
  console.log(`Relays: ${RELAYS.join(', ')}`)
  
  const events = await pool.querySync(RELAYS, {
    kinds: [1],
    authors: [MY_PUBKEY],
    since: since,
    limit: 20
  })
  
  console.log(`\nFound ${events.length} events:`)
  events.forEach(e => {
    console.log(`  - ${new Date(e.created_at * 1000).toISOString()}: ${e.content.substring(0, 80)}...`)
  })
  
  pool.close(RELAYS)
}

test().catch(console.error)
