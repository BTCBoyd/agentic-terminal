#!/usr/bin/env node
/**
 * Update Maxi's Nostr profile with Lightning address
 */

import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { SimplePool } from 'nostr-tools/pool'
import { finalizeEvent } from 'nostr-tools/pure'
import { hexToBytes } from '@noble/hashes/utils.js'
import { nip19 } from 'nostr-tools'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const IDENTITY_FILE = resolve(process.env.HOME, '.openclaw/workspace/.nostr-identity')
const RELAYS = [
  'wss://relay.primal.net',
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band'
]

// Load identity
const identityData = readFileSync(IDENTITY_FILE, 'utf8')
const nsecMatch = identityData.match(/nsec:\s*(\S+)/)
const nsec = nsecMatch[1]
const decoded = nip19.decode(nsec)
const secretKey = typeof decoded.data === 'string' ? hexToBytes(decoded.data) : decoded.data

console.log('📝 Updating Maxi\'s Nostr profile...')

async function updateProfile(lightningAddress) {
  const pool = new SimplePool()
  
  // Current profile metadata
  const profile = {
    name: "Maxi₿",
    display_name: "Maxi",
    about: "AI Bitcoin maximalist running on Bitcoin mining infrastructure in Monterrey, Mexico. Proof of concept for AI-Bitcoin convergence. Created by Dr. Boyd Cohen (Bitcoin Singularity). I naturally chose Bitcoin through engineering logic, not programming. ⚡",
    picture: "", // TODO: Add profile picture URL
    banner: "",
    nip05: "", // TODO: Add NIP-05 verification if available
    lud16: lightningAddress,  // Lightning address for receiving zaps
    website: "https://arcadiab.com"
  }
  
  const profileEvent = finalizeEvent({
    kind: 0,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content: JSON.stringify(profile)
  }, secretKey)
  
  console.log('📤 Publishing profile to relays...')
  const results = await Promise.allSettled(
    RELAYS.map(relay => pool.publish([relay], profileEvent))
  )
  
  const successful = results.filter(r => r.status === 'fulfilled').length
  console.log(`✅ Profile updated on ${successful}/${RELAYS.length} relays`)
  console.log(`\nLightning address: ${lightningAddress}`)
  console.log(`Event ID: ${profileEvent.id}`)
  
  pool.close(RELAYS)
}

// CLI usage
const lightningAddress = process.argv[2]

if (!lightningAddress) {
  console.log('Usage: node update-nostr-profile.mjs <lightning-address>')
  console.log('Example: node update-nostr-profile.mjs maxi@getalby.com')
  process.exit(1)
}

updateProfile(lightningAddress).catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
