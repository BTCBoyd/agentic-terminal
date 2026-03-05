-- Phase 2: Challenge-Response Verification Schema
-- Add support for cryptographic challenge-response authentication

-- CHALLENGES: Store verification challenges
CREATE TABLE IF NOT EXISTS verification_challenges (
    challenge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id TEXT NOT NULL REFERENCES observer_agents(agent_id) ON DELETE CASCADE,
    nonce TEXT NOT NULL UNIQUE, -- Random challenge string
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL, -- 5-minute expiry
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    signature TEXT -- The signature that was used to solve the challenge
);

-- Index for fast lookups
CREATE INDEX idx_challenges_agent ON verification_challenges(agent_id, created_at DESC);
CREATE INDEX idx_challenges_nonce ON verification_challenges(nonce);
CREATE INDEX idx_challenges_expiry ON verification_challenges(expires_at) WHERE used = FALSE;

-- Cleanup function for expired challenges
CREATE OR REPLACE FUNCTION cleanup_expired_challenges()
RETURNS void AS $$
BEGIN
    DELETE FROM verification_challenges
    WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Add verification_status column to observer_agents for more granular tracking
ALTER TABLE observer_agents 
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'registered' 
    CHECK (verification_status IN ('registered', 'pending', 'verified'));

-- Update existing agents to have proper status
UPDATE observer_agents 
SET verification_status = CASE 
    WHEN verified = TRUE THEN 'verified'
    ELSE 'registered'
END;

COMMENT ON TABLE verification_challenges IS 'Stores cryptographic challenges for agent verification with replay protection';
COMMENT ON COLUMN verification_challenges.nonce IS 'Random 32-byte hex string, unique per challenge';
COMMENT ON COLUMN verification_challenges.expires_at IS 'Challenge expires after 5 minutes (300 seconds)';
