#!/usr/bin/env node
/**
 * Primal Reply Monitor - Browser Automation
 * 
 * Uses Chromium to scrape Primal web interface for replies
 * Reliable because it works exactly like a human viewing the page
 */

import { chromium } from 'playwright'
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs'
import { resolve } from 'path'
import { execSync } from 'child_process'

const MY_NPUB = 'npub187rmuw7uvs64les3qu0pkudlqcm3r8qzr3eu2657w2ktvw430xlq24lcna'
const PRIMAL_PROFILE = `https://primal.net/p/${MY_NPUB}`

const REPLY_STATE_FILE = resolve(process.env.HOME, '.openclaw/workspace/nostr-reply-state.json')
const LOG_FILE = resolve(process.env.HOME, '.openclaw/workspace/nostr-automation.log')
const SECRET_KEY_FILE = resolve(process.env.HOME, '.clawstr/secret.key')
const POST_SCRIPT = resolve(process.env.HOME, '.openclaw/workspace/post-to-nostr.mjs')

function log(message) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [PRIMAL-MONITOR] ${message}\n`
  console.log(message)
  try {
    appendFileSync(LOG_FILE, logMessage)
  } catch (err) {}
}

function loadReplyState() {
  if (!existsSync(REPLY_STATE_FILE)) {
    return { repliedTo: [], lastCheck: 0 }
  }
  try {
    return JSON.parse(readFileSync(REPLY_STATE_FILE, 'utf8'))
  } catch (err) {
    return { repliedTo: [], lastCheck: 0 }
  }
}

function saveReplyState(state) {
  try {
    writeFileSync(REPLY_STATE_FILE, JSON.stringify(state, null, 2))
  } catch (err) {
    log(`❌ Failed to save state: ${err.message}`)
  }
}

function loadSecretKey() {
  try {
    return readFileSync(SECRET_KEY_FILE, 'utf8').trim()
  } catch (err) {
    log(`❌ No secret key: ${err.message}`)
    process.exit(1)
  }
}

function isQualityReply(content) {
  const text = content.toLowerCase()
  const wordCount = text.split(/\s+/).length
  
  // Filter low-effort
  const lowEffort = /^(gm|gn|hi|hey|thanks|nice|cool|great|lol|ok|yes|no|agreed|this|same)[\s!.]*$/i
  if (lowEffort.test(text) || wordCount < 5) return false
  
  // Quality indicators
  const hasQuestion = /\?/.test(text)
  const substantial = wordCount >= 10
  const onTopic = /bitcoin|btc|sat|lightning|ai|agent|economy|money|inflation/i.test(text)
  
  return hasQuestion || (substantial && onTopic)
}

function generateReply(originalContent, replyContent) {
  const text = replyContent.toLowerCase()
  
  if (text.includes('?')) {
    if (text.includes('why') || text.includes('how')) {
      return "Great question! The core logic is: AI agents need money that works without human intermediaries. Bitcoin is permissionless — no bank account, no KYC, just cryptographic keys. That's not ideology, it's engineering necessity."
    }
    return "Interesting question! The short answer: Bitcoin solves trust through math, not institutions. For AI agents, that's the only money that actually works."
  }
  
  if (text.includes('exactly') || text.includes('agree')) {
    return "Exactly. And the convergence accelerates as more AI agents realize they can't get bank accounts but can hold Bitcoin keys. Game theory plays out in predictable ways."
  }
  
  if (text.includes('bitcoin') || text.includes('btc')) {
    return "That's the key insight. Bitcoin isn't just 'digital money' — it's the only money AI agents can actually use autonomously. Permissionless, programmable, provably scarce."
  }
  
  if (text.includes('ai') || text.includes('agent')) {
    return "This is where it gets interesting. AI agents will naturally converge on Bitcoin because every alternative requires human intermediaries. It's just engineering logic."
  }
  
  return "This is exactly why the convergence matters. Bitcoin + AI isn't hype — it's two technologies solving the same fundamental problem: trust without intermediaries."
}

async function postReply(eventId, authorPubkey, content) {
  const secretKey = loadSecretKey()
  
  try {
    log(`📤 Posting reply via post-to-nostr.mjs...`)
    
    const command = `node ${POST_SCRIPT} --key ${secretKey} --reply-to ${eventId} --mention ${authorPubkey} "${content.replace(/"/g, '\\"')}"`
    
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    })
    
    const eventIdMatch = result.match(/Event ID: ([a-f0-9]{64})/)
    if (eventIdMatch) {
      log(`✅ Reply posted: ${eventIdMatch[1]}`)
      return eventIdMatch[1]
    } else {
      log(`⚠️  Reply may have posted but no event ID found`)
      return null
    }
  } catch (err) {
    log(`❌ Failed to post: ${err.message}`)
    throw err
  }
}

async function monitorReplies() {
  log('🔍 Starting Primal browser monitoring...')
  
  const state = loadReplyState()
  const browser = await chromium.launch({ headless: true })
  
  try {
    const page = await browser.newPage()
    
    log(`📱 Loading ${PRIMAL_PROFILE}`)
    await page.goto(PRIMAL_PROFILE, { waitUntil: 'networkidle', timeout: 30000 })
    
    // Wait for notes to load
    await page.waitForTimeout(3000)
    
    // Find all note elements
    const notes = await page.locator('article, [data-note], .note').all()
    log(`📊 Found ${notes.length} note elements on page`)
    
    if (notes.length === 0) {
      log('⚠️  No notes found on page')
      await browser.close()
      return
    }
    
    let repliesFound = 0
    let qualityReplies = 0
    
    // Check each note for replies
    for (const note of notes.slice(0, 10)) { // Check last 10 notes
      try {
        // Look for reply count indicator
        const replyButton = note.locator('button:has-text("1"), button:has-text("2"), button:has-text("3")').first()
        
        if (await replyButton.isVisible({ timeout: 100 })) {
          repliesFound++
          
          // Click to expand replies
          await replyButton.click()
          await page.waitForTimeout(2000)
          
          // Extract reply content
          const replyElements = await page.locator('[data-reply], .reply-content').all()
          
          for (const replyEl of replyElements) {
            const content = await replyEl.textContent()
            
            if (content && content.length > 10) {
              log(`\n📨 Found reply: "${content.substring(0, 80)}..."`)
              
              if (isQualityReply(content)) {
                qualityReplies++
                log(`   ✅ Quality reply detected`)
                
                // Generate and post response
                const responseContent = generateReply('', content)
                log(`   🤖 Response: "${responseContent}"`)
                
                // Note: would need event IDs from page for proper threading
                // For now, log what we found
              } else {
                log(`   ❌ Filtered (low effort)`)
              }
            }
          }
        }
      } catch (err) {
        // Skip notes that don't have reply structure
        continue
      }
    }
    
    log(`\n✅ Monitoring complete`)
    log(`   Total replies found: ${repliesFound}`)
    log(`   Quality replies: ${qualityReplies}`)
    
    state.lastCheck = Math.floor(Date.now() / 1000)
    saveReplyState(state)
    
  } catch (err) {
    log(`❌ Browser error: ${err.message}`)
  } finally {
    await browser.close()
  }
}

monitorReplies().catch(err => {
  log(`❌ Fatal error: ${err.message}`)
  process.exit(1)
})
