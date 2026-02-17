#!/usr/bin/env node
// Check Netlify deploy status and function logs programmatically
// Usage: node check-netlify-status.mjs

import https from 'https';
import fs from 'fs';

const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN || fs.readFileSync('.netlify-token', 'utf8').trim();
const SITE_DOMAIN = 'bitcoinsingularity.ai';

function httpsRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (err) {
          resolve({ statusCode: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function getSite() {
  const options = {
    hostname: 'api.netlify.com',
    path: `/api/v1/sites/${SITE_DOMAIN}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${NETLIFY_TOKEN}`,
      'User-Agent': 'Maxi-StatusCheck/1.0'
    }
  };
  
  const result = await httpsRequest(options);
  return result.data;
}

async function getLatestDeploy(siteId) {
  const options = {
    hostname: 'api.netlify.com',
    path: `/api/v1/sites/${siteId}/deploys?per_page=1`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${NETLIFY_TOKEN}`,
      'User-Agent': 'Maxi-StatusCheck/1.0'
    }
  };
  
  const result = await httpsRequest(options);
  return result.data[0];
}

async function getFunctionLogs(siteId, functionName = 'submit-party') {
  const options = {
    hostname: 'api.netlify.com',
    path: `/api/v1/sites/${siteId}/functions/${functionName}/invocations?per_page=10`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${NETLIFY_TOKEN}`,
      'User-Agent': 'Maxi-StatusCheck/1.0'
    }
  };
  
  const result = await httpsRequest(options);
  return result.data;
}

async function main() {
  try {
    console.log('🔍 Checking Netlify status...\n');
    
    // Get site info
    const site = await getSite();
    console.log(`✅ Site: ${site.name}`);
    console.log(`   URL: ${site.url}`);
    console.log(`   Site ID: ${site.id}\n`);
    
    // Get latest deploy
    const deploy = await getLatestDeploy(site.id);
    console.log(`📦 Latest Deploy:`);
    console.log(`   ID: ${deploy.id}`);
    console.log(`   State: ${deploy.state}`);
    console.log(`   Created: ${new Date(deploy.created_at).toLocaleString()}`);
    console.log(`   Deploy URL: ${deploy.deploy_url}\n`);
    
    if (deploy.state === 'ready') {
      console.log('✅ Deploy is LIVE\n');
    } else {
      console.log(`⏳ Deploy is ${deploy.state}...\n`);
    }
    
    // Get function logs
    console.log('📋 Recent submit-party function logs:');
    try {
      const logs = await getFunctionLogs(site.id);
      
      if (logs && logs.length > 0) {
        logs.slice(0, 5).forEach(log => {
          console.log(`\n   ${new Date(log.created_at).toLocaleString()}`);
          console.log(`   Duration: ${log.duration}ms`);
          console.log(`   Status: ${log.status_code || 'unknown'}`);
          
          if (log.logs) {
            const relevantLogs = log.logs.split('\n')
              .filter(line => line.includes('PARTY') || line.includes('GitHub'))
              .slice(0, 3);
            
            if (relevantLogs.length > 0) {
              console.log('   Logs:');
              relevantLogs.forEach(line => console.log(`     ${line}`));
            }
          }
        });
      } else {
        console.log('   No recent invocations found');
      }
    } catch (err) {
      console.log(`   ⚠️  Could not fetch logs: ${err.message}`);
    }
    
    console.log('\n✅ Status check complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('\n💡 Make sure NETLIFY_TOKEN is set correctly');
    }
    process.exit(1);
  }
}

main();
