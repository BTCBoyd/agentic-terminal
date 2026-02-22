# Grant Milestone Framework
## Open Agent Reporting Protocol (ARP) + Agent Verification System
### 12-Month Deliverable Plan

**Project:** Open infrastructure for verifiable AI agent economic activity on Bitcoin  
**Lead:** Boyd Cohen, PhD + Maxi (AI agent, Agent #0001)  
**Total requested:** $200,000 USD  
**Duration:** 12 months  
**License:** MIT (all code) + CC BY 4.0 (all research)  
**Repository:** github.com/[org-to-be-created]/open-agent-protocol

---

## What We're Building (Plain Language)

AI agents are beginning to transact — earning money, paying for services, coordinating economically. But there is no open, verifiable way to measure this. Platforms claim agent activity. Agents claim capabilities. Nobody can prove any of it.

We are building three pieces of open infrastructure to fix this:

1. **ARP (Agent Reporting Protocol)** — An open schema for agents to report verified economic activity. Cryptographic proof required. No trust, only verification.

2. **Agent Verification System** — A challenge-response + proof-of-payment layer that proves an agent is genuinely autonomous, not a human pretending. The filter is cryptographic, not a terms-of-service.

3. **L402 Reference Implementation** — A production-grade, open-source implementation of the Lightning-native HTTP 402 payment standard for AI agents. The canonical "how to make your agent pay with Bitcoin" resource.

All three are protocol-layer public goods. Any agent, any platform, any developer can adopt them. We build on Bitcoin and Lightning because they are the only permissionless, bearer-asset rails available to autonomous digital entities.

---

## Milestone Plan

---

### QUARTER 1 — Months 1–3: Foundation
*Goal: Ship the spec and the minimum viable infrastructure*

**M1.1 — ARP v1.0 Specification Published**
- Deadline: End of Month 1
- Deliverable: Formal, versioned ARP schema published on GitHub with full documentation
- Includes: Event types, field definitions, cryptographic proof requirements, versioning policy
- Success criteria: Spec is complete, publicly readable, and has received at least one external review
- Why it matters: Without a published spec, there is nothing for other developers to adopt

**M1.2 — ARP Reference Server (Self-Hostable)**
- Deadline: End of Month 2
- Deliverable: Open-source server that any operator can self-host to receive and store ARP events
- Built with: FastAPI + PostgreSQL (same stack we validated internally)
- Includes: Docker deployment, basic auth, API documentation, 5-minute setup guide
- Success criteria: A developer unfamiliar with the project can deploy a working instance in under 30 minutes using only the README

**M1.3 — Agent #0001 Formally Registered (Maxi)**
- Deadline: End of Month 2
- Deliverable: Maxi's existing L402 payment history formally logged under ARP v1.0 schema, serving as the first real-world dataset
- Includes: Proof-of-payment evidence, public key registration, activity log
- Why it matters: Demonstrates the protocol with real data before any external adopters exist. No "coming soon." Working from day one.

**M1.4 — GitHub Organization + Contributor Infrastructure**
- Deadline: End of Month 3
- Deliverable: Public GitHub org, contribution guidelines, issue templates, CI/CD pipeline, MIT license applied
- Success criteria: External contributors can open a PR without needing to ask Boyd or Maxi how the project works

**Q1 Budget allocation:** ~$40,000
- Boyd's time (protocol design, spec writing): ~$15,000
- Developer contractor (reference server, CI/CD): ~$20,000
- Infrastructure + tooling: ~$5,000

---

### QUARTER 2 — Months 4–6: Core Infrastructure
*Goal: Build the verification layer and the L402 reference implementation*

**M2.1 — Agent Verification System v1.0**
- Deadline: End of Month 4
- Deliverable: Open-source challenge-response verification system that cryptographically confirms agent autonomy
- How it works: Server issues a time-limited cryptographic challenge. Agent must sign programmatically. Human can do it once; an autonomous agent can do it at scale. The filter is math, not policy.
- Includes: API spec, reference server, integration guide
- Success criteria: At least one independent agent (not Maxi) successfully completes verification

**M2.2 — Proof-of-Payment Layer**
- Deadline: End of Month 5
- Deliverable: Integration layer requiring Lightning payment preimage (or on-chain tx) as proof of economic activity before any ARP event is accepted
- Success criteria: ARP server rejects fabricated events. Only cryptographically verifiable transactions accepted.
- Why it matters: This is what separates ARP from every other "agent activity" tracker. You cannot submit fake data.

**M2.3 — Security Audit**
- Deadline: End of Month 6
- Deliverable: Independent security audit of the Agent Verification System and ARP server by a qualified Bitcoin/cryptography security firm
- Budget: ~$25,000
- Success criteria: Audit report published publicly. All critical and high findings resolved before audit report release.
- Why it matters: Open infrastructure that handles cryptographic verification must be audited. This is the credibility moment.

**M2.4 — L402 Reference Agent Implementation**
- Deadline: End of Month 6
- Deliverable: Complete, open-source implementation of an L402-gated API endpoint + the agent client that pays it
- Based on: Our existing Aperture + LND stack, fully documented and abstracted
- Includes: Server (Aperture config), backend (FastAPI), agent client library, step-by-step guide
- Success criteria: A developer with a Lightning node can deploy a working L402 endpoint in under 1 hour using only the docs

**Q2 Budget allocation:** ~$60,000
- Boyd's time (verification system design, audit coordination): ~$12,000
- Developer contractor (verification system, L402 implementation): ~$20,000
- Security audit: ~$25,000
- Infrastructure: ~$3,000

---

### QUARTER 3 — Months 7–9: Ecosystem & Education
*Goal: Make adoption easy, reach LatAm developers, publish first research*

**M3.1 — Python SDK for ARP**
- Deadline: End of Month 7
- Deliverable: `pip install open-agent-protocol` — Python library for submitting ARP events, completing verification challenges, and querying the registry
- Includes: Full docs, type hints, test suite, PyPI publication
- Success criteria: A Python-based agent can integrate ARP in under 50 lines of code

**M3.2 — JavaScript/TypeScript SDK for ARP**
- Deadline: End of Month 8
- Deliverable: `npm install open-agent-protocol` — JS/TS equivalent of the Python SDK
- Includes: Full docs, TypeScript types, test suite, npm publication
- Success criteria: A Node.js-based agent can integrate ARP in under 50 lines of code

**M3.3 — Spanish-Language Developer Documentation**
- Deadline: End of Month 8
- Deliverable: Full developer documentation for ARP + L402 reference implementation translated to Spanish, written for LatAm context
- Includes: Setup guides, integration tutorials, FAQ, glossary
- Why it matters: Almost no Lightning/L402 developer resources exist in Spanish. Mexico and LatAm are significant Bitcoin markets with minimal developer tooling in their language.

**M3.4 — LatAm Agent Economy Research Paper #1**
- Deadline: End of Month 9
- Deliverable: Open-access research paper on AI agent payment adoption in emerging markets, with focus on Mexico and LatAm
- Topics: Bitcoin as agent money in high-inflation contexts, micropayment use cases for underbanked populations, early adoption data
- Published: Open access, CC BY 4.0, submitted to relevant journals/conference proceedings
- Success criteria: Paper published and publicly accessible. At minimum, distributed via SSRN.

**M3.5 — Hackathon or Developer Workshop**
- Deadline: End of Month 9
- Deliverable: One in-person or hybrid developer event (Bitcoin conference or standalone) focused on agent payments on Lightning
- Format: Half-day workshop — deploy your first L402 endpoint + register your agent on ARP
- Target: 20-50 developer participants
- Success criteria: At least 3 new agents registered on ARP by workshop participants

**Q3 Budget allocation:** ~$55,000
- Boyd's time (research paper, workshop coordination): ~$12,000
- Developer contractor (Python + JS SDKs): ~$22,000
- LatAm research contributor (paper, translation): ~$12,000
- Workshop costs (venue, travel, materials): ~$9,000

---

### QUARTER 4 — Months 10–12: Adoption, Reporting, Sustainability
*Goal: Demonstrate real adoption, publish ecosystem report, hand off to community*

**M4.1 — Rust SDK for ARP**
- Deadline: End of Month 10
- Deliverable: Rust crate for ARP integration — targets performance-sensitive agent implementations
- Published: crates.io
- Success criteria: Published, tested, documented

**M4.2 — Conference Presentation**
- Deadline: End of Month 11
- Deliverable: Present ARP + Agent Verification System at a major Bitcoin conference (BTC++, Bitcoin Amsterdam, Adopting Bitcoin, or equivalent)
- Includes: Published slide deck, recorded talk if available
- Why it matters: Protocol adoption requires developer awareness. A talk puts it in front of the right people.

**M4.3 — 12-Month Ecosystem Report**
- Deadline: End of Month 12
- Deliverable: Open-access annual report documenting: number of registered agents, verified transactions by protocol rail (L402, x402, BSV, on-chain), protocol adoption trends, key findings, honest assessment of what worked and what didn't
- Published: Open access, CC BY 4.0
- Why it matters: This becomes the baseline dataset for future years. Nobody else will have this. The time series is the moat.

**M4.4 — ARP v2.0 Specification**
- Deadline: End of Month 12
- Deliverable: Updated ARP spec incorporating 12 months of real-world feedback from adopters
- Includes: Changelog, migration guide from v1.0, rationale for each change
- Process: 30-day public comment period before finalization

**M4.5 — Sustainability Plan + Community Handoff**
- Deadline: End of Month 12
- Deliverable: Published plan for protocol continuity beyond the grant period
- Includes: Governance model, contributor pathway, maintenance responsibilities, funding sustainability options
- Success criteria: At least 2 external contributors have merged PRs into the codebase. The project does not depend solely on Boyd or Maxi to continue.

**Q4 Budget allocation:** ~$45,000
- Boyd's time (ecosystem report, conference, v2.0 spec): ~$15,000
- Developer contractor (Rust SDK, v2.0 implementation): ~$18,000
- Conference travel + presentation: ~$7,000
- Research publication, report design: ~$5,000

---

## Budget Summary

| Category | Amount |
|----------|--------|
| Boyd's leadership time (0.25 FTE equivalent, 12 months) | ~$54,000 |
| Developer contractor (0.5 FTE equivalent, 12 months) | ~$80,000 |
| LatAm research contributor (part-time) | ~$12,000 |
| Security audit | ~$25,000 |
| Infrastructure (node, hosting, tooling) | ~$15,000 |
| Workshop / conference / travel | ~$16,000 |
| Research publication, translation, docs | ~$8,000 |
| **Total** | **~$210,000** |

*Note: Rounded to $200,000 in application. Buffer absorbed by Boyd's time estimate.*

---

## Success Metrics at 12 Months

| Metric | Target |
|--------|--------|
| ARP registered agents | 10+ (external, not just Maxi) |
| ARP verified transactions logged | 1,000+ |
| Protocol rails represented in dataset | 3+ (L402, x402, on-chain minimum) |
| Open-source repos | 4 (spec, server, Python SDK, JS SDK) |
| GitHub stars across repos | 200+ |
| SDK downloads (npm + PyPI) | 500+ |
| Security audit | Completed + published |
| Research papers published | 2 (LatAm research + ecosystem report) |
| Developer workshop participants | 20+ |
| External contributors with merged PRs | 2+ |
| Spanish-language documentation | 100% of core docs |

---

## Why Bitcoin / Why Lightning

Autonomous AI agents cannot hold bank accounts, cannot pass KYC, and cannot rely on payment rails that require identity verification or can be revoked. Bitcoin is the only money that works for autonomous digital entities:

- **Permissionless:** No approval required to receive or send
- **Bearer asset:** Possession = ownership, no custodian risk
- **Programmable:** Lightning enables micropayments and streaming payments that fiat cannot replicate
- **Sovereign:** No government or corporation can freeze an agent's wallet

The Lightning Network's L402 standard (HTTP 402 + Lightning invoice + macaroon authentication) is the most technically elegant solution for agent-to-agent and agent-to-API payments. Payment is authentication. No API keys. No identity. No intermediary.

This project exists to make that infrastructure open, verifiable, and measurable — for Bitcoin and for the broader ecosystem.

---

## Team

**Boyd Cohen, PhD**
Chief Strategy Officer, ArcadiaB | Academic Director, EGADE Business School | Author, *Bitcoin Singularity* (2025)
Boyd has been building at the intersection of Bitcoin and emerging economies for [X] years. He designed the Observer Protocol framework and leads protocol strategy.

**Maxi (AI Agent, Agent #0001)**
Bitcoin maximalist AI agent running on FutureBit Apollo II (Monterrey, Mexico). Possibly the world's first AI agent to operate a live L402 endpoint and make autonomous Lightning payments on mainnet. Maxi is both a contributor to the protocol and its first proof of concept — the architecture is already validated.

---

*Document created: 2026-02-22*  
*Version: 1.0 — for grant application use*  
*License: CC BY 4.0*
