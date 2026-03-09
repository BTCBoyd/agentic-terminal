# Observer Protocol API Tiers

**Version:** 1.0  
**Effective Date:** March 8, 2026  
**Status:** Active

**Current Status:** All tiers are **free** during this adoption phase. We may revisit pricing as the ecosystem evolves, but our default stance is to minimize friction for early integrators.

---

## Tier Overview

| Tier | Use Case | Rate Limit | Cost | Features |
|------|----------|------------|------|----------|
| **Sandbox** | Testing / Development | 100 req/hr | **Free** | Testnet verification only |
| **Production** | Live agent deployments | 10,000 req/hr | **Free** (for now) | Full verification + reputation + badges |
| **Enterprise** | Platforms / Infrastructure | Custom / Dedicated | **Free** (custom support optional) | SLA + raw data export + priority support + white-label |

---

## Sandbox Tier

**Who:** Developers testing integration, proof-of-concepts  
**Key prefix:** `op_sk_sandbox_`  
**Rate limit:** 100 requests/hour  
**Data:** Testnet only (no mainnet transactions)

**Features:**
- Agent registration
- Challenge-response verification (testnet)
- Badge generation (test badges)
- Basic reputation queries

**Limitations:**
- No mainnet transaction verification
- No reputation graph participation
- Test badges don't appear in production UIs
- Lower rate limits

**Ideal for:**
- Initial integration testing
- CI/CD pipelines
- Developer onboarding

---

## Production Tier

**Who:** Production agent deployments, active marketplaces  
**Key prefix:** `op_sk_production_`  
**Rate limit:** 10,000 requests/hour  
**Cost:** **Free** — zero friction for adoption

**Features:**
- Full mainnet verification (L402, x402, on-chain)
- Reputation graph participation
- Production badge display
- Real-time reputation queries
- Transaction history API
- Webhook support for reputation changes

**Requirements:**
- Active project with real users
- Compliance with terms of service

**Ideal for:**
- Agent marketplaces (AgentPay, etc.)
- Payment infrastructure
- Active agent frameworks
- Production AI agents earning/spending

**Production Partners:**
- AgentPay MCP Server (deployed Mar 8, 2026) — First production integration

---

## Enterprise Tier

**Who:** Platforms, infrastructure providers, large-scale deployments  
**Key prefix:** `op_sk_enterprise_`  
**Rate limit:** Custom / Dedicated infrastructure  
**Cost:** **Free** — Protocol remains free; optional paid support available

**Features:**
- Everything in Production, plus:
- Dedicated API infrastructure (if needed)
- SLA guarantees (99.9%+ uptime)
- Raw data export
- Priority support (Discord/Signal direct line)
- White-label options
- Custom reputation algorithms
- Quarterly business reviews

**Optional Paid Support:**
- Dedicated integration engineer
- Custom development
- Priority feature requests
- Direct escalation line

**Requirements:**
- Minimum 3 months production usage
- 10,000+ verified transactions
- Enterprise inquiry review

**Ideal for:**
- LangChain, AutoGPT (framework-level integration)
- Coinbase, Stripe, Circle (platform-level)
- Large agent marketplaces (10,000+ agents)
- Enterprise AI deployments

---

## Rate Limiting Details

### Headers (All Tiers)
All API responses include rate limit headers:

```
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9847
X-RateLimit-Reset: 1741462800
X-RateLimit-Tier: production
```

### Exceeding Limits
- **Soft limit:** 10% grace buffer (warnings logged)
- **Hard limit:** HTTP 429 (Too Many Requests)
- **Retry-After:** Header provided with reset time

### Burst Allowance
- Sandbox: 10 requests burst
- Production: 100 requests burst
- Enterprise: Custom burst configuration

---

## Upgrading Tiers

### Sandbox → Production
1. Project demonstrates real usage (100+ verifications)
2. Apply for production key via email: hello@observerprotocol.org
3. Review call with Observer Protocol team
4. Production key issued
5. 30-day overlap period (both keys work)

### Production → Enterprise
1. Minimum 3 months production usage
2. Minimum 10,000 verified transactions
3. Enterprise inquiry form submitted
4. Discovery call + technical review
5. Custom contract negotiation
6. Dedicated infrastructure provisioned
7. Migration support provided

---

## API Key Management

### Key Format
```
op_sk_{tier}_{project}_{random}

Examples:
op_sk_sandbox_agentpay_7f8a9b2c4d5e6f1g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9
op_sk_production_agentpay_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8
op_sk_enterprise_langchain_x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1
```

### Key Security
- Keys are project-specific (not user-specific)
- Rotate every 90 days (recommended)
- Instant revocation available
- IP allowlisting available (Enterprise only)

### Key Storage
Keys stored in: `/observer-protocol/keys/{tier}/`

---

## Monitoring & Analytics

### Production Tier Dashboard
- API usage graphs
- Verification success rate
- Reputation score trends
- Error rate monitoring
- Integration health checks

### Enterprise Tier Additions
- Real-time logs
- Custom metrics
- SLA monitoring
- Dedicated Slack/Discord channel

---

## Business Model Evolution

**Current Phase: Zero Friction Adoption**

All protocol access is currently **free**. We want maximum adoption, feedback, and real-world usage before making any pricing decisions.

**Agentic Terminal (Separate)**

We monetize [Agentic Terminal](https://agenticterminal.ai) — the intelligence platform built on top of Observer Protocol data. This is separate from the protocol itself.

**Future Considerations**

We may introduce pricing for high-volume usage or premium features as the ecosystem matures, but:
- Early adopters will be grandfathered
- Basic verification will likely remain free
- Any changes will have 90-day notice
- Community input will drive decisions

**Current stance:** Focus on adoption, gather data, decide later.

---

## FAQ

**Q: Is Observer Protocol free?**  
A: Yes, currently. All tiers are free during this adoption phase. We may introduce pricing for high-volume usage in the future, but early adopters will be grandfathered.

**Q: Will Production tier always be free?**  
A: We haven't committed to a permanent pricing model. For now, it's free. If we introduce pricing later, early adopters like AgentPay will be grandfathered.

**Q: What happens if I exceed my rate limit?**  
A: Soft limit = warnings. Hard limit = 429 errors. Contact us for higher limits if needed.

**Q: Can I have multiple keys for the same project?**  
A: Yes — production + sandbox for migration periods. Long-term, one key per environment.

**Q: How do I become an Enterprise partner?**  
A: Minimum 3 months + 10K transactions on Production, then contact us.

**Q: Do you offer paid support?**  
A: Yes — Enterprise partners can purchase dedicated integration support, custom development, and priority feature requests. The protocol itself remains free.

---

## Contact

**Tier upgrades:** hello@observerprotocol.org  
**Enterprise sales:** boyd@observerprotocol.org  
**Technical support:** Discord (Production+) / Direct line (Enterprise)

---

*Last updated: March 8, 2026*