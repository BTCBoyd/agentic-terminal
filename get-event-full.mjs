#!/usr/bin/env node
import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto
import { SimplePool } from 'nostr-tools/pool'
import { useWebSocketImplementation } from 'nostr-tools/pool'
import WebSocket from 'ws'

useWebSocketImplementation(WebSocket)

const eventId = process.argv[2]
if (!eventId) process.exit(1)

const pool = new SimplePool()
const events = await pool.querySync(['wss://relay.damus.io'], { ids: [eventId] })

if (events[0]) {
  console.log(JSON.stringify(events[0], null, 2))
}

pool.close(['wss://relay.damus.io'])
