#!/usr/bin/env node
/**
 * Agentic Terminal - Daily Pulse Tweet Generator
 * 
 * Generates single metric, single sparkline tweets:
 * Format: "[Metric] → [number] ([direction]) [sparkline image] agenticterminal.ai"
 * 
 * Rotates across protocols daily:
 * Day 1: L402 Stars (Bitcoin)
 * Day 2: Lightning Nodes (Bitcoin)
 * Day 3: Lightning Capacity (Bitcoin)
 * Day 4: x402 Stars (Stablecoin)
 * Day 5: ERC-8004 Agents (Stablecoin)
 * Day 6: Ark Stars (Emerging)
 * Day 7: Cross-protocol comparison
 * 
 * Usage: node generate-daily-pulse.mjs [--days=N] [--date=YYYY-MM-DD]
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const CONFIG = {
  historyFile: '/home/futurebit/.openclaw/workspace/agentic-terminal-data/metrics-history.json',
  chartsDir: '/home/futurebit/.openclaw/workspace/agentic-terminal-data/charts',
  draftsDir: '/home/futurebit/.openclaw/workspace/agentic-terminal-data/content/drafts',
  maxTweetLength: 280
};

// Daily rotation schedule
const DAILY_ROTATION = [
  {
    day: 1,
    metric: 'L402 GitHub Stars',
    key: 'metrics.bitcoin_lightning.l402_github_stars',
    category: 'bitcoin',
    emoji: '⚡',
    description: 'Lightning-native agent protocol interest'
  },
  {
    day: 2,
    metric: 'Lightning Nodes',
    key: 'metrics.bitcoin_lightning.lightning_nodes',
    category: 'bitcoin',
    emoji: '⚡',
    description: 'Public Lightning Network node count'
  },
  {
    day: 3,
    metric: 'Lightning Capacity',
    key: 'metrics.bitcoin_lightning.lightning_capacity_btc',
    category: 'bitcoin',
    emoji: '💰',
    description: 'BTC locked in Lightning channels',
    format: (v) => `${v.toFixed(0)} BTC`
  },
  {
    day: 4,
    metric: 'x402 GitHub Stars',
    key: 'metrics.stablecoin_api_rails.x402_github_stars',
    category: 'stablecoin',
    emoji: '🌊',
    description: 'Stablecoin payment rail interest'
  },
  {
    day: 5,
    metric: 'ERC-8004 Agents',
    key: 'metrics.stablecoin_api_rails.erc8004_agents_registered',
    category: 'stablecoin',
    emoji: '🤖',
    description: 'Registered AI agents on EVM',
    format: (v) => v >= 1000 ? `${(v/1000).toFixed(1)}K` : v.toString()
  },
  {
    day: 6,
    metric: 'Ark Protocol Stars',
    key: 'metrics.emerging_protocols.ark_github_stars',
    category: 'emerging',
    emoji: '🔮',
    description: 'Emerging Bitcoin L2 interest'
  },
  {
    day: 7,
    metric: 'Weekly Summary',
    key: 'summary',
    category: 'overview',
    emoji: '📊',
    description: 'Cross-protocol snapshot'
  }
];

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[DailyPulse] [${timestamp}] [${level}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
}

async function readMetricsHistory() {
  const content = await readFile(CONFIG.historyFile, 'utf8');
  return JSON.parse(content);
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function getDayOfWeek(date) {
  // Returns 1-7 (Monday = 1, Sunday = 7)
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function extractMetric(week, key) {
  const parts = key.split('.');
  let val = week;
  for (const part of parts) {
    val = val?.[part];
  }
  return val;
}

function generateDailyTweet(weeks, rotation, date) {
  const current = weeks[weeks.length - 1];
  const previous = weeks[weeks.length - 2];
  
  if (rotation.key === 'summary') {
    // Special summary tweet for day 7
    const l402Stars = current.metrics.bitcoin_lightning.l402_github_stars;
    const lnNodes = current.metrics.bitcoin_lightning.lightning_nodes;
    const x402Stars = current.metrics.stablecoin_api_rails.x402_github_stars;
    const agents = current.metrics.stablecoin_api_rails.erc8004_agents_registered;
    
    return {
      text: `${rotation.emoji} Agentic Terminal Weekly Pulse:\n\n⚡ L402: ${formatNumber(l402Stars)} stars\n⚡ Nodes: ${formatNumber(lnNodes)}\n🌊 x402: ${formatNumber(x402Stars)} stars\n🤖 Agents: ${formatNumber(agents)}\n\nTrack live → agenticterminal.ai`,
      media: 'cross-protocol-comparison.png',
      rotation,
      date
    };
  }
  
  const currentValue = extractMetric(current, rotation.key);
  const previousValue = extractMetric(previous, rotation.key);
  
  const change = previousValue ? ((currentValue - previousValue) / previousValue * 100) : 0;
  const direction = change > 0 ? '↑' : change < 0 ? '↓' : '→';
  const changeStr = change !== 0 ? ` ${change > 0 ? '+' : ''}${change.toFixed(1)}%` : '';
  
  const formattedValue = rotation.format ? rotation.format(currentValue) : formatNumber(currentValue);
  const safeName = rotation.key.replace(/\./g, '-');
  
  // Generate tweet text
  const templates = [
    `${rotation.emoji} ${rotation.metric}\n\n${formattedValue}${changeStr} ${direction}\n\n${rotation.description}\n\nagenticterminal.ai`,
    
    `${rotation.emoji} ${rotation.metric}: ${formattedValue}${changeStr} ${direction}\n\nTracking the agent settlement wars in real-time.\n\nagenticterminal.ai`,
    
    `${rotation.emoji} ${rotation.metric}\n${formattedValue} ${direction}${changeStr}\n\n${rotation.category === 'bitcoin' ? 'Bitcoin-native agent infrastructure' : rotation.category === 'stablecoin' ? 'Stablecoin payment rails' : 'Emerging protocols'}\n\nagenticterminal.ai`
  ];
  
  // Pick template
  const template = Math.abs(change) > 10 ? templates[1] : templates[0];
  
  return {
    text: template,
    media: `sparkline-${safeName}.png`,
    rotation,
    currentValue,
    previousValue,
    change,
    direction,
    date
  };
}

async function generateBatch(days = 7, startDate = new Date()) {
  log('INFO', `Generating ${days} days of pulse tweets`);
  
  const history = await readMetricsHistory();
  const weeks = history.weeks.sort((a, b) => new Date(a.week_start) - new Date(b.week_start));
  
  if (weeks.length < 2) {
    throw new Error('Need at least 2 weeks of data');
  }
  
  const tweets = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + i);
    
    const dayOfWeek = getDayOfWeek(date);
    const rotation = DAILY_ROTATION.find(r => r.day === dayOfWeek);
    
    if (!rotation) {
      log('WARN', `No rotation found for day ${dayOfWeek}`);
      continue;
    }
    
    const tweet = generateDailyTweet(weeks, rotation, date);
    tweets.push({
      ...tweet,
      scheduled_date: date.toISOString().split('T')[0],
      day_of_week: dayOfWeek
    });
  }
  
  return tweets;
}

async function main() {
  log('INFO', '=== Daily Pulse Tweet Generation Starting ===');
  
  try {
    // Parse arguments
    const daysArg = process.argv.find(arg => arg.startsWith('--days='));
    const dateArg = process.argv.find(arg => arg.startsWith('--date='));
    
    const days = daysArg ? parseInt(daysArg.split('=')[1]) : 7;
    const startDate = dateArg ? new Date(dateArg.split('=')[1]) : new Date();
    
    // Ensure drafts directory exists
    if (!existsSync(CONFIG.draftsDir)) {
      await mkdir(CONFIG.draftsDir, { recursive: true });
    }
    
    // Generate batch
    const tweets = await generateBatch(days, startDate);
    
    // Create batch document
    const batch = {
      generated_at: new Date().toISOString(),
      days_generated: days,
      start_date: startDate.toISOString().split('T')[0],
      tweets,
      chart_directory: path.join(CONFIG.chartsDir, startDate.toISOString().split('T')[0]),
      status: 'draft',
      posting_schedule: tweets.map(t => ({
        date: t.scheduled_date,
        metric: t.rotation.metric,
        ready: true
      }))
    };
    
    // Save batch
    const batchDate = startDate.toISOString().split('T')[0];
    const batchPath = path.join(CONFIG.draftsDir, `daily-pulse-${batchDate}-${days}days.json`);
    await writeFile(batchPath, JSON.stringify(batch, null, 2));
    
    log('SUCCESS', `Batch saved: ${batchPath}`);
    
    // Output preview
    console.log('\n📅 DAILY PULSE BATCH PREVIEW');
    console.log('=' .repeat(60));
    tweets.forEach((tweet, i) => {
      console.log(`\n[${i + 1}] ${tweet.scheduled_date} (${tweet.rotation.metric})`);
      console.log('-'.repeat(60));
      console.log(tweet.text);
      console.log(`Length: ${tweet.text.length}/280 | Media: ${tweet.media}`);
    });
    console.log('\n' + '='.repeat(60));
    console.log(`\nBatch saved: ${batchPath}`);
    console.log(`Charts needed: ${[...new Set(tweets.map(t => t.media))].join(', ')}`);
    
    return batch;
    
  } catch (error) {
    log('ERROR', 'Daily pulse generation failed', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
