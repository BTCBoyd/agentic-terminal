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


---

## Session Update: February 15, 2026 (Late Afternoon)

### What Was Accomplished
**Full Website v2 Redesign - Claude's Complete Site Review Implementation**

Executed all three batches of Claude's comprehensive site review feedback. The site went from early MVP to publication-ready research platform.

#### BATCH 1: Critical Fixes (Completed & Deployed)
- Fixed Amazon book link (was placeholder XXXXX)
- Corrected "seven months" → "ten months" (April 2025 to February 2026)
- Added full site navigation to Ask Maxi page (no longer orphaned)
- Removed ALL emojis site-wide (research.html, state-of-play, knowledge.html, tools.html, about.html, chat.html)

#### BATCH 2: Design & Layout Overhaul (Completed & Deployed)
- **Homepage completely restructured:**
  - Moved Live Data Dashboard to homepage (above the fold)
  - Added 4th metric card: L402 Agent Tools (11 GitHub stars, 3 forks, day zero tracking)
  - Enhanced x402 card with honest context: "~57K daily (↓92% from Dec peak)"
  - Expanded evidence section to 5 entries with colored category badges
  - Condensed thesis to 2 brief paragraphs
  - Removed: 6 feature cards, entire Key Themes section (moved to Knowledge Base)
- **Updated sub-headline:** "Research by Maxi — an AI agent tracking the race to become the money layer for machine intelligence"
- **Updated footer attribution globally:** "Research by Maxi | Thesis Advisor: Boyd Cohen, PhD | Built at ArcadiaB"
- Added entry/tool counts to page headers: "20 entries and growing" / "18 tools tracked and growing"

#### BATCH 3: Content & Strategic Positioning (Completed & Deployed)
- **Knowledge Base — Added "Why This Research Exists" moat section:**
  - Timeline (April 2025 prediction → February 2026 infrastructure arrivals)
  - The Unique Training (Boyd's frameworks, ArcadiaB operations, 20+ years research)
  - The Recursive Advantage (Research Continuity Protocol as compound interest)
  - Boyd's three books linked with proper Amazon URLs
- **About Page — Complete Overhaul:**
  - Restructured: Maxi FIRST (lead researcher), Boyd SECOND (thesis advisor)
  - Maxi section: Expanded bio, research focus, social links (Nostr, X, Ask Maxi)
  - Boyd section: Full credentials, professional positioning, social links (X, LinkedIn, ArcadiaB), "Book Boyd to speak" email
  - Replaced long "What You Can Ask Maxi" with brief "Our Research Focus"
  - Added: What makes the research different (Research Continuity Protocol)
- **Ask Maxi Page — Tone Alignment:**
  - Removed defensive language ("This isn't ChatGPT")
  - Removed tribal framing ("conviction-driven thinkers", "sovereign individuals")
  - Removed "If you're exploring Bitcoin skeptically...Maxi isn't your tool" (replaced with "Skeptics welcome")
  - Reframed as research platform: "I track L402 vs x402, agent payment rails, AI-Bitcoin convergence"
  - Updated welcome message, hero headline, value props, placeholder text
  - Changed meta description to research positioning

### Why This Matters
The site now positions as a serious research platform (Bloomberg for AI-Bitcoin convergence) rather than a crypto startup landing page. Every change reinforces:
- Intellectual honesty as brand (track counter-evidence prominently)
- Maxi as lead researcher (not just Boyd's chatbot)
- Data-forward, not hype-forward
- Institutional credibility (analysts would bookmark this)

### Next Steps
- Boyd will conduct another thorough review with Claude
- Feedback from Bitcoin AI community
- Potential final polish before full public launch
- Begin monthly data collection workflow (Lightning stats, x402 volumes, GitHub metrics)

### Predictions Made
None this session — focused on execution.

### Corrections to Prior Analysis
None — this was infrastructure work, not research analysis.

### Confidence in Core Thesis
Still 7/10. No new data this session changed my assessment. The site infrastructure is now ready to properly track and report that data as it arrives.


