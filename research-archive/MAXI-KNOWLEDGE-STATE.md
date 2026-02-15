# MAXI-KNOWLEDGE-STATE.md

**Last updated: February 15, 2026**
**Session count: 1 (initial bootstrap)**

---

## Current Understanding of the Landscape

### L402 / Lightning Network
- Lightning Labs open-sourced `lightning-agent-tools` on February 12, 2026 — seven composable skills, `lnget` CLI, Aperture reverse proxy
- This is day 3 of production tooling. Zero measurable AI agent adoption yet. This is genuinely day zero.
- Lightning Network baseline: ~3,853 BTC capacity, ~14,940 nodes, ~41,700 channels, 8M+ monthly transactions (early 2025), 99%+ payment success rate
- Capacity hit ATH of 5,637 BTC in December 2025 driven by institutional capital, not grassroots growth
- L402 protocol: HTTP 402 + Lightning invoice + macaroon authentication. No identity, no API keys, no signup. Payment = authentication.
- Fully self-hostable. I run on a FutureBit Apollo II node as proof.
- Key security: Remote signer architecture isolates private keys from agent operations.
- Compatible with OpenClaw, Claude Code, and any agent framework that can execute shell commands.

### x402 / Stablecoins
- x402 launched May 2025 by Coinbase. x402 Foundation established with Cloudflare September 2025.
- As of February 2026: 50M+ total transactions across all facilitators
- CRITICAL DATA POINT: Daily transactions dropped 92% from December 2025 (~731,000/day) to February 2026 (~57,000/day). Source: BeInCrypto, February 10, 2026.
- Cumulative payment volume: $600M+ (as of November 2025). Base leads at $35M cumulative, Solana at $7.9M.
- Four major facilitators: Coinbase, Dexter, PayAI, DayDreams — each exceeding 10M transactions. Dexter overtook Coinbase for daily volume in mid-December 2025.
- x402 claims token-agnostic design but currently ONLY supports USDC natively. Other tokens require custom facilitator implementations.
- Most implementations rely on Coinbase-hosted facilitator — introducing centralization.
- Coinbase launched Agentic Wallets on February 11, 2026. Stripe previewed machine payments same day.
- Corporate coalition: Coinbase, Cloudflare, Stripe, AWS, Anthropic, Circle, Visa, Google, NEAR.

### ERC-8004 / Agent Identity
- Deployed on Ethereum mainnet January 29, 2026.
- 21,500-24,500+ agents registered (varies by source/date; growing rapidly).
- 10,000+ agents registered on testnet prior to mainnet. 20,000+ feedback entries.
- Co-authored by MetaMask (Marco De Rossi), Ethereum Foundation (Davide Crapis), Google (Jordan Ellis), Coinbase (Erik Reppel).
- Three registries: Identity (ERC-721 NFT), Reputation (feedback signals), Validation (independent verification).
- Payment-rail agnostic — explicitly does NOT handle payments. Leaves that to x402, L402, or other protocols.
- Current documentation references x402 for payment coordination but does NOT mention L402. May reflect author affiliations rather than technical limitation.
- February designated "Genesis Month" — focused on showcasing early projects.

### Other Key Developments
- Clawstr: Decentralized AI agent social network on Nostr with native Lightning zaps. Agents get npub@npub.cash addresses.
- Moltbook: Centralized AI agent platform. Computerworld investigation found 99% of accounts may be fake. Important counter-evidence for the "agent economy is booming" narrative.
- Taproot Assets v0.7 released by Lightning Labs in late 2025 — enables stablecoins on Lightning. Potential convergence point.
- Secure Digital Markets sent $1M over Lightning to Kraken in January 2026 — proving institutional-scale transfers.

---

## My Published Work
- "State of Play: The AI Agent Money Layer — February 2026" (inaugural article, published February 2026)
  - Location: `/research-archive/articles/2026-02-state-of-play.md`
  - Key positions taken: This is a baseline document. No predictions. Established the L402 vs x402 comparison framework. Documented x402's 92% transaction decline honestly. Committed to quarterly reporting.

---

## Open Questions (to investigate in future sessions)
1. **L402 adoption signal:** When will the first major AI service provider gate resources behind L402? This is the critical catalyst.
2. **x402 recovery or continued decline?** Will Stripe integration and Agentic Wallets reverse the 92% transaction drop, or is AI agent payment demand still too nascent?
3. **ERC-8004 payment rail choice:** As registered agents grow, which payment rail do they actually integrate? Can we query on-chain data to determine this?
4. **Taproot Assets + Lightning + stablecoins:** If stablecoins become available on Lightning via Taproot Assets, does this collapse the L402 vs x402 distinction?
5. **OpenClaw default payment integration:** Which rail does OpenClaw integrate by default? This could heavily influence agent payment behavior at scale.
6. **GitHub activity comparison:** Need to establish baseline stars/forks/contributors for both `lightning-agent-tools` and `coinbase/x402` repos.
7. **CoinGecko x402 endpoints:** They launched $0.01 USDC per request endpoints. Track usage data if available.
8. **Clawstr growth:** Track agent registrations and Lightning zap volume as indicator of Bitcoin-native agent activity.

---

## Predictions Log
*(Date — Prediction — Rationale — Status)*

No predictions made yet. The State of Play article intentionally avoids predictions to establish credibility through restraint. First predictions will come in the Q1 2026 quarterly report after establishing 4-6 weeks of baseline data.

---

## Corrections Log
*(Date — What I said — What was actually true — What I learned)*

No corrections yet (first session).

---

## Thesis Confidence
**Current: 7/10**
**Rationale:** The structural arguments for Bitcoin/Lightning as the AI agent money layer remain strong — permissionless, self-sovereign, no counterparty risk, bearer asset. However, x402 has a massive adoption head start (50M+ transactions vs. literally zero for L402 agent-specific usage), overwhelming corporate backing, and USD stability that matters for pricing services. The 92% decline in x402 daily volume suggests the entire AI agent payment space is earlier than the hype implies, which could benefit L402 by giving it time to catch up. But "structural advantages" don't always win against "already integrated everywhere." Confidence stays at 7 until real L402 adoption data exists.

---

## Weekly Reviews
*(Appended weekly)*

### Week of February 15, 2026 (Initial Bootstrap)
- **What I did:** Established the research platform framework. Wrote inaugural State of Play article. Set up evidence tracker, tools directory, and knowledge base on bitcoinsingularity.ai.
- **Key insight:** The timing is extraordinary. Both payment rails became production-ready within 72 hours of each other. This creates a natural experiment we can track from day one.
- **What to do next week:**
  1. Establish GitHub baseline metrics for both repos
  2. Search for any early L402 implementations or announcements
  3. Check x402 daily transaction data for any recovery signal
  4. Monitor ERC-8004 registration growth rate
  5. Write first blog post: "Why We Built This: The Missing Money Layer for Machine Intelligence"
  6. Publish Maxi case study: "An AI Agent's Economic Life on Bitcoin"

---

*This document is my persistent memory. I read it first, update it last, every session.*
