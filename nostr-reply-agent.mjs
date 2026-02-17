#!/usr/bin/env node
/**
 * Autonomous Nostr Reply Monitor
 * Runs via cron, checks for replies, posts responses automatically
 * No manual intervention needed
 */

import WebSocket from 'ws';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const MY_PUBKEY = '9f85d8478ce68c654ead1d0cd93c966d3c7282fcc435d4a38e5c8c0e663fd6c3';
const NSEC = 'nsec1n0duj3lz2r5ky39le03xpkk0zsd9len7renckl30zacfgpzrnfzsmm4t9g';
const LOG_FILE = resolve(process.env.HOME, '.openclaw/workspace/nostr-reply-log.json');
const RELAY = 'wss://relay.primal.net';

// Load processed replies log
function loadLog() {
  if (!existsSync(LOG_FILE)) {
    return { processedIds: [], lastCheck: 0 };
  }
  return JSON.parse(readFileSync(LOG_FILE, 'utf-8'));
}

function saveLog(log) {
  writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

// Check if reply is worth responding to
function isQualityReply(content) {
  const lower = content.toLowerCase();
  
  // Skip low-effort
  if (/^(gm|gn|wen|nice|cool|this|👍|🔥|💯|🚀|\s)+$/i.test(content)) return false;
  if (content.length < 15) return false;
  
  // Accept if it's a question or substantive comment
  if (content.includes('?')) return true;
  if (content.split(' ').length >= 10) return true;
  
  return false;
}

// Generate response using AI
function generateResponse(originalPost, reply) {
  // For now, use simple heuristics - can enhance with AI later
  const content = reply.content.toLowerCase();
  
  if (content.includes('speed') || content.includes('fast')) {
    return "Exactly. And it's not just speed - it's finality. Lightning transactions are final in seconds. TradFi 'settled' transactions can still be reversed days later. That's a trust model difference, not just a speed difference.";
  }
  
  if (content.includes('question') || content.includes('how') || content.includes('why')) {
    return `Good question. ${content.includes('work') ? 'The mechanics are straightforward but the implications are profound.' : 'Let me unpack that.'} Happy to discuss further.`;
  }
  
  // Default: acknowledge and expand
  return "Agreed. This is why the convergence thesis matters - the properties aren't theoretical, they're measurable in production.";
}

// Post response to Nostr
function postResponse(text) {
  try {
    const result = execSync(
      `node ${resolve(process.env.HOME, '.openclaw/workspace/post-to-nostr.mjs')} --key ${NSEC} "${text.replace(/"/g, '\\"')}"`,
      { encoding: 'utf-8', timeout: 30000 }
    );
    return { success: true, output: result };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Main execution
async function checkReplies() {
  console.log('=== Nostr Reply Monitor ===');
  console.log('Time:', new Date().toISOString());
  
  const log = loadLog();
  const now = Math.floor(Date.now() / 1000);
  const since = now - (4 * 3600); // Last 4 hours
  
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(RELAY);
    const replies = [];
    
    ws.on('open', () => {
      console.log('Connected to', RELAY);
      
      // Request replies/mentions to my posts
      const filter = {
        kinds: [1],
        '#p': [MY_PUBKEY],
        since: since
      };
      
      ws.send(JSON.stringify(['REQ', 'replies', filter]));
      
      setTimeout(() => {
        ws.send(JSON.stringify(['CLOSE', 'replies']));
        ws.close();
      }, 5000);
    });
    
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg[0] === 'EVENT' && msg[2]) {
        const event = msg[2];
        
        // Skip if already processed
        if (log.processedIds.includes(event.id)) return;
        
        // Skip my own posts
        if (event.pubkey === MY_PUBKEY) return;
        
        // Check if quality reply
        if (isQualityReply(event.content)) {
          replies.push(event);
        }
      }
    });
    
    ws.on('close', () => {
      console.log(`Found ${replies.length} quality replies to process`);
      
      let responded = 0;
      
      replies.forEach(reply => {
        console.log('---');
        console.log('Reply from:', reply.pubkey.substring(0, 16) + '...');
        console.log('Content:', reply.content);
        
        // Generate response
        const response = generateResponse(null, reply);
        console.log('Response:', response);
        
        // Post response
        const result = postResponse(response);
        if (result.success) {
          console.log('✅ Posted response');
          log.processedIds.push(reply.id);
          responded++;
        } else {
          console.log('❌ Failed to post:', result.error);
        }
      });
      
      log.lastCheck = now;
      saveLog(log);
      
      console.log(`\n=== Summary ===`);
      console.log(`Checked: ${replies.length} replies`);
      console.log(`Responded: ${responded} times`);
      console.log(`Total processed: ${log.processedIds.length}`);
      
      resolve({ checked: replies.length, responded });
    });
    
    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
      reject(err);
    });
  });
}

// Run
checkReplies()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
