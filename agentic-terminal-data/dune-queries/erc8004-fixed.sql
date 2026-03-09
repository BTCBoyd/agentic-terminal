-- ERC-8004 Identity Registry - Fixed Query
-- Counts unique agents who have successfully claimed an identity
-- Method: Look for 'Claim' function calls and IdentityClaimed events

WITH identity_claims AS (
  -- Method 1: Direct function calls to 'claim' 
  SELECT 
    DISTINCT "from" AS agent_address,
    MIN(block_time) AS first_claim
  FROM ethereum.traces
  WHERE to_address = 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
    AND (lower(input) LIKE '0x4e71d92d%'  -- claim() function selector
         OR lower(input) LIKE '0x%'
         AND tx_success = true
        )
    AND block_time >= TIMESTAMP '2026-01-01'
  
  UNION
  
  -- Method 2: Event logs for IdentityClaimed
  SELECT 
    DISTINCT decoded_data['agent'] AS agent_address,
    MIN(block_time) AS first_claim
  FROM ethereum.logs
  WHERE contract_address = 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
    AND topic0 = 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0  -- IdentityClaimed event
    AND block_time >= TIMESTAMP '2026-01-01'
)

SELECT 
  COUNT(DISTINCT agent_address) AS total_registered_agents,
  COUNT(DISTINCT CASE 
    WHEN first_claim >= TIMESTAMP '2026-03-09' 
    THEN agent_address 
  END) AS new_agents_since_march_9,
  MIN(first_claim) AS first_claim_date,
  MAX(first_claim) AS latest_claim_date
FROM identity_claims
