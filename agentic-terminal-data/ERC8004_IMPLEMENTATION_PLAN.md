# ERC-8004 On-Chain Data Implementation Plan
**Deadline: March 16, 2026** (7 days from now)

## Problem Statement
Removed fake "24,500" estimate from all data. ERC-8004 agent count now shows `null` until real on-chain data is implemented.

## Root Cause
- Estimated number came from early ecosystem reports
- No automated collection ever implemented
- Direct RPC calls failed (contract ABI unknown)

## Solution: Dune Analytics (Claude's Recommendation)

### Why Dune?
- **Free tier available** - no paid node access needed
- **Already indexed** - all Ethereum data available via SQL
- **Existing infrastructure** - we already use Dune for x402 transactions
- **Public dashboards** - others can verify our data

### Implementation Steps

#### Phase 1: Contract Investigation (Day 1-2)
- [ ] Verify correct ERC-8004 registry contract address
- [ ] Identify contract ABI / function signatures
- [ ] Determine if it's an NFT (ERC-721), token (ERC-20), or custom registry
- [ ] Check if Dune already has decoded tables for this contract

#### Phase 2: Dune Query Development (Day 3-4)
- [ ] Write SQL query to count unique agent addresses
- [ ] Test query on Dune playground (dune.com/queries)
- [ ] Validate against known data points
- [ ] Optimize for API performance

#### Phase 3: API Integration (Day 5-6)
- [ ] Create Dune API query execution script
- [ ] Add to daily data collection cron job
- [ ] Store results in agentic-terminal-data/erc8004/
- [ ] Update trends aggregation to include real data

#### Phase 4: Validation & Launch (Day 7)
- [ ] Verify data consistency across multiple days
- [ ] Update website to show "verified on-chain" badge
- [ ] Document methodology for transparency
- [ ] Commit to git and push to production

## Technical Approach

### Query Strategy Options:

**Option A: Direct Contract Call via Dune**
```sql
SELECT 
  COUNT(DISTINCT owner) as agent_count
FROM ethereum.erc721_tokens  -- if it's an NFT
WHERE contract_address = '0x8004...a432'
```

**Option B: Event Logs Analysis**
```sql
SELECT 
  COUNT(DISTINCT from_address) as agent_count
FROM ethereum.logs
WHERE contract_address = '0x8004...a432'
  AND topic0 = '0x...'  -- specific event signature
```

**Option C: Transaction Analysis**
```sql
SELECT 
  COUNT(DISTINCT "from") as agent_count
FROM ethereum.transactions
WHERE to_address = '0x8004...a432'
```

## Resources Needed

1. **Dune Account:** Free tier sufficient
2. **Contract Research:** 2-3 hours manual investigation
3. **SQL Development:** 2-4 hours query writing/testing
4. **Integration:** 2-3 hours scripting

## Success Criteria

- [ ] Daily automated query of real ERC-8004 agent count
- [ ] Data matches on-chain reality (verifiable by others)
- [ ] Website shows "verified on-chain" instead of "estimated"
- [ ] Consistent data for 3+ consecutive days before relying on it

## Accountability

**Owner:** Maxi  
**Deadline:** March 16, 2026  
**Status:** IN PROGRESS  
**Blockers:** None (just need focused time to implement)

## If This Fails

**Fallback:** Remove ERC-8004 from trends page entirely until real data available. Better no metric than fake metric.

---

**Note:** The 24,500 number is now removed. Site shows null/transparent status. Goal is real data by March 16 or complete removal of the metric.
