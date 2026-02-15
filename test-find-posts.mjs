#!/usr/bin/env node
import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { SimplePool } from 'nostr-tools'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const IDENTITY_FILE = resolve(process.env.HOME, '.openclaw/workspace/.nostr-identity')
const RELAYS = [
  'wss://relay.primal.net',
  'wss://relay.damus.io', 
  'wss://nos.lol',
  'wss://relay.nostr.band'
]

const data = readFileSync(IDENTITY_FILE, 'utf8')
const pubkeyMatch = data.match(/Public Key \(hex\):\s*([a-f0-9]+)/i)
const myPubkey = pubkeyMatch[1]

console.log('My pubkey:', myPubkey)
console.log('Searching relays:', RELAYS)

const pool = new SimplePool()

// Try with no time limit first
console.log('\nFetching ALL my posts (no time limit)...')
const allPosts = await pool.querySync(RELAYS, {
  kinds: [1],
  authors: [myPubkey],
  limit: 100
})

console.log(`Found ${allPosts.length} total posts`)

if (allPosts.length > 0) {
  console.log('\nMost recent 3 posts:')
  allPosts.slice(0, 3).forEach((post, i) => {
    console.log(`\n${i+1}. ${new Date(post.created_at * 1000).toISOString()}`)
    console.log(`   ID: ${post.id}`)
    console.log(`   Content: "${post.content.substring(0, 80)}..."`)
  })
}

pool.close(RELAYS)
