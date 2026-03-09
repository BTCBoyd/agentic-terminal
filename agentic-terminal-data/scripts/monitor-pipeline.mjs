#!/usr/bin/env node
/**
 * AT Data Pipeline Monitor
 * Validates that all data sources are flowing correctly
 * Runs daily and alerts if any issues detected
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const DATA_DIR = resolve(process.env.HOME, '.openclaw/workspace/agentic-terminal-data');
const WEBSITE_DIR = resolve(process.env.HOME, '.openclaw/workspace/agenticterminal-website');

function log(level, message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

function checkDailyData() {
  const today = new Date().toISOString().split('T')[0];
  const dailyFile = resolve(DATA_DIR, 'daily', `${today}.json`);
  
  if (!existsSync(dailyFile)) {
    log('ERROR', `Missing daily data file: ${dailyFile}`);
    return { ok: false, issue: 'Missing daily data file' };
  }
  
  const data = JSON.parse(readFileSync(dailyFile, 'utf-8'));
  const checks = [];
  
  // Check Lightning data
  if (!data.lightning_network?.nodes?.total) {
    checks.push('Missing Lightning node count');
  }
  
  // Check GitHub metrics
  if (!data.github_metrics?.l402_aperture?.stars) {
    checks.push('Missing L402 GitHub stars');
  }
  if (!data.github_metrics?.x402?.stars) {
    checks.push('Missing x402 GitHub stars');
  }
  
  // Check x402 transactions (critical for data play)
  if (!data.x402_transactions?.daily_transactions) {
    checks.push('Missing x402 daily transactions (CRITICAL)');
  }
  
  if (checks.length > 0) {
    log('ERROR', `Daily data incomplete: ${checks.join(', ')}`);
    return { ok: false, issues: checks };
  }
  
  log('OK', `Daily data complete. x402: ${data.x402_transactions.daily_transactions} tx/day`);
  return { ok: true, data: data };
}

function checkTrendsData() {
  const trendsFile = resolve(WEBSITE_DIR, 'agentic-terminal-data/metrics-history.json');
  
  if (!existsSync(trendsFile)) {
    log('ERROR', 'Missing trends data file');
    return { ok: false, issue: 'Missing trends file' };
  }
  
  const data = JSON.parse(readFileSync(trendsFile, 'utf-8'));
  const lastUpdated = new Date(data.last_updated);
  const hoursAgo = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
  
  if (hoursAgo > 26) {
    log('ERROR', `Trends data stale: ${hoursAgo.toFixed(1)} hours old`);
    return { ok: false, issue: `Stale data: ${hoursAgo.toFixed(1)}h old` };
  }
  
  const latestWeek = data.weeks[data.weeks.length - 1];
  const x402Tx = latestWeek?.metrics?.stablecoin_api_rails?.x402_daily_transactions;
  
  if (!x402Tx || x402Tx === 0) {
    log('ERROR', `x402 transactions showing 0 in trends data`);
    return { ok: false, issue: 'x402 transactions zero/undefined' };
  }
  
  log('OK', `Trends data fresh (${hoursAgo.toFixed(1)}h). x402: ${x402Tx} tx/day`);
  return { ok: true, x402Tx };
}

function checkCharts() {
  const today = new Date().toISOString().split('T')[0];
  const chartsDir = resolve(WEBSITE_DIR, 'agentic-terminal-data/charts', today);
  
  if (!existsSync(chartsDir)) {
    log('ERROR', `Missing charts directory: ${chartsDir}`);
    return { ok: false, issue: 'Charts not generated' };
  }
  
  const requiredCharts = [
    'cross-protocol-comparison.png',
    'interest-usage-gap.png'
  ];
  
  const missing = requiredCharts.filter(f => !existsSync(resolve(chartsDir, f)));
  
  if (missing.length > 0) {
    log('ERROR', `Missing charts: ${missing.join(', ')}`);
    return { ok: false, issue: `Missing: ${missing.join(', ')}` };
  }
  
  log('OK', 'All chart images present');
  return { ok: true };
}

async function verifyWebsiteLive() {
  try {
    const response = await fetch('https://agenticterminal.ai/trends');
    if (!response.ok) {
      log('ERROR', `Website returned ${response.status}`);
      return { ok: false, issue: `HTTP ${response.status}` };
    }
    
    const html = await response.text();
    const hasTimestamp = html.includes('Last updated');
    
    if (!hasTimestamp) {
      log('ERROR', 'Website missing last updated timestamp');
      return { ok: false, issue: 'Missing timestamp' };
    }
    
    log('OK', 'Website live and responding');
    return { ok: true };
  } catch (err) {
    log('ERROR', `Website check failed: ${err.message}`);
    return { ok: false, issue: err.message };
  }
}

async function main() {
  console.log('\n=== AT Data Pipeline Monitor ===\n');
  
  const results = {
    daily: checkDailyData(),
    trends: checkTrendsData(),
    charts: checkCharts(),
    website: await verifyWebsiteLive()
  };
  
  const allOk = Object.values(results).every(r => r.ok);
  
  console.log('\n=== Summary ===');
  console.log(`Daily Data: ${results.daily.ok ? '✅' : '❌'}`);
  console.log(`Trends Data: ${results.trends.ok ? '✅' : '❌'}`);
  console.log(`Charts: ${results.charts.ok ? '✅' : '❌'}`);
  console.log(`Website: ${results.website.ok ? '✅' : '❌'}`);
  console.log(`\nOverall: ${allOk ? '✅ ALL SYSTEMS GO' : '❌ ISSUES DETECTED'}`);
  
  if (!allOk) {
    process.exit(1);
  }
}

main();
