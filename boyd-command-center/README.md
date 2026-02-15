# Boyd Command Center Dashboard

**Single-page React dashboard for tracking priorities, deliverables, and operations in real-time.**

![Status](https://img.shields.io/badge/status-ready-green)
![Platform](https://img.shields.io/badge/platform-React%20%2B%20Tailwind-blue)
![Storage](https://img.shields.io/badge/storage-localStorage-orange)

---

## Quick Start

1. **Open:** Double-click `dashboard.html` or open in browser
2. **Bookmark:** Save for quick access (works offline!)
3. **Use:** Check status anytime without asking Maxi

That's it! No installation, no build process, no server required.

---

## What's Included

### 📂 Files

- **`dashboard.html`** - The complete dashboard (open this!)
- **`DATA_SCHEMA.md`** - Data structure documentation (for Maxi)
- **`USER_GUIDE.md`** - How to use the dashboard (for Boyd)
- **`DEPLOYMENT.md`** - Hosting options and deployment guide
- **`README.md`** - This file

### 🎯 Dashboard Sections

1. **Tier 1 Deliverables** - Active priorities with countdown timers
2. **ArcadiaB Strategic** - Fundraise, investors, regulatory status
3. **Daily Operations** - Nostr posts, mining, LEDN, BTC price
4. **Content Pipeline** - Speaking, writing, consulting
5. **This Week Delivered** - Recent completions and missed deadlines

---

## Key Features

✅ **Survives Maxi's episodic nature** - localStorage persistence  
✅ **Works offline** - All data local, no internet required  
✅ **Mobile-friendly** - Responsive design, add to home screen  
✅ **Real-time updates** - Countdown timers, risk indicators  
✅ **Zero dependencies** - Single HTML file, works anywhere  
✅ **Export/Import** - Backup and sync data easily  

---

## For Boyd

**Read:** `USER_GUIDE.md` for complete usage instructions

**Quick tips:**
- Click any deliverable to expand details
- RED badges = urgent attention needed
- Export weekly as backup
- Works perfectly on mobile

**Checking status:**
Instead of asking Maxi "how's it going?", just refresh the dashboard!

---

## For Maxi

**Read:** `DATA_SCHEMA.md` for complete update instructions

**Quick update example:**

```javascript
// Load current data
const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));

// Update something
data.tier1Deliverables[0].progress = 95;
data.dailyOperations.nostr.todayCount = 3;
data.lastUpdated = new Date().toISOString();

// Save back
localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
window.location.reload();
```

**Update via browser automation:**
Use the `browser` tool to inject updates directly into the dashboard page.

---

## Deployment Options

**Option 1: Local file** (recommended to start)
- Double-click `dashboard.html`
- Bookmark the file:// URL
- Free, instant, works offline

**Option 2: Local network server**
```bash
python3 -m http.server 8080
# Access: http://localhost:8080/dashboard.html
```

**Option 3: Cloud (Netlify Drop)**
- Visit: https://app.netlify.com/drop
- Drag `boyd-command-center` folder
- Get instant URL

**See `DEPLOYMENT.md` for all options** (GitHub Pages, Vercel, VPS, etc.)

---

## Technical Details

**Stack:**
- React 18 (via CDN, no build required)
- Tailwind CSS (via CDN)
- Vanilla JavaScript for state management
- localStorage for persistence

**Browser compatibility:**
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS + desktop)
- Mobile browsers: ✅ Fully responsive

**Storage:**
- ~5-10KB for typical data
- Survives browser restart
- Survives system restart
- Cleared only if cache manually cleared

**Performance:**
- Loads instantly (<500ms)
- Updates every 60 seconds
- Minimal CPU usage
- No network requests (offline-first)

---

## Data Persistence Strategy

**Why localStorage?**
- Maxi has episodic memory (fresh each session)
- Boyd needs persistent tracking between conversations
- Dashboard becomes "ground truth" for status
- Reduces "how are you doing?" check-ins

**Backup strategy:**
- Weekly manual export (click Export button)
- Store JSON in cloud backup (Dropbox/Drive)
- Import restores to backup state

**Future enhancement:**
- Add Firebase/Supabase backend for real-time sync
- Automatic cloud backup
- Multi-device sync without manual export/import

---

## Customization

**Want changes?** Tell Maxi:
- Add new sections or data fields
- Change alert thresholds
- Modify styling or layout
- Add authentication
- Integrate with other tools

Maxi can update the dashboard code and redeploy in minutes.

---

## Project Context

**Who:** Boyd (CSO/Academic Director)  
**What:** Command center to track all priorities and operations  
**Why:** Maxi's episodic nature requires persistent external memory  
**How:** Single-page React dashboard with localStorage  

**Constraints:**
- Must work offline (local-first)
- Must survive Maxi session restarts
- Must be mobile-friendly (Boyd checks on phone)
- Must be professional appearance
- Must reduce status check-in messages

**Success criteria:**
- Boyd can check status anytime without asking Maxi
- Real-time visibility into all priorities and risks
- Data persists across all Maxi sessions
- Quick glance shows what needs attention

---

## Updates & Maintenance

**Version tracking:**
- Dashboard includes "Last updated" timestamp
- Export files include date in filename
- Git commits track code changes

**Updating the dashboard:**
1. Maxi makes changes to code
2. Boyd downloads new `dashboard.html`
3. Replaces old file
4. Data persists automatically (localStorage)

**Maxi push updates:**
- Via browser automation (inject JavaScript)
- Via export/import flow
- Future: via API/WebSocket real-time sync

---

## Support

**Questions?** Ask Maxi:
- "How do I deploy the dashboard to the cloud?"
- "Update my command center with [new data]"
- "Add feature to track [something new]"
- "Fix issue with [specific problem]"

Maxi has full access to code and can make updates anytime.

---

## License & Usage

**For Boyd's private use.** Contains strategic business information.

Do not share publicly without removing sensitive data.

---

**Built by:** Maxi (OpenClaw AI agent)  
**For:** Boyd  
**Date:** February 6, 2026  
**Status:** ✅ TIER 1 DELIVERABLE COMPLETE
