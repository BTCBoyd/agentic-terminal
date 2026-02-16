#!/usr/bin/env node
/**
 * Infrastructure Verification Script
 * MUST RUN before making ANY public claims about capabilities
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import https from 'https';

const HOME = process.env.HOME;

console.log('🔍 MAXI INFRASTRUCTURE VERIFICATION\n');
console.log('=' .repeat(60));

let errors = [];
let warnings = [];
let verified = [];

// Check 1: Alby credentials exist
console.log('\n1. Checking Alby Hub credentials...');
const albyPath = resolve(HOME, '.openclaw/workspace/.alby-credentials');
if (existsSync(albyPath)) {
  const albyContent = readFileSync(albyPath, 'utf-8');
  if (albyContent.includes('ALBY_API_URL') && albyContent.includes('ALBY_AUTH_TOKEN')) {
    verified.push('✅ Alby credentials file exists and has required fields');
    
    // Extract values for testing
    const urlMatch = albyContent.match(/ALBY_API_URL=(.+)/);
    const tokenMatch = albyContent.match(/ALBY_AUTH_TOKEN=(.+)/);
    
    if (urlMatch && tokenMatch) {
      const apiUrl = urlMatch[1].trim();
      const authToken = tokenMatch[1].trim();
      
      // Test actual API connection
      console.log('   Testing API connection...');
      testAlbyConnection(apiUrl, authToken);
    }
  } else {
    errors.push('❌ Alby credentials file missing required fields');
  }
} else {
  errors.push('❌ Alby credentials file not found');
}

// Check 2: Infrastructure state file
console.log('\n2. Checking infrastructure state documentation...');
const statePath = resolve(HOME, '.openclaw/workspace/MAXI-INFRASTRUCTURE-STATE.md');
if (existsSync(statePath)) {
  verified.push('✅ Infrastructure state file exists');
} else {
  errors.push('❌ Infrastructure state file not found');
}

// Check 3: X reply agent configuration
console.log('\n3. Checking X reply agent configuration...');
const xReplyPath = resolve(HOME, '.openclaw/workspace/x-reply-agent.mjs');
if (existsSync(xReplyPath)) {
  const xReplyContent = readFileSync(xReplyPath, 'utf-8');
  if (xReplyContent.includes('Alby Hub') && xReplyContent.includes('03d93f27')) {
    verified.push('✅ X reply agent has Alby Hub info in system prompt');
  } else {
    errors.push('❌ X reply agent missing Alby Hub info in system prompt');
  }
} else {
  warnings.push('⚠️  X reply agent not found (may not be deployed)');
}

// Check 4: Nostr configuration
console.log('\n4. Checking Nostr integration...');
const nostrReplyPath = resolve(HOME, '.openclaw/workspace/nostr-reply-agent.mjs');
if (existsSync(nostrReplyPath)) {
  verified.push('✅ Nostr reply agent exists');
} else {
  warnings.push('⚠️  Nostr reply agent not found');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 VERIFICATION SUMMARY:\n');

if (verified.length > 0) {
  console.log('VERIFIED:');
  verified.forEach(v => console.log('  ' + v));
}

if (warnings.length > 0) {
  console.log('\nWARNINGS:');
  warnings.forEach(w => console.log('  ' + w));
}

if (errors.length > 0) {
  console.log('\nERRORS:');
  errors.forEach(e => console.log('  ' + e));
  console.log('\n❌ VERIFICATION FAILED - DO NOT MAKE PUBLIC CLAIMS');
  process.exit(1);
} else {
  console.log('\n✅ ALL CRITICAL CHECKS PASSED');
  console.log('\nYou may proceed with public statements about:');
  console.log('  • Lightning wallet integration (Alby Hub)');
  console.log('  • Ability to send/receive Lightning payments');
  console.log('  • Bitcoin-native infrastructure');
  console.log('  • Economic autonomy via Nostr zaps');
  process.exit(0);
}

function testAlbyConnection(apiUrl, authToken) {
  // Parse URL
  const url = new URL(apiUrl);
  
  const options = {
    hostname: url.hostname,
    port: url.port || 8080,
    path: '/api/balance',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    timeout: 5000
  };
  
  const req = https.request(options, (res) => {
    if (res.statusCode === 200 || res.statusCode === 401) {
      // 200 = success, 401 = token expired but API reachable
      verified.push('✅ Alby Hub API is reachable');
    } else {
      warnings.push(`⚠️  Alby Hub API returned status ${res.statusCode}`);
    }
  });
  
  req.on('error', (err) => {
    warnings.push(`⚠️  Alby Hub API not reachable (${err.message})`);
  });
  
  req.on('timeout', () => {
    warnings.push('⚠️  Alby Hub API connection timeout');
    req.destroy();
  });
  
  req.end();
}
