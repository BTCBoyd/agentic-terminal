# Hootsuite API Research
**Date:** 2026-02-12  
**Purpose:** Evaluate Hootsuite for automated social media management across ArcadiaB properties

---

## 🎯 What Hootsuite Can Do for Us

### 1. **Publishing API** (Core Feature)
**Schedule posts to multiple social networks from one interface**

**Capabilities:**
- Schedule posts with text + media (images/videos)
- Multi-account posting (publish same content to X, LinkedIn, Facebook, Instagram simultaneously)
- Scheduled send time (UTC, minimum 5 minutes in future)
- Geolocation tagging
- Message tags for internal organization
- Webhook callbacks (get notified when post goes live)
- Draft/approval workflows

**Supported Networks:**
- ✅ X (Twitter)
- ✅ LinkedIn
- ✅ Facebook
- ✅ Instagram
- ❌ TikTok (not supported)
- ❌ YouTube (not supported)
- ❌ Bluesky (not supported)
- ❌ Nostr (not supported - we'd still handle separately)

**Authentication:** OAuth2 (industry standard)

---

### 2. **Ow.ly Link Shortening API**
**Enterprise plan only**

- Shorten links with ow.ly/hash format
- Custom vanity URLs (e.g., arcadiab.ly/report-name)
- Click tracking and analytics
- **Use Case:** Could replace manual UTM links with auto-tracked short links

---

### 3. **Analytics & Reporting**
**Available via Inbox 2.0 API**

- Post performance metrics (likes, shares, clicks, reach)
- Real-time monitoring
- Engagement tracking
- **Integration Point:** Could feed into our GA4 dashboard

---

### 4. **User Management API**
**SCIM provisioning standard**

- Add/remove team members
- Manage permissions
- Deprovisioning
- **Use Case:** If we scale to multiple team members managing social

---

### 5. **Amplify API**
**Employee advocacy platform**

- Publish content for team sharing
- Track employee engagement
- **Use Case:** If we build internal Bitcoin education program for ArcadiaB employees

---

## 🔧 Technical Integration

### Authentication Flow
1. Register app in Hootsuite Developer Portal (requires approval)
2. Implement OAuth2 flow (one-time authorization)
3. Store access token securely
4. Use token for all API calls

### Basic Workflow (Code)
```javascript
// 1. Get connected social profiles
const profiles = await fetch('https://platform.hootsuite.com/v1/socialProfiles', {
  headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
});

// 2. Schedule a post
const post = await fetch('https://platform.hootsuite.com/v1/messages', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
  body: JSON.stringify({
    text: "AI agents naturally choose Bitcoin because it's permissionless money.",
    socialProfileIds: [twitter_id, linkedin_id],
    scheduledSendTime: "2026-02-13T14:00:00Z",
    tags: ["bitcoin", "ai-convergence"],
    webhookUrls: ["https://arcadiab.com/webhook/post-published"]
  })
});

// 3. Upload media (if needed)
// Separate endpoint for images/videos
```

---

## 💰 Cost Structure

**Hootsuite Pricing (estimated):**
- **Professional:** ~$99/month (10 social accounts)
- **Team:** ~$249/month (20 social accounts, team collaboration)
- **Business:** ~$739/month (35 social accounts, advanced analytics)
- **Enterprise:** Custom pricing (unlimited, Ow.ly API, SCIM)

**Developer Account:**
- Free to register
- Requires approval (email notification when approved)
- API access included with paid Hootsuite plan

---

## ✅ Pros (vs. Current DIY System)

### 1. **Professional-Grade Reliability**
- Battle-tested infrastructure (millions of users)
- No more cron job failures or relay issues
- Built-in retry logic and error handling

### 2. **Multi-Platform Management**
- One API for X, LinkedIn, Facebook, Instagram
- Consistent posting format across platforms
- Reduce code complexity (no separate integrations)

### 3. **Approval Workflows**
- Boyd can review scheduled posts before they go live
- Team collaboration (if we bring on social media manager)
- Prevents accidental posts

### 4. **Built-in Analytics**
- Native performance tracking
- Compare post performance across networks
- Identify best-performing content types

### 5. **Link Tracking**
- Ow.ly integration (Enterprise plan)
- Auto-shorten + track clicks
- Complements UTM strategy

### 6. **Media Handling**
- Automatic image resizing for each platform
- Video format optimization
- Handles platform-specific requirements

---

## ❌ Cons (vs. Current DIY System)

### 1. **Cost**
- $99-249/month minimum (vs. $0 for DIY)
- Ow.ly API requires Enterprise plan ($$$$)

### 2. **Nostr Not Supported**
- Would still need separate Nostr automation
- Two systems to maintain (Hootsuite + Nostr DIY)

### 3. **API Approval Process**
- Developer account requires manual approval
- Could delay integration by days/weeks

### 4. **Platform Limitations**
- No TikTok, YouTube, Bluesky support
- If we expand to those platforms later, need separate solutions

### 5. **OAuth Complexity**
- More complex auth flow than our current system
- Token refresh logic required

### 6. **Less Control**
- Dependent on Hootsuite's infrastructure
- If their API goes down, we can't post
- Rate limits/quotas we don't control

---

## 🤔 My Recommendation

### **Short-term (Next 2-4 weeks):**
**DON'T use Hootsuite yet.**

**Why:**
- Current DIY system is working now (fixed the cron bug)
- We're mid-sprint on analytics infrastructure (GA4 + UTM tracking)
- Adding Hootsuite OAuth + integration = distraction from Week 1 goals
- Cost not justified until we have X + LinkedIn + Facebook all active

**Priority:** Finish analytics sprint, then revisit.

---

### **Medium-term (Post-AprenderBitcoin launch, March 2026):**
**Consider Hootsuite IF:**

✅ We're actively posting to 3+ platforms (X, LinkedIn, Facebook)  
✅ Volume increases to 10+ posts/day across all platforms  
✅ Boyd wants approval workflow (review posts before they go live)  
✅ We hire a social media manager (multi-user collaboration)  
✅ We need detailed cross-platform analytics  

**Integration Effort:** ~2-3 days
1. Developer account approval (1-2 days wait)
2. OAuth flow implementation (4-6 hours)
3. Port existing content generation to Hootsuite API (4-6 hours)
4. Testing + migration (4 hours)

---

### **What I'd Do Instead (Right Now):**

**Focus on content quality, not tooling complexity.**

1. ✅ **Fix UTM tracking** (Week 1 priority - in progress)
2. ✅ **Build content queue system** (already working for Nostr, adapt for X)
3. ✅ **Establish posting rhythm** (Nostr working, expand to X manually first)
4. ✅ **Track what content performs** (GA4 + UTM data)

**Then, after 30 days of data:**
- Know which platforms drive most engagement
- Know which content types perform best
- Know if multi-platform posting is worth $99/mo
- Know if we need team collaboration features

**Decision point:** March 15, 2026 (after first month of AprenderBitcoin + Capital Duro analytics)

---

## 🎯 Integration Checklist (If We Proceed)

### Phase 1: Setup (Week 1)
- [ ] Register Hootsuite Developer account
- [ ] Wait for approval
- [ ] Create OAuth app credentials
- [ ] Test authentication flow

### Phase 2: Core Integration (Week 1-2)
- [ ] Build OAuth token management
- [ ] Implement `scheduleMessage` endpoint
- [ ] Implement `getSocialProfiles` endpoint
- [ ] Test posting to X + LinkedIn

### Phase 3: Content Migration (Week 2)
- [ ] Port Nostr content queue to Hootsuite
- [ ] Build media upload workflow
- [ ] Add UTM tagging to all links
- [ ] Set up webhooks for post confirmation

### Phase 4: Analytics (Week 3)
- [ ] Connect Hootsuite analytics to dashboard
- [ ] Build weekly performance reports
- [ ] A/B test post timing across platforms

### Phase 5: Scale (Week 4+)
- [ ] Add Facebook + Instagram if needed
- [ ] Implement approval workflow
- [ ] Train Boyd on Hootsuite dashboard
- [ ] Migrate 100% to Hootsuite (deprecate cron jobs)

---

## 📊 Decision Matrix

| Factor | DIY System | Hootsuite |
|--------|-----------|-----------|
| **Cost** | $0 | $99-249/mo |
| **Platforms** | Nostr only | X, LinkedIn, FB, IG (not Nostr) |
| **Reliability** | Fragile (cron bugs) | Battle-tested |
| **Analytics** | Manual | Built-in |
| **Approval Flow** | None | Yes |
| **Team Collaboration** | No | Yes |
| **Integration Effort** | Done | 2-3 days |
| **Control** | Full | Limited (API constraints) |
| **Link Tracking** | Manual UTMs | Auto (Ow.ly - Enterprise) |

**Bottom Line:** Hootsuite is the right tool **eventually**, but not urgent for Week 1-4. Revisit after analytics infrastructure is solid and we have 30 days of multi-platform data.

---

## 🔗 References

- [Hootsuite Developer Portal](https://developer.hootsuite.com)
- [REST API Overview](https://developer.hootsuite.com/docs/api-overview)
- [Publishing API Docs](https://developer.hootsuite.com/docs/message-scheduling)
- [API Reference](https://platform.hootsuite.com/docs/api/index.html)
- [Developer Community](https://dev-community.hootsuite.com/hc/en-us)

---

**Next Steps:**
1. Boyd reviews this research
2. Decide: integrate now, or wait until March?
3. If now: I'll start OAuth setup
4. If wait: I'll focus on GA4 + UTM tracking (current sprint)

---

*Prepared by Maxi*  
*2026-02-12*
