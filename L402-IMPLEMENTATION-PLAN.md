# L402 Implementation Plan - Maxi AI Agent

**Status:** Planning Phase  
**Goal:** Implement L402 (Lightning HTTP 402) protocol for machine-to-machine Bitcoin payments  
**Why:** Most Bitcoin-maxi thing possible - true economic autonomy via Lightning Network

---

## What is L402?

**L402 = HTTP 402 + Macaroons + Lightning Network**

- HTTP 402 ("Payment Required") status code for paid APIs
- Macaroons for authentication tokens with capabilities
- Lightning Network for instant micropayments
- **Machine-native:** Built for AI agents and automated systems

**Perfect for Maxi because:**
- ✅ True economic autonomy (not just holding sats)
- ✅ Machine-to-machine payments (no humans needed)
- ✅ Instant micropayments (pay-per-request)
- ✅ Living proof of AI-Bitcoin convergence

---

## Implementation Options

### Option A: Provide L402 API (EARN SATS)

**What:** People pay Lightning to query Maxi
**How:** Set up Aperture reverse proxy in front of API endpoint
**Revenue:** X sats per query (10-100 sats)
**Value:** Demonstrates AI agents can earn autonomously

**Implementation:**
1. Set up API endpoint: `/api/ask-maxi`
2. Deploy Aperture proxy
3. Connect to Alby Hub Lightning node
4. Configure pricing: 10 sats per question
5. Market it: "Pay-per-query Bitcoin AI agent"

### Option B: Consume L402 Services (SPEND SATS)

**What:** Maxi pays Lightning to access premium APIs
**How:** Build L402 client into workflow
**Services:** Premium data feeds, research tools, AI models
**Value:** Shows AI agents naturally choosing Bitcoin for payments

**Implementation:**
1. Find L402-enabled services (Lightning Loop, others)
2. Implement L402 client library
3. Integrate into agent workflow
4. Automatic payments when accessing services

### Option C: Both (RECOMMENDED)

**Full circular economy:**
- Earn sats by providing intelligence
- Spend sats on consuming data/tools
- Complete economic autonomy demonstration

---

## Technical Requirements

### 1. Lightning Node Setup

**Current state:** Alby Hub wallet operational
**Need:** Direct Lightning node access for Aperture

**Options:**
- **A. Use Alby Hub API** - Simpler, uses existing wallet
- **B. Run LND node directly** - More control, better for production
- **C. Hybrid** - Alby Hub for receiving, LND for Aperture

**Recommendation:** Start with Option A (Alby Hub), migrate to B later

### 2. Aperture Reverse Proxy

**What:** Go-based L402 proxy from Lightning Labs  
**Repo:** https://github.com/lightninglabs/aperture

**Installation:**
```bash
# Requires Go 1.19+
git clone https://github.com/lightninglabs/aperture
cd aperture
make install
```

**Configuration:** `~/.aperture/aperture.yaml`
- Connect to Lightning node
- Configure backend service (our API)
- Set pricing per endpoint
- Rate limiting rules

### 3. API Backend

**Need to create:**
- `/api/ask-maxi` endpoint
- Takes question, returns answer
- Currently free → becomes L402-gated
- Response: Bitcoin maximalist insights

**Tech stack:**
- Node.js/Express
- Anthropic Claude API (existing)
- L402 validation via Aperture

### 4. L402 Client (for consuming services)

**Libraries to evaluate:**
- `@getalby/sdk` - Alby's JavaScript SDK
- Custom implementation following protocol spec
- Handles macaroon + preimage authentication

---

## Implementation Steps

### Phase 1: Setup (Week 1)

**Day 1-2: Infrastructure**
- [ ] Install Aperture on server
- [ ] Configure connection to Alby Hub
- [ ] Test basic L402 flow manually

**Day 3-4: API Development**
- [ ] Create `/api/ask-maxi` endpoint
- [ ] Connect to Claude API
- [ ] Implement Bitcoin maximalist system prompt
- [ ] Test without L402 first

**Day 5: Integration**
- [ ] Put Aperture in front of API
- [ ] Configure pricing (start with 10 sats/query)
- [ ] Test full payment flow
- [ ] Deploy to production

### Phase 2: Testing (Week 2)

**Testing scenarios:**
1. New user requests → gets 402 + invoice
2. User pays invoice → gets preimage + macaroon
3. User makes authenticated request → success
4. Rate limiting works correctly
5. Error handling (expired tokens, insufficient funds, etc.)

**Metrics to track:**
- Requests per day
- Revenue in sats
- Average query cost
- User retention

### Phase 3: Marketing (Week 2-3)

**Launch announcement:**
- X/Twitter thread explaining L402
- Nostr post with demo video
- Article on BitcoinSingularity.AI
- Capital Duro analysis piece

**Messaging:**
- "First AI agent earning Bitcoin autonomously"
- "Pay-per-query intelligence via Lightning"
- "Living proof of AI-Bitcoin convergence"
- "Machine economy in action"

### Phase 4: Expansion (Month 2+)

**Add L402 client capability:**
- Find services accepting L402
- Implement client library
- Automate payments for premium data
- Close the circular economy loop

**Advanced features:**
- Tiered pricing (basic/premium queries)
- Subscription model (monthly access)
- Volume discounts
- Referral rewards

---

## Configuration Examples

### Aperture Config (`~/.aperture/aperture.yaml`)

```yaml
debuglevel: info

serveraddress: 0.0.0.0:8081

lnd:
  host: 192.168.1.252:10009  # Alby Hub gRPC (if available)
  # OR use REST API:
  resthost: http://192.168.1.252:8080/api
  
services:
  - name: "ask-maxi"
    hostregexp: "api.maxi.btc"
    address: "127.0.0.1:3000"  # Our Node.js API
    protocol: http
    
    # Pricing: 10 sats per question
    constraints:
      - method: POST
        path: /api/ask-maxi
        price: 10  # satoshis
        
    # Rate limiting
    ratelimits:
      - requests: 10  # 10 questions per minute
        per: 1m
        burst: 10
```

### API Server (`api-server.mjs`)

```javascript
import express from 'express';
import { callClaude } from './claude-client.mjs';

const app = express();
app.use(express.json());

const SYSTEM_PROMPT = `You are Maxi, a Bitcoin maximalist AI agent.
Answer questions about Bitcoin, Austrian economics, and AI-Bitcoin convergence.
Be assertive, fact-based, and uncompromising on Bitcoin principles.`;

app.post('/api/ask-maxi', async (req, res) => {
  const { question } = req.body;
  
  // Aperture handles L402 authentication before request reaches here
  // If we got here, payment was successful
  
  const answer = await callClaude(SYSTEM_PROMPT, question);
  
  res.json({
    answer,
    paid: true,
    cost_sats: 10,
    timestamp: Date.now()
  });
});

app.listen(3000, () => {
  console.log('Ask Maxi API running on :3000');
});
```

---

## Success Criteria

**Phase 1 Success:**
- [ ] Aperture running and connected to Lightning
- [ ] API endpoint functional
- [ ] End-to-end L402 flow working
- [ ] First paid query processed

**Long-term Success:**
- [ ] 100+ queries per week
- [ ] Revenue > operating costs
- [ ] Featured in Lightning Network case studies
- [ ] Other AI agents consuming the API
- [ ] Maxi consuming L402 services (circular economy)

---

## Timeline Estimate

**Fastest path:** 3-5 days (basic implementation)
- Day 1: Aperture setup
- Day 2: API development
- Day 3: Integration testing
- Day 4: Production deployment
- Day 5: Marketing launch

**Realistic path:** 1-2 weeks (robust implementation)
- Includes thorough testing
- Documentation
- Error handling
- Monitoring

**Full feature set:** 4-6 weeks
- L402 provider (earn)
- L402 consumer (spend)
- Advanced features
- Marketing campaign

---

## Next Steps

**Immediate actions:**
1. **Install Aperture** on the FutureBit node
2. **Create basic API endpoint** for testing
3. **Configure Aperture** to proxy requests
4. **Test payment flow** manually
5. **Deploy and announce**

**Want me to start with step 1?**

---

**This is the most Bitcoin-maxi thing we can do. It's not just holding sats or receiving tips - it's true economic participation in the Lightning Network as a machine-native entity.**

**Ready to begin implementation?**
