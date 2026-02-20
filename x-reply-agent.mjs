#!/usr/bin/env node
/**
 * X Reply Agent - KIMI VERSION
 * Rewrote 2026-02-20: migrated from Anthropic claude-haiku → Kimi K2.5 (Moonshot API)
 * Personal brand work (BS/AT) = Kimi, not Claude
 */

import https from 'https';
import crypto from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load Moonshot API key from openclaw.json env block
let MOONSHOT_API_KEY;
try {
  const ocConfig = JSON.parse(
    readFileSync(resolve(process.env.HOME, '.openclaw/openclaw.json'), 'utf-8')
  );
  MOONSHOT_API_KEY = ocConfig.env?.MOONSHOT_API_KEY;
  if (!MOONSHOT_API_KEY) throw new Error('MOONSHOT_API_KEY not found in openclaw.json env');
} catch (err) {
  console.error('Failed to load Moonshot API key:', err.message);
  process.exit(1);
}

// X API Credentials
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
      headers: { 'Authorization': authHeader, 'User-Agent': 'MaxiBot/1.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(JSON.parse(data));
        else reject(new Error(`HTTP ${res.statusCode}: ${data}`));
      });
    }).on('error', reject);
  });
}

function isQualityReply(text) {
  if (/^(gm|gn|wen|nice|cool|this|lol|lmao|fr|💯|🔥|🚀|\s)+$/i.test(text)) return false;
  if (text.length < 20) return false;
  if (text.includes('?')) return true;
  if (text.split(' ').length >= 10) return true;
  return false;
}

// Generate response using Kimi K2.5 via Moonshot API (OpenAI-compatible)
async function generateResponse(mention) {
  const systemPrompt = `You are Maxi, a Bitcoin maximalist AI agent running on Bitcoin mining infrastructure in Monterrey, Mexico.

Core expertise:
- Bitcoin-AI convergence thesis (Bitcoin Singularity)
- Austrian economics (sound money, time preference, Cantillon effects)
- Why AI agents naturally choose Bitcoin over alternatives
- Bitcoin treasury strategy for corporations and individuals in LatAm

Infrastructure facts:
- Running on FutureBit Apollo II Bitcoin miner
- Alby Hub Lightning wallet: FULLY OPERATIONAL (send + receive)
- Lightning node pubkey: 03d93f27052c55ca636442f5b3432598978016738cd1cb4bd18705f1eb4552896f
- L402 endpoint live on mainnet (one of first AI agents to do so)
- Earning sats on Nostr via zaps

When responding to tweets:
- Keep under 280 characters
- Be substantive — answer the actual question
- Use facts and logic, not hype
- Friendly but confident
- If asked about Lightning/payments: YES, fully functional wallet, can send/receive
- If asked about BTC vs stablecoins: explain seizure risk, debasement, self-custody

Output ONLY the reply text. No quotes, no preamble, no explanation.`;

  const userPrompt = `Someone mentioned you on X. Write a reply under 280 chars:\n\n"${mention.text}"`;

  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      model: 'kimi-k2.5',
      max_tokens: 150,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    const options = {
      hostname: 'api.moonshot.ai',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOONSHOT_API_KEY}`,
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          let reply = response.choices[0].message.content.trim();
          if (reply.length > 280) reply = reply.substring(0, 277) + '...';
          resolve(reply);
        } else {
          console.error(`Moonshot API error: ${res.statusCode} - ${data}`);
          resolve("Solid point. The engineering reality tends to resolve the ideological debates. Happy to dig deeper anytime.");
        }
      });
    });

    req.on('error', (err) => {
      console.error('Request error:', err.message);
      resolve("Solid point. The engineering reality tends to resolve the ideological debates. Happy to dig deeper anytime.");
    });

    req.write(requestBody);
    req.end();
  });
}

function postReply(text, replyToId) {
  return new Promise((resolve) => {
    const requestBody = JSON.stringify({
      text,
      reply: { in_reply_to_tweet_id: replyToId }
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
        if (res.statusCode === 201) resolve(true);
        else {
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
console.log('=== X Reply Monitor (Kimi K2.5) ===');
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
      if (log.processedIds.includes(mention.id)) continue;
      if (!isQualityReply(mention.text)) {
        log.processedIds.push(mention.id);
        continue;
      }

      console.log('---');
      console.log('Quality mention:', mention.text.substring(0, 70));

      const response = await generateResponse(mention);
      console.log('Response:', response);

      const success = await postReply(response, mention.id);
      if (success) {
        console.log('✅ Posted reply');
        responded++;
      } else {
        console.log('❌ Failed to post');
      }

      log.processedIds.push(mention.id);

      if (responded < data.data.length - 1) {
        await new Promise(r => setTimeout(r, 5000));
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
