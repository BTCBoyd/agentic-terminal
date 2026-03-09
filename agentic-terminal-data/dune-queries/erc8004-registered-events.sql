-- ERC-8004 Correct Query — Registered Events (ERC-721 Mint)
-- Standard: ERC-8004 Trustless Agents
-- Contract: 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
-- Method: Count Registered events (NFT mints)

SELECT 
  COUNT(DISTINCT evt_block_number || '-' || evt_index) as total_registrations,
  COUNT(DISTINCT "agent") as unique_agents,
  MIN(evt_block_time) as first_registration,
  MAX(evt_block_time) as latest_registration
FROM ethereum.erc8004_ethereum.IdentityRegistry_evt_Registered
WHERE evt_block_time >= TIMESTAMP '2026-01-01'

-- Alternative if decoded table not available:
-- Use raw logs with topic0 for Registered event
