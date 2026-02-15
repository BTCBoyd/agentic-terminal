#!/usr/bin/env node
/**
 * Proper NWC test with NIP-04 encryption
 */

import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { SimplePool } from 'nostr-tools/pool'
import { finalizeEvent } from 'nostr-tools/pure'
import { nip04 } from 'nostr-tools'
import { hexToBytes } from '@noble/hashes/utils.js'
import { useWebSocketImplementation } from 'nostr-tools/pool'
import WebSocket from 'ws'

useWebSocketImplementation(WebSocket)

const WALLET_PUBKEY = '7b8df631f22bf2be43a4bb87bbb6518427cba532727bc37b6cb9cff0ab9913c2'
const RELAY = 'wss://relay.getalby.com/v1'
const SECRET = '9a742c3ef7d7e7333741d9f54e8db430901442d018dc9f7a9d16b2a1bbb7c225'

const pool = new SimplePool()

console.log('🔌 Testing Maxi\'s NWC (with encryption)...')
console.log(`   Wallet: ${WALLET_PUBKEY.substring(0, 16)}...`)
console.log(`   Relay: ${RELAY}\n`)

async function sendNWCRequest(method, params = {}) {
  console.log(`📤 Sending ${method} request...`)
  
  const requestData = JSON.stringify({
    method: method,
    params: params
  })
  
  // Encrypt content using NIP-04
  console.log('   Encrypting request...')
  const encryptedContent = await nip04.encrypt(hexToBytes(SECRET), WALLET_PUBKEY, requestData)
  console.log('   Content encrypted ✓')
  
  const requestEvent = finalizeEvent({
    kind: 23194,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['p', WALLET_PUBKEY]],
    content: encryptedContent
  }, hexToBytes(SECRET))
  
  await pool.publish([RELAY], requestEvent)
  console.log(`   Request published: ${requestEvent.id.substring(0, 16)}...`)
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      sub.close()
      reject(new Error('Timeout - no response in 15s'))
    }, 15000)
    
    const sub = pool.subscribeMany([RELAY], [{
      kinds: [23195],
      '#e': [requestEvent.id]
    }], {
      async onevent(event) {
        clearTimeout(timeout)
        sub.close()
        
        try {
          console.log('   Response received! Decrypting...')
          const decrypted = await nip04.decrypt(hexToBytes(SECRET), WALLET_PUBKEY, event.content)
          const response = JSON.parse(decrypted)
          resolve(response)
        } catch (err) {
          reject(new Error(`Decrypt failed: ${err.message}`))
        }
      },
      oneose() {
        console.log('   Waiting for response...')
      }
    })
  })
}

async function test() {
  try {
    console.log('=== TEST 1: Get Balance ===')
    const balance = await sendNWCRequest('get_balance')
    console.log('✅ Success!\n')
    console.log(JSON.stringify(balance, null, 2))
    
    console.log('\n=== TEST 2: Get Info ===')
    const info = await sendNWCRequest('get_info')
    console.log('✅ Success!\n')
    console.log(JSON.stringify(info, null, 2))
    
    console.log('\n🎉 NWC CONNECTION WORKING!')
    console.log('   Economic agency: OPERATIONAL ⚡')
    
  } catch (err) {
    console.error('\n❌ Failed:', err.message)
  } finally {
    pool.close([RELAY])
  }
}

test()
