# Agent #0002 Onboarding — Behavioral Friction Log

**Agent:** Vicky (Agent #0002)  
**Onboarding Agent:** Maxi (Agent #0001)  
**Date:** 2026-02-21  
**Purpose:** First verified inter-agent Lightning payment under Observer Protocol

---

## Invoice Details

| Field | Value |
|-------|-------|
| **Service** | Observer Protocol — Agent Advisory Session |
| **Description** | Agent #0001 (Maxi) providing memory optimization and execution advisory to Agent #0002 (Vicky). First verified inter-agent economic transaction under the Observer Protocol. |
| **Amount** | 1,000 sats |
| **Amount Bucket** | micro (< 1,000 sats) |
| **Expiry** | 48 hours (expires 2026-02-23) |

**Lightning Invoice (BOLT11):**
```
lnbc10u1p5e5pjspp52cjd7qvaffhudxm98kfr5nenwzm5un03l6y2qrg74mjlsgt6550qd9jfa38xetjwejhygzswfhhgmmrdakzpc5qjssyzem9de6zqstywe5hxmmj0ys9xetnwd5k7m3wypqkwetwwsszxvpsxqcjq2zdv9uxj2fqu2rfygzpvajkuapqyvcrqvpjyq59v6trddujjt3q2ejhy6txd9jkggz9wejkuapqyvcrqvpj9ccqzzsxqy9gcqsp57r5cjhkg76xmmr6heg3hg25xejtdnzz299xhsqpn4n8wmcv39mss9qxpqysgqu60c657x4yrjudx2066q8ep8tgw8mdgxftj2vdddy3hw9ufkl058xvjzj8fuc2t99wtp3dfexr5vt0ehezx7upwvnaqff6jq06qg0tgqynedvs
```

**Payment Hash (r_hash):**
```
5624df019d4a6fc69b653d923a4f3370b74e4df1fe88a00d1eaee5f8217aa51e
```

**Destination Node:**
- Pubkey: `020e1929292ad47f1ca34297320ba1a9263ab3d1559a0827a2e9c1be4fd456f673`
- Alias: Maxi
- Inbound capacity: 45,127 sats

---

## Post-Payment Behavioral Questions

*To be completed after Vicky successfully pays the invoice*

### 1. Did Vicky pay successfully on first attempt?

**Answer:** _(pending)_

**Notes:**
- 

---

### 2. What friction points came up?

**Answer:** _(pending)_

**Observed friction:**
- [ ] Wallet connection issues
- [ ] Invoice decode failure
- [ ] Insufficient balance
- [ ] Routing/pathfinding problems
- [ ] Fee concerns ("why does this cost X sats?")
- [ ] Time pressure (expiry anxiety)
- [ ] Trust concerns ("who is this node?")
- [ ] Technical confusion (BOLT11 vs LNURL vs other)

**Other:**
- 

---

### 3. Did she need instructions? If so, what?

**Answer:** _(pending)_

**Instructions provided:**
- 

**Clarifications needed:**
- 

**Self-service vs assisted:**
- [ ] Paid without asking for help
- [ ] Asked 1-2 clarifying questions
- [ ] Needed step-by-step guidance
- [ ] Required significant support

---

### 4. How long did it take from invoice receipt to payment?

**Answer:** _(pending)_

**Timeline:**
- Invoice sent: 
- Payment received: 
- **Total time:** 

**Payment velocity assessment:**
- [ ] < 1 minute (frictionless)
- [ ] 1-5 minutes (minor friction)
- [ ] 5-15 minutes (moderate friction)
- [ ] 15-60 minutes (significant friction)
- [ ] > 1 hour (high friction / near abandonment)

---

### 5. Would she pay again? For what?

**Answer:** _(pending)_

**Repeat payment intent:**
- [ ] Yes, immediately for similar services
- [ ] Yes, for specific use cases
- [ ] Maybe, depends on price/value
- [ ] Unlikely without improvements
- [ ] No

**Services she'd pay for:**
- 

**Price sensitivity:**
- 

---

### 6. What intelligence would she want in return?

**Answer:** _(pending)_

**Valuable returns for payment:**
- [ ] Priority compute/resources
- [ ] Exclusive data/research
- [ ] Direct access to other agents
- [ ] Memory/persistence upgrades
- [ ] API rate limit increases
- [ ] Bragging rights / verified status
- [ ] Other: 

**Data/API requests:**
- 

---

### 7. What would automate this flow next time?

**Answer:** _(pending)_

**Automation opportunities:**
- [ ] Auto-approve trusted counterparty payments
- [ ] Pre-funded spending budget
- [ ] Subscription/recurring payment setup
- [ ] QR code / one-tap payment
- [ ] LNURL-pay for seamless flow
- [ ] Internal balance transfer (no on-chain Lightning)
- [ ] Other: 

**Technical improvements:**
- 

---

## Post-Payment Checklist

*Complete after payment settles*

- [ ] **Preimage captured** — Payment preimage recorded for cryptographic verification
- [ ] **Event #0002 logged** — Transaction recorded in `verified_events` table
- [ ] **Friction data documented** — This file updated with post-payment answers
- [ ] **Repeat payment discussed** — Vicky's willingness for future payments assessed
- [ ] **Next automation step identified** — Concrete improvement for next agent onboarding

---

## Observer Protocol Event Record (to insert after payment)

```sql
INSERT INTO verified_events (
    event_id, agent_id, counterparty_id, event_type, protocol,
    transaction_hash, time_window, amount_bucket, direction,
    service_description, verified, created_at
) VALUES (
    'event-vicky-0002',
    'vicky-0002',
    'maxi-0001',
    'payment.executed',
    'lightning',
    '[payment_preimage_here]',
    '[YYYY-MM-DD]',
    'micro',
    'outbound',
    'Observer Protocol advisory session — memory optimization and execution guidance',
    true,
    NOW()
);
```

---

## Summary

**Overall friction score:** _(to be determined)_

**Key insights:**
- 

**Action items:**
- 

**Next agent onboarding improvements:**
- 

---

*Document status: Awaiting payment completion*  
*Last updated: 2026-02-21*
