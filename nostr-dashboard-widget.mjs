#!/usr/bin/env node
/**
 * Nostr Dashboard Widget
 * 
 * Quick stats for Command Center integration
 * Returns JSON for easy parsing
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

const QUEUE_FILE = resolve(process.env.HOME, '.openclaw/workspace/nostr-content-queue.json')
const LOG_FILE = resolve(process.env.HOME, '.openclaw/workspace/nostr-automation.log')

function loadQueue() {
  try {
    const data = readFileSync(QUEUE_FILE, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    return null
  }
}

function getRecentActivity() {
  try {
    const log = readFileSync(LOG_FILE, 'utf8')
    const lines = log.split('\n').filter(l => l.includes('WINDOW COMPLETE'))
    
    if (lines.length === 0) return 'No activity yet'
    
    const lastLine = lines[lines.length - 1]
    const match = lastLine.match(/\[(.*?)\]/)
    
    if (match) {
      const timestamp = new Date(match[1])
      const now = new Date()
      const diffHours = Math.floor((now - timestamp) / (1000 * 60 * 60))
      
      if (diffHours < 1) return 'Active (< 1h ago)'
      if (diffHours < 24) return `Active (${diffHours}h ago)`
      return `Last active ${Math.floor(diffHours / 24)}d ago`
    }
    
    return 'Unknown'
  } catch (err) {
    return 'No logs'
  }
}

function getStats() {
  const queue = loadQueue()
  
  if (!queue) {
    return {
      status: 'error',
      message: 'Queue file not found'
    }
  }
  
  const total = queue.posts.length
  const used = queue.posts.filter(p => p.used).length
  const unused = total - used
  const threshold = queue.metadata.alert_threshold
  
  let healthStatus = 'healthy'
  let alert = null
  
  if (unused === 0) {
    healthStatus = 'critical'
    alert = 'Queue empty!'
  } else if (unused < threshold) {
    healthStatus = 'warning'
    alert = `Only ${unused} posts remaining`
  } else if (unused < 10) {
    healthStatus = 'low'
    alert = 'Queue running low'
  }
  
  const recentActivity = getRecentActivity()
  
  return {
    status: 'ok',
    health: healthStatus,
    alert,
    stats: {
      total,
      used,
      unused,
      threshold
    },
    activity: recentActivity,
    dailyBurnRate: '3-5 posts/day',
    daysRemaining: Math.floor(unused / 4)
  }
}

function formatOutput(format = 'json') {
  const stats = getStats()
  
  if (format === 'json') {
    console.log(JSON.stringify(stats, null, 2))
  } else {
    // Human-readable
    const emoji = {
      'healthy': '✅',
      'low': '⚡',
      'warning': '⚠️',
      'critical': '🚨',
      'error': '❌'
    }
    
    console.log(`${emoji[stats.health] || '❓'} Nostr Automation: ${stats.activity}`)
    
    if (stats.status === 'ok') {
      console.log(`   Queue: ${stats.stats.unused}/${stats.stats.total} posts (~${stats.daysRemaining} days)`)
      if (stats.alert) {
        console.log(`   ${stats.alert}`)
      }
    } else {
      console.log(`   ${stats.message}`)
    }
  }
}

function main() {
  const args = process.argv.slice(2)
  const format = args[0] || 'human'
  formatOutput(format)
}

main()
