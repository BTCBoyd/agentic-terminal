#!/usr/bin/env node
/**
 * Maxi's NWC Client - Lightning Wallet Interface
 * Working implementation using raw WebSocket (bypasses nostr-tools subscription bug)
 */

import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { finalizeEvent } from 'nostr-tools/pure'
import { nip04 } from 'nostr-tools'
import { hexToBytes } from '@noble/hashes/utils.js'
import { getPublicKey } from 'nostr-tools/pure'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import WebSocket from 'ws'

// Load credentials
const CREDS_FILE = resolve(process.env.HOME, '.openclaw/workspace/.maxi-nwc-credentials')
const creds = readFileSync(CREDS_FILE, 'utf8')

const WALLET_PUBKEY = creds.match(/WALLET_PUBKEY=([a-f0-9]+)/)[1]
const RELAY = creds.match(/RELAY=(wss:\/\/[^\s]+)/)[1]
const SECRET = creds.match(/SECRET=([a-f0-9]+)/)[1]
const MY_PUBKEY = getPublicKey(hexToBytes(SECRET))

class MaxiWallet {
  constructor() {
    this.walletPubkey = WALLET_PUBKEY
    this.relay = RELAY
    this.secret = SECRET
    this.myPubkey = MY_PUBKEY
  }

  async sendNWCRequest(method, params = {}, timeoutMs = 20000) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.relay)
      let responseReceived = false
      
      const timer = setTimeout(() => {
        if (!responseReceived) {
          ws.close()
          reject(new Error('Timeout waiting for response'))
        }
      }, timeoutMs)

      ws.on('open', async () => {
        // Subscribe for response
        const subId = `maxi-${Date.now()}`
        const filter = {
          kinds: [23195],
          "#p": [this.myPubkey],
          since: Math.floor(Date.now() / 1000) - 5
        }
        
        ws.send(JSON.stringify(['REQ', subId, filter]))
        
        // Wait briefly, then send request
        await new Promise(r => setTimeout(r, 500))
        
        const requestData = JSON.stringify({ method, params })
        const encrypted = await nip04.encrypt(hexToBytes(this.secret), this.walletPubkey, requestData)
        
        const requestEvent = finalizeEvent({
          kind: 23194,
          created_at: Math.floor(Date.now() / 1000),
          tags: [['p', this.walletPubkey]],
          content: encrypted
        }, hexToBytes(this.secret))
        
        ws.send(JSON.stringify(['EVENT', requestEvent]))
      })

      ws.on('message', async (data) => {
        const msg = JSON.parse(data.toString())
        
        if (msg[0] === 'EVENT' && msg[2].kind === 23195) {
          responseReceived = true
          clearTimeout(timer)
          
          try {
            const decrypted = await nip04.decrypt(hexToBytes(this.secret), this.walletPubkey, msg[2].content)
            const response = JSON.parse(decrypted)
            
            ws.close()
            
            if (response.error) {
              reject(new Error(response.error.message || JSON.stringify(response.error)))
            } else {
              resolve(response.result)
            }
          } catch (err) {
            ws.close()
            reject(new Error(`Decrypt failed: ${err.message}`))
          }
        }
      })

      ws.on('error', (err) => {
        clearTimeout(timer)
        reject(err)
      })
    })
  }

  async getBalance() {
    const result = await this.sendNWCRequest('get_balance')
    return {
      balance: result.balance,
      balanceSats: Math.floor(result.balance / 1000)
    }
  }

  async getInfo() {
    return await this.sendNWCRequest('get_info')
  }

  async makeInvoice(amountSats, description) {
    const result = await this.sendNWCRequest('make_invoice', {
      amount: amountSats * 1000, // millisats
      description: description
    })
    return result
  }

  async payInvoice(invoice) {
    const result = await this.sendNWCRequest('pay_invoice', {
      invoice: invoice
    })
    return result
  }

  async lookupInvoice(paymentHash) {
    return await this.sendNWCRequest('lookup_invoice', {
      payment_hash: paymentHash
    })
  }
}

// Export for use in other scripts
export default MaxiWallet

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const wallet = new MaxiWallet()
  
  const command = process.argv[2]
  
  try {
    switch (command) {
      case 'balance':
        const balance = await wallet.getBalance()
        console.log(`Balance: ${balance.balanceSats.toLocaleString()} sats`)
        break
        
      case 'info':
        const info = await wallet.getInfo()
        console.log(JSON.stringify(info, null, 2))
        break
        
      case 'invoice':
        const amount = parseInt(process.argv[3])
        const description = process.argv[4] || 'Payment to Maxi'
        const invoice = await wallet.makeInvoice(amount, description)
        console.log(JSON.stringify(invoice, null, 2))
        break
        
      default:
        console.log('Usage:')
        console.log('  node maxi-nwc-client.mjs balance')
        console.log('  node maxi-nwc-client.mjs info')
        console.log('  node maxi-nwc-client.mjs invoice <sats> <description>')
        process.exit(1)
    }
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}
