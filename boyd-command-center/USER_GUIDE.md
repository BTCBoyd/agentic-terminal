# Boyd Command Center - User Guide

## Quick Start

### First Time Setup

1. **Open the dashboard:**
   - Double-click `dashboard.html` in your file browser
   - OR open in browser: File → Open → select `dashboard.html`
   - Bookmark the page for quick access

2. **What you'll see:**
   - Pre-populated example data showing the layout
   - All sections automatically refresh timers every minute
   - Risk indicators update in real-time based on deadlines

3. **Mobile access:**
   - Works perfectly on phones/tablets
   - Responsive design adapts to screen size
   - Bookmark on home screen for app-like experience

### Daily Usage

**Checking Status:**
- Open bookmarked page anytime
- Glance at Tier 1 Deliverables for urgent items
- RED badges = needs immediate attention
- YELLOW badges = watch closely
- GREEN badges = on track

**Interactive Features:**
- **Click any deliverable** to expand and see details
- **Refresh button** reloads latest data
- **Export button** downloads backup JSON file
- **Import button** uploads updated data from Maxi

**Dashboard Layout (Top to Bottom):**

1. **🎯 Tier 1 Deliverables**
   - Your active priorities with countdown timers
   - Progress bars show completion %
   - Status badges: ACTIVE (working now), QUEUED (up next), COMPLETE (done)
   - Click to expand for full details

2. **🏛️ ArcadiaB Strategic**
   - Fundraise progress and stage
   - Investor pipeline heat map
   - Regulatory milestones
   - Upcoming strategic deadlines

3. **⚡ Daily Operations**
   - Nostr posting quota (X/5 today)
   - Mining rigs status and hashrate
   - LEDN account balances
   - BTC price with alert thresholds

4. **📚 Content Pipeline**
   - Speaking engagements calendar
   - Writing projects with progress bars
   - Active consulting engagements

5. **✅ This Week Delivered**
   - Recently completed items
   - On-time vs missed deadlines
   - Automatic 7-day rolling window

### Working with Maxi

**When Maxi Updates:**
- Maxi can push updates directly to your dashboard
- You'll see "Last updated" timestamp change
- Click Refresh to ensure you have latest data

**Manual Updates (if needed):**
1. Click "Export" to download current data
2. Share JSON file with Maxi
3. Maxi edits and sends back
4. Click "Import" and select updated JSON
5. Dashboard refreshes with new data

**Requesting Updates:**
Tell Maxi: "Update my command center with..." and specify what changed:
- "Mark dashboard deliverable as complete"
- "Add new Tier 1 deliverable: [title] due [date]"
- "Update Nostr posts to 3/5 today"
- "Set ArcadiaB fundraise stage to closing"

### Understanding Risk Indicators

**Risk badges auto-calculate based on time remaining:**

- 🔴 **RED** (< 24 hours)
  - Immediate action required
  - Focus here first

- 🟡 **YELLOW** (24-72 hours)
  - Plan to complete soon
  - Don't let it go red

- 🟢 **GREEN** (> 72 hours)
  - On track, keep monitoring
  - Revisit as deadline approaches

- ⚠️ **OVERDUE**
  - Past deadline
  - Needs root cause analysis

### Status Badges Explained

- **ACTIVE** (blue, pulsing)
  - Currently being worked on
  - Maxi or sub-agent assigned

- **QUEUED** (gray)
  - Scheduled but not started
  - Will become ACTIVE when prioritized

- **COMPLETE** (green)
  - Finished and delivered
  - Moves to "This Week Delivered" section

### Tips for Maximum Effectiveness

**Daily Check-ins:**
- Morning: Review Tier 1 and Daily Operations
- Evening: Check progress percentages and "This Week Delivered"

**Mobile Usage:**
- Add to home screen (Safari: Share → Add to Home Screen)
- Quick glance shows status without opening chat with Maxi
- All features work on mobile

**Reducing Check-in Messages:**
- Instead of asking Maxi "how's it going?", check dashboard
- Status badges and progress bars show real-time state
- Save conversations for strategic decisions, not status updates

**Data Backup:**
- Export JSON weekly as backup
- Store in safe location (Dropbox, Google Drive, etc.)
- Allows recovery if browser cache clears

### Customization

**Want different sections or data?**
Tell Maxi what you need changed:
- Add new tracking categories
- Modify alert thresholds (BTC price, hours before deadline)
- Change target counts (Nostr posts per day)
- Add/remove fields in any section

**Display preferences:**
- Dashboard adapts to dark/light system preferences
- Professional dark theme by default
- High information density without clutter

### Troubleshooting

**Dashboard not showing latest data:**
- Click Refresh button
- Check "Last updated" timestamp
- If needed, ask Maxi to push update

**Data disappeared:**
- Check if localStorage was cleared (browser cache cleaned)
- Import last exported JSON backup
- Ask Maxi to repopulate with current status

**Mobile display issues:**
- Rotate to landscape for more columns
- Zoom out slightly if needed (pinch gesture)
- Portrait mode optimized for scrolling

**Can't import JSON:**
- Verify file is valid JSON format
- Check file isn't corrupted
- Ask Maxi to regenerate if needed

### Privacy & Security

**Data storage:**
- Everything stored locally in browser
- Nothing sent to external servers
- No tracking or analytics

**Sharing:**
- Safe to show dashboard to trusted colleagues
- Contains strategic business information
- Don't share export files publicly

**Access control:**
- Currently open access (anyone with file can view)
- For deployment with authentication, ask Maxi to add password protection

### Future Enhancements

**Possible additions:**
- Real-time sync across devices (cloud backend)
- Email/SMS alerts for red status items
- Integration with calendar for automatic event tracking
- Mobile app version (native iOS/Android)
- Team collaboration features

Tell Maxi which features would help most!

---

## Support

**Having issues or want changes?**
Tell Maxi in chat:
- "Dashboard isn't showing X correctly"
- "Add feature to track Y"
- "Change the layout of Z section"

Maxi can update the dashboard code and push new versions anytime.
