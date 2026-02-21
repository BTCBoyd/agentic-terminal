-- Agentic Terminal Database Schema
-- Canonical structured database for machine-native settlement systems
-- Created: 2026-02-20

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- PROTOCOLS: settlement systems, registries, wallet infrastructure
CREATE TABLE protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL, -- lightning, stablecoin, registry, wallet, emerging
    launch_date DATE,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, experimental, deprecated
    official_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- METRICS: time-series numerical values
CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID REFERENCES protocols(id),
    metric_name VARCHAR(100) NOT NULL, -- standardized vocabulary
    timestamp TIMESTAMPTZ NOT NULL,
    value FLOAT NOT NULL,
    unit VARCHAR(50), -- btc, usd, count, capacity, stars, forks
    source VARCHAR(200),
    source_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for fast time-series queries
CREATE INDEX idx_metrics_protocol_time ON metrics(protocol_id, timestamp DESC);
CREATE INDEX idx_metrics_name_time ON metrics(metric_name, timestamp DESC);

-- SIGNALS: discrete observable events
CREATE TABLE signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID REFERENCES protocols(id),
    timestamp TIMESTAMPTZ NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- launch, integration, spike, release, governance
    title VARCHAR(300) NOT NULL,
    description TEXT,
    impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 10),
    source_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_signals_protocol_time ON signals(protocol_id, timestamp DESC);

-- ENTITIES: companies, wallets, exchanges, agent deployments
CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL, -- company, wallet, agent, protocol_team
    website VARCHAR(500),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANALYSIS: human or AI interpretation content
CREATE TABLE analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    related_protocol_ids UUID[],
    publish_date DATE,
    author VARCHAR(100) DEFAULT 'Maxi', -- Boyd or Maxi
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INGESTION LOGS: audit trail for every data collection run
CREATE TABLE ingestion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(100) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) NOT NULL, -- success, partial, failed
    rows_inserted INTEGER DEFAULT 0,
    errors TEXT,
    duration_ms INTEGER
);
