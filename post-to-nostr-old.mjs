#!/usr/bin/env node
/**
 * Nostr Posting Script using nostr-tools
 * 
 * Replaces nak CLI with more reliable WebSocket handling
 * Features: auto-retry, connection pooling, multi-relay redundancy, threaded replies (NIP-10)
 * 
 * Usage:
 *   export NOSTR_PRIVATE_KEY="your-hex-key"
 *   node post-to-nostr.mjs "Your message here"
 * 
 * Or pass key as argument:
 *   node post-to-nostr.mjs --key <hex-key> "Your message"
 * 
 * For threaded replies (NIP-10):
 *   node post-to-nostr.mjs --reply-to <event_id> --mention <pubkey> "Your reply"
 */

// Polyfill crypto.getRandomValues for Node.js
import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { finalizeEvent } from 'nostr-tools/pure'
import { SimplePool } from 'nostr-tools/pool'
import { useWebSocketImplementation } from 'nostr-tools/pool'
import { nip19 } from 'nostr-tools'
import { hexToBytes } from '@noble/hashes/utils.js'
import WebSocket from 'ws'

// Enable WebSocket support for Node.js
useWebSocketImplementation(WebSocket)

// Get private key from environment
let privateKey = process.env.NOSTR_PRIVATE_KEY?.trim();

// Convert nsec to hex if needed
if (privateKey?.startsWith('nsec1')) {
  const decoded = nip19.decode(privateKey);
  // Convert Uint8Array to hex string
  privateKey = Array.from(decoded.data)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Default relays (can be overridden via --relays flag)
const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net',
  'wss://relay.snort.social'
]

// Timeout for publishing (ms)
const PUBLISH_TIMEOUT = 10000

/**
 * Post a message to Nostr relays
 * @param {Uint8Array} privateKey - Private key as bytes
 * @param {string} content - Message content
 * @param {string[]} relays - List of relay URLs
 * @param {Object} replyOptions - Optional reply parameters for NIP-10 threading
 * @param {string} replyOptions.replyTo - Event ID to reply to
 * @param {string} replyOptions.mention - Author pubkey to mention
 * @returns {Promise<boolean>} Success status
 */
async function postToNostr(privateKey, content, relays = DEFAULT_RELAYS, replyOptions = null) {
  const pool = new SimplePool({ 
    enablePing: true,        // Heartbeat monitoring
    enableReconnect: true    // Auto-reconnect on failure
  })
  
  try {
    // Build tags for NIP-10 reply threading
    const tags = []
    
    if (replyOptions?.replyTo) {
      // NIP-10: "e" tag marks this as a reply to a specific event
      tags.push(["e", replyOptions.replyTo, "", "reply"])
      console.error(`🔗 Replying to event: ${replyOptions.replyTo}`)
    }
    
    if (replyOptions?.mention) {
      // NIP-10: "p" tag mentions the author (sends notification)
      tags.push(["p", replyOptions.mention])
      console.error(`👤 Mentioning author: ${replyOptions.mention}`)
    }
    
    // Create event
    const event = finalizeEvent({
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content
    }, privateKey)
    
    console.error(`📡 Publishing to ${relays.length} relays...`)
    console.error(`Event ID: ${event.id}`)
    
    // Publish with timeout
    const publishPromise = Promise.any(pool.publish(relays, event))
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Publish timeout')), PUBLISH_TIMEOUT)
    )
    
    await Promise.race([publishPromise, timeoutPromise])
    
    console.error('✅ Posted successfully to at least one relay')
    console.log(event.id) // Output event ID to stdout for scripting
    return true
    
  } catch (err) {
    console.error('❌ Failed to post:', err.message)
    
    // Detailed error reporting
    if (err.errors) {
      console.error('Per-relay errors:')
      err.errors.forEach((e, i) => {
        console.error(`  ${relays[i]}: ${e.message}`)
      })
    }
    
    return false
    
  } finally {
    pool.close(relays)
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2)
  const config = {
    privateKey: null,
    content: null,
    relays: DEFAULT_RELAYS,
    replyTo: null,
    mention: null
  }
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    if (arg === '--key' || arg === '-k') {
      config.privateKey = args[++i]
    } else if (arg === '--relays' || arg === '-r') {
      config.relays = args[++i].split(',')
    } else if (arg === '--reply-to') {
      config.replyTo = args[++i]
    } else if (arg === '--mention') {
      config.mention = args[++i]
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    } else {
      // Treat remaining args as content
      config.content = args.slice(i).join(' ')
      break
    }
  }
  
  // Fallback to environment variable
  if (!config.privateKey) {
    config.privateKey = process.env.NOSTR_PRIVATE_KEY
  }
  
  return config
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
Nostr Posting Tool (using nostr-tools)

Usage:
  node post-to-nostr.mjs [OPTIONS] <message>

Options:
  --key, -k <hex>        Private key in hex format (or set NOSTR_PRIVATE_KEY env var)
  --relays, -r <list>    Comma-separated relay URLs (default: ${DEFAULT_RELAYS.length} popular relays)
  --reply-to <event_id>  Reply to a specific event (NIP-10 threading)
  --mention <pubkey>     Mention an author's pubkey (notifies them)
  --help, -h             Show this help message

Examples:
  # Standalone post
  export NOSTR_PRIVATE_KEY="abc123..."
  node post-to-nostr.mjs "Hello Nostr!"
  
  # Threaded reply (NIP-10)
  node post-to-nostr.mjs --reply-to <event_id> --mention <author_pubkey> "Great point!"
  
  # Using command line key
  node post-to-nostr.mjs --key abc123... "Hello Nostr!"
  
  # Custom relays
  node post-to-nostr.mjs --relays wss://relay1.com,wss://relay2.com "Hello!"

Reply Threading (NIP-10):
  Use --reply-to and --mention together to create threaded replies.
  This ensures your reply appears connected to the original post in Nostr clients
  (Primal, Damus, etc.) and notifies the author.

Environment Variables:
  NOSTR_PRIVATE_KEY      Your Nostr private key in hex format

Exit Codes:
  0  Success (posted to at least one relay)
  1  Failure (all relays failed or invalid input)
`)
}

/**
 * Validate hex string
 */
function isValidHex(str) {
  return /^[0-9a-fA-F]+$/.test(str) && str.length === 64
}

/**
 * Main execution
 */
async function main() {
  const config = parseArgs()
  
  // Validate input
  if (!config.privateKey) {
    console.error('❌ Error: Private key not provided')
    console.error('Set NOSTR_PRIVATE_KEY environment variable or use --key flag')
    console.error('Run with --help for usage information')
    process.exit(1)
  }
  
  // Convert nsec to hex if needed (use the module-level privateKey if it was converted)
  if (config.privateKey.startsWith('nsec1')) {
    const decoded = nip19.decode(config.privateKey);
    // Convert Uint8Array to hex string
    config.privateKey = Array.from(decoded.data)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  if (!config.privateKey || config.privateKey.length !== 64) {
    console.error('❌ Error: Invalid private key format (must be 64-char hex string or nsec format)')
    process.exit(1)
  }
  
  if (!config.content) {
    console.error('❌ Error: No message content provided')
    console.error('Usage: node post-to-nostr.mjs "Your message here"')
    process.exit(1)
  }
  
  // Convert hex key to bytes
  const privateKey = hexToBytes(config.privateKey)
  
  // Build reply options if provided
  const replyOptions = (config.replyTo || config.mention) ? {
    replyTo: config.replyTo,
    mention: config.mention
  } : null
  
  // Post message
  const success = await postToNostr(privateKey, config.content, config.relays, replyOptions)
  
  process.exit(success ? 0 : 1)
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error('❌ Unexpected error:', err)
    process.exit(1)
  })
}

export { postToNostr }
