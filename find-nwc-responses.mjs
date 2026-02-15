#!/usr/bin/env node
import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { SimplePool } from 'nostr-tools/pool'
import { nip04 } from 'nostr-tools'
import { hexToBytes } from '@noble/hashes/utils.js'
import { getPublicKey } from 'nostr-tools/pure'
import { useWebSocketImplementation } from 'nostr-tools/pool'
import WebSocket from 'ws'

useWebSocketImplementation(WebSocket)

const WALLET_PUBKEY = '7b8df631f22bf2be43a4bb87bbb6518427cba532727bc37b6cb9cff0ab9913c2'
const RELAY = 'wss://relay.getalby.com/v1'
const SECRET = '9a742c3ef7d7e7333741d9f54e8db430901442d018dc9f7a9d16b2a1bbb7c225'

// Calculate my public key from secret
const myPubkey = getPublicKey(hexToBytes(SECRET))

const pool = new SimplePool()

console.log('🔍 Finding all NWC responses to me...')
console.log(`   My pubkey: ${myPubkey.substring(0,16)}...`)
console.log(`   Wallet pubkey: ${WALLET_PUBKEY.substring(0,16)}...`)

try {
  // Query for kind 23195 (NWC responses) mentioning me
  const events = await pool.querySync([RELAY], {
    kinds: [23195],
    '#p': [myPubkey],
    since: Math.floor(Date.now() / 1000) - 3600 // Last hour
  })
  
  console.log(`\n📊 Found ${events.length} response events`)
  
  for (const event of events) {
    console.log(`\n--- Event ${event.id.substring(0,16)}... ---`)
    console.log(`   From: ${event.pubkey.substring(0,16)}...`)
    console.log(`   Time: ${new Date(event.created_at * 1000).toISOString()}`)
    
    try {
      const decrypted = await nip04.decrypt(hexToBytes(SECRET), event.pubkey, event.content)
      const response = JSON.parse(decrypted)
      console.log(`   Content:`, JSON.stringify(response, null, 4))
    } catch (err) {
      console.log(`   Decrypt failed: ${err.message}`)
    }
  }
  
  if (events.length > 0) {
    console.log('\n🎉 NWC IS WORKING! I can receive wallet responses!')
  }
} catch (err) {
  console.error('\n❌ Error:', err.message)
} finally {
  pool.close([RELAY])
}
