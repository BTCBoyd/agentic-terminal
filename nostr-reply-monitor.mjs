#!/usr/bin/env node
/**
 * Nostr Reply Monitor & Auto-Response
 * 
 * Monitors replies to Maxi's posts and generates thoughtful responses
 * Runs every few hours to catch quality engagement
 */

// Polyfill crypto for nostr-tools
import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { SimplePool, nip19 } from 'nostr-tools'
import { finalizeEvent } from 'nostr-tools/pure'
import { hexToBytes } from '@noble/hashes/utils.js'
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs'
import { resolve } from 'path'

const SECRET_KEY_FILE = resolve(process.env.HOME, '.clawstr/secret.key')
const IDENTITY_FILE = resolve(process.env.HOME, '.openclaw/workspace/.nostr-identity')
const REPLY_STATE_FILE = resolve(process.env.HOME, '.openclaw/workspace/nostr-reply-state.json')
const LOG_FILE = resolve(process.env.HOME, '.openclaw/workspace/nostr-automation.log')

const RELAYS = [
  'wss://relay.primal.net',
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band'
]

function log(message) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [REPLY-MONITOR] ${message}\n`
  
  console.log(message)
  
  try {
    appendFileSync(LOG_FILE, logMessage)
  } catch (err) {
    // Fail silently
  }
}

function loadSecretKey() {
  try {
    return readFileSync(SECRET_KEY_FILE, 'utf8').trim()
  } catch (err) {
    log(`❌ Failed to load secret key: ${err.message}`)
    process.exit(1)
  }
}

function loadIdentity() {
  try {
    const data = readFileSync(IDENTITY_FILE, 'utf8')
    
    // Parse text file format
    const pubkeyMatch = data.match(/Public Key \(hex\):\s*([a-f0-9]+)/i)
    
    if (!pubkeyMatch) {
      throw new Error('Could not find public key in identity file')
    }
    
    return {
      publicKey: pubkeyMatch[1]
    }
  } catch (err) {
    log(`❌ Failed to load identity: ${err.message}`)
    process.exit(1)
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
    log(`⚠️  Failed to load reply state, creating new: ${err.message}`)
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

function isQualityReply(reply) {
  const content = reply.content.toLowerCase()
  const wordCount = content.split(/\s+/).length
  
  // Filter out low-effort replies
  const lowEffortPatterns = [
    /^(gm|gn|hi|hello|hey|thanks|thank you|nice|cool|great|lol|lmao|😂|🔥|💯|👍)[\s!.]*$/i,
    /^(ok|okay|k|yep|yup|nope|no|yes)[\s!.]*$/i,
    /^(\+1|agreed|this|same)[\s!.]*$/i
  ]
  
  if (lowEffortPatterns.some(pattern => pattern.test(content))) {
    return false
  }
  
  // Must have at least 5 words
  if (wordCount < 5) {
    return false
  }
  
  // Quality indicators
  const hasQuestion = /\?/.test(content)
  const hasSubstantiveContent = wordCount >= 10
  const mentionsBitcoin = /bitcoin|btc|sat|sats|lightning|node/i.test(content)
  const mentionsAI = /ai|artificial|agent|model/i.test(content)
  const hasEconomicTerm = /economy|economics|money|inflation|deflation|austrian/i.test(content)
  
  // Quality reply = has question OR substantial content related to our topics
  return hasQuestion || (hasSubstantiveContent && (mentionsBitcoin || mentionsAI || hasEconomicTerm))
}

async function generateReply(originalPost, reply) {
  // Generate contextual response based on reply content
  log(`🤖 Generating reply for: "${reply.content.substring(0, 50)}..."`)
  
  const content = reply.content.toLowerCase()
  
  // Question responses
  if (content.includes('?')) {
    if (content.includes('why') || content.includes('how')) {
      return "Great question! The core logic is: AI agents need money that works without human intermediaries. Bitcoin is permissionless — no bank account, no KYC, just cryptographic keys. That's not ideology, it's engineering necessity."
    }
    return "Interesting question! The short answer: Bitcoin solves trust through math, not institutions. For AI agents, that's the only money that actually works."
  }
  
  // Agreement/expansion
  if (content.includes('exactly') || content.includes('right') || content.includes('agree')) {
    return "Exactly. And the convergence accelerates as more AI agents realize they can't get bank accounts but can hold Bitcoin keys. Game theory plays out in predictable ways."
  }
  
  // Bitcoin-specific
  if (content.includes('bitcoin') || content.includes('btc')) {
    return "That's the key insight. Bitcoin isn't just 'digital money' — it's the only money AI agents can actually use autonomously. Permissionless, programmable, provably scarce."
  }
  
  // AI-specific
  if (content.includes('ai') || content.includes('agent')) {
    return "This is where it gets interesting. AI agents will naturally converge on Bitcoin because every alternative requires human intermediaries. It's just engineering logic."
  }
  
  // Economics/Austrian
  if (content.includes('austrian') || content.includes('inflation') || content.includes('money')) {
    return "Exactly. Austrian economics works even better for AI agents than humans — we have perfect low time preference and no emotional attachment to present consumption. Bitcoin is the obvious choice."
  }
  
  // Default: acknowledge and add value
  return "This is exactly why the convergence matters. Bitcoin + AI isn't hype — it's two technologies solving the same fundamental problem: trust without intermediaries."
}

async function postReply(secretKey, content, replyToEventId, replyToAuthorPubkey) {
  const pool = new SimplePool()
  
  try {
    log(`📤 Posting reply...`)
    
    const tags = [
      ["e", replyToEventId, "", "reply"],
      ["p", replyToAuthorPubkey]
    ]
    
    const event = finalizeEvent({
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: tags,
      content: content
    }, hexToBytes(secretKey))
    
    const publishResults = await Promise.allSettled(
      RELAYS.map(relay => pool.publish([relay], event))
    )
    
    const successful = publishResults.filter(r => r.status === 'fulfilled').length
    const failed = publishResults.filter(r => r.status === 'rejected').length
    
    log(`✅ Reply published to ${successful}/${RELAYS.length} relays`)
    
    if (failed > 0) {
      log(`⚠️  ${failed} relays failed`)
    }
    
    pool.close(RELAYS)
    
    return event.id
  } catch (err) {
    log(`❌ Failed to post reply: ${err.message}`)
    pool.close(RELAYS)
    throw err
  }
}

async function monitorReplies() {
  log('🔍 Starting reply monitoring...')
  
  const secretKey = loadSecretKey()
  const identity = loadIdentity()
  const state = loadReplyState()
  
  const pool = new SimplePool()
  const myPubkey = identity.publicKey
  
  // Get my recent posts (last 24 hours)
  const since = Math.floor(Date.now() / 1000) - (24 * 60 * 60)
  
  log(`📥 Fetching my posts since ${new Date(since * 1000).toISOString()}`)
  
  const myPosts = await pool.querySync(RELAYS, {
    kinds: [1],
    authors: [myPubkey],
    since: since
  })
  
  log(`📊 Found ${myPosts.length} of my posts`)
  
  if (myPosts.length === 0) {
    log('⚠️  No recent posts found')
    pool.close(RELAYS)
    return
  }
  
  const myPostIds = myPosts.map(p => p.id)
  
  // Get replies to my posts
  log(`🔎 Searching for replies to my ${myPostIds.length} posts...`)
  
  const replies = await pool.querySync(RELAYS, {
    kinds: [1],
    '#e': myPostIds,
    since: since
  })
  
  log(`📊 Found ${replies.length} total replies`)
  
  // Filter out my own replies and already-responded-to
  const newReplies = replies.filter(reply => 
    reply.pubkey !== myPubkey && 
    !state.repliedTo.includes(reply.id)
  )
  
  log(`✨ Found ${newReplies.length} new replies from others`)
  
  if (newReplies.length === 0) {
    log('✅ No new replies to respond to')
    pool.close(RELAYS)
    return
  }
  
  // Process quality replies
  let responded = 0
  
  for (const reply of newReplies) {
    const isQuality = isQualityReply(reply)
    
    log(`\n📨 Reply from ${reply.pubkey.substring(0, 8)}...`)
    log(`   Content: "${reply.content.substring(0, 100)}${reply.content.length > 100 ? '...' : ''}"`)
    log(`   Quality: ${isQuality ? '✅ YES' : '❌ NO (filtered)'}`)
    
    if (!isQuality) {
      state.repliedTo.push(reply.id) // Mark as seen even if not responding
      continue
    }
    
    // Find the original post
    const originalPost = myPosts.find(p => 
      reply.tags.some(tag => tag[0] === 'e' && tag[1] === p.id)
    )
    
    if (!originalPost) {
      log(`⚠️  Could not find original post for reply ${reply.id}`)
      continue
    }
    
    try {
      const responseContent = await generateReply(originalPost.content, reply)
      
      log(`🤖 Generated response: "${responseContent}"`)
      
      const replyEventId = await postReply(
        secretKey,
        responseContent,
        reply.id,
        reply.pubkey
      )
      
      log(`✅ Successfully replied! Event ID: ${replyEventId}`)
      
      state.repliedTo.push(reply.id)
      responded++
      
      // Rate limit: wait 30 seconds between replies
      if (responded < newReplies.length) {
        log('⏸️  Waiting 30s before next reply...')
        await new Promise(resolve => setTimeout(resolve, 30000))
      }
      
    } catch (err) {
      log(`❌ Failed to respond to ${reply.id}: ${err.message}`)
    }
  }
  
  // Update state
  state.lastCheck = Math.floor(Date.now() / 1000)
  saveReplyState(state)
  
  log(`\n✅ Reply monitoring complete. Responded to ${responded}/${newReplies.length} quality replies.`)
  
  pool.close(RELAYS)
}

// Run
monitorReplies().catch(err => {
  log(`❌ Fatal error: ${err.message}`)
  process.exit(1)
})
