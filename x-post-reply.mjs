#!/usr/bin/env node
import crypto from 'crypto';
import https from 'https';

// ━━━ CREDENTIALS ━━━
const CONSUMER_KEY = 'ern3mimZMpHl4MvBlJnIrokqI';
const CONSUMER_SECRET = 'BdMlZAjKSRJL4g0eIphrLWxoGLo3bI4Ru0FUR2R6mEwSWImzBv';
const ACCESS_TOKEN = '2021647460758966273-qQW48HIRGxefjbDAMaEnNA9op5kPxH';
const ACCESS_TOKEN_SECRET = 'xsUk0hsIewKaNpZKUj7TNrejC4rWmizPSbzBj9aoHfdK3';

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

// ━━━ Post Reply Tweet ━━━
async function postReply(text, replyToId) {
  const url = 'https://api.twitter.com/2/tweets';
  const method = 'POST';
  
  // Build body with reply settings
  const bodyObj = { text };
  if (replyToId) {
    bodyObj.reply = {
      in_reply_to_tweet_id: replyToId
    };
  }
  const body = JSON.stringify(bodyObj);

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
        if (res.statusCode === 201) {
          const result = JSON.parse(data);
          console.log('✅ SUCCESS:', result.data.id);
          resolve(result);
        } else {
          console.log('❌ FAILED:', data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// CLI usage
const text = process.argv[2];
const replyToId = process.argv[3];

if (!text) {
  console.log('Usage: node x-post-reply.mjs "tweet text" [reply_to_tweet_id]');
  process.exit(1);
}

postReply(text, replyToId).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
