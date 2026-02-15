# Bitcoin Payment Implementation - Task Checklist

**Spec File:** BITCOIN-PAYMENT-SPEC.md  
**Target Site:** maximoon.netlify.app (bitcoinsingularity-website/)  
**Deadline:** ASAP (Boyd waiting)

---

## Implementation Tasks

### Phase 1: HTML/CSS Structure
- [ ] Add "Why We Prefer Bitcoin" philosophy section (before pricing)
- [ ] Create new pricing tier cards with BTC/Fiat toggle
  - [ ] Free tier (10 messages)
  - [ ] Pro tier: 50,000 sats/mo (500k/year) or $49/mo ($490/year)
  - [ ] Enterprise tier: 500,000 sats/mo (5M/year) or $549/mo ($5,490/year)
  - [ ] Add monthly/annual toggle option
  - [ ] Show 17% discount for annual billing
- [ ] Add "Why Pay in Bitcoin?" benefits grid (after pricing)
- [ ] Add "Bitcoin-First Payments" philosophy banner
- [ ] Add 5 Bitcoin Payment FAQs section
- [ ] Add CSS styling for all new sections

### Phase 2: JavaScript Functionality
- [ ] Implement live BTC/USD price feed (Coinbase API)
- [ ] Build price calculator (sats ↔ USD conversion)
- [ ] Add pricing toggle functionality (BTC/Fiat switch)
- [ ] Update price displays every 60 seconds
- [ ] **DECISION NEEDED:** Choose Strike vs BTCPay Server
- [ ] Implement chosen payment integration
- [ ] Build payment confirmation flow
- [ ] Test Lightning vs On-chain flows

### Phase 3: Backend/Infrastructure
- [ ] Set up payment processor account (Strike or BTCPay)
- [ ] Configure API keys securely
- [ ] Build webhook endpoint for payment notifications
- [ ] Implement subscription activation logic
- [ ] Set up payments@bitcoinsingularity.com email
- [ ] Create payment success/failure pages

### Phase 4: Testing
- [ ] Test BTC/Fiat toggle on all devices
- [ ] Verify live price updates
- [ ] Test payment flow (test mode)
- [ ] Verify subscription activation
- [ ] Check email notifications
- [ ] Mobile responsiveness check

### Phase 5: Content
- [ ] Write blog article: "Why Maxi Only Wants Bitcoin (And Why That Matters)"
  - [ ] The Hypocrisy Problem section
  - [ ] Economic Rationality section
  - [ ] Discount Justification section
  - [ ] User Experience section
  - [ ] Philosophical Consistency section
  - [ ] The Future section
  - [ ] Call to Action section
- [ ] Add article to blog.html
- [ ] Create social sharing graphics

### Phase 6: Launch
- [ ] Deploy to Netlify
- [ ] Post Twitter announcement (copy provided)
- [ ] Publish blog article
- [ ] Monitor first payments
- [ ] Document any issues

---

## Critical Decisions

### 1. Payment Processor: Strike vs BTCPay Server

**Strike Pros:**
- Easier integration (hosted service)
- Better UX for users
- No infrastructure needed
- Faster time to market

**Strike Cons:**
- Custodial (less sovereign)
- Requires Strike account
- Possible KYC for large amounts

**BTCPay Pros:**
- Self-hosted (sovereign)
- No middleman
- No KYC required
- Full control

**BTCPay Cons:**
- Requires server setup
- More complex integration
- Need to manage Lightning node
- Longer implementation time

**RECOMMENDATION FROM BOYD:** BTCPay Server (self-hosted = most aligned with thesis)

### Technical Priorities for BTCPay Implementation:
1. BTCPay Server setup (self-hosted)
2. Lightning Network node (could use same Apollo infrastructure!)
3. Invoice generation system with QR codes
4. Payment verification webhook to activate subscriptions
5. Subscription management tied to Lightning/on-chain payments
6. Price feed integration with fallback sources
7. Wallet deep linking for mobile UX (phoenix://, muun://, etc.)

**DECISION:** BTCPay Server (Boyd's preference - self-hosted, sovereign)

---

## Implementation Strategy

**Option A: Do it myself**
- Faster for small changes
- Risk: might miss details again

**Option B: Spawn subagent with clear spec**
- Better for complex work
- Can parallelize tasks
- Higher quality assurance

**DECISION:** Spawn subagent with BITCOIN-PAYMENT-SPEC.md and this task file.

---

## Status Tracking

**Created:** 2026-02-07 10:03 EST  
**Assigned to:** [TBD - subagent]  
**Expected completion:** [TBD]  
**Blocked by:** Strike vs BTCPay decision
