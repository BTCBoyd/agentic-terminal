#!/usr/bin/env node
import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { finalizeEvent, verifyEvent } from 'nostr-tools/pure'
import { SimplePool } from 'nostr-tools'
import { nip19 } from 'nostr-tools'
import WebSocket from 'ws'

const nsec = 'nsec1n0duj3lz2r5ky39le03xpkk0zsd9len7renckl30zacfgpzrnfzsmm4t9g'
const decoded = nip19.decode(nsec)
const secretKey = decoded.data

const event = finalizeEvent({
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: `Debug test ${Date.now()}`
}, secretKey)

console.log('Event:', JSON.stringify(event, null, 2))
console.log('\nValidation:', verifyEvent(event) ? '✅ Valid' : '❌ Invalid')

const pool = new SimplePool()
const relay = 'wss://relay.primal.net'

console.log('\nPublishing to', relay)

try {
  const pub = pool.publish([relay], event)
  
  pub.on('ok', () => {
    console.log('✅ Relay accepted event')
  })
  
  pub.on('failed', (reason) => {
    console.log('❌ Relay rejected:', reason)
  })
  
  await pub
  
  console.log('\nPub completed')
  
  // Now query it back
  console.log('\nQuerying for event...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  const events = await pool.querySync([relay], { ids: [event.id] })
  console.log('Found:', events.length, 'events')
  
  pool.close([relay])
  
} catch (err) {
  console.error('Error:', err.message)
  pool.close([relay])
}
