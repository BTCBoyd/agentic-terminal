#!/usr/bin/env node
/**
 * collect-daily-metrics.mjs — Daily Lightning + GitHub metrics collector
 *
 * Fills the critical gap: writes lightning_network and github_metrics
 * to the daily data file every day (not just MWF).
 *
 * Data sources:
 *   - Lightning Network: 1ML.com via Cloudflare Browser Rendering (no Brave quota)
 *   - GitHub metrics: GitHub REST API (no auth needed for public repos, ~60 req/hr)
 *
 * Usage: node collect-daily-metrics.mjs
 * Cron:  0 8 * * *  (daily 8 AM, before the 9 AM cluster)
 *
 * Writes to: agentic-terminal-data/daily/YYYY-MM-DD.json
 * Fields added: lightning_network, github_metrics, data_sources, timestamp
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DAILY_DIR = resolve(__dirname, '../daily');
const CF_BROWSER = resolve(process.env.HOME, '.openclaw/workspace/cf-browser.mjs');

// ─── Helpers ────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10);
}

function log(level, msg) {
  console.log(`[${new Date().toISOString()}] [${level}] ${msg}`);
}

function readDailyFile(date) {
  const path = resolve(DAILY_DIR, `${date}.json`);
  if (!existsSync(path)) return { date, collected_at: new Date().toISOString() };
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function writeDailyFile(date, data) {
  if (!existsSync(DAILY_DIR)) mkdirSync(DAILY_DIR, { recursive: true });
  const path = resolve(DAILY_DIR, `${date}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2));
  log('INFO', `Written to ${path}`);
}

// ─── Lightning Network (1ML.com via Cloudflare) ─────────────────────────────

async function collectLightningMetrics() {
  log('INFO', 'Collecting Lightning Network metrics via Cloudflare Browser Rendering...');

  try {
    const { cfMarkdown } = await import(CF_BROWSER);

    // 1ML main stats page
    const md = await cfMarkdown('https://1ml.com/statistics');

    // 1ML format: "## Number of Nodes\n\n 5,586+8.03%"
    const nodeMatch = md.match(/Number of Nodes\s+\n+\s*([\d,]+)/i);
    const nodes = nodeMatch ? parseInt(nodeMatch[1].replace(/,/g, '')) : null;

    // "## Number of Channels\n\n 16,897+13.2%"
    const chanMatch = md.match(/Number of Channels\s+\n+\s*([\d,]+)/i);
    const channels = chanMatch ? parseInt(chanMatch[1].replace(/,/g, '')) : null;

    // "## Network Capacity\n\n 2,639.33 BTC"
    const capBtcMatch = md.match(/Network Capacity\s+\n+\s*([\d,]+(?:\.\d+)?)\s*BTC/i);
    const capacityBtc = capBtcMatch ? parseFloat(capBtcMatch[1].replace(/,/g, '')) : null;

    // "$183,344,962.21" — first dollar amount after capacity section
    const capUsdMatch = md.match(/Network Capacity[\s\S]*?\$([\d,]+(?:\.\d+)?)/i);
    const capacityUsd = capUsdMatch ? parseFloat(capUsdMatch[1].replace(/,/g, '')) : null;

    // If 1ML parse failed, try the API endpoint directly
    if (!nodes) {
      log('WARN', '1ML page parse returned no node count, trying API...');
      const apiMd = await cfMarkdown('https://1ml.com/api/v1/statistics');
      const apiNodeMatch = apiMd.match(/"num_nodes"\s*:\s*(\d+)/);
      const apiChanMatch = apiMd.match(/"num_channels"\s*:\s*(\d+)/);
      const apiCapMatch = apiMd.match(/"total_capacity"\s*:\s*(\d+)/);

      if (apiNodeMatch) {
        return {
          nodes: {
            total: parseInt(apiNodeMatch[1]),
            tor: null,
          },
          channels: {
            total: apiChanMatch ? parseInt(apiChanMatch[1]) : null,
          },
          capacity: {
            // 1ML API returns capacity in satoshis
            btc: apiCapMatch ? parseInt(apiCapMatch[1]) / 1e8 : null,
            usd: null,
          },
          source: '1ml_api',
          collected_at: new Date().toISOString(),
        };
      }
    }

    if (!nodes && !channels) {
      throw new Error('Could not parse any metrics from 1ML — page format may have changed');
    }

    log('INFO', `Lightning: ${nodes} nodes, ${channels} channels, ${capacityBtc} BTC`);

    return {
      nodes: { total: nodes, tor: null },
      channels: { total: channels },
      capacity: { btc: capacityBtc, usd: capacityUsd },
      source: '1ml_cloudflare',
      collected_at: new Date().toISOString(),
    };
  } catch (err) {
    log('ERROR', `Lightning collection failed: ${err.message}`);
    return null;
  }
}

// ─── GitHub metrics ──────────────────────────────────────────────────────────

const GITHUB_REPOS = [
  { key: 'lightning_agent_tools', owner: 'lightninglabs', repo: 'lightning-agent-tools' },
  { key: 'l402_aperture',         owner: 'lightninglabs', repo: 'aperture' },
  { key: 'x402',                  owner: 'coinbase',       repo: 'x402' },
  { key: 'ark_protocol_arkd',     owner: 'arkade-os',      repo: 'arkd' },
  { key: 'ark_protocol_tssdk',    owner: 'arkade-os',      repo: 'ts-sdk' },
  { key: 'ark_protocol_skill',    owner: 'arkade-os',      repo: 'skill' },
];

function githubGet(url) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const authHeader = token ? `-H "Authorization: token ${token}"` : '';
  try {
    const out = execSync(`curl -s ${authHeader} "${url}"`, { timeout: 15000, encoding: 'utf-8' });
    return JSON.parse(out);
  } catch (err) {
    return null;
  }
}

async function collectGitHubMetrics() {
  log('INFO', 'Collecting GitHub metrics...');
  const metrics = {};

  for (const { key, owner, repo } of GITHUB_REPOS) {
    log('INFO', `  ${owner}/${repo}...`);
    const data = githubGet(`https://api.github.com/repos/${owner}/${repo}`);
    if (!data || data.message) {
      log('WARN', `  Failed: ${data?.message || 'no data'}`);
      metrics[key] = { error: data?.message || 'fetch failed' };
      continue;
    }

    metrics[key] = {
      repo: `${owner}/${repo}`,
      stars: data.stargazers_count,
      forks: data.forks_count,
      open_issues: data.open_issues_count,
      watchers: data.watchers_count,
      language: data.language,
      updated_at: data.updated_at,
    };
    log('INFO', `  ✅ ${owner}/${repo}: ${data.stargazers_count} stars, ${data.forks_count} forks`);

    // Small delay to avoid GitHub rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  return metrics;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const date = today();
  log('INFO', `=== collect-daily-metrics.mjs — ${date} ===`);

  // Run Lightning and GitHub in parallel (different sources, no contention)
  const [lightningResult, githubResult] = await Promise.allSettled([
    collectLightningMetrics(),
    collectGitHubMetrics(),
  ]);

  const lightning = lightningResult.status === 'fulfilled' ? lightningResult.value : null;
  const github = githubResult.status === 'fulfilled' ? githubResult.value : null;

  if (!lightning) log('WARN', 'Lightning metrics collection failed — daily file will lack lightning_network');
  if (!github)    log('WARN', 'GitHub metrics collection failed — daily file will lack github_metrics');

  // Merge into existing daily file (don't overwrite ERC-8004 or velocity data)
  const existing = readDailyFile(date);

  const updated = {
    ...existing,
    date,
    timestamp: existing.timestamp || new Date().toISOString(),
    data_sources: 'collect-daily-metrics',
  };

  if (lightning) {
    updated.lightning_network = lightning;
    log('INFO', `Lightning: ${lightning.nodes?.total} nodes, ${lightning.channels?.total} channels`);
  }

  if (github) {
    updated.github_metrics = github;
    const x402Stars = github.x402?.stars;
    const l402Stars = github.lightning_agent_tools?.stars;
    log('INFO', `GitHub: x402=${x402Stars} stars, L402 agent tools=${l402Stars} stars`);
  }

  writeDailyFile(date, updated);

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Lightning Network: ${lightning ? `✅ ${lightning.nodes?.total} nodes` : '❌ failed'}`);
  console.log(`GitHub metrics: ${github ? `✅ ${Object.keys(github).length} repos` : '❌ failed'}`);
  console.log(`Daily file updated: agentic-terminal-data/daily/${date}.json`);

  if (!lightning && !github) {
    process.exit(1); // Signal failure to cron monitor
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
