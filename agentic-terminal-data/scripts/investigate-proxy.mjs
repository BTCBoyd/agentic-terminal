#!/usr/bin/env node
/**
 * ERC-8004 Proxy Contract Investigator
 * 
 * Checks for common proxy patterns:
 * - EIP-1967: Standard proxy storage slots
 * - EIP-1822: Universal Upgradeable Proxy Standard (UUPS)
 * - OpenZeppelin: Legacy proxy patterns
 * 
 * Usage: node investigate-proxy.mjs
 */

// EIP-1967 standard storage slots
const EIP1967_SLOTS = {
  // keccak256("eip1967.proxy.implementation") - 1
  implementation: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
  // keccak256("eip1967.proxy.beacon") - 1  
  beacon: '0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50',
  // keccak256("eip1967.proxy.admin") - 1
  admin: '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103'
};

// ERC-1822 UUPS pattern
const ERC1822_SLOT = '0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7';

// OpenZeppelin legacy patterns
const OZ_LEGACY_SLOTS = [
  '0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3', // implementation
  '0x10d6a54a4754c8869d6886b5f5d7fbfa5b4522237ea5c60d11bc4e7a1ff9390b', // admin
];

const CONTRACTS = {
  identityRegistry: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
  reputationRegistry: '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63'
};

const RPC_ENDPOINTS = [
  'https://eth.llamarpc.com',
  'https://ethereum.publicnode.com',
  'https://eth.drpc.org'
];

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
}

async function getStorageAt(rpcUrl, address, slot) {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getStorageAt',
        params: [address, slot, 'latest']
      })
    });
    
    const result = await response.json();
    return result.result;
  } catch (error) {
    return null;
  }
}

function decodeAddress(storageValue) {
  if (!storageValue || storageValue === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    return null;
  }
  // Last 20 bytes (40 hex chars) contain the address
  return '0x' + storageValue.slice(-40);
}

async function checkProxyPattern(rpcUrl, address) {
  log('INFO', `Checking proxy patterns for ${address}...`);
  
  const results = {
    address,
    patterns: {}
  };
  
  // Check EIP-1967
  const eip1967Impl = await getStorageAt(rpcUrl, address, EIP1967_SLOTS.implementation);
  const eip1967Admin = await getStorageAt(rpcUrl, address, EIP1967_SLOTS.admin);
  const eip1967Beacon = await getStorageAt(rpcUrl, address, EIP1967_SLOTS.beacon);
  
  results.patterns.eip1967 = {
    detected: !!decodeAddress(eip1967Impl),
    implementation: decodeAddress(eip1967Impl),
    admin: decodeAddress(eip1967Admin),
    beacon: decodeAddress(eip1967Beacon)
  };
  
  // Check ERC-1822 (UUPS)
  const erc1822Impl = await getStorageAt(rpcUrl, address, ERC1822_SLOT);
  results.patterns.erc1822 = {
    detected: !!decodeAddress(erc1822Impl),
    implementation: decodeAddress(erc1822Impl),
    logicContract: decodeAddress(erc1822Impl)
  };
  
  // Check OpenZeppelin legacy
  for (let i = 0; i < OZ_LEGACY_SLOTS.length; i++) {
    const value = await getStorageAt(rpcUrl, address, OZ_LEGACY_SLOTS[i]);
    const addr = decodeAddress(value);
    if (addr) {
      results.patterns.openzeppelin = {
        detected: true,
        implementation: addr,
        slot: OZ_LEGACY_SLOTS[i]
      };
      break;
    }
  }
  
  if (!results.patterns.openzeppelin) {
    results.patterns.openzeppelin = { detected: false };
  }
  
  // Determine primary pattern
  if (results.patterns.eip1967.detected) {
    results.primaryPattern = 'EIP-1967';
    results.implementationAddress = results.patterns.eip1967.implementation;
  } else if (results.patterns.erc1822.detected) {
    results.primaryPattern = 'ERC-1822 (UUPS)';
    results.implementationAddress = results.patterns.erc1822.implementation;
  } else if (results.patterns.openzeppelin.detected) {
    results.primaryPattern = 'OpenZeppelin Legacy';
    results.implementationAddress = results.patterns.openzeppelin.implementation;
  } else {
    results.primaryPattern = 'Unknown';
    results.implementationAddress = null;
  }
  
  return results;
}

async function queryImplementationContract(rpcUrl, implAddress) {
  log('INFO', `Querying implementation contract at ${implAddress}...`);
  
  // Standard ERC-721 totalSupply selector
  const totalSupplySelector = '0x18160ddd';
  
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{ 
          to: implAddress, 
          data: totalSupplySelector 
        }, 'latest']
      })
    });
    
    const result = await response.json();
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    if (result.result && result.result !== '0x') {
      const count = parseInt(result.result, 16);
      return { success: true, count, raw: result.result };
    }
    
    return { success: false, error: 'Empty response' };
  } catch (error) {
    return { success: false, error: error.message };
  }
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
  throw new Error('No working RPC endpoint found');
}

async function main() {
  log('INFO', '=== ERC-8004 Proxy Contract Investigation ===');
  
  try {
    const rpcUrl = await findWorkingRpc();
    
    // Check Identity Registry
    const identityResults = await checkProxyPattern(rpcUrl, CONTRACTS.identityRegistry);
    log('INFO', `\n=== Identity Registry (${CONTRACTS.identityRegistry}) ===`);
    log('INFO', `Primary Pattern: ${identityResults.primaryPattern}`);
    log('INFO', `Implementation: ${identityResults.implementationAddress || 'Not found'}`);
    
    // Check Reputation Registry
    const reputationResults = await checkProxyPattern(rpcUrl, CONTRACTS.reputationRegistry);
    log('INFO', `\n=== Reputation Registry (${CONTRACTS.reputationRegistry}) ===`);
    log('INFO', `Primary Pattern: ${reputationResults.primaryPattern}`);
    log('INFO', `Implementation: ${reputationResults.implementationAddress || 'Not found'}`);
    
    // If we found implementation, query it directly
    if (identityResults.implementationAddress) {
      log('INFO', '\n=== Querying Implementation Contract ===');
      const implQuery = await queryImplementationContract(rpcUrl, identityResults.implementationAddress);
      
      if (implQuery.success) {
        log('SUCCESS', `Implementation totalSupply: ${implQuery.count.toLocaleString()} agents`);
        identityResults.implementationQuery = implQuery;
      } else {
        log('WARN', `Implementation query failed: ${implQuery.error}`);
      }
    }
    
    // Summary
    console.log('\n========== INVESTIGATION SUMMARY ==========');
    console.log(`Identity Registry: ${CONTRACTS.identityRegistry}`);
    console.log(`  Pattern: ${identityResults.primaryPattern}`);
    console.log(`  Implementation: ${identityResults.implementationAddress || 'N/A'}`);
    if (identityResults.implementationQuery?.success) {
      console.log(`  Total Agents: ${identityResults.implementationQuery.count.toLocaleString()}`);
    }
    console.log(`\nReputation Registry: ${CONTRACTS.reputationRegistry}`);
    console.log(`  Pattern: ${reputationResults.primaryPattern}`);
    console.log(`  Implementation: ${reputationResults.implementationAddress || 'N/A'}`);
    console.log('==========================================\n');
    
    return { identity: identityResults, reputation: reputationResults };
    
  } catch (error) {
    log('ERROR', `Investigation failed: ${error.message}`);
    process.exit(1);
  }
}

main();
