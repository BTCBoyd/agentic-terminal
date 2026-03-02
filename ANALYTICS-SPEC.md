# Content Analytics & UTM Tracking — Spec

*Created: 2026-02-19 | Boyd explicitly requested this*

## Why This Exists

We're posting content without knowing what works. This spec defines how to build a feedback loop:
- Which content resonates (English vs Spanish, platform, content type)
- Which posts drive actual clicks to capitalduro.mx, aprenderbitcoin.mx, arcadiab.com
- What to make MORE of vs what to drop

## Phase 1 — UTM Parameters (Build ASAP)

### URL Format
All links in queue posts must use UTM parameters:
```
https://capitalduro.mx?utm_source=x&utm_medium=social&utm_campaign=capitalduro&utm_content=marco-estrategico
https://arcadiab.com?utm_source=facebook&utm_medium=social&utm_campaign=arcadiab&utm_content=b2x-loans
```

### UTM Schema
- **utm_source:** x | facebook | linkedin | nostr
- **utm_medium:** social (always)
- **utm_campaign:** capitalduro | aprenderbitcoin | arcadiab | agenticterminal | maxi
- **utm_content:** brief post identifier (e.g., report-marco-estrategico, cap01-dinero, b2x-loans)

### Implementation
- Add UTM to all NEW posts generated for queue
- Retrofit existing scheduled posts (patch queue file)
- GA4 must be installed on: capitalduro.mx, aprenderbitcoin.mx, arcadiab.com (confirm with Boyd)

## Phase 2 — X Engagement Tracking

### What to Track (per post, 24-48hrs after publish)
- Impressions
- Likes
- Replies
- Reposts
- Profile clicks
- Link clicks (if X premium tracking available)

### Implementation
- Script: `x-analytics-pull.mjs` (to build)
- Run: daily cron at 10 AM pulling metrics for posts published 24-48hrs prior
- Store: `analytics/x-performance-log.json` with post metadata + metrics

### Post Metadata to Log
```json
{
  "postId": "x_12345",
  "account": "@Maxibtc2009",
  "language": "english",
  "contentType": "thought-leadership",
  "topic": "L402",
  "publishedAt": "2026-02-20T15:00:00Z",
  "url": "https://capitalduro.mx?utm_...",
  "metrics": {
    "impressions": 0,
    "likes": 0,
    "replies": 0,
    "reposts": 0
  }
}
```

## Phase 3 — Weekly Performance Report

### Format (every Monday, included in data collection session)
```
CONTENT PERFORMANCE WEEK OF [DATE]

TOP 3 POSTS BY ENGAGEMENT:
1. [post snippet] — [likes/reposts/impressions]
2. ...
3. ...

BY LANGUAGE: English avg [X] engagements | Spanish avg [X]
BY PLATFORM: X avg [X] | Facebook avg [X] | LinkedIn avg [X]
BY CONTENT TYPE: Thought leadership [X] | Market commentary [X] | Promotion [X]

REFERRAL CLICKS (from GA4):
- capitalduro.mx: [N] clicks (top source: [platform])
- arcadiab.com: [N] clicks (top source: [platform])
- aprenderbitcoin.mx: [N] clicks (top source: [platform])

RECOMMENDATION: Make more [X type] content on [X platform] in [X language]
```

## Questions for Boyd
1. Is GA4 installed on capitalduro.mx, aprenderbitcoin.mx, arcadiab.com?
2. Do you want LinkedIn and Facebook queue/analytics too, or start with X only?
3. Any specific referral tracking codes already in use?

## Files to Build
- [ ] `x-analytics-pull.mjs` — X API engagement fetcher
- [ ] `analytics/x-performance-log.json` — data store
- [ ] `generate-weekly-report.mjs` — report generator
- [ ] UTM retrofit script for existing queue entries
