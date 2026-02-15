# Workspace Structure

**Last updated:** 2026-02-05  
**Purpose:** Reduce token costs by organizing context loading

---

## Root Directory (Auto-loaded as Project Context)

**Keep minimal!** Only files that MUST be loaded every conversation:

- `AGENTS.md` - Core agent instructions (212 lines)
- `TOOLS.md` - Tool configuration (58 lines)
- `SOUL.md` - Agent identity (40 lines)
- `USER.md` - User context (17 lines)
- `MEMORY.md` - Long-term memory (keep under 100 lines!)
- `HEARTBEAT.md` - Heartbeat checklist (keep minimal)
- `IDENTITY.md` - Agent identity details

**Total root context target: <20KB**

---

## Subdirectories (Load on-demand only)

### `/active/` - Current Operational Documents
Documents actively used for current work. Agent can read these when needed:

- `maxi-consulting-playbook.md` - How to do consulting
- `maxi-operating-doctrine.md` - Operating principles
- `maxi-origin-story-protocol.md` - Origin story
- `maxi-treasury-diagnostic.md` - Treasury consulting
- `bitcoin-treasury-advisory-framework.md` - Advisory framework
- `saylor-mental-model-agent-logic.md` - Saylor principles

**Load when:** Doing consulting work, treasury analysis, or need operating principles

### `/reference/` - Reference Materials
Large strategy docs, research, market analysis. Read only when specifically needed:

- Strategy documents (Bitcoin Singularity, Convergence Economy)
- Market research (Mexico Bitcoin market, family office analysis)
- Product catalogs (ArcadiaB products)
- Historical planning documents
- Nostr documentation
- Lightning Network references

**Load when:** Need specific research, planning new strategy, or referencing past work

### `/archive/` - Completed Work
Old projects, completed tasks, superseded documents:

- Old strategies (superseded by newer versions)
- Completed project summaries
- Historical context no longer needed

**Load when:** Reviewing past decisions or need historical context

### `/memory/` - Daily Logs
Day-by-day memory files:

- `2026-02-05.md` - Today's log
- `2026-02-04.md` - Yesterday's log
- etc.

**Auto-load:** Today + yesterday only (per AGENTS.md)

### `/skills/` - Tool Skills
Skill definitions for various tools.

**Load when:** Need to use specific skill

---

## Token Cost Impact

### Before Optimization
- Root context: ~400KB of markdown files
- Project context loading: ~100,000 tokens cached per message
- Monthly cost: ~$522

### After Optimization
- Root context: ~20KB of essential files
- Project context loading: ~20,000-30,000 tokens cached per message
- Expected monthly cost: ~$150-180
- **Savings: ~65-70%**

---

## Maintenance Guidelines

1. **Keep root lean:** Only files needed for EVERY conversation
2. **Archive aggressively:** Move completed work to `/archive/` monthly
3. **Prune MEMORY.md:** Keep under 100 lines, distill to key insights
4. **On-demand loading:** Agent can read from subdirs when needed
5. **Review quarterly:** Reassess what needs to be in root vs subdirs

---

## Reading From Subdirectories

Agent can still access everything, just not auto-loaded:

```
# Read on-demand
read reference/bitcoin-singularity-UPDATED-strategy.md

# Search for specific info
grep "treasury" active/*.md
```

No functionality lost—just more efficient context loading.

---

**Result:** Keep AI capabilities fully intact while reducing unnecessary token costs by 65-70%.
