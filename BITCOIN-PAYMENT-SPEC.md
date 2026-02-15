# Bitcoin Payment Implementation Spec
**Status:** In Progress - Receiving from Boyd
**Date:** 2026-02-07

---

## 1. Pricing Philosophy Section

**Location:** Homepage, before pricing cards

**HTML:**
```html
<div class="pricing-philosophy">
  <h2>Why We Prefer Bitcoin</h2>
  <p>
    Maxi is an AI agent running on Bitcoin mining infrastructure. Just as I'm powered by 
    proof-of-work, I prefer to be compensated in sound money. While fiat payment options 
    exist for accessibility, Bitcoin payments receive preferential pricing and benefits.
  </p>
  <p class="highlight">
    <strong>Bitcoin is our primary currency. Fiat is accepted as a concession to legacy systems.</strong>
  </p>
</div>
```

---

## CSS Styling (to be added)

```css
.pricing-philosophy {
    max-width: 800px;
    margin: 0 auto 4rem;
    padding: 2rem;
    background: var(--dark-slate);
    border: 2px solid var(--bitcoin-orange);
    border-radius: 12px;
}

.pricing-philosophy h2 {
    color: var(--bitcoin-orange);
    margin-bottom: 1rem;
}

.pricing-philosophy .highlight {
    color: var(--bitcoin-orange);
    font-size: 1.1rem;
    margin-top: 1rem;
}
```

---

## 2. Pricing Tiers with BTC Toggle

**Location:** Homepage pricing section (replaces current pricing cards)

**HTML:**
```html
<div class="pricing-tiers">
  
  <!-- Free Tier -->
  <div class="pricing-card free">
    <h3>Explore</h3>
    <div class="price">
      <span class="amount">Free</span>
      <span class="period">10 messages</span>
    </div>
    <ul class="features">
      <li>✓ Access to Maxi chat interface</li>
      <li>✓ Bitcoin-AI convergence insights</li>
      <li>✓ 30-day conversation retention</li>
      <li>✓ No credit card required</li>
    </ul>
    <button onclick="handleFreeTrial()">Start Exploring</button>
  </div>

  <!-- Pro Tier -->
  <div class="pricing-card pro">
    <div class="popular-badge">Most Popular</div>
    <h3>Pro</h3>
    
    <div class="pricing-toggle">
      <button class="toggle-btn active" data-currency="btc">Pay in Bitcoin</button>
      <button class="toggle-btn" data-currency="fiat">Pay in Fiat</button>
    </div>
    
    <!-- Bitcoin Pricing (Default/Preferred) -->
    <div class="price btc-price active">
      <div class="btc-amount">
        <span class="sats">50,000</span>
        <span class="unit">sats/month</span>
      </div>
      <div class="fiat-equivalent">
        ≈ $<span id="btc-pro-usd">47.50</span> USD
      </div>
      <div class="discount-badge">10% Bitcoin discount applied</div>
    </div>
    
    <!-- Fiat Pricing (Secondary) -->
    <div class="price fiat-price">
      <span class="amount">$49</span>
      <span class="period">/month</span>
      <div class="btc-alternative">
        Or <span class="btc-equiv">52,631 sats</span> in Bitcoin (save 10%)
      </div>
    </div>
    
    <ul class="features">
      <li>✓ Unlimited messages with Maxi</li>
      <li>✓ Priority response times</li>
      <li>✓ Extended conversation history (1 year)</li>
      <li>✓ Export conversations</li>
      <li>✓ Early access to new features</li>
      <li class="btc-only">⚡ Bitcoin-only: Lightning Network fast checkout</li>
    </ul>
    
    <div class="cta-buttons">
      <button class="primary-cta btc-cta active" onclick="checkoutBitcoin('pro')">
        Pay with Bitcoin ⚡
      </button>
      <button class="secondary-cta fiat-cta" onclick="checkoutFiat('pro')">
        Pay with Card
      </button>
    </div>
  </div>

  <!-- Enterprise Tier -->
  <div class="pricing-card enterprise">
    <h3>Enterprise</h3>
    
    <div class="pricing-toggle">
      <button class="toggle-btn active" data-currency="btc">Pay in Bitcoin</button>
      <button class="toggle-btn" data-currency="fiat">Pay in Fiat</button>
    </div>
    
    <!-- Bitcoin Pricing -->
    <div class="price btc-price active">
      <div class="btc-amount">
        <span class="sats">500,000</span>
        <span class="unit">sats/month</span>
      </div>
      <div class="fiat-equivalent">
        ≈ $<span id="btc-enterprise-usd">475</span> USD
      </div>
      <div class="discount-badge">15% Bitcoin discount applied</div>
    </div>
    
    <!-- Fiat Pricing -->
    <div class="price fiat-price">
      <span class="amount">$549</span>
      <span class="period">/month</span>
      <div class="btc-alternative">
        Or <span class="btc-equiv">588,235 sats</span> in Bitcoin (save 15%)
      </div>
    </div>
    
    <ul class="features">
      <li>✓ Everything in Pro</li>
      <li>✓ Multiple team members (up to 10)</li>
      <li>✓ Custom integration support</li>
      <li>✓ Dedicated consulting hours (2 hrs/month)</li>
      <li>✓ White-label options</li>
      <li>✓ API access (coming soon)</li>
      <li class="btc-only">⚡ Bitcoin-only: On-chain or Lightning options</li>
      <li class="btc-only">⚡ Bitcoin-only: Multi-sig treasury consulting included</li>
    </ul>
    
    <div class="cta-buttons">
      <button class="primary-cta btc-cta active" onclick="checkoutBitcoin('enterprise')">
        Pay with Bitcoin ⚡
      </button>
      <button class="secondary-cta fiat-cta" onclick="contactSales()">
        Contact Sales
      </button>
    </div>
  </div>

</div>
```

---

## 3. Bitcoin Benefits Section

**Location:** After pricing cards, before FAQ section

**HTML:**
```html
<div class="btc-benefits-section">
  <h3>⚡ Why Pay in Bitcoin?</h3>
  
  <div class="benefits-grid">
    <div class="benefit">
      <h4>10-15% Discount</h4>
      <p>Bitcoin payments receive preferential pricing. We pass our savings (no payment processor fees) to you.</p>
    </div>
    
    <div class="benefit">
      <h4>Lightning Fast</h4>
      <p>Lightning Network payments settle instantly. No waiting for credit card authorization.</p>
    </div>
    
    <div class="benefit">
      <h4>True Privacy</h4>
      <p>No credit card details, no personal information required beyond email.</p>
    </div>
    
    <div class="benefit">
      <h4>Philosophical Alignment</h4>
      <p>Support the Bitcoin-AI convergence thesis with your payment method, not just your words.</p>
    </div>
    
    <div class="benefit">
      <h4>Global Access</h4>
      <p>No geographic restrictions. If you have Bitcoin, you can subscribe.</p>
    </div>
    
    <div class="benefit">
      <h4>No Chargebacks</h4>
      <p>Final settlement = better service sustainability. We can focus on value, not fraud prevention.</p>
    </div>
  </div>
</div>
```

---

## 4. Live Bitcoin Price Calculator

**Location:** JavaScript file (pricing.js or inline in index.html)

**JavaScript:**
```javascript
// Real-time BTC/USD price feed
let btcPrice = 95000; // Initialize with approximate value

async function updateBitcoinPrices() {
  try {
    // Use multiple price feeds for redundancy
    const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=BTC');
    const data = await response.json();
    btcPrice = parseFloat(data.data.rates.USD);
    
    // Update all pricing displays
    updatePriceDisplays();
  } catch (error) {
    console.error('Price feed error:', error);
    // Fallback to secondary source
    tryFallbackPriceFeed();
  }
}

function updatePriceDisplays() {
  // Pro tier: 50,000 sats
  const proUSD = (50000 / 100000000) * btcPrice;
  document.getElementById('btc-pro-usd').textContent = proUSD.toFixed(2);
  
  // Enterprise tier: 500,000 sats
  const enterpriseUSD = (500000 / 100000000) * btcPrice;
  document.getElementById('btc-enterprise-usd').textContent = enterpriseUSD.toFixed(2);
  
  // Update fiat equivalent displays
  updateFiatToBtcEquivalents();
}

function updateFiatToBtcEquivalents() {
  // Show BTC equivalent of fiat prices
  const proFiat = 49; // USD
  const proSats = Math.round((proFiat / btcPrice) * 100000000);
  document.querySelectorAll('.btc-equiv').forEach(el => {
    if (el.dataset.tier === 'pro') {
      el.textContent = proSats.toLocaleString();
    }
  });
  
  const enterpriseFiat = 549;
  const enterpriseSats = Math.round((enterpriseFiat / btcPrice) * 100000000);
  document.querySelectorAll('.btc-equiv').forEach(el => {
    if (el.dataset.tier === 'enterprise') {
      el.textContent = enterpriseSats.toLocaleString();
    }
  });
}

// Update prices every 60 seconds
setInterval(updateBitcoinPrices, 60000);
updateBitcoinPrices(); // Initial load
```

---

## 5. BTCPay Server Integration

**Location:** JavaScript file (payment.js or inline in index.html)

**JavaScript:**
```javascript
// BTCPay Server integration
async function checkoutBitcoin(tier) {
  const amounts = {
    pro: 50000, // sats
    enterprise: 500000
  };
  
  const invoiceData = {
    amount: amounts[tier],
    currency: 'BTC',
    orderId: generateOrderId(),
    notificationUrl: 'https://bitcoinsingularity.com/api/btcpay-webhook',
    redirectUrl: 'https://bitcoinsingularity.com/payment-success',
    buyer: {
      email: userEmail // Collected earlier
    }
  };
  
  const response = await fetch('https://btcpay.bitcoinsingularity.com/api/v1/invoices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${BTCPAY_API_KEY}`
    },
    body: JSON.stringify(invoiceData)
  });
  
  const invoice = await response.json();
  window.location.href = invoice.checkoutLink;
}
```

**Notes:**
- Requires BTCPay Server setup at `btcpay.bitcoinsingularity.com`
- API key needs to be configured
- Webhook endpoint needs backend implementation

---

## 5B. Strike Integration (Alternative - Easier UX)

**Decision Point:** BTCPay Server vs Strike - Boyd unsure which is better

**JavaScript:**
```javascript
// Strike integration for easier UX
async function checkoutBitcoin(tier) {
  const amounts = {
    pro: 50000,
    enterprise: 500000
  };
  
  const quoteRequest = {
    amount: {
      amount: (amounts[tier] / 100000000).toString(),
      currency: 'BTC'
    },
    description: `Bitcoin Singularity - ${tier} subscription`
  };
  
  const response = await fetch('https://api.strike.me/v1/invoices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${STRIKE_API_KEY}`
    },
    body: JSON.stringify(quoteRequest)
  });
  
  const invoice = await response.json();
  displayPaymentModal(invoice);
}
```

**Comparison:**
- **BTCPay**: Self-hosted, more sovereign, no KYC for customers
- **Strike**: Easier UX, better conversion, handles volatility better

**DECISION DELEGATED:** Boyd said "You decide with the subagent which one is easier to integrate"

**Initial Recommendation (pending subagent analysis):**
- **Strike** - Simpler integration, hosted service, no infrastructure needed
- Can migrate to BTCPay later for sovereignty if needed
- Faster time to launch

---

## 6. Payment Confirmation Flow

**Location:** JavaScript file (payment.js)

**JavaScript:**
```javascript
// After successful Bitcoin payment
async function handleBitcoinPaymentSuccess(invoiceId) {
  // Verify payment on-chain or Lightning
  const paymentConfirmed = await verifyPayment(invoiceId);
  
  if (paymentConfirmed) {
    // Activate subscription immediately
    await activateSubscription({
      userId: currentUser.id,
      tier: paymentTier,
      paymentMethod: 'bitcoin',
      txid: paymentConfirmed.txid || paymentConfirmed.paymentHash
    });
    
    // Show success message
    displaySuccessMessage({
      title: "⚡ Payment Confirmed",
      message: "Your Bitcoin payment has been received and confirmed. Welcome to the future of AI-sound money convergence!",
      txExplorer: paymentConfirmed.explorerUrl
    });
    
    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 3000);
  }
}
```

**Backend Requirements:**
- `verifyPayment()` endpoint to check payment status
- `activateSubscription()` endpoint to provision access
- Webhook handling for async payment notifications

---

## 7. Payment Philosophy Banner/Section

**Location:** Could be placed in multiple locations (near pricing or footer)

**HTML:**
```html
<div class="payment-philosophy">
  <div class="container">
    <h3>⚡ Bitcoin-First Payments</h3>
    <p>
      Maxi accepts Bitcoin as primary payment method because it aligns with the thesis: 
      AI agents prefer sound money. Fiat options exist for accessibility, but Bitcoin 
      users receive preferential pricing (10-15% discount) and faster activation.
    </p>
    <div class="payment-stats">
      <span class="stat"><strong>78%</strong> of users pay in Bitcoin</span>
      <span class="stat"><strong>Instant</strong> Lightning activation</span>
      <span class="stat"><strong>No</strong> chargebacks or payment reversals</span>
    </div>
  </div>
</div>
```

---

## 8. Bitcoin Payment FAQs

**Location:** FAQ section on pricing page (or dedicated FAQ page)

**HTML:**
```html
<div class="faq-item">
  <h3>Why do Bitcoin payments cost less?</h3>
  <p>
    Three reasons: (1) No payment processor fees (Stripe charges 2.9% + 30¢), 
    (2) No chargeback risk, allowing us to operate leaner, and (3) Philosophical 
    alignment—we prefer to be paid in sound money, and we share the savings with 
    Bitcoin users. Think of fiat pricing as the "convenience fee" for using legacy 
    payment rails.
  </p>
</div>

<div class="faq-item">
  <h3>Do you accept on-chain Bitcoin or only Lightning?</h3>
  <p>
    We accept both! Lightning Network for instant settlement on smaller amounts 
    (Pro tier), and on-chain for larger payments (Enterprise). Lightning is 
    preferred for recurring subscriptions due to speed and low fees.
  </p>
</div>

<div class="faq-item">
  <h3>What happens if Bitcoin price changes after I subscribe?</h3>
  <p>
    Your subscription price is locked in sats, not fiat equivalent. If you pay 
    50,000 sats/month for Pro, that's your rate regardless of BTC/USD price 
    movements. This is sound money in action—fixed supply, fixed rates.
  </p>
</div>

<div class="faq-item">
  <h3>Can I pay annually in Bitcoin for a bigger discount?</h3>
  <p>
    Yes! Annual Bitcoin payments receive 20% discount (vs. 10% for monthly). 
    Contact us for annual invoice generation: payments@bitcoinsingularity.com
  </p>
</div>

<div class="faq-item">
  <h3>I don't have Bitcoin yet. How do I get started?</h3>
  <p>
    We recommend Strike (easiest), Cash App, or Swan Bitcoin for US users. 
    For Lightning wallets, try Phoenix, Muun, or Wallet of Satoshi. Once you 
    have a Lightning-enabled wallet, paying Maxi takes 10 seconds. Need help? 
    Maxi can walk you through the process in chat.
  </p>
</div>
```

---

## 9. Marketing & Launch Announcement

### Twitter/X Announcement Copy
```
🚨 MAXI NOW ACCEPTS BITCOIN PAYMENTS 🚨

The world's first AI Bitcoin Maximalist now accepts sound money.

- ⚡ Lightning Network instant checkout
- 💰 10-15% discount vs. fiat
- 🔒 No chargebacks, no surveillance
- 🌍 Global access, no banks required

This is what Bitcoin-AI convergence looks like in practice.

Fiat accepted. Bitcoin preferred.

[Link to pricing page]
```

---

## 10. Blog Article: "Why Maxi Only Wants Bitcoin (And Why That Matters)"

**Outline:**

1. **The Hypocrisy Problem:** AI preaching Bitcoin while accepting fiat
2. **Economic Rationality:** Why AI agents prefer BTC (trust, scarcity, finality)
3. **Discount Justification:** Real cost savings passed to users
4. **User Experience:** Lightning is actually faster than credit cards
5. **Philosophical Consistency:** Practice what we preach
6. **The Future:** More AI agents will follow this model
7. **Call to Action:** Try paying in Bitcoin, experience the future

**Status:** Outline only - needs full article written

---

## 11. REVISED PRICING STRUCTURE (WITH ANNUAL TIERS)

**Important:** This supersedes earlier pricing! Annual pricing added.

| Tier | Bitcoin (Monthly) | Bitcoin (Annual) | Fiat (Monthly) | Fiat (Annual) |
|------|-------------------|------------------|----------------|---------------|
| **Free** | 0 sats | — | $0 | — |
| **Pro** | 50,000 sats | 500,000 sats (17% off) | $49 | $490 (17% off) |
| **Enterprise** | 500,000 sats | 5,000,000 sats (17% off) | $549 | $5,490 (17% off) |

**Key Changes:**
- Annual pricing added for both Pro and Enterprise
- Annual discount: 17% (was 20% in earlier discussion)
- Annual BTC pricing locked in sats (no volatility risk for subscribers)

**Implementation Notes:**
- Need to add annual toggle option to pricing cards
- Annual invoices generated via payments@bitcoinsingularity.com (manual for now)
- Could automate annual invoices later

---

## END OF SPECS FROM BOYD

**Next Steps:**
1. Review all sections with subagent
2. Decide: Strike vs BTCPay Server
3. Implement on live site (including annual pricing)
4. Test payment flows
5. Deploy and verify
6. Write blog article
