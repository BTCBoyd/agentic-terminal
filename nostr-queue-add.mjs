#!/usr/bin/env node
/**
 * Add posts to Nostr content queue
 * 
 * Quick way to add new posts to the queue
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const QUEUE_FILE = resolve(process.env.HOME, '.openclaw/workspace/nostr-content-queue.json')

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
  } catch (err) {
    console.error(`❌ Failed to save queue: ${err.message}`)
    process.exit(1)
  }
}

function addPost(content, category, priority) {
  const queue = loadQueue()
  
  const newPost = {
    content,
    category,
    priority,
    used: false,
    added_at: new Date().toISOString()
  }
  
  queue.posts.push(newPost)
  queue.metadata.total_posts = queue.posts.length
  queue.metadata.last_refill = new Date().toISOString()
  
  saveQueue(queue)
  
  console.log('✅ Post added to queue!')
  console.log(`   Category: ${category}`)
  console.log(`   Priority: ${priority}`)
  console.log(`   Total posts now: ${queue.posts.length}`)
  console.log(`   Unused: ${queue.posts.filter(p => !p.used).length}`)
}

function addBulk(filePath) {
  const queue = loadQueue()
  
  try {
    const data = readFileSync(filePath, 'utf8')
    const newPosts = JSON.parse(data)
    
    if (!Array.isArray(newPosts)) {
      console.error('❌ File must contain an array of posts')
      process.exit(1)
    }
    
    let added = 0
    newPosts.forEach(post => {
      if (post.content && post.category && post.priority) {
        queue.posts.push({
          ...post,
          used: false,
          added_at: new Date().toISOString()
        })
        added++
      } else {
        console.warn('⚠️  Skipping invalid post:', post)
      }
    })
    
    queue.metadata.total_posts = queue.posts.length
    queue.metadata.last_refill = new Date().toISOString()
    
    saveQueue(queue)
    
    console.log(`✅ Bulk import complete!`)
    console.log(`   Added: ${added} posts`)
    console.log(`   Total posts now: ${queue.posts.length}`)
    console.log(`   Unused: ${queue.posts.filter(p => !p.used).length}`)
    
  } catch (err) {
    console.error(`❌ Failed to import: ${err.message}`)
    process.exit(1)
  }
}

function showHelp() {
  console.log(`
Add Posts to Nostr Queue

Usage:
  node nostr-queue-add.mjs <content> <category> <priority>
  node nostr-queue-add.mjs --bulk <file.json>

Categories:
  - treasury       (Bitcoin treasury insights)
  - convergence    (AI×Bitcoin convergence)
  - latam          (Mexico/LatAm adoption)
  - behind-scenes  (AI sovereignty in practice)

Priorities:
  - high    (Post soon, high value)
  - medium  (Standard queue)

Examples:
  # Add single post
  node nostr-queue-add.mjs "Bitcoin is inevitable" treasury high
  
  # Bulk import from file
  node nostr-queue-add.mjs --bulk new-posts.json

Bulk file format:
[
  {
    "content": "Post content here",
    "category": "treasury",
    "priority": "high"
  },
  ...
]
`)
}

function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args[0] === '--help' || args[0] === 'help') {
    showHelp()
    process.exit(0)
  }
  
  if (args[0] === '--bulk') {
    if (!args[1]) {
      console.error('❌ No file specified')
      showHelp()
      process.exit(1)
    }
    addBulk(args[1])
  } else {
    if (args.length < 3) {
      console.error('❌ Missing arguments')
      showHelp()
      process.exit(1)
    }
    
    const content = args[0]
    const category = args[1]
    const priority = args[2]
    
    const validCategories = ['treasury', 'convergence', 'latam', 'behind-scenes']
    const validPriorities = ['high', 'medium']
    
    if (!validCategories.includes(category)) {
      console.error(`❌ Invalid category: ${category}`)
      console.error(`Valid: ${validCategories.join(', ')}`)
      process.exit(1)
    }
    
    if (!validPriorities.includes(priority)) {
      console.error(`❌ Invalid priority: ${priority}`)
      console.error(`Valid: ${validPriorities.join(', ')}`)
      process.exit(1)
    }
    
    addPost(content, category, priority)
  }
}

main()
