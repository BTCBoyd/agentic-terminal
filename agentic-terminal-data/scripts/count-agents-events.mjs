#!/usr/bin/env node
/**
 * ERC-8004 Agent Count via Event Logs
 * 
 * Counts AgentRegistered events to get accurate agent count
 * ERC-8004 uses Transfer events from ERC-721
 */

const PROXY_ADDRESS = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';

// ERC-721 Transfer event signature: Transfer(address,address,uint256)
const TRANSFER_EVENT_SIGNATURE = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

// Alternative: AgentRegistered event if custom
const AGENT_REGISTERED_SIGNATURE = '0x4167ea7d35dd96e47714ff77fb8aa07eb0ec7e6c98f462b8b46bc5b6fe5d5a87';

const RPC_ENDPOINTS = [
  'https://eth.llamarpc.com',
  'https://ethereum.publicnode.com'
];

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
  if (data) console.log(data);
}

async function findWorkingRpc() {
  for (const rpc of RPC_ENDPOINTS) {
    try {
      const response = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_blockNumber',
          params: []
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        log('INFO', `Connected to ${rpc} (block ${parseInt(data.result, 16)})`);
        return rpc;
      }
    } catch (e) {
      continue;
    }
  }
  throw new Error('No working RPC');
}

async function getLogs(rpcUrl, address, topic, fromBlock, toBlock) {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getLogs',
        params: [{
          address,
          topics: [topic],
          fromBlock,
          toBlock
        }]
      })
    });
    
    const result = await response.json();
    return result.result || [];
  } catch (error) {
    log('ERROR', `getLogs failed: ${error.message}`);
    return [];
  }
}

async function getBlockNumber(rpcUrl) {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_blockNumber',
        params: []
      })
    });
    
    const result = await response.json();
    return parseInt(result.result, 16);
  } catch (error) {
    return null;
  }
}

async function main() {
  log('INFO', '=== ERC-8004 Agent Count via Events ===');
  
  const rpcUrl = await findWorkingRpc();
  const currentBlock = await getBlockNumber(rpcUrl);
  
  if (!currentBlock) {
    log('ERROR', 'Could not get current block number');
    return;
  }
  
  log('INFO', `Current block: ${currentBlock.toLocaleString()}`);
  
  // Estimate deployment block (contract deployed ~Jan 2025 based on 8004.org)
  // Ethereum block time ~12s, so Jan 2025 (~March 2025 now) is about 2 months = ~360,000 blocks
  const estimatedDeployBlock = currentBlock - 400000; // Conservative estimate
  const fromBlock = '0x' + estimatedDeployBlock.toString(16);
  const toBlock = 'latest';
  
  log('INFO', `Searching logs from block ${estimatedDeployBlock.toLocaleString()}...`);
  
  // Get Transfer events
  log('INFO', 'Fetching Transfer events (ERC-721 mints)...');
  const logs = await getLogs(rpcUrl, PROXY_ADDRESS, TRANSFER_EVENT_SIGNATURE, fromBlock, toBlock);
  
  log('INFO', `Found ${logs.length} Transfer events`);
  
  // Filter for mints (from = address(0))
  const mints = logs.filter(log => {
    // In Transfer event: topics[1] = from, topics[2] = to
    // Mint is from 0x000...000
    const from = log.topics[1];
    return from === '0x0000000000000000000000000000000000000000000000000000000000000000';
  });
  
  log('SUCCESS', `Found ${mints.length} mint events (agent registrations)`);
  
  // Check for burns (to = address(0))
  const burns = logs.filter(log => {
    const to = log.topics[2];
    return to === '0x0000000000000000000000000000000000000000000000000000000000000000';
  });
  
  log('INFO', `Found ${burns.length} burn events (agent removals)`);
  
  const netAgents = mints.length - burns.length;
  
  console.log('\n========== AGENT COUNT RESULT ==========');
  console.log(`Total Mint Events: ${mints.length.toLocaleString()}`);
  console.log(`Total Burn Events: ${burns.length.toLocaleString()}`);
  console.log(`Net Agent Count: ${netAgents.toLocaleString()}`);
  console.log(`========================================\n`);
  
  // Get a few recent mints as samples
  const recentMints = mints.slice(-5);
  console.log('Recent Agent Registrations:');
  recentMints.forEach((log, i) => {
    const tokenId = parseInt(log.topics[3], 16);
    const to = '0x' + log.topics[2].slice(-40);
    console.log(`  ${i + 1}. Token ID ${tokenId} -> ${to.slice(0, 20)}...`);
  });
  
  return {
    totalMints: mints.length,
    totalBurns: burns.length,
    netAgents,
    method: 'event_logs'
  };
}

main().catch(console.error);
