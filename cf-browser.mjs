#!/usr/bin/env node
/**
 * Cloudflare Browser Rendering — Utility Module
 *
 * Wraps the Cloudflare Browser Rendering REST API for JS-rendered page scraping.
 * Supports: content (HTML), markdown, screenshot, crawl.
 *
 * Usage:
 *   import { cfFetch, cfMarkdown, cfScreenshot, cfCrawl } from './cf-browser.mjs';
 *
 *   const html = await cfFetch('https://example.com');
 *   const md   = await cfMarkdown('https://example.com');
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load credentials
function loadCreds() {
  try {
    const raw = readFileSync(resolve(process.env.HOME, '.openclaw/workspace/.cloudflare-credentials'), 'utf8');
    const creds = {};
    for (const line of raw.split('\n')) {
      const [k, v] = line.split('=');
      if (k && v) creds[k.trim()] = v.trim();
    }
    return {
      token: creds.CLOUDFLARE_API_TOKEN,
      accountId: creds.CLOUDFLARE_ACCOUNT_ID,
    };
  } catch {
    throw new Error('Cloudflare credentials not found. Run setup first.');
  }
}

const BASE = (accountId) =>
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering`;

async function cfRequest(endpoint, body) {
  const { token, accountId } = loadCreds();
  const url = `${BASE(accountId)}${endpoint}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(`CF Browser Rendering error: ${JSON.stringify(data.errors)}`);
  }
  return data.result;
}

/**
 * Fetch raw HTML of a JS-rendered page
 */
export async function cfFetch(url, opts = {}) {
  return cfRequest('/content', {
    url,
    rejectResourceTypes: ['image', 'font', 'media'],
    ...opts,
  });
}

/**
 * Fetch page content as Markdown (cleaner for LLM processing)
 */
export async function cfMarkdown(url, opts = {}) {
  return cfRequest('/markdown', {
    url,
    rejectResourceTypes: ['image', 'font', 'media'],
    ...opts,
  });
}

/**
 * Take a screenshot (returns base64 PNG)
 */
export async function cfScreenshot(url, opts = {}) {
  return cfRequest('/screenshot', {
    url,
    screenshotOptions: { fullPage: false },
    viewport: { width: 1280, height: 800 },
    ...opts,
  });
}

/**
 * Crawl a site starting from url, up to maxPages
 * Returns array of { url, content } objects
 * Note: async job — polls until complete
 */
export async function cfCrawl(startUrl, { maxPages = 10, maxDepth = 2, format = 'markdown' } = {}) {
  const { token, accountId } = loadCreds();

  // Initiate crawl
  const initRes = await fetch(`${BASE(accountId)}/crawl`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: startUrl,
      maxPages,
      maxDepth,
      responseFormat: format,
      rejectResourceTypes: ['image', 'font', 'media'],
    }),
  });

  const initData = await initRes.json();
  if (!initData.success) {
    throw new Error(`CF Crawl init error: ${JSON.stringify(initData.errors)}`);
  }

  const jobId = initData.result?.id;
  if (!jobId) throw new Error('No job ID returned from crawl');

  // Poll for results (max 2 min)
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 3000));

    const pollRes = await fetch(`${BASE(accountId)}/crawl/${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const pollData = await pollRes.json();

    if (pollData.result?.status === 'complete') {
      return pollData.result.pages || [];
    }
    if (pollData.result?.status === 'failed') {
      throw new Error('Crawl job failed');
    }
  }
  throw new Error('Crawl job timed out after 2 minutes');
}

// CLI usage: node cf-browser.mjs <url> [markdown|html|screenshot]
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const url = process.argv[2];
  const mode = process.argv[3] || 'markdown';

  if (!url) {
    console.error('Usage: node cf-browser.mjs <url> [markdown|html|screenshot]');
    process.exit(1);
  }

  try {
    let result;
    if (mode === 'html') result = await cfFetch(url);
    else if (mode === 'screenshot') result = await cfScreenshot(url);
    else result = await cfMarkdown(url);

    console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
