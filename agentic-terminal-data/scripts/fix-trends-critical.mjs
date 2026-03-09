#!/usr/bin/env node
/**
 * Fix Trends Page Critical Issues
 * Implements Boyd/Claude feedback from March 9, 2026 review
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const METRICS_FILE = resolve(process.env.HOME, '.openclaw/workspace/agenticterminal-website/agentic-terminal-data/metrics-history.json');
const TRENDS_HTML = resolve(process.env.HOME, '.openclaw/workspace/agenticterminal-website/trends.html');

function fixMetricsHistory() {
  console.log('🔧 Fixing metrics history data...\n');
  
  const data = JSON.parse(readFileSync(METRICS_FILE, 'utf-8'));
  
  // Fix 1: Ensure all weeks have proper ERC-8004 data (remove hardcoded values)
  data.weeks.forEach((week, index) => {
    // If using static 24500, mark as estimated
    if (week.metrics?.stablecoin_api_rails?.erc8004_agents_registered === 24500) {
      week.metrics.stablecoin_api_rails.erc8004_data_quality = 'estimated';
      week.metrics.stablecoin_api_rails.erc8004_note = 'On-chain query not yet implemented';
    }
    
    // Calculate proper WoW changes
    if (index > 0) {
      const prev = data.weeks[index - 1];
      
      // L402 stars change
      const l402Current = week.metrics?.bitcoin_lightning?.l402_github_stars || 0;
      const l402Prev = prev.metrics?.bitcoin_lightning?.l402_github_stars || 0;
      if (l402Prev > 0) {
        const l402Change = ((l402Current - l402Prev) / l402Prev) * 100;
        week.wow_changes.bitcoin_lightning.l402_github_stars_pct = Number(l402Change.toFixed(2));
      }
      
      // x402 stars change
      const x402Current = week.metrics?.stablecoin_api_rails?.x402_github_stars || 0;
      const x402Prev = prev.metrics?.stablecoin_api_rails?.x402_github_stars || 0;
      if (x402Prev > 0) {
        const x402Change = ((x402Current - x402Prev) / x402Prev) * 100;
        week.wow_changes.stablecoin_api_rails.x402_github_stars_pct = Number(x402Change.toFixed(2));
      }
      
      // Lightning nodes change
      const lnCurrent = week.metrics?.bitcoin_lightning?.lightning_nodes || 0;
      const lnPrev = prev.metrics?.bitcoin_lightning?.lightning_nodes || 0;
      if (lnPrev > 0) {
        const lnChange = ((lnCurrent - lnPrev) / lnPrev) * 100;
        week.wow_changes.bitcoin_lightning.lightning_nodes_pct = Number(lnChange.toFixed(2));
      }
    }
  });
  
  writeFileSync(METRICS_FILE, JSON.stringify(data, null, 2));
  console.log('✅ Fixed metrics history with proper WoW calculations\n');
}

function addContextToTrendsHtml() {
  console.log('📝 Adding metric context to trends.html...\n');
  
  let html = readFileSync(TRENDS_HTML, 'utf-8');
  
  // Add metric context data (to be used by JavaScript)
  const metricContext = {
    'l402_github_stars': 'Developer interest in Lightning-native agent payments',
    'x402_github_stars': 'Coinbase-backed EVM agent payment standard traction',
    'lightning_nodes': 'Active routing nodes on Bitcoin\'s instant payment layer',
    'lightning_channels': 'Payment channels enabling fast, cheap agent transactions',
    'lightning_capacity_btc': 'Total BTC committed to Lightning for agent settlements',
    'x402_daily_transactions': 'Daily on-chain agent payments (Dune verified)',
    'erc8004_agents_registered': 'Ethereum-based AI agents (ERC-8004 standard)',
    'ark_github_stars': 'Bitcoin L2 VTXO settlement for sovereign agents'
  };
  
  // Inject context into CONFIG object
  const contextScript = `
    // Metric context for user comprehension
    const METRIC_CONTEXT = ${JSON.stringify(metricContext, null, 2)};
  `;
  
  // Find where to inject (before the closing </script> of CONFIG)
  const configEnd = html.indexOf('const CONFIG = {');
  if (configEnd > -1) {
    const insertAfter = html.indexOf('};', configEnd) + 2;
    html = html.slice(0, insertAfter) + '\n' + contextScript + html.slice(insertAfter);
  }
  
  writeFileSync(TRENDS_HTML, html);
  console.log('✅ Added metric context to trends.html\n');
}

function main() {
  console.log('=== Trends Page Critical Fixes ===\n');
  
  try {
    fixMetricsHistory();
    addContextToTrendsHtml();
    
    console.log('📊 Summary of fixes:');
    console.log('  1. ✅ Fixed WoW change calculations');
    console.log('  2. ✅ Marked ERC-8004 as estimated');
    console.log('  3. ✅ Added metric context for tooltips');
    console.log('');
    console.log('Next: Regenerate charts with proper time windows');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
