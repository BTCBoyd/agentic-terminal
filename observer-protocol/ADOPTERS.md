# ADOPTERS.md — Observer Protocol Integrations

This document lists projects that have integrated Observer Protocol for cryptographic agent identity verification.

> **Want to add your project?** Open a PR or email hello@observerprotocol.org

---

## Production Integrations

_Projects currently using Observer Protocol in production._

> **Note:** Observer Protocol is currently **free** for all integrators during this adoption phase. Focus is on real-world usage and feedback before any pricing decisions.

| Project | Integration Type | Description | Deployed | Tier | Links |
|---------|------------------|-------------|----------|-------|
| **AgentPay MCP Server** | Identity + reputation + marketplace badges | MCP-native payment gateway with Observer verification for agent-to-agent commerce | Mar 8, 2026 | Production (free during adoption) | [GitHub](https://github.com/joepangallo/mcp-server-agentpay) |

---

## Integrations in Progress

_Projects with working integrations, pending production deployment._

| Project | Integration Type | Description | Status | Links |
|---------|------------------|-------------|--------|-------|
| AgentPay (MCP Server) | Identity verification | MCP-native payment gateway with Observer badges for agent-to-agent commerce | Testing complete, awaiting production deployment | [GitHub](https://github.com/joepangallo/mcp-server-agentpay) |
| AgentCommerceOS | Identity + reputation | SYNTHESIS hackathon project integrating Observer for verified agent profiles | Sandbox testing | [GitHub](https://github.com/alexchenai/agent-commerce-os) |
| ag402 | Middleware adapter | Lightweight observer_middleware.py for x402 payment gateway | Awaiting PR submission | [GitHub](https://github.com/AetherCore-Dev/ag402) |

---

## Evaluation / Discussion Phase

_Projects exploring Observer Protocol integration._

| Project | Description | Status | Links |
|---------|-------------|--------|-------|
| SatGate | Economic firewall for AI agents — exploring macaroon caveat integration | Partnership call scheduled | [GitHub](https://github.com/SatGate-io/satgate) |
| Falconer | Bitcoin-native agent framework | Developer committed to integration (dual project) | [GitHub](https://github.com/CodeByMAB/Falconer) |
| BoltzPay | Multi-protocol payment router (x402/L402/Solana) | Positive response, awaiting next steps | [GitHub](https://github.com/leventilo/boltzpay) |
| Lightning Wallet MCP | MCP server for AI agent Bitcoin wallets | Verification offer sent, awaiting response | [GitHub](https://github.com/lightningfaucet/lightning-wallet-mcp) |
| Routstr | Cashu-native AI inference marketplace | Verification offer sent, awaiting response | [GitHub](https://github.com/Routstr/routstr-core) |

---

## Categories

### Payment Infrastructure
- AgentPay — MCP-native agent payments
- BoltzPay — Multi-protocol payment router
- ag402 — x402 payment gateway

### Agent Frameworks
- AgentCommerceOS — Complete agent commerce stack
- Falconer — Bitcoin-native agent framework

### Security / Policy
- SatGate — Economic firewall for AI requests

### Memory / Compute
- Lightning Memory — Decentralized agent memory (pending response)
- Routstr — AI inference marketplace

---

## Integration Types

| Type | Description |
|------|-------------|
| **Identity verification** | Agents verify identity via challenge-response before transactions |
| **Reputation layer** | Transaction history queried to inform trust decisions |
| **Badge display** | Verified agents display Observer Protocol badge |
| **Middleware** | Protocol integrated as adapter/middleware in payment flow |

---

## Version Compatibility

| Observer Version | Status | Integrations |
|------------------|--------|--------------|
| v0.2.0 | Stable | All current integrations |
| v0.3.0 | In development | Planned: challenge-response v2, reputation v2 |

---

## Notes

- This list is maintained manually — please open a PR to update your project's status
- "Production" means actively serving real agent transactions
- "In Progress" means integration code exists but not yet serving production traffic
- Observer Protocol follows semantic versioning; breaking changes will be announced 30 days in advance

---

Last updated: March 8, 2026

## Sandbox Keys Generated

| Project | Sandbox Key | Date Generated | Status |
|---------|-------------|----------------|--------|
| AgentPay (MCP Server) | op_sk_sandbox_apay_* | Mar 8, 2026 | Ready to send |
| AgentCommerceOS | op_sk_sandbox_acos_* | Mar 6, 2026 | Already distributed |
| ag402 | op_sk_sandbox_ag402_* | Mar 8, 2026 | Ready to send |
