#!/usr/bin/env node
import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { SimplePool } from 'nostr-tools'

const RELAYS = ['wss://relay.primal.net', 'wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.snort.social']
const EVENT_ID = 'b71bc2b2f3d9a272343f8e8d21933412ec6c14d305416710a66cbcd8a55339d5'

console.log('Waiting 5s for propagation...')
await new Promise(resolve => setTimeout(resolve, 5000))

console.log('Querying for event:', EVENT_ID)

const pool = new SimplePool()

const events = await pool.querySync(RELAYS, {
  ids: [EVENT_ID]
})

console.log('Found:', events.length, 'events')

if (events.length > 0) {
  console.log('✅ Event found!')
  console.log('Content:', events[0].content)
} else {
  console.log('❌ Event NOT found even though publish said success')
}

pool.close(RELAYS)
