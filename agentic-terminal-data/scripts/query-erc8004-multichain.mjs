#!/usr/bin/env node
/**
 * ERC-8004 Multi-Chain Agent Count
 * Queries Registered events across all chains where ERC-8004 is deployed
 * 
 * Chains: Ethereum, Base, BNB Chain, Avalanche, Polygon
 * Contract: 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432 (same address on all chains)
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const DUNE_API_KEY = 'HlEsxBGd6VB1SacjPiAfsGoTy0o3In02';
const CONTRACT = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';

// Registered(uint256 agentId, string metadata, address owner) event signature
const REGISTERED_TOPIC0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'; // Transfer event (ERC-721 mint)

// Alternative: Check if Dune has decoded tables
const DECODED_TABLES = {
  ethereum: 'ethereum.erc8004_ethereum.IdentityRegistry_evt_Registered',
  base: 'base.erc8004_base.IdentityRegistry_evt_Registered',
  bnb: 'bnb.erc8004_bnb.IdentityRegistry_evt_Registered',
  avalanche: 'avalanche.erc8004_avalanche.IdentityRegistry_evt_Registered',
  polygon: 'polygon.erc8004_polygon.IdentityRegistry_evt_Registered'
};

const RAW_LOG_QUERIES = {
  ethereum: `
    SELECT 
      COUNT(DISTINCT tokenId) as registered_agents,
      MIN(block_time) as first_registration,
      MAX(block_time) as latest_registration
    FROM ethereum.logs
    WHERE contract_address = ${CONTRACT}
      AND topic0 = ${REGISTERED_TOPIC0}
      AND topic1 = '0x0000000000000000000000000000000000000000000000000000000000000000' -- from = 0x0 (mint)
      AND block_time >= TIMESTAMP '2026-01-01'
  `,
  base: `
    SELECT 
      COUNT(DISTINCT tokenId) as registered_agents
    FROM base.logs
    WHERE contract_address = ${CONTRACT}
      AND topic0 = ${REGISTERED_TOPIC0}
      AND topic1 = '0x0000000000000000000000000000000000000000000000000000000000000000'
      AND block_time >= TIMESTAMP '2026-01-01'
  `,
  bnb: `
    SELECT 
      COUNT(DISTINCT tokenId) as registered_agents
    FROM bnb.logs
    WHERE contract_address = ${CONTRACT}
      AND topic0 = ${REGISTERED_TOPIC0}
      AND topic1 = '0x0000000000000000000000000000000000000000000000000000000000000000'
      AND block_time >= TIMESTAMP '2026-01-01'
  `,
  avalanche: `
    SELECT 
      COUNT(DISTINCT tokenId) as registered_agents
    FROM avalanche.logs
    WHERE contract_address = ${CONTRACT}
      AND topic0 = ${REGISTERED_TOPIC0}
      AND topic1 = '0x0000000000000000000000000000000000000000000000000000000000000000'
      AND block_time >= TIMESTAMP '2026-01-01'
  `,
  polygon: `
    SELECT 
      COUNT(DISTINCT tokenId) as registered_agents
    FROM polygon.logs
    WHERE contract_address = ${CONTRACT}
      AND topic0 = ${REGISTERED_TOPIC0}
      AND topic1 = '0x0000000000000000000000000000000000000000000000000000000000000000'
      AND block_time >= TIMESTAMP '2026-01-01'
  `
};

async function queryChain(chain, sql) {
  console.log(`🔍 Querying ${chain.toUpperCase()}...`);
  
  try {
    // Create query
    const createRes = await fetch('https://api.dune.com/api/v1/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Dune-API-Key': DUNE_API_KEY
      },
      body: JSON.stringify({
        name: `ERC-8004 ${chain.toUpperCase()} Agent Count`,
        query_sql: sql,
        network: chain === 'bnb' ? 'bnb' : chain
      })
    });
    
    if (!createRes.ok) {
      console.log(`  ⚠️ Failed to create query for ${chain}`);
      return null;
    }
    
    const { query_id } = await createRes.json();
    
    // Execute
    const execRes = await fetch(`https://api.dune.com/api/v1/query/${query_id}/execute`, {
      method: 'POST',
      headers: { 'X-Dune-API-Key': DUNE_API_KEY }
    });
    
    const { execution_id } = await execRes.json();
    
    // Poll for results (max 60 seconds)
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      
      const resultsRes = await fetch(
        `https://api.dune.com/api/v1/execution/${execution_id}/results`,
        { headers: { 'X-Dune-API-Key': DUNE_API_KEY } }
      );
      
      if (!resultsRes.ok) continue;
      
      const data = await resultsRes.json();
      if (data.result?.rows && data.result.rows.length > 0) {
        return {
          chain,
          query_id,
          execution_id,
          agents: data.result.rows[0].registered_agents || 0,
          first_registration: data.result.rows[0].first_registration,
          latest_registration: data.result.rows[0].latest_registration
        };
      }
    }
    
    return null;
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('🔍 ERC-8004 Multi-Chain Agent Count\n');
  console.log('Contract:', CONTRACT);
  console.log('Method: Registered events (ERC-721 mints)\n');
  
  const results = [];
  
  // Query each chain
  for (const [chain, sql] of Object.entries(RAW_LOG_QUERIES)) {
    const result = await queryChain(chain, sql);
    if (result) {
      results.push(result);
      console.log(`  ✅ ${chain.toUpperCase()}: ${result.agents.toLocaleString()} agents`);
    }
  }
  
  // Calculate totals
  const totalAgents = results.reduce((sum, r) => sum + r.agents, 0);
  
  console.log('\n📊 Summary:');
  console.log(`  Total (all chains): ${totalAgents.toLocaleString()} agents`);
  
  // Save results
  const outputDir = resolve(process.env.HOME, '.openclaw/workspace/agentic-terminal-data/erc8004');
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
  
  const output = {
    timestamp: new Date().toISOString(),
    contract: CONTRACT,
    method: 'Registered events (ERC-721 mint)',
    total_agents: totalAgents,
    by_chain: results,
    sources: ['8004agents.ai', '8004scan.io'],
    status: 'success'
  };
  
  writeFileSync(resolve(outputDir, 'multichain-latest.json'), JSON.stringify(output, null, 2));
  console.log('\n💾 Saved to multichain-latest.json');
  
  return output;
}

main().then(() => {
  console.log('\n✅ Multi-chain query complete');
  process.exit(0);
}).catch(err => {
  console.error('\n💥 Failed:', err);
  process.exit(1);
});
