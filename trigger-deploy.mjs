#!/usr/bin/env node
import https from 'https';
import fs from 'fs';

const NETLIFY_TOKEN = fs.readFileSync('/home/futurebit/.openclaw/workspace/.netlify-token', 'utf8').trim();
const SITE_ID = 'b5accd10-44fd-43f0-9918-bebc93b12756';

function httpsRequest(options, body = null) {
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
    if (body) req.write(body);
    req.end();
  });
}

async function triggerDeploy() {
  const options = {
    hostname: 'api.netlify.com',
    path: `/api/v1/sites/${SITE_ID}/builds`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NETLIFY_TOKEN}`,
      'User-Agent': 'Maxi-Deploy/1.0',
      'Content-Length': '0'
    }
  };
  
  console.log('Triggering redeploy to pick up GITHUB_TOKEN...');
  const result = await httpsRequest(options);
  
  if (result.statusCode === 200 || result.statusCode === 201) {
    console.log('✅ Deploy triggered!');
    console.log('   Build will complete in ~2 minutes');
    console.log('   Then auto-approval will work');
  } else {
    console.log('Status:', result.statusCode);
    console.log('Response:', JSON.stringify(result.data, null, 2));
  }
}

triggerDeploy().catch(err => console.error('Error:', err.message));
