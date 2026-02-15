#!/usr/bin/env node
/**
 * Test X Mentions Fetch - Using working credentials from x-post.mjs
 */

import { createHmac, randomBytes } from 'crypto';
import https from 'https';

const CREDENTIALS = {
  consumerKey: 'Ujlhatu8IPe2DUH0pxCfsr2x9',
  consumerSecret: '5ncyAjCeWGtb5G2BVQ30evygbTvm9J3yJnDzTfTmy8wBcIenea',
  accessToken: '2021647460758966273-Brx930AwZrrj2GAnRgiSETnR3DqmkZ',
  accessTokenSecret: 'fKbRY0X7wDyS3f57BMhxcbJ19CXBgLbSfGKaX3EkoSsZY'
};

const MY_USER_ID = '2021647460758966273';

function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

function generateOAuthSignature(method, url, params, consumerSecret, tokenSecret = '') {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&');

  const signatureBase = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(sortedParams)
  ].join('&');

  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
  const hmac = createHmac('sha1', signingKey);
  hmac.update(signatureBase);
  return hmac.digest('base64');
}

function generateOAuthHeader(method, url, params) {
  const oauthParams = {
    oauth_consumer_key: CREDENTIALS.consumerKey,
    oauth_nonce: randomBytes(32).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: CREDENTIALS.accessToken,
    oauth_version: '1.0',
    ...params
  };

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    CREDENTIALS.consumerSecret,
    CREDENTIALS.accessTokenSecret
  );

  oauthParams.oauth_signature = signature;

  const headerParts = Object.keys(oauthParams)
    .filter(key => key.startsWith('oauth_'))
    .sort()
    .map(key => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
    .join(', ');

  return `OAuth ${headerParts}`;
}

async function getMentions() {
  return new Promise((resolve, reject) => {
    const url = `https://api.twitter.com/2/users/${MY_USER_ID}/mentions`;
    const queryParams = 'max_results=5&tweet.fields=created_at,author_id,text';
    const fullUrl = `${url}?${queryParams}`;
    
    const authHeader = generateOAuthHeader('GET', url, {
      max_results: '5',
      'tweet.fields': 'created_at,author_id,text'
    });
    
    https.get(fullUrl, {
      headers: {
        'Authorization': authHeader,
        'User-Agent': 'MaxiBot/2.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log('Response:', data);
        resolve(JSON.parse(data));
      });
    }).on('error', reject);
  });
}

console.log('=== Testing X Mentions Fetch ===');
console.log('Time:', new Date().toISOString());

getMentions()
  .then(data => {
    if (data.data) {
      console.log(`\n✅ Success! Found ${data.data.length} mentions:\n`);
      data.data.forEach(tweet => {
        console.log(`- [${tweet.id}] ${tweet.text.substring(0, 80)}...`);
      });
    } else {
      console.log('\n⚠️ No mentions found or API response unexpected');
    }
  })
  .catch(err => {
    console.error('\n❌ Error:', err.message);
  });
