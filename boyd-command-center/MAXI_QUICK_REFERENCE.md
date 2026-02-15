# Maxi Quick Reference - Updating Boyd's Command Center

## Fastest Update Methods

### Method 1: Browser Console (Manual Testing)

```bash
# Open dashboard in browser
# Press F12 → Console tab
# Paste helper script, then use functions
```

```javascript
// Load helper (copy from maxi-update-helper.js first)
// Then use:

updateDeliverableProgress(1, 95, 'ACTIVE');
updateNostrCount(3);
updateBTCPrice(98750);
// etc.
```

### Method 2: Browser Automation (Recommended for Maxi)

```javascript
// Step 1: Open dashboard
await browser({
  action: 'open',
  profile: 'openclaw',
  targetUrl: 'file:///home/futurebit/.openclaw/workspace/boyd-command-center/dashboard.html'
});

// Step 2: Update data
await browser({
  action: 'act',
  profile: 'openclaw',
  request: {
    kind: 'evaluate',
    fn: `
      const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
      
      // Make your updates
      data.dailyOperations.nostr.todayCount = 3;
      data.tier1Deliverables[0].progress = 95;
      
      // Save and reload
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
      window.location.reload();
    `
  }
});
```

### Method 3: Export/Import Flow

```bash
# 1. Boyd clicks "Export" → downloads JSON
# 2. Maxi reads JSON file
# 3. Maxi modifies data
# 4. Maxi saves new JSON
# 5. Boyd clicks "Import" → uploads new JSON
```

## Common Update Scenarios

### Daily Nostr Post Tracking

```javascript
// Update count after posting
const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
data.dailyOperations.nostr.todayCount++;
data.dailyOperations.nostr.lastPost = new Date().toISOString();
data.lastUpdated = new Date().toISOString();
localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
window.location.reload();
```

### Update Deliverable Progress

```javascript
// Find by ID or title
const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
const deliverable = data.tier1Deliverables.find(d => 
  d.title.includes('Dashboard')
);
deliverable.progress = 100;
deliverable.status = 'COMPLETE';
data.lastUpdated = new Date().toISOString();
localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
window.location.reload();
```

### Add New Deliverable

```javascript
const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
data.tier1Deliverables.push({
  id: Date.now(),
  title: "New Deliverable Title",
  dueDate: new Date('2026-02-15').toISOString(),
  status: 'QUEUED',
  progress: 0,
  details: "Description of the work"
});
data.lastUpdated = new Date().toISOString();
localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
window.location.reload();
```

### Mark Deliverable Complete

```javascript
const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
const deliverable = data.tier1Deliverables.find(d => d.id === 1);

// Update deliverable
deliverable.status = 'COMPLETE';
deliverable.progress = 100;

// Add to week delivered
const onTime = new Date() < new Date(deliverable.dueDate);
data.weekDelivered.unshift({
  item: deliverable.title,
  timestamp: new Date().toISOString(),
  status: onTime ? 'ON_TIME' : 'MISSED'
});

data.lastUpdated = new Date().toISOString();
localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
window.location.reload();
```

### Update BTC Price

```javascript
const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
data.dailyOperations.btc.price = 99250;
data.lastUpdated = new Date().toISOString();
localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
window.location.reload();
```

### Update Mining Status

```javascript
const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
data.dailyOperations.mining.apolloSolo.status = 'ONLINE';
data.dailyOperations.mining.apolloSolo.hashrate = '3.5 TH/s';
data.lastUpdated = new Date().toISOString();
localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
window.location.reload();
```

### Update Fundraise Progress

```javascript
const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
data.arcadiabStrategic.fundraise.stage = 'Closing';
data.arcadiabStrategic.investors.hot = 4; // moved one from warm to hot
data.arcadiabStrategic.investors.warm = 6;
data.lastUpdated = new Date().toISOString();
localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
window.location.reload();
```

### Add Strategic Milestone

```javascript
const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
data.arcadiabStrategic.nextMilestones.push({
  text: "Board meeting presentation",
  date: "2026-03-01"
});
data.lastUpdated = new Date().toISOString();
localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
window.location.reload();
```

### Update Writing Progress

```javascript
const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
const writing = data.contentPipeline.writing.find(w => 
  w.title.includes('Chapter 4')
);
writing.progress = 75;
data.lastUpdated = new Date().toISOString();
localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
window.location.reload();
```

## Batch Updates (Multiple Changes)

```javascript
const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));

// Update multiple things at once
data.dailyOperations.nostr.todayCount = 4;
data.dailyOperations.btc.price = 99750;
data.tier1Deliverables[0].progress = 98;
data.tier1Deliverables[1].progress = 45;
data.contentPipeline.writing[0].progress = 80;

data.lastUpdated = new Date().toISOString();
localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
window.location.reload();
```

## Daily Maintenance Tasks

### Morning (Reset Daily Counters)

```javascript
const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));

// Reset Nostr counter for new day
data.dailyOperations.nostr.todayCount = 0;

// Clean old weekDelivered items (keep 7 days)
const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
data.weekDelivered = data.weekDelivered.filter(item => 
  new Date(item.timestamp).getTime() > sevenDaysAgo
);

data.lastUpdated = new Date().toISOString();
localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
window.location.reload();
```

### Check for Overdue Items

```javascript
const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
const now = new Date();

const overdue = data.tier1Deliverables.filter(d => 
  d.status !== 'COMPLETE' && new Date(d.dueDate) < now
);

if (overdue.length > 0) {
  console.log('⚠️ OVERDUE DELIVERABLES:');
  overdue.forEach(d => console.log(`  - ${d.title}`));
  // Alert Boyd via message tool
}
```

## Integration with Heartbeat

Add to `HEARTBEAT.md`:

```markdown
## Dashboard Updates (2x daily)

**Morning (9am):**
- Reset Nostr counter
- Update BTC price
- Check mining status

**Evening (6pm):**
- Update deliverable progress
- Update Nostr post count
- Check for overdue items
```

Then in heartbeat response:

```javascript
// Read HEARTBEAT.md, see dashboard update task
await browser({
  action: 'open',
  profile: 'openclaw',
  targetUrl: 'file:///path/to/dashboard.html'
});

await browser({
  action: 'act',
  request: {
    kind: 'evaluate',
    fn: `
      const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
      
      // Morning updates
      data.dailyOperations.nostr.todayCount = 0;
      data.dailyOperations.btc.price = 99200; // fetch from API
      
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
      'Updated dashboard';
    `
  }
});
```

## Troubleshooting

### Can't find dashboard file

```bash
# Find it:
ls /home/futurebit/.openclaw/workspace/boyd-command-center/dashboard.html

# Or use absolute path in browser:
file:///home/futurebit/.openclaw/workspace/boyd-command-center/dashboard.html
```

### localStorage not persisting

```javascript
// Check if localStorage is available
if (typeof(Storage) !== "undefined") {
  console.log("✅ localStorage available");
} else {
  console.log("❌ localStorage not supported");
}

// Check current data
console.log(localStorage.getItem('boyd-command-center-data'));
```

### Data got corrupted

```javascript
// Reset to defaults
const DEFAULT_DATA = { /* copy from dashboard.html */ };
localStorage.setItem('boyd-command-center-data', JSON.stringify(DEFAULT_DATA));
window.location.reload();
```

## Best Practices

1. **Always update `lastUpdated` timestamp**
2. **Always call `window.location.reload()` after updates** (or Boyd refreshes manually)
3. **Validate data before saving** (check for undefined/null)
4. **Use ISO 8601 dates** (`new Date().toISOString()`)
5. **Keep update functions idempotent** (can run multiple times safely)

## Getting Dashboard State

```javascript
// Quick check what's in dashboard
const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));

console.log('Deliverables:', data.tier1Deliverables.length);
console.log('Nostr today:', data.dailyOperations.nostr.todayCount);
console.log('BTC price:', data.dailyOperations.btc.price);
console.log('Last update:', new Date(data.lastUpdated).toLocaleString());
```

---

**Remember:** Dashboard is Boyd's single source of truth. Keep it updated regularly!
