#!/usr/bin/env node
/**
 * Fetch recent X mentions - read-only version
 */

import https from 'https';
import crypto from 'crypto';

const CONSUMER_KEY = 'VWpKNdNnQGRjgBvwVBU7b3QCK';
const CONSUMER_SECRET = 'R9RkdNPZEVS2jqW7ioJ4Qp87jgWkFFa7MHtmZt0jQt1ro9q8gv';
const ACCESS_TOKEN = '2021647460758966273-hERiLthBFKWeBSW5RmP4JHzPZWmjXh';
const ACCESS_TOKEN_SECRET = 'ZyQ3wGEgPpV3OJFV9bcXfoFoZykbni9BwPNrWYxkAKclZ';
const MY_USER_ID = '2021647460758966273';

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
      'max_results': '5',
      'tweet.fields': 'created_at,author_id,text'
    };
    const url = `${baseUrl}?max_results=5&tweet.fields=created_at,author_id,text`;
    
    const authHeader = buildAuthHeader('GET', baseUrl, queryParams);
    
    https.get(url, {
      headers: {
        'Authorization': authHeader,
        'User-Agent': 'MaxiBot/2.0'
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

console.log('=== Recent X Mentions ===\n');
getMentions()
  .then(data => {
    if (data.data && data.data.length > 0) {
      data.data.forEach((tweet, i) => {
        console.log(`${i + 1}. [ID: ${tweet.id}]`);
        console.log(`   Author: ${tweet.author_id}`);
        console.log(`   Time: ${tweet.created_at}`);
        console.log(`   Text: ${tweet.text}`);
        console.log('');
      });
    } else {
      console.log('No mentions found.');
    }
  })
  .catch(err => console.error('Error:', err.message));
