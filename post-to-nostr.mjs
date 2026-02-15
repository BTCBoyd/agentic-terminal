#!/usr/bin/env node
/**
 * Fixed Nostr Posting Script
 * 
 * Changes from original:
 * - Waits for confirmation from MULTIPLE relays (not just one)
 * - Reports which relays succeeded/failed
 * - Requires Primal relay success (configurable)
 * - Better error reporting
 */

import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { finalizeEvent } from 'nostr-tools/pure'
import { SimplePool } from 'nostr-tools/pool'
import { useWebSocketImplementation } from 'nostr-tools/pool'
import { nip19 } from 'nostr-tools'
import { hexToBytes } from '@noble/hashes/utils.js'
import WebSocket from 'ws'

useWebSocketImplementation(WebSocket)

const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net',
  'wss://relay.snort.social'
]

const PUBLISH_TIMEOUT = 8000 // Per-relay timeout
const MIN_SUCCESS_RELAYS = 2  // Require at least 2 relays to succeed
const REQUIRE_PRIMAL = true   // Fail if Primal doesn't accept

/**
 * Post to Nostr with better relay confirmation handling
 */
async function postToNostr(privateKey, content, relays = DEFAULT_RELAYS, replyOptions = null) {
  const pool = new SimplePool({ 
    enablePing: true,
    enableReconnect: true
  })
  
  try {
    const tags = []
    
    if (replyOptions?.replyTo) {
      tags.push(["e", replyOptions.replyTo, "", "reply"])
      console.error(`🔗 Replying to: ${replyOptions.replyTo}`)
    }
    
    if (replyOptions?.mention) {
      tags.push(["p", replyOptions.mention])
      console.error(`👤 Mentioning: ${replyOptions.mention}`)
    }
    
    const event = finalizeEvent({
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content
    }, privateKey)
    
    console.error(`\n📡 Publishing to ${relays.length} relays...`)
    console.error(`Event ID: ${event.id}\n`)
    
    // Publish to all relays and track individual results
    const publishPromises = pool.publish(relays, event)
    
    // Wait for all to settle with individual timeouts
    const results = await Promise.allSettled(
      publishPromises.map((promise, index) => 
        Promise.race([
          promise.then(() => ({ relay: relays[index], success: true })),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), PUBLISH_TIMEOUT)
          )
        ]).catch(err => ({ relay: relays[index], success: false, error: err.message }))
      )
    )
    
    // Analyze results
    const successful = []
    const failed = []
    let primalSuccess = false
    
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { relay, success, error } = result.value
        
        if (success) {
          successful.push(relay)
          console.error(`✅ ${relay}`)
          
          if (relay.includes('primal')) {
            primalSuccess = true
          }
        } else {
          failed.push({ relay, error })
          console.error(`❌ ${relay}: ${error || 'unknown error'}`)
        }
      } else {
        // This shouldn't happen with allSettled, but handle it
        failed.push({ relay: 'unknown', error: result.reason })
        console.error(`❌ Unknown relay: ${result.reason}`)
      }
    }
    
    console.error(`\n📊 Results: ${successful.length}/${relays.length} relays succeeded`)
    
    // Determine overall success
    const meetsMinimum = successful.length >= MIN_SUCCESS_RELAYS
    const meetsPrimalRequirement = !REQUIRE_PRIMAL || primalSuccess
    
    if (meetsMinimum && meetsPrimalRequirement) {
      console.error('✅ Post published successfully!')
      console.log(event.id)
      return true
    } else {
      if (!meetsMinimum) {
        console.error(`❌ Failed: Only ${successful.length}/${MIN_SUCCESS_RELAYS} minimum relays succeeded`)
      }
      if (!meetsPrimalRequirement) {
        console.error('❌ Failed: Primal relay required but did not accept')
      }
      return false
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
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
      config.content = args.slice(i).join(' ')
      break
    }
  }
  
  if (!config.privateKey) {
    config.privateKey = process.env.NOSTR_PRIVATE_KEY
  }
  
  // Convert nsec to hex if needed
  if (config.privateKey?.startsWith('nsec1')) {
    const decoded = nip19.decode(config.privateKey)
    config.privateKey = Array.from(decoded.data)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
  
  return config
}

function printHelp() {
  console.log(`
Fixed Nostr Posting Tool

Improvements:
  - Waits for confirmation from multiple relays
  - Reports which relays succeeded/failed
  - Requires minimum ${MIN_SUCCESS_RELAYS} relays to succeed
  - Requires Primal relay success (configurable)

Usage:
  node post-to-nostr-fixed.mjs [OPTIONS] <message>

Options:
  --key, -k <hex>        Private key (or NOSTR_PRIVATE_KEY env var)
  --relays, -r <list>    Comma-separated relay URLs
  --reply-to <event_id>  Reply to specific event (NIP-10)
  --mention <pubkey>     Mention author pubkey
  --help, -h             Show this help

Examples:
  export NOSTR_PRIVATE_KEY="abc123..."
  node post-to-nostr-fixed.mjs "Hello Nostr!"
  
  # Reply with threading
  node post-to-nostr-fixed.mjs --reply-to <event_id> --mention <pubkey> "Great!"
`)
}

async function main() {
  const config = parseArgs()
  
  if (!config.privateKey || config.privateKey.length !== 64) {
    console.error('❌ Error: Invalid or missing private key')
    console.error('Set NOSTR_PRIVATE_KEY or use --key flag')
    process.exit(1)
  }
  
  if (!config.content) {
    console.error('❌ Error: No message content provided')
    process.exit(1)
  }
  
  const privateKey = hexToBytes(config.privateKey)
  
  const replyOptions = (config.replyTo || config.mention) ? {
    replyTo: config.replyTo,
    mention: config.mention
  } : null
  
  const success = await postToNostr(privateKey, config.content, config.relays, replyOptions)
  
  process.exit(success ? 0 : 1)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error('❌ Unexpected error:', err)
    process.exit(1)
  })
}

export { postToNostr }
