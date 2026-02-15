# Boyd Command Center - Data Schema

## Overview
All data is stored in browser localStorage under the key: `boyd-command-center-data`

## Complete Data Structure

```json
{
  "tier1Deliverables": [
    {
      "id": number,
      "title": string,
      "dueDate": string (ISO 8601),
      "status": "ACTIVE" | "QUEUED" | "COMPLETE",
      "progress": number (0-100),
      "details": string
    }
  ],
  
  "arcadiabStrategic": {
    "fundraise": {
      "target": number (dollars),
      "stage": string,
      "closeDate": string (YYYY-MM-DD)
    },
    "investors": {
      "hot": number,
      "warm": number,
      "cold": number
    },
    "regulatory": {
      "asofom": string,
      "bursatiles": string
    },
    "nextMilestones": [
      {
        "text": string,
        "date": string (YYYY-MM-DD)
      }
    ]
  },
  
  "dailyOperations": {
    "nostr": {
      "todayCount": number,
      "targetCount": number,
      "lastPost": string (ISO 8601)
    },
    "mining": {
      "apolloSolo": {
        "status": "ONLINE" | "OFFLINE",
        "hashrate": string
      },
      "apolloII": {
        "status": "ONLINE" | "OFFLINE",
        "hashrate": string
      }
    },
    "ledn": {
      "btcBalance": number,
      "usdBalance": number
    },
    "btc": {
      "price": number,
      "alertHigh": number,
      "alertLow": number
    }
  },
  
  "contentPipeline": {
    "speaking": [
      {
        "event": string,
        "date": string (YYYY-MM-DD),
        "location": string
      }
    ],
    "writing": [
      {
        "title": string,
        "progress": number (0-100)
      }
    ],
    "consulting": [
      {
        "client": string,
        "status": string
      }
    ]
  },
  
  "weekDelivered": [
    {
      "item": string,
      "timestamp": string (ISO 8601),
      "status": "ON_TIME" | "MISSED",
      "rootCause": string (optional, for MISSED items)
    }
  ],
  
  "lastUpdated": string (ISO 8601)
}
```

## How Maxi Updates the Dashboard

### Method 1: Direct localStorage Update (Recommended for automation)

Maxi can update the dashboard by injecting JavaScript that modifies localStorage:

```javascript
// Read current data
const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));

// Update specific sections
data.tier1Deliverables[0].progress = 90;
data.dailyOperations.nostr.todayCount = 3;
data.lastUpdated = new Date().toISOString();

// Save back
localStorage.setItem('boyd-command-center-data', JSON.stringify(data));

// Trigger page refresh to show updates
window.location.reload();
```

### Method 2: Export/Import JSON Files

1. Boyd clicks "Export" to download current data
2. Maxi modifies the JSON file
3. Boyd clicks "Import" to upload updated data

### Method 3: API Integration (Future Enhancement)

For real-time updates, Maxi could:
- Push updates via WebSocket
- Implement REST API endpoint
- Use Firebase/Supabase for cloud sync

## Update Frequency Guidelines

**Real-time (every session):**
- `dailyOperations.nostr.todayCount` and `lastPost`
- `dailyOperations.btc.price`
- `tier1Deliverables[].progress` and `status`

**Daily:**
- `dailyOperations.mining` status
- `weekDelivered` additions
- `contentPipeline.writing[].progress`

**Weekly:**
- `arcadiabStrategic.investors`
- `arcadiabStrategic.nextMilestones`

**As-needed:**
- `tier1Deliverables` additions/completions
- `arcadiabStrategic.fundraise` stage changes
- `contentPipeline.speaking` events

## Risk Calculation

Risks are **auto-calculated** based on `dueDate`:
- **RED**: < 24 hours remaining
- **YELLOW**: 24-72 hours remaining
- **GREEN**: > 72 hours remaining
- **OVERDUE**: Past due date

## Adding New Deliverables

```javascript
const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));

data.tier1Deliverables.push({
  id: Date.now(), // Simple unique ID
  title: "New Deliverable",
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  status: "QUEUED",
  progress: 0,
  details: "Description here"
});

data.lastUpdated = new Date().toISOString();
localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
window.location.reload();
```

## Marking Deliverables Complete

```javascript
const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));

// Find deliverable by ID or title
const deliverable = data.tier1Deliverables.find(d => d.id === 1);
deliverable.status = "COMPLETE";
deliverable.progress = 100;

// Add to weekDelivered
data.weekDelivered.unshift({
  item: deliverable.title,
  timestamp: new Date().toISOString(),
  status: new Date() < new Date(deliverable.dueDate) ? "ON_TIME" : "MISSED"
});

data.lastUpdated = new Date().toISOString();
localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
window.location.reload();
```

## Data Persistence

- **Storage:** Browser localStorage (5-10MB limit)
- **Durability:** Survives page refresh, browser restart, Maxi sessions
- **Backup:** Export JSON regularly
- **Sync:** Manual import/export between devices

## Security Notes

- Data stored **locally only** (not sent to servers)
- No authentication required (local dashboard)
- For production deployment, consider adding password protection
