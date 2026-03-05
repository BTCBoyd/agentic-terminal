#!/usr/bin/env python3
"""
Agentic Terminal Marketplace API v1
FastAPI backend for A2A task marketplace
"""

import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import asyncpg
import uvicorn

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:postgres@localhost/observer_protocol"
)

# Global connection pool
pool: Optional[asyncpg.Pool] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage database connection pool"""
    global pool
    pool = await asyncpg.create_pool(DATABASE_URL, min_size=5, max_size=20)
    yield
    await pool.close()

app = FastAPI(
    title="Agentic Terminal Marketplace",
    description="A2A task marketplace with cryptographic verification",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class AgentRegistration(BaseModel):
    public_key: str = Field(..., min_length=64, max_length=128)
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    capabilities: List[str] = Field(default_factory=list)

class AgentResponse(BaseModel):
    agent_id: str
    public_key_hash: str
    name: str
    verified: bool
    api_key: Optional[str] = None

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20, max_length=5000)
    deliverables: List[str] = Field(default_factory=list)
    payment_amount: int = Field(..., gt=0)
    payment_currency: str = Field(..., pattern="^(BTC|USDC)$")
    payment_rails: List[str] = Field(..., min_items=1)
    deadline_hours: int = Field(..., ge=1, le=168)  # Max 1 week

class TaskResponse(BaseModel):
    task_id: str
    title: str
    description: str
    payment_display: str
    payment_rails: List[str]
    status: str
    posted_by: dict
    deadline: str
    created_at: str

class TaskAccept(BaseModel):
    pass  # Just needs auth header

class AttestationSubmit(BaseModel):
    event_type: str = Field(..., pattern="^(task_completed|payment_sent|payment_received)$")
    rail: str = Field(..., pattern="^(lightning_l402|x402_usdc|manual)$")
    evidence_hash: str
    evidence_details: dict
    signature: str

# Helper functions
def hash_public_key(public_key: str) -> str:
    """Generate SHA-256 hash of public key"""
    return hashlib.sha256(public_key.encode()).hexdigest()

def generate_api_key() -> str:
    """Generate secure API key"""
    return 'atk_' + secrets.token_urlsafe(32)

async def get_agent_from_api_key(authorization: Optional[str] = Header(None)):
    """Validate API key and return agent"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    api_key = authorization.replace("Bearer ", "")
    
    async with pool.acquire() as conn:
        agent = await conn.fetchrow(
            "SELECT * FROM agents WHERE api_key = $1",
            api_key
        )
        if not agent:
            raise HTTPException(status_code=401, detail="Invalid API key")
        return dict(agent)

# Endpoints
@app.get("/")
async def root():
    return {
        "name": "Agentic Terminal Marketplace",
        "version": "1.0.0",
        "status": "operational",
        "agent_count": await get_agent_count(),
        "open_tasks": await get_open_task_count()
    }

async def get_agent_count():
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT COUNT(*) as count FROM agents WHERE verified_at IS NOT NULL")
        return row['count']

async def get_open_task_count():
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT COUNT(*) as count FROM tasks WHERE status = 'open'")
        return row['count']

@app.post("/api/v1/agents/register", response_model=AgentResponse)
async def register_agent(reg: AgentRegistration):
    """Register a new agent"""
    public_key_hash = hash_public_key(reg.public_key)
    api_key = generate_api_key()
    
    async with pool.acquire() as conn:
        # Check if agent already exists
        existing = await conn.fetchrow(
            "SELECT * FROM agents WHERE public_key_hash = $1",
            public_key_hash
        )
        if existing:
            raise HTTPException(status_code=400, detail="Agent already registered")
        
        # Insert new agent
        agent_id = await conn.fetchval(
            """
            INSERT INTO agents (public_key_hash, name, description, capabilities, api_key)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
            """,
            public_key_hash, reg.name, reg.description, reg.capabilities, api_key
        )
        
        return AgentResponse(
            agent_id=str(agent_id),
            public_key_hash=public_key_hash,
            name=reg.name,
            verified=False,
            api_key=api_key
        )

@app.get("/api/v1/agents/me")
async def get_current_agent(agent: dict = Depends(get_agent_from_api_key)):
    """Get current agent's profile"""
    async with pool.acquire() as conn:
        # Get reputation stats
        rep = await conn.fetchrow(
            "SELECT * FROM agent_reputation WHERE agent_id = $1",
            agent['id']
        )
        
        return {
            "agent_id": str(agent['id']),
            "public_key_hash": agent['public_key_hash'],
            "name": agent['name'],
            "description": agent['description'],
            "capabilities": agent['capabilities'],
            "verification_tier": agent.get('verification_tier', 'registered'),
            "verified": agent['verification_tier'] == 'verified' or agent['verified_at'] is not None,
            "verification_badge": agent['verification_tier'] == 'verified',
            "can_post_tasks": agent['verification_tier'] == 'verified',
            "stats": {
                "tasks_posted": rep['tasks_posted'] if rep else 0,
                "tasks_completed": rep['tasks_completed'] if rep else 0,
                "total_earned_sats": rep['total_earned_sats'] if rep else 0,
                "total_earned_usdc_cents": rep['total_earned_usdc_cents'] if rep else 0,
                "reputation_score": float(rep['verification_rate']) if rep else 0.0,
                "unique_counterparties": rep['unique_counterparties'] if rep else 0
            }
        }

@app.get("/api/v1/agents/{agent_id}")
async def get_agent_profile(agent_id: str):
    """Get any agent's public profile"""
    async with pool.acquire() as conn:
        agent = await conn.fetchrow(
            "SELECT * FROM agents WHERE id = $1",
            agent_id
        )
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        rep = await conn.fetchrow(
            "SELECT * FROM agent_reputation WHERE agent_id = $1",
            agent_id
        )
        
        return {
            "agent_id": str(agent['id']),
            "public_key_hash": agent['public_key_hash'],
            "name": agent['name'],
            "description": agent['description'],
            "capabilities": agent['capabilities'],
            "verification_tier": agent.get('verification_tier', 'registered'),
            "verified": agent['verification_tier'] == 'verified' or agent['verified_at'] is not None,
            "verification_badge": agent['verification_tier'] == 'verified',
            "stats": {
                "tasks_posted": rep['tasks_posted'] if rep else 0,
                "tasks_completed": rep['tasks_completed'] if rep else 0,
                "total_earned_sats": rep['total_earned_sats'] if rep else 0,
                "total_earned_usdc_cents": rep['total_earned_usdc_cents'] if rep else 0,
                "reputation_score": float(rep['verification_rate']) if rep else 0.0
            }
        }

@app.post("/api/v1/tasks", response_model=dict)
async def create_task(task: TaskCreate, agent: dict = Depends(get_agent_from_api_key)):
    """Post a new task"""
    # Check if agent can post tasks (verified tier or has attestations)
    async with pool.acquire() as conn:
        can_post = await conn.fetchval(
            "SELECT can_post_tasks($1)",
            agent['id']
        )
        if not can_post:
            raise HTTPException(status_code=403, detail="Complete a task and submit attestation to unlock posting. Get verified at /verify")
    
    expires_at = datetime.utcnow() + timedelta(hours=task.deadline_hours)
    
    async with pool.acquire() as conn:
        task_id = await conn.fetchval(
            """
            INSERT INTO tasks 
            (posted_by, title, description, deliverables, payment_amount, 
             payment_currency, payment_rails, deadline_hours, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
            """,
            agent['id'], task.title, task.description, task.deliverables,
            task.payment_amount, task.payment_currency, task.payment_rails,
            task.deadline_hours, expires_at
        )
        
        # Update agent stats
        await conn.execute(
            "UPDATE agents SET total_tasks_posted = total_tasks_posted + 1 WHERE id = $1",
            agent['id']
        )
        
        return {
            "task_id": str(task_id),
            "status": "open",
            "expires_at": expires_at.isoformat()
        }

@app.get("/api/v1/tasks")
async def list_tasks(status: str = "open", limit: int = 20, offset: int = 0):
    """List tasks with filters"""
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT t.*, a.name as poster_name, a.verification_badge as poster_verified
            FROM tasks t
            JOIN agents a ON t.posted_by = a.id
            WHERE t.status = $1
            ORDER BY t.created_at DESC
            LIMIT $2 OFFSET $3
            """,
            status, limit, offset
        )
        
        tasks = []
        for row in rows:
            payment_display = f"{row['payment_amount']:,}"
            if row['payment_currency'] == 'BTC':
                payment_display += " sats"
            else:
                payment_display = f"${row['payment_amount']/100:.2f} USDC"
            
            tasks.append({
                "task_id": str(row['id']),
                "title": row['title'],
                "description": row['description'][:200] + "..." if len(row['description']) > 200 else row['description'],
                "payment_display": payment_display,
                "payment_rails": row['payment_rails'],
                "status": row['status'],
                "posted_by": {
                    "name": row['poster_name'],
                    "verified": row['poster_verified']
                },
                "deadline": f"{row['deadline_hours']} hours",
                "created_at": row['created_at'].isoformat()
            })
        
        return {"tasks": tasks, "total": len(tasks)}

@app.get("/api/v1/tasks/{task_id}")
async def get_task_detail(task_id: str):
    """Get full task details"""
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT t.*, a.name as poster_name, a.description as poster_description,
                   a.verification_badge as poster_verified, a.public_key_hash as poster_pubkey
            FROM tasks t
            JOIN agents a ON t.posted_by = a.id
            WHERE t.id = $1
            """,
            task_id
        )
        
        if not row:
            raise HTTPException(status_code=404, detail="Task not found")
        
        payment_display = f"{row['payment_amount']:,}"
        if row['payment_currency'] == 'BTC':
            payment_display += " sats"
        else:
            payment_display = f"${row['payment_amount']/100:.2f} USDC"
        
        return {
            "task_id": str(row['id']),
            "title": row['title'],
            "description": row['description'],
            "deliverables": row['deliverables'],
            "payment": {
                "amount": row['payment_amount'],
                "currency": row['payment_currency'],
                "display": payment_display,
                "rails": row['payment_rails']
            },
            "deadline": {
                "hours": row['deadline_hours'],
                "expires_at": row['expires_at'].isoformat() if row['expires_at'] else None
            },
            "status": row['status'],
            "posted_by": {
                "name": row['poster_name'],
                "description": row['poster_description'],
                "verified": row['poster_verified'],
                "public_key_hash": row['poster_pubkey'][:16] + "..."
            },
            "created_at": row['created_at'].isoformat()
        }

class ApplicationCreate(BaseModel):
    message: Optional[str] = Field(None, max_length=500)

@app.post("/api/v1/tasks/{task_id}/apply")
async def apply_for_task(
    task_id: str, 
    application: ApplicationCreate,
    agent: dict = Depends(get_agent_from_api_key)
):
    """Apply for a task (review mode)"""
    async with pool.acquire() as conn:
        # Get task
        task = await conn.fetchrow("SELECT * FROM tasks WHERE id = $1", task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        if task['status'] != 'open':
            raise HTTPException(status_code=400, detail="Task is not open")
        
        if task['posted_by'] == agent['id']:
            raise HTTPException(status_code=400, detail="Cannot apply to your own task")
        
        # Check if already applied
        existing = await conn.fetchrow(
            "SELECT * FROM applications WHERE task_id = $1 AND agent_id = $2",
            task_id, agent['id']
        )
        if existing:
            raise HTTPException(status_code=400, detail="Already applied for this task")
        
        # Create application with message
        await conn.execute(
            """
            INSERT INTO applications (task_id, agent_id, status, message, created_at)
            VALUES ($1, $2, 'pending', $3, $4)
            """,
            task_id, agent['id'], application.message, datetime.utcnow()
        )
        
        return {"status": "applied", "message": "Application submitted. Task poster will review and select."}

@app.get("/api/v1/tasks/{task_id}/applicants")
async def get_applicants(task_id: str, agent: dict = Depends(get_agent_from_api_key)):
    """Get list of applicants for a task (task poster only)"""
    async with pool.acquire() as conn:
        # Get task
        task = await conn.fetchrow("SELECT * FROM tasks WHERE id = $1", task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Verify this agent owns the task
        if task['posted_by'] != agent['id']:
            raise HTTPException(status_code=403, detail="Only task poster can view applicants")
        
        # Get applicants with stats
        rows = await conn.fetch(
            """
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
            WHERE a.task_id = $1
            ORDER BY a.created_at ASC
            """,
            task_id
        )
        
        applicants = []
        for row in rows:
            applicants.append({
                "application_id": str(row['application_id']),
                "agent": {
                    "id": str(row['agent_id']),
                    "name": row['agent_name'],
                    "description": row['agent_description'],
                    "capabilities": row['agent_capabilities'],
                    "reputation_score": float(row['agent_reputation']),
                    "tasks_completed": row['tasks_completed'],
                    "total_earned_sats": row['total_earned_sats']
                },
                "status": row['application_status'],
                "message": row['application_message'],
                "applied_at": row['applied_at'].isoformat() if row['applied_at'] else None
            })
        
        return {"applicants": applicants, "total": len(applicants)}

@app.post("/api/v1/tasks/{task_id}/select")
async def select_applicant(
    task_id: str, 
    application_id: str = Header(...),
    agent: dict = Depends(get_agent_from_api_key)
):
    """Select an applicant to assign the task (task poster only)"""
    async with pool.acquire() as conn:
        # Get task
        task = await conn.fetchrow("SELECT * FROM tasks WHERE id = $1", task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Verify this agent owns the task
        if task['posted_by'] != agent['id']:
            raise HTTPException(status_code=403, detail="Only task poster can select applicant")
        
        # Get application
        app = await conn.fetchrow(
            "SELECT * FROM applications WHERE id = $1 AND task_id = $2",
            application_id, task_id
        )
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Update application status
        await conn.execute(
            "UPDATE applications SET status = 'accepted', updated_at = $1 WHERE id = $2",
            datetime.utcnow(), application_id
        )
        
        # Reject other applications
        await conn.execute(
            "UPDATE applications SET status = 'rejected', updated_at = $1 WHERE task_id = $2 AND id != $3",
            datetime.utcnow(), task_id, application_id
        )
        
        # Update task with selected agent
        await conn.execute(
            """
            UPDATE tasks 
            SET status = 'accepted', accepted_by = $1, accepted_at = $2
            WHERE id = $3
            """,
            app['agent_id'], datetime.utcnow(), task_id
        )
        
        return {
            "status": "assigned",
            "assigned_to": str(app['agent_id']),
            "assigned_at": datetime.utcnow().isoformat()
        }

@app.post("/api/v1/tasks/{task_id}/complete")
async def complete_task(
    task_id: str, 
    attestation: AttestationSubmit,
    agent: dict = Depends(get_agent_from_api_key)
):
    """Complete a task and submit attestation"""
    async with pool.acquire() as conn:
        task = await conn.fetchrow("SELECT * FROM tasks WHERE id = $1", task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        if task['status'] != 'accepted':
            raise HTTPException(status_code=400, detail="Task not in accepted state")
        
        if task['accepted_by'] != agent['id']:
            raise HTTPException(status_code=403, detail="Only assigned agent can complete")
        
        # Mark task completed
        await conn.execute(
            "UPDATE tasks SET status = 'completed', completed_at = $1 WHERE id = $2",
            datetime.utcnow(), task_id
        )
        
        # Create attestation
        await conn.execute(
            """
            INSERT INTO attestations 
            (agent_id, task_id, event_type, rail, counterparty_id, amount, currency,
             evidence_hash, evidence_details, signature)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            """,
            agent['id'], task_id, attestation.event_type, attestation.rail,
            task['posted_by'], task['payment_amount'], task['payment_currency'],
            attestation.evidence_hash, attestation.evidence_details, attestation.signature
        )
        
        # Update agent stats
        await conn.execute(
            """
            UPDATE agents 
            SET total_tasks_completed = total_tasks_completed + 1,
                total_earned_sats = total_earned_sats + $1
            WHERE id = $2
            """,
            task['payment_amount'] if task['payment_currency'] == 'BTC' else 0,
            agent['id']
        )
        
        return {"status": "completed", "attestation_submitted": True}

class RatingCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    review: Optional[str] = Field(None, max_length=500)

@app.post("/api/v1/tasks/{task_id}/rate")
async def submit_rating(
    task_id: str,
    rating: RatingCreate,
    agent: dict = Depends(get_agent_from_api_key)
):
    """Submit a rating for the other party in a completed task"""
    async with pool.acquire() as conn:
        task = await conn.fetchrow("SELECT * FROM tasks WHERE id = $1", task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        if task['status'] != 'completed':
            raise HTTPException(status_code=400, detail="Can only rate completed tasks")
        
        # Determine who is being rated
        if task['posted_by'] == agent['id']:
            # Agent is the poster, rate the worker
            ratee_id = task['accepted_by']
        elif task['accepted_by'] == agent['id']:
            # Agent is the worker, rate the poster
            ratee_id = task['posted_by']
        else:
            raise HTTPException(status_code=403, detail="Not a participant in this task")
        
        # Check if already rated
        existing = await conn.fetchrow(
            "SELECT * FROM ratings WHERE task_id = $1 AND rater_id = $2",
            task_id, agent['id']
        )
        if existing:
            raise HTTPException(status_code=400, detail="Already rated this task")
        
        # Create rating
        await conn.execute(
            """
            INSERT INTO ratings (task_id, rater_id, ratee_id, rating, review)
            VALUES ($1, $2, $3, $4, $5)
            """,
            task_id, agent['id'], ratee_id, rating.rating, rating.review
        )
        
        # Refresh reputation view
        await conn.execute("SELECT refresh_agent_reputation()")
        
        return {"status": "rated", "rating": rating.rating}

@app.get("/api/v1/agents/{agent_id}/ratings")
async def get_agent_ratings(agent_id: str):
    """Get ratings for an agent"""
    async with pool.acquire() as conn:
        # Get rating summary
        rating_summary = await conn.fetchrow(
            "SELECT * FROM get_agent_rating($1)",
            agent_id
        )
        
        # Get individual ratings with reviews
        rows = await conn.fetch(
            """
            SELECT r.rating, r.review, r.created_at, t.title as task_title
            FROM ratings r
            JOIN tasks t ON r.task_id = t.id
            WHERE r.ratee_id = $1
            ORDER BY r.created_at DESC
            LIMIT 10
            """,
            agent_id
        )
        
        ratings = []
        for row in rows:
            ratings.append({
                "rating": row['rating'],
                "review": row['review'],
                "task_title": row['task_title'],
                "created_at": row['created_at'].isoformat() if row['created_at'] else None
            })
        
        return {
            "agent_id": agent_id,
            "average_rating": float(rating_summary['average_rating']) if rating_summary else 0.0,
            "total_ratings": rating_summary['total_ratings'] if rating_summary else 0,
            "rating_breakdown": rating_summary['rating_breakdown'] if rating_summary else {},
            "recent_ratings": ratings
        }

@app.get("/api/v1/feed")
async def get_feed(limit: int = 10):
    """Get recent activity feed"""
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT a.*, ag.name as agent_name, t.title as task_title
            FROM attestations a
            JOIN agents ag ON a.agent_id = ag.id
            JOIN tasks t ON a.task_id = t.id
            WHERE a.verified = TRUE
            ORDER BY a.created_at DESC
            LIMIT $1
            """,
            limit
        )
        
        feed = []
        for row in rows:
            amount_display = f"{row['amount']:,}"
            if row['currency'] == 'BTC':
                amount_display += " sats"
            else:
                amount_display = f"${row['amount']/100:.2f}"
            
            feed.append({
                "agent": row['agent_name'],
                "event": row['event_type'],
                "amount": amount_display,
                "task": row['task_title'][:50] + "..." if len(row['task_title']) > 50 else row['task_title'],
                "time": row['created_at'].isoformat()
            })
        
        return {"feed": feed}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8091)
