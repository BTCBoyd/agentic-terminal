#!/usr/bin/env node
/**
 * Execute Fixed ERC-8004 Dune Query
 * Looks for Claim transactions and IdentityClaimed events
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const DUNE_API_KEY = 'HlEsxBGd6VB1SacjPiAfsGoTy0o3In02';
const CONTRACT = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';

// Better query using event logs
const QUERY_SQL = `
SELECT 
  COUNT(DISTINCT decoded_data['agent']) AS total_registered_agents,
  MIN(block_time) AS first_registration,
  MAX(block_time) AS latest_registration
FROM ethereum.logs
WHERE contract_address = ${CONTRACT}
  AND topic0 = 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0
  AND block_time >= TIMESTAMP '2026-01-01'
`;

// Alternative: Check all transactions to the contract
const QUERY_SQL_V2 = `
SELECT 
  COUNT(DISTINCT "from") AS total_unique_addresses,
  COUNT(*) AS total_transactions,
  MIN(block_time) AS first_tx,
  MAX(block_time) AS latest_tx
FROM ethereum.transactions
WHERE to_address = ${CONTRACT}
  AND success = true
  AND block_time >= TIMESTAMP '2026-01-01'
`;

async function executeQuery(sql, description) {
  console.log(`🔍 ${description}...\n`);
  
  // Create query
  const createRes = await fetch('https://api.dune.com/api/v1/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Dune-API-Key': DUNE_API_KEY
    },
    body: JSON.stringify({
      name: `ERC-8004 ${description}`,
      query_sql: sql,
      network: 'ethereum'
    })
  });
  
  if (!createRes.ok) {
    console.error('Failed to create query:', await createRes.text());
    return null;
  }
  
  const { query_id } = await createRes.json();
  console.log(`Created query ${query_id}, executing...`);
  
  // Execute
  const execRes = await fetch(`https://api.dune.com/api/v1/query/${query_id}/execute`, {
    method: 'POST',
    headers: { 'X-Dune-API-Key': DUNE_API_KEY }
  });
  
  const { execution_id } = await execRes.json();
  
  // Poll for results
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    
    const statusRes = await fetch(
      `https://api.dune.com/api/v1/execution/${execution_id}/results`,
      { headers: { 'X-Dune-API-Key': DUNE_API_KEY } }
    );
    
    if (!statusRes.ok) continue;
    
    const data = await statusRes.json();
    if (data.result?.rows) {
      return {
        query_id,
        execution_id,
        data: data.result.rows[0]
      };
    }
  }
  
  return null;
}

async function main() {
  console.log('🔍 Re-querying ERC-8004 with corrected logic...\n');
  
  // Try both approaches
  const results = [];
  
  const eventResult = await executeQuery(QUERY_SQL, 'Event Logs Approach');
  if (eventResult) results.push({ method: 'events', ...eventResult });
  
  const txResult = await executeQuery(QUERY_SQL_V2, 'All Transactions');
  if (txResult) results.push({ method: 'transactions', ...txResult });
  
  console.log('\n📊 Results:');
  results.forEach(r => {
    console.log(`\n${r.method.toUpperCase()}:`);
    console.log('  Data:', JSON.stringify(r.data, null, 2));
  });
  
  // Save best result
  if (results.length > 0) {
    const best = results[0]; // Use first valid result
    const outputDir = resolve(process.env.HOME, '.openclaw/workspace/agentic-terminal-data/erc8004');
    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
    
    const output = {
      timestamp: new Date().toISOString(),
      contract: CONTRACT,
      method: best.method,
      query_id: best.query_id,
      data: best.data,
      status: 'success'
    };
    
    writeFileSync(resolve(outputDir, 'dune-corrected.json'), JSON.stringify(output, null, 2));
    console.log('\n✅ Saved to dune-corrected.json');
  }
}

main().catch(console.error);
