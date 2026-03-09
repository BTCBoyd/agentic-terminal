#!/usr/bin/env node
/**
 * ERC-8004 On-Chain Data via Dune Analytics
 * 
 * Dune Query: https://dune.com/queries/6094619 (adapted for ERC-8004)
 * Contract: 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
 * 
 * Uses Dune's free API tier - no paid node access needed
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const DUNE_API_KEY = process.env.DUNE_API_KEY || 'GpCAQfZ7NyDLqtmpu4FjSfsCFKQ9tqnY';
const ERC8004_CONTRACT = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';

// Try to find existing Dune query for this contract, or create new one
async function queryERC8004ViaDune() {
  console.log('🔍 Querying ERC-8004 via Dune Analytics...\n');
  
  // For now, use a simple approach: query Dune's Ethereum dataset
  // This uses Dune's free API - no paid node required
  
  const query = `
    SELECT 
      COUNT(DISTINCT from_address) as agent_count,
      MAX(block_time) as last_activity
    FROM ethereum.traces
    WHERE to_address = '${ERC8004_CONTRACT.toLowerCase()}'
      AND trace_type = 'call'
      AND tx_success = true
    UNION ALL
    SELECT
      COUNT(DISTINCT "from") as agent_count,
      MAX(block_time) as last_activity
    FROM ethereum.transactions
    WHERE to_address = '${ERC8004_CONTRACT.toLowerCase()}'
  `;
  
  console.log('Query:', query.substring(0, 100) + '...\n');
  
  // Dune API endpoint for executing queries
  const executeUrl = 'https://api.dune.com/api/v1/query/6094619/execute';
  
  try {
    // For now, let's use a workaround - check if there's already a query
    // or use the execute endpoint
    const response = await fetch(executeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Dune-API-Key': DUNE_API_KEY
      },
      body: JSON.stringify({
        query_parameters: {
          contract_address: ERC8004_CONTRACT
        }
      })
    });
    
    if (!response.ok) {
      // Try alternative: existing public query
      return await queryViaPublicDune();
    }
    
    const result = await response.json();
    const executionId = result.execution_id;
    
    console.log(`✅ Query submitted. Execution ID: ${executionId}`);
    console.log('⏳ Waiting for results (may take 30-60 seconds)...\n');
    
    // Poll for results
    return await pollForResults(executionId);
    
  } catch (err) {
    console.error('❌ Dune API error:', err.message);
    return await queryViaPublicDune();
  }
}

async function queryViaPublicDune() {
  // Fallback: Use Dune's public query feature
  // Search for existing queries on this contract
  
  console.log('🔍 Trying public Dune query search...\n');
  
  const searchUrl = `https://dune.com/api/v1/queries?contract=${ERC8004_CONTRACT}`;
  
  try {
    const response = await fetch(searchUrl, {
      headers: { 'X-Dune-API-Key': DUNE_API_KEY }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Found queries:', data);
    }
  } catch (err) {
    console.log('Public search not available, using manual estimate...\n');
  }
  
  // TEMPORARY: Use manual check via direct contract interaction
  return await queryViaDirectCall();
}

async function queryViaDirectCall() {
  // Use public Ethereum RPC for a simple eth_call
  // This is free and doesn't require Alchemy/Infura paid tier
  
  console.log('🔍 Using public RPC for direct contract call...\n');
  
  // totalSupply() function selector
  const data = '0x18160ddd';
  
  const rpcUrls = [
    'https://eth.llamarpc.com',
    'https://rpc.ankr.com/eth',
    'https://ethereum.publicnode.com',
    'https://cloudflare-eth.com'
  ];
  
  for (const rpcUrl of rpcUrls) {
    try {
      console.log(`Trying: ${rpcUrl}`);
      
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [{
            to: ERC8004_CONTRACT,
            data: data
          }, 'latest']
        })
      });
      
      if (!response.ok) continue;
      
      const result = await response.json();
      
      if (result.error) {
        console.log(`  Error: ${result.error.message}`);
        continue;
      }
      
      // Parse result
      const hexValue = result.result;
      const agentCount = parseInt(hexValue, 16);
      
      console.log(`✅ Success! Agent count: ${agentCount.toLocaleString()}\n`);
      
      return {
        timestamp: new Date().toISOString(),
        contract: ERC8004_CONTRACT,
        network: 'ethereum-mainnet',
        standard: 'ERC-8004',
        data: {
          total_agents: agentCount,
          source: 'on-chain',
          rpc_endpoint: rpcUrl,
          query_method: 'eth_call totalSupply()'
        },
        status: 'success'
      };
      
    } catch (err) {
      console.log(`  Failed: ${err.message}\n`);
    }
  }
  
  throw new Error('All RPC endpoints failed');
}

async function pollForResults(executionId) {
  // Poll Dune for query results
  const maxAttempts = 30;
  const delayMs = 2000;
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, delayMs));
    
    try {
      const response = await fetch(
        `https://api.dune.com/api/v1/execution/${executionId}/results`,
        { headers: { 'X-Dune-API-Key': DUNE_API_KEY } }
      );
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      if (data.state === 'QUERY_STATE_COMPLETED') {
        return {
          timestamp: new Date().toISOString(),
          contract: ERC8004_CONTRACT,
          dune_execution_id: executionId,
          data: data.result?.rows?.[0] || { total_agents: 0 },
          status: 'success'
        };
      }
      
      if (data.state === 'QUERY_STATE_FAILED') {
        throw new Error('Dune query failed');
      }
      
      console.log(`  Attempt ${i + 1}/${maxAttempts}: ${data.state}...`);
      
    } catch (err) {
      console.log(`  Poll error: ${err.message}`);
    }
  }
  
  throw new Error('Query timeout');
}

async function main() {
  try {
    const result = await queryERC8004ViaDune();
    
    // Save result
    const outputDir = resolve(process.env.HOME, '.openclaw/workspace/agentic-terminal-data/erc8004');
    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
    
    const outputFile = resolve(outputDir, 'latest.json');
    writeFileSync(outputFile, JSON.stringify(result, null, 2));
    
    console.log('💾 Saved to:', outputFile);
    console.log('\n✅ ERC-8004 query complete');
    
    return result;
    
  } catch (err) {
    console.error('\n💥 Failed:', err.message);
    process.exit(1);
  }
}

main();
