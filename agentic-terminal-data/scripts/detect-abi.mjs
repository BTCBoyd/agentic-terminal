#!/usr/bin/env node
/**
 * ERC-8004 Implementation Contract ABI Detector
 * 
 * Tries different function signatures to find the correct agent count method
 * Uses 4byte.directory and brute-force common patterns
 */

const IDENTITY_IMPL = '0x7274e874ca62410a93bd8bf61c69d8045e399c02';
const REPUTATION_IMPL = '0x16e0fa7f7c56b9a767e34b192b51f921be31da34';

const RPC_ENDPOINTS = [
  'https://eth.llamarpc.com',
  'https://ethereum.publicnode.com'
];

// Common function signatures for agent/registry contracts
const FUNCTION_SIGNATURES = [
  // Standard ERC-721
  { name: 'totalSupply()', selector: '0x18160ddd' },
  { name: '_totalSupply()', selector: '0x3eaaf86b' },
  { name: 'balanceOf(address)', selector: '0x70a08231' },
  
  // Common registry patterns
  { name: 'getAgentCount()', selector: '0x59e46c46' },
  { name: 'agentCount()', selector: '0xbc68c2bf' },
  { name: 'getTotalAgents()', selector: '0x9b71c8fb' },
  { name: 'totalAgents()', selector: '0x1e93b031' },
  { name: 'getCount()', selector: '0xa0c1e3b2' },
  { name: 'count()', selector: '0x06661abd' },
  
  // ID/Identity patterns
  { name: 'getIdCount()', selector: '0x4f558e79' },
  { name: 'idCount()', selector: '0x7397161a' },
  { name: 'getIdentityCount()', selector: '0x6fc1b31a' },
  { name: 'identityCount()', selector: '0x38d4b01b' },
  
  // Registry-specific
  { name: 'registeredCount()', selector: '0x7b04e43d' },
  { name: 'getRegisteredCount()', selector: '0x5c628d8f' },
  { name: 'registrySize()', selector: '0x6373ea3f' },
  { name: 'size()', selector: '0x949d225d' },
  
  // Upgradeable patterns
  { name: 'getImplementation()', selector: '0x5c60da1b' },
  { name: 'implementation()', selector: '0x5c60da1b' },
  
  // Owner patterns
  { name: 'owner()', selector: '0x8da5cb5b' },
  { name: 'getOwner()', selector: '0x893d20e8' },
  { name: 'admin()', selector: '0xf851a440' },
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
        return rpc;
      }
    } catch (e) {
      continue;
    }
  }
  throw new Error('No working RPC');
}

async function tryFunction(rpcUrl, contract, selector, name) {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{ to: contract, data: selector }, 'latest']
      })
    });
    
    const result = await response.json();
    
    if (result.error) {
      return { success: false, error: result.error.message };
    }
    
    if (result.result && result.result !== '0x' && result.result !== '0x0') {
      // Try to decode as uint256
      const decoded = parseInt(result.result, 16);
      return { success: true, raw: result.result, decoded, name };
    }
    
    return { success: false, empty: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getContractCode(rpcUrl, address) {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getCode',
        params: [address, 'latest']
      })
    });
    
    const result = await response.json();
    return result.result;
  } catch (error) {
    return null;
  }
}

async function main() {
  log('INFO', '=== ERC-8004 ABI Detection ===');
  
  const rpcUrl = await findWorkingRpc();
  log('INFO', `Using RPC: ${rpcUrl}`);
  
  // Check code at implementation
  const code = await getContractCode(rpcUrl, IDENTITY_IMPL);
  log('INFO', `Implementation contract code length: ${code?.length || 0} bytes`);
  
  if (!code || code === '0x') {
    log('ERROR', 'No code found at implementation address - may be self-destructed or wrong address');
    return;
  }
  
  log('INFO', '\n=== Testing Function Signatures ===');
  
  const working = [];
  
  for (const func of FUNCTION_SIGNATURES) {
    const result = await tryFunction(rpcUrl, IDENTITY_IMPL, func.selector, func.name);
    
    if (result.success) {
      log('SUCCESS', `✓ ${func.name}: ${result.decoded.toLocaleString()} (raw: ${result.raw})`);
      working.push({ ...func, ...result });
    } else if (result.error && !result.error.includes('execution reverted')) {
      log('INFO', `? ${func.name}: ${result.error}`);
    }
    
    // Small delay to be nice to RPC
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log('\n=== WORKING FUNCTIONS ===');
  if (working.length === 0) {
    console.log('No working functions found.');
    console.log('\nPossible reasons:');
    console.log('1. Contract requires specific initialization');
    console.log('2. Contract uses non-standard function signatures');
    console.log('3. Contract may have access controls');
    console.log('4. Implementation may be a library, not a standalone contract');
    
    console.log('\n=== RECOMMENDATION ===');
    console.log('Use documented estimate: 24,500 agents (from 8004.org)');
    console.log('Or query via official API if available');
  } else {
    working.forEach(w => {
      console.log(`${w.name}: ${w.decoded.toLocaleString()}`);
    });
  }
  
  // Also try the proxy contract itself
  log('INFO', '\n=== Testing Proxy Contract Directly ===');
  const PROXY = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';
  
  for (const func of FUNCTION_SIGNATURES.slice(0, 5)) {
    const result = await tryFunction(rpcUrl, PROXY, func.selector, func.name);
    if (result.success) {
      log('SUCCESS', `✓ Proxy ${func.name}: ${result.decoded.toLocaleString()}`);
    }
    await new Promise(r => setTimeout(r, 100));
  }
}

main().catch(console.error);
