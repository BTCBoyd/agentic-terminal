#!/usr/bin/env node
import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { SimplePool } from 'nostr-tools/pool'
import { nip04 } from 'nostr-tools'
import { hexToBytes } from '@noble/hashes/utils.js'
import { useWebSocketImplementation } from 'nostr-tools/pool'
import WebSocket from 'ws'

useWebSocketImplementation(WebSocket)

const WALLET_PUBKEY = '7b8df631f22bf2be43a4bb87bbb6518427cba532727bc37b6cb9cff0ab9913c2'
const RELAY = 'wss://relay.getalby.com/v1'
const SECRET = '9a742c3ef7d7e7333741d9f54e8db430901442d018dc9f7a9d16b2a1bbb7c225'

// Known response event ID from logs
const RESPONSE_EVENT_ID = '53e5d46b79f3eb9a35d8c21f94c1aaa7bfb06809d56d500a96bdfbbc9b2eeab8'

const pool = new SimplePool()

console.log('🔍 Fetching specific NWC response event...')
console.log(`   Event ID: ${RESPONSE_EVENT_ID.substring(0,16)}...`)

try {
  const events = await pool.querySync([RELAY], {
    ids: [RESPONSE_EVENT_ID]
  })
  
  if (events.length === 0) {
    console.log('❌ Event not found on relay')
  } else {
    console.log(`✅ Found event! Decrypting...`)
    const event = events[0]
    
    const decrypted = await nip04.decrypt(hexToBytes(SECRET), event.pubkey, event.content)
    const response = JSON.parse(decrypted)
    
    console.log('\n📊 Response:')
    console.log(JSON.stringify(response, null, 2))
  }
} catch (err) {
  console.error('❌ Error:', err.message)
} finally {
  pool.close([RELAY])
}
