#!/usr/bin/env node
/**
 * X (Twitter) Posting Script - Fixed OAuth 1.0a
 * For POST with JSON body, signature includes ONLY OAuth params, NOT body content
 */

import { createHmac, randomBytes } from 'crypto';
import https from 'https';

const CREDENTIALS = {
  consumerKey: 'Ujlhatu8IPe2DUH0pxCfsr2x9',
  consumerSecret: '5ncyAjCeWGtb5G2BVQ30evygbTvm9J3yJnDzTfTmy8wBcIenea',
  accessToken: '2021647460758966273-quy9mFRGYBXBNuBkmmuDwN6QcBU7tH',
  accessTokenSecret: 'H07U6Ila0q0UuMPOy6KUT5oFa47C5ceZtt9P8C3UtNvAi'
};

function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

function generateOAuthSignature(method, url, params, consumerSecret, tokenSecret) {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&');

  // Signature base string
  const signatureBase = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(sortedParams)
  ].join('&');

  // Signing key
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;

  // HMAC-SHA1
  const hmac = createHmac('sha1', signingKey);
  hmac.update(signatureBase);
  return hmac.digest('base64');
}

function postTweet(text) {
  return new Promise((resolve, reject) => {
    const url = 'https://api.twitter.com/2/tweets';
    const method = 'POST';

    // OAuth parameters
    const oauthParams = {
      oauth_consumer_key: CREDENTIALS.consumerKey,
      oauth_token: CREDENTIALS.accessToken,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: randomBytes(32).toString('hex'),
      oauth_version: '1.0'
    };

    // Generate signature (includes ONLY OAuth params for POST with JSON body)
    const signature = generateOAuthSignature(
      method,
      url,
      oauthParams,
      CREDENTIALS.consumerSecret,
      CREDENTIALS.accessTokenSecret
    );

    oauthParams.oauth_signature = signature;

    // Build Authorization header
    const authHeader = 'OAuth ' + Object.keys(oauthParams)
      .map(key => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
      .join(', ');

    // Request body
    const body = JSON.stringify({ text });

    const options = {
      hostname: 'api.twitter.com',
      path: '/2/tweets',
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const response = JSON.parse(data);
            resolve(response);
          } catch (err) {
            reject(new Error(`Parse error: ${err.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(body);
    req.end();
  });
}

const tweetText = process.argv[2];

if (!tweetText) {
  console.error('Usage: node x-post-fixed.mjs "Your tweet text"');
  process.exit(1);
}

postTweet(tweetText)
  .then((response) => {
    console.log('✅ Tweet posted!');
    console.log(`ID: ${response.data.id}`);
    console.log(`URL: https://x.com/Maxibtc2009/status/${response.data.id}`);
  })
  .catch((error) => {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  });
