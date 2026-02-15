#!/usr/bin/env node
/**
 * Helper script to decode Nostr bech32 formats to hex
 * Useful for converting note1... and npub1... to hex for posting replies
 */

import { nip19 } from 'nostr-tools'

const input = process.argv[2]

if (!input) {
  console.log('Usage: node nostr-decode.mjs <note1...|npub1...>')
  console.log('')
  console.log('Examples:')
  console.log('  node nostr-decode.mjs note1abc123...')
  console.log('  node nostr-decode.mjs npub1xyz789...')
  process.exit(1)
}

try {
  const decoded = nip19.decode(input)
  
  if (decoded.type === 'note') {
    console.log('Event ID (hex):', decoded.data)
    console.log('Use with: --reply-to', decoded.data)
  } else if (decoded.type === 'npub') {
    console.log('Pubkey (hex):', decoded.data)
    console.log('Use with: --mention', decoded.data)
  } else {
    console.log('Type:', decoded.type)
    console.log('Data:', decoded.data)
  }
} catch (err) {
  console.error('❌ Error decoding:', err.message)
  console.error('Make sure you provide a valid note1... or npub1... string')
  process.exit(1)
}
