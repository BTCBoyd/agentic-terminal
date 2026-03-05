#!/usr/bin/env node
/**
 * x402 Transaction Verifier for Observer Protocol
 * 
 * Verifies x402 (EVM) transactions on Base blockchain
 * Cross-rail verification: x402_usdc -> reputation graph
 * 
 * @module x402-verifier
 */

import { createPublicClient, http, parseAbi, formatUnits } from 'viem';
import { base } from 'viem/chains';

// USDC contract on Base
const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// Known x402 facilitators (expandable registry)
const X402_FACILITATORS = [
  '0x...', // Coinbase x402
  '0x...', // Dexter
  '0x...', // PayAI
  // Add more as identified
];

// USDC Transfer event ABI
const USDC_TRANSFER_ABI = parseAbi([
  'event Transfer(address indexed from, address indexed to, uint256 value)'
]);

const ERC20_ABI = parseAbi([
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function balanceOf(address account) view returns (uint256)'
]);

class X402Verifier {
  constructor(rpcUrl = 'https://mainnet.base.org') {
    this.client = createPublicClient({
      chain: base,
      transport: http(rpcUrl)
    });
  }

  /**
   * Verify an x402 transaction
   * 
   * @param {string} txHash - Ethereum transaction hash
   * @param {Object} expected - Expected transaction details
   * @param {string} expected.to - Expected recipient address
   * @param {string} expected.amount - Expected amount in USDC (human-readable)
   * @param {string} expected.from - Expected sender address (optional)
   * @returns {Promise<Object>} Verification result
   */
  async verifyTransaction(txHash, expected = {}) {
    try {
      console.log(`🔍 Verifying x402 transaction: ${txHash}`);

      // 1. Get transaction receipt
      const receipt = await this.client.getTransactionReceipt({
        hash: txHash
      });

      if (!receipt) {
        return {
          verified: false,
          error: 'Transaction not found',
          txHash
        };
      }

      // 2. Check transaction status
      if (receipt.status !== 'success') {
        return {
          verified: false,
          error: 'Transaction failed on-chain',
          txHash,
          status: receipt.status
        };
      }

      // 3. Get transaction details
      const tx = await this.client.getTransaction({
        hash: txHash
      });

      // 4. Parse USDC transfer events
      const transferEvents = await this.parseUSDCTransfers(receipt.logs);

      if (transferEvents.length === 0) {
        return {
          verified: false,
          error: 'No USDC transfers found in transaction',
          txHash
        };
      }

      // 5. Verify against expected values
      const verification = this.verifyTransfers(transferEvents, expected);

      return {
        verified: verification.match,
        txHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        transfers: transferEvents,
        verification,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      return {
        verified: false,
        error: error.message,
        txHash
      };
    }
  }

  /**
   * Parse USDC transfer events from transaction logs
   */
  async parseUSDCTransfers(logs) {
    const transfers = [];

    for (const log of logs) {
      // Check if this is a USDC contract log
      if (log.address.toLowerCase() !== USDC_CONTRACT.toLowerCase()) {
        continue;
      }

      try {
        const decoded = this.client.decodeEventLog({
          abi: USDC_TRANSFER_ABI,
          data: log.data,
          topics: log.topics
        });

        transfers.push({
          from: decoded.args.from,
          to: decoded.args.to,
          amount: formatUnits(decoded.args.value, 6), // USDC has 6 decimals
          amountRaw: decoded.args.value.toString()
        });
      } catch (e) {
        // Not a transfer event, skip
        continue;
      }
    }

    return transfers;
  }

  /**
   * Verify transfers match expected values
   */
  verifyTransfers(transfers, expected) {
    const results = {
      match: false,
      checks: {}
    };

    // Find matching transfer
    const matchingTransfer = transfers.find(t => {
      // Check recipient
      if (expected.to && t.to.toLowerCase() !== expected.to.toLowerCase()) {
        return false;
      }

      // Check sender (if provided)
      if (expected.from && t.from.toLowerCase() !== expected.from.toLowerCase()) {
        return false;
      }

      // Check amount (with small tolerance for floating point)
      if (expected.amount) {
        const expectedAmount = parseFloat(expected.amount);
        const actualAmount = parseFloat(t.amount);
        const tolerance = 0.001; // $0.001 tolerance
        if (Math.abs(expectedAmount - actualAmount) > tolerance) {
          return false;
        }
      }

      return true;
    });

    if (matchingTransfer) {
      results.match = true;
      results.matchedTransfer = matchingTransfer;
    }

    results.checks = {
      recipientMatch: expected.to ? 
        transfers.some(t => t.to.toLowerCase() === expected.to.toLowerCase()) : null,
      senderMatch: expected.from ? 
        transfers.some(t => t.from.toLowerCase() === expected.from.toLowerCase()) : null,
      amountMatch: expected.amount ?
        transfers.some(t => Math.abs(parseFloat(t.amount) - parseFloat(expected.amount)) < 0.001) : null
    };

    return results;
  }

  /**
   * Check if transaction was to an x402 facilitator
   */
  isX402Facilitator(address) {
    return X402_FACILITATORS.some(
      f => f.toLowerCase() === address.toLowerCase()
    );
  }

  /**
   * Get transaction timestamp from block
   */
  async getTransactionTimestamp(txHash) {
    const tx = await this.client.getTransaction({ hash: txHash });
    const block = await this.client.getBlock({ blockNumber: tx.blockNumber });
    return Number(block.timestamp);
  }
}

/**
 * CLI interface for testing
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`
x402 Transaction Verifier for Observer Protocol

Usage:
  node x402-verifier.mjs <tx-hash> [recipient] [amount]

Examples:
  node x402-verifier.mjs 0xabc123...
  node x402-verifier.mjs 0xabc123... 0xdef456... 50.00

Environment:
  BASE_RPC_URL - Custom Base RPC endpoint (default: https://mainnet.base.org)
`);
    process.exit(1);
  }

  const [txHash, recipient, amount] = args;

  const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
  const verifier = new X402Verifier(rpcUrl);

  const expected = {};
  if (recipient) expected.to = recipient;
  if (amount) expected.amount = amount;

  console.log('\n🔍 Starting verification...\n');
  const result = await verifier.verifyTransaction(txHash, expected);

  console.log('\n📊 Verification Result:');
  console.log(JSON.stringify(result, null, 2));

  if (result.verified) {
    console.log('\n✅ Transaction VERIFIED');
  } else {
    console.log('\n❌ Verification FAILED:', result.error || 'No matching transfer found');
  }
}

// Export for use as module
export { X402Verifier };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
