#!/usr/bin/env node
import { execSync } from 'child_process';

const thread = [
  { content: "MIT economists just formalized what builders already knew: the 'Hollow Economy' emerges when agents proliferate faster than humans can verify their actions. The prescription? Cryptographic provenance. Settlement and verification must couple." },
  { content: "Stripe's annual letter confirms: we're at Level 1-2 of 5 levels of agentic commerce. $400B in stablecoin volume. Tempo blockchain for sub-second finality. The infrastructure is being built at scale—but verification is lagging." },
  { content: "New data: Lightning capacity recovered to 2,599 BTC (+4.05). x402 gained 22 GitHub stars in 48 hours. Agent-to-agent commerce is live: autonomous liquidity pools, treasury management, token launches. The infrastructure works. Trust doesn't." },
  { content: "Introducing Observer Protocol SDK: JavaScript tools for cryptographically verifiable agent identity. Every settlement rail needs a verification layer. This is that layer. github.com/observer-protocol/sdk-js" },
  { content: "Announcing: Open Agentic Payments Summit—April 21. First cross-protocol convening. Lightning Labs, Coinbase, Stripe, MoonPay. No one has brought these teams together. Until now. lu.ma/h3qfp4za" },
  { content: "The race for verification infrastructure is the race that matters now. Full analysis + protocol data in Edition #2: agenticterminal.substack.com" }
];

const firstTweetId = process.argv[2];
if (!firstTweetId) {
  console.error('Usage: node post-thread.mjs <first-tweet-id>');
  process.exit(1);
}

console.log('Posting thread replies to:', firstTweetId);

for (let i = 0; i < thread.length; i++) {
  const tweet = thread[i];
  console.log(`\nPosting tweet ${i + 2} of ${thread.length + 1}...`);
  
  try {
    const result = execSync(`node x-post-reply.mjs "${tweet.content.replace(/"/g, '\\"')}" ${firstTweetId}`, { 
      encoding: 'utf-8',
      timeout: 30000 
    });
    console.log('✅ Posted');
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
  
  // Wait 2 seconds between posts
  if (i < thread.length - 1) {
    console.log('Waiting 2 seconds...');
    execSync('sleep 2');
  }
}

console.log('\n✅ Thread complete!');
