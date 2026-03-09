#!/usr/bin/env node
/**
 * Cron Job Dashboard Audit
 * Run this to get a comprehensive view of all cron jobs and their status
 */

import { execSync } from 'child_process';

console.log('=== CRON JOB AUDIT ===\n');

try {
  const result = execSync('openclaw cron list --include-disabled', { encoding: 'utf-8' });
  console.log(result);
} catch (err) {
  console.error('Failed to get cron list:', err.message);
}

console.log('\n=== SUMMARY ===');
console.log('Run: openclaw cron list --include-disabled | grep -E "(name|enabled|lastStatus|lastError)"');
