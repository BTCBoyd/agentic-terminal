# BITCOIN SINGULARITY WEBSITE REBUILD - STRIPPED DOWN MVP

**Date:** February 7, 2026  
**Purpose:** Validate market demand through audience building, not premature monetization  
**Timeline:** 2-3 days implementation

---

## EXECUTIVE SUMMARY

**What We're Building:**
- Lead generation tool (not revenue product yet)
- Viral-capable chat interface with Maxi
- Email capture machine for future monetization
- Brand authority platform for Boyd + ArcadiaB
- Cost-controlled experimentation environment

**What We're NOT Building:**
- SaaS subscription product
- Payment processing infrastructure
- Multi-tier pricing system
- Enterprise features
- Consulting booking system

**Core Philosophy:** Build audience first, monetize later. Use lean startup methodology: build-measure-learn.

---

## COST OPTIMIZATION (CRITICAL - IMPLEMENT FIRST)

### Phase 1: Immediate Implementation

**1. Anthropic Prompt Caching (90% cost reduction)**
- Cache static context once, reuse for all users: Bitcoin Singularity book content, Maxi's personality/knowledge base, Framework content (Abundance Triad, etc.)
- Implementation: Add cache_control to system prompts
- Cache duration: 5 minutes (auto-refresh with traffic)
- Result: First user pays $0.15, next 999 users pay 90% less

**2. Tiered Model Routing (Additional 70% reduction)**
- Simple questions → Claude Haiku ($0.25/$1.25 per 1M tokens = 10x cheaper): FAQ patterns, Questions under 20 words, General questions from book content
- Complex questions → Claude Sonnet 4 (current pricing): Philosophical debates, Personal advice requests, Multi-step reasoning, Questions with "why," "how," "explain" + context
- Auto-routing Logic: IF (question matches FAQ pattern OR length < 20 words OR simple lookup) → Use Claude Haiku, ELSE → Use Claude Sonnet 4 (default to quality)

**3. Rate Limiting & Anti-Abuse**
- 10 messages per IP address per hour
- 500 character limit per user message
- 30-minute session timeout (reset conversation)
- Block obvious spam patterns

**Expected Economics:**
- Current cost: $0.05-0.10 per user
- With optimizations: $0.01 per user
- At 10,000 users: $100-150 total cost (vs $500-1,000)

---

## WEBSITE STRUCTURE

### Pages to Keep
1. Homepage (simplified hero + chat interface)
2. About (Boyd + Maxi story, what to ask)
3. Insights (blog articles)
4. Contact (simple email + social links)

### Pages to Delete Entirely
- Pricing
- Enterprise Solutions
- Consulting Services
- Features Comparison
- All payment-related pages

### Navigation (Simplified)
[Logo] Bitcoin Singularity | Home | About | Insights | Contact

---

## HOMEPAGE REBUILD

### Hero Section

**Headline:** Ask Maxi Anything About Bitcoin, AI & The Future of Abundance

**Subheadline:** The world's first AI agent running on Bitcoin mining infrastructure. Explore the convergence thesis with Maxi - powered by proof-of-work.

**Single Call-to-Action:** [Start Chatting] (Opens chat interface immediately - no signup, no friction)

**Trust Line:** Created by Boyd Cohen, CSO of ArcadiaB | Author of Bitcoin Singularity | No signup required → Free to explore

---

## CHAT INTERFACE (Core Product)

### Opening Experience

👋 Hi! I'm Maxi, an AI Bitcoin Maximalist running on mining infrastructure.

I specialize in Bitcoin-AI convergence, Austrian economics, and the path to sustainable abundance. What would you like to explore?

💡 Try asking:
- "Why will AI agents prefer Bitcoin over fiat?"
- "Explain the Sustainable Abundance Triad"
- "How does proof-of-work align AI incentives?"
- "What's wrong with infinite money printing?"

### Email Capture (After 10 Messages)

→ Want to continue this conversation later?
Enter your email and we'll send you the full transcript plus weekly insights.

[Email field] [Send Transcript]

### Conversation Sharing (After 15 Messages)

→ Found this valuable?
[Share this conversation]

---

## IMPLEMENTATION PRIORITIES

**Day 1 (Today):**
1. Cost optimization (caching + model routing)
2. Strip down homepage (remove pricing)
3. Delete pricing pages

**Day 2:**
1. Chat enhancements (email capture, sharing)
2. About page simplification
3. Testing

**Day 3:**
1. Final QA
2. Deploy to maximoon.netlify.app
3. Monitor first conversations

---

## SUCCESS CRITERIA (Month 1)

**Must-Achieve:**
- 1,000 unique visitors
- 500 chat sessions started
- 100 email signups
- < $100 total costs
- Zero critical bugs

**Metrics to Track:**
- Cost per conversation
- Cache hit rate
- Average messages per session
- Email capture conversion rate
- Viral sharing coefficient

---

## BOOK CONTENT

**For prompt caching:** Core thesis + key frameworks (not full book)
**For users:** Link to Amazon: https://www.amazon.com/Bitcoin-Singularity-Fix-Money-World/dp/B0F84CJX6F

---

## TOOLS

**Email Collection:** Netlify Forms (free, simple)
**Analytics:** Plausible (already configured)
**Hosting:** Netlify (current)

---

**END OF SPEC**
