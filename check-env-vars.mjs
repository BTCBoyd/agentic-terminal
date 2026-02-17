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

async function getEnvVars() {
  // Get account_slug first
  const siteOptions = {
    hostname: 'api.netlify.com',
    path: `/api/v1/sites/${SITE_ID}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${NETLIFY_TOKEN}`,
      'User-Agent': 'Maxi-Env/1.0'
    }
  };
  
  const siteResult = await httpsRequest(siteOptions);
  const accountSlug = siteResult.data.account_slug;
  
  console.log('Account slug:', accountSlug);
  console.log('\nChecking environment variables...\n');
  
  // Check for GITHUB_TOKEN
  const envOptions = {
    hostname: 'api.netlify.com',
    path: `/api/v1/accounts/${accountSlug}/env/GITHUB_TOKEN?site_id=${SITE_ID}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${NETLIFY_TOKEN}`,
      'User-Agent': 'Maxi-Env/1.0'
    }
  };
  
  const envResult = await httpsRequest(envOptions);
  
  if (envResult.statusCode === 200) {
    console.log('✅ GITHUB_TOKEN is set');
    console.log('   Values:', envResult.data.values?.length || 0, 'configured');
  } else if (envResult.statusCode === 404) {
    console.log('❌ GITHUB_TOKEN is NOT set');
    console.log('   This is why auto-commit failed!');
  } else {
    console.log('⚠️  Status:', envResult.statusCode);
    console.log('   Response:', envResult.raw || JSON.stringify(envResult.data));
  }
}

getEnvVars().catch(err => console.error('Error:', err.message));
