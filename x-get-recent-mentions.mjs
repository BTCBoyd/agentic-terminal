#!/usr/bin/env node
/**
 * Fetch recent X mentions - FIXED: using API v1.1 (OAuth 1.0a compatible)
 */

import https from 'https';
import crypto from 'crypto';

const CONSUMER_KEY = 'jkunQBjrkqbGxDOXA2k7ve88q';
const CONSUMER_SECRET = 'DJGjqTZxXq2eWU3Rl0LwlEuUwq4i5cV6rfaytP7vtwpKGJIXC4';
const ACCESS_TOKEN = '2021647460758966273-5rFCUBnItjBr54ZLIAfuFRDFZjVOM8';
const ACCESS_TOKEN_SECRET = 'KXNdkIISHaPZ6Fu3gvsbVDFQz2H1NE5DQG9kDSqDRVebN';

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
    // FIXED: Using API v1.1 endpoint which works with OAuth 1.0a
    const baseUrl = 'https://api.twitter.com/1.1/statuses/mentions_timeline.json';
    const queryParams = {
      'count': '10',
      'tweet_mode': 'extended'
    };
    const url = `${baseUrl}?count=10&tweet_mode=extended`;
    
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
    if (data && data.length > 0) {
      data.forEach((tweet, i) => {
        const text = tweet.full_text || tweet.text;
        console.log(`${i + 1}. [ID: ${tweet.id_str}]`);
        console.log(`   Author: @${tweet.user.screen_name}`);
        console.log(`   Name: ${tweet.user.name}`);
        console.log(`   Time: ${tweet.created_at}`);
        console.log(`   Text: ${text}`);
        console.log('');
      });
    } else {
      console.log('No mentions found.');
    }
  })
  .catch(err => console.error('Error:', err.message));
