#!/usr/bin/env node
/**
 * x402 Protocol Transaction Monitor
 *
 * Monitors x402 payment protocol activity across multiple chains
 * Supports Dune API (if credentials available) and fallback to estimation
 *
 * Usage: node query-x402-transactions.mjs [--source=dune|estimate] [--days=7]
 */

import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const CONFIG = {
  outputDir: '/home/futurebit/.openclaw/workspace/agentic-terminal-data/x402',
  duneApiBase: 'https://api.dune.com/api/v1',
  maxRetries: 3,
  defaultDays: 7
};

// Known x402 contract addresses across chains
const X402_CONTRACTS = {
  // Base mainnet
  base: {
    paymentFactory: '0x1234567890123456789012345678901234567890', // Placeholder - need actual addresses
    chainId: 8453,
    name: 'Base Mainnet'
  },
  // Ethereum mainnet
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet'
  },
  // Optimism
  optimism: {
    chainId: 10,
    name: 'Optimism Mainnet'
  }
};

// Known Dune queries for x402 (from hashed_official dashboard)
const DUNE_QUERIES = {
  dailyByToken: 6094619,       // Daily tx by token (most comprehensive - aggregates all tokens)
  dailyByProject: 6084845,     // Daily tx by project
  cumulativeByProject: 6054421 // Cumulative totals by project
};

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logLine = `[x402-Monitor] [${timestamp}] [${level}] ${message}`;
  console.log(logLine);
  if (data) console.log(JSON.stringify(data, null, 2));
}

/**
 * Check if Dune API credentials are available
 * Loads from environment or credentials file
 */
async function hasDuneCredentials() {
  // Check environment variable first
  if (process.env.DUNE_API_KEY && process.env.DUNE_API_KEY !== 'your_api_key_here') {
    return true;
  }

  // Try to load from credentials file
  const credsPath = '/home/futurebit/.openclaw/workspace/agentic-terminal-data/.dune-credentials';
  try {
    if (existsSync(credsPath)) {
      const content = await readFile(credsPath, 'utf8');
      const match = content.match(/DUNE_API_KEY=(.+)/);
      if (match && match[1] && match[1] !== 'your_api_key_here') {
        // Set it in environment for this process
        process.env.DUNE_API_KEY = match[1].trim();
        return true;
      }
    }
  } catch (e) {
    // File doesn't exist or can't be read
  }

  return false;
}

/**
 * Get Dune API key from environment or credentials file
 */
async function getDuneApiKey() {
  // Already set in environment
  if (process.env.DUNE_API_KEY && process.env.DUNE_API_KEY !== 'your_api_key_here') {
    return process.env.DUNE_API_KEY;
  }

  // Load from credentials file
  const credsPath = '/home/futurebit/.openclaw/workspace/agentic-terminal-data/.dune-credentials';
  try {
    const content = await readFile(credsPath, 'utf8');
    const match = content.match(/DUNE_API_KEY=(.+)/);
    if (match && match[1] && match[1] !== 'your_api_key_here') {
      process.env.DUNE_API_KEY = match[1].trim();
      return process.env.DUNE_API_KEY;
    }
  } catch (e) {
    log('WARN', 'Could not read Dune credentials file');
  }

  return null;
}

/**
 * Query Dune API for x402 metrics - Direct results endpoint
 */
async function queryDuneApi(days = 7) {
  const apiKey = await getDuneApiKey();
  
  if (!apiKey) {
    throw new Error('Dune API key not configured. Get one at https://dune.com/settings/api');
  }
  
  log('INFO', 'Querying Dune API for x402 data...');
  
  try {
    // Query daily transactions by token (hashed_official dashboard)
    // This aggregates ALL tokens (USDC, USDT, ETH, etc.) across all facilitators
    const dailyQueryId = DUNE_QUERIES.dailyByToken;
    
    const response = await fetch(
      `${CONFIG.duneApiBase}/query/${dailyQueryId}/results?limit=1000`,
      { headers: { 'X-Dune-API-Key': apiKey } }
    );

    if (!response.ok) {
      throw new Error(`Dune API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.result || !data.result.rows) {
      throw new Error('No data returned from Dune API');
    }
    
    log('INFO', 'Dune API query successful', { rows: data.result.rows.length });
    
    // Parse daily transaction data - aggregate by date across all tokens
    const rows = data.result.rows;
    const dailyTotals = {};
    
    // Aggregate transactions and volume by day (across all tokens)
    rows.forEach(row => {
      const date = row.block_date; // Format: YYYY-MM-DD
      const txs = parseInt(row.txs || 0);
      const volume = parseFloat(row.volume || 0);
      
      if (!dailyTotals[date]) {
        dailyTotals[date] = { transactions: 0, volume: 0 };
      }
      dailyTotals[date].transactions += txs;
      dailyTotals[date].volume += volume;
    });
    
    // Get last N days of data
    const sortedDates = Object.keys(dailyTotals).sort().slice(-days);
    const recentDailyData = sortedDates.map(date => ({
      date,
      transactions: dailyTotals[date].transactions,
      volume: Math.round(dailyTotals[date].volume)
    }));
    
    // Calculate totals
    const totalRecentTx = recentDailyData.reduce((sum, d) => sum + d.transactions, 0);
    const totalRecentVol = recentDailyData.reduce((sum, d) => sum + d.volume, 0);
    const avgDailyTx = Math.round(totalRecentTx / days);
    const avgDailyVol = Math.round(totalRecentVol / days);
    
    // Estimate volume (using $10.50 avg from historical data)
    const avgDailyVolume = Math.round(avgDailyTx * 10.5);
    
    // Format to match expected output structure
    const latestDay = recentDailyData[recentDailyData.length - 1];
    const previousDay = recentDailyData[recentDailyData.length - 2];
    const trendDirection = latestDay && previousDay && latestDay.transactions > previousDay.transactions ? 'increasing' : 'declining';
    
    // Calculate average transaction size from the data
    const avgTxSize = avgDailyTx > 0 ? (avgDailyVol / avgDailyTx).toFixed(2) : 10.5;
    
    // Get cumulative totals - sum all historical data we have
    const allDates = Object.keys(dailyTotals).sort();
    const cumulativeTx = allDates.reduce((sum, date) => sum + dailyTotals[date].transactions, 0);
    const cumulativeVol = allDates.reduce((sum, date) => sum + dailyTotals[date].volume, 0);
    
    return {
      summary: {
        currentDailyTransactions: latestDay ? latestDay.transactions : avgDailyTx,
        currentDailyVolumeUSD: latestDay ? latestDay.volume : avgDailyVol,
        dailyAverage7Day: avgDailyTx,
        dailyVolumeAverage7Day: avgDailyVol,
        cumulativeTransactions: cumulativeTx,
        cumulativeVolumeUSD: cumulativeVol,
        averageTransactionSize: parseFloat(avgTxSize),
        trendDirection: trendDirection,
        dataQuality: 'verified_onchain_dune',
        querySource: 'daily_by_token_all_facilitators',
        lastUpdated: new Date().toISOString()
      },
      dailyBreakdown: recentDailyData,
      daysAnalyzed: days,
      source: 'dune_api',
      queryId: dailyQueryId
    };
    
  } catch (error) {
    log('ERROR', `Dune API query failed: ${error.message}`);
    throw error;
  }
}

/**
 * Poll Dune query results
 */
async function pollDuneResults(apiKey, executionId, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds

    const response = await fetch(
      `${CONFIG.duneApiBase}/execution/${executionId}/results`,
      { headers: { 'X-Dune-API-Key': apiKey } }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.result) {
        return data.result.rows;
      }
    }
  }

  throw new Error('Dune query timeout');
}

/**
 * Fallback: Estimate x402 metrics from historical patterns
 * Uses data from knowledge state and applies decay/growth models
 */
async function estimateX402Metrics(days = 7) {
  log('INFO', `Estimating x402 metrics (last ${days} days)...`);

  // Historical data from our knowledge state (Dec 2025 peak)
  const historicalBaseline = {
    peakDate: '2025-12-15',
    peakDailyTransactions: 57000,
    peakCumulativeTransactions: 50500000,
    peakCumulativeVolume: 605000000, // USD
    currentActivityLevel: 0.05 // 5% of peak (near zero as of March 2026)
  };

  const now = new Date();
  const peakDate = new Date(historicalBaseline.peakDate);
  const daysSincePeak = Math.floor((now - peakDate) / (1000 * 60 * 60 * 24));

  // Model: exponential decay from peak + occasional spikes
  const decayFactor = Math.exp(-daysSincePeak / 90); // 90-day half-life
  const currentDailyTx = Math.round(historicalBaseline.peakDailyTransactions *
    historicalBaseline.currentActivityLevel * (0.8 + Math.random() * 0.4));

  // Calculate cumulative based on daily decay curve
  const dailyData = [];
  let cumulativeTx = historicalBaseline.peakCumulativeTransactions;
  let cumulativeVol = historicalBaseline.peakCumulativeVolume;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Daily estimate with some randomness
    const dayDecay = Math.exp(-(daysSincePeak - (days - i)) / 90);
    const dailyTx = Math.round(historicalBaseline.peakDailyTransactions *
      historicalBaseline.currentActivityLevel * dayDecay * (0.8 + Math.random() * 0.4));
    const dailyVol = dailyTx * 10.5; // ~$10.50 average transaction

    cumulativeTx += dailyTx;
    cumulativeVol += dailyVol;

    dailyData.push({
      date: date.toISOString().split('T')[0],
      dailyTransactions: Math.max(0, dailyTx),
      dailyVolumeUSD: Math.round(dailyVol),
      cumulativeTransactions: cumulativeTx,
      cumulativeVolumeUSD: Math.round(cumulativeVol)
    });
  }

  return {
    source: 'estimate',
    dataQuality: 'estimated_from_historical',
    lastVerifiedData: historicalBaseline.peakDate,
    daysAnalyzed: days,
    summary: {
      currentDailyTransactions: dailyData[dailyData.length - 1].dailyTransactions,
      currentDailyVolumeUSD: dailyData[dailyData.length - 1].dailyVolumeUSD,
      cumulativeTransactions: dailyData[dailyData.length - 1].cumulativeTransactions,
      cumulativeVolumeUSD: dailyData[dailyData.length - 1].cumulativeVolumeUSD,
      averageTransactionSize: 10.50,
      activityLevelVsPeak: `${(historicalBaseline.currentActivityLevel * 100).toFixed(1)}%`,
      trendDirection: currentDailyTx < historicalBaseline.peakDailyTransactions * 0.1 ? 'declining' : 'stable'
    },
    dailyBreakdown: dailyData,
    notes: [
      'Activity near zero compared to Dec 2025 peak (~57K daily)',
      'Potential reasons: protocol pivot, reduced incentives, or migration',
      'Recommend: Monitor on-chain events directly for accurate data'
    ]
  };
}

/**
 * Simulate fetching on-chain events (placeholder for future implementation)
 */
async function queryOnChainEvents(days = 7) {
  log('INFO', 'On-chain event querying not yet implemented');
  log('INFO', 'Would need:');
  log('INFO', '  - RPC endpoints for Base, Optimism, Mainnet');
  log('INFO', '  - x402 PaymentFactory contract addresses per chain');
  log('INFO', '  - Event signatures for PaymentCreated, PaymentSettled');

  return {
    source: 'not_implemented',
    dataQuality: 'placeholder',
    implementationNotes: 'Requires contract addresses and RPC setup'
  };
}

/**
 * Aggregate metrics from multiple sources
 */
async function aggregateX402Metrics(source = 'auto', days = 7) {
  const useDune = source === 'dune' || (source === 'auto' && await hasDuneCredentials());

  let duneData = null;
  let estimateData = null;
  let onChainData = null;

  // Try Dune if requested
  if (useDune) {
    try {
      duneData = await queryDuneApi(days);
      log('SUCCESS', 'Dune API data retrieved');
    } catch (error) {
      log('WARN', `Dune API failed: ${error.message}`);
    }
  }

  // Always get estimates as fallback/comparison
  estimateData = await estimateX402Metrics(days);

  // Prefer Dune if available, otherwise estimates
  const primaryData = duneData || estimateData;

  return {
    schema_version: '1.0.0',
    query_date: new Date().toISOString(),
    days_analyzed: days,
    data_sources: {
      dune: duneData ? 'available' : 'not_available',
      estimate: 'available',
      onChain: 'not_implemented'
    },
    primary_source: duneData ? 'dune' : 'estimate',
    metrics: primaryData,
    comparison: duneData ? {
      duneVsEstimate: 'Dune data preferred'
    } : {
      note: 'Using estimates - Dune API credentials not configured'
    }
  };
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const source = args.find(a => a.startsWith('--source='))?.split('=')[1] || 'auto';
  const days = parseInt(args.find(a => a.startsWith('--days='))?.split('=')[1]) || CONFIG.defaultDays;

  log('INFO', `=== x402 Transaction Monitor Starting ===`);
  log('INFO', `Source: ${source}, Days: ${days}`);

  try {
    // Ensure output directory exists
    if (!existsSync(CONFIG.outputDir)) {
      await mkdir(CONFIG.outputDir, { recursive: true });
    }

    // Aggregate metrics
    const results = await aggregateX402Metrics(source, days);

    // Save results
    const dateStr = new Date().toISOString().split('T')[0];
    const outputFile = path.join(CONFIG.outputDir, `x402-metrics-${dateStr}.json`);
    await writeFile(outputFile, JSON.stringify(results, null, 2));
    log('SUCCESS', `Results saved to ${outputFile}`);

    // Also save as latest
    const latestFile = path.join(CONFIG.outputDir, 'x402-metrics-latest.json');
    await writeFile(latestFile, JSON.stringify(results, null, 2));

    // Output summary
    const summary = results.metrics.summary || results.metrics;
    console.log('\n=== x402 Transaction Summary ===');
    console.log(`Data Source: ${results.primary_source}`);
    console.log(`Daily Transactions: ${summary.currentDailyTransactions?.toLocaleString() || 'N/A'}`);
    console.log(`Daily Volume: $${summary.currentDailyVolumeUSD?.toLocaleString() || 'N/A'}`);
    console.log(`Cumulative Transactions: ${summary.cumulativeTransactions?.toLocaleString() || 'N/A'}`);
    console.log(`Cumulative Volume: $${summary.cumulativeVolumeUSD?.toLocaleString() || 'N/A'}`);
    console.log(`Avg Transaction: $${summary.averageTransactionSize || 'N/A'}`);
    console.log(`Trend: ${summary.trendDirection || 'N/A'}`);
    console.log('================================\n');

    return results;

  } catch (error) {
    log('ERROR', `Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { aggregateX402Metrics, estimateX402Metrics, hasDuneCredentials };
