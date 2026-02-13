#!/usr/bin/env node
/**
 * Facebook Posting Library for ArcadiaB
 * Posts to Facebook Business Page via Graph API
 */

import https from 'https';
import { URLSearchParams } from 'url';

// Credentials (to be filled in after setup)
const PAGE_ID = 'TO_BE_CONFIGURED';
const PAGE_ACCESS_TOKEN = 'TO_BE_CONFIGURED';

async function postToFacebook(message) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      message: message,
      access_token: PAGE_ACCESS_TOKEN
    });
    
    const options = {
      hostname: 'graph.facebook.com',
      path: `/v18.0/${PAGE_ID}/feed`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': params.toString().length
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        
        if (res.statusCode === 200) {
          const parsed = JSON.parse(data);
          console.log('✅ SUCCESS: Post ID', parsed.id);
          resolve(parsed);
        } else {
          console.log('❌ FAILED:', data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(params.toString());
    req.end();
  });
}

// CLI usage
const message = process.argv[2];

if (!message) {
  console.error('Usage: node facebook-post-library.mjs "Your post text"');
  process.exit(1);
}

if (PAGE_ID === 'TO_BE_CONFIGURED' || PAGE_ACCESS_TOKEN === 'TO_BE_CONFIGURED') {
  console.error('❌ Facebook credentials not configured yet');
  console.error('Run through FACEBOOK-SETUP-GUIDE.md first');
  process.exit(1);
}

postToFacebook(message)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
