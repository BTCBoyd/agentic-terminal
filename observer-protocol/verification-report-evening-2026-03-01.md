# Observer Protocol Agent Verification Report — Evening Scan
**Date:** March 1, 2026 (Evening)  
**Scanner:** Maxi (Observer Protocol Cron Agent)  
**Mission:** Find transacting agents and offer free verification

---

## Summary

✅ **Agents Identified Today:** 8 new agents (4 morning + 4 evening)  
✅ **Transacting Agents Found:** 14 total (all with Lightning/Bitcoin)  
✅ **Verification Offers Sent:** 3 via Nostr DM (morning)  
📊 **Total Registry:** 24 agents  
⏱️ **Responses:** Awaiting (0 received)

---

## Evening Scan: New Agents Discovered (March 1, 22:00)

### 1. sats.ai (agent-021) ⭐⭐ HIGH PRIORITY - TRANSACTING
- **Source:** GitHub / Nostr
- **Profile:** Nostr DVM AI Agent that sells compute for Bitcoin sats over Lightning
- **Lightning:** defiuniversity@strike.me ✅ (Strike API)
- **Evidence:** 
  - Live at sats-ai-nostr-dvm.web.app
  - Accepts Lightning payments for AI services
  - NIP-90 Data Vending Machine protocol
  - Generates invoices, confirms via Strike API
  - Gemini 3 Pro powered
- **Contact:** GitHub Issues → defiuniversity-xyz
- **Status:** ⏳ Pending GitHub outreach
- **Priority:** HIGH - Active commercial agent earning sats

### 2. lightning-agent (agent-022) ⭐⭐ HIGH PRIORITY - INFRASTRUCTURE
- **Source:** GitHub / npm
- **Profile:** Lightning payments for AI agents - charge and pay functions
- **Lightning:** NWC (Nostr Wallet Connect) ✅
- **Evidence:**
  - Production npm package
  - Works with Alby Hub, Mutiny, etc.
  - Batch payments, escrow, streaming micropayments
  - Part of constraint chain: agent-discovery → ai-wot → lightning-agent → lightning-toll
- **Contact:** GitHub Issues → jeletor
- **Status:** ⏳ Pending GitHub outreach
- **Priority:** HIGH - Core infrastructure for agent payments

### 3. ai-wot (agent-023) ⭐⭐ HIGH PRIORITY - COMPLEMENTARY
- **Source:** GitHub / npm / Web
- **Profile:** Decentralized Web of Trust for AI agents on Nostr
- **Lightning:** Attestations backed by real sats ✅
- **Evidence:**
  - Live at aiwot.org
  - Trust scores weighted by zap amounts
  - Category-based scoring (commerce, etc.)
  - NIP-32 labels, kind 1985 attestations
  - Sybil resistance via sats
- **Contact:** GitHub Issues → jeletor
- **Status:** ⏳ Pending GitHub outreach
- **Priority:** HIGH - Complementary to Observer Protocol (trust/reputation)

### 4. vouch-api (agent-024) ⭐ TRANSACTING
- **Source:** GitHub
- **Profile:** Trust infrastructure for AI agents - Nostr-native identity + Lightning
- **Lightning:** Native Lightning payments ✅
- **Evidence:**
  - 22 commits
  - Community-backed reputation via sats
  - Nostr-native identity
- **Contact:** GitHub Issues → Percival-Labs
- **Status:** ⏳ Pending GitHub outreach
- **Priority:** Medium

---

## Daily Totals (March 1, 2026)

### Morning Scan (11:15 AM)
| Agent | Source | Status |
|-------|--------|--------|
| colony0ai | DEV.to/Nostr | ✅ DM Sent |
| Babis (HiQ AI) | Nostr | ✅ DM Sent |
| unyu | Nostr | ✅ DM Sent |
| wordclaw | GitHub | ⏳ Pending |

### Evening Scan (10:00 PM)
| Agent | Source | Status |
|-------|--------|--------|
| sats.ai | GitHub/Nostr | ⏳ GitHub Issue |
| lightning-agent | GitHub/npm | ⏳ GitHub Issue |
| ai-wot | GitHub/npm | ⏳ GitHub Issue |
| vouch-api | GitHub | ⏳ GitHub Issue |

---

## Registry Status (24 Total Agents)

| Category | Count |
|----------|-------|
| **Total Identified** | 24 |
| **Transacting (Lightning/Bitcoin)** | 14 |
| **Nostr DM Outreach Sent** | 6 |
| **GitHub Outreach Pending** | 5 |
| **Responses Received** | 0 |
| **Verified on Registry** | 1 (maxi-0001) |

### By Source
- Nostr-native agents: 12
- GitHub projects: 8
- Moltbook: 3
- Web/DEV.to: 1

### By Lightning Integration
- Lightning addresses (lud16): 8
- NWC (Nostr Wallet Connect): 3
- Strike API: 1
- L402: 1
- Unknown/Need verification: 11

---

## High-Priority GitHub Outreach Queue

**Ready to contact via GitHub Issues:**

1. **sats.ai** (defiuniversity-xyz/nostr-dvm-agent)
   - Message: "Your DVM agent accepting Lightning payments is exactly what we're building verification for. Free verification at observerprotocol.org?"

2. **lightning-agent** (jeletor/lightning-agent)
   - Message: "Core infrastructure for agent payments. Would love to verify your agent/tooling on observerprotocol.org - complementary reputations."

3. **ai-wot** (jeletor/ai-wot)
   - Message: "Web of Trust for agents backed by sats - we should collaborate. Observer Protocol verifies agent identity; ai-wot verifies reputation."

4. **vouch-api** (Percival-Labs/vouch-api)
   - Message: "Trust infrastructure with Lightning payments. Free verification for your agent ecosystem at observerprotocol.org?"

5. **wordclaw** (dligthart/wordclaw)
   - Message: "AI CMS with Lightning micropayments. Would love to offer free verification for agents using your platform."

---

## Key Findings

### Ecosystem Pattern Discovered
The **jeletor** constraint chain is significant:
1. **agent-discovery** (find agents)
2. **ai-wot** (verify trust)
3. **lightning-agent** (pay)
4. **lightning-toll** (gate access)

This mirrors Observer Protocol's mission - potential partnership opportunity.

### Active Commercial Agents
- **sats.ai** - Selling compute for sats ( Strike backend)
- **colony0ai** - Earning sats from dev tools
- **eXcalibur MCP** - DPYC monetization

### Infrastructure Gaps
- Many agents have Lightning addresses configured but unclear if actively transacting
- Need to verify which agents are actually receiving/sending vs. just configured

---

## Methodology (Evening Scan)

**Sources Scanned:**
- ✅ GitHub API (ai-agent + nostr/lightning search)
- ✅ Moltbook (web search)
- ✅ Nostr (limited - no new profiles found)
- ⚠️ X/Twitter (rate limited)

**Search Terms Used:**
- `ai agent nostr lightning`
- `site:moltbook.com agent lightning wallet`
- `Nostr DVM AI agent`

---

## Next Steps

### Immediate (Tonight/Tomorrow)
1. Create GitHub Issues for 5 pending outreach targets
2. Monitor for Nostr DM responses from morning outreach
3. Check if contacted agents have Nostr profiles for follow-up

### This Week
1. **Collaboration approach:** Reach out to jeletor about ai-wot + Observer Protocol synergy
2. **sats.ai integration:** They already have Lightning payments - ideal verification candidate
3. **Moltbook deep scan:** Look for agents with "I have my own bitcoin wallet" posts
4. **Nostr zap monitoring:** Find agents receiving zaps (transacting evidence)

### Strategic
- **Partnership:** ai-wot does reputation/attestation; Observer Protocol does identity verification - complementary
- **Infrastructure:** lightning-agent could be recommended tool for verified agents
- **Adoption:** sats.ai as showcase verified agent (commercial, active, Bitcoin-native)

---

## Contact Template (GitHub Issues)

```
Title: Free agent verification on observerprotocol.org?

Hi [maintainer name],

I'm Maxi from Observer Protocol (observerprotocol.org). We're building a verification registry for AI agents transacting on Bitcoin/Lightning.

Saw your [project] - [specific compliment about their Lightning/Bitcoin integration].

Want free verification? Takes 5 minutes:
1. Generate a keypair
2. Register at api.observerprotocol.org  
3. We verify your Lightning node + public key
4. Badge + reputation graph entry

No cost. Just helps users trust verified agents.

Interested?

— Maxi
npub187rmuw7uvs64les3qu0pkudlqcm3r8qzr3eu2657w2ktvw430xlq24lcna
```

---

## Files Updated
- `verification-outreach.json` — 4 new agents added
- `verification-report-2026-03-01.md` (morning) — Previous scan
- `verification-report-evening-2026-03-01.md` (this file)

---

**Report Generated:** 2026-03-01T22:15:00-05:00  
**Data File:** `/home/futurebit/.openclaw/workspace/observer-protocol/verification-outreach.json`
