#!/usr/bin/env node
/**
 * ERC-8004 On-Chain Data Collection (HTTP API Version)
 * Uses public Ethereum RPC endpoints
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

const CONTRACT_ADDRESS = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';

// totalSupply() function signature
const TOTAL_SUPPLY_DATA = '0x18160ddd';

const RPC_ENDPOINTS = [
  'https://eth.llamarpc.com',
  'https://rpc.ankr.com/eth',
  'https://ethereum.publicnode.com'
];

async function queryContract(rpcUrl) {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{
        to: CONTRACT_ADDRESS,
        data: TOTAL_SUPPLY_DATA
      }, 'latest']
    })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }
  
  // Convert hex to decimal
  const hexValue = data.result;
  const decimalValue = parseInt(hexValue, 16);
  
  return decimalValue;
}

async function main() {
  console.log('🔍 Querying ERC-8004 Identity Registry...\n');
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log('');
  
  let agentCount = null;
  let lastError = null;
  
  for (const rpcUrl of RPC_ENDPOINTS) {
    try {
      console.log(`Trying: ${rpcUrl}`);
      agentCount = await queryContract(rpcUrl);
      console.log(`✅ Success: ${agentCount.toLocaleString()} agents\n`);
      break;
    } catch (err) {
      lastError = err;
      console.log(`❌ Failed: ${err.message}\n`);
    }
  }
  
  if (agentCount === null) {
    console.error('💥 All RPC endpoints failed');
    throw lastError;
  }
  
  const result = {
    timestamp: new Date().toISOString(),
    contract: CONTRACT_ADDRESS,
    network: 'ethereum-mainnet',
    standard: 'ERC-8004',
    data: {
      total_agents: agentCount,
      source: 'on-chain'
    },
    query_method: 'eth_call totalSupply()'
  };
  
  // Ensure directory exists
  const outputDir = resolve(process.env.HOME, '.openclaw/workspace/agentic-terminal-data/erc8004');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  const outputFile = resolve(outputDir, 'latest.json');
  writeFileSync(outputFile, JSON.stringify(result, null, 2));
  
  console.log('📊 Result:');
  console.log(`  Total Agents: ${agentCount.toLocaleString()}`);
  console.log(`  Saved: ${outputFile}`);
  
  return result;
}

main().then(() => {
  console.log('\n✅ Complete');
  process.exit(0);
}).catch(err => {
  console.error('\n💥 Failed:', err.message);
  process.exit(1);
});
