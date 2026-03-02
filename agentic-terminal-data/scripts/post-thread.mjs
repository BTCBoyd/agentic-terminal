#!/usr/bin/env node
/**
 * Agentic Terminal - X Thread Poster
 * 
 * Posts weekly thread drafts to X (Twitter)
 * - Reads draft from /agentic-terminal-data/content/drafts/
 * - Posts tweets in sequence (thread)
 * - Can include media (chart images)
 * 
 * Usage: node post-thread.mjs --draft=weekly-thread-YYYY-MM-DD.json [--dry-run]
 */

import { readFile } from 'fs/promises';
import { createHmac, randomBytes } from 'crypto';
import https from 'https';
import path from 'path';
import fs from 'fs';

const CONFIG = {
  credentials: {
    consumerKey: 'Ujlhatu8IPe2DUH0pxCfsr2x9',
    consumerSecret: '5ncyAjCeWGtb5G2BVQ30evygbTvm9J3yJnDzTfTmy8wBcIenea',
    accessToken: '2021647460758966273-Brx930AwZrrj2GAnRgiSETnR3DqmkZ',
    accessTokenSecret: 'fKbRY0X7wDyS3f57BMhxcbJ19CXBgLbSfGKaX3EkoSsZY'
  },
  draftsDir: '/home/futurebit/.openclaw/workspace/agentic-terminal-data/content/drafts',
  chartsDir: '/home/futurebit/.openclaw/workspace/agentic-terminal-data/charts'
};

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[ThreadPoster] [${timestamp}] [${level}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
}

// OAuth 1.0a helpers
function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

function generateOAuthSignature(method, url, params, consumerSecret, tokenSecret = '') {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&');

  const signatureBase = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(sortedParams)
  ].join('&');

  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
  const hmac = createHmac('sha1', signingKey);
  hmac.update(signatureBase);
  return hmac.digest('base64');
}

function generateOAuthHeader(method, url, params = {}) {
  const oauthParams = {
    oauth_consumer_key: CONFIG.credentials.consumerKey,
    oauth_token: CONFIG.credentials.accessToken,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: randomBytes(16).toString('hex'),
    oauth_version: '1.0'
  };

  const allParams = { ...oauthParams, ...params };
  const signature = generateOAuthSignature(
    method,
    url,
    allParams,
    CONFIG.credentials.consumerSecret,
    CONFIG.credentials.accessTokenSecret
  );

  oauthParams.oauth_signature = signature;

  return 'OAuth ' + Object.keys(oauthParams)
    .sort()
    .map(key => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
    .join(', ');
}

// Upload media to Twitter
async function uploadMedia(imagePath) {
  return new Promise((resolve, reject) => {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const options = {
      hostname: 'upload.twitter.com',
      path: '/1.1/media/upload.json',
      method: 'POST',
      headers: {
        'Authorization': generateOAuthHeader('POST', 'https://upload.twitter.com/1.1/media/upload.json'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.media_id_string) {
            resolve(response.media_id_string);
          } else {
            reject(new Error(`Media upload failed: ${data}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(`media_data=${encodeURIComponent(base64Image)}`);
    req.end();
  });
}

// Post a single tweet
async function postTweet(text, replyTo = null, mediaIds = null) {
  return new Promise((resolve, reject) => {
    const url = 'https://api.twitter.com/2/tweets';
    const body = {
      text
    };

    if (replyTo) {
      body.reply = { in_reply_to_tweet_id: replyTo };
    }

    if (mediaIds && mediaIds.length > 0) {
      body.media = { media_ids: mediaIds };
    }

    const bodyStr = JSON.stringify(body);

    const options = {
      hostname: 'api.twitter.com',
      path: '/2/tweets',
      method: 'POST',
      headers: {
        'Authorization': generateOAuthHeader('POST', url),
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.data?.id) {
            resolve(response.data.id);
          } else {
            reject(new Error(`Tweet post failed: ${data}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

// Post thread from draft
async function postThread(draftPath, dryRun = false) {
  log('INFO', `Loading draft from ${draftPath}`);
  
  const draftContent = await readFile(draftPath, 'utf8');
  const draft = JSON.parse(draftContent);
  
  const tweets = Object.values(draft.thread).sort((a, b) => a.position - b.position);
  const chartDir = draft.chart_directory;
  
  log('INFO', `Found ${tweets.length} tweets to post`);
  
  if (dryRun) {
    console.log('\n📝 DRY RUN - Would post:\n');
    for (const tweet of tweets) {
      console.log(`[${tweet.position}/${tweets.length}]${tweet.media ? ' [+media]' : ''}`);
      console.log(tweet.text);
      console.log('---');
    }
    return { dryRun: true, tweetCount: tweets.length };
  }
  
  const postedTweets = [];
  let lastTweetId = null;
  
  for (const tweet of tweets) {
    try {
      let mediaIds = null;
      
      // Upload media if specified
      if (tweet.media) {
        const imagePath = path.join(chartDir, tweet.media);
        log('INFO', `Uploading media: ${tweet.media}`);
        const mediaId = await uploadMedia(imagePath);
        mediaIds = [mediaId];
        log('SUCCESS', `Media uploaded: ${mediaId}`);
      }
      
      // Post tweet
      log('INFO', `Posting tweet ${tweet.position}/${tweets.length}`);
      const tweetId = await postTweet(tweet.text, lastTweetId, mediaIds);
      
      postedTweets.push({
        position: tweet.position,
        id: tweetId,
        url: `https://twitter.com/Maxibtc2009/status/${tweetId}`
      });
      
      lastTweetId = tweetId;
      
      log('SUCCESS', `Tweet ${tweet.position} posted: ${tweetId}`);
      
      // Small delay between tweets
      if (tweet.position < tweets.length) {
        await new Promise(r => setTimeout(r, 2000));
      }
      
    } catch (error) {
      log('ERROR', `Failed to post tweet ${tweet.position}`, error.message);
      throw error;
    }
  }
  
  return {
    threadId: postedTweets[0]?.id,
    tweets: postedTweets,
    url: postedTweets[0]?.url
  };
}

async function main() {
  log('INFO', '=== X Thread Poster Starting ===');
  
  try {
    // Parse arguments
    const draftArg = process.argv.find(arg => arg.startsWith('--draft='));
    const dryRun = process.argv.includes('--dry-run');
    
    if (!draftArg) {
      console.log('Usage: node post-thread.mjs --draft=weekly-thread-YYYY-MM-DD.json [--dry-run]');
      console.log('\nAvailable drafts:');
      const drafts = fs.readdirSync(CONFIG.draftsDir)
        .filter(f => f.startsWith('weekly-thread'))
        .sort();
      drafts.forEach(d => console.log(`  - ${d}`));
      process.exit(1);
    }
    
    const draftFile = draftArg.split('=')[1];
    const draftPath = path.join(CONFIG.draftsDir, draftFile);
    
    if (!fs.existsSync(draftPath)) {
      throw new Error(`Draft not found: ${draftPath}`);
    }
    
    // Post the thread
    const result = await postThread(draftPath, dryRun);
    
    if (result.dryRun) {
      console.log('\n✅ Dry run complete. No tweets posted.');
    } else {
      console.log('\n✅ Thread posted successfully!');
      console.log(`Thread URL: ${result.url}`);
      console.log(`\nTweets posted: ${result.tweets.length}`);
      result.tweets.forEach(t => {
        console.log(`  [${t.position}] ${t.url}`);
      });
    }
    
  } catch (error) {
    log('ERROR', 'Thread posting failed', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
