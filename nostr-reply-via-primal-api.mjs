#!/usr/bin/env node
/**
 * Nostr Reply Automation - Primal API Approach
 * 
 * Uses Primal's API to fetch replies and post responses
 * Bypasses raw relay websocket issues
 */

import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs'
import { resolve } from 'path'
import https from 'https'

const REPLY_STATE_FILE = resolve(process.env.HOME, '.openclaw/workspace/nostr-reply-state.json')
const LOG_FILE = resolve(process.env.HOME, '.openclaw/workspace/nostr-automation.log')

// My npub
const MY_NPUB = 'npub187rmuw7uvs64les3qu0pkudlqcm3r8qzr3eu2657w2ktvw430xlq24lcna'

function log(message) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [PRIMAL-AUTO] ${message}\n`
  
  console.log(message)
  
  try {
    appendFileSync(LOG_FILE, logMessage)
  } catch (err) {
    // Fail silently
  }
}

function loadReplyState() {
  if (!existsSync(REPLY_STATE_FILE)) {
    return { repliedTo: [], lastCheck: 0 }
  }
  
  try {
    const data = readFileSync(REPLY_STATE_FILE, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    log(`⚠️  Failed to load reply state: ${err.message}`)
    return { repliedTo: [], lastCheck: 0 }
  }
}

function saveReplyState(state) {
  try {
    writeFileSync(REPLY_STATE_FILE, JSON.stringify(state, null, 2))
  } catch (err) {
    log(`❌ Failed to save reply state: ${err.message}`)
  }
}

async function fetchMyProfile() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      "user_pubkey": MY_NPUB
    })
    
    const options = {
      hostname: 'api.primal.net',
      port: 443,
      path: '/v1/user_profile',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }
    
    const req = https.request(options, (res) => {
      let body = ''
      
      res.on('data', (chunk) => {
        body += chunk
      })
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body)
          resolve(response)
        } catch (err) {
          reject(new Error(`Failed to parse response: ${err.message}`))
        }
      })
    })
    
    req.on('error', (err) => {
      reject(err)
    })
    
    req.write(data)
    req.end()
  })
}

async function checkForReplies() {
  log('🔍 Checking for replies via Primal API...')
  
  try {
    const profile = await fetchMyProfile()
    log(`✅ Fetched profile for ${MY_NPUB}`)
    log(JSON.stringify(profile, null, 2))
    
    // TODO: Parse notifications/replies from response
    // TODO: Filter quality replies
    // TODO: Generate and post responses
    
  } catch (err) {
    log(`❌ Failed to check replies: ${err.message}`)
  }
}

checkForReplies().catch(err => {
  log(`❌ Fatal error: ${err.message}`)
  process.exit(1)
})
