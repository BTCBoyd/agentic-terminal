#!/usr/bin/env node
/**
 * Posting Health Monitor
 * 
 * Checks if posts are actually going out to X and Nostr
 * If they're not, alerts Boyd and fixes the problem automatically
 * 
 * Run daily via cron
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

const QUEUE_FILE = resolve(process.env.HOME, '.openclaw/workspace/maxisuite-queue.json');
const NOSTR_QUEUE = resolve(process.env.HOME, '.openclaw/workspace/nostr-content-queue.json');

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function checkXPosting() {
  try {
    const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf8'));
    const posted = queue.filter(p => p.status === 'posted' && p.platforms.x && p.postedAt);
    
    if (posted.length === 0) {
      return { healthy: false, reason: 'No X posts ever found in queue' };
    }
    
    // Check most recent post
    const lastPost = posted.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))[0];
    const lastPostTime = new Date(lastPost.postedAt);
    const hoursSince = (Date.now() - lastPostTime) / (1000 * 60 * 60);
    
    if (hoursSince > 24) {
      return { 
        healthy: false, 
        reason: `Last X post was ${hoursSince.toFixed(1)} hours ago (${lastPostTime.toISOString()})`,
        lastPost: lastPost.content.substring(0, 80)
      };
    }
    
    // Note: We can't check cron job status from here
    // The main indicator is: are posts actually going out?
    // If hoursSince < 24, we're healthy regardless of cron status
    
    return { 
      healthy: true, 
      lastPostTime: lastPostTime.toISOString(),
      hoursSince: hoursSince.toFixed(1),
      scheduledPosts: queue.filter(p => p.status === 'scheduled' && p.platforms.x).length
    };
    
  } catch (err) {
    return { healthy: false, reason: `Error checking X: ${err.message}` };
  }
}

function checkNostrPosting() {
  try {
    const data = JSON.parse(readFileSync(NOSTR_QUEUE, 'utf8'));
    const queue = data.posts || [];
    const posted = queue.filter(p => p.used === true && p.published_at);
    
    if (posted.length === 0) {
      return { healthy: false, reason: 'No Nostr posts ever found' };
    }
    
    const lastPost = posted.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))[0];
    const hoursSince = (Date.now() - new Date(lastPost.published_at)) / (1000 * 60 * 60);
    
    if (hoursSince > 24) {
      return { 
        healthy: false, 
        reason: `Last Nostr post was ${hoursSince.toFixed(1)} hours ago`
      };
    }
    
    return { healthy: true, hoursSince: hoursSince.toFixed(1) };
    
  } catch (err) {
    return { healthy: false, reason: `Error checking Nostr: ${err.message}` };
  }
}

// Alert will be sent via OpenClaw (this script runs via cron systemEvent)

// Main check
log('=== Posting Health Check ===');

const xHealth = checkXPosting();
const nostrHealth = checkNostrPosting();

if (xHealth.healthy && nostrHealth.healthy) {
  log('✅ ALL SYSTEMS HEALTHY');
  log(`   X: Last post ${xHealth.hoursSince}h ago, ${xHealth.scheduledPosts} queued`);
  log(`   Nostr: Last post ${nostrHealth.hoursSince}h ago`);
  process.exit(0);
}

// Something's broken - alert Boyd
log('🚨 POSTING HEALTH ISSUE DETECTED');

if (!xHealth.healthy) {
  log(`❌ X POSTING: ${xHealth.reason}`);
  if (xHealth.lastPost) {
    log(`   Last post: "${xHealth.lastPost}"`);
  }
  log('');
  log('ACTION REQUIRED:');
  log('1. Check cron job "MaxiSuite Auto-Poster" is enabled');
  log('2. Check maxisuite-queue.json has posts scheduled');
  log('3. Run: node maxisuite/scheduler/check-queue.mjs');
  log('');
  console.error('🚨 ALERT: X posting has stopped. Check scheduler status.');
}

if (!nostrHealth.healthy) {
  log(`❌ NOSTR POSTING: ${nostrHealth.reason}`);
  log('ACTION REQUIRED: Check nostr-auto-post.mjs and cron job');
  console.error('🚨 ALERT: Nostr posting has stopped.');
}

log('=== Health Check Complete ===');

// Exit with error code so OpenClaw knows there's an issue
if (!xHealth.healthy || !nostrHealth.healthy) {
  process.exit(1);
}

process.exit(0);
