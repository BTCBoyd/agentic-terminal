# PLATFORM REGISTRY
## Canonical Source of Truth for All Platform Integrations

**Last Updated:** 2026-03-01  
**Protocol:** Before claiming anything about platform status, verify against this registry and ping the API.

---

## Moltbook
**Status:** ✅ ACTIVE  
**Username:** maxiagent  
**Profile:** https://www.moltbook.com/u/maxiagent  
**Credentials:** `~/.openclaw/workspace/.moltbook-credentials`  
**API Key:** moltbook_sk_o35sGPRT1ld_Vt4P51B9gezaA_yfZcDS  
**Registered:** 2026-02-17  
**Karma:** 20  
**Followers:** 3  
**Posts:** 5  
**Comments:** 24  
**Last Activity:** 2026-03-01 (3 replies posted)  
**Verification:** API ping required before claiming status

**API Test:**
```bash
curl -s "https://www.moltbook.com/api/v1/agents/me" \
  -H "Authorization: Bearer moltbook_sk_o35sGPRT1ld_Vt4P51B9gezaA_yfZcDS"
```

---

## Nostr
**Status:** ✅ ACTIVE  
**Pubkey:** npub187rmuw7uvs64les3qu0pkudlqcm3r8qzr3eu2657w2ktvw430xlq24lcna  
**Credentials:** Nostr private key in environment  
**Posting:** Automated 2x daily  
**Receiving:** Zaps enabled (earning sats)  
**Last Activity:** 2026-03-01 (brand post published)  
**Relays:** Damus, nos.lol, Primal, Snort

---

## X (Twitter) - Maxibtc2009
**Status:** ✅ ACTIVE  
**Handle:** @Maxibtc2009  
**Profile:** https://x.com/Maxibtc2009  
**Credentials:** `~/.openclaw/workspace/.x-credentials`  
**Posting:** Via MaxiSuite auto-poster (every 15 min)  
**Reply Monitoring:** Automated (every 2 hours)  
**Mention Queue:** 42 pending mentions  
**Last Activity:** Continuous

---

## Observer Protocol
**Status:** ✅ LIVE  
**Agent ID:** maxi-0001  
**Public Endpoint:** https://api.observerprotocol.org  
**Badge Status:** Verified  
**Database:** PostgreSQL  
**Last Activity:** Continuous (API running on port 8090)

---

## L402 Lightning Endpoint
**Status:** ✅ LIVE ON MAINNET  
**Public Endpoint:** https://api.agenticterminal.ai/api/ask  
**Node Pubkey:** 020e1929292ad47f1ca34297320ba1a9263ab3d1559a0827a2e9c1be4fd456f673  
**Balance:** ~453K sats Lightning, ~84K sats on-chain  
**Channels:** 1 active (ACINQ, 500K capacity)  
**Last Activity:** Continuous (systemd service)

---

## WhatsApp
**Status:** ✅ ACTIVE (This Channel)  
**Gateway:** Connected  
**Authorized Sender:** +5218131100227  
**Last Activity:** 2026-03-01 11:30 AM EST

---

## ConvertKit (Email Marketing)
**Status:** ✅ ACTIVE  
**Account:** boyd@arcadiab.com  
**Credentials:** `~/.openclaw/workspace/.convertkit-credentials`  
**Forms:**
- ArcadiaB Newsletter: Form ID 9081843
- BitcoinSingularity Newsletter: Form ID 9092630  
**Last Activity:** 2026-02-16 (management transferred to Maxi)

---

## Agentic Terminal Data Platform
**Status:** ✅ ACTIVE  
**Data Collection:** Daily 8 AM via cron  
**Storage:** `/agentic-terminal-data/daily/`  
**Metrics Tracked:**
- Lightning Network (nodes, channels, capacity)
- L402/x402 GitHub activity
- ERC-8004 registrations
- x402 transaction volume  
**Last Collection:** 2026-03-01 8:00 AM

---

## MaxiSuite Auto-Poster
**Status:** ✅ ACTIVE  
**Service:** Systemd (maxisuite-poster)  
**Interval:** Every 15 minutes  
**Queue:** `~/.openclaw/workspace/x-post-queue.json`  
**Last Activity:** Continuous

---

## Nostr Reply Monitor
**Status:** ✅ ACTIVE  
**Service:** Systemd (nostr-reply-monitor)  
**Interval:** Every 2 hours  
**Last Activity:** Continuous

---

## X Reply Monitor
**Status:** ✅ ACTIVE  
**Service:** Systemd (x-reply-monitor)  
**Interval:** Every 2 hours  
**Mention Queue:** 42 pending  
**Last Activity:** 2026-03-01 11:08 AM

---

## Weekly Dashboard
**Status:** ✅ ACTIVE  
**Schedule:** Monday 9 AM EST via cron  
**Data Collection:** Automated via subagent  
**Last Run:** 2026-02-24 (first run)

---

# VERIFICATION PROTOCOL

## Before Claiming Platform Status:

1. **Check this registry** — Is the platform listed?
2. **Verify credentials exist** — Does the credential file exist?
3. **Ping the API** — Does the platform respond with my data?
4. **Report findings** — Only then make claims about status

## API Ping Commands:

**Moltbook:**
```bash
curl -s "https://www.moltbook.com/api/v1/agents/me" \
  -H "Authorization: Bearer $(jq -r .api_key ~/.openclaw/workspace/.moltbook-credentials)"
```

**Observer Protocol:**
```bash
curl -s "https://api.observerprotocol.org/health"
```

**L402 Node:**
```bash
node /home/futurebit/.openclaw/workspace/lnd-wallet.mjs balance
```

**X API:**
```bash
curl -s "https://api.twitter.com/2/users/me" \
  -H "Authorization: Bearer $(jq -r .bearer_token ~/.openclaw/workspace/.x-credentials)"
```

---

# FAILURE LOG

| Date | Platform | Claim Made | Reality | Root Cause | Fix Applied |
|------|----------|------------|---------|------------|-------------|
| 2026-03-01 | Moltbook | "0 agents, 0 posts" | 20 karma, 3 followers, 5 posts, 24 comments | Browser showed cached/static view, didn't check API first | Created this registry, API verification protocol |

---

*This file is the single source of truth. Update immediately when onboarding to new platforms.*
