-- ERC-8004 Agent Registry Analysis
-- Query to count unique agents registered on the ERC-8004 Identity Registry
-- Contract: 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
-- Network: Ethereum Mainnet
-- Standard: ERC-8004 Trustless Agents

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
  COUNT(DISTINCT CASE 
    WHEN first_registration >= TIMESTAMP '2026-03-09' 
    THEN agent_address 
  END) AS agents_registered_since_march_9,
  MIN(first_registration) AS first_registration_date,
  MAX(first_registration) AS latest_registration_date
FROM (
  SELECT * FROM agent_transactions
  UNION
  SELECT * FROM agent_calls
)
