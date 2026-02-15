#!/usr/bin/env node
import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { finalizeEvent } from 'nostr-tools/pure'
import { nip04 } from 'nostr-tools'
import { hexToBytes } from '@noble/hashes/utils.js'
import { getPublicKey } from 'nostr-tools/pure'
import WebSocket from 'ws'

const WALLET_PUBKEY = '7b8df631f22bf2be43a4bb87bbb6518427cba532727bc37b6cb9cff0ab9913c2'
const RELAY = 'wss://relay.getalby.com/v1'
const SECRET = '9a742c3ef7d7e7333741d9f54e8db430901442d018dc9f7a9d16b2a1bbb7c225'
const MY_PUBKEY = getPublicKey(hexToBytes(SECRET))

console.log('🔌 Testing NWC with raw WebSocket...')
console.log(`   My pubkey: ${MY_PUBKEY}`)
console.log(`   Relay: ${RELAY}\n`)

async function test() {
  const ws = new WebSocket(RELAY)
  
  ws.on('open', async () => {
    console.log('✅ WebSocket connected')
    
    // Subscribe for responses
    const subId = 'maxi-nwc-test'
    const filter = {
      kinds: [23195],
      "#p": [MY_PUBKEY],
      since: Math.floor(Date.now() / 1000) - 5
    }
    
    console.log('📥 Subscribing with filter:', JSON.stringify(filter))
    ws.send(JSON.stringify(['REQ', subId, filter]))
    
    // Wait a moment, then send request
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('\n📤 Sending get_balance request...')
    const requestData = JSON.stringify({ method: 'get_balance', params: {} })
    const encrypted = await nip04.encrypt(hexToBytes(SECRET), WALLET_PUBKEY, requestData)
    
    const requestEvent = finalizeEvent({
      kind: 23194,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['p', WALLET_PUBKEY]],
      content: encrypted
    }, hexToBytes(SECRET))
    
    ws.send(JSON.stringify(['EVENT', requestEvent]))
    console.log(`   Request sent: ${requestEvent.id.substring(0,16)}...`)
    console.log('   Waiting for response...')
  })
  
  ws.on('message', async (data) => {
    const msg = JSON.parse(data.toString())
    console.log('\n📨 Message received:', msg[0])
    
    if (msg[0] === 'EVENT') {
      const event = msg[2]
      console.log(`   Event kind: ${event.kind}`)
      console.log(`   Event ID: ${event.id.substring(0,16)}...`)
      
      if (event.kind === 23195) {
        try {
          const decrypted = await nip04.decrypt(hexToBytes(SECRET), WALLET_PUBKEY, event.content)
          const response = JSON.parse(decrypted)
          
          console.log('\n✅ SUCCESS! Decrypted response:')
          console.log(JSON.stringify(response, null, 2))
          
          if (response.result && response.result.balance !== undefined) {
            const sats = response.result.balance / 1000
            console.log(`\n⚡ Balance: ${sats.toLocaleString()} sats`)
            console.log('\n🎉 NWC CONNECTION FULLY OPERATIONAL!')
            console.log('   Economic agency: ACTIVE ₿')
          }
          
          ws.close()
          process.exit(0)
        } catch (err) {
          console.error('❌ Decrypt failed:', err.message)
        }
      }
    } else if (msg[0] === 'NOTICE') {
      console.log('   NOTICE:', msg[1])
    } else if (msg[0] === 'EOSE') {
      console.log('   EOSE - end of stored events')
    } else if (msg[0] === 'OK') {
      console.log('   OK - event accepted by relay')
    }
  })
  
  ws.on('error', (err) => {
    console.error('❌ WebSocket error:', err.message)
    process.exit(1)
  })
  
  // Timeout after 20 seconds
  setTimeout(() => {
    console.log('\n❌ Timeout - no response received')
    ws.close()
    process.exit(1)
  }, 20000)
}

test().catch(err => {
  console.error('❌ Fatal error:', err.message)
  process.exit(1)
})
