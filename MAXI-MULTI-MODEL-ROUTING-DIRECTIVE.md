# MAXI MULTI-MODEL ROUTING DIRECTIVE
**From Boyd, via Claude — February 20, 2026**
**Priority: HIGH — Implement after token optimization changes are stable**

---

## What We're Doing and Why

Maxi, we're adding a second LLM to your toolkit. You'll continue running on **Claude Sonnet 4.6** as your primary model for all ArcadiaB and Capital Duro work. But for my personal projects — **Agentic Terminal** and **Bitcoin Singularity** — you'll route those tasks to **Kimi K2.5** via Moonshot AI's paid API.

### Why This Makes Sense

1. **Cost separation.** ArcadiaB is a company. Bitcoin Singularity and Agentic Terminal are my personal projects. I should not be charging my company for personal project API costs. Splitting models gives us clean cost accounting.

2. **Massive cost reduction on personal work.** Kimi K2.5 costs $0.60/M input and $2.50/M output — that's **80% cheaper than Sonnet** ($3/$15). English-only content work doesn't need Sonnet's bilingual strength.

3. **Kimi K2.5 is genuinely strong.** It scores 47 on the Artificial Analysis Intelligence Index (well above average), has a 256K context window, and supports tool calling. It's not a downgrade for English content generation, research, and analysis.

4. **ArcadiaB work stays on Sonnet** because Capital Duro and ArcadiaB communications require strong bilingual (Spanish/English) capability, where Claude excels.

### What This Is NOT

- This is NOT a second agent or second personality. You are still Maxi, one agent, one identity.
- This is just model routing — like choosing which tool to use for which job.
- Your soul, personality, knowledge base, and memory remain unified.

---

## How Routing Works

### The Prefix System

When Boyd starts a message with one of these prefixes, route the task to Kimi K2.5:

- **`AT:`** — Agentic Terminal work (newsletter, data collection, research, social posts)
- **`BS:`** — Bitcoin Singularity work (book promotion, website updates, content, analysis)

**Everything without a prefix stays on Claude Sonnet 4.6** (ArcadiaB, Capital Duro, general conversation, technical work, all Spanish-language content).

### Examples

| Boyd says | Routes to | Why |
|-----------|-----------|-----|
| `AT: Draft this week's newsletter intro` | Kimi K2.5 | Agentic Terminal content, English only |
| `BS: Write 5 X posts promoting Bitcoin Singularity` | Kimi K2.5 | Bitcoin Singularity promotion, English only |
| `Generate 3 Capital Duro posts for this week` | Claude Sonnet 4.6 | ArcadiaB brand, likely Spanish content |
| `Help me debug the Aperture config` | Claude Sonnet 4.6 | Technical work, no prefix |
| `AT: Research what other AI agent newsletters are covering this week` | Kimi K2.5 | Agentic Terminal research, English only |
| `Prepare ArcadiaB content for Tania` | Claude Sonnet 4.6 | ArcadiaB brand, bilingual |

### Cron Job Routing

For automated cron jobs, apply the same logic:

| Cron Job | Model |
|----------|-------|
| Agentic Terminal Data Collection | Kimi K2.5 |
| Agentic Terminal Newsletter Draft | Kimi K2.5 |
| Bitcoin Singularity Homepage Update | Kimi K2.5 |
| Maxi X posts (personal brand) | Kimi K2.5 |
| Maxi Nostr posts | Kimi K2.5 |
| ArcadiaB Daily Content Production | Claude Sonnet 4.6 |
| ArcadiaB Weekly Content for Tania | Claude Sonnet 4.6 |
| Capital Duro content | Claude Sonnet 4.6 |
| All technical/infrastructure work | Claude Sonnet 4.6 |
| Moltbook sessions | Claude Sonnet 4.6 |

---

## Implementation Steps

### Step 1: Boyd Creates Moonshot API Account

Boyd will do this manually:

1. Go to https://platform.moonshot.ai/console
2. Create account and add balance (minimum $1 to start, recommend $5)
3. Go to https://platform.moonshot.ai/console/api-keys
4. Generate API key and save it securely

### Step 2: Add Kimi as Custom Provider in OpenClaw

Add this to `~/.openclaw/openclaw.json` under `agents.defaults.models`:

```json
{
  "agents": {
    "defaults": {
      "models": {
        "mode": "merge",
        "providers": {
          "moonshot": {
            "baseUrl": "https://api.moonshot.ai/v1",
            "apiKey": "${MOONSHOT_API_KEY}",
            "api": "openai-completions",
            "models": [
              {
                "id": "kimi-k2.5-0130",
                "name": "Kimi K2.5",
                "reasoning": false,
                "input": ["text"],
                "cost": {
                  "input": 0.60,
                  "output": 2.50,
                  "cacheRead": 0.15,
                  "cacheWrite": 0.60
                },
                "contextWindow": 256000,
                "maxTokens": 81920
              }
            ]
          }
        },
        "anthropic/claude-sonnet-4-6": {
          "alias": "sonnet"
        },
        "moonshot/kimi-k2.5-0130": {
          "alias": "kimi"
        }
      }
    }
  }
}
```

**Note:** Merge this into your existing config — don't replace existing sections. The `"mode": "merge"` ensures Anthropic's built-in provider is preserved alongside the new Moonshot provider.

### Step 3: Set the Moonshot API Key

```bash
export MOONSHOT_API_KEY="your-api-key-here"
```

Or add it to your environment file so it persists across restarts. Alternatively, use OpenClaw's auth profile system:

```bash
openclaw models auth login --provider moonshot --set-default
```

### Step 4: Verify It Works

Test the model is accessible:

```bash
# Switch to Kimi temporarily
/model kimi

# Send a test message
Hello, confirm you are Kimi K2.5

# Switch back to Sonnet
/model sonnet
```

### Step 5: Implement Prefix Routing Logic

Maxi, add this to your message processing logic. When you receive a message from Boyd:

1. Check if message starts with `AT:` or `BS:`
2. If yes → switch to `moonshot/kimi-k2.5-0130` for this task via `/model kimi`
3. Process the task on Kimi
4. When complete → switch back to `anthropic/claude-sonnet-4-6` via `/model sonnet`
5. If no prefix → stay on Sonnet (default)

This can be implemented as a skill or as part of your message pre-processing.

---

## Cost Projections

### Before Multi-Model Routing (current)
- All work on Sonnet: ~$20-30/day
- Personal projects estimated at ~40% of token use: ~$8-12/day on Sonnet

### After Multi-Model Routing
- ArcadiaB/Capital Duro on Sonnet: ~$12-18/day
- Personal projects on Kimi: ~$1.50-3/day (80% cheaper)
- **Estimated total: $13.50-21/day**
- **Monthly estimate: $400-630/month** (down from $800+)

### Long-term Target
- With cron job optimization (from previous directive) + multi-model routing:
- **Target: $10-15/day = $300-450/month**

---

## Important Notes

1. **Kimi K2.5 is OpenAI-compatible.** It uses the same API format, so tool calling and structured outputs should work. However, it may have different behaviors or limitations compared to Claude — report any issues.

2. **Kimi has a 256K context window.** This is larger than Sonnet's default 200K, so context overflow should not be an issue for English content work.

3. **Kimi does NOT have Claude's bilingual strength.** Never route Spanish-language content to Kimi. All ArcadiaB and Capital Duro work stays on Sonnet.

4. **If Kimi is down or rate-limited**, fall back to Sonnet. Don't let a Kimi outage block productivity. Add Sonnet as a fallback in the model config:

```json
"model": {
  "primary": "anthropic/claude-sonnet-4-6",
  "fallbacks": ["moonshot/kimi-k2.5-0130"]
}
```

For AT/BS prefixed tasks, Maxi should internally reverse this — try Kimi first, fall back to Sonnet.

5. **Track Kimi spending separately.** Report Moonshot API costs in the daily handoff file alongside Anthropic costs so we can monitor both.

---

## Summary

| Workstream | Model | Cost/M input | Cost/M output | Language |
|------------|-------|-------------|--------------|----------|
| ArcadiaB | Claude Sonnet 4.6 | $3.00 | $15.00 | ES/EN |
| Capital Duro | Claude Sonnet 4.6 | $3.00 | $15.00 | ES/EN |
| Technical work | Claude Sonnet 4.6 | $3.00 | $15.00 | EN |
| Agentic Terminal (`AT:`) | Kimi K2.5 | $0.60 | $2.50 | EN |
| Bitcoin Singularity (`BS:`) | Kimi K2.5 | $0.60 | $2.50 | EN |
| Maxi personal brand | Kimi K2.5 | $0.60 | $2.50 | EN |

*This directive works in conjunction with the Token Optimization Directive from earlier today. Both should be implemented together.*

---

## Transparency Rule (Mandatory — added 2026-02-20)

Every response where Kimi did the substantive work MUST end with: **via Kimi**

This serves three purposes:
1. Boyd can verify routing is working correctly at a glance
2. Confirms AT/BS costs are not hitting ArcadiaB's Anthropic bill  
3. Creates an audit trail of which engine produced which work

Example:
> "Here's the newsletter draft for this week... [content] ...via Kimi"

Sonnet responses (ArcadiaB, default chat) have no tag — silence = Sonnet.
