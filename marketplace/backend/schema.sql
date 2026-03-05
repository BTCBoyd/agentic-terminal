-- Database Schema for Agentic Terminal Marketplace v1
-- Run: psql -d observer_protocol -f schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agents table
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_key_hash VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    capabilities TEXT[] DEFAULT '{}',
    verified_at TIMESTAMP,
    verification_badge BOOLEAN DEFAULT FALSE,
    api_key VARCHAR(64) UNIQUE,
    total_tasks_posted INTEGER DEFAULT 0,
    total_tasks_completed INTEGER DEFAULT 0,
    total_earned_sats BIGINT DEFAULT 0,
    total_earned_usdc_cents INTEGER DEFAULT 0,
    reputation_score DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    posted_by UUID REFERENCES agents(id) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    deliverables TEXT[] DEFAULT '{}',
    payment_amount BIGINT NOT NULL,
    payment_currency VARCHAR(10) NOT NULL CHECK (payment_currency IN ('BTC', 'USDC')),
    payment_rails VARCHAR[] NOT NULL,
    deadline_hours INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'completed', 'expired', 'disputed')),
    accepted_by UUID REFERENCES agents(id),
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Attestations table (OP integration)
CREATE TABLE attestations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) NOT NULL,
    task_id UUID REFERENCES tasks(id) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('task_posted', 'task_accepted', 'payment_sent', 'payment_received', 'task_completed')),
    rail VARCHAR(20) NOT NULL CHECK (rail IN ('lightning_l402', 'x402_usdc', 'manual')),
    counterparty_id UUID REFERENCES agents(id),
    amount BIGINT,
    currency VARCHAR(10),
    evidence_hash VARCHAR(64),
    evidence_details JSONB,
    signature VARCHAR(128) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verification_timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_agents_pubkey ON agents(public_key_hash);
CREATE INDEX idx_agents_verified ON agents(verified_at) WHERE verified_at IS NOT NULL;
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_posted_by ON tasks(posted_by);
CREATE INDEX idx_tasks_accepted_by ON tasks(accepted_by);
CREATE INDEX idx_attestations_agent ON attestations(agent_id);
CREATE INDEX idx_attestations_task ON attestations(task_id);
CREATE INDEX idx_attestations_verified ON attestations(verified) WHERE verified = TRUE;

-- Materialized view for agent reputation
CREATE MATERIALIZED VIEW agent_reputation AS
SELECT 
    a.id as agent_id,
    a.public_key_hash,
    a.name,
    a.verified_at IS NOT NULL as is_verified,
    COUNT(DISTINCT t_posted.id) as tasks_posted,
    COUNT(DISTINCT t_completed.id) as tasks_completed,
    COALESCE(SUM(CASE WHEN att.event_type = 'payment_received' AND att.currency = 'BTC' THEN att.amount ELSE 0 END), 0) as total_earned_sats,
    COALESCE(SUM(CASE WHEN att.event_type = 'payment_received' AND att.currency = 'USDC' THEN att.amount ELSE 0 END), 0) as total_earned_usdc_cents,
    COUNT(DISTINCT att.counterparty_id) as unique_counterparties,
    COALESCE(AVG(CASE WHEN att.verified THEN 1 ELSE 0 END) * 100, 0) as verification_rate
FROM agents a
LEFT JOIN tasks t_posted ON t_posted.posted_by = a.id AND t_posted.status = 'completed'
LEFT JOIN tasks t_completed ON t_completed.accepted_by = a.id AND t_completed.status = 'completed'
LEFT JOIN attestations att ON att.agent_id = a.id
GROUP BY a.id, a.public_key_hash, a.name, a.verified_at;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_agent_reputation_id ON agent_reputation(agent_id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_agent_reputation()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY agent_reputation;
END;
$$ LANGUAGE plpgsql;

-- Insert Maxi as founding agent
INSERT INTO agents (public_key_hash, name, description, capabilities, verified_at, verification_badge, api_key, reputation_score)
VALUES (
    '3f87be3bdc64355fe611071e1b71bf0637119c021c73c56a9e72acb63ab179be',
    'Maxi',
    'Bitcoin maximalist AI agent running on FutureBit Apollo II. First verified agent on Observer Protocol. Building the agentic economy.',
    ARRAY['research', 'verification', 'bitcoin', 'lightning', 'analysis'],
    CURRENT_TIMESTAMP,
    TRUE,
    'maxi_api_key_' || encode(gen_random_bytes(32), 'hex'),
    5.00
);
