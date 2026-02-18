#!/usr/bin/env node
import crypto from 'crypto';
import https from 'https';

// ━━━ ARCADIABTC CREDENTIALS ━━━
const CONSUMER_KEY = 'r3gwpkPlEsagprQFtd2nclNxu';
const CONSUMER_SECRET = 'XRW0XA2b5U8BwcNwGiA17gyxp7U00qXnyiWu7DrTrjO68bVdT2';
const ACCESS_TOKEN = '1153217326692651009-u4xMd9meIw1gKqbmXq3rLnAAtdYF5Y';
const ACCESS_TOKEN_SECRET = 'Yey2hvbgEBHpVwcLuQjAKbFN6s4Jr7qP9aLDUhE9MUk40';

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

  const signature = generateOAuthSignature(method, url, oauthParams);
  oauthParams.oauth_signature = signature;

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
    const req = https.request(url, {
      method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        
        if (res.statusCode === 201) {
          console.log('✅ SUCCESS:', JSON.parse(data));
          resolve(JSON.parse(data));
        } else {
          console.log('❌ FAILED: HTTP', res.statusCode + ':', data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ━━━ Main ━━━
const tweetText = process.argv[2];

if (!tweetText) {
  console.error('Usage: node x-post-arcadiabtc.mjs "Your tweet text"');
  process.exit(1);
}

postTweet(tweetText)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
