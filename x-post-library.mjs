#!/usr/bin/env node
import crypto from 'crypto';
import https from 'https';

// ━━━ CREDENTIALS ━━━
const CONSUMER_KEY = 'XBfsAHqeYQeRBOeGJZo9CKeBh';
const CONSUMER_SECRET = '7dE5HzNzdYoIwH2nCwRMPkAowu3fxqgBkG6uTMSZzesY4kUf6u';
const ACCESS_TOKEN = '2021647460758966273-NXaS4HdmWfEx98U0YvyTMJJvSSyLvz';
const ACCESS_TOKEN_SECRET = 'JRT0ZfRwS5rCURg78cskQNMKW2qm3BF5VPtGlmWhdJLk9';

// ━━━ RFC 3986 Percent Encoding ━━━
function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

// ━━━ Generate OAuth 1.0a Signature ━━━
function generateOAuthSignature(method, url, oauthParams) {
  // 1. Sort parameters alphabetically and encode
  const paramString = Object.keys(oauthParams)
    .sort()
    .map(key => `${percentEncode(key)}=${percentEncode(oauthParams[key])}`)
    .join('&');

  // 2. Build signature base string
  const signatureBaseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(paramString)
  ].join('&');

  // 3. Build signing key
  const signingKey = `${percentEncode(CONSUMER_SECRET)}&${percentEncode(ACCESS_TOKEN_SECRET)}`;

  // 4. HMAC-SHA1
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(signatureBaseString)
    .digest('base64');

  return signature;
}

// ━━━ Build Authorization Header ━━━
function buildAuthHeader(method, url) {
  const oauthParams = {
    oauth_consumer_key: CONSUMER_KEY,
    oauth_nonce: crypto.randomBytes(32).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN,
    oauth_version: '1.0'
  };

  // Generate signature with all oauth params (but NOT the signature itself)
  const signature = generateOAuthSignature(method, url, oauthParams);
  oauthParams.oauth_signature = signature;

  // Build header string — values must be percent-encoded and quoted
  const headerString = Object.keys(oauthParams)
    .sort()
    .map(key => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
    .join(', ');

  return `OAuth ${headerString}`;
}

// ━━━ Post Tweet ━━━
async function postTweet(text) {
  const url = 'https://api.twitter.com/2/tweets';
  const method = 'POST';
  const body = JSON.stringify({ text });

  const authHeader = buildAuthHeader(method, url);

  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data}`);
        if (res.statusCode === 201) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ━━━ Debug Helper ━━━
async function debugPost(text) {
  const url = 'https://api.twitter.com/2/tweets';
  const oauthParams = {
    oauth_consumer_key: CONSUMER_KEY,
    oauth_nonce: crypto.randomBytes(32).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN,
    oauth_version: '1.0'
  };

  // Log each step for debugging
  const paramString = Object.keys(oauthParams)
    .sort()
    .map(key => `${percentEncode(key)}=${percentEncode(oauthParams[key])}`)
    .join('&');

  const baseString = `POST&${percentEncode(url)}&${percentEncode(paramString)}`;

  console.log('━━━ DEBUG OUTPUT ━━━');
  console.log('Timestamp:', oauthParams.oauth_timestamp);
  console.log('System time (UTC):', new Date().toISOString());
  console.log('Nonce:', oauthParams.oauth_nonce);
  console.log('Parameter string:', paramString);
  console.log('Signature base string:', baseString);
  console.log('Signing key:', `${percentEncode(CONSUMER_SECRET)}&${percentEncode(ACCESS_TOKEN_SECRET)}`);
  console.log('━━━━━━━━━━━━━━━━━━━');

  try {
    const result = await postTweet(text);
    console.log('✅ SUCCESS:', result);
  } catch (err) {
    console.log('❌ FAILED:', err.message);
  }
}

// ━━━ Run ━━━
const tweetText = process.argv[2] || '🔧 Test post from Maxi — OAuth 1.0a integration verified.';
debugPost(tweetText);
