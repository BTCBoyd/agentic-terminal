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
 *   node hootsuite-post.mjs --post-linkedin "LinkedIn post text"
 *   node hootsuite-post.mjs --post-facebook "Facebook post text"
 *   node hootsuite-post.mjs --post-both "Post to both platforms"
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuration
const HOOTSUITE_BASE_URL = 'https://platform.hootsuite.com';
const CREDENTIALS_PATH = join(__dirname, 'hootsuite-credentials.json');

// Profile ID constants
const PROFILES = {
  facebook_arcadiab: '140277707',
  facebook_kapitalex: '140264094',
  linkedin_arcadiab: '140303673',
  instagram_arcadiabtc: '140264079',
  twitter_arcadiab: '140262249',
  youtube_arcadiab: '140264047'
};

// Character limits
const CHAR_LIMITS = {
  linkedin: 3000,
  facebook: 63206  // Practical limit ~500 for engagement
};

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
 * Save credentials to JSON file
 */
function saveCredentials(credentials) {
  try {
    writeFileSync(CREDENTIALS_PATH, JSON.stringify(credentials, null, 2), 'utf-8');
  } catch (err) {
    console.error('❌ Failed to save credentials file:', err.message);
    process.exit(1);
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

  console.log('🔄 Refreshing access token...\n');

  try {
    const response = await fetch(`${HOOTSUITE_BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: credentials.refreshToken,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${data.error_description || data.error}`);
    }

    // Calculate expiration time (now + 3600 seconds)
    const expiresAt = new Date(Date.now() + (data.expires_in * 1000)).toISOString();

    // Update credentials
    credentials.accessToken = data.access_token;
    credentials.tokenExpiresAt = expiresAt;
    credentials.savedAt = new Date().toISOString();
    
    if (data.refresh_token) {
      credentials.refreshToken = data.refresh_token;
    }

    // Save updated credentials
    saveCredentials(credentials);

    console.log(`✅ Token refreshed, expires at ${expiresAt}`);
    
    return data.access_token;
  } catch (err) {
    console.error('❌ Token refresh failed:', err.message);
    console.error('\nYou may need to re-authenticate via the Hootsuite Developer Portal.');
    process.exit(1);
  }
}

/**
 * Get a valid access token, refreshing if necessary
 */
async function getValidToken() {
  const credentials = loadCredentials();
  
  // Check if token exists and is valid for at least 5 more minutes
  if (credentials.tokenExpiresAt) {
    const expiresAt = new Date(credentials.tokenExpiresAt);
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    
    if (expiresAt > fiveMinutesFromNow) {
      return credentials.accessToken;
    }
    console.log('⏰ Token expires soon, refreshing...');
  } else {
    console.log('⏰ No expiration set, refreshing token...');
  }
  
  // Token is expired or missing expiration, refresh it
  return await refreshAccessToken();
}

/**
 * Make authenticated API request to Hootsuite
 */
async function apiRequest(endpoint, options = {}) {
  const accessToken = await getValidToken();
  const url = `${HOOTSUITE_BASE_URL}${endpoint}`;
  
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
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
 * Validate post length for platform
 */
function validatePostLength(text, platform) {
  const limit = CHAR_LIMITS[platform];
  if (!limit) return true;
  
  if (text.length > limit) {
    console.warn(`⚠️  Warning: ${platform} post exceeds ${limit} characters (${text.length} chars)`);
    return false;
  }
  return true;
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
async function scheduleMessage(text, profileIds, scheduledTime = null, dryRun = false) {
  // Validate post lengths
  for (const profileId of profileIds) {
    if (profileId === PROFILES.linkedin_arcadiab) {
      validatePostLength(text, 'linkedin');
    } else if (profileId === PROFILES.facebook_arcadiab) {
      validatePostLength(text, 'facebook');
    }
  }

  if (dryRun) {
    console.log('🔍 DRY RUN - Would post:\n');
    console.log(`📝 Message: ${text}`);
    console.log(`📱 Target profiles: ${profileIds.join(', ')}`);
    if (scheduledTime) {
      console.log(`📅 Scheduled for: ${scheduledTime}`);
    } else {
      console.log('🚀 Immediate post');
    }
    return;
  }

  console.log('📝 Scheduling message...\n');
  
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
  --refresh-token              Refresh the OAuth access token manually
  --post "text"               Post a message
  --post-linkedin "text"      Post to LinkedIn ArcadiaB (profile: ${PROFILES.linkedin_arcadiab})
  --post-facebook "text"      Post to Facebook ArcadiaB (profile: ${PROFILES.facebook_arcadiab})
  --post-both "text"          Post to both LinkedIn and Facebook
  --delete <messageId>         Delete a scheduled message
  --help                       Show this help

Options:
  --profiles "id1,id2"         Comma-separated list of social profile IDs
  --schedule "ISO-8601"        Schedule time in UTC (e.g., 2026-03-15T14:00:00Z)
  --state "STATE"              Filter messages by state (SCHEDULED, SENT, etc.)
  --dry-run                    Print what would be posted without actually posting

Examples:
  # List all connected social profiles
  node hootsuite-post.mjs --list-profiles

  # Post immediately to Facebook and LinkedIn
  node hootsuite-post.mjs --post "Hello from automation!" --profiles "123456,789012"

  # Schedule a post for March 15, 2026 at 2pm UTC
  node hootsuite-post.mjs --post "Scheduled post" --profiles "123456" --schedule "2026-03-15T14:00:00Z"

  # Quick post to LinkedIn
  node hootsuite-post.mjs --post-linkedin "Exciting news from ArcadiaB!"

  # Quick post to Facebook
  node hootsuite-post.mjs --post-facebook "Check out our latest update!"

  # Post to both platforms
  node hootsuite-post.mjs --post-both "Big announcement!" --schedule "2026-03-15T14:00:00Z"

  # Dry run - preview without posting
  node hootsuite-post.mjs --post-both "Test post" --dry-run

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
      case '--post-linkedin':
        options.command = 'post-linkedin';
        options.text = args[++i];
        break;
      case '--post-facebook':
        options.command = 'post-facebook';
        options.text = args[++i];
        break;
      case '--post-both':
        options.command = 'post-both';
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
      case '--dry-run':
        options.dryRun = true;
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
      await scheduleMessage(options.text, options.profiles, options.schedule, options.dryRun);
      break;
      
    case 'post-linkedin':
      if (!options.text) {
        console.error('❌ Missing --post-linkedin text');
        process.exit(1);
      }
      await scheduleMessage(options.text, [PROFILES.linkedin_arcadiab], options.schedule, options.dryRun);
      break;
      
    case 'post-facebook':
      if (!options.text) {
        console.error('❌ Missing --post-facebook text');
        process.exit(1);
      }
      await scheduleMessage(options.text, [PROFILES.facebook_arcadiab], options.schedule, options.dryRun);
      break;
      
    case 'post-both':
      if (!options.text) {
        console.error('❌ Missing --post-both text');
        process.exit(1);
      }
      await scheduleMessage(
        options.text, 
        [PROFILES.linkedin_arcadiab, PROFILES.facebook_arcadiab], 
        options.schedule, 
        options.dryRun
      );
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
