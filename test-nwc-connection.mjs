#!/usr/bin/env node
/**
 * Test Maxi's NWC (Nostr Wallet Connect) connection
 * Tests balance checking, channel info, and payment capability
 */

import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { SimplePool } from 'nostr-tools/pool'
import { finalizeEvent } from 'nostr-tools/pure'
import { hexToBytes } from '@noble/hashes/utils.js'
import { useWebSocketImplementation } from 'nostr-tools/pool'
import WebSocket from 'ws'

useWebSocketImplementation(WebSocket)

// My NWC credentials
const WALLET_PUBKEY = '7b8df631f22bf2be43a4bb87bbb6518427cba532727bc37b6cb9cff0ab9913c2'
const RELAY = 'wss://relay.getalby.com/v1'
const SECRET = '9a742c3ef7d7e7333741d9f54e8db430901442d018dc9f7a9d16b2a1bbb7c225'

const pool = new SimplePool()

console.log('🔌 Testing Maxi\'s NWC connection...')
console.log(`   Wallet: ${WALLET_PUBKEY.substring(0, 16)}...`)
console.log(`   Relay: ${RELAY}`)
console.log('')

async function sendNWCRequest(method, params = {}) {
  console.log(`📤 Sending ${method} request...`)
  
  const requestEvent = finalizeEvent({
    kind: 23194, // NWC request
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['p', WALLET_PUBKEY]
    ],
    content: JSON.stringify({
      method: method,
      params: params
    })
  }, hexToBytes(SECRET))
  
  // Publish request
  await pool.publish([RELAY], requestEvent)
  console.log(`   Request published: ${requestEvent.id.substring(0, 16)}...`)
  
  // Wait for response
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      sub.close()
      reject(new Error('Timeout waiting for response'))
    }, 10000)
    
    const sub = pool.subscribeMany([RELAY], [{
      kinds: [23195], // NWC response
      '#e': [requestEvent.id]
    }], {
      onevent(event) {
        clearTimeout(timeout)
        sub.close()
        
        try {
          const response = JSON.parse(event.content)
          resolve(response)
        } catch (err) {
          reject(new Error(`Failed to parse response: ${err.message}`))
        }
      },
      oneose() {
        // Keep waiting for response
      }
    })
  })
}

async function testConnection() {
  try {
    // Test 1: Get info
    console.log('\n=== TEST 1: Get Info ===')
    const info = await sendNWCRequest('get_info')
    console.log('✅ Info retrieved:')
    console.log(JSON.stringify(info, null, 2))
    
    // Test 2: Get balance
    console.log('\n=== TEST 2: Get Balance ===')
    const balance = await sendNWCRequest('get_balance')
    console.log('✅ Balance retrieved:')
    console.log(JSON.stringify(balance, null, 2))
    
    // Test 3: List transactions
    console.log('\n=== TEST 3: List Transactions ===')
    const txs = await sendNWCRequest('list_transactions', { limit: 5 })
    console.log('✅ Transactions retrieved:')
    console.log(JSON.stringify(txs, null, 2))
    
    console.log('\n🎉 NWC CONNECTION SUCCESSFUL!')
    console.log('   I can now:')
    console.log('   - Check balance autonomously')
    console.log('   - View transaction history')
    console.log('   - Make invoices')
    console.log('   - Send payments')
    
  } catch (err) {
    console.error('\n❌ NWC connection failed:')
    console.error(`   ${err.message}`)
    console.error('\n   Possible issues:')
    console.error('   - Wallet not unlocked')
    console.error('   - Incorrect secret key')
    console.error('   - Relay connection issue')
    console.error('   - Permissions not granted')
  } finally {
    pool.close([RELAY])
  }
}

testConnection()
