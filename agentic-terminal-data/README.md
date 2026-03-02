# Agentic Terminal Data Architecture

## Overview

This directory contains the time-series data foundation for the Agentic Terminal trends visualization system. We systematically collect longitudinal cross-protocol settlement data across Bitcoin Lightning, stablecoin API rails, and emerging protocols.

## Directory Structure

```
/agentic-terminal-data/
├── metrics-history.json       # Canonical time-series database (8+ weeks)
├── daily/                     # Raw daily snapshots
│   ├── 2026-02-18.json
│   ├── 2026-02-19.json
│   └── ...
├── scripts/                   # Data collection and validation
│   ├── agentic-terminal-data-collection.mjs  # Weekly collection cron
│   └── validate-metrics.mjs                  # Data integrity validator
├── charts/                    # Generated chart images
├── processed/                 # Aggregated/transformed data
└── raw/                       # API response backups
```

## Schema: metrics-history.json

### Top-Level Structure
```json
{
  "schema_version": "1.0.0",
  "description": "...",
  "last_updated": "ISO timestamp",
  "weeks": [...],
  "metadata": {...}
}
```

### Week Entry Structure
```json
{
  "week_start": "YYYY-MM-DD",
  "week_end": "YYYY-MM-DD", 
  "snapshot_date": "YYYY-MM-DD",
  "metrics": {
    "bitcoin_lightning": {
      "l402_github_stars": number,
      "l402_github_forks": number,
      "l402_github_issues": number,
      "l402_contributors": number,
      "lightning_nodes": number,
      "lightning_channels": number,
      "lightning_capacity_btc": number,
      "lightning_capacity_usd": number,
      "lightning_tor_nodes": number,
      "known_l402_endpoints": number
    },
    "stablecoin_api_rails": {
      "x402_github_stars": number,
      "x402_github_forks": number,
      "x402_github_issues": number,
      "x402_contributors": number,
      "x402_daily_transactions": number,
      "x402_cumulative_transactions": number,
      "x402_cumulative_volume_usd": number,
      "erc8004_agents_registered": number
    },
    "emerging_protocols": {
      "ark_github_stars": number,
      "ark_github_forks": number,
      "ark_skill_stars": number,
      "ark_skill_forks": number,
      "ark_status": string
    }
  },
  "wow_changes": {
    "bitcoin_lightning": {
      "l402_github_stars_pct": number|null,
      "lightning_nodes_pct": number|null,
      "lightning_channels_pct": number|null,
      "lightning_capacity_btc_pct": number|null
    },
    "stablecoin_api_rails": {
      "x402_github_stars_pct": number|null,
      "x402_daily_transactions_pct": number|null,
      "erc8004_agents_registered_pct": number|null
    }
  },
  "notes": "string",
  "data_quality": "verified|estimated|baseline"
}
```

## Data Sources

### 1. Bitcoin Lightning Network
- **Source**: 1ML.com API
- **Metrics**: Nodes, channels, capacity (BTC/USD), Tor nodes
- **Frequency**: Daily collection, weekly aggregation

### 2. L402 (Lightning Agent Tools)
- **Source**: GitHub API (lightninglabs/lightning-agent-tools)
- **Metrics**: Stars, forks, issues, contributors
- **Note**: NOT aperture (reverse proxy) - tracks agent tools specifically

### 3. x402 (Coinbase)
- **Source**: GitHub API (coinbase/x402)
- **Metrics**: Stars, forks, issues, contributors, transaction volume
- **Transaction Data**: Dune Analytics (pending automated access)

### 4. ERC-8004 (Agent Identity)
- **Source**: Ethereum mainnet contract
- **Metrics**: Registered agents count
- **Contract**: 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432

### 5. Ark Protocol
- **Source**: GitHub API (arkade-os/arkd, ts-sdk, skill)
- **Metrics**: Stars, forks per repository

## Data Collection Schedule

### Weekly (Mondays 9:00 AM EST)
- Run `agentic-terminal-data-collection.mjs`
- Calculates week-over-week changes
- Appends to metrics-history.json (never overwrites)
- Validates data integrity

### Daily (Automated)
- Collect raw metrics to `daily/` directory
- Store API responses in `raw/`

## Validation Rules

The `validate-metrics.mjs` script enforces:

1. **Required Fields**: week_start, week_end, snapshot_date, metrics
2. **Critical Metrics**: No nulls in key fields (stars, nodes, channels, etc.)
3. **Date Parsing**: All dates must be valid ISO format
4. **Sane Ranges**: Values within expected bounds
5. **Chronological Order**: Weeks must be in order
6. **No Duplicates**: Unique week_start values

## Week-over-Week Calculation

```javascript
// Formula used
currentWeek.wow_changes = {
  metric_pct: ((current - previous) / previous * 100).toFixed(2)
}
```

Null values indicate:
- First week (no previous data)
- Missing previous data
- Division by zero protection

## Data Quality Flags

- `verified`: Collected from primary sources
- `verified_from_daily_files`: Derived from daily collection
- `verified_from_maxi_knowledge_state`: From research archive
- `estimated`: Interpolated/extrapolated
- `baseline`: First week of tracking

## Historical Coverage

| Week Start | Data Quality | Notes |
|------------|--------------|-------|
| 2026-01-06 | estimated | Pre-baseline |
| 2026-01-13 | baseline | First tracked week |
| 2026-01-20 | estimated_from_monthly_trends | Interpolated |
| 2026-01-27 | estimated_from_monthly_trends | Interpolated |
| 2026-02-03 | estimated_from_monthly_trends | Pre-announcement |
| 2026-02-10 | verified_from_daily_files | First auto collection |
| 2026-02-17 | verified_from_daily_files | Week 2 verified |
| 2026-02-24 | verified_from_maxi_knowledge_state | Week 3 verified |

## Usage for Charts

The metrics-history.json is designed to be easily consumed by charting libraries:

```javascript
// Example: Extract L402 star trend
const l402Stars = data.weeks.map(w => ({
  week: w.week_start,
  stars: w.metrics.bitcoin_lightning.l402_github_stars,
  change_pct: w.wow_changes.bitcoin_lightning.l402_github_stars_pct
}));
```

## Maintenance

### Adding New Metrics
1. Update schema in this README
2. Add validation rule in `validate-metrics.mjs`
3. Update collection script
4. Backfill historical data if possible

### Cron Setup
```bash
# Add to crontab for weekly collection
0 9 * * 1 cd /home/futurebit/.openclaw/workspace && node agentic-terminal-data/scripts/agentic-terminal-data-collection.mjs >> /home/futurebit/.openclaw/workspace/agentic-terminal-data/collection.log 2>&1
```

### Manual Validation
```bash
node agentic-terminal-data/scripts/validate-metrics.mjs
```

## Success Criteria (Phase 1)

- ✅ metrics-history.json exists with 8+ weeks of data
- ✅ Schema supports all metrics in the React component mockup
- ✅ Cron job successfully appends new data without overwriting
- ✅ Data validation passes (no nulls in critical fields, dates parse correctly)

---

*Last Updated: March 2, 2026*
*Schema Version: 1.0.0*
