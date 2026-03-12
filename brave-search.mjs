#!/usr/bin/env node
/**
 * brave-search.mjs — Rate-limited Brave Search wrapper
 *
 * Problem: Multiple cron jobs fire at 9 AM and call the Brave API in parallel,
 * exhausting the rate limit and causing failures across all jobs.
 *
 * Solution: File-based token bucket. All scripts import this module instead of
 * calling Brave directly. Requests are queued and serialized with enforced delays.
 *
 * Usage (as module):
 *   import { braveSearch } from './brave-search.mjs';
 *   const results = await braveSearch('x402 protocol stats', { count: 5 });
 *
 * Usage (CLI):
 *   node brave-search.mjs "your query here" [--count 5] [--freshness week]
 *
 * Rate limits (Brave free tier): 1 req/sec, 2000 req/month
 * This wrapper enforces: min 1.2s between requests (conservative buffer)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// State file — tracks last request time across all processes
const STATE_FILE = resolve(__dirname, '.brave-rate-state.json');
const MIN_INTERVAL_MS = 1200; // 1.2 seconds between requests (conservative)
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Load the API key from environment or OpenClaw config
function getApiKey() {
  // 1. Check environment variable (set by OpenClaw for subagents)
  if (process.env.BRAVE_SEARCH_API_KEY) return process.env.BRAVE_SEARCH_API_KEY;
  if (process.env.BRAVE_API_KEY) return process.env.BRAVE_API_KEY;

  // 2. Try reading from OpenClaw config directly
  const configPaths = [
    '/home/futurebit/.openclaw/openclaw.json',
    resolve(process.env.HOME || '/home/futurebit', '.openclaw/openclaw.json'),
  ];
  for (const p of configPaths) {
    if (existsSync(p)) {
      try {
        // Config uses JS-style (not strict JSON) — parse carefully
        const raw = readFileSync(p, 'utf-8');
        // Extract apiKey from tools.web.search section
        const match = raw.match(/tools[\s\S]*?search[\s\S]*?apiKey\s*:\s*['"`]([^'"`]+)['"`]/);
        if (match && match[1] && !match[1].includes('REDACTED')) return match[1];
      } catch (_) {}
    }
  }

  // 3. Check .brave-credentials file in workspace
  const credsFile = resolve(__dirname, '.brave-credentials');
  if (existsSync(credsFile)) {
    try {
      const creds = JSON.parse(readFileSync(credsFile, 'utf-8'));
      if (creds.apiKey) return creds.apiKey;
    } catch (_) {}
  }

  return null;
}

// Read rate-limit state
function readState() {
  if (!existsSync(STATE_FILE)) return { lastRequestAt: 0, requestCount: 0, day: '' };
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  } catch (_) {
    return { lastRequestAt: 0, requestCount: 0, day: '' };
  }
}

// Write rate-limit state
function writeState(state) {
  try {
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (_) {}
}

// Enforce rate limit — sleep if needed
async function enforceRateLimit() {
  const state = readState();
  const now = Date.now();
  const elapsed = now - state.lastRequestAt;

  if (elapsed < MIN_INTERVAL_MS) {
    const wait = MIN_INTERVAL_MS - elapsed;
    await sleep(wait);
  }

  // Update state
  const today = new Date().toISOString().slice(0, 10);
  const newState = {
    lastRequestAt: Date.now(),
    requestCount: (state.day === today ? state.requestCount : 0) + 1,
    day: today,
  };
  writeState(newState);

  return newState.requestCount;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main search function.
 * @param {string} query - Search query
 * @param {object} opts - Options
 * @param {number} [opts.count=5] - Number of results (1-10)
 * @param {string} [opts.freshness] - 'day', 'week', 'month', 'year'
 * @param {string} [opts.country='US'] - Country code
 * @param {string} [opts.language='en'] - Language code
 * @param {boolean} [opts.verbose=false] - Log rate limit info
 * @returns {Promise<Array>} Array of {title, url, description} objects
 */
export async function braveSearch(query, opts = {}) {
  const {
    count = 5,
    freshness,
    country = 'US',
    language = 'en',
    verbose = false,
  } = opts;

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      'Brave API key not found. Set BRAVE_SEARCH_API_KEY env var, or add to .brave-credentials'
    );
  }

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const reqCount = await enforceRateLimit();
      if (verbose) {
        console.error(`[brave-search] Request #${reqCount} today | query: "${query}"`);
      }

      const params = new URLSearchParams({
        q: query,
        count: String(Math.min(10, Math.max(1, count))),
        country,
        search_lang: language,
      });
      if (freshness) params.set('freshness', freshness);

      const res = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': apiKey,
        },
      });

      if (res.status === 429) {
        console.error(`[brave-search] Rate limited (429). Waiting ${RETRY_DELAY_MS * attempt}ms...`);
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }

      if (!res.ok) {
        throw new Error(`Brave API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const results = (data.web?.results || []).map(r => ({
        title: r.title,
        url: r.url,
        description: r.description || r.extra_snippets?.[0] || '',
        age: r.age,
        language: r.language,
      }));

      return results;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        console.error(`[brave-search] Attempt ${attempt} failed: ${err.message}. Retrying...`);
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  throw lastError || new Error('Brave search failed after max retries');
}

/**
 * Batch search — run multiple queries with rate limiting between each.
 * Use this instead of calling braveSearch() in a loop yourself.
 * @param {Array<{query: string, opts?: object}>} queries
 * @returns {Promise<Array<{query, results, error}>>}
 */
export async function braveSearchBatch(queries) {
  const results = [];
  for (const { query, opts } of queries) {
    try {
      const r = await braveSearch(query, opts);
      results.push({ query, results: r, error: null });
    } catch (err) {
      results.push({ query, results: [], error: err.message });
    }
    // Extra buffer between batch items
    await sleep(500);
  }
  return results;
}

/**
 * Get today's request count (for budgeting).
 */
export function getTodayRequestCount() {
  const state = readState();
  const today = new Date().toISOString().slice(0, 10);
  return state.day === today ? state.requestCount : 0;
}

// ─── CLI mode ───────────────────────────────────────────────────────────────
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (!args.length || args[0] === '--help') {
    console.log('Usage: node brave-search.mjs "query" [--count N] [--freshness day|week|month|year]');
    console.log(`Today's requests so far: ${getTodayRequestCount()}`);
    process.exit(0);
  }

  const query = args.filter(a => !a.startsWith('--')).join(' ');
  const countIdx = args.indexOf('--count');
  const count = countIdx >= 0 ? parseInt(args[countIdx + 1]) : 5;
  const freshnessIdx = args.indexOf('--freshness');
  const freshness = freshnessIdx >= 0 ? args[freshnessIdx + 1] : undefined;

  try {
    console.error(`[brave-search] Searching: "${query}" (count=${count}${freshness ? ', freshness=' + freshness : ''})`);
    const results = await braveSearch(query, { count, freshness, verbose: true });
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error(`[brave-search] ERROR: ${err.message}`);
    process.exit(1);
  }
}
