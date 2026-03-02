#!/usr/bin/env node
/**
 * Test X API v2 Search functionality
 */

import https from 'https';

const BEARER_TOKEN = 'FhtFe9Sl__s2uLrvcdT4I3A4Kkr0kHexWU1Ij-7b0R0E9OivYT';

async function searchX(query) {
  return new Promise((resolve, reject) => {
    // URL encode the query
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodedQuery}&max_results=10&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=username,name`;
    
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

// Test search
const query = process.argv[2] || 'AI agent verification';
console.log(`🔍 Searching X for: "${query}"\n`);

searchX(query)
  .then(data => {
    if (data.data && data.data.length > 0) {
      console.log(`✅ Found ${data.data.length} tweets:\n`);
      
      const users = {};
      if (data.includes?.users) {
        data.includes.users.forEach(u => {
          users[u.id] = `@${u.username}`;
        });
      }
      
      data.data.forEach((tweet, i) => {
        const username = users[tweet.author_id] || 'Unknown';
        const likes = tweet.public_metrics?.like_count || 0;
        const retweets = tweet.public_metrics?.retweet_count || 0;
        const text = tweet.text.substring(0, 100).replace(/\n/g, ' ');
        
        console.log(`${i+1}. ${username}`);
        console.log(`   ${text}${tweet.text.length > 100 ? '...' : ''}`);
        console.log(`   ❤️ ${likes}  🔄 ${retweets}`);
        console.log(`   Tweet ID: ${tweet.id}`);
        console.log('');
      });
    } else {
      console.log('No tweets found.');
    }
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });