#!/usr/bin/env node
/**
 * X Tweet Reader — reads any tweet by URL or ID
 * Uses existing OAuth 1.0a credentials (pay-as-you-go)
 * Usage: node x-read-tweet.mjs <tweet-url-or-id>
 */

import { createHmac, randomBytes } from 'crypto';
import https from 'https';

const CREDENTIALS = {
  consumerKey: 'ern3mimZMpHl4MvBlJnIrokqI',
  consumerSecret: 'BdMlZAjKSRJL4g0eIphrLWxoGLo3bI4Ru0FUR2R6mEwSWImzBv',
  accessToken: '2021647460758966273-qQW48HIRGxefjbDAMaEnNA9op5kPxH',
  accessTokenSecret: 'xsUk0hsIewKaNpZKUj7TNrejC4rWmizPSbzBj9aoHfdK3'
};

function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21').replace(/'/g, '%27')
    .replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A');
}

function oauthHeader(method, baseUrl, queryParams = {}) {
  const oauthParams = {
    oauth_consumer_key: CREDENTIALS.consumerKey,
    oauth_nonce: randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: CREDENTIALS.accessToken,
    oauth_version: '1.0'
  };

  const allParams = { ...oauthParams, ...queryParams };
  const sortedParams = Object.keys(allParams).sort()
    .map(k => `${percentEncode(k)}=${percentEncode(allParams[k])}`).join('&');
  const sigBase = [method, percentEncode(baseUrl), percentEncode(sortedParams)].join('&');
  const sigKey = `${percentEncode(CREDENTIALS.consumerSecret)}&${percentEncode(CREDENTIALS.accessTokenSecret)}`;
  const sig = createHmac('sha1', sigKey).update(sigBase).digest('base64');

  return 'OAuth ' + [...Object.keys(oauthParams), 'oauth_signature']
    .map(k => `${percentEncode(k)}="${percentEncode(k === 'oauth_signature' ? sig : oauthParams[k])}"`)
    .join(', ');
}

function apiGet(path, params = {}) {
  return new Promise((resolve, reject) => {
    const baseUrl = `https://api.twitter.com${path}`;
    const qs = new URLSearchParams(params).toString();
    const url = qs ? `${baseUrl}?${qs}` : baseUrl;
    const auth = oauthHeader('GET', baseUrl, params);

    https.get(url, { headers: { 'Authorization': auth, 'User-Agent': 'MaxiAgent/1.0' } }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    }).on('error', reject);
  });
}

export async function readTweet(tweetUrlOrId) {
  // Extract ID from URL if needed
  const id = tweetUrlOrId.includes('x.com') || tweetUrlOrId.includes('twitter.com')
    ? tweetUrlOrId.match(/status\/(\d+)/)?.[1]
    : tweetUrlOrId;

  if (!id) throw new Error(`Could not extract tweet ID from: ${tweetUrlOrId}`);

  const res = await apiGet(`/2/tweets/${id}`, {
    'tweet.fields': 'text,author_id,created_at,conversation_id,in_reply_to_user_id',
    'expansions': 'author_id',
    'user.fields': 'name,username'
  });

  if (res.status !== 200) throw new Error(`API error ${res.status}: ${JSON.stringify(res.body)}`);

  const tweet = res.body.data;
  const author = res.body.includes?.users?.[0];

  return {
    id: tweet.id,
    text: tweet.text,
    author: author ? `@${author.username} (${author.name})` : `user_${tweet.author_id}`,
    authorUsername: author?.username,
    created_at: tweet.created_at,
    conversation_id: tweet.conversation_id,
  };
}

// CLI
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const input = process.argv[2];
  if (!input) { console.error('Usage: node x-read-tweet.mjs <tweet-url-or-id>'); process.exit(1); }

  try {
    const tweet = await readTweet(input);
    console.log(`\nTweet by ${tweet.author}`);
    console.log(`Posted: ${tweet.created_at}`);
    console.log(`\n"${tweet.text}"\n`);
    console.log(JSON.stringify(tweet, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
