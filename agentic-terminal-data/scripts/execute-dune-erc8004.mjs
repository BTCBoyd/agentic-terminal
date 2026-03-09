#!/usr/bin/env node
/**
 * Execute ERC-8004 Dune Query
 * Creates and executes query via Dune API
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const DUNE_API_KEY = process.env.DUNE_API_KEY;
const QUERY_SQL = `
WITH agent_transactions AS (
  SELECT 
    DISTINCT "from" AS agent_address,
    MIN(block_time) AS first_registration
  FROM ethereum.transactions
  WHERE to_address = 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
    AND success = true
    AND block_time >= TIMESTAMP '2026-01-01'
),

agent_calls AS (
  SELECT 
    DISTINCT "from" AS agent_address,
    MIN(block_time) AS first_registration
  FROM ethereum.traces
  WHERE to_address = 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
    AND trace_type = 'call'
    AND tx_success = true
    AND block_time >= TIMESTAMP '2026-01-01'
)

SELECT 
  COUNT(DISTINCT agent_address) AS total_registered_agents,
  MIN(first_registration) AS first_registration_date,
  MAX(first_registration) AS latest_registration_date
FROM (
  SELECT * FROM agent_transactions
  UNION
  SELECT * FROM agent_calls
)
`;

async function createAndExecuteQuery() {
  console.log('🔍 Creating ERC-8004 Dune query...\n');
  
  // Step 1: Create query
  const createResponse = await fetch('https://api.dune.com/api/v1/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Dune-API-Key': DUNE_API_KEY
    },
    body: JSON.stringify({
      name: 'ERC-8004 Agent Registry Count',
      description: 'Count of unique agents registered on ERC-8004 Identity Registry',
      query_sql: QUERY_SQL,
      network: 'ethereum'
    })
  });
  
  if (!createResponse.ok) {
    throw new Error(`Failed to create query: ${createResponse.status}`);
  }
  
  const queryData = await createResponse.json();
  console.log('✅ Query created:', queryData.query_id);
  
  // Step 2: Execute query
  console.log('⏳ Executing query (may take 30-60 seconds)...\n');
  
  const executeResponse = await fetch(`https://api.dune.com/api/v1/query/${queryData.query_id}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Dune-API-Key': DUNE_API_KEY
    }
  });
  
  const executeData = await executeResponse.json();
  const executionId = executeData.execution_id;
  
  // Step 3: Poll for results
  let attempts = 0;
  const maxAttempts = 60;
  
  while (attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 2000));
    attempts++;
    
    const statusResponse = await fetch(
      `https://api.dune.com/api/v1/execution/${executionId}/status`,
      { headers: { 'X-Dune-API-Key': DUNE_API_KEY } }
    );
    
    const statusData = await statusResponse.json();
    console.log(`  Attempt ${attempts}/${maxAttempts}: ${statusData.state}...`);
    
    if (statusData.state === 'QUERY_STATE_COMPLETED') {
      // Get results
      const resultsResponse = await fetch(
        `https://api.dune.com/api/v1/execution/${executionId}/results`,
        { headers: { 'X-Dune-API-Key': DUNE_API_KEY } }
      );
      
      const resultsData = await resultsResponse.json();
      
      const result = {
        timestamp: new Date().toISOString(),
        query_id: queryData.query_id,
        execution_id: executionId,
        contract: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
        data: resultsData.result?.rows?.[0] || {},
        status: 'success'
      };
      
      // Save result
      const outputDir = resolve(process.env.HOME, '.openclaw/workspace/agentic-terminal-data/erc8004');
      if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
      
      writeFileSync(resolve(outputDir, 'dune-latest.json'), JSON.stringify(result, null, 2));
      
      console.log('\n✅ Success!');
      console.log('Agent count:', result.data.total_registered_agents);
      console.log('Saved to:', resolve(outputDir, 'dune-latest.json'));
      
      return result;
    }
    
    if (statusData.state === 'QUERY_STATE_FAILED') {
      throw new Error('Query execution failed');
    }
  }
  
  throw new Error('Query timeout');
}

if (!DUNE_API_KEY) {
  console.error('❌ DUNE_API_KEY environment variable required');
  process.exit(1);
}

createAndExecuteQuery().then(() => {
  console.log('\n✅ ERC-8004 data collected from Dune');
  process.exit(0);
}).catch(err => {
  console.error('\n💥 Failed:', err.message);
  process.exit(1);
});
