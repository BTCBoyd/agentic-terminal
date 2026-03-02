#!/usr/bin/env node
/**
 * Agentic Terminal - Data Validation Script
 * 
 * Validates the integrity of metrics-history.json
 * Checks for: nulls in critical fields, valid dates, schema compliance
 */

import { readFile } from 'fs/promises';

const CONFIG = {
  historyFile: '/home/futurebit/.openclaw/workspace/agentic-terminal-data/metrics-history.json'
};

const CRITICAL_FIELDS = [
  'week_start',
  'week_end', 
  'snapshot_date',
  'metrics.bitcoin_lightning.l402_github_stars',
  'metrics.bitcoin_lightning.lightning_nodes',
  'metrics.bitcoin_lightning.lightning_channels',
  'metrics.bitcoin_lightning.lightning_capacity_btc',
  'metrics.stablecoin_api_rails.x402_github_stars',
  'metrics.stablecoin_api_rails.erc8004_agents_registered',
  'metrics.emerging_protocols.ark_github_stars'
];

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => 
    current && current[key] !== undefined ? current[key] : undefined, obj
  );
}

function validateDate(dateStr, fieldName) {
  if (!dateStr) {
    return { valid: false, error: `${fieldName} is missing` };
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { valid: false, error: `${fieldName} has invalid date format: ${dateStr}` };
  }
  return { valid: true };
}

async function validate() {
  console.log('=== Agentic Terminal Data Validation ===\n');
  
  try {
    const content = await readFile(CONFIG.historyFile, 'utf8');
    const data = JSON.parse(content);
    
    let errors = [];
    let warnings = [];
    
    // Check schema version
    if (!data.schema_version) {
      errors.push('Missing schema_version');
    }
    
    // Check weeks array
    if (!Array.isArray(data.weeks)) {
      errors.push('weeks is not an array');
    } else {
      console.log(`✓ Found ${data.weeks.length} weeks of data`);
      
      // Check for at least 8 weeks
      if (data.weeks.length < 8) {
        warnings.push(`Only ${data.weeks.length} weeks found (target: 8+)`);
      } else {
        console.log(`✓ Meets minimum 8 weeks requirement`);
      }
      
      // Validate each week
      data.weeks.forEach((week, index) => {
        const weekLabel = `Week ${index + 1} (${week.week_start || 'unknown'})`;
        
        // Check critical fields
        CRITICAL_FIELDS.forEach(field => {
          const value = getNestedValue(week, field);
          if (value === null || value === undefined) {
            errors.push(`${weekLabel}: ${field} is null or undefined`);
          }
        });
        
        // Validate dates
        const dateFields = ['week_start', 'week_end', 'snapshot_date'];
        dateFields.forEach(field => {
          const result = validateDate(week[field], `${weekLabel}.${field}`);
          if (!result.valid) {
            errors.push(result.error);
          }
        });
        
        // Check numeric ranges
        const lnNodes = week.metrics?.bitcoin_lightning?.lightning_nodes;
        if (lnNodes !== undefined && (lnNodes < 1000 || lnNodes > 1000000)) {
          warnings.push(`${weekLabel}: Lightning nodes value ${lnNodes} seems unusual`);
        }
        
        const lnCapacity = week.metrics?.bitcoin_lightning?.lightning_capacity_btc;
        if (lnCapacity !== undefined && (lnCapacity < 100 || lnCapacity > 10000)) {
          warnings.push(`${weekLabel}: Lightning capacity ${lnCapacity} BTC seems unusual`);
        }
        
        // Check WoW changes are calculated
        if (!week.wow_changes) {
          warnings.push(`${weekLabel}: Missing wow_changes`);
        }
      });
      
      // Check chronological order
      const sortedWeeks = [...data.weeks].sort((a, b) => 
        new Date(a.week_start) - new Date(b.week_start)
      );
      const isChronological = data.weeks.every((week, index) => 
        week.week_start === sortedWeeks[index].week_start
      );
      if (!isChronological) {
        warnings.push('Weeks are not in chronological order');
      } else {
        console.log('✓ Weeks are in chronological order');
      }
      
      // Check for duplicate week_starts
      const weekStarts = data.weeks.map(w => w.week_start);
      const duplicates = weekStarts.filter((item, index) => weekStarts.indexOf(item) !== index);
      if (duplicates.length > 0) {
        errors.push(`Duplicate week_start values found: ${duplicates.join(', ')}`);
      } else {
        console.log('✓ No duplicate weeks found');
      }
    }
    
    // Check metadata
    if (data.metadata) {
      console.log(`\nMetadata:`);
      console.log(`  - Total weeks: ${data.metadata.total_weeks}`);
      console.log(`  - Verified data weeks: ${data.metadata.weeks_with_verified_data}`);
      console.log(`  - Earliest: ${data.metadata.earliest_week}`);
      console.log(`  - Latest: ${data.metadata.latest_week}`);
      console.log(`  - Last updated: ${data.last_updated}`);
    }
    
    // Print results
    console.log('\n=== Validation Results ===');
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ ALL CHECKS PASSED');
      return 0;
    }
    
    if (warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
      warnings.forEach(w => console.log(`  - ${w}`));
    }
    
    if (errors.length > 0) {
      console.log(`\n❌ ERRORS (${errors.length}):`);
      errors.forEach(e => console.log(`  - ${e}`));
      return 1;
    }
    
    return 0;
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    return 1;
  }
}

validate().then(code => process.exit(code));
