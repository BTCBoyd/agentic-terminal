#!/usr/bin/env node
/**
 * X (Twitter) Posting Script
 * Posts tweets using OAuth 1.0a authentication
 */

import { createHmac, randomBytes } from 'crypto';
import https from 'https';

const CREDENTIALS = {
  consumerKey: 'ern3mimZMpHl4MvBlJnIrokqI',
  consumerSecret: 'BdMlZAjKSRJL4g0eIphrLWxoGLo3bI4Ru0FUR2R6mEwSWImzBv',
  accessToken: '2021647460758966273-qQW48HIRGxefjbDAMaEnNA9op5kPxH',
  accessTokenSecret: 'xsUk0hsIewKaNpZKUj7TNrejC4rWmizPSbzBj9aoHfdK3'
};

function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

function generateOAuthSignature(method, url, params, consumerSecret, tokenSecret = '') {
  // Sort parameters
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&');

  // Create signature base string
  const signatureBase = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(sortedParams)
  ].join('&');

  // Create signing key
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;

  // Generate signature
  const hmac = createHmac('sha1', signingKey);
  hmac.update(signatureBase);
  return hmac.digest('base64');
}

function generateOAuthHeader(method, url, params) {
  const oauthParams = {
    oauth_consumer_key: CREDENTIALS.consumerKey,
    oauth_token: CREDENTIALS.accessToken,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: randomBytes(16).toString('hex'),
    oauth_version: '1.0'
  };

  // Merge OAuth params with request params for signature
  const allParams = { ...oauthParams, ...params };

  // Generate signature
  const signature = generateOAuthSignature(
    method,
    url,
    allParams,
    CREDENTIALS.consumerSecret,
    CREDENTIALS.accessTokenSecret
  );

  oauthParams.oauth_signature = signature;

  // Build OAuth header
  const oauthHeader = 'OAuth ' + Object.keys(oauthParams)
    .sort()
    .map(key => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
    .join(', ');

  return oauthHeader;
}

function postTweet(text, mediaIds = []) {
  return new Promise((resolve, reject) => {
    const url = 'https://api.twitter.com/2/tweets';
    const method = 'POST';
    const payload = { text };
    if (mediaIds.length > 0) payload.media = { media_ids: mediaIds };
    const body = JSON.stringify(payload);

    // Generate OAuth header (no query params for POST with JSON body)
    const oauthHeader = generateOAuthHeader(method, url, {});

    const options = {
      hostname: 'api.twitter.com',
      path: '/2/tweets',
      method: 'POST',
      headers: {
        'Authorization': oauthHeader,
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
            reject(new Error(`Failed to parse response: ${err.message}`));
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

// Main execution — supports: node x-post.mjs "text"
//                  or:      node x-post.mjs --media <id> --account <acct> "text"
const args = process.argv.slice(2);
let tweetText, mediaIds = [];

if (args[0] === '--media') {
  mediaIds = [args[1]];
  // skip --account <acct> if present
  const textStart = args[2] === '--account' ? 4 : 2;
  tweetText = args.slice(textStart).join(' ');
} else {
  tweetText = args.join(' ');
}

if (!tweetText) {
  console.error('Usage: node x-post.mjs "Your tweet text here"');
  process.exit(1);
}

postTweet(tweetText, mediaIds)
  .then((response) => {
    console.log('✅ Tweet posted successfully!');
    console.log(`Tweet ID: ${response.data.id}`);
    console.log(`URL: https://twitter.com/Maxibtc2009/status/${response.data.id}`);
  })
  .catch((error) => {
    console.error('❌ Failed to post tweet:', error.message);
    process.exit(1);
  });
