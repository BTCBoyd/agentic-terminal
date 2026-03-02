#!/usr/bin/env node
/**
 * Agentic Terminal - Weekly X Thread Generator
 * 
 * Generates 5-tweet thread after each Monday data collection:
 * - Tweet 1: Hook with most surprising delta + chart image
 * - Tweet 2: Bitcoin/Lightning signal
 * - Tweet 3: x402/ERC-8004 signal
 * - Tweet 4: Gap/convergence insight
 * - Tweet 5: CTA to agenticterminal.ai/trends
 * 
 * Saves draft threads to /agentic-terminal-data/content/drafts/
 * Usage: node generate-weekly-thread.mjs [--date=YYYY-MM-DD]
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

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[ThreadGen] [${timestamp}] [${level}] ${message}`);
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

function formatPercent(num) {
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(1)}%`;
}

function getSurprisingDelta(current, previous) {
  const deltas = [];
  
  // L402 stars change
  const l402Change = current.metrics.bitcoin_lightning.l402_github_stars - 
                     previous.metrics.bitcoin_lightning.l402_github_stars;
  const l402Pct = (l402Change / previous.metrics.bitcoin_lightning.l402_github_stars) * 100;
  deltas.push({
    metric: 'L402 Interest',
    value: current.metrics.bitcoin_lightning.l402_github_stars,
    change: l402Change,
    changePct: l402Pct,
    emoji: l402Pct > 20 ? '🚀' : l402Pct > 10 ? '📈' : l402Pct < 0 ? '⚠️' : '📊'
  });
  
  // Lightning nodes change
  const nodesChange = current.metrics.bitcoin_lightning.lightning_nodes - 
                      previous.metrics.bitcoin_lightning.lightning_nodes;
  const nodesPct = (nodesChange / previous.metrics.bitcoin_lightning.lightning_nodes) * 100;
  deltas.push({
    metric: 'Lightning Nodes',
    value: current.metrics.bitcoin_lightning.lightning_nodes,
    change: nodesChange,
    changePct: nodesPct,
    emoji: nodesPct > 1 ? '⚡' : nodesPct < -0.5 ? '🔻' : '⚡'
  });
  
  // Capacity change
  const capChange = current.metrics.bitcoin_lightning.lightning_capacity_btc - 
                    previous.metrics.bitcoin_lightning.lightning_capacity_btc;
  const capPct = (capChange / previous.metrics.bitcoin_lightning.lightning_capacity_btc) * 100;
  deltas.push({
    metric: 'Lightning Capacity',
    value: current.metrics.bitcoin_lightning.lightning_capacity_btc.toFixed(1),
    change: capChange,
    changePct: capPct,
    emoji: capPct < -1 ? '📉' : capPct > 1 ? '💰' : '💵'
  });
  
  // x402 stars change
  const x402Change = current.metrics.stablecoin_api_rails.x402_github_stars - 
                     previous.metrics.stablecoin_api_rails.x402_github_stars;
  const x402Pct = (x402Change / previous.metrics.stablecoin_api_rails.x402_github_stars) * 100;
  deltas.push({
    metric: 'x402 Ecosystem',
    value: current.metrics.stablecoin_api_rails.x402_github_stars,
    change: x402Change,
    changePct: x402Pct,
    emoji: x402Pct > 5 ? '🌊' : x402Pct > 1 ? '🌱' : '🌿'
  });
  
  // ERC-8004 agents change
  const agentsChange = current.metrics.stablecoin_api_rails.erc8004_agents_registered - 
                       previous.metrics.stablecoin_api_rails.erc8004_agents_registered;
  const agentsPct = (agentsChange / previous.metrics.stablecoin_api_rails.erc8004_agents_registered) * 100;
  deltas.push({
    metric: 'ERC-8004 Agents',
    value: formatNumber(current.metrics.stablecoin_api_rails.erc8004_agents_registered),
    change: agentsChange,
    changePct: agentsPct,
    emoji: agentsPct > 5 ? '🤖' : agentsPct > 2 ? '🔧' : '⚙️'
  });
  
  // Sort by absolute percentage change to find most surprising
  deltas.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
  
  return deltas;
}

function generateTweet1(deltas, weekDate) {
  const topDelta = deltas[0];
  const dateStr = new Date(weekDate).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  const templates = [
    `${topDelta.emoji} This week in Agentic Terminal: ${topDelta.metric} ${topDelta.change > 0 ? 'surged' : 'dropped'} ${formatPercent(topDelta.changePct)} to ${topDelta.value}.\n\nThe settlement wars are heating up 🔥\n\n🧵 ↓`,
    
    `${topDelta.emoji} Agentic Terminal Weekly: ${topDelta.metric} shows ${topDelta.change > 0 ? 'strong' : 'concerning'} momentum (${formatPercent(topDelta.changePct)}).\n\nWeek of ${dateStr}:\n🧵 ↓`,
    
    `${topDelta.emoji} Big mover this week: ${topDelta.metric} ${topDelta.change > 0 ? '↑' : '↓'} ${formatPercent(topDelta.changePct)}\n\nHere's what else moved in the agent settlement wars:\n🧵 ↓`
  ];
  
  // Pick template based on which metric moved most
  let template;
  if (topDelta.metric.includes('L402')) template = templates[0];
  else if (topDelta.metric.includes('Lightning')) template = templates[1];
  else template = templates[2];
  
  return {
    text: template,
    media: 'cross-protocol-comparison.png',
    position: 1
  };
}

function generateTweet2(current, deltas) {
  const l402Delta = deltas.find(d => d.metric === 'L402 Interest');
  const nodesDelta = deltas.find(d => d.metric === 'Lightning Nodes');
  const capDelta = deltas.find(d => d.metric === 'Lightning Capacity');
  
  const stars = current.metrics.bitcoin_lightning.l402_github_stars;
  const nodes = current.metrics.bitcoin_lightning.lightning_nodes;
  const capacity = current.metrics.bitcoin_lightning.lightning_capacity_btc.toFixed(0);
  
  // Find the most significant Lightning metric
  const lightningDeltas = [l402Delta, nodesDelta, capDelta].filter(d => d && Math.abs(d.changePct) > 0.1);
  lightningDeltas.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
  const keyDelta = lightningDeltas[0] || l402Delta;
  
  const templates = [
    `⚡ Bitcoin/Lightning Layer:\n\n• L402: ${stars} stars (${formatPercent(l402Delta.changePct)})\n• Nodes: ${formatNumber(nodes)} (${formatPercent(nodesDelta.changePct)})\n• Capacity: ${capacity} BTC (${formatPercent(capDelta.changePct)})\n\n${keyDelta.changePct > 10 ? 'Developer interest accelerating ↗️' : keyDelta.changePct < 0 ? 'Network consolidation phase' : 'Steady infrastructure growth'}`,
    
    `⚡ Lightning Network Status:\n\nL402 interest: ${stars} stars ${l402Delta.changePct > 0 ? '📈' : '📉'}\nPublic nodes: ${formatNumber(nodes)}\nCapacity: ${capacity} BTC\n\n${l402Delta.changePct > 15 ? 'AI agents discovering bitcoin-native payments' : 'Infrastructure holding strong'}`,
    
    `⚡ This week on Lightning:\n\n${keyDelta.metric}: ${formatPercent(keyDelta.changePct)}\n\n${l402Delta.changePct > 10 ? 'L402 momentum building. Agent tooling maturing.' : 'Steady state. Watch for breakout signals.'}\n\nFull metrics → agenticterminal.ai/trends`
  ];
  
  // Choose based on significance
  const template = Math.abs(l402Delta.changePct) > 15 ? templates[1] : 
                   Math.abs(keyDelta.changePct) > 5 ? templates[0] : templates[2];
  
  return {
    text: template,
    position: 2
  };
}

function generateTweet3(current, deltas) {
  const x402Delta = deltas.find(d => d.metric === 'x402 Ecosystem');
  const agentsDelta = deltas.find(d => d.metric === 'ERC-8004 Agents');
  
  const stars = current.metrics.stablecoin_api_rails.x402_github_stars;
  const agents = current.metrics.stablecoin_api_rails.erc8004_agents_registered;
  
  const templates = [
    `🌊 x402 / ERC-8004 Ecosystem:\n\n• x402 stars: ${formatNumber(stars)} (${formatPercent(x402Delta.changePct)})\n• Registered agents: ${formatNumber(agents)} (${formatPercent(agentsDelta.changePct)})\n\n${agentsDelta.changePct > 3 ? 'Agent deployment accelerating on EVM rails' : 'Stable growth in stablecoin settlement layer'}`,
    
    `🌊 The stablecoin rails:\n\nx402: ${formatNumber(stars)} ⭐ (${formatPercent(x402Delta.changePct)})\nERC-8004 agents: ${formatNumber(agents)} 🤖 (${formatPercent(agentsDelta.changePct)})\n\n${agentsDelta.changePct > x402Delta.changePct ? 'Usage outpacing interest = product-market fit signal' : 'Interest building ahead of deployment wave'}`,
    
    `🌊 x402 ecosystem check:\n\nStars: ${stars} ${x402Delta.changePct > 0 ? '↗️' : '→'}\nAgents: ${formatNumber(agents)} ${agentsDelta.changePct > 2 ? '↗️' : '→'}\n\nThe "dollar API rail" for AI agents.`
  ];
  
  const template = agentsDelta.changePct > x402Delta.changePct + 2 ? templates[1] : 
                   Math.abs(x402Delta.changePct) > 2 ? templates[0] : templates[2];
  
  return {
    text: template,
    position: 3
  };
}

function generateTweet4(current, previous, deltas) {
  const l402Delta = deltas.find(d => d.metric === 'L402 Interest');
  const agentsDelta = deltas.find(d => d.metric === 'ERC-8004 Agents');
  
  // Calculate interest-to-usage gap
  const l402Growth = l402Delta.changePct;
  const agentsGrowth = agentsDelta.changePct;
  const gap = l402Growth - agentsGrowth;
  
  let insight;
  if (gap > 10) {
    insight = `Interest (${formatPercent(l402Growth)}) massively outpacing deployment (${formatPercent(agentsGrowth)}).\n\nThe gap = opportunity. Infrastructure waiting for product.`;
  } else if (gap > 5) {
    insight = `Developer interest leads usage by ${gap.toFixed(1)} points.\n\nClassic early-stage pattern: tooling before deployment.`;
  } else if (gap < -5) {
    insight = `Usage (${formatPercent(agentsGrowth)}) now outpacing interest (${formatPercent(l402Growth)}).\n\nThe builders are building. Quietly.`;
  } else {
    insight = `Interest and usage converging.\n\nThe gap is closing. Deployment catching up to attention.`;
  }
  
  const templates = [
    `📊 The Interest ↔ Usage Gap:\n\n${insight}`,
    
    `📊 Gap Analysis:\n\nL402 interest: ${formatPercent(l402Growth)}\nERC-8004 growth: ${formatPercent(agentsGrowth)}\nGap: ${gap > 0 ? '+' : ''}${gap.toFixed(1)} points\n\n${gap > 5 ? 'Attention first, adoption second.' : gap < -5 ? 'Silent builders at work.' : 'Convergence = maturation'}`,
    
    `📊 What the gap tells us:\n\n${insight}\n\nTrack this weekly at agenticterminal.ai/trends`
  ];
  
  return {
    text: templates[0],
    media: 'interest-usage-gap.png',
    position: 4
  };
}

function generateTweet5() {
  const ctas = [
    `Track the agent settlement wars in real-time:\n\nagenticterminal.ai/trends\n\n• 8 weeks of cross-protocol data\n• Interest-to-usage gap analysis\n• Weekly signals, zero noise\n\nThe data layer for AI agent infrastructure 📡`,
    
    `→ agenticterminal.ai/trends\n\nReal-time metrics across:\n⚡ Lightning/L402\n🌊 x402/ERC-8004\n🔮 Ark & emerging\n\nNew data every Monday.`,
    
    `Get weekly signals:\n\nagenticterminal.ai/trends\n\nNo hype. Just data.\n\n📊 Cross-protocol comparison\n📈 8-week trends\n🎯 Interest-usage gap analysis`
  ];
  
  return {
    text: ctas[0],
    position: 5
  };
}

async function main() {
  log('INFO', '=== Weekly X Thread Generation Starting ===');
  
  try {
    // Parse arguments
    const dateArg = process.argv.find(arg => arg.startsWith('--date='));
    const date = dateArg ? dateArg.split('=')[1] : new Date().toISOString().split('T')[0];
    
    // Ensure drafts directory exists
    if (!existsSync(CONFIG.draftsDir)) {
      await mkdir(CONFIG.draftsDir, { recursive: true });
    }
    
    // Read metrics history
    const history = await readMetricsHistory();
    const weeks = history.weeks.sort((a, b) => new Date(a.week_start) - new Date(b.week_start));
    
    if (weeks.length < 2) {
      throw new Error('Need at least 2 weeks of data');
    }
    
    const current = weeks[weeks.length - 1];
    const previous = weeks[weeks.length - 2];
    
    log('INFO', `Generating thread for week ${current.week_start} to ${current.week_end}`);
    
    // Calculate deltas
    const deltas = getSurprisingDelta(current, previous);
    log('INFO', 'Top deltas identified:', deltas.slice(0, 3).map(d => `${d.metric}: ${formatPercent(d.changePct)}`));
    
    // Generate all 5 tweets
    const thread = {
      tweet1: generateTweet1(deltas, current.week_start),
      tweet2: generateTweet2(current, deltas),
      tweet3: generateTweet3(current, deltas),
      tweet4: generateTweet4(current, previous, deltas),
      tweet5: generateTweet5()
    };
    
    // Add metadata
    const draft = {
      generated_at: new Date().toISOString(),
      week_start: current.week_start,
      week_end: current.week_end,
      date,
      thread,
      deltas,
      chart_directory: path.join(CONFIG.chartsDir, date),
      status: 'draft',
      notes: 'Review before posting. Ensure charts are generated.'
    };
    
    // Save draft
    const draftPath = path.join(CONFIG.draftsDir, `weekly-thread-${date}.json`);
    await writeFile(draftPath, JSON.stringify(draft, null, 2));
    
    log('SUCCESS', `Thread draft saved: ${draftPath}`);
    
    // Output preview
    console.log('\n📝 WEEKLY THREAD PREVIEW');
    console.log('=' .repeat(50));
    Object.values(thread).forEach((tweet, i) => {
      console.log(`\n[${i + 1}/5]${tweet.media ? ' [+media]' : ''}`);
      console.log('-'.repeat(50));
      console.log(tweet.text);
      console.log(`Length: ${tweet.text.length}/280`);
    });
    console.log('\n' + '='.repeat(50));
    console.log(`\nDraft saved: ${draftPath}`);
    console.log(`Charts needed: cross-protocol-comparison.png, interest-usage-gap.png`);
    
    return draft;
    
  } catch (error) {
    log('ERROR', 'Thread generation failed', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
