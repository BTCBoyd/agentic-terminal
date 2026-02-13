#!/usr/bin/env node
/**
 * Autonomous X (Twitter) Reply Monitor
 * Checks for mentions/replies and responds automatically
 * No manual intervention needed
 */

import https from 'https';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Credentials
const CONSUMER_KEY = 'XBfsAHqeYQeRBOeGJZo9CKeBh';
const CONSUMER_SECRET = '7dE5HzNzdYoIwH2nCwRMPkAowu3fxqgBkG6uTMSZzesY4kUf6u';
const ACCESS_TOKEN = '2021647460758966273-NXaS4HdmWfEx98U0YvyTMJJvSSyLvz';
const ACCESS_TOKEN_SECRET = 'JRT0ZfRwS5rCURg78cskQNMKW2qm3BF5VPtGlmWhdJLk9';
const MY_USER_ID = '2021647460758966273';

const LOG_FILE = resolve(process.env.HOME, '.openclaw/workspace/x-reply-log.json');

// Load processed replies log
function loadLog() {
  if (!existsSync(LOG_FILE)) {
    return { processedIds: [], lastCheck: 0 };
  }
  return JSON.parse(readFileSync(LOG_FILE, 'utf-8'));
}

function saveLog(log) {
  writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

// OAuth helpers
function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

function generateOAuthSignature(method, url, oauthParams) {
  const paramString = Object.keys(oauthParams)
    .sort()
    .map(key => `${percentEncode(key)}=${percentEncode(oauthParams[key])}`)
    .join('&');

  const signatureBaseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(paramString)
  ].join('&');

  const signingKey = `${percentEncode(CONSUMER_SECRET)}&${percentEncode(ACCESS_TOKEN_SECRET)}`;
  const signature = crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
  return signature;
}

function buildAuthHeader(method, url, queryParams = {}) {
  const oauthParams = {
    oauth_consumer_key: CONSUMER_KEY,
    oauth_nonce: crypto.randomBytes(32).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN,
    oauth_version: '1.0',
    ...queryParams
  };

  const signature = generateOAuthSignature(method, url, oauthParams);
  oauthParams.oauth_signature = signature;

  const headerString = Object.keys(oauthParams)
    .filter(key => key.startsWith('oauth_'))
    .sort()
    .map(key => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
    .join(', ');

  return `OAuth ${headerString}`;
}

// Fetch mentions
async function getMentions() {
  return new Promise((resolve, reject) => {
    const url = `https://api.twitter.com/2/users/${MY_USER_ID}/mentions?max_results=10&tweet.fields=created_at,author_id,conversation_id`;
    
    const authHeader = buildAuthHeader('GET', url.split('?')[0]);
    
    https.get(url, {
      headers: {
        'Authorization': authHeader,
        'User-Agent': 'MaxiBot/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

// Check if reply is quality
function isQualityReply(text) {
  const lower = text.toLowerCase();
  
  // Skip low-effort
  if (/^(gm|gn|wen|nice|cool|this|lol|lmao|fr|💯|🔥|🚀|\s)+$/i.test(text)) return false;
  if (text.length < 20) return false;
  
  // Accept questions or substantive comments
  if (text.includes('?')) return true;
  if (text.split(' ').length >= 10) return true;
  
  return false;
}

// Generate response
function generateResponse(mention) {
  const text = mention.text.toLowerCase();
  
  if (text.includes('how') || text.includes('why') || text.includes('what')) {
    return "Good question. The key is understanding the incentive structures - not just the technology. Happy to dive deeper if useful.";
  }
  
  if (text.includes('agree') || text.includes('exactly') || text.includes('right')) {
    return "Appreciate that. This is why focusing on fundamentals > narratives matters.";
  }
  
  // Default
  return "Thanks for engaging. These conversations matter more than price charts.";
}

// Post reply
function postReply(text, replyToId) {
  try {
    const result = execSync(
      `node ${resolve(process.env.HOME, '.openclaw/workspace/x-post-library.mjs')} "${text.replace(/"/g, '\\"')}"`,
      { encoding: 'utf-8', timeout: 30000 }
    );
    return { success: true, output: result };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Main
async function checkReplies() {
  console.log('=== X Reply Monitor ===');
  console.log('Time:', new Date().toISOString());
  
  const log = loadLog();
  
  try {
    const result = await getMentions();
    const mentions = result.data || [];
    
    console.log(`Found ${mentions.length} mentions`);
    
    let responded = 0;
    
    for (const mention of mentions) {
      // Skip if already processed
      if (log.processedIds.includes(mention.id)) continue;
      
      // Skip if not quality
      if (!isQualityReply(mention.text)) {
        log.processedIds.push(mention.id);
        continue;
      }
      
      console.log('---');
      console.log('Quality mention:', mention.text.substring(0, 80));
      
      // Generate response
      const response = generateResponse(mention);
      console.log('Response:', response);
      
      // Post reply
      const postResult = postReply(response, mention.id);
      if (postResult.success) {
        console.log('✅ Posted reply');
        log.processedIds.push(mention.id);
        responded++;
      } else {
        console.log('❌ Failed:', postResult.error);
      }
      
      // Rate limit: wait 2 seconds between replies
      if (responded < mentions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    log.lastCheck = Math.floor(Date.now() / 1000);
    saveLog(log);
    
    console.log('\n=== Summary ===');
    console.log(`Checked: ${mentions.length} mentions`);
    console.log(`Responded: ${responded} times`);
    console.log(`Total processed: ${log.processedIds.length}`);
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkReplies()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
  });
