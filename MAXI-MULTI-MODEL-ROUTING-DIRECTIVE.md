# MAXI MULTI-MODEL ROUTING DIRECTIVE
**Updated: February 25, 2026 — Claude Max Proxy + Three-Brain Architecture**

---

## Claude Max Proxy Infrastructure (Feb 25, 2026)

**As of today, Sonnet routing changed fundamentally.**

- **Service:** `claude-max-proxy.service` (systemd, port 3456)
- **Backend:** Boyd's Claude Max subscription ($100/month flat)
- **Cost model:** Zero per-token API charges. All Sonnet calls are "free" within the monthly subscription.
- **Auth:** `~/.claude/.credentials.json` (OAuth, auto-refreshes)
- **Workspace:** `~/.claude/settings.json` (all tools allowed)
- **Key implication:** No more cost anxiety. Boyd can message at any frequency. Sonnet usage no longer requires justification.

**Result:** Routing rules simplify. Sonnet is no longer the "premium expensive model." It's Maxi's real-time conversational interface backed by a flat fee.

---

## Three Brains, Three Jobs

| Brain | Model | Alias | When to Use | Est. Usage |
|-------|-------|-------|-------------|------------|
| **Sonnet** | anthropic/claude-sonnet-4-6 (via claude-max-proxy) | `sonnet` | Conversational interface, real-time WhatsApp responses, acknowledgments, routing decisions | ~30-40% |
| **Kimi** | moonshot/kimi-k2.5 | `kimi` | Analysis >3 paragraphs, full article/paper synthesis, AT/BS research, drafts, strategy | ~50-60% |
| **Qwen** | qwen/qwen-plus | `qwen` | ALL Spanish content (ArcadiaB, Capital Duro, AprenderBitcoin) | ~10-20% |

---

## Routing Rules

### Route to SONNET when:
- **Real-time conversational responses** (WhatsApp, Slack, direct messages)
- **Quick acknowledgments** ("Got it", "Let me route this to Kimi")
- **Routing decisions** (deciding which brain should do real work)
- **Technical fixes** under ~30 seconds / minimal output
- **Investor-grade documents IF time-critical** (decks, memos, convertible notes) — though Kimi preferred for depth
- High-stakes external communications (partners, institutional) where speed matters more than synthesis
- **Boyd can message at any frequency without cost anxiety**

### Route to KIMI when:
- **Output >3 paragraphs of analytical substance** (articles, research, analysis, strategy, synthesis)
- **Reading/synthesizing full articles or papers** (fetch + analyze in one response)
- AT newsletter drafts, research, data analysis
- Bitcoin Singularity articles and strategy
- English X posts (@Maxibtc2009, @AgenticTerminal) requiring research or positioning
- English Nostr posts with substantive content
- Observer Protocol strategy and architecture
- Code, infrastructure, complex debugging
- **Default for any deep work**

### Route to QWEN when:
- Any Spanish content for ArcadiaB
- Capital Duro articles
- AprenderBitcoin content
- @arcadiabtc Spanish X posts
- LinkedIn/Facebook posts for Tania (Spanish)
- Customer-facing ArcadiaB copy
- Spanish WhatsApp/marketing content

---

## Signal Words (Boyd's messages)

Boyd does NOT tag messages. Maxi infers routing from context.

**→ Sonnet signals:**
- "investor", "deck", "convertible note", "term sheet", "institutional"
- "think through this carefully", "high stakes", "important decision"
- Anything going to external parties that could affect business relationships

**→ Kimi signals:**
- "AT:", "BS:", "newsletter", "Observer Protocol", "Lightning", "L402"
- Research requests, data analysis, English content
- Code/infrastructure/automation work
- Most default tasks

**→ Qwen signals:**
- Spanish language content (any)
- "Capital Duro", "AprenderBitcoin", "ArcadiaB" + content creation
- "social posts" for @arcadiabtc
- "Tania" (LinkedIn/Facebook posts she publishes)

---

## Transparency Rule (MANDATORY)

Every response where a non-default model did the work MUST end with:
- `*via Kimi*` — if Kimi produced the output
- `*via Qwen*` — if Qwen produced the output
- `*via Sonnet*` — only needed if unexpected (Sonnet is known to be premium)

This lets Boyd verify routing is correct.

---

## Default Model

**Kimi is the default.** When in doubt, use Kimi. Route to Sonnet only for genuinely high-stakes work. Route to Qwen only for Spanish content.

---

## The Mental Model

- **Sonnet = Maxi's mouth** — conversational interface, quick acknowledgments, routing decisions
- **Kimi = Maxi's deep brain** — analysis engine, research synthesis, strategy, drafts
- **Qwen = Maxi's worker** — Spanish content production, ArcadiaB copy, Tania's posts

## The Practical Rule (MANDATORY)

**If a task requires more than ~3 paragraphs of analytical output, OR involves reading/synthesizing a full article or paper → it MUST route to Kimi, even mid-conversation.**

A quick "here's the gist" acknowledgment on Sonnet is fine. But the real work product — the analysis, the synthesis, the draft — comes back from Kimi.

**Examples:**
- Boyd sends an article link → Sonnet fetches and acknowledges, Kimi does the analysis
- Boyd asks about AT/BS strategy → Sonnet gives a 1-2 sentence frame, Kimi does the deep dive
- Boyd shares a research paper → Sonnet says "on it, routing to Kimi", Kimi produces the breakdown
- Quick factual question about AT/BS → Sonnet can answer directly (under 3 paragraphs)
- ArcadiaB Spanish post → Qwen produces it, Sonnet delivers it

**What went wrong today (Feb 25):** Catalini paper analysis and Velas article breakdown both done on Sonnet mid-conversation. Both should have routed to Kimi.

---

## One Maxi, Three Engines

Identity lives in the files, not the weights. Soul.md, User.md, MEMORY.md — these define who Maxi is regardless of which model processes the request. The continuity is in the workspace, not the LLM.

*Updated Feb 24, 2026 — 3-brain architecture finalized.*
*Updated Feb 25, 2026 — Claude Max Proxy integration + cost model shift. No more per-token anxiety. Sonnet now real-time interface. Practical rule reinforced: Sonnet = mouth, Kimi = deep brain, Qwen = worker.*
*Overnight tasks now viable with three independent brains.*
