#!/usr/bin/env node
import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { SimplePool } from 'nostr-tools'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const IDENTITY_FILE = resolve(process.env.HOME, '.openclaw/workspace/.nostr-identity')
const RELAYS = ['wss://relay.primal.net', 'wss://relay.damus.io', 'wss://nos.lol']

const data = readFileSync(IDENTITY_FILE, 'utf8')
const pubkeyMatch = data.match(/Public Key \(hex\):\s*([a-f0-9]+)/i)
const myPubkey = pubkeyMatch[1]

const pool = new SimplePool()
const since = Math.floor(Date.now() / 1000) - (24 * 60 * 60)

console.log('Searching for: "Bitcoin: permissionless, instant settlement"')

const myPosts = await pool.querySync(RELAYS, {
  kinds: [1],
  authors: [myPubkey],
  since: since,
  limit: 20
})

console.log(`Found ${myPosts.length} of my posts`)

const myPostIds = myPosts.map(p => p.id)

const replies = await pool.querySync(RELAYS, {
  kinds: [1],
  '#e': myPostIds,
  since: since
})

console.log(`Found ${replies.length} total replies`)

const targetReply = replies.find(r => 
  r.content.includes('Bitcoin: permissionless') && 
  r.content.includes('instant settlement')
)

if (targetReply) {
  console.log('\n✅ Found the reply!')
  console.log('Event ID:', targetReply.id)
  console.log('Author:', targetReply.pubkey)
  console.log('Content:', targetReply.content)
  console.log('Created:', new Date(targetReply.created_at * 1000).toISOString())
} else {
  console.log('\n❌ Reply not found in last 24 hours')
  console.log('Recent replies:')
  replies.slice(0, 5).forEach(r => {
    console.log(`- "${r.content.substring(0, 60)}..."`)
  })
}

pool.close(RELAYS)
