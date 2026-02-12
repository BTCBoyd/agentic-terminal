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

## ✅ COMMITMENT

**From now on:**
1. Before ANY public deployment, load this file
2. Run through the checklist
3. If ANY red flags → fix security FIRST, deploy SECOND
4. Document the security measures taken
5. Test authentication before announcing "it's live"

**No exceptions.**

---

*Created: Feb 12, 2026 - After MaxiSuite security oversight*
*Last updated: Feb 12, 2026*
