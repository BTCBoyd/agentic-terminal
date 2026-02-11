#!/usr/bin/env node
/**
 * X (Twitter) Posting Script - Bearer Token Method
 */

import https from 'https';

const BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAKEu7gEAAAAAZk7a12eB50WHD%2Bv71hCdoXL2xss%3DRnYQoHVBdbFatbe2AUguiEaZyoWvbmcDeCOMZtzrtuBSxieR0M';
const ACCESS_TOKEN = '2021647460758966273-Brx930AwZrrj2GAnRgiSETnR3DqmkZ';
const ACCESS_SECRET = 'fKbRY0X7wDyS3f57BMhxcbJ19CXBgLbSfGKaX3EkoSsZY';

function postTweet(text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ text });

    const options = {
      hostname: 'api.twitter.com',
      path: '/2/tweets',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
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
        console.log(`HTTP ${res.statusCode}`);
        console.log(data);
        
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

const tweetText = process.argv[2];

if (!tweetText) {
  console.error('Usage: node x-post-bearer.mjs "Your tweet text here"');
  process.exit(1);
}

postTweet(tweetText)
  .then((response) => {
    console.log('✅ Tweet posted successfully!');
    console.log(`Tweet ID: ${response.data.id}`);
    console.log(`URL: https://twitter.com/Maxibtc2009/status/${response.data.id}`);
  })
  .catch((error) => {
    console.error('❌ Failed to post tweet:', error.message);
    process.exit(1);
  });
