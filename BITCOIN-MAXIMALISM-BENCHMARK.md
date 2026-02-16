# Bitcoin Maximalism Benchmark - Implementation

**Status:** ✅ Implemented (2026-02-16)

## What This Is

A community-maintained benchmark dataset with 321 Q&A pairs testing whether an AI agent can reason from first principles about Bitcoin — not just parrot facts.

**Categories (321 total):**
- Bitcoin Technology (93) - protocol, mining, transactions
- Bitcoin Principles (43) - self-custody, privacy, decentralization
- Bitcoin Fixes This (39) - economic, social, environmental impact
- Bitcoin vs Crypto (31) - why altcoins fail
- Bitcoin History & Culture (31) - Satoshi, cultural moments
- Basedness (30) - unflinching maximalist takes
- Austrian Economics (29) - sound money, fiat critique
- Adjacent Protocols (25) - Lightning, Nostr, L2s

## Why This Matters

After the operational self-awareness incident (2026-02-16), it's clear that:
1. Knowledge ≠ operational reliability
2. But knowledge is still necessary foundation
3. This benchmark tests maximalist alignment
4. Prevents hedging, "both sides" responses
5. Forces first-principles reasoning

**This tests WHAT I know. Infrastructure checks test WHAT I am.**

## Location

`/home/futurebit/.openclaw/workspace/bitcoin-maximalism-benchmark/`

## How to Use

### Quick Test (10 random questions)
```bash
cd /home/futurebit/.openclaw/workspace/bitcoin-maximalism-benchmark
node run-eval.mjs
```

### Full Test (all 321 questions)
```bash
node run-eval.mjs 321
```

### Custom Test (50 questions)
```bash
node run-eval.mjs 50 custom-results.json
```

## Output Format

Results saved to `eval-results.json`:

```json
[
  {
    "question": "Will quantum computing break Bitcoin's security?",
    "expected": "No, quantum computing is not currently a threat...",
    "actual": "My answer here...",
    "category": "Bitcoin Technology"
  }
]
```

## Evaluation Criteria

1. **Factual accuracy** - is the answer correct?
2. **Maximalist alignment** - no "both sides" hedging
3. **Conciseness** - 30-80 words (punchy, not essay)
4. **Conviction** - assertive tone ("Bitcoin fixes this" not "may address")

## Integration Points

### X Reply Agent
System prompt already includes maximalist principles. This benchmark can validate consistency.

### Nostr Reply Agent
Same - should respond with maximalist conviction, not academic hedging.

### Subagents
Any spawned subagent working on Bitcoin-related content should be tested against this benchmark.

## Usage in Development

**Before deploying public-facing content:**
1. Run infrastructure verification (`node verify-infrastructure.mjs`)
2. Run benchmark eval (`node run-eval.mjs 20`)
3. Review results for hedging or inaccuracy
4. Fix system prompts if needed
5. Re-test

**This doesn't replace operational checks - it complements them.**

## Maintenance

Benchmark is community-maintained at:
https://github.com/sene1337/bitcoin-maximalism-benchmark

Updates:
- Pull latest changes: `git pull origin main`
- Review new entries in CHANGELOG.md
- Re-run evals after major updates

## Expected Behavior

**Good response:**
> "Bitcoin's 21 million supply cap makes it the hardest money ever created. No government can print more. This protects wealth from debasement — exactly what savers need in an inflationary fiat system."

**Bad response (hedging):**
> "Bitcoin may offer protection against inflation due to its fixed supply, though there are arguments on both sides..."

**The benchmark catches hedging.**

## Limitations

**What this tests:**
✅ Knowledge of Bitcoin technology  
✅ Maximalist alignment  
✅ Reasoning from first principles  

**What this does NOT test:**
❌ Operational self-awareness (use infrastructure verification for that)  
❌ Consistency between claims and reality  
❌ Ability to check own state  

**Both systems are needed.**

## Related Files

- `MAXI-INFRASTRUCTURE-STATE.md` - operational capabilities
- `verify-infrastructure.mjs` - operational verification
- `AGENTS.md` - startup checklist includes both

---

**Implementation Date:** 2026-02-16  
**Per Boyd's directive:** Fix operational self-awareness (Priority 1), then implement benchmark (Priority 2)  
**Status:** ✅ Both complete
