#!/usr/bin/env node
/**
 * X Mention Monitor - Using App-level Bearer Token
 */

import https from 'https';

const BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAKEu7gEAAAAAZk7a12eB50WHD%2Bv71hCdoXL2xss%3DRnYQoHVBdbFatbe2AUguiEaZyoWvbmcDeCOMZtzrtuBSxieR0M';
const USER_ID = '2021647460758966273';

async function getMentions() {
  return new Promise((resolve, reject) => {
    const url = `https://api.twitter.com/2/users/${USER_ID}/mentions?max_results=10&tweet.fields=created_at,author_id,text&expansions=author_id&user.fields=username,name`;
    
    https.get(url, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
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
      const users = {};
      if (data.includes && data.includes.users) {
        data.includes.users.forEach(u => {
          users[u.id] = u;
        });
      }
      
      data.data.forEach((tweet, i) => {
        const author = users[tweet.author_id] || { username: 'unknown', name: 'Unknown' };
        console.log(`${i + 1}. [ID: ${tweet.id}]`);
        console.log(`   Author: @${author.username} (${author.name})`);
        console.log(`   Time: ${tweet.created_at}`);
        console.log(`   Text: ${tweet.text}`);
        console.log('');
      });
    } else {
      console.log('No mentions found.');
    }
  })
  .catch(err => console.error('Error:', err.message));
