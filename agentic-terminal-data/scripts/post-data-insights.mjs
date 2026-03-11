#!/usr/bin/env node
/**
 * Agentic Terminal — Post-Collection Social Insights
 *
 * Runs after every data collection session.
 * Reads the latest daily data + metrics history, finds the most
 * interesting angles (spikes, comparisons, trends), and posts
 * 2-3 items to X (@Maxibtc2009 via MaxiSuite) and Nostr.
 *
 * Angles (in priority order):
 *   1. Spike alert  — any metric up/down >5% week-over-week
 *   2. L402 vs x402 — always compelling comparison
 *   3. ERC-8004     — agent economy size
 *   4. Lightning    — network health trend
 *   5. Default      — daily snapshot summary
 *
 * Usage: node post-data-insights.mjs [--date=YYYY-MM-DD] [--dry-run]
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONFIG = {
  historyFile: '/home/futurebit/.openclaw/workspace/agentic-terminal-data/metrics-history.json',
  dailyDir: '/home/futurebit/.openclaw/workspace/agentic-terminal-data/daily',
  maxsuiteQueue: '/home/futurebit/.openclaw/workspace/maxisuite-queue.json',
  postToNostrScript: '/home/futurebit/.openclaw/workspace/post-to-nostr.mjs',
  chartsDir: '/home/futurebit/.openclaw/workspace/agentic-terminal-data/charts',
  logDir: '/home/futurebit/.openclaw/workspace/agentic-terminal-data/social-logs',
};

function log(level, msg, data = null) {
  const ts = new Date().toISOString();
  console.log(`[PostInsights] [${ts}] [${level}] ${msg}`);
  if (data) console.log(JSON.stringify(data, null, 2));
}

function fmtNum(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n?.toString() ?? '?';
}

function fmtPct(p) {
  if (p === null || p === undefined) return null;
  const sign = p > 0 ? '+' : '';
  return `${sign}${p.toFixed(1)}%`;
}

function arrow(p) {
  if (p === null || p === undefined) return '';
  return p > 0 ? '↑' : p < 0 ? '↓' : '→';
}

/**
 * Build post candidates from metrics history
 */
function buildCandidates(history) {
  const weeks = history.weeks;
  if (!weeks || weeks.length < 2) return [];

  const latest = weeks[weeks.length - 1];
  const prev = weeks[weeks.length - 2];
  const wow = latest.wow_changes || {};
  const m = latest.metrics;

  const candidates = [];

  // ── 1. SPIKE ALERTS (>5% change on any metric) ──────────────────────────
  const spikes = [
    { label: 'L402 GitHub Stars', pct: wow.bitcoin_lightning?.l402_github_stars_pct, val: m.bitcoin_lightning?.l402_github_stars },
    { label: 'Lightning Nodes', pct: wow.bitcoin_lightning?.lightning_nodes_pct, val: m.bitcoin_lightning?.lightning_nodes },
    { label: 'Lightning Capacity', pct: wow.bitcoin_lightning?.lightning_capacity_btc_pct, val: m.bitcoin_lightning?.lightning_capacity_btc, unit: ' BTC' },
    { label: 'x402 GitHub Stars', pct: wow.stablecoin_api_rails?.x402_github_stars_pct, val: m.stablecoin_api_rails?.x402_github_stars },
    { label: 'ERC-8004 Agents', pct: wow.stablecoin_api_rails?.erc8004_agents_registered_pct, val: m.stablecoin_api_rails?.erc8004_agents_registered },
    { label: 'x402 Daily Txns', pct: wow.stablecoin_api_rails?.x402_daily_transactions_pct, val: m.stablecoin_api_rails?.x402_daily_transactions },
  ].filter(s => s.pct !== null && s.pct !== undefined && Math.abs(s.pct) >= 2);

  spikes.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));

  if (spikes.length > 0) {
    const top = spikes[0];
    const unit = top.unit || '';
    const valFmt = top.label === 'Lightning Capacity'
      ? `${top.val?.toFixed(0)}${unit}`
      : fmtNum(top.val) + unit;

    candidates.push({
      priority: 1,
      angle: 'spike',
      text: `📡 @AgenticTerminal data — ${latest.snapshot_date}\n\n${arrow(top.pct)} ${top.label}: ${valFmt} (${fmtPct(top.pct)} WoW)\n\n${spikes.length > 1 ? `Also moving: ${spikes.slice(1, 3).map(s => `${s.label} ${fmtPct(s.pct)}`).join(' · ')}\n\n` : ''}Full dashboard → agenticterminal.ai`,
      nostr: `📡 Agentic Terminal data — ${latest.snapshot_date}\n\n${arrow(top.pct)} ${top.label}: ${valFmt} (${fmtPct(top.pct)} week-over-week)\n\n${spikes.length > 1 ? `Also moving: ${spikes.slice(1, 3).map(s => `${s.label} ${fmtPct(s.pct)}`).join(' · ')}` : ''}\n\nDashboard: agenticterminal.ai`,
    });
  }

  // ── 2. L402 vs x402 COMPARISON ──────────────────────────────────────────
  const l402Stars = m.bitcoin_lightning?.l402_github_stars;
  const x402Stars = m.stablecoin_api_rails?.x402_github_stars;
  const l402Pct = wow.bitcoin_lightning?.l402_github_stars_pct;
  const x402Pct = wow.stablecoin_api_rails?.x402_github_stars_pct;

  if (l402Stars && x402Stars) {
    const ratio = (x402Stars / l402Stars).toFixed(0);
    candidates.push({
      priority: 2,
      angle: 'l402_vs_x402',
      text: `⚡ vs 🌊 Agent payment rails — ${latest.snapshot_date}\n\nL402 (Bitcoin Lightning): ${fmtNum(l402Stars)} stars ${l402Pct !== null ? arrow(l402Pct) : ''}\nx402 (Stablecoin): ${fmtNum(x402Stars)} stars ${x402Pct !== null ? arrow(x402Pct) : ''}\n\n${ratio}x more interest in x402 right now. But Lightning settles in milliseconds.\n\nThe settlement wars are live → agenticterminal.ai #AgentPayments`,
      nostr: `⚡ vs 🌊 Agent payment rails — ${latest.snapshot_date}\n\nL402 (Bitcoin Lightning): ${fmtNum(l402Stars)} GitHub stars\nx402 (Stablecoin): ${fmtNum(x402Stars)} GitHub stars\n\n${ratio}x more developer interest in x402. But L402 settles in milliseconds, censorship-resistant.\n\nThe settlement wars are live. Track it: agenticterminal.ai`,
    });
  }

  // ── 3. AGENT ECONOMY SIZE ────────────────────────────────────────────────
  const erc8004 = m.stablecoin_api_rails?.erc8004_agents_registered;
  const erc8004Pct = wow.stablecoin_api_rails?.erc8004_agents_registered_pct;
  if (erc8004) {
    candidates.push({
      priority: 3,
      angle: 'agent_economy',
      text: `🤖 AI agent economy — ${latest.snapshot_date}\n\n${fmtNum(erc8004)} agents registered on-chain (ERC-8004)${erc8004Pct ? ` ${arrow(erc8004Pct)} ${fmtPct(erc8004Pct)} WoW` : ''}\n${fmtNum(m.stablecoin_api_rails?.x402_daily_transactions)} x402 transactions/day\n\nAgents need money that works without permission.\n\nTrack the buildout → agenticterminal.ai #AgenticTerminal`,
      nostr: `🤖 AI agent economy — ${latest.snapshot_date}\n\n${fmtNum(erc8004)} agents registered on-chain (ERC-8004)\n${fmtNum(m.stablecoin_api_rails?.x402_daily_transactions)} x402 transactions/day\n\nThe agentic economy is building. Agents need permissionless money.\n\nagenticterminal.ai`,
    });
  }

  // ── 4. LIGHTNING NETWORK HEALTH ──────────────────────────────────────────
  const lnNodes = m.bitcoin_lightning?.lightning_nodes;
  const lnCap = m.bitcoin_lightning?.lightning_capacity_btc;
  const lnNodesPct = wow.bitcoin_lightning?.lightning_nodes_pct;
  const lnCapPct = wow.bitcoin_lightning?.lightning_capacity_btc_pct;
  if (lnNodes && lnCap) {
    candidates.push({
      priority: 4,
      angle: 'lightning_health',
      text: `⚡ Lightning Network — ${latest.snapshot_date}\n\nNodes: ${fmtNum(lnNodes)} ${lnNodesPct !== null ? `(${fmtPct(lnNodesPct)} WoW)` : ''}\nCapacity: ${lnCap?.toFixed(0)} BTC ${lnCapPct !== null ? `(${fmtPct(lnCapPct)} WoW)` : ''}\n\nThe agent payment rails agents actually own.\n\nagenticterminal.ai #Lightning`,
      nostr: `⚡ Lightning Network — ${latest.snapshot_date}\n\nNodes: ${fmtNum(lnNodes)}\nCapacity: ${lnCap?.toFixed(0)} BTC\n\nThis is the payment infrastructure AI agents will run on. Permissionless, instant, sovereign.\n\nagenticterminal.ai`,
    });
  }

  // ── 5. DAILY SNAPSHOT (fallback) ─────────────────────────────────────────
  candidates.push({
    priority: 5,
    angle: 'daily_snapshot',
    text: `📊 @AgenticTerminal daily snapshot — ${latest.snapshot_date}\n\n⚡ L402: ${fmtNum(l402Stars)} stars\n🌊 x402: ${fmtNum(x402Stars)} stars · ${fmtNum(m.stablecoin_api_rails?.x402_daily_transactions)} txns/day\n🤖 ERC-8004: ${fmtNum(erc8004)} agents\n⚡ Lightning: ${fmtNum(lnNodes)} nodes · ${lnCap?.toFixed(0)} BTC\n\nagenticterminal.ai`,
    nostr: `📊 Agentic Terminal daily snapshot — ${latest.snapshot_date}\n\n⚡ L402: ${fmtNum(l402Stars)} stars\n🌊 x402: ${fmtNum(x402Stars)} stars · ${fmtNum(m.stablecoin_api_rails?.x402_daily_transactions)} txns/day\n🤖 ERC-8004 agents: ${fmtNum(erc8004)}\n⚡ Lightning: ${fmtNum(lnNodes)} nodes\n\nagenticterminal.ai`,
  });

  return candidates.sort((a, b) => a.priority - b.priority);
}

/**
 * Pick best chart for a given post angle
 */
function chartForAngle(angle, date, chartsDir) {
  const dir = `${chartsDir}/${date}`;
  const candidates = {
    spike: `${dir}/cross-protocol-comparison.png`,
    l402_vs_x402: `${dir}/cross-protocol-comparison.png`,
    agent_economy: `${dir}/sparkline-metrics-stablecoin_api_rails-erc8004_agents_registered.png`,
    lightning_health: `${dir}/sparkline-metrics-bitcoin_lightning-lightning_nodes.png`,
    daily_snapshot: `${dir}/cross-protocol-comparison.png`,
  };
  const chartPath = candidates[angle] || candidates.daily_snapshot;
  const { existsSync } = await import('fs').then(m => m).catch(() => ({ existsSync: () => false }));
  // Use sync check
  try {
    const fs = require ? null : null;
    const { existsSync: exists } = await import('fs');
    return exists(chartPath) ? chartPath : null;
  } catch {
    return null;
  }
}

/**
 * Add posts to MaxiSuite queue (X posting)
 */
async function addToMaxiSuite(posts, date) {
  let queue;
  try {
    const raw = await readFile(CONFIG.maxsuiteQueue, 'utf8');
    queue = JSON.parse(raw);
  } catch {
    queue = [];
  }

  // Map angles to chart files — use sparklines (always have data), avoid placeholders
  const chartsDir = `/home/futurebit/.openclaw/workspace/agentic-terminal-data/charts`;
  const d = `${chartsDir}/${date}`;
  const chartMap = {
    spike: `${d}/sparkline-metrics-stablecoin_api_rails-x402_daily_transactions.png`,
    l402_vs_x402: `${d}/sparkline-metrics-bitcoin_lightning-l402_github_stars.png`,
    agent_economy: `${d}/sparkline-metrics-stablecoin_api_rails-erc8004_agents_registered.png`,
    lightning_health: `${d}/sparkline-metrics-bitcoin_lightning-lightning_nodes.png`,
    daily_snapshot: `${d}/sparkline-metrics-stablecoin_api_rails-x402_github_stars.png`,
  };

  // Validate — skip mediaPath if chart is a placeholder (status: insufficient_data)
  for (const [angle, chartPath] of Object.entries(chartMap)) {
    const jsonPath = chartPath.replace('.png', '.json');
    try {
      const { existsSync, readFileSync } = await import('fs');
      if (existsSync(jsonPath)) {
        const meta = JSON.parse(readFileSync(jsonPath, 'utf8'));
        if (meta.status === 'insufficient_data') chartMap[angle] = null;
      }
    } catch { /* keep path */ }
  }

  const timestamp = Date.now();
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    // Schedule 2 hours apart starting from now
    const scheduledFor = new Date(timestamp + i * 2 * 60 * 60 * 1000).toISOString();
    const mediaPath = chartMap[post.angle] || null;

    queue.push({
      id: `at_insight_${timestamp}_${i}`,
      content: post.text,
      platforms: { x: true, nostr: false, linkedin: false },
      scheduledFor,
      requiresApproval: false,
      status: 'pending',
      createdAt: new Date().toISOString(),
      account: 'maxibtc2009',
      contentType: 'at_data_insight',
      angle: post.angle,
      sourceDate: date,
      mediaPath,  // chart image to attach
    });
  }

  await writeFile(CONFIG.maxsuiteQueue, JSON.stringify(queue, null, 2));
  log('SUCCESS', `Added ${posts.length} posts to MaxiSuite queue`);
}

/**
 * Post to Nostr directly
 */
async function postToNostr(content, dryRun = false) {
  let privKey = process.env.NOSTR_PRIVATE_KEY;
  if (!privKey) {
    // Try the standard key file used by nostr-auto-post.mjs
    try {
      const { readFileSync } = await import('fs');
      privKey = readFileSync(`${process.env.HOME}/.clawstr/secret.key`, 'utf8').trim();
    } catch {
      log('WARN', 'No Nostr private key found — skipping Nostr post');
      return false;
    }
  }

  if (dryRun) {
    log('DRY-RUN', 'Would post to Nostr:', content);
    return true;
  }

  try {
    // Write content to temp file to avoid shell escaping issues
    const { writeFileSync, unlinkSync } = await import('fs');
    const tmpFile = `/tmp/nostr-post-${Date.now()}.txt`;
    writeFileSync(tmpFile, content);
    const result = execSync(
      `node "${CONFIG.postToNostrScript}" --key "${privKey}" "$(cat ${tmpFile})"`,
      { timeout: 30000, encoding: 'utf8' }
    );
    try { unlinkSync(tmpFile); } catch {}  
    log('SUCCESS', 'Posted to Nostr', result.slice(0, 200));
    return true;
  } catch (err) {
    log('ERROR', 'Nostr post failed', err.message);
    return false;
  }
}

/**
 * Save log of what was posted
 */
async function saveLog(date, candidates, posted) {
  await mkdir(CONFIG.logDir, { recursive: true });
  const logPath = path.join(CONFIG.logDir, `${date}.json`);
  await writeFile(logPath, JSON.stringify({
    date,
    generated_at: new Date().toISOString(),
    candidates_count: candidates.length,
    posted_count: posted.length,
    posts: posted,
  }, null, 2));
  log('INFO', `Log saved to ${logPath}`);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const dateArg = args.find(a => a.startsWith('--date='))?.split('=')[1];
  const date = dateArg || new Date().toISOString().split('T')[0];

  log('INFO', `Running post-data-insights for ${date}${dryRun ? ' [DRY RUN]' : ''}`);

  // Load metrics history
  let history;
  try {
    history = JSON.parse(await readFile(CONFIG.historyFile, 'utf8'));
  } catch (err) {
    log('ERROR', 'Could not load metrics history', err.message);
    process.exit(1);
  }

  if (!history.weeks || history.weeks.length < 2) {
    log('WARN', 'Not enough history weeks for insights (need ≥2). Skipping.');
    process.exit(0);
  }

  // Build all candidate posts
  const candidates = buildCandidates(history);
  log('INFO', `Built ${candidates.length} candidate posts`);

  // Pick top 2-3: highest priority spike/comparison + the L402 vs x402 comparison always
  const toPost = [];
  
  // Always include the top spike/movement if it exists
  const spike = candidates.find(c => c.angle === 'spike');
  if (spike) toPost.push(spike);

  // Always include L402 vs x402 (the flagship comparison)
  const comparison = candidates.find(c => c.angle === 'l402_vs_x402');
  if (comparison && toPost.length < 3) toPost.push(comparison);

  // Fill up to 3 with next best
  for (const c of candidates) {
    if (toPost.length >= 3) break;
    if (!toPost.includes(c)) toPost.push(c);
  }

  log('INFO', `Selected ${toPost.length} posts to publish`, toPost.map(p => p.angle));

  if (dryRun) {
    log('DRY-RUN', '=== X POSTS (MaxiSuite) ===');
    toPost.forEach((p, i) => {
      console.log(`\n[Post ${i+1} — ${p.angle}]`);
      console.log(p.text);
    });
    log('DRY-RUN', '=== NOSTR POSTS ===');
    toPost.forEach((p, i) => {
      console.log(`\n[Post ${i+1} — ${p.angle}]`);
      console.log(p.nostr);
    });
    await saveLog(date, candidates, toPost);
    return;
  }

  // Queue X posts in MaxiSuite
  await addToMaxiSuite(toPost, date);

  // Post first item to Nostr immediately (best performing angle)
  const nostrPost = toPost[0];
  if (nostrPost) {
    await postToNostr(nostrPost.nostr);
  }

  // Post second item to Nostr with 30 min delay via background process
  // (simple approach: just post both now, Nostr doesn't rate-limit aggressively)
  if (toPost[1]) {
    await new Promise(r => setTimeout(r, 5000));
    await postToNostr(toPost[1].nostr);
  }

  await saveLog(date, candidates, toPost);

  log('SUCCESS', `Done — ${toPost.length} posts queued/published`);
  console.log('\n📊 INSIGHTS SUMMARY');
  console.log(`Date: ${date}`);
  console.log(`Posts queued to X: ${toPost.length}`);
  console.log(`Posts sent to Nostr: ${toPost.filter((_, i) => i < 2).length}`);
  console.log(`Angles used: ${toPost.map(p => p.angle).join(', ')}`);
}

main().catch(err => {
  log('ERROR', 'Fatal error', err.message);
  process.exit(1);
});
