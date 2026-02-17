#!/usr/bin/env node
import https from 'https';
import fs from 'fs';

const NETLIFY_TOKEN = fs.readFileSync('/home/futurebit/.openclaw/workspace/.netlify-token', 'utf8').trim();
const SITE_ID = 'b5accd10-44fd-43f0-9918-bebc93b12756';

function httpsRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (err) {
          resolve({ statusCode: res.statusCode, data, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function getFunctions() {
  const options = {
    hostname: 'api.netlify.com',
    path: `/api/v1/sites/${SITE_ID}/functions`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${NETLIFY_TOKEN}`,
      'User-Agent': 'Maxi-Logs/1.0'
    }
  };
  
  const result = await httpsRequest(options);
  console.log('Functions:', JSON.stringify(result, null, 2));
}

getFunctions();
