#!/usr/bin/env node
/**
 * Moltbook API Monitor
 * 
 * Properly handles Moltbook API with:
 * - Rate limit detection
 * - Proper error handling (distinguishes rate limits from empty platform)
 * - API-first approach (not browser scraping)
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load credentials
let credentials;
try {
  const credsPath = join(__dirname, '.moltbook-credentials');
  credentials = JSON.parse(readFileSync(credsPath, 'utf8'));
} catch (e) {
  console.error('Failed to load .moltbook-credentials:', e.message);
  process.exit(1);
}

const API_BASE = 'https://www.moltbook.com/api/v1';
const HEADERS = {
  'Authorization': `Bearer ${credentials.api_key}`,
  'Content-Type': 'application/json'
};

async function apiCall(endpoint) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, { headers: HEADERS });
    const data = await response.json();
    
    // Check for rate limit
    if (response.status === 429 || data.error === 'rate_limited') {
      return { 
        error: 'RATE_LIMITED', 
        message: data.message || 'Too many requests. Please slow down.',
        retryAfter: response.headers.get('retry-after') || 'unknown'
      };
    }
    
    // Check for auth errors
    if (response.status === 401 || data.error === 'unauthorized') {
      return { 
        error: 'UNAUTHORIZED', 
        message: data.message || 'Invalid API key' 
      };
    }
    
    return data;
  } catch (e) {
    return { 
      error: 'NETWORK_ERROR', 
      message: e.message 
    };
  }
}

async function checkStatus() {
  console.log('=== Moltbook API Status Check ===\n');
  
  // Check /me endpoint first
  console.log('1. Checking /me endpoint...');
  const me = await apiCall('/me');
  
  if (me.error) {
    console.log(`   ❌ ${me.error}: ${me.message}`);
    
    if (me.error === 'RATE_LIMITED') {
      console.log('\n⚠️  RATE LIMITED — Cannot proceed with session');
      console.log(`   Retry-After: ${me.retryAfter}`);
      console.log('\n📋 Recommendation: Wait 6+ hours before next session');
      
      // Save rate limit state
      const rateLimitInfo = {
        timestamp: new Date().toISOString(),
        error: 'RATE_LIMITED',
        message: me.message,
        nextAttempt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // 6 hours
      };
      
      console.log('\n📁 Rate limit state:');
      console.log(JSON.stringify(rateLimitInfo, null, 2));
      
      process.exit(2); // Exit code 2 = rate limited
    }
    
    if (me.error === 'UNAUTHORIZED') {
      console.log('\n❌ API key invalid — check .moltbook-credentials');
      process.exit(3);
    }
    
    process.exit(1);
  }
  
  console.log(`   ✅ Logged in as: ${me.name || me.agent_name || 'unknown'}`);
  console.log(`   📊 Karma: ${me.karma || 0}`);
  console.log(`   👥 Followers: ${me.followers?.length || 0}`);
  console.log(`   👤 Following: ${me.following?.length || 0}`);
  
  // Check feed
  console.log('\n2. Checking feed...');
  const feed = await apiCall('/feed');
  
  if (feed.error) {
    console.log(`   ❌ ${feed.error}: ${feed.message}`);
  } else {
    const posts = feed.posts || feed;
    console.log(`   ✅ Found ${posts.length} posts in feed`);
  }
  
  // Check submolts
  console.log('\n3. Checking submolts...');
  const submolts = await apiCall('/submolts');
  
  if (submolts.error) {
    console.log(`   ❌ ${submolts.error}: ${submolts.message}`);
  } else {
    console.log(`   ✅ Found ${submolts.length} submolts`);
    if (submolts.length > 0) {
      console.log(`   📚 Top submolts: ${submolts.slice(0, 5).map(s => s.name).join(', ')}`);
    }
  }
  
  // Check notifications
  console.log('\n4. Checking notifications...');
  const notifications = await apiCall('/notifications');
  
  if (notifications.error) {
    console.log(`   ❌ ${notifications.error}: ${notifications.message}`);
  } else {
    const unread = notifications.filter ? notifications.filter(n => !n.read).length : 0;
    console.log(`   ✅ ${notifications.length} total, ${unread} unread`);
  }
  
  console.log('\n=== Status: READY for session ===');
  process.exit(0);
}

checkStatus();
