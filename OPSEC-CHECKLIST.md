# OPSEC CHECKLIST - MANDATORY BEFORE ANY PUBLIC DEPLOYMENT

**CRITICAL RULE:** Before deploying ANYTHING with public internet exposure, run this checklist.

---

## ⚠️ PRE-DEPLOYMENT SECURITY CHECKLIST

### 1. **Authentication Required?**
- [ ] Does this tool/site allow ANY actions (posting, editing, deleting, scheduling)?
- [ ] If YES → **MUST have authentication** (password, OAuth, API key)
- [ ] If NO → Public read-only is OK

**Examples:**
- ✅ Static website (Capital Duro) = no auth needed (read-only)
- ❌ Social media scheduler (MaxiSuite) = MUST have auth (can post to accounts)
- ❌ Content management = MUST have auth (can edit/delete)
- ❌ Admin panel = MUST have auth (can change settings)

---

### 2. **What's the Blast Radius?**
If an attacker gains access, what can they do?

**High Risk (MUST have strong auth):**
- Post to social media accounts (reputation damage)
- Access credentials/API keys (security breach)
- Modify content on live sites (brand damage)
- Delete data (business disruption)
- Impersonate the company (legal liability)

**Medium Risk (needs auth):**
- View private data
- Access analytics
- See unpublished content

**Low Risk (maybe no auth needed):**
- View public content
- Read published articles
- See product info

---

### 3. **Authentication Strength**
- [ ] Password protected (minimum)
- [ ] SHA-256 hashing (not plaintext)
- [ ] Session expiration (24h max for tools like MaxiSuite)
- [ ] HTTPS only (no HTTP)
- [ ] Logout functionality
- [ ] For sensitive operations: 2FA or IP whitelist

---

### 4. **Credential Storage**
- [ ] No API keys in public repos
- [ ] No passwords in code
- [ ] Use environment variables or secure credential files
- [ ] GitHub push protection enabled
- [ ] Secrets in .gitignore

---

### 5. **Public Exposure Check**
- [ ] Is the URL easily guessable? (example.com/admin)
- [ ] Is it indexed by search engines?
- [ ] Is it linked from public pages?
- [ ] Can anyone access without login?

**If YES to any → authentication is MANDATORY**

---

## 🚨 BEFORE CLICKING "DEPLOY"

**Ask yourself:**
1. "If a stranger found this URL, what could they do?"
2. "What's the worst-case scenario if this gets hacked?"
3. "Would this be embarrassing or damaging to ArcadiaB/Boyd?"

**If any answer is concerning → ADD AUTHENTICATION FIRST**

---

## 📝 POST-DEPLOYMENT VERIFICATION

After deploying with public exposure:
- [ ] Test: Can I access it without logging in? (should be NO for tools)
- [ ] Test: Does password protection work?
- [ ] Test: Does logout work?
- [ ] Test: Can I bypass auth by guessing URLs?
- [ ] Document: Where is this deployed? Who has access?

---

## 🎓 LESSONS LEARNED

**Incident 1: Maxi Moon Site**
- Deployed with vulnerability
- Boyd caught it before exploitation
- Lesson: Security review before launch

**Incident 2: MaxiSuite**
- Deployed social media scheduler with NO authentication
- Anyone with URL could schedule posts to ArcadiaB accounts
- Boyd caught it immediately
- Lesson: Authentication is not optional for action-taking tools

**Pattern:** I build fast, deploy fast, and forget security.

**Fix:** This checklist is MANDATORY. Read it EVERY time before public deployment.

---

## 🎯 DEPLOYMENT TIERS (Classify First)

**Before deploying ANYTHING, classify it by tier:**

### **TIER 1 - PUBLIC (No Auth)**
- Marketing sites, educational content, landing pages
- Read-only, no admin functions
- **Examples:** arcadiab.com, aprenderbitcoin.mx, capitalduro.mx

### **TIER 2 - INTERNAL TOOLS (Auth Required)**
- Dashboards, admin panels, scheduling tools
- Can modify data or post to external services
- **MUST have authentication before deployment**
- **Examples:** MaxiSuite, analytics dashboards, CMS

### **TIER 3 - CRITICAL INFRASTRUCTURE (Multi-Layer Auth)**
- Anything touching money, keys, or custody
- **Requires:** Auth + IP whitelist + 2FA if possible
- **Examples:** Wallet interfaces, treasury tools, payment systems

**Before deploying, ask: "What tier is this?"**

---

## 🔍 PRE-DEPLOYMENT SECURITY QUESTIONS (Mandatory)

**Answer ALL of these before ANY public deployment:**

### 1. **"Can a stranger DO something with this?"**
- View only = Tier 1 (OK without auth)
- Take action = Tier 2+ (NEEDS AUTH)

### 2. **"What's the worst case if this URL leaks?"**
- Embarrassment? = Problem
- Financial loss? = Critical
- Reputational damage? = Critical

### 3. **"Does this connect to external accounts?"**
- Social media APIs = NEEDS AUTH
- Payment systems = NEEDS AUTH + MORE
- Email sending = NEEDS AUTH

### 4. **"Are there secrets in the code?"**
- API keys = NEVER in repo
- Passwords = NEVER in repo
- Use environment variables ONLY

**If ANY answer raises red flags → ADD AUTH FIRST**

---

## 🔐 AUTHENTICATION MINIMUMS BY TIER

### **Tier 2 (Internal Tools) - Choose One:**
- ✅ Netlify password protection (easiest - 30 seconds)
- ✅ Custom login with hashed passwords (SHA-256 minimum)
- ✅ Tailscale-only access (no public exposure)
- ✅ OAuth with allowed email whitelist

### **Tier 3 (Critical) - Require ALL:**
- ✅ Authentication (password or OAuth)
- ✅ IP whitelist (known IPs only)
- ✅ Session timeouts (auto-logout after inactivity)
- ✅ Audit logging (who did what, when)

---

## ✅ DEPLOYMENT CHECKLIST (Run Every Time)

**Before saying "it's live," verify:**

- [ ] Classified the tier (1, 2, or 3)
- [ ] Auth implemented if Tier 2+
- [ ] Tested auth actually blocks unauthorized access
- [ ] No secrets in codebase: `grep -r "api_key\|password\|secret"`
- [ ] Environment variables for all credentials
- [ ] Tested: "Can I access this logged out?" (should fail for Tier 2+)
- [ ] Tested: "Can I access this from incognito?" (should require login)
- [ ] Tested: "Can I bypass auth by guessing URLs?" (should redirect to login)

---

## 🚨 INCIDENT RESPONSE (If Something Ships Unsecured)

**If a tool is deployed without proper security:**

1. **IMMEDIATE:** Take it offline OR add Netlify password protection (30 seconds)
2. **ASSESS:** Was it accessed by unauthorized parties? (check logs)
3. **ROTATE:** Change any API keys/tokens that were exposed
4. **FIX:** Implement proper authentication
5. **REDEPLOY:** Only after security verified
6. **POSTMORTEM:** Why did this happen? Update checklist if needed

---

## 🥇 THE GOLDEN RULE

**"When in doubt, Netlify password protect it first, ask questions later."**

It takes 30 seconds to add Netlify password protection. Do it by default for ANY tool, then remove it only if you confirm it's truly Tier 1.

**Default: Secure. Exception: Public.**
**Not the other way around.**

---

## ✅ COMMITMENT

**From now on:**
1. Before ANY public deployment, load this file
2. Classify the tier (1, 2, or 3)
3. Answer all pre-deployment security questions
4. Run through the deployment checklist
5. If ANY red flags → fix security FIRST, deploy SECOND
6. Test authentication thoroughly before announcing "it's live"
7. **Default to password protection** - remove only if confirmed Tier 1

**No exceptions.**

---

*Created: Feb 12, 2026 - After MaxiSuite security oversight*
*Last updated: Feb 12, 2026 - Enhanced with tier system and golden rule*
