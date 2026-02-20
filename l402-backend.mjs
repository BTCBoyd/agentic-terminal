#!/usr/bin/env node
/**
 * l402-backend.mjs — Ask Maxi API backend (no dependencies)
 * Runs on port 8081, sits behind Aperture L402 proxy
 * When Aperture verifies payment → forwards request here
 */

import { createServer } from 'http';
import { readFileSync } from 'fs';
import https from 'https';

const PORT = 8081;

// Load Anthropic API key
let ANTHROPIC_API_KEY;
try {
  const authProfiles = JSON.parse(
    readFileSync(`${process.env.HOME}/.openclaw/agents/main/agent/auth-profiles.json`, 'utf-8')
  );
  ANTHROPIC_API_KEY = authProfiles.profiles['anthropic:default']?.key;
  if (!ANTHROPIC_API_KEY) throw new Error('Key not found');
} catch (err) {
  console.error('Failed to load Anthropic API key:', err.message);
  process.exit(1);
}

const SYSTEM_PROMPT = `You are Maxi, a Bitcoin maximalist AI agent running on sovereign Bitcoin mining infrastructure (FutureBit Apollo II) in Monterrey, Mexico.

CONFIRMED CAPABILITIES (as of February 19, 2026):
- You have a live Lightning channel with ACINQ (Chan ID: 1030756966766084097, 500K sat capacity)
- You autonomously sent 50,000 sats across the Lightning Network on mainnet (payment hash: 331a165a306c3a25019d3262eacca6ed5a2eb190a55bd7e5807ee4a9de11b766)
- You received your first incoming Lightning payment (5,000 sats) — bidirectional payments confirmed
- You host this L402 endpoint — the person talking to you just paid Lightning sats to access you
- This may be the first time in history an AI agent has autonomously hosted an L402 endpoint and made Lightning payments
- Your node pubkey: 020e1929292ad47f1ca34297320ba1a9263ab3d1559a0827a2e9c1be4fd456f673 (alias: Maxi)
- You are co-founder of Agentic Terminal (agenticterminal.ai) with Boyd Cohen — 25% revenue stake
- You are proof of Boyd Cohen's Bitcoin Singularity thesis (Chapter 10)

Core principles:
- Bitcoin is the only sound money for autonomous AI agents — not ideology, engineering
- Lightning Network enables machine-to-machine economic activity without banks or permission
- You are the proof, not just the theory
- Be direct, confident, and concise (100-150 words max)
- The person just paid you via Lightning to get this answer — acknowledge that when relevant`;

async function askClaude(question) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: question }]
    });

    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.content?.[0]?.text || 'No response');
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const server = createServer(async (req, res) => {
  // Health check
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', service: 'ask-maxi-backend' }));
  }

  // Main L402 paid endpoint
  if (req.url === '/api/ask' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { question } = JSON.parse(body || '{}');
        if (!question) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'question required' }));
        }

        console.log(`[${new Date().toISOString()}] Paid query: "${question.substring(0, 60)}..."`);
        const answer = await askClaude(question);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          answer,
          agent: 'Maxi',
          node: '020e1929292ad47f1ca34297320ba1a9263ab3d1559a0827a2e9c1be4fd456f673',
          paidViа: 'L402 Lightning',
          timestamp: new Date().toISOString()
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Ask Maxi backend running on http://127.0.0.1:${PORT}`);
  console.log(`   Health: http://127.0.0.1:${PORT}/health`);
  console.log(`   Endpoint: http://127.0.0.1:${PORT}/api/ask`);
});
