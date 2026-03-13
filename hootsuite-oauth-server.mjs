#!/usr/bin/env node
/**
 * OAuth Callback Listener for Hootsuite
 * Catches authorization code and exchanges for tokens
 */
import http from 'http';
import url from 'url';
import fs from 'fs';

const PORT = 18080;
const CREDENTIALS_FILE = '/home/futurebit/.openclaw/workspace/hootsuite-credentials.json';

// Load credentials
let credentials = {};
try {
  credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf-8'));
} catch (e) {
  console.log('No existing credentials file');
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const { code, error, error_description } = parsed.query;
  
  console.log('Received callback:', req.url);
  
  if (error) {
    console.error('OAuth error:', error, error_description);
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end(`<h1>OAuth Error</h1><p>${error}: ${error_description}</p>`);
    return;
  }
  
  if (code) {
    console.log('Authorization code received:', code);
    
    // Save code to credentials file for exchange
    credentials.auth_code = code;
    credentials.received_at = new Date().toISOString();
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2));
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>✅ Authorization Code Received</h1>
      <p>Code: <code>${code}</code></p>
      <p>Saved to credentials file. You can close this window.</p>
      <script>console.log('Auth code:', '${code}');</script>
    `);
    
    console.log('Code saved. Exchange it for tokens using:');
    console.log(`node hootsuite-exchange-token.mjs`);
    return;
  }
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>OAuth Callback Listener</h1><p>Waiting for authorization code...</p>');
});

server.listen(PORT, () => {
  console.log(`OAuth callback listener running on port ${PORT}`);
  console.log(`Callback URL: https://oauth-callback.agenticterminal.ai/oauth/callback`);
  console.log('Waiting for Hootsuite authorization...');
});
