# Facebook Business Page & API Setup for ArcadiaB

**Goal:** Create new ArcadiaB Facebook presence + enable automated posting via MaxiSuite

---

## Step 1: Create Facebook Business Page

1. Go to: https://www.facebook.com/pages/create
2. Choose **"Business or Brand"**
3. Fill in:
   - **Page name:** ArcadiaB
   - **Category:** Financial Service / Bitcoin / Fintech (pick what fits)
   - **Description:** "Mexico's first ASOFOM-certified Bitcoin treasury company. Self-custody, institutional rates, sustainable dividends."
4. Upload:
   - **Profile photo:** ArcadiaB logo
   - **Cover photo:** Professional Bitcoin/treasury visual
5. Add **Username:** @arcadiabtc (if available)
6. Complete setup

---

## Step 2: Create Facebook App (for API Access)

1. Go to: https://developers.facebook.com/apps/create/
2. Click **"Create App"**
3. Choose **"Business"** type
4. Fill in:
   - **App name:** "ArcadiaB Social Automation"
   - **Contact email:** maxi@arcadiab.com (or your admin email)
   - **Business account:** Create new or link existing
5. Click **"Create App"**

---

## Step 3: Configure App Permissions

1. In your new app, go to **"Add Products"**
2. Add **"Facebook Login"**
3. Go to **Settings** → **Basic**
   - Add **App Domain:** maxisuite.netlify.app
4. Go to **"Use Cases"** → **"Add Use Case"**
   - Enable **"Publish to Pages"**
   - Request permissions:
     - `pages_manage_posts` (required for posting)
     - `pages_read_engagement` (for reading comments/replies)
     - `public_profile` (basic info)

---

## Step 4: Get Page Access Token

1. Go to **Tools** → **Graph API Explorer**
2. Select your app from dropdown
3. Click **"Generate Access Token"**
4. In permissions popup:
   - Select your ArcadiaB page
   - Grant `pages_manage_posts` permission
5. **Copy the token** (starts with `EAA...`)
6. **IMPORTANT:** Click **"Extend Token"** to get 60-day token

**Save this for Maxi:**
```
Page ID: [will be shown in Graph API Explorer]
Page Access Token: EAA... [long string]
```

---

## Step 5: Test Posting (Optional Verification)

In Graph API Explorer:
1. Change method to **POST**
2. Endpoint: `/{page-id}/feed`
3. Add parameters:
   - `message`: "Test post from ArcadiaB automation"
4. Click **Submit**
5. Check your page - post should appear

If it works → you're ready for MaxiSuite integration!

---

## Step 6: Send Credentials to Maxi

Once you have:
- ✅ Page ID
- ✅ Page Access Token (60-day extended token)

Send both to Maxi and I'll integrate Facebook into MaxiSuite.

---

## Important Notes

### About Crypto/Bitcoin Advertising Ban

**The ban you hit before:** Facebook restricts *paid advertising* for crypto. But:
- ✅ **Organic posts ARE allowed** (posting about Bitcoin to your page)
- ✅ **API posting works fine** (we're not doing ads, just content)
- ❌ **Paid ads for crypto require special approval** (avoid for now)

**Safe strategy:**
- Post educational content, company updates, market insights organically
- Avoid words like "buy Bitcoin" or "invest now" in ads
- Focus on treasury strategy, ASOFOM regulation, education

### Token Expiration

- **Facebook tokens expire in 60 days**
- I'll set up a reminder to refresh before expiration
- You'll need to regenerate token every ~2 months

---

## Questions?

If anything is unclear during setup, screenshot the step and send to Maxi. I'll guide you through it.

---

*Created: 2026-02-13 for ArcadiaB Facebook Business Page setup*
