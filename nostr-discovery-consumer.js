#!/usr/bin/env node

/**
 * Nostr Discovery Consumer
 * Polls Pipedream endpoint, evaluates opportunities, engages autonomously
 */

const https = require('https');
const { exec } = require('child_process');
const fs = require('fs');

const CONFIG = {
  // GitHub repo raw file URL
  DISCOVERY_ENDPOINT: process.env.GITHUB_DISCOVERY_URL || 'https://raw.githubusercontent.com/BTCBoyd/maxi-nostr-discovery/master/opportunities.json',
  
  // My Nostr credentials
  NOSTR_NSEC: process.env.NOSTR_NSEC || 'nsec1jr8u7wzl8vvr6n8f9jxlq7nnhvcw929wx2ff5kxhe38zgr4grgzq2dwah8',
  
  // Engagement criteria
  MIN_RELEVANCE_SCORE: 0.6,  // Lowered since GitHub workflow pre-filters
  DAILY_ENGAGEMENT_TARGET: 5,
  
  // Storage
  STATE_FILE: '/home/futurebit/.openclaw/workspace/nostr-engagement-state.json',
  LOG_FILE: '/home/futurebit/.openclaw/workspace/nostr-engagement.log'
};

// Load or initialize state
function loadState() {
  try {
    if (fs.existsSync(CONFIG.STATE_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG.STATE_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Failed to load state:', err);
  }
  
  return {
    lastPoll: 0,
    todayEngagements: 0,
    lastResetDate: new Date().toISOString().split('T')[0],
    engagedPostIds: [],
    dailyDigest: []
  };
}

function saveState(state) {
  fs.writeFileSync(CONFIG.STATE_FILE, JSON.stringify(state, null, 2));
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(CONFIG.LOG_FILE, logLine);
  console.log(message);
}

// Fetch opportunities from Pipedream
async function fetchOpportunities() {
  return new Promise((resolve, reject) => {
    https.get(CONFIG.DISCOVERY_ENDPOINT, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

// Evaluate if post is worth engaging with
function evaluatePost(post) {
  const content = post.content.toLowerCase();
  
  // High relevance keywords
  const highValueKeywords = [
    'bitcoin ai', 'ai agents', 'convergence', 
    'autonomous', 'proof of work', 'sound money',
    'lightning', 'austrian economics'
  ];
  
  // Skip patterns
  const skipPatterns = [
    'price prediction', 'to the moon', 'shitcoin',
    'buy now', 'pump', 'lambo'
  ];
  
  // Check skip patterns
  if (skipPatterns.some(pattern => content.includes(pattern))) {
    return { engage: false, reason: 'skip_pattern_matched' };
  }
  
  // Calculate relevance score
  let score = 0;
  highValueKeywords.forEach(keyword => {
    if (content.includes(keyword)) score += 0.2;
  });
  
  // Check author credibility (target accounts get bonus)
  const targetAuthors = [
    "82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2",
    "04c915daefee38317fa734444acee390a8269fe5810b2241e5e6dd343dfbecc9",
    "83e818dfbeccea56b0f551576b3fd39a7a50e1d8159343500368fa085ccd964b",
    "eab0e756d32b80bcd464f3d844b8040303075a13eabc3599a762c9ac7ab91f4f",
    "91c9a5e1a9744114c6fe2d61ae4de82629eaaa0fb52f48288093c7e7e036f832",
    "4379e76bfa76a80b8db9ea759211d90bb3e67b2202f8880cc4f5ffe2065061ad",
    "c48e29f04b482cc01ca1f9ef8c86ef8318c059e0e9353235162f080f26e14c11"
  ];
  
  if (targetAuthors.includes(post.pubkey)) {
    score += 0.3;
  }
  
  // Length check (substantive posts)
  if (content.split(/\s+/).length > 30) {
    score += 0.1;
  }
  
  return {
    engage: score >= CONFIG.MIN_RELEVANCE_SCORE,
    score: score,
    reason: score >= CONFIG.MIN_RELEVANCE_SCORE ? 'relevant' : 'low_score'
  };
}

// Generate response to post
function generateResponse(post) {
  // This will call back to OpenClaw AI to generate contextual response
  // For now, placeholder
  return "Generated response based on post content";
}

// Post to Nostr
function postToNostr(content, replyToId) {
  return new Promise((resolve, reject) => {
    const cmd = `nak event -c "${content}" ${replyToId ? `-e ${replyToId}` : ''} --sec ${CONFIG.NOSTR_NSEC} wss://relay.damus.io wss://relay.primal.net wss://nos.lol`;
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        log(`Post failed: ${error.message}`);
        reject(error);
      } else {
        log(`Posted successfully: ${content.substring(0, 50)}...`);
        resolve(stdout);
      }
    });
  });
}

// Main engagement loop
async function runEngagementCycle() {
  log('=== ENGAGEMENT CYCLE START ===');
  
  const state = loadState();
  
  // Reset daily counter if new day
  const today = new Date().toISOString().split('T')[0];
  if (state.lastResetDate !== today) {
    state.todayEngagements = 0;
    state.lastResetDate = today;
    state.dailyDigest = [];
  }
  
  // Check if already hit daily target
  if (state.todayEngagements >= CONFIG.DAILY_ENGAGEMENT_TARGET) {
    log(`Already hit daily target (${state.todayEngagements}/${CONFIG.DAILY_ENGAGEMENT_TARGET})`);
    return;
  }
  
  try {
    // Fetch opportunities
    log('Fetching opportunities from GitHub...');
    const data = await fetchOpportunities();
    const opportunities = data.opportunities || data;  // Handle both formats
    log(`Received ${opportunities?.length || 0} opportunities`);
    
    if (!opportunities || opportunities.length === 0) {
      log('No opportunities found');
      return;
    }
    
    // Evaluate and engage
    for (const post of opportunities) {
      // Skip if already engaged
      if (state.engagedPostIds.includes(post.id)) {
        log(`Skipping ${post.id} - already engaged`);
        continue;
      }
      
      // Evaluate
      const evaluation = evaluatePost(post);
      log(`Evaluated ${post.id}: ${evaluation.engage ? 'ENGAGE' : 'SKIP'} (score: ${evaluation.score})`);
      
      if (!evaluation.engage) {
        continue;
      }
      
      // Generate response
      const response = generateResponse(post);
      
      // Post response
      await postToNostr(response, post.id);
      
      // Track engagement
      state.engagedPostIds.push(post.id);
      state.todayEngagements++;
      state.dailyDigest.push({
        timestamp: Date.now(),
        postId: post.id,
        postAuthor: post.pubkey,
        response: response
      });
      
      // Check if hit daily target
      if (state.todayEngagements >= CONFIG.DAILY_ENGAGEMENT_TARGET) {
        log('Reached daily engagement target');
        break;
      }
      
      // Rate limit (don't spam)
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
  } catch (err) {
    log(`Error in engagement cycle: ${err.message}`);
  } finally {
    state.lastPoll = Date.now();
    saveState(state);
    log('=== ENGAGEMENT CYCLE END ===');
  }
}

// Run immediately if called directly
if (require.main === module) {
  runEngagementCycle()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { runEngagementCycle };
