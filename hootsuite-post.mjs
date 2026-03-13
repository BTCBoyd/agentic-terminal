#!/usr/bin/env node
/**
 * Hootsuite Post Automation Script
 * 
 * This script automates posting to Facebook and LinkedIn via Hootsuite API.
 * 
 * Usage:
 *   node hootsuite-post.mjs --list-profiles
 *   node hootsuite-post.mjs --post "Hello World" --profiles "profileId1,profileId2"
 *   node hootsuite-post.mjs --post "Hello World" --profiles "profileId1" --schedule "2026-03-15T14:00:00Z"
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuration
const HOOTSUITE_BASE_URL = 'https://platform.hootsuite.com';
const CREDENTIALS_PATH = join(__dirname, 'hootsuite-credentials.json');

// Error codes reference
const ERROR_CODES = {
  1000: 'Missing or duplicate access token',
  1001: 'Invalid access token',
  1002: 'Invalid API key',
  1003: 'Account plan limit exceeded',
  1004: 'API plan limit exceeded',
  1005: 'Token could not be retrieved',
  1007: 'Invalid client credentials',
  1036: 'OAuth token invalid or expired',
  2306: 'Missing social profile ID',
  4000: 'Schema validation failed',
  4001: 'Resource not found',
  40003: 'Message cannot be deleted in current state',
  40021: 'Uploaded media not ready',
  40024: 'Posting to Facebook Groups no longer supported',
  40025: 'Scheduled message limit reached',
  429: 'Rate limit exceeded'
};

/**
 * Load credentials from JSON file
 */
function loadCredentials() {
  if (!existsSync(CREDENTIALS_PATH)) {
    console.error(`❌ Credentials file not found: ${CREDENTIALS_PATH}`);
    console.error('Please create hootsuite-credentials.json from the template.');
    process.exit(1);
  }

  try {
    const raw = readFileSync(CREDENTIALS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('❌ Failed to parse credentials file:', err.message);
    process.exit(1);
  }
}

/**
 * Make authenticated API request to Hootsuite
 */
async function apiRequest(endpoint, options = {}) {
  const credentials = loadCredentials();
  const url = `${HOOTSUITE_BASE_URL}${endpoint}`;
  
  const headers = {
    'Authorization': `Bearer ${credentials.accessToken}`,
    'Content-Type': 'application/json;charset=utf-8',
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorCode = data?.errors?.[0]?.code;
      const errorMessage = data?.errors?.[0]?.message || response.statusText;
      const errorId = data?.errors?.[0]?.id;
      
      throw new Error(
        `API Error (${response.status}): ${errorMessage}` +
        (errorCode ? ` (Code: ${errorCode})` : '') +
        (errorId ? ` [Trace ID: ${errorId}]` : '')
      );
    }

    return data;
  } catch (err) {
    if (err.message.includes('401') || err.message.includes('1001') || err.message.includes('1036')) {
      console.error('\n⚠️  Authentication failed. Your access token may have expired.');
      console.error('Run: node hootsuite-post.mjs --refresh-token');
    }
    throw err;
  }
}

/**
 * Refresh OAuth token using refresh token
 */
async function refreshAccessToken() {
  const credentials = loadCredentials();
  
  if (!credentials.refreshToken) {
    console.error('❌ No refresh token available. Please re-authenticate.');
    process.exit(1);
  }

  const authString = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64');
  
  try {
    const response = await fetch(`${HOOTSUITE_BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: credentials.refreshToken
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${data.error_description || data.error}`);
    }

    console.log('✅ Token refresh successful!');
    console.log('New access token:', data.access_token.substring(0, 20) + '...');
    console.log('Expires in:', data.expires_in, 'seconds');
    
    if (data.refresh_token) {
      console.log('New refresh token received (update your credentials file)');
    }
    
    return data;
  } catch (err) {
    console.error('❌ Token refresh failed:', err.message);
    console.error('\nYou may need to re-authenticate via the Hootsuite Developer Portal.');
    process.exit(1);
  }
}

/**
 * List available social profiles
 */
async function listSocialProfiles() {
  console.log('📱 Fetching social profiles...\n');
  
  try {
    const data = await apiRequest('/v1/me/socialProfiles');
    
    if (!data.data || data.data.length === 0) {
      console.log('No social profiles found.');
      console.log('Make sure your Hootsuite account has connected social networks.');
      return;
    }

    console.log('Available Social Profiles:');
    console.log('=' .repeat(80));
    
    for (const profile of data.data) {
      console.log(`\n📌 ${profile.type} - ${profile.socialNetworkUsername}`);
      console.log(`   ID: ${profile.id}`);
      console.log(`   Network ID: ${profile.socialNetworkId}`);
      console.log(`   Owner: ${profile.owner} (${profile.ownerId})`);
      
      if (profile.isReauthRequired) {
        console.log(`   ⚠️  REAUTHENTICATION REQUIRED - Token expired/disconnected`);
      }
      
      if (profile.avatarUrl) {
        console.log(`   Avatar: ${profile.avatarUrl}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`\nTotal profiles: ${data.data.length}`);
    
    // Check for disconnected profiles
    const disconnected = data.data.filter(p => p.isReauthRequired);
    if (disconnected.length > 0) {
      console.log(`\n⚠️  WARNING: ${disconnected.length} profile(s) need reauthentication:`);
      for (const p of disconnected) {
        console.log(`   - ${p.type}: ${p.socialNetworkUsername}`);
      }
      console.log('\nTo fix: Log into Hootsuite dashboard and reconnect these accounts.');
    }
    
  } catch (err) {
    console.error('❌ Failed to list profiles:', err.message);
    process.exit(1);
  }
}

/**
 * Schedule or publish a message
 */
async function scheduleMessage(text, profileIds, scheduledTime = null) {
  console.log('📝 Scheduling message...\n');
  
  const credentials = loadCredentials();
  
  // Validate profile IDs
  if (!profileIds || profileIds.length === 0) {
    console.error('❌ No social profile IDs provided.');
    console.error('Use --list-profiles to see available IDs.');
    process.exit(1);
  }

  // Build request body
  const body = {
    text: text,
    socialProfileIds: profileIds
  };

  // Schedule time or send now
  if (scheduledTime) {
    // Validate ISO-8601 format with Z suffix
    if (!scheduledTime.endsWith('Z')) {
      console.error('❌ Scheduled time must be in UTC format ending with Z');
      console.error('Example: 2026-03-15T14:00:00Z');
      process.exit(1);
    }
    body.scheduledSendTime = scheduledTime;
    console.log(`📅 Scheduled for: ${scheduledTime}`);
  } else {
    console.log('🚀 Publishing immediately (Send Now)');
  }

  console.log(`📱 Target profiles: ${profileIds.join(', ')}`);
  console.log(`📝 Message: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}\n`);

  try {
    const data = await apiRequest('/v1/messages', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    console.log('✅ Message scheduled successfully!');
    console.log('\nResponse:');
    console.log('='.repeat(80));
    
    if (data.data && Array.isArray(data.data)) {
      for (const msg of data.data) {
        console.log(`\nMessage ID: ${msg.id}`);
        console.log(`State: ${msg.state}`);
        console.log(`Social Profile: ${msg.socialProfile?.type} - ${msg.socialProfile?.socialNetworkUsername}`);
        if (msg.scheduledSendTime) {
          console.log(`Scheduled: ${msg.scheduledSendTime}`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(80));
    
    return data;
  } catch (err) {
    console.error('❌ Failed to schedule message:', err.message);
    
    // Provide helpful guidance for common errors
    if (err.message.includes('40024')) {
      console.error('\n💡 Note: Facebook Groups posting is no longer supported via API.');
    } else if (err.message.includes('40025')) {
      console.error('\n💡 You have reached your scheduled message limit.');
    } else if (err.message.includes('2306')) {
      console.error('\n💡 Check that your social profile IDs are correct.');
    }
    
    process.exit(1);
  }
}

/**
 * Retrieve outbound messages
 */
async function listMessages(startTime, endTime, state = null) {
  console.log('📨 Fetching messages...\n');
  
  // Default to last 7 days if no times provided
  if (!startTime) {
    const end = new Date();
    const start = new Date(end - 7 * 24 * 60 * 60 * 1000);
    startTime = start.toISOString();
    endTime = end.toISOString();
  }
  
  let url = `/v1/messages?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;
  if (state) {
    url += `&state=${state}`;
  }
  
  try {
    const data = await apiRequest(url);
    
    if (!data.data || data.data.length === 0) {
      console.log('No messages found for the specified time range.');
      return;
    }

    console.log(`Found ${data.data.length} message(s):\n`);
    console.log('='.repeat(80));
    
    for (const msg of data.data) {
      console.log(`\n📝 ${msg.id}`);
      console.log(`   State: ${msg.state}`);
      console.log(`   Profile: ${msg.socialProfile?.type} - ${msg.socialProfile?.socialNetworkUsername}`);
      console.log(`   Text: ${msg.text?.substring(0, 80)}${msg.text?.length > 80 ? '...' : ''}`);
      if (msg.scheduledSendTime) {
        console.log(`   Scheduled: ${msg.scheduledSendTime}`);
      }
      if (msg.postUrl) {
        console.log(`   Post URL: ${msg.postUrl}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    
  } catch (err) {
    console.error('❌ Failed to list messages:', err.message);
    process.exit(1);
  }
}

/**
 * Delete a message
 */
async function deleteMessage(messageId) {
  console.log(`🗑️  Deleting message ${messageId}...\n`);
  
  try {
    await apiRequest(`/v1/messages/${messageId}`, {
      method: 'DELETE'
    });
    
    console.log('✅ Message deleted successfully!');
  } catch (err) {
    console.error('❌ Failed to delete message:', err.message);
    process.exit(1);
  }
}

/**
 * Show usage help
 */
function showHelp() {
  console.log(`
Hootsuite Post Automation Script
================================

Usage:
  node hootsuite-post.mjs [command] [options]

Commands:
  --list-profiles              List all available social profiles
  --list-messages              List scheduled/sent messages (last 7 days)
  --refresh-token              Refresh the OAuth access token
  --post "text"               Post a message
  --delete <messageId>         Delete a scheduled message
  --help                       Show this help

Options:
  --profiles "id1,id2"         Comma-separated list of social profile IDs
  --schedule "ISO-8601"        Schedule time in UTC (e.g., 2026-03-15T14:00:00Z)
  --state "STATE"              Filter messages by state (SCHEDULED, SENT, etc.)

Examples:
  # List all connected social profiles
  node hootsuite-post.mjs --list-profiles

  # Post immediately to Facebook and LinkedIn
  node hootsuite-post.mjs --post "Hello from automation!" --profiles "123456,789012"

  # Schedule a post for March 15, 2026 at 2pm UTC
  node hootsuite-post.mjs --post "Scheduled post" --profiles "123456" --schedule "2026-03-15T14:00:00Z"

  # List scheduled messages
  node hootsuite-post.mjs --list-messages --state SCHEDULED

  # Delete a message
  node hootsuite-post.mjs --delete 123456789
`);
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--list-profiles':
        options.command = 'list-profiles';
        break;
      case '--list-messages':
        options.command = 'list-messages';
        break;
      case '--refresh-token':
        options.command = 'refresh-token';
        break;
      case '--post':
        options.command = 'post';
        options.text = args[++i];
        break;
      case '--delete':
        options.command = 'delete';
        options.messageId = args[++i];
        break;
      case '--profiles':
        options.profiles = args[++i]?.split(',').map(p => p.trim());
        break;
      case '--schedule':
        options.schedule = args[++i];
        break;
      case '--state':
        options.state = args[++i];
        break;
      case '--help':
      case '-h':
        options.command = 'help';
        break;
    }
  }
  
  return options;
}

/**
 * Main entry point
 */
async function main() {
  const options = parseArgs();
  
  switch (options.command) {
    case 'list-profiles':
      await listSocialProfiles();
      break;
      
    case 'list-messages':
      await listMessages(null, null, options.state);
      break;
      
    case 'refresh-token':
      await refreshAccessToken();
      break;
      
    case 'post':
      if (!options.text) {
        console.error('❌ Missing --post text');
        process.exit(1);
      }
      await scheduleMessage(options.text, options.profiles, options.schedule);
      break;
      
    case 'delete':
      if (!options.messageId) {
        console.error('❌ Missing --delete messageId');
        process.exit(1);
      }
      await deleteMessage(options.messageId);
      break;
      
    case 'help':
    default:
      showHelp();
      break;
  }
}

// Run main
main().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
