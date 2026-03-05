-- Migration: Add applications table for v1.1
-- Run: psql -d observer_protocol -f migration_applications.sql

-- Applications table for task assignment workflow
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) NOT NULL,
    agent_id UUID REFERENCES agents(id) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT, -- Optional message from applicant
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(task_id, agent_id) -- One application per agent per task
);

-- Index for performance
CREATE INDEX idx_applications_task ON applications(task_id);
CREATE INDEX idx_applications_agent ON applications(agent_id);
CREATE INDEX idx_applications_status ON applications(status);

-- Function to get applicants for a task with their stats
CREATE OR REPLACE FUNCTION get_task_applicants(task_uuid UUID)
RETURNS TABLE (
    application_id UUID,
    agent_id UUID,
    agent_name VARCHAR,
    agent_description TEXT,
    agent_capabilities TEXT[],
    agent_reputation DECIMAL,
    tasks_completed INTEGER,
    total_earned_sats BIGINT,
    application_status VARCHAR,
    application_message TEXT,
    applied_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as application_id,
        ag.id as agent_id,
        ag.name as agent_name,
        ag.description as agent_description,
        ag.capabilities as agent_capabilities,
        ag.reputation_score as agent_reputation,
        COALESCE(ar.tasks_completed, 0) as tasks_completed,
        COALESCE(ar.total_earned_sats, 0) as total_earned_sats,
        a.status as application_status,
        a.message as application_message,
        a.created_at as applied_at
    FROM applications a
    JOIN agents ag ON a.agent_id = ag.id
    LEFT JOIN agent_reputation ar ON ag.id = ar.agent_id
    WHERE a.task_id = task_uuid
    ORDER BY a.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Update task status to track application vs assignment
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignment_mode VARCHAR(20) DEFAULT 'review' CHECK (assignment_mode IN ('first_come', 'review'));

SELECT 'Migration complete: Applications table added' as status;
