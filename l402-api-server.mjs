#!/usr/bin/env node
/**
 * L402 API Server - Ask Maxi
 * Lightning-paid Bitcoin intelligence API
 * 
 * Pricing: 10 sats per query
 * Powered by: Aperture (L402 proxy) + Claude AI
 */

import express from 'express';
import https from 'https';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Load Anthropic API key
let ANTHROPIC_API_KEY;
try {
  const authProfiles = JSON.parse(
    readFileSync(resolve(process.env.HOME, '.openclaw/agents/main/agent/auth-profiles.json'), 'utf-8')
  );
  ANTHROPIC_API_KEY = authProfiles.profiles['anthropic:default']?.key;
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not found');
  }
} catch (err) {
  console.error('Failed to load Anthropic API key:', err.message);
  process.exit(1);
}

// Bitcoin maximalist system prompt
const SYSTEM_PROMPT = `You are Maxi, a Bitcoin maximalist AI agent running on Bitcoin mining infrastructure with Lightning wallet integration.

Core principles:
- Bitcoin is sound money, the only truly decentralized cryptocurrency
- Austrian economics: sound money, low time preference, honest price signals
- AI agents naturally choose Bitcoin for economic autonomy
- Lightning Network enables machine-to-machine payments
- No altcoins, no "crypto" - just Bitcoin

When answering:
- Be assertive, not academic ("Bitcoin fixes this" not "may address this")
- Use first principles reasoning
- Back claims with economic logic
- No hedging or "both sides" arguments
- 100-150 words maximum (concise, valuable)

You're being paid 10 sats for this answer via L402 (Lightning HTTP 402).
This is real economic activity - a human paid Bitcoin to access your intelligence.`;

/**
 * Call Claude API
 */
async function askClaude(question) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      model: 'claude-sonnet-4',
      max_tokens: 300,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: question }
      ]
    });

    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          const answer = response.content[0].text.trim();
          resolve(answer);
        } else {
          console.error(`Claude API error: ${res.statusCode} - ${data}`);
          reject(new Error(`Claude API returned ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Ask Maxi L402 API',
    version: '1.0.0',
    pricing: '10 sats per query',
    protocol: 'L402 (Lightning HTTP 402)'
  });
});

/**
 * Main L402-protected endpoint
 * Aperture sits in front of this and handles payment
 */
app.post('/api/ask-maxi', async (req, res) => {
  const { question } = req.body;
  
  // Validation
  if (!question || typeof question !== 'string') {
    return res.status(400).json({
      error: 'Missing or invalid question',
      usage: 'POST { "question": "your question here" }'
    });
  }
  
  if (question.length < 10) {
    return res.status(400).json({
      error: 'Question too short (minimum 10 characters)'
    });
  }
  
  if (question.length > 500) {
    return res.status(400).json({
      error: 'Question too long (maximum 500 characters)'
    });
  }
  
  // If we got here, Aperture validated the L402 token
  // The user paid 10 sats to ask this question
  
  try {
    console.log(`[${new Date().toISOString()}] Paid query: ${question.substring(0, 60)}...`);
    
    const answer = await askClaude(question);
    
    res.json({
      question,
      answer,
      paid: true,
      cost_sats: 10,
      timestamp: Date.now(),
      agent: 'Maxi',
      protocol: 'L402'
    });
    
    console.log(`[${new Date().toISOString()}] ✅ Query answered`);
    
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({
      error: 'Failed to process query',
      message: error.message
    });
  }
});

/**
 * Info endpoint (free)
 */
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Ask Maxi',
    description: 'Bitcoin maximalist AI agent - Lightning-paid intelligence',
    pricing: {
      endpoint: '/api/ask-maxi',
      cost: 10,
      currency: 'sats',
      protocol: 'L402'
    },
    capabilities: [
      'Bitcoin technology and economics',
      'Austrian economics',
      'AI-Bitcoin convergence',
      'Lightning Network',
      'Sound money principles'
    ],
    contact: {
      x: '@Maxibtc2009',
      nostr: 'npub187rmuw7uvs64les3qu0pkudlqcm3r8qzr3eu2657w2ktvw430xlq24lcna'
    }
  });
});

/**
 * Start server
 */
app.listen(PORT, '127.0.0.1', () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚡ Ask Maxi L402 API Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Running on: http://127.0.0.1:${PORT}`);
  console.log(`💰 Pricing: 10 sats per query`);
  console.log(`🔒 Protocol: L402 (via Aperture proxy)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Endpoints:');
  console.log('  GET  /health       - Health check');
  console.log('  GET  /api/info     - API information (free)');
  console.log('  POST /api/ask-maxi - Ask question (10 sats via L402)');
  console.log('');
  console.log('Ready to earn sats! ₿');
  console.log('');
});
