#!/usr/bin/env node
/**
 * X Mention Monitor - NOTIFICATION VERSION
 * Fetches mentions and alerts main session via WhatsApp
 * NO auto-reply - Maxi reviews and responds thoughtfully
 */

import https from 'https';
import crypto from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// X API Credentials for @Maxibtc2009
const CONSUMER_KEY = 'nrE884mBRQU31zD3uPEskCDqc';
const CONSUMER_SECRET = 'N8NwTC5efsdKEBYlwdbiinUOmhEaIR52uyYRT89H0JOHOGHn5P';
const ACCESS_TOKEN = '2021647460758966273-xrsjEdhiWefJGYgZq63zwCtkgLNJSe';
const ACCESS_TOKEN_SECRET = 'Sgo6G4cyjRGK3mvtIlFcue2bCV8OuG1dWQNjiYvu9slIk';
const MY_USER_ID = '2021647460758966273';

const LOG_FILE = resolve(process.env.HOME, '.openclaw/workspace/x-mention-log.json');

function loadLog() {
  if (!existsSync(LOG_FILE)) {
    return { seenIds: [], lastCheck: 0 };
  }
  try {
    return JSON.parse(readFileSync(LOG_FILE, 'utf-8'));
  } catch {
    return { seenIds: [], lastCheck: 0 };
  }
}

function saveLog(log) {
  writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

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
  return crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
}

function buildAuthHeader(method, url, queryParams = {}) {
  const oauthParams = {
    oauth_consumer_key: CONSUMER_KEY,
    oauth_nonce: crypto.randomBytes(32).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN,
    oauth_version: '1.0'
  };

  const allParams = { ...oauthParams, ...queryParams };
  oauthParams.oauth_signature = generateOAuthSignature(method, url, allParams);

  const headerString = Object.keys(oauthParams)
    .sort()
    .map(key => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
    .join(', ');

  return `OAuth ${headerString}`;
}

async function getMentions() {
  return new Promise((resolve, reject) => {
    const baseUrl = `https://api.twitter.com/2/users/${MY_USER_ID}/mentions`;
    const queryParams = {
      'max_results': '10',
      'tweet.fields': 'created_at,author_id,conversation_id,text',
      'expansions': 'author_id',
      'user.fields': 'username,name'
    };
    
    const queryString = Object.entries(queryParams).map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    const url = `${baseUrl}?${queryString}`;
    
    const authHeader = buildAuthHeader('GET', baseUrl, queryParams);
    
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

// Main
console.log('=== X Mention Monitor ===');
console.log('Time:', new Date().toISOString());

(async () => {
  try {
    const log = loadLog();
    const data = await getMentions();
    
    if (!data.data || data.data.length === 0) {
      console.log('No mentions found');
      log.lastCheck = Date.now();
      saveLog(log);
      return;
    }
    
    // Build user lookup
    const users = {};
    if (data.includes?.users) {
      for (const user of data.includes.users) {
        users[user.id] = user;
      }
    }
    
    // Find NEW mentions (not seen before)
    const newMentions = data.data.filter(m => !log.seenIds.includes(m.id));
    
    if (newMentions.length === 0) {
      console.log('No new mentions');
      log.lastCheck = Date.now();
      saveLog(log);
      return;
    }
    
    console.log(`Found ${newMentions.length} NEW mentions!`);
    
    // Format alert message
    let alert = `🐦 NEW X MENTIONS (${newMentions.length}):\n\n`;
    
    for (const mention of newMentions) {
      const user = users[mention.author_id] || { username: 'unknown', name: 'Unknown' };
      const tweetUrl = `https://x.com/${user.username}/status/${mention.id}`;
      
      alert += `@${user.username}: "${mention.text.substring(0, 150)}${mention.text.length > 150 ? '...' : ''}"\n`;
      alert += `Link: ${tweetUrl}\n\n`;
      
      // Mark as seen
      log.seenIds.push(mention.id);
    }
    
    alert += `Reply via X API or tell me how to respond.`;
    
    // Output the alert - OpenClaw will see this and can forward to WhatsApp
    console.log('\n--- ALERT FOR MAXI ---');
    console.log(alert);
    console.log('--- END ALERT ---\n');
    
    // Keep last 100 IDs
    if (log.seenIds.length > 100) {
      log.seenIds = log.seenIds.slice(-100);
    }
    
    log.lastCheck = Date.now();
    saveLog(log);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
