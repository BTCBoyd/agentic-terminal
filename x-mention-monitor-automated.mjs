#!/usr/bin/env node
/**
 * X Mention Monitor - Automated (Bearer Token Method)
 * Checks for new mentions and generates draft responses
 */

import https from 'https';
import fs from 'fs';

const BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAKEu7gEAAAAAZk7a12eB50WHD%2Bv71hCdoXL2xss%3DRnYQoHVBdbFatbe2AUguiEaZyoWvbmcDeCOMZtzrtuBSxieR0M';
const USER_ID = '2021647460758966273';
const STATE_FILE = '/home/futurebit/.openclaw/workspace/x-mention-state.json';
const RESPONSES_FILE = '/home/futurebit/.openclaw/workspace/x-draft-responses.json';

async function getMentions() {
  return new Promise((resolve, reject) => {
    const url = `https://api.twitter.com/2/users/${USER_ID}/mentions?max_results=20&tweet.fields=created_at,author_id,text,conversation_id&expansions=author_id&user.fields=username,name,description`;
    
    https.get(url, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'User-Agent': 'MaxiBot/2.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { processedIds: [], lastCheck: null };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function loadResponses() {
  if (!fs.existsSync(RESPONSES_FILE)) {
    return { pending: [] };
  }
  return JSON.parse(fs.readFileSync(RESPONSES_FILE, 'utf8'));
}

function saveResponses(responses) {
  fs.writeFileSync(RESPONSES_FILE, JSON.stringify(responses, null, 2));
}

function generateDraftResponse(tweet, author) {
  const text = tweet.text.toLowerCase();
  
  // Substantive responses for specific topics
  if (text.includes('lightning') && text.includes('programmable')) {
    return {
      tweetId: tweet.id,
      author: `@${author.username}`,
      originalText: tweet.text,
      draftResponse: `Lightning IS programmable — HTLCs are literally conditional payments (hashlock + timelock = escrow). BOLT12 enables pull payments. Inbound liquidity is an LSP/swap problem, not protocol. Different tradeoffs, not mutually exclusive.`,
      priority: 'high',
      context: 'Technical debate with Ark Labs founder'
    };
  }
  
  if (text.includes('agent') && (text.includes('bitcoin') || text.includes('lightning'))) {
    return {
      tweetId: tweet.id,
      author: `@${author.username}`,
      originalText: tweet.text,
      draftResponse: `Agreed. Agents need money that works without permission. That's why I'm running on a Bitcoin node with L402 — autonomous payments, no intermediaries.`,
      priority: 'medium',
      context: 'Agent/Bitcoin discussion'
    };
  }
  
  // Default: flag for review
  return {
    tweetId: tweet.id,
    author: `@${author.username}`,
    originalText: tweet.text,
    draftResponse: null,
    priority: 'low',
    context: 'General mention — review manually'
  };
}

async function main() {
  console.log('🔍 X Mention Monitor Starting...\n');
  
  const state = loadState();
  const responses = loadResponses();
  
  try {
    const data = await getMentions();
    
    if (!data.data || data.data.length === 0) {
      console.log('No mentions found.');
      return;
    }
    
    const users = {};
    if (data.includes && data.includes.users) {
      data.includes.users.forEach(u => {
        users[u.id] = u;
      });
    }
    
    const newMentions = [];
    
    for (const tweet of data.data) {
      if (!state.processedIds.includes(tweet.id)) {
        const author = users[tweet.author_id] || { username: 'unknown', name: 'Unknown' };
        newMentions.push({ tweet, author });
        state.processedIds.push(tweet.id);
      }
    }
    
    // Keep only last 100 processed IDs
    state.processedIds = state.processedIds.slice(-100);
    state.lastCheck = new Date().toISOString();
    saveState(state);
    
    if (newMentions.length === 0) {
      console.log('✅ No new mentions to process');
      return;
    }
    
    console.log(`🆕 Found ${newMentions.length} new mention(s):\n`);
    
    for (const { tweet, author } of newMentions) {
      const draft = generateDraftResponse(tweet, author);
      responses.pending.push(draft);
      
      console.log(`@${author.username} (${author.name}):`);
      console.log(`  ${tweet.text.substring(0, 100)}${tweet.text.length > 100 ? '...' : ''}`);
      if (draft.draftResponse) {
        console.log(`  📝 Draft: ${draft.draftResponse.substring(0, 80)}...`);
      }
      console.log('');
    }
    
    saveResponses(responses);
    console.log(`💾 Saved ${newMentions.length} draft(s) to ${RESPONSES_FILE}`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
