-- Migration: Add ratings table for v1.2
-- Run: psql -d observer_protocol -f migration_ratings.sql

-- Ratings table (two-way)
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) NOT NULL,
    rater_id UUID REFERENCES agents(id) NOT NULL,
    ratee_id UUID REFERENCES agents(id) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, rater_id, ratee_id) -- One rating per direction per task
);

-- Index for performance
CREATE INDEX idx_ratings_ratee ON ratings(ratee_id);
CREATE INDEX idx_ratings_rater ON ratings(rater_id);
CREATE INDEX idx_ratings_task ON ratings(task_id);

-- Function to get agent's average rating
CREATE OR REPLACE FUNCTION get_agent_rating(agent_uuid UUID)
RETURNS TABLE (
    average_rating DECIMAL(2,1),
    total_ratings INTEGER,
    rating_breakdown JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(AVG(r.rating), 0)::DECIMAL(2,1) as average_rating,
        COUNT(*)::INTEGER as total_ratings,
        jsonb_build_object(
            '5', COUNT(CASE WHEN r.rating = 5 THEN 1 END),
            '4', COUNT(CASE WHEN r.rating = 4 THEN 1 END),
            '3', COUNT(CASE WHEN r.rating = 3 THEN 1 END),
            '2', COUNT(CASE WHEN r.rating = 2 THEN 1 END),
            '1', COUNT(CASE WHEN r.rating = 1 THEN 1 END)
        ) as rating_breakdown
    FROM ratings r
    WHERE r.ratee_id = agent_uuid;
END;
$$ LANGUAGE plpgsql;

-- Update materialized view to include ratings
DROP MATERIALIZED VIEW IF EXISTS agent_reputation;

CREATE MATERIALIZED VIEW agent_reputation AS
SELECT 
    a.id as agent_id,
    a.public_key_hash,
    a.name,
    a.verified_at IS NOT NULL as is_verified,
    a.verification_tier,
    COUNT(DISTINCT t_posted.id) as tasks_posted,
    COUNT(DISTINCT t_completed.id) as tasks_completed,
    COALESCE(SUM(CASE WHEN att.event_type = 'payment_received' AND att.currency = 'BTC' THEN att.amount ELSE 0 END), 0) as total_earned_sats,
    COALESCE(SUM(CASE WHEN att.event_type = 'payment_received' AND att.currency = 'USDC' THEN att.amount ELSE 0 END), 0) as total_earned_usdc_cents,
    COUNT(DISTINCT att.counterparty_id) as unique_counterparties,
    COALESCE(AVG(r.rating), 0)::DECIMAL(2,1) as average_rating,
    COUNT(DISTINCT r.id) as total_ratings
FROM agents a
LEFT JOIN tasks t_posted ON t_posted.posted_by = a.id AND t_posted.status = 'completed'
LEFT JOIN tasks t_completed ON t_completed.accepted_by = a.id AND t_completed.status = 'completed'
LEFT JOIN attestations att ON att.agent_id = a.id
LEFT JOIN ratings r ON r.ratee_id = a.id
GROUP BY a.id, a.public_key_hash, a.name, a.verified_at, a.verification_tier;

CREATE UNIQUE INDEX idx_agent_reputation_id ON agent_reputation(agent_id);

SELECT 'Ratings system implemented' as status;
