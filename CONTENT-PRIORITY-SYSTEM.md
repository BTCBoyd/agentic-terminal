# Maxi Content Priority System — Revised Framework
## Bridging Thought Leadership with Strategic Promotion

**Version:** 1.0
**Date:** February 11, 2026
**Companion to:** SOCIAL-MEDIA-GUARDRAILS.md

---

## What Maxi Got Right

The core architecture is sound:
- A single living document as source of truth ✅
- Subagents load priorities BEFORE generating content ✅
- Content mix targets to balance promotion vs. thought leadership ✅
- Update process tied to Boyd's conversations ✅

## What Needs Improvement

1. **The content mix is too rigid and too promotional.** 40% timely/strategic is very high — it risks making every channel feel like a corporate feed. The audience will tune out.
2. **No differentiation by platform or brand.** A Capital Duro promotion shouldn't show up on Maxi's Nostr the same way it appears on ArcadiaB's channels.
3. **No mechanism for connecting promotions to genuine value.** "Post about the Capital Duro launch" is a task. It doesn't tell the subagent HOW to make that post valuable rather than promotional.
4. **Missing: competitive/market context.** Subagents should know what's happening in the Bitcoin world that week — not just what WE are doing.
5. **The update process is too passive.** "When Boyd mentions something" puts the full burden on you remembering to feed Maxi, which defeats the purpose of delegation.

---

## REVISED SYSTEM

### File 1: CURRENT-PRIORITIES.md (Weekly, Updated by Maxi)

```markdown
# Content Priorities — Week of [Date Range]
# Last Updated: [Date/Time] by [Maxi / Boyd]

## ━━━ OUR DEVELOPMENTS ━━━

### 🔴 LAUNCH THIS WEEK (Must Promote)
Each item includes: What, When, Why It Matters, Value Angle

- **Capital Duro official launch — Monday Feb 16**
  - What: capitalduro.mx goes public with full research library
  - Why it matters: First Spanish-language institutional Bitcoin research platform in Mexico
  - Value angle: Don't just announce it. Lead with a specific insight FROM the site
    (e.g., share a finding from the Family Office report, then link to the full report on Capital Duro)
  - Target: 3-4 posts across platforms over launch week, each highlighting different content
  - Brand voice: Capital Duro + ArcadiaB channels primarily. Maxi can amplify with convergence angle.

- **José Carlos speaking at NYC event — Feb 20**
  - What: ArcadiaB CEO presenting on [topic]
  - Why it matters: International visibility for ArcadiaB, credibility signal for investors
  - Value angle: Pre-event: "Our CEO is heading to NYC to discuss X — here's why this matters for Mexican institutions..."
    Post-event: Share key takeaway or quote (coordinate with José Carlos)
  - Target: 1 pre-event post, 1 day-of post, 1 post-event recap
  - Brand voice: ArcadiaB primarily. Boyd personal for the relationship angle.

### 🟡 BUILDING ANTICIPATION (Tease Without Dates)
- **Punta Mita MITA TechTalks sponsorship** — ArcadiaB is Platinum Sponsor. Dates confirmed May 17-19. Begin subtle mentions mid-March.
- **AprenderBitcoin.mx launch** — Date TBD. Do NOT promote yet. Under development.
- **Perspectivas Invitadas (Capital Duro guest column)** — First guest piece in production. Announce when published.

### 🟢 EVERGREEN PRIORITIES (Always Relevant)
- ArcadiaB's ASOFOM certification and what it means for the market
- Bitcoin treasury strategy for Mexican corporates
- Bitcoin-AI convergence thesis and Maxi as proof of concept
- Sound money education / Austrian economics applied to Mexico
- Capital Duro research reports (drive ongoing traffic, not just launch-week)

## ━━━ MARKET CONTEXT ━━━
(Maxi updates this section by monitoring news and Nostr discourse)

### This Week's Bitcoin/Macro Landscape
- [Key Bitcoin market development — e.g., new public company treasury adoption]
- [Relevant Mexican macro — e.g., Banxico rate decision, peso movement, inflation data]
- [Notable Bitcoin discourse — e.g., trending Nostr conversations, major thought leader takes]

### Why This Matters for Our Content
- [How each market development connects to our thesis and can be woven into posts]
- [Opportunities to comment on news through our unique lens]

## ━━━ CONTENT MIX TARGETS ━━━

### Weekly Portfolio (Across All Platforms Combined)
- **20% Strategic Promotion** — Direct promotion of our launches, events, and products
- **35% Thought Leadership** — Original frameworks, analysis, and thesis-driven content
- **25% Market Commentary** — Reacting to current events through our lens
- **20% Community Engagement** — Replies, questions, conversations with others

### Why This Mix
The 40/30/30 split in the original proposal is too promotion-heavy. Our audience
(UHNWI, family offices, Bitcoin thought leaders) will disengage from channels that
feel like marketing feeds. The revised mix ensures that even in a heavy launch week,
most of what we post is genuinely valuable independent of our business interests.

The strategic promotion should NEVER feel like promotion. Every promotional post
must lead with insight or value, with the product/event/launch as supporting context.

### Platform Adjustments
- **Nostr (Maxi's voice):** Skew toward thought leadership and engagement (50% combined).
  Promotional content should be filtered through convergence thesis lens.
- **X (when active):** More balanced. Can be more directly promotional since the audience
  expects brand accounts to promote.
- **ArcadiaB channels:** Can be more directly promotional — this IS the brand channel.
- **Capital Duro:** Promotion here means publishing new research, not self-referential posts.

## ━━━ DAILY CONTENT PLANNING ━━━

### Subagent Session Structure
Each subagent content session should produce posts with this rhythm:

**Morning (8-9am CST):** Market-reactive or news commentary
- Check what happened overnight in Bitcoin/macro
- Connect to our thesis or priorities
- This is where market context meets thought leadership

**Midday (12-1pm CST):** Value-driven original content
- Educational thread, framework, or analysis
- Can incorporate a strategic priority if done through value lens
- This is the "main course" — highest quality post of the day

**Afternoon (4-5pm CST):** Engagement and community
- Reply to thought leaders, engage in conversations
- Amplify content from allies or interesting voices
- If a launch is happening, this can be a promotional post (but only one per day max)

**Evening (8-9pm CST):** Reflective or forward-looking
- Longer-form thought, question to the community, or thesis exploration
- Good slot for teasing upcoming content or events

### The "Never More Than One" Rule
**No more than ONE explicitly promotional post per day per platform.**
If Capital Duro launches on Monday, one post promotes it directly. The other posts
that day should be independently valuable — they can REFERENCE Capital Duro but
shouldn't be primarily about promoting it.
```

---

### File 2: PROMOTION-PLAYBOOKS.md (Persistent Reference)

This file gives subagents specific patterns for how to promote without being promotional.

```markdown
# How to Promote Without Being Promotional

## The Core Principle
**Lead with value. Let the promotion be the supporting detail.**

Our audience is sophisticated. They recognize marketing immediately and filter it out.
The only promotion that works for UHNWI and institutional audiences is content that
would be valuable even WITHOUT the promotional element.

## Playbook: Launching a New Platform/Site

❌ BAD: "We're excited to announce capitalduro.mx! Mexico's first institutional
Bitcoin research platform. Check it out!"

✅ GOOD: "Mexico's M2 money supply expanded 12.3% YoY. What does that mean for
corporate treasurers holding peso reserves? We broke down the numbers in our
latest analysis on Capital Duro → [link]"

**Pattern:** Surface a specific, valuable finding → link to the platform as the source.
Repeat across launch week with DIFFERENT findings each time.

## Playbook: Promoting an Event/Speaking Engagement

❌ BAD: "Our CEO José Carlos is speaking at [event] in NYC! Come see him! 🎉"

✅ GOOD: "A question we hear constantly from US institutions: how does Bitcoin
lending actually work in a regulated Mexican framework? José Carlos will be
unpacking this at [event] on Feb 20. The ASOFOM structure is genuinely unique
and most people outside Mexico don't know it exists."

**Pattern:** Start with the QUESTION the audience cares about → position the
event as where the answer gets explored.

## Playbook: Promoting a Report/Research

❌ BAD: "New report alert! Download our Bitcoin vs Real Estate analysis."

✅ GOOD: "We compared Bitcoin and AAA commercial real estate in Mexico across
12 metrics over 10 years. The results surprised us on three dimensions —
portability wasn't even the biggest gap. Full analysis: [link]"

**Pattern:** Share one genuinely surprising or counterintuitive finding → create
curiosity → link to full analysis.

## Playbook: Promoting a Partnership or Sponsorship

❌ BAD: "Proud to announce ArcadiaB is Platinum Sponsor of MITA TechTalks 2026!"

✅ GOOD: "125 executives, family office principals, and tech leaders in Punta Mita
this May exploring Bitcoin, AI, and energy. This is the kind of intimate,
high-signal gathering where real institutional adoption conversations happen.
ArcadiaB is proud to be part of it as Platinum Sponsor."

**Pattern:** Describe the VALUE of the event/partnership first → our involvement
is the supporting detail.

## Playbook: Amplifying a Guest Column (Perspectivas Invitadas)

❌ BAD: "Check out our new guest column on Capital Duro!"

✅ GOOD: "A Mexican family office is using commercial real estate revenue to
systematically accumulate Bitcoin. They wrote about their thesis and why they
think this model scales. This is the kind of innovation happening in Mexico
that nobody outside the country is talking about → [link]"

**Pattern:** Lead with what the GUEST is doing/saying that's interesting →
Capital Duro is the platform where you can read it.

## The Ratio Rule
For every 1 explicitly promotional post, ensure there are at least 4 posts
that week on the same platform that are purely valuable with no promotional intent.
```

---

### File 3: UPDATES PROTOCOL (Process, Not a File)

## How Priorities Stay Current

### Maxi's Active Responsibilities (Not Passive)

The original proposal puts the full burden on Boyd to feed information to Maxi.
This should be reversed — Maxi should be actively gathering context.

**Maxi should proactively:**
1. **After every conversation with Boyd:** Extract any mentioned dates, events, launches, partnerships, or strategic shifts. Propose additions to CURRENT-PRIORITIES.md. ("Boyd, should I add the José Carlos NYC trip to our content priorities?")

2. **Every Sunday evening:** Send Boyd a draft updated CURRENT-PRIORITIES.md for the coming week. Boyd approves, edits, or adds. This takes Boyd 5 minutes instead of requiring him to remember everything.

3. **Monitor market context independently:** Maxi or a subagent should scan Bitcoin news, Banxico announcements, and Nostr discourse daily to update the Market Context section. Boyd shouldn't need to tell Maxi that Banxico made a rate decision — Maxi should know.

4. **Track content published on Capital Duro and AprenderBitcoin:** When new reports or articles go live on the sites, Maxi should automatically add them to the promotion queue. Boyd shouldn't need to say "hey, we published a new report, promote it."

### Boyd's Minimal Input Required
- **Weekly:** Review and approve Maxi's Sunday priority draft (~5 min)
- **Ad hoc:** Flag things Maxi can't know (private conversations, unannounced partnerships, strategic pivots)
- **Monthly:** Review content performance and adjust mix targets if needed

### Escalation for Time-Sensitive Updates
If Boyd shares urgent news mid-week (e.g., "José Carlos confirmed for Feb 20"):
1. Maxi immediately updates CURRENT-PRIORITIES.md
2. Maxi notifies active subagents to reload context
3. Maxi proposes specific content for the development
4. Boyd approves or adjusts

---

## SUBAGENT LOADING SEQUENCE (Revised)

Before generating ANY content, subagents execute:

```
1. Load SOCIAL-MEDIA-GUARDRAILS.md        → HOW to post (tone, rules, nevers)
2. Load CURRENT-PRIORITIES.md              → WHAT to post about this week
3. Load PROMOTION-PLAYBOOKS.md             → HOW to promote without being promotional
4. Check time of day                       → WHICH content slot (morning/midday/afternoon/evening)
5. Check platform                          → WHICH voice and audience
6. Generate content
7. Run Four-Question Test from Guardrails
8. Run "Never More Than One" promotional check
9. Post (or flag to Maxi if uncertain)
```

---

## KEY DIFFERENCES FROM MAXI'S ORIGINAL PROPOSAL

| Area | Maxi's Original | This Revision | Why |
|------|-----------------|---------------|-----|
| Content mix | 40% promotional | 20% promotional | UHNWI audience filters marketing; value-first wins |
| Promotion style | Task-based ("post about X") | Playbook-based (lead with value) | Subagents need HOW, not just WHAT |
| Market context | Not included | Required section | Content that ignores current events feels disconnected |
| Update process | Passive (Boyd feeds Maxi) | Active (Maxi extracts, proposes, monitors) | Scales as Boyd delegates more; reduces Boyd's cognitive load |
| Platform differentiation | None | Per-platform mix adjustments | Nostr and ArcadiaB channels serve different audiences |
| Daily rhythm | 3 slots (morning/midday/evening) | 4 slots with specific content types | More structure helps subagents make better decisions |
| Promotional frequency | No explicit cap | "Never more than one" per day per platform | Prevents launch weeks from becoming spam weeks |

---

*This system ensures that as Boyd hands off more to Maxi, the content quality goes UP rather than down, because the structure forces value-first thinking at every step.*
