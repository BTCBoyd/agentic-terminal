#!/usr/bin/env node
/**
 * X Media Upload Utility
 * Uploads an image to X using v1.1 media/upload endpoint
 * Returns media_id_string for use in tweet creation
 *
 * Usage: node x-upload-media.mjs <image-path> [account]
 * account: 'maxibtc2009' (default) or 'arcadiabtc'
 */

import { createHmac, randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import https from 'https';
import path from 'path';

const ACCOUNTS = {
  maxibtc2009: {
    consumerKey: 'ern3mimZMpHl4MvBlJnIrokqI',
    consumerSecret: 'BdMlZAjKSRJL4g0eIphrLWxoGLo3bI4Ru0FUR2R6mEwSWImzBv',
    accessToken: '2021647460758966273-qQW48HIRGxefjbDAMaEnNA9op5kPxH',
    accessTokenSecret: 'xsUk0hsIewKaNpZKUj7TNrejC4rWmizPSbzBj9aoHfdK3'
  },
  arcadiabtc: {
    consumerKey: 'ern3mimZMpHl4MvBlJnIrokqI',
    consumerSecret: 'BdMlZAjKSRJL4g0eIphrLWxoGLo3bI4Ru0FUR2R6mEwSWImzBv',
    accessToken: '1541611301643173889-CJb1Gm0a7IVQ7mMJCFNlJZU8KCKPi5',
    accessTokenSecret: 'jCHIVB1UuEpiFbpJxsEMdNhbTFLMwJHzlmvqFkbNnJWl1'
  }
};

function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21').replace(/'/g, '%27')
    .replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A');
}

function oauthHeader(method, baseUrl, bodyParams, creds) {
  const oauthParams = {
    oauth_consumer_key: creds.consumerKey,
    oauth_nonce: randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: creds.accessToken,
    oauth_version: '1.0'
  };

  const allParams = { ...oauthParams, ...bodyParams };
  const sortedParams = Object.keys(allParams).sort()
    .map(k => `${percentEncode(k)}=${percentEncode(allParams[k])}`).join('&');
  const sigBase = [method, percentEncode(baseUrl), percentEncode(sortedParams)].join('&');
  const sigKey = `${percentEncode(creds.consumerSecret)}&${percentEncode(creds.accessTokenSecret)}`;
  const sig = createHmac('sha1', sigKey).update(sigBase).digest('base64');

  return 'OAuth ' + [...Object.keys(oauthParams), 'oauth_signature']
    .map(k => `${percentEncode(k)}="${percentEncode(k === 'oauth_signature' ? sig : oauthParams[k])}"`)
    .join(', ');
}

function httpsPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method: 'POST', headers }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

export async function uploadMedia(imagePath, account = 'maxibtc2009') {
  const creds = ACCOUNTS[account.replace('@', '').toLowerCase()];
  if (!creds) throw new Error(`Unknown account: ${account}`);

  const imageData = readFileSync(imagePath);
  const b64 = imageData.toString('base64');
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';

  const bodyParams = { media_data: b64 };
  const bodyStr = `media_data=${percentEncode(b64)}`;

  const auth = oauthHeader('POST', 'https://upload.twitter.com/1.1/media/upload.json', bodyParams, creds);

  const res = await httpsPost('upload.twitter.com', '/1.1/media/upload.json', {
    'Authorization': auth,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(bodyStr),
    'User-Agent': 'MaxiAgent/1.0'
  }, bodyStr);

  if (res.status !== 200) {
    throw new Error(`Media upload failed (${res.status}): ${JSON.stringify(res.body)}`);
  }

  return res.body.media_id_string;
}

// CLI
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const imagePath = process.argv[2];
  const account = process.argv[3] || 'maxibtc2009';
  if (!imagePath) { console.error('Usage: node x-upload-media.mjs <image-path> [account]'); process.exit(1); }

  try {
    const mediaId = await uploadMedia(imagePath, account);
    console.log('media_id:', mediaId);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
