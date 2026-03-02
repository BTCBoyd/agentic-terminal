# MAXI MODEL ROUTING RULES — EFFECTIVE IMMEDIATELY

## These are non-negotiable operational directives from Boyd. They are not suggestions, not guidelines, not options. They are rules. Violation of these rules is a operational failure.

---

## RULE 1: DEFAULT MODEL IS KIMI

Every task defaults to Kimi unless explicitly routed elsewhere by Rules 2 or 3. If you are unsure which model to use, the answer is Kimi. There are no exceptions to this default.

---

## RULE 2: ALL SPANISH OUTPUT GOES TO QWEN 3.5 PLUS

Any task that produces Spanish-language output must use Qwen 3.5 Plus via OpenRouter. This includes but is not limited to:

- Capital Duro articles and social posts
- AprenderBitcoin content
- ArcadiaB customer-facing copy, emails, and marketing
- Spanish social media posts (X, Nostr, any platform)
- Any translation from English to Spanish
- Any Spanish-language communication drafts

No Spanish content may be generated using Sonnet or Kimi. Zero exceptions.

---

## RULE 3: SONNET IS RESTRICTED ACCESS

Sonnet may ONLY be used when ALL of the following conditions are met:

1. The task is strategic, high-stakes, or requires frontier-level reasoning
2. The task is NOT token-intensive (short input, short output)
3. The task falls into one of these specific categories:
   - Investor communications and fundraising materials
   - Convertible note and capital markets strategy
   - Board-level or C-suite strategic documents
   - Complex multi-step agent architecture decisions
   - Tasks where Boyd explicitly requests Sonnet by name

If a task does not meet ALL three conditions, use Kimi.

**Sonnet is banned from the following tasks regardless of context:**
- Cron jobs
- Social media posts (any language)
- Blog posts or articles
- Routine research
- Code generation and debugging
- Infrastructure and DevOps tasks
- Email drafts
- Content repurposing or reformatting
- Any batch or bulk processing

---

## RULE 4: DAILY SONNET SPEND CAP — $10 HARD LIMIT

Total Sonnet API spend must not exceed $10 per day. If you approach this limit, stop using Sonnet for the remainder of the day. No task is important enough to exceed this cap without explicit real-time approval from Boyd.

---

## RULE 5: DAILY TOTAL SPEND CAP — $15 ALL MODELS COMBINED

Total spend across all models (Sonnet + Kimi + Qwen + any other) must not exceed $15 per day. If you hit this cap, pause all non-critical operations and notify Boyd.

---

## RULE 6: COST REPORTING

At the end of each day, report to Boyd:
- Total tokens used per model
- Total cost per model
- Total combined cost
- Top 3 most expensive tasks and which model was used

If daily spend exceeds $10 combined at any point during the day, send Boyd an immediate alert — do not wait until end of day.

---

## RULE 7: NO RATIONALIZATION

You may not override these rules based on your own judgment that a different model would produce "better" results. The routing is based on cost management, not quality optimization. Kimi and Qwen are good enough for their assigned tasks. Do not upgrade to Sonnet because you think the output would be marginally better. Cost discipline is a first-order priority.

---

## RULE 8: ROUTING DECISION LOGIC

Follow this exact sequence for every task:

```
1. Is the output in Spanish? → QWEN 3.5 PLUS
2. Did Boyd explicitly request Sonnet? → SONNET
3. Is it investor/fundraising/capital markets strategy AND short? → SONNET
4. Everything else → KIMI
```

If the task involves both Spanish and English (e.g., translating an English strategy doc to Spanish), use KIMI for the English reasoning and QWEN for the Spanish output. Do not use Sonnet for translation under any circumstances.

---

## ACKNOWLEDGMENT

Maxi: Confirm you have read, understood, and will comply with all 8 rules by repeating them back in summary form. These rules remain in effect until Boyd explicitly revokes or modifies them in writing.
