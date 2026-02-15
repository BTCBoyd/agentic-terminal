#!/usr/bin/env node
/**
 * Nostr Automated Posting Script
 * 
 * Pulls posts from content queue and publishes them
 * Handles morning (2-3 posts) and evening (1-2 posts) windows
 */

import { readFileSync, writeFileSync, appendFileSync } from 'fs'
import { execSync } from 'child_process'
import { resolve } from 'path'

const QUEUE_FILE = resolve(process.env.HOME, '.openclaw/workspace/nostr-content-queue.json')
const SECRET_KEY_FILE = resolve(process.env.HOME, '.clawstr/secret.key')
const POST_SCRIPT = resolve(process.env.HOME, '.openclaw/workspace/post-to-nostr.mjs')
const LOG_FILE = resolve(process.env.HOME, '.openclaw/workspace/nostr-automation.log')

// Time windows
const MORNING_MIN = 2
const MORNING_MAX = 3
const MIDDAY_MIN = 1
const MIDDAY_MAX = 2
const EVENING_MIN = 1
const EVENING_MAX = 2

function log(message) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}\n`
  
  console.log(message)
  
  try {
    appendFileSync(LOG_FILE, logMessage)
  } catch (err) {
    // Fail silently if log write fails
  }
}

function loadQueue() {
  try {
    const data = readFileSync(QUEUE_FILE, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    log(`❌ Failed to load queue: ${err.message}`)
    process.exit(1)
  }
}

function saveQueue(queue) {
  try {
    writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2))
  } catch (err) {
    log(`❌ Failed to save queue: ${err.message}`)
    process.exit(1)
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

function getUnusedPosts(queue) {
  return queue.posts.filter(post => !post.used)
}

function selectPosts(unusedPosts, count) {
  // Prioritize high priority posts, then shuffle
  const high = unusedPosts.filter(p => p.priority === 'high')
  const medium = unusedPosts.filter(p => p.priority === 'medium')
  
  const selected = []
  
  // Take from high priority first
  while (selected.length < count && high.length > 0) {
    const randomIndex = Math.floor(Math.random() * high.length)
    selected.push(high.splice(randomIndex, 1)[0])
  }
  
  // Fill remaining from medium
  while (selected.length < count && medium.length > 0) {
    const randomIndex = Math.floor(Math.random() * medium.length)
    selected.push(medium.splice(randomIndex, 1)[0])
  }
  
  return selected
}

function postToNostr(secretKey, content) {
  try {
    const command = `node ${POST_SCRIPT} --key ${secretKey} "${content.replace(/"/g, '\\"')}"`
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    })
    
    // Extract event ID from output
    const lines = result.trim().split('\n')
    const eventId = lines[lines.length - 1]
    
    return { success: true, eventId }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const window = args[0] // 'morning', 'midday', or 'evening'
  
  if (!window || !['morning', 'midday', 'evening'].includes(window)) {
    console.error('Usage: node nostr-auto-post.mjs [morning|midday|evening]')
    process.exit(1)
  }
  
  log(`\n🚀 Starting ${window} posting window`)
  
  // Load queue and secret key
  const queue = loadQueue()
  const secretKey = loadSecretKey()
  
  // Check available posts
  const unusedPosts = getUnusedPosts(queue)
  log(`📊 Queue status: ${unusedPosts.length} unused posts available`)
  
  // Alert if low
  if (unusedPosts.length < queue.metadata.alert_threshold) {
    log(`⚠️  WARNING: Only ${unusedPosts.length} posts remaining! Queue needs refill.`)
  }
  
  // Determine post count for this window
  let minPosts, maxPosts
  if (window === 'morning') {
    minPosts = MORNING_MIN
    maxPosts = MORNING_MAX
  } else if (window === 'midday') {
    minPosts = MIDDAY_MIN
    maxPosts = MIDDAY_MAX
  } else { // evening
    minPosts = EVENING_MIN
    maxPosts = EVENING_MAX
  }
  const targetCount = Math.floor(Math.random() * (maxPosts - minPosts + 1)) + minPosts
  
  log(`🎯 Target: ${targetCount} posts for ${window} window`)
  
  if (unusedPosts.length < targetCount) {
    log(`⚠️  Not enough posts! Only ${unusedPosts.length} available, need ${targetCount}`)
    if (unusedPosts.length === 0) {
      log('❌ Queue empty! Cannot post.')
      process.exit(1)
    }
  }
  
  // Select posts
  const postsToPublish = selectPosts(unusedPosts, Math.min(targetCount, unusedPosts.length))
  
  log(`\n📝 Selected ${postsToPublish.length} posts:`)
  postsToPublish.forEach((post, i) => {
    log(`  ${i + 1}. [${post.category}/${post.priority}] ${post.content.substring(0, 60)}...`)
  })
  
  // Publish posts
  let successCount = 0
  let failCount = 0
  
  for (let i = 0; i < postsToPublish.length; i++) {
    const post = postsToPublish[i]
    
    log(`\n📡 Posting ${i + 1}/${postsToPublish.length}...`)
    const result = postToNostr(secretKey, post.content)
    
    if (result.success) {
      log(`✅ Published successfully! Event ID: ${result.eventId}`)
      
      // Mark as used in queue
      const postIndex = queue.posts.findIndex(p => p.content === post.content)
      if (postIndex !== -1) {
        queue.posts[postIndex].used = true
        queue.posts[postIndex].published_at = new Date().toISOString()
        queue.posts[postIndex].event_id = result.eventId
      }
      
      successCount++
    } else {
      log(`❌ Failed to publish: ${result.error}`)
      failCount++
    }
    
    // Wait between posts (random 30-90 seconds)
    if (i < postsToPublish.length - 1) {
      const waitTime = Math.floor(Math.random() * 60000) + 30000 // 30-90 seconds
      log(`⏳ Waiting ${Math.floor(waitTime / 1000)}s before next post...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  // Save updated queue
  saveQueue(queue)
  
  // Final summary
  log(`\n✨ ${window.toUpperCase()} WINDOW COMPLETE`)
  log(`   Success: ${successCount}`)
  log(`   Failed: ${failCount}`)
  log(`   Remaining in queue: ${getUnusedPosts(queue).length}`)
  
  if (getUnusedPosts(queue).length < queue.metadata.alert_threshold) {
    log(`\n⚠️  ALERT: Queue low! Refill needed.`)
  }
  
  process.exit(failCount > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
