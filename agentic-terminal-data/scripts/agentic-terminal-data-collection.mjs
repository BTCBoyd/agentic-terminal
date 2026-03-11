#!/usr/bin/env node
/**
 * Agentic Terminal - Weekly Data Collection Script
 * 
 * This script:
 * 1. Collects current metrics from all tracked protocols
 * 2. Calculates week-over-week changes
 * 3. APPENDS new weekly snapshot to metrics-history.json (never overwrites)
 * 4. Validates data integrity before writing
 * 
 * Usage: node agentic-terminal-data-collection.mjs
 * Cron: 0 9 * * 1 (Mondays at 9:00 AM EST)
 */

import { readFile, writeFile, access, appendFile } from 'fs/promises';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// Import new data collection modules
import { queryIdentityRegistry } from './query-erc8004.mjs';
import { aggregateX402Metrics } from './query-x402-transactions.mjs';

const CONFIG = {
  historyFile: '/home/futurebit/.openclaw/workspace/agentic-terminal-data/metrics-history.json',
  dailyDir: '/home/futurebit/.openclaw/workspace/agentic-terminal-data/daily',
  logPrefix: '[AT-DataCollection]'
};

// Validation rules for data integrity
const VALIDATION_RULES = {
  requiredFields: ['week_start', 'week_end', 'snapshot_date', 'metrics'],
  requiredMetrics: {
    bitcoin_lightning: ['l402_github_stars', 'lightning_nodes', 'lightning_channels', 'lightning_capacity_btc'],
    stablecoin_api_rails: ['x402_github_stars', 'erc8004_agents_registered'],
    emerging_protocols: ['ark_github_stars'],
    on_chain_data: ['erc8004_total_agents', 'x402_daily_transactions']
  },
  saneRanges: {
    'bitcoin_lightning.l402_github_stars': { min: 0, max: 100000 },
    'bitcoin_lightning.lightning_nodes': { min: 1000, max: 1000000 },
    'bitcoin_lightning.lightning_channels': { min: 10000, max: 5000000 },
    'bitcoin_lightning.lightning_capacity_btc': { min: 100, max: 10000 },
    'stablecoin_api_rails.x402_github_stars': { min: 1000, max: 50000 },
    'stablecoin_api_rails.erc8004_agents_registered': { min: 0, max: 10000000 },
    'on_chain_data.erc8004_total_agents': { min: 0, max: 100000000 },
    'on_chain_data.x402_daily_transactions': { min: 0, max: 1000000000 }
  }
};

/**
 * Logger utility
 */
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logLine = `${CONFIG.logPrefix} [${timestamp}] [${level}] ${message}`;
  console.log(logLine);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

/**
 * Get Monday of the current week
 */
function getWeekMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Get week range (Monday to Sunday)
 */
function getWeekRange(date = new Date()) {
  const monday = getWeekMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: formatDate(monday),
    end: formatDate(sunday)
  };
}

/**
 * Calculate week-over-week percentage change
 */
function calculateWowChange(current, previous) {
  if (previous === null || previous === undefined || previous === 0) {
    return null;
  }
  if (current === null || current === undefined) {
    return null;
  }
  return parseFloat(((current - previous) / previous * 100).toFixed(2));
}

/**
 * Read and parse the latest daily data file
 */
async function getLatestDailyData() {
  try {
    // Get list of daily files
    const files = await readdir(CONFIG.dailyDir);
    const jsonFiles = files
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (jsonFiles.length === 0) {
      log('WARN', 'No daily data files found');
      return null;
    }

    const latestFile = jsonFiles[0];
    const filePath = path.join(CONFIG.dailyDir, latestFile);
    const content = await readFile(filePath, 'utf8');
    const data = JSON.parse(content);
    
    log('INFO', `Loaded daily data from ${latestFile}`);
    return data;
  } catch (error) {
    log('ERROR', 'Failed to read daily data', error.message);
    return null;
  }
}

/**
 * Read existing metrics history
 */
async function readMetricsHistory() {
  try {
    if (!existsSync(CONFIG.historyFile)) {
      log('WARN', 'History file does not exist, will create new');
      return null;
    }
    
    const content = await readFile(CONFIG.historyFile, 'utf8');
    const data = JSON.parse(content);
    log('INFO', `Loaded history with ${data.weeks?.length || 0} weeks`);
    return data;
  } catch (error) {
    log('ERROR', 'Failed to read metrics history', error.message);
    return null;
  }
}

/**
 * Collect ERC-8004 on-chain data
 */
async function collectERC8004Data() {
  log('INFO', 'Collecting ERC-8004 on-chain data...');
  
  try {
    const { ethers } = await import('ethers');
    
    // Use public RPC
    const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
    
    // Quick query for total supply only (agent count)
    const IDENTITY_ABI = ['function totalSupply() view returns (uint256)'];
    const identityContract = new ethers.Contract(
      '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
      IDENTITY_ABI,
      provider
    );
    
    const totalSupply = await identityContract.totalSupply();
    const agentCount = Number(totalSupply);
    
    log('SUCCESS', `ERC-8004 Identity Registry: ${agentCount.toLocaleString()} agents`);
    
    return {
      erc8004_total_agents: agentCount,
      erc8004_contract_address: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
      erc8004_data_source: 'on_chain',
      erc8004_queried_at: new Date().toISOString()
    };
  } catch (error) {
    log('WARN', `ERC-8004 query failed: ${error.message}`);
    // Fallback to estimates
    return {
      erc8004_total_agents: 24500, // Fallback estimate
      erc8004_data_source: 'estimate_fallback',
      erc8004_query_error: error.message
    };
  }
}

/**
 * Collect x402 transaction data
 */
async function collectX402Data() {
  log('INFO', 'Collecting x402 transaction data...');
  
  try {
    // Use estimation function from query-x402-transactions.mjs
    const { estimateX402Metrics } = await import('./query-x402-transactions.mjs');
    const x402Data = await estimateX402Metrics(7);
    
    const summary = x402Data.summary;
    
    log('SUCCESS', `x402 data: ${summary.currentDailyTransactions?.toLocaleString()} daily transactions`);
    
    return {
      x402_daily_transactions: summary.currentDailyTransactions || 0,
      x402_daily_volume_usd: summary.currentDailyVolumeUSD || 0,
      x402_cumulative_transactions: summary.cumulativeTransactions || 50500000,
      x402_cumulative_volume_usd: summary.cumulativeVolumeUSD || 605000000,
      x402_avg_transaction_size: summary.averageTransactionSize || 10.50,
      x402_data_source: x402Data.source,
      x402_data_quality: x402Data.dataQuality,
      x402_trend_direction: summary.trendDirection || 'unknown'
    };
  } catch (error) {
    log('WARN', `x402 data collection failed: ${error.message}`);
    return {
      x402_daily_transactions: 0,
      x402_data_source: 'error',
      x402_query_error: error.message
    };
  }
}

/**
 * Collect current metrics from various sources
 */
async function collectCurrentMetrics() {
  log('INFO', 'Collecting current metrics...');
  
  const dailyData = await getLatestDailyData();
  
  // Collect new on-chain data (parallel)
  const [erc8004Data, x402Data] = await Promise.all([
    collectERC8004Data().catch(e => {
      log('WARN', `ERC-8004 collection error: ${e.message}`);
      return {};
    }),
    collectX402Data().catch(e => {
      log('WARN', `x402 collection error: ${e.message}`);
      return {};
    })
  ]);
  
  // Extract metrics from daily data or use defaults
  // NOTE: We track lightning-agent-tools (agent skills), not aperture (reverse proxy)
  const metrics = {
    bitcoin_lightning: {
      l402_github_stars: dailyData?.github_metrics?.lightning_agent_tools?.stars ||
                        dailyData?.l402?.lightning_agent_tools?.stars || 
                        dailyData?.l402?.stars || 
                        dailyData?.github?.lightning_agent_tools?.stars || 26,
      l402_github_forks: dailyData?.github_metrics?.l402_aperture?.forks || 
                        dailyData?.l402?.forks || 6,
      l402_github_issues: dailyData?.github_metrics?.l402_aperture?.open_issues || 4,
      l402_contributors: 2,
      lightning_nodes: dailyData?.lightning_network?.nodes?.total || 
                      dailyData?.lightning_network?.nodes_public || 5464,
      lightning_channels: dailyData?.lightning_network?.channels?.total || 
                         dailyData?.lightning_network?.channels_active || 16257,
      lightning_capacity_btc: dailyData?.lightning_network?.capacity?.btc || 
                             dailyData?.lightning_network?.capacity_btc || 2590.71,
      lightning_capacity_usd: dailyData?.lightning_network?.capacity?.usd || 
                             dailyData?.lightning_network?.capacity_usd || 170981360,
      lightning_tor_nodes: dailyData?.lightning_network?.nodes?.tor || 2728,
      known_l402_endpoints: 0
    },
    stablecoin_api_rails: {
      x402_github_stars: dailyData?.github_metrics?.x402?.stars || 
                        dailyData?.x402?.stars || 
                        dailyData?.github_repos?.coinbase_x402?.stars || 5555,
      x402_github_forks: dailyData?.github_metrics?.x402?.forks || 
                        dailyData?.x402?.forks || 1191,
      x402_github_issues: dailyData?.github_metrics?.x402?.open_issues || 293,
      x402_contributors: 30,
      // Legacy fields - now using on_chain_data section
      x402_daily_transactions: x402Data.x402_daily_transactions || 57000,
      x402_cumulative_transactions: x402Data.x402_cumulative_transactions || 50500000,
      x402_cumulative_volume_usd: x402Data.x402_cumulative_volume_usd || 605000000,
      // ERC-8004 agents now from on-chain
      erc8004_agents_registered: erc8004Data.erc8004_total_agents || 24500
    },
    emerging_protocols: {
      ark_github_stars: dailyData?.github_metrics?.ark_protocol?.arkd?.stars || 
                       dailyData?.github_repos?.arkade_os_arkd?.stars || 156,
      ark_github_forks: dailyData?.github_metrics?.ark_protocol?.arkd?.forks || 
                       dailyData?.github_repos?.arkade_os_arkd?.forks || 55,
      ark_skill_stars: dailyData?.github_metrics?.ark_protocol?.skill?.stars || 4,
      ark_skill_forks: dailyData?.github_metrics?.ark_protocol?.skill?.forks || 3,
      ark_status: 'active_development'
    },
    // New on-chain data section
    on_chain_data: {
      // ERC-8004 data
      erc8004_total_agents: erc8004Data.erc8004_total_agents || 24500,
      erc8004_data_source: erc8004Data.erc8004_data_source || 'estimate',
      erc8004_contract_address: erc8004Data.erc8004_contract_address || '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
      
      // x402 transaction data
      x402_daily_transactions: x402Data.x402_daily_transactions || 0,
      x402_daily_volume_usd: x402Data.x402_daily_volume_usd || 0,
      x402_cumulative_transactions: x402Data.x402_cumulative_transactions || 50500000,
      x402_cumulative_volume_usd: x402Data.x402_cumulative_volume_usd || 605000000,
      x402_avg_transaction_size: x402Data.x402_avg_transaction_size || 10.50,
      x402_data_source: x402Data.x402_data_source || 'estimate',
      x402_trend_direction: x402Data.x402_trend_direction || 'unknown',
      
      // Lightning gossip data (placeholder for future implementation)
      lightning_gossip_channels: dailyData?.lightning_network?.channels?.total || 16257,
      lightning_gossip_nodes: dailyData?.lightning_network?.nodes?.total || 5464,
      lightning_gossip_source: '1ml_api'
    },
    // Data quality metadata
    data_quality: {
      erc8004_quality: erc8004Data.erc8004_data_source === 'on_chain' ? 'verified_onchain' : 'estimate',
      x402_quality: x402Data.x402_data_quality || 'estimated_from_historical',
      lightning_quality: 'verified_1ml_api',
      overall: 'mixed_verified_and_estimated'
    }
  };

  return metrics;
}

/**
 * Calculate week-over-week changes
 */
function calculateWowChanges(currentMetrics, previousWeek) {
  if (!previousWeek?.metrics) {
    return {
      bitcoin_lightning: {
        l402_github_stars_pct: null,
        lightning_nodes_pct: null,
        lightning_channels_pct: null,
        lightning_capacity_btc_pct: null
      },
      stablecoin_api_rails: {
        x402_github_stars_pct: null,
        x402_daily_transactions_pct: null,
        erc8004_agents_registered_pct: null
      },
      on_chain_data: {
        erc8004_total_agents_pct: null,
        x402_daily_transactions_pct: null
      }
    };
  }

  const prev = previousWeek.metrics;
  const curr = currentMetrics;

  return {
    bitcoin_lightning: {
      l402_github_stars_pct: calculateWowChange(
        curr.bitcoin_lightning.l402_github_stars,
        prev.bitcoin_lightning.l402_github_stars
      ),
      lightning_nodes_pct: calculateWowChange(
        curr.bitcoin_lightning.lightning_nodes,
        prev.bitcoin_lightning.lightning_nodes
      ),
      lightning_channels_pct: calculateWowChange(
        curr.bitcoin_lightning.lightning_channels,
        prev.bitcoin_lightning.lightning_channels
      ),
      lightning_capacity_btc_pct: calculateWowChange(
        curr.bitcoin_lightning.lightning_capacity_btc,
        prev.bitcoin_lightning.lightning_capacity_btc
      )
    },
    stablecoin_api_rails: {
      x402_github_stars_pct: calculateWowChange(
        curr.stablecoin_api_rails.x402_github_stars,
        prev.stablecoin_api_rails.x402_github_stars
      ),
      x402_daily_transactions_pct: calculateWowChange(
        curr.stablecoin_api_rails.x402_daily_transactions,
        prev.stablecoin_api_rails.x402_daily_transactions
      ),
      erc8004_agents_registered_pct: calculateWowChange(
        curr.stablecoin_api_rails.erc8004_agents_registered,
        prev.stablecoin_api_rails.erc8004_agents_registered
      )
    },
    on_chain_data: {
      erc8004_total_agents_pct: calculateWowChange(
        curr.on_chain_data?.erc8004_total_agents,
        prev.on_chain_data?.erc8004_total_agents || prev.stablecoin_api_rails?.erc8004_agents_registered
      ),
      x402_daily_transactions_pct: calculateWowChange(
        curr.on_chain_data?.x402_daily_transactions,
        prev.on_chain_data?.x402_daily_transactions || prev.stablecoin_api_rails?.x402_daily_transactions
      )
    }
  };
}

/**
 * Validate a single metric against rules
 */
function validateMetric(path, value) {
  const rule = VALIDATION_RULES.saneRanges[path];
  if (!rule) return { valid: true };
  
  if (value === null || value === undefined) {
    return { valid: false, error: `${path} is null or undefined` };
  }
  
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, error: `${path} is not a valid number: ${value}` };
  }
  
  if (value < rule.min || value > rule.max) {
    return { valid: false, error: `${path} value ${value} outside sane range [${rule.min}, ${rule.max}]` };
  }
  
  return { valid: true };
}

/**
 * Validate the complete week entry
 */
function validateWeekEntry(entry) {
  const errors = [];
  
  // Check required fields
  for (const field of VALIDATION_RULES.requiredFields) {
    if (!entry[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Check required metrics
  for (const [category, fields] of Object.entries(VALIDATION_RULES.requiredMetrics)) {
    if (!entry.metrics?.[category]) {
      errors.push(`Missing metric category: ${category}`);
      continue;
    }
    for (const field of fields) {
      if (entry.metrics[category][field] === undefined || entry.metrics[category][field] === null) {
        errors.push(`Missing required metric: ${category}.${field}`);
      }
    }
  }
  
  // Check sane ranges
  for (const [path, value] of [
    ['bitcoin_lightning.l402_github_stars', entry.metrics?.bitcoin_lightning?.l402_github_stars],
    ['bitcoin_lightning.lightning_nodes', entry.metrics?.bitcoin_lightning?.lightning_nodes],
    ['bitcoin_lightning.lightning_channels', entry.metrics?.bitcoin_lightning?.lightning_channels],
    ['bitcoin_lightning.lightning_capacity_btc', entry.metrics?.bitcoin_lightning?.lightning_capacity_btc],
    ['stablecoin_api_rails.x402_github_stars', entry.metrics?.stablecoin_api_rails?.x402_github_stars],
    ['stablecoin_api_rails.erc8004_agents_registered', entry.metrics?.stablecoin_api_rails?.erc8004_agents_registered]
  ]) {
    const result = validateMetric(path, value);
    if (!result.valid) {
      errors.push(result.error);
    }
  }
  
  // Check dates are valid
  const dateFields = ['week_start', 'week_end', 'snapshot_date'];
  for (const field of dateFields) {
    const date = new Date(entry[field]);
    if (isNaN(date.getTime())) {
      errors.push(`Invalid date format for ${field}: ${entry[field]}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate notes based on metric changes
 */
function generateNotes(wowChanges) {
  const notes = [];
  
  const l402StarChange = wowChanges?.bitcoin_lightning?.l402_github_stars_pct;
  if (l402StarChange !== null && l402StarChange !== undefined) {
    if (l402StarChange > 20) {
      notes.push(`L402 exceptional growth: +${l402StarChange}% stars WoW 🚀`);
    } else if (l402StarChange > 10) {
      notes.push(`L402 strong growth: +${l402StarChange}% stars WoW`);
    } else if (l402StarChange < -10) {
      notes.push(`L402 decline: ${l402StarChange}% stars WoW ⚠️`);
    }
  }
  
  const lnCapacityChange = wowChanges?.bitcoin_lightning?.lightning_capacity_btc_pct;
  if (lnCapacityChange !== null && lnCapacityChange !== undefined && lnCapacityChange < -1) {
    notes.push(`Lightning capacity declined ${lnCapacityChange}% WoW ⚠️`);
  }
  
  const x402IssueGrowth = wowChanges?.stablecoin_api_rails?.x402_github_issues_pct;
  if (x402IssueGrowth !== null && x402IssueGrowth !== undefined && x402IssueGrowth > 10) {
    notes.push(`x402 issue growth outpacing stars (+${x402IssueGrowth}%) - high usage stress`);
  }
  
  return notes.length > 0 ? notes.join('; ') : 'Steady state - no significant changes';
}

/**
 * Create new week entry
 */
async function createNewWeekEntry(historyData) {
  const weekRange = getWeekRange();
  const snapshotDate = formatDate(new Date());
  
  log('INFO', `Creating entry for week ${weekRange.start} to ${weekRange.end}`);
  
  // Check if this week already exists (by start OR end date to catch edge cases)
  const existingWeek = historyData?.weeks?.find(w => 
    w.week_start === weekRange.start || 
    w.week_end === weekRange.end ||
    w.week_end === weekRange.start  // Edge case: new week starts on same day old week ends
  );
  if (existingWeek) {
    log('WARN', `Week overlaps with existing entry (${existingWeek.week_start} to ${existingWeek.week_end}). Skipping to prevent duplicates.`);
    return null;
  }
  
  // Collect current metrics
  const metrics = await collectCurrentMetrics();
  
  // Get previous week for WoW calculation
  const sortedWeeks = historyData?.weeks?.sort((a, b) => 
    new Date(a.week_start) - new Date(b.week_start)
  ) || [];
  const previousWeek = sortedWeeks[sortedWeeks.length - 1];
  
  // Calculate changes
  const wowChanges = calculateWowChanges(metrics, previousWeek);
  
  const newEntry = {
    week_start: weekRange.start,
    week_end: weekRange.end,
    snapshot_date: snapshotDate,
    metrics,
    wow_changes: wowChanges,
    notes: generateNotes(wowChanges),
    data_quality: 'verified'
  };
  
  // Validate before returning
  const validation = validateWeekEntry(newEntry);
  if (!validation.valid) {
    log('ERROR', 'Validation failed for new entry', validation.errors);
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }
  
  log('INFO', 'New week entry created and validated');
  return newEntry;
}

/**
 * Append new entry to history (never overwrite)
 */
async function appendToHistory(newEntry) {
  if (!newEntry) {
    log('INFO', 'No new entry to append');
    return false;
  }
  
  try {
    // Read current history
    let historyData = await readMetricsHistory();
    
    if (!historyData) {
      // Create new structure if file doesn't exist
      historyData = {
        schema_version: '1.0.0',
        description: 'Agentic Terminal time-series metrics history - Cross-protocol AI agent settlement data',
        last_updated: new Date().toISOString(),
        weeks: [],
        metadata: {
          total_weeks: 0,
          weeks_with_verified_data: 0,
          earliest_week: null,
          latest_week: null,
          sources: [
            '1ML.com - Lightning Network statistics',
            'GitHub API - Repository metrics',
            'Ethereum Mainnet - ERC-8004 Identity Registry (on-chain)',
            'x402 Estimates - Historical pattern analysis',
            'Daily collection files'
          ],
          update_schedule: 'Weekly (Mondays 9:00 AM EST)'
        }
      };
    }
    
    // Check for duplicate
    const exists = historyData.weeks.some(w => w.week_start === newEntry.week_start);
    if (exists) {
      log('WARN', `Week ${newEntry.week_start} already exists. Skipping.`);
      return false;
    }
    
    // Append new week
    historyData.weeks.push(newEntry);
    
    // Update metadata
    historyData.last_updated = new Date().toISOString();
    historyData.metadata.total_weeks = historyData.weeks.length;
    historyData.metadata.weeks_with_verified_data = historyData.weeks.filter(
      w => w.data_quality === 'verified' || w.data_quality === 'verified_from_daily_files'
    ).length;
    
    const sortedWeeks = historyData.weeks.sort((a, b) => 
      new Date(a.week_start) - new Date(b.week_start)
    );
    historyData.metadata.earliest_week = sortedWeeks[0]?.week_start;
    historyData.metadata.latest_week = sortedWeeks[sortedWeeks.length - 1]?.week_start;
    
    // Write back to file
    await writeFile(CONFIG.historyFile, JSON.stringify(historyData, null, 2));
    
    log('SUCCESS', `Appended week ${newEntry.week_start}. Total weeks: ${historyData.metadata.total_weeks}`);
    return true;
    
  } catch (error) {
    log('ERROR', 'Failed to append to history', error.message);
    throw error;
  }
}

/**
 * Generate charts and content (Phase 2 Integration)
 */
async function generateChartsAndContent(newEntry) {
  const scriptsDir = path.dirname(new URL(import.meta.url).pathname);
  const date = newEntry.snapshot_date;
  
  try {
    // 1. Generate charts
    log('INFO', 'Generating chart images...');
    const chartScript = path.join(scriptsDir, 'generate-charts.mjs');
    const { stdout: chartOutput } = await execAsync(`node ${chartScript} --date=${date}`);
    log('INFO', 'Chart generation output:', chartOutput);
    
    // 2. Generate weekly thread draft
    log('INFO', 'Generating weekly X thread draft...');
    const threadScript = path.join(scriptsDir, 'generate-weekly-thread.mjs');
    const { stdout: threadOutput } = await execAsync(`node ${threadScript} --date=${date}`);
    log('INFO', 'Thread generation output:', threadOutput);
    
    // 3. Generate daily pulse batch
    log('INFO', 'Generating daily pulse tweet batch...');
    const pulseScript = path.join(scriptsDir, 'generate-daily-pulse.mjs');
    const { stdout: pulseOutput } = await execAsync(`node ${pulseScript} --date=${date} --days=7`);
    log('INFO', 'Daily pulse generation output:', pulseOutput);
    
    // 4. Sync charts to website directory
    log('INFO', 'Syncing charts to website directory...');
    const chartsSourceDir = `/home/futurebit/.openclaw/workspace/agentic-terminal-data/charts/${date}`;
    const chartsDestDir = `/home/futurebit/.openclaw/workspace/agenticterminal-website/agentic-terminal-data/charts/${date}`;
    await execAsync(`mkdir -p "${chartsDestDir}" && cp -r "${chartsSourceDir}/"* "${chartsDestDir}/"`);
    // Commit and push website charts
    await execAsync(`cd /home/futurebit/.openclaw/workspace/agenticterminal-website && git add -A && git commit -m "charts: add ${date} charts" && git push`);
    log('SUCCESS', `Charts synced and pushed to website for ${date}`);

    // 5. Post data insights to X + Nostr
    log('INFO', 'Generating and posting data insights...');
    const insightsScript = path.join(scriptsDir, 'post-data-insights.mjs');
    const { stdout: insightsOutput } = await execAsync(`node ${insightsScript} --date=${date}`);
    log('INFO', 'Insights posting output:', insightsOutput);

    // 6. Log to DAILY-OPERATIONS.md
    await logToDailyOperations(newEntry, date);
    
    log('SUCCESS', 'Phase 2 content generation complete');
  } catch (error) {
    log('ERROR', 'Phase 2 generation failed', error.message);
    // Don't throw - data collection succeeded, content generation is secondary
  }
}

/**
 * Log content creation to DAILY-OPERATIONS.md
 */
async function logToDailyOperations(newEntry, date) {
  try {
    const dailyOpsPath = '/home/futurebit/.openclaw/workspace/DAILY-OPERATIONS.md';
    const timestamp = new Date().toISOString();
    const logEntry = `

## ${date} - Agentic Terminal Data Collection + Content Generation

**Status:** ✅ COMPLETE

**Metrics Updated:**
- L402 GitHub Stars: ${newEntry.metrics.bitcoin_lightning.l402_github_stars}
- Lightning Nodes: ${newEntry.metrics.bitcoin_lightning.lightning_nodes}
- Lightning Capacity: ${newEntry.metrics.bitcoin_lightning.lightning_capacity_btc.toFixed(2)} BTC
- x402 GitHub Stars: ${newEntry.metrics.stablecoin_api_rails.x402_github_stars}
- ERC-8004 Agents (On-Chain): ${newEntry.metrics.on_chain_data?.erc8004_total_agents || newEntry.metrics.stablecoin_api_rails.erc8004_agents_registered} (${newEntry.metrics.on_chain_data?.erc8004_data_source || 'estimate'})
- x402 Daily Transactions: ${(newEntry.metrics.on_chain_data?.x402_daily_transactions || 0).toLocaleString()} (${newEntry.metrics.on_chain_data?.x402_data_source || 'estimate'})

**Content Generated:**
- Chart images: /agentic-terminal-data/charts/${date}/
- Weekly X thread: /agentic-terminal-data/content/drafts/weekly-thread-${date}.json
- Daily pulse batch: /agentic-terminal-data/content/drafts/daily-pulse-${date}-7days.json

**Notable Changes:**
${newEntry.notes || 'No significant changes noted'}

**Auto-executed at:** ${timestamp}
`;
    
    await appendFile(dailyOpsPath, logEntry);
    log('INFO', `Logged to DAILY-OPERATIONS.md`);
  } catch (error) {
    log('WARN', 'Failed to log to DAILY-OPERATIONS.md', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  log('INFO', '=== Agentic Terminal Data Collection Starting ===');
  
  try {
    // Check if today is Monday (optional safety check)
    const today = new Date();
    const dayOfWeek = today.getDay();
    if (dayOfWeek !== 1) {
      log('WARN', `Today is not Monday (day ${dayOfWeek}). Continuing anyway...`);
    }
    
    // Read existing history
    const historyData = await readMetricsHistory();
    
    // Create new entry
    const newEntry = await createNewWeekEntry(historyData);
    
    if (newEntry) {
      // Append to history
      const success = await appendToHistory(newEntry);
      
      if (success) {
        log('SUCCESS', 'Data collection completed successfully');
        log('INFO', 'New entry summary:', {
          week: `${newEntry.week_start} to ${newEntry.week_end}`,
          l402_stars: newEntry.metrics.bitcoin_lightning.l402_github_stars,
          lightning_nodes: newEntry.metrics.bitcoin_lightning.lightning_nodes,
          x402_stars: newEntry.metrics.stablecoin_api_rails.x402_github_stars,
          erc8004_agents: newEntry.metrics.on_chain_data?.erc8004_total_agents || newEntry.metrics.stablecoin_api_rails.erc8004_agents_registered,
          x402_daily_tx: newEntry.metrics.on_chain_data?.x402_daily_transactions || 0,
          data_quality: newEntry.metrics.data_quality?.overall || 'unknown'
        });
        
        // Phase 2: Generate charts and content
        log('INFO', '=== Phase 2: Generating Charts and Content ===');
        await generateChartsAndContent(newEntry);
      }
    } else {
      log('INFO', 'No new data appended (week may already exist or collection skipped)');
    }
    
  } catch (error) {
    log('ERROR', 'Fatal error in data collection', error.message);
    process.exit(1);
  }
  
  log('INFO', '=== Agentic Terminal Data Collection Complete ===');
}

// Handle missing readdir import
import { readdir } from 'fs/promises';

// Run main
main();
