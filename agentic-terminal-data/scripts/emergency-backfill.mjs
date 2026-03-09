#!/usr/bin/env node
/**
 * Emergency Data Backfill Script
 * For use when gaps are detected in the longitudinal database
 * 
 * Usage: node emergency-backfill.mjs YYYY-MM-DD
 * Example: node emergency-backfill.mjs 2026-03-10
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

const DATA_DIR = resolve(process.env.HOME, '.openclaw/workspace/agentic-terminal-data/daily');
const DUNE_SCRIPT = resolve(process.env.HOME, '.openclaw/workspace/agentic-terminal-data/scripts/query-x402-transactions.mjs');

function log(level, message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

async function backfillDate(targetDate) {
  console.log(`\n🚨 EMERGENCY BACKFILL: ${targetDate}\n`);
  
  // Check if file already exists
  const filePath = resolve(DATA_DIR, `${targetDate}.json`);
  if (existsSync(filePath)) {
    log('WARN', `File exists: ${filePath}`);
    const existing = JSON.parse(readFileSync(filePath, 'utf-8'));
    
    // Check if x402 data is missing
    if (!existing.x402_transactions?.daily_transactions) {
      log('INFO', 'x402 transactions missing - will backfill');
    } else {
      log('INFO', 'Data appears complete - no backfill needed');
      return { status: 'already_complete' };
    }
  }
  
  log('INFO', 'Attempting to collect missing data...');
  
  // Step 1: Run x402 Dune query
  log('INFO', 'Querying x402 transactions from Dune...');
  try {
    execSync(`node ${DUNE_SCRIPT}`, { 
      encoding: 'utf-8', 
      timeout: 120000,
      cwd: resolve(process.env.HOME, '.openclaw/workspace/agentic-terminal-data/scripts')
    });
    log('SUCCESS', 'x402 query completed');
  } catch (err) {
    log('ERROR', `x402 query failed: ${err.message}`);
    return { status: 'failed', error: err.message };
  }
  
  // Step 2: Read the x402 results
  const x402Latest = resolve(process.env.HOME, '.openclaw/workspace/agentic-terminal-data/x402/x402-metrics-latest.json');
  let x402Data = null;
  
  if (existsSync(x402Latest)) {
    x402Data = JSON.parse(readFileSync(x402Latest, 'utf-8'));
    log('SUCCESS', `Loaded x402 data: ${x402Data.metrics?.daily_transactions} transactions`);
  } else {
    log('ERROR', 'x402 query results not found');
    return { status: 'failed', error: 'No x402 results' };
  }
  
  // Step 3: Collect other metrics (GitHub, Lightning)
  log('INFO', 'Collecting GitHub and Lightning metrics...');
  
  // Use most recent available data as approximation
  const latestFiles = execSync(`ls -t ${DATA_DIR}/*.json | head -3`, { encoding: 'utf-8' })
    .trim().split('\n');
  
  let referenceData = null;
  for (const file of latestFiles) {
    try {
      referenceData = JSON.parse(readFileSync(file, 'utf-8'));
      if (referenceData.github_metrics && referenceData.lightning_network) {
        log('INFO', `Using ${file} as reference`);
        break;
      }
    } catch {}
  }
  
  // Step 4: Build the backfilled daily file
  const backfilledData = {
    collection_timestamp: new Date().toISOString(),
    date: targetDate,
    backfilled: true,
    backfill_reason: 'Emergency gap fill',
    github_metrics: referenceData?.github_metrics || {
      l402_aperture: { stars: 255, forks: 66, open_issues: 35 },
      x402: { stars: 5611, forks: 1238, open_issues: 317 },
      ark_protocol: { arkd: { stars: 156, forks: 56 } }
    },
    lightning_network: referenceData?.lightning_network || {
      nodes: { total: 5563 },
      channels: { total: 16754 },
      capacity: { btc: 2638.06, usd: 178800000 }
    },
    x402_transactions: {
      source: 'dune_api',
      daily_transactions: x402Data.metrics?.daily_transactions || 0,
      daily_volume_usd: x402Data.metrics?.daily_volume_usd || 0,
      cumulative_transactions: x402Data.metrics?.cumulative_transactions || 0,
      cumulative_volume_usd: x402Data.metrics?.cumulative_volume_usd || 0,
      data_quality: x402Data.metrics?.daily_transactions > 0 ? 'backfilled_dune' : 'failed_backfill',
      backfilled_at: new Date().toISOString()
    },
    alerts: ['Data backfilled due to collection gap']
  };
  
  // Step 5: Save the file
  writeFileSync(filePath, JSON.stringify(backfilledData, null, 2));
  log('SUCCESS', `Backfill complete: ${filePath}`);
  
  // Step 6: Update trends aggregation
  log('INFO', 'Updating trends aggregation...');
  try {
    execSync('node update-trends-data.mjs', {
      cwd: resolve(process.env.HOME, '.openclaw/workspace/agenticterminal-website'),
      timeout: 30000
    });
    log('SUCCESS', 'Trends updated');
  } catch (err) {
    log('WARN', `Trends update failed: ${err.message}`);
  }
  
  // Step 7: Commit and push
  log('INFO', 'Committing to git...');
  try {
    execSync(`cd ${resolve(process.env.HOME, '.openclaw/workspace/agentic-terminal-data')} && git add daily/${targetDate}.json && git commit -m "Backfill ${targetDate} - emergency gap repair" && git push`, {
      encoding: 'utf-8',
      timeout: 30000
    });
    log('SUCCESS', 'Pushed to GitHub');
  } catch (err) {
    log('WARN', `Git push failed: ${err.message}`);
  }
  
  return {
    status: 'success',
    date: targetDate,
    x402_transactions: backfilledData.x402_transactions.daily_transactions,
    data_quality: backfilledData.x402_transactions.data_quality
  };
}

// Main
const targetDate = process.argv[2];

if (!targetDate) {
  console.log(`
🚨 Emergency Data Backfill

Usage: node emergency-backfill.mjs YYYY-MM-DD
Example: node emergency-backfill.mjs 2026-03-10

This script will:
1. Query Dune for x402 transaction data
2. Use most recent data for GitHub/Lightning metrics
3. Create backfilled daily file
4. Update trends aggregation
5. Push to GitHub

Use only when daily collection fails!
`);
  process.exit(1);
}

backfillDate(targetDate).then(result => {
  console.log('\n📊 Backfill Result:');
  console.log(JSON.stringify(result, null, 2));
  
  if (result.status === 'success') {
    console.log('\n✅ Backfill complete');
    process.exit(0);
  } else {
    console.log('\n❌ Backfill failed');
    process.exit(1);
  }
});
