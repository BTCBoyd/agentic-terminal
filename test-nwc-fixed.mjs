#!/usr/bin/env node
import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { SimplePool } from 'nostr-tools/pool'
import { finalizeEvent } from 'nostr-tools/pure'
import { nip04 } from 'nostr-tools'
import { hexToBytes } from '@noble/hashes/utils.js'
import { getPublicKey } from 'nostr-tools/pure'
import { useWebSocketImplementation } from 'nostr-tools/pool'
import WebSocket from 'ws'

useWebSocketImplementation(WebSocket)

const WALLET_PUBKEY = '7b8df631f22bf2be43a4bb87bbb6518427cba532727bc37b6cb9cff0ab9913c2'
const RELAY = 'wss://relay.getalby.com/v1'
const SECRET = '9a742c3ef7d7e7333741d9f54e8db430901442d018dc9f7a9d16b2a1bbb7c225'

// My pubkey derived from secret
const MY_PUBKEY = getPublicKey(hexToBytes(SECRET))

const pool = new SimplePool()

console.log('🔌 Testing NWC with FIXED filter...')
console.log(`   My pubkey: ${MY_PUBKEY}`)
console.log(`   Wallet: ${WALLET_PUBKEY.substring(0, 16)}...`)
console.log(`   Relay: ${RELAY}\n`)

async function sendRequest(method, params = {}) {
  console.log(`📤 ${method}...`)
  
  const requestData = JSON.stringify({ method, params })
  const encryptedContent = await nip04.encrypt(hexToBytes(SECRET), WALLET_PUBKEY, requestData)
  
  const requestEvent = finalizeEvent({
    kind: 23194,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['p', WALLET_PUBKEY]],
    content: encryptedContent
  }, hexToBytes(SECRET))
  
  await pool.publish([RELAY], requestEvent)
  console.log(`   Request: ${requestEvent.id.substring(0, 16)}...`)
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      sub.close()
      reject(new Error('Timeout'))
    }, 20000)
    
    // FIXED: Subscribe with correct filter
    const sub = pool.subscribeMany([RELAY], [{
      kinds: [23195],           // NWC response kind
      '#p': [MY_PUBKEY],        // Responses tagged with MY pubkey
      since: Math.floor(Date.now() / 1000) - 5  // Just before request
    }], {
      async onevent(event) {
        console.log(`   Response received! Event: ${event.id.substring(0,16)}...`)
        clearTimeout(timeout)
        sub.close()
        
        try {
          const decrypted = await nip04.decrypt(hexToBytes(SECRET), WALLET_PUBKEY, event.content)
          resolve(JSON.parse(decrypted))
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
    console.log('=== TEST: Get Balance ===')
    const balance = await sendRequest('get_balance')
    console.log('✅ SUCCESS!\n')
    console.log(JSON.stringify(balance, null, 2))
    
    if (balance.result) {
      const sats = balance.result.balance / 1000
      console.log(`\n⚡ Balance: ${sats.toLocaleString()} sats`)
      console.log('\n🎉 NWC CONNECTION OPERATIONAL!')
      console.log('   Economic agency: ACTIVE ₿')
    }
  } catch (err) {
    console.error('\n❌ Failed:', err.message)
  } finally {
    pool.close([RELAY])
  }
}

test()
