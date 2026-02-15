#!/usr/bin/env node
import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { SimplePool } from 'nostr-tools'

const RELAYS = ['wss://relay.primal.net', 'wss://relay.damus.io', 'wss://nos.lol']
const EVENT_ID = 'beb700f554fea05ff8c017319f03e9bed423edd9ec624f88ecd2975942a327e2'

console.log('Searching for event:', EVENT_ID)

const pool = new SimplePool()

await new Promise(resolve => setTimeout(resolve, 2000))

const events = await pool.querySync(RELAYS, {
  ids: [EVENT_ID]
})

console.log('Found:', events.length, 'events')

if (events.length > 0) {
  console.log('\nEvent content:', events[0].content)
  console.log('Author:', events[0].pubkey)
  console.log('Created:', new Date(events[0].created_at * 1000).toISOString())
} else {
  console.log('\n❌ Event not found on any relay')
}

pool.close(RELAYS)
