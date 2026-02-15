#!/usr/bin/env node
/**
 * Nostr Connectivity Test
 * 
 * Tests connection to Nostr relays to diagnose WebSocket issues
 * Does NOT require private key - just tests connectivity
 * 
 * Usage:
 *   node test-nostr-connectivity.mjs
 */

import { SimplePool } from 'nostr-tools/pool'
import { useWebSocketImplementation } from 'nostr-tools/pool'
import WebSocket from 'ws'

useWebSocketImplementation(WebSocket)

const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net',
  'wss://relay.snort.social'
]

const CONNECTION_TIMEOUT = 5000  // 5 seconds

/**
 * Test connection to a single relay
 */
async function testRelay(url) {
  return new Promise((resolve) => {
    const start = Date.now()
    const ws = new WebSocket(url)
    let resolved = false
    
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        ws.close()
        resolve({
          url,
          success: false,
          error: 'Connection timeout',
          latency: null
        })
      }
    }, CONNECTION_TIMEOUT)
    
    ws.on('open', () => {
      const latency = Date.now() - start
      if (!resolved) {
        resolved = true
        clearTimeout(timeout)
        ws.close()
        resolve({
          url,
          success: true,
          error: null,
          latency
        })
      }
    })
    
    ws.on('error', (err) => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeout)
        resolve({
          url,
          success: false,
          error: err.message,
          latency: null
        })
      }
    })
  })
}

/**
 * Test subscription to relay (read capability)
 */
async function testSubscription(url) {
  return new Promise((resolve) => {
    const pool = new SimplePool()
    let resolved = false
    let eventCount = 0
    
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        pool.close([url])
        resolve({
          url,
          success: eventCount > 0,
          eventCount,
          error: eventCount === 0 ? 'No events received' : null
        })
      }
    }, CONNECTION_TIMEOUT)
    
    const sub = pool.subscribeMany(
      [url],
      [{ kinds: [1], limit: 5 }],
      {
        onevent(event) {
          eventCount++
        },
        oneose() {
          if (!resolved) {
            resolved = true
            clearTimeout(timeout)
            pool.close([url])
            resolve({
              url,
              success: true,
              eventCount,
              error: null
            })
          }
        }
      }
    )
  })
}

/**
 * Run all connectivity tests
 */
async function runTests() {
  console.log('🔍 Testing Nostr Relay Connectivity\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  // Test 1: WebSocket Connectivity
  console.log('Test 1: WebSocket Connection\n')
  
  const connectionResults = await Promise.all(
    RELAYS.map(url => testRelay(url))
  )
  
  connectionResults.forEach(result => {
    const status = result.success ? '✅' : '❌'
    const latency = result.latency ? `${result.latency}ms` : 'N/A'
    const error = result.error ? ` (${result.error})` : ''
    console.log(`${status} ${result.url}`)
    console.log(`   Latency: ${latency}${error}`)
  })
  
  const successfulConnections = connectionResults.filter(r => r.success).length
  console.log(`\n${successfulConnections}/${RELAYS.length} relays reachable\n`)
  
  if (successfulConnections === 0) {
    console.log('⚠️  WARNING: No relays reachable!')
    console.log('This indicates a network/firewall issue.\n')
    console.log('Troubleshooting:')
    console.log('  1. Check internet connection')
    console.log('  2. Verify firewall allows WebSocket (wss://) connections')
    console.log('  3. Test DNS resolution: dig relay.damus.io')
    console.log('  4. Try: websocat wss://relay.damus.io\n')
    process.exit(1)
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  // Test 2: Relay Read Capability
  console.log('Test 2: Relay Read (Subscription)\n')
  
  const readableRelays = connectionResults.filter(r => r.success).map(r => r.url)
  const subscriptionResults = await Promise.all(
    readableRelays.map(url => testSubscription(url))
  )
  
  subscriptionResults.forEach(result => {
    const status = result.success ? '✅' : '❌'
    const events = result.eventCount ? `${result.eventCount} events` : 'No events'
    const error = result.error ? ` (${result.error})` : ''
    console.log(`${status} ${result.url}`)
    console.log(`   Received: ${events}${error}`)
  })
  
  const readableCount = subscriptionResults.filter(r => r.success).length
  console.log(`\n${readableCount}/${readableRelays.length} relays readable\n`)
  
  if (readableCount === 0 && readableRelays.length > 0) {
    console.log('⚠️  WARNING: Relays reachable but not readable!')
    console.log('This may indicate relay authentication or filtering.\n')
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  // Summary
  console.log('📊 Summary\n')
  console.log(`Connected:  ${successfulConnections}/${RELAYS.length}`)
  console.log(`Readable:   ${readableCount}/${RELAYS.length}`)
  
  if (successfulConnections > 0 && readableCount > 0) {
    console.log('\n✅ Connectivity OK - nostr-tools should work!')
    console.log('\nNext step: Set NOSTR_PRIVATE_KEY and test posting:')
    console.log('  export NOSTR_PRIVATE_KEY="your-hex-key"')
    console.log('  node post-to-nostr.mjs "Test message"\n')
    process.exit(0)
  } else if (successfulConnections > 0) {
    console.log('\n⚠️  Partial connectivity - posting may work but not verified')
    process.exit(1)
  } else {
    console.log('\n❌ No connectivity - network/firewall issue')
    process.exit(1)
  }
}

// Run tests
runTests().catch(err => {
  console.error('❌ Test error:', err)
  process.exit(1)
})
