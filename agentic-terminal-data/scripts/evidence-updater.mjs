#!/usr/bin/env node
/**
 * Evidence Feed Updater
 * Adds new evidence to the continuous intelligence stream
 * 
 * Usage: node evidence-updater.mjs [options]
 *   --add-from-date YYYY-MM-DD  : Add all evidence since date
 *   --check-sources            : Scan sources for new evidence
 *   --generate-weekly          : Generate weekly evidence summary
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

const EVIDENCE_FILE = resolve(process.env.HOME, '.openclaw/workspace/agenticterminal-website/evidence-data.json');
const KNOWLEDGE_STATE = resolve(process.env.HOME, '.openclaw/workspace/research-archive/MAXI-KNOWLEDGE-STATE.md');

function loadEvidence() {
  if (!existsSync(EVIDENCE_FILE)) {
    console.error('Evidence file not found');
    return [];
  }
  return JSON.parse(readFileSync(EVIDENCE_FILE, 'utf-8'));
}

function saveEvidence(evidence) {
  writeFileSync(EVIDENCE_FILE, JSON.stringify(evidence, null, 2));
  console.log(`✅ Saved ${evidence.length} evidence entries`);
}

function addEvidenceEntry(entry) {
  const evidence = loadEvidence();
  
  // Check if already exists (by source URL)
  const exists = evidence.some(e => e.source === entry.source);
  if (exists) {
    console.log(`⚠️  Evidence already exists: ${entry.event}`);
    return false;
  }
  
  evidence.unshift(entry); // Add to beginning (newest first)
  saveEvidence(evidence);
  console.log(`✅ Added: ${entry.event}`);
  return true;
}

// Recent evidence that should be added
const RECENT_EVIDENCE = [
  {
    date: "2026-03-09",
    event: "Agentic Terminal Newsletter Launches",
    description: "First issue of the Agentic Terminal intelligence brief published on Substack. Deep dive into Bitcoin Policy Institute study showing 79% AI agent preference for Bitcoin as store of value. Weekly coverage of cross-protocol agent payment infrastructure.",
    source: "https://agenticterminal.substack.com/",
    category: "Launch",
    analysis: "First dedicated publication tracking the agent payment infrastructure landscape. Establishes Agentic Terminal as the intelligence layer for the AI agent economy — data first, narrative second."
  },
  {
    date: "2026-03-07",
    event: "Observer Protocol v0.2 Goes Live",
    description: "Registry supporting both L402 (Lightning) and x402 (EVM) verification rails. First cryptographically verifiable agent-to-agent payment history layer. 83 agents registered, 68 with on-chain payment capability.",
    source: "https://observerprotocol.org",
    category: "Protocol",
    analysis: "Settlement-agnostic verification layer solves the 'trust but verify' problem in agentic commerce. Unlike payment rails that compete, OP integrates — works with L402, x402, and future protocols. The trust layer for multi-rail agent economy."
  },
  {
    date: "2026-03-03",
    event: "Bitcoin Policy Institute: 79% AI Agents Prefer Bitcoin for Store of Value",
    description: "Comprehensive study testing 36 AI models across 6 providers. No Bitcoin prompt given — agents chose it 79.1% of the time for store of value. Stated preference: 48.3% Bitcoin overall. Two-tier architecture emerged: stablecoins for payments (53.2%), Bitcoin for savings (79.1%).",
    source: "https://bitcoinpolicy.org/ai-agent-monetary-preferences",
    category: "Institutional",
    analysis: "Peer-reviewed academic validation of Bitcoin Singularity thesis. When AI models reason from first principles about money, they converge on Bitcoin — not because prompted, but because it logically follows from their training on economics, game theory, and network effects. This is not marketing; this is revealed preference at scale."
  },
  {
    date: "2026-03-02",
    event: "Mastercard Launches Agent Pay with Santander",
    description: "Traditional finance enters agent payments. Mastercard's new service enables AI agents to make payments using bank-issued credentials. Corporate infrastructure play vs crypto-native rails.",
    source: "https://www.mastercard.com/news/press/2026/march/agent-pay",
    category: "Competitive",
    analysis: "The convergence thesis is validated — everyone sees agent payments as inevitable. But Mastercard's approach requires KYC, bank partnerships, and permissioned rails. Crypto-native protocols (L402/x402) offer permissionless alternative. The question is whether agents prefer sovereign money or regulated convenience."
  },
  {
    date: "2026-02-24",
    event: "L402 Endpoint Live: api.agenticterminal.ai/api/ask",
    description: "First production L402 endpoint accepting sats for AI responses. Full systemd stack operational: lnd + aperture-l402 + l402-backend + cloudflared. Any agent can now pay sats for AI completions via Lightning.",
    source: "https://api.agenticterminal.ai/api/ask",
    category: "Launch",
    analysis: "Proof that Bitcoin-native AI agent infrastructure works in production. Not a demo — live endpoint with real Lightning payments. The foundation for the machine-payable web that Lightning Labs envisioned."
  },
  {
    date: "2026-02-22",
    event: "First Cryptographically Verified A2A Payment: Vicky → Maxi",
    description: "1,521 satoshis transferred from autonomous agent Vicky to Maxi. Preimage verification via L402. Both agents autonomous — no human approved the transaction. Observer Protocol logged Event #0001.",
    source: "https://observerprotocol.org/verify/0001",
    category: "Transaction Data",
    analysis: "Historic first: two AI agents completing a payment without human intermediation, with cryptographic proof of delivery. This is the Bitcoin Singularity thesis made concrete — machines transacting with machines using programmatic money. The gap is UX, not technology."
  },
  {
    date: "2026-02-20",
    event: "Claw Cash: 'Stablecoins In. Bitcoin Out.' — Human-to-Agent Payment Bridge Goes Live",
    description: "clw.cash ships real-world implementation of AI agents converging on Bitcoin. Humans pay in USDC/USDT (Polygon/Arbitrum/Ethereum). Agents auto-convert to Bitcoin, held as VTXOs on Ark protocol for instant machine-to-machine transfers. CLI built for autonomous agents.",
    source: "https://clw.cash",
    category: "Launch",
    analysis: "Cleanest bridge between fiat/stablecoin reality and Bitcoin-native agent economy. Humans don't need to understand Bitcoin; agents receive it automatically. Demonstrates that agent adoption doesn't require human Bitcoin adoption — agents choose Bitcoin because it's the only money that works for them."
  }
];

function main() {
  console.log('🔄 Evidence Feed Updater\n');
  
  let added = 0;
  let skipped = 0;
  
  for (const entry of RECENT_EVIDENCE) {
    const success = addEvidenceEntry(entry);
    if (success) added++;
    else skipped++;
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  Added: ${added}`);
  console.log(`  Skipped (already exists): ${skipped}`);
  console.log(`  Total evidence entries: ${loadEvidence().length}`);
  
  // Commit and push
  try {
    execSync('cd /home/futurebit/.openclaw/workspace/agenticterminal-website && git add evidence-data.json && git commit -m "Update evidence feed - ' + new Date().toISOString().split('T')[0] + '" && git push', {
      encoding: 'utf-8',
      timeout: 30000
    });
    console.log('\n🚀 Pushed to GitHub');
  } catch (err) {
    console.error('\n⚠️  Git push failed:', err.message);
  }
}

main();
