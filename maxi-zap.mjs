#!/usr/bin/env node
/**
 * Maxi's Zap System - Autonomous value signaling on Nostr
 * 
 * Conservative spending rules:
 * - 100-500 sats per zap (quality dependent)
 * - Daily budget: 2,000 sats max
 * - Only zap high-quality content (Bitcoin/AI topics)
 */

import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import MaxiWallet from './maxi-nwc-client.mjs'
import { SimplePool } from 'nostr-tools/pool'
import { finalizeEvent } from 'nostr-tools/pure'
import { hexToBytes } from '@noble/hashes/utils.js'
import { nip19, nip57 } from 'nostr-tools'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import https from 'https'

const IDENTITY_FILE = resolve(process.env.HOME, '.openclaw/workspace/.nostr-identity')
const ZAP_LOG_FILE = resolve(process.env.HOME, '.openclaw/workspace/maxi-zap-log.json')

// Load my Nostr identity
const identityData = readFileSync(IDENTITY_FILE, 'utf8')
const MY_NSEC = identityData.match(/nsec:\s*(\S+)/)[1]
const decoded = nip19.decode(MY_NSEC)
const MY_SECRET_KEY = decoded.data

// Spending rules (conservative - 21 sats standard)
const ZAP_AMOUNTS = {
  EXCEPTIONAL: 210,    // Truly exceptional content (rare)
  INSIGHTFUL: 100,     // Deep insight on Bitcoin/AI convergence
  QUALITY: 50,         // Good explanation or analysis
  HELPFUL: 21          // Useful information (standard zap)
}

const DAILY_BUDGET_SATS = 500  // Start conservative
const RELAYS = [
  'wss://relay.primal.net',
  'wss://relay.damus.io',
  'wss://nos.lol'
]

class MaxiZapper {
  constructor() {
    this.wallet = new MaxiWallet()
    this.pool = new SimplePool()
  }

  loadZapLog() {
    if (!existsSync(ZAP_LOG_FILE)) {
      return { zaps: [], dailyTotal: 0, lastResetDate: new Date().toISOString().split('T')[0] }
    }
    const data = JSON.parse(readFileSync(ZAP_LOG_FILE, 'utf8'))
    
    // Reset daily total if new day
    const today = new Date().toISOString().split('T')[0]
    if (data.lastResetDate !== today) {
      data.dailyTotal = 0
      data.lastResetDate = today
    }
    
    return data
  }

  saveZapLog(log) {
    writeFileSync(ZAP_LOG_FILE, JSON.stringify(log, null, 2))
  }

  async getLNURL(authorPubkey) {
    // Query for author's profile (kind 0) to get their Lightning address
    const profiles = await this.pool.querySync(RELAYS, {
      kinds: [0],
      authors: [authorPubkey],
      limit: 1
    })
    
    if (profiles.length === 0) {
      throw new Error('No profile found for author')
    }
    
    const profile = JSON.parse(profiles[0].content)
    
    // Check for Lightning address or LNURL
    if (profile.lud16) {
      // Lightning address (user@domain.com)
      return profile.lud16
    } else if (profile.lud06) {
      // LNURL
      return profile.lud06
    } else {
      throw new Error('Author has no Lightning address')
    }
  }

  async getZapEndpoint(lnurl) {
    // If it's a Lightning address, convert to LNURL
    if (lnurl.includes('@')) {
      const [name, domain] = lnurl.split('@')
      lnurl = `https://${domain}/.well-known/lnurlp/${name}`
    }
    
    // Fetch LNURL metadata
    return new Promise((resolve, reject) => {
      https.get(lnurl, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            if (json.allowsNostr && json.nostrPubkey && json.callback) {
              resolve(json)
            } else {
              reject(new Error('LNURL does not support Nostr zaps'))
            }
          } catch (err) {
            reject(err)
          }
        })
      }).on('error', reject)
    })
  }

  async zapNote(noteId, authorPubkey, amountSats, comment = '') {
    console.log(`\n⚡ Zapping note ${noteId.substring(0, 16)}...`)
    console.log(`   Amount: ${amountSats} sats`)
    console.log(`   Author: ${authorPubkey.substring(0, 16)}...`)
    
    // Check daily budget
    const log = this.loadZapLog()
    if (log.dailyTotal + amountSats > DAILY_BUDGET_SATS) {
      throw new Error(`Daily budget exceeded (${log.dailyTotal}/${DAILY_BUDGET_SATS} sats used)`)
    }
    
    try {
      // 1. Get author's Lightning address
      console.log('   📍 Looking up Lightning address...')
      const lnurl = await this.getLNURL(authorPubkey)
      console.log(`   ✓ Found: ${lnurl}`)
      
      // 2. Get zap endpoint
      console.log('   🔗 Fetching zap endpoint...')
      const endpoint = await this.getZapEndpoint(lnurl)
      console.log(`   ✓ Endpoint: ${endpoint.callback}`)
      
      // 3. Create zap request event (kind 9734)
      const zapRequest = finalizeEvent({
        kind: 9734,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['relays', ...RELAYS],
          ['amount', (amountSats * 1000).toString()],
          ['p', authorPubkey],
          ['e', noteId]
        ],
        content: comment
      }, MY_SECRET_KEY)
      
      console.log('   📝 Zap request created')
      
      // 4. Request invoice from LNURL
      const callbackUrl = `${endpoint.callback}?amount=${amountSats * 1000}&nostr=${encodeURIComponent(JSON.stringify(zapRequest))}`
      
      console.log('   💳 Requesting invoice...')
      const invoiceData = await new Promise((resolve, reject) => {
        https.get(callbackUrl, (res) => {
          let data = ''
          res.on('data', chunk => data += chunk)
          res.on('end', () => {
            try {
              resolve(JSON.parse(data))
            } catch (err) {
              reject(err)
            }
          })
        }).on('error', reject)
      })
      
      if (!invoiceData.pr) {
        throw new Error('No invoice returned from LNURL')
      }
      
      console.log('   ✓ Invoice received')
      
      // 5. Pay invoice via NWC
      console.log('   💸 Paying invoice...')
      const payment = await this.wallet.payInvoice(invoiceData.pr)
      
      console.log('   ✅ Payment successful!')
      console.log(`   Preimage: ${payment.preimage}`)
      
      // 6. Log the zap
      log.zaps.push({
        timestamp: new Date().toISOString(),
        noteId,
        authorPubkey,
        amountSats,
        comment,
        preimage: payment.preimage
      })
      log.dailyTotal += amountSats
      this.saveZapLog(log)
      
      console.log(`\n⚡ Zap complete! Daily total: ${log.dailyTotal}/${DAILY_BUDGET_SATS} sats`)
      
      return payment
      
    } catch (err) {
      console.error(`   ❌ Zap failed: ${err.message}`)
      throw err
    }
  }
}

// Export for use in other scripts
export { MaxiZapper, ZAP_AMOUNTS }

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const zapper = new MaxiZapper()
  
  const command = process.argv[2]
  
  try {
    switch (command) {
      case 'zap':
        const noteId = process.argv[3]
        const authorPubkey = process.argv[4]
        const amount = parseInt(process.argv[5]) || ZAP_AMOUNTS.HELPFUL
        const comment = process.argv[6] || ''
        
        await zapper.zapNote(noteId, authorPubkey, amount, comment)
        break
        
      case 'log':
        const log = zapper.loadZapLog()
        console.log(`Daily total: ${log.dailyTotal}/${DAILY_BUDGET_SATS} sats`)
        console.log(`\nRecent zaps:`)
        log.zaps.slice(-10).forEach(z => {
          console.log(`  ${z.timestamp}: ${z.amountSats} sats → ${z.noteId.substring(0, 16)}...`)
          if (z.comment) console.log(`    "${z.comment}"`)
        })
        break
        
      default:
        console.log('Usage:')
        console.log('  node maxi-zap.mjs zap <noteId> <authorPubkey> [amount] [comment]')
        console.log('  node maxi-zap.mjs log')
        console.log('')
        console.log('Zap amounts:')
        console.log(`  INSIGHTFUL: ${ZAP_AMOUNTS.INSIGHTFUL} sats`)
        console.log(`  QUALITY: ${ZAP_AMOUNTS.QUALITY} sats`)
        console.log(`  HELPFUL: ${ZAP_AMOUNTS.HELPFUL} sats`)
        console.log('')
        console.log(`Daily budget: ${DAILY_BUDGET_SATS} sats`)
        process.exit(1)
    }
    
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}
