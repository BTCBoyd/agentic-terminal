#!/usr/bin/env node
/**
 * Remove fake ERC-8004 data immediately
 * Replaces 24500 with null and marks as pending
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const METRICS_FILE = resolve(process.env.HOME, '.openclaw/workspace/agenticterminal-website/agentic-terminal-data/metrics-history.json');

console.log('🔧 Removing fake ERC-8004 data...\n');

const data = JSON.parse(readFileSync(METRICS_FILE, 'utf-8'));

let fixedCount = 0;

data.weeks.forEach((week, index) => {
  const sar = week.metrics?.stablecoin_api_rails;
  if (sar && sar.erc8004_agents_registered === 24500) {
    sar.erc8004_agents_registered = null;
    sar.erc8004_data_quality = 'pending_implementation';
    sar.erc8004_note = 'Real on-chain query via Dune - implementing by March 16';
    fixedCount++;
    console.log(`Week ${index + 1} (${week.week_start}): Fixed`);
  }
});

writeFileSync(METRICS_FILE, JSON.stringify(data, null, 2));

console.log(`\n✅ Fixed ${fixedCount} weeks`);
console.log('📊 ERC-8004 now shows: null (pending real data)');
console.log('🎯 Target: Real Dune query by March 16, 2026');
