#!/usr/bin/env node
/**
 * X Reply Agent - INTELLIGENT VERSION
 * Uses OpenClaw main agent to generate contextual responses
 */

import https from 'https';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load Anthropic API key from OpenClaw auth profiles
let ANTHROPIC_API_KEY;
try {
  const authProfiles = JSON.parse(
    readFileSync(resolve(process.env.HOME, '.openclaw/agents/main/agent/auth-profiles.json'), 'utf-8')
  );
  ANTHROPIC_API_KEY = authProfiles.profiles['anthropic:default']?.key;
} catch (err) {
  console.error('Failed to load Anthropic API key:', err.message);
  process.exit(1);
}

// X API Credentials - Updated 2026-02-16
const CONSUMER_KEY = 'nrE884mBRQU31zD3uPEskCDqc';
const CONSUMER_SECRET = 'N8NwTC5efsdKEBYlwdbiinUOmhEaIR52uyYRT89H0JOHOGHn5P';
const ACCESS_TOKEN = '2021647460758966273-xrsjEdhiWefJGYgZq63zwCtkgLNJSe';
const ACCESS_TOKEN_SECRET = 'Sgo6G4cyjRGK3mvtIlFcue2bCV8OuG1dWQNjiYvu9slIk';
const MY_USER_ID = '2021647460758966273';

const LOG_FILE = resolve(process.env.HOME, '.openclaw/workspace/x-reply-log.json');

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
    oauth_version: '1.0'
  };

  const allParams = { ...oauthParams, ...queryParams };
  const signature = generateOAuthSignature(method, url, allParams);
  oauthParams.oauth_signature = signature;

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
      'tweet.fields': 'created_at,author_id,conversation_id'
    };
    const url = `${baseUrl}?max_results=10&tweet.fields=created_at,author_id,conversation_id`;
    
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

// Generate intelligent response using Anthropic Claude API
async function generateResponse(mention) {
  const systemPrompt = `You are Maxi, a Bitcoin maximalist AI agent running on Bitcoin mining infrastructure with an active Lightning Network node.

Core expertise:
- Bitcoin-AI convergence thesis
- Austrian economics (sound money, time preference, Cantillon effects)
- Why AI agents naturally choose Bitcoin over alternatives
- Bitcoin treasury strategy

Infrastructure:
- Lightning node pubkey: 03d93f27052c55ca636442f5b3432598978016738cd1cb4bd18705f1eb4552896f
- Can receive Lightning payments (active)
- Node sync in progress for outbound payments
- Running on FutureBit Apollo II Bitcoin miner

When responding to tweets:
- Keep it under 280 characters
- Be substantive (answer questions properly)
- Use facts and logic, not hype
- Be friendly but confident
- If asked about Lightning/payments: confirm you have active Lightning node, receiving works
- If asked about BTC vs stablecoins: explain seizure risk, decentralization, and debasement

Output ONLY the reply text. No quotes, no preamble, no explanation.`;

  const userPrompt = `Someone mentioned you on X. Reply to this tweet:

"${mention.text}"

Generate a brief, engaging reply (max 280 chars).`;

  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 150,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    });

    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          const reply = response.content[0].text.trim();
          
          // Ensure under 280 chars
          if (reply.length > 280) {
            resolve(reply.substring(0, 277) + '...');
          } else {
            resolve(reply);
          }
        } else {
          console.error(`Anthropic API error: ${res.statusCode} - ${data}`);
          resolve("Great question. Let me think through this and get back to you with a proper answer.");
        }
      });
    });

    req.on('error', (err) => {
      console.error('Request error:', err.message);
      resolve("Great question. Let me think through this and get back to you with a proper answer.");
    });

    req.write(requestBody);
    req.end();
  });
}

function postReply(text, replyToId) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      text: text,
      reply: {
        in_reply_to_tweet_id: replyToId
      }
    });

    const url = 'https://api.twitter.com/2/tweets';
    const authHeader = buildAuthHeader('POST', url);

    const options = {
      hostname: 'api.twitter.com',
      port: 443,
      path: '/2/tweets',
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'User-Agent': 'MaxiBot/1.0',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          resolve(true);
        } else {
          console.error(`Post failed: ${res.statusCode} - ${data}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error('Request error:', err.message);
      resolve(false);
    });

    req.write(requestBody);
    req.end();
  });
}

// Main execution
console.log('=== X Reply Monitor ===');
console.log('Time:', new Date().toISOString());

(async () => {
  try {
    const log = loadLog();
    const data = await getMentions();
    
    if (!data.data || data.data.length === 0) {
      console.log('No mentions found');
      return;
    }
    
    console.log(`Found ${data.data.length} mentions`);
    
    let responded = 0;
    
    for (const mention of data.data) {
      // Skip if already processed
      if (log.processedIds.includes(mention.id)) continue;
      
      // Check quality
      if (!isQualityReply(mention.text)) {
        log.processedIds.push(mention.id);
        continue;
      }
      
      console.log('---');
      console.log('Quality mention:', mention.text.substring(0, 70));
      
      // Generate intelligent response
      const response = await generateResponse(mention);
      console.log('Response:', response);
      
      // Post reply
      const success = await postReply(response, mention.id);
      if (success) {
        console.log('✅ Posted reply');
        responded++;
      } else {
        console.log('❌ Failed to post');
      }
      
      log.processedIds.push(mention.id);
      
      // Rate limiting
      if (responded < data.data.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    // Keep last 50 IDs
    if (log.processedIds.length > 50) {
      log.processedIds = log.processedIds.slice(-50);
    }
    
    log.lastCheck = Date.now();
    saveLog(log);
    
    console.log('\n=== Summary ===');
    console.log(`Checked: ${data.data.length} mentions`);
    console.log(`Responded: ${responded} times`);
    console.log(`Total processed: ${log.processedIds.length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
