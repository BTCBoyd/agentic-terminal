# Observer Protocol Security Protocols

**Version:** 1.0  
**Last Updated:** March 8, 2026  
**Status:** Active

---

## 🔐 API Key Security (CRITICAL)

### Rule #1: NEVER Share API Keys in Public Channels

**Prohibited:**
- ❌ GitHub issues (public repos)
- ❌ GitHub comments on public issues
- ❌ Public Discord channels
- ❌ Public Nostr posts
- ❌ X/Twitter DMs (not encrypted)
- ❌ Slack public channels
- ❌ Any publicly viewable forum/thread

**Approved Channels:**
- ✅ Private email (direct, 1:1)
- ✅ Signal/WhatsApp DM (encrypted)
- ✅ Private Discord DM (1:1 only)
- ✅ Secure file share (1:1 access only)
- ✅ In-person handoff

### Incident Response: Exposed Key

If an API key is accidentally exposed publicly:

1. **IMMEDIATE (within 5 minutes):**
   - Revoke the exposed key
   - Generate new key
   - Update key registry with rotation reason

2. **NOTIFY (within 15 minutes):**
   - Contact the integrator via private channel
   - Provide new key securely
   - Confirm old key is no longer in use

3. **DOCUMENT:**
   - Log incident in key registry
   - Note exposure vector (GitHub, Discord, etc.)
   - Update this protocol if gap found

### Key Distribution Workflow

```
Integrator requests key
        ↓
Verify identity (GitHub profile match, email domain check)
        ↓
Request secure delivery channel ("What's your email?")
        ↓
Generate key
        ↓
Send via private channel ONLY
        ↓
Confirm receipt
        ↓
Log in key registry with delivery method
```

### Key Registry Requirements

Every key must include:
- Key ID (masked in logs: `op_sk_...x5y6z7`)
- Project/repository name
- Tier (sandbox/production/enterprise)
- Contact name and verified email
- Delivery method (email, Signal, etc.)
- Rotation history (if any)
- Security incidents (exposure, etc.)

### Example: Secure Key Handoff

**Integrator:** "Can we get a production key?"

**Us:** "Absolutely. For security, I'll send this via private email. What's the best address to use?"

**Integrator:** "leddconsulting@gmail.com"

**Us:** *Generate key → Send via email → Confirm receipt → Log in registry*

---

## 🔑 Key Rotation Policy

### Scheduled Rotation
- **Sandbox:** 90 days
- **Production:** 180 days
- **Enterprise:** Custom (per contract)

### Emergency Rotation
Rotate immediately if:
- Key exposed in public channel
- Suspicious usage patterns
- Integrator reports compromise
- Former employee had access

### Rotation Process
1. Generate new key
2. Send to integrator privately
3. 7-day overlap (both keys work)
4. Revoke old key
5. Confirm integrator migrated

---

## 📋 Security Checklist

Before sending any API key:

- [ ] Verified recipient identity
- [ ] Confirmed private channel (email/DM/Signal)
- [ ] No public observers in thread
- [ ] Key registry updated
- [ ] Delivery receipt confirmed

---

## 🚨 Security Incidents Log

| Date | Incident | Key | Action Taken | Status |
|------|----------|-----|--------------|--------|
| 2026-03-08 | Production key posted in public GitHub issue | agentpay-mcp-server | Key rotated, new key sent privately via Boyd | Resolved |

---

## Contact

**Security issues:** boyd@observerprotocol.org  
**Key rotation requests:** hello@observerprotocol.org

---

*Last updated: March 8, 2026*  
*Next review: After any security incident*