#!/usr/bin/env node
/**
 * Nostr Queue Status & Management Tool
 * 
 * Check queue status, reset used posts, view logs
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { execSync } from 'child_process'

const QUEUE_FILE = resolve(process.env.HOME, '.openclaw/workspace/nostr-content-queue.json')
const LOG_FILE = resolve(process.env.HOME, '.openclaw/workspace/nostr-automation.log')

function loadQueue() {
  try {
    const data = readFileSync(QUEUE_FILE, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    console.error(`❌ Failed to load queue: ${err.message}`)
    process.exit(1)
  }
}

function saveQueue(queue) {
  try {
    writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2))
    console.log('✅ Queue saved successfully')
  } catch (err) {
    console.error(`❌ Failed to save queue: ${err.message}`)
    process.exit(1)
  }
}

function showStatus() {
  const queue = loadQueue()
  const total = queue.posts.length
  const used = queue.posts.filter(p => p.used).length
  const unused = total - used
  
  console.log('\n📊 NOSTR QUEUE STATUS')
  console.log('━'.repeat(50))
  console.log(`Total posts: ${total}`)
  console.log(`Used: ${used}`)
  console.log(`Unused: ${unused}`)
  console.log(`Alert threshold: ${queue.metadata.alert_threshold}`)
  
  if (unused < queue.metadata.alert_threshold) {
    console.log(`\n⚠️  WARNING: Only ${unused} posts remaining!`)
    console.log('   Queue needs refill soon.')
  } else if (unused < 10) {
    console.log(`\n⚡ Low stock: ${unused} posts remaining`)
  } else {
    console.log(`\n✅ Queue healthy: ${unused} posts available`)
  }
  
  // Category breakdown
  const categories = {}
  queue.posts.filter(p => !p.used).forEach(p => {
    categories[p.category] = (categories[p.category] || 0) + 1
  })
  
  console.log('\nUnused posts by category:')
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`)
  })
  
  // Priority breakdown
  const priorities = {}
  queue.posts.filter(p => !p.used).forEach(p => {
    priorities[p.priority] = (priorities[p.priority] || 0) + 1
  })
  
  console.log('\nUnused posts by priority:')
  Object.entries(priorities).forEach(([pri, count]) => {
    console.log(`  ${pri}: ${count}`)
  })
  
  // Recent posts
  const recentPosts = queue.posts
    .filter(p => p.used && p.published_at)
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    .slice(0, 5)
  
  if (recentPosts.length > 0) {
    console.log('\n📝 Recent posts (last 5):')
    recentPosts.forEach(p => {
      const date = new Date(p.published_at).toLocaleString()
      console.log(`  ${date} - [${p.category}] ${p.content.substring(0, 50)}...`)
    })
  }
  
  console.log('\n')
}

function resetQueue() {
  const queue = loadQueue()
  
  console.log('⚠️  This will mark all posts as unused.')
  console.log('Are you sure? This cannot be undone.')
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...')
  
  // Simple wait
  execSync('sleep 5')
  
  queue.posts.forEach(p => {
    p.used = false
    delete p.published_at
    delete p.event_id
  })
  
  saveQueue(queue)
  console.log('✅ Queue reset complete')
}

function viewLogs(lines = 50) {
  try {
    const command = `tail -n ${lines} ${LOG_FILE}`
    const output = execSync(command, { encoding: 'utf8' })
    console.log(output)
  } catch (err) {
    console.error('❌ Failed to read logs:', err.message)
  }
}

function showHelp() {
  console.log(`
Nostr Queue Management Tool

Usage:
  node nostr-queue-status.mjs [command]

Commands:
  status          Show queue status (default)
  reset           Reset all posts to unused (careful!)
  logs [n]        Show last n lines of log (default: 50)
  help            Show this help

Examples:
  node nostr-queue-status.mjs
  node nostr-queue-status.mjs status
  node nostr-queue-status.mjs logs 100
  node nostr-queue-status.mjs reset
`)
}

function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'status'
  
  switch (command) {
    case 'status':
      showStatus()
      break
    case 'reset':
      resetQueue()
      break
    case 'logs':
      const lines = parseInt(args[1]) || 50
      viewLogs(lines)
      break
    case 'help':
      showHelp()
      break
    default:
      console.error(`Unknown command: ${command}`)
      showHelp()
      process.exit(1)
  }
}

main()
