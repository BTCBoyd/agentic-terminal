#!/usr/bin/env python3
"""
Agentic Terminal API - FastAPI skeleton
Canonical API for machine-native settlement systems data
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import psycopg2.extras
from typing import Optional, List
from datetime import datetime, timedelta
import os
import hashlib
import secrets
import uuid
import sys

# Add observer-protocol to path for crypto verification
sys.path.insert(0, '/home/futurebit/.openclaw/workspace/observer-protocol')
from crypto_verification import verify_signature_simple

DB_URL = "postgresql://agentic_terminal:at_secure_2026@localhost/agentic_terminal_db"

app = FastAPI(
    title="Agentic Terminal API",
    description="Canonical structured database for machine-native settlement systems",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://observerprotocol.org",
        "https://www.observerprotocol.org",
        "https://agenticterminal.ai",
        "https://www.agenticterminal.ai",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

def get_db_connection():
    """Get database connection."""
    return psycopg2.connect(DB_URL)

@app.get("/api/v1/health")
def health_check():
    """Health check endpoint."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        conn.close()
        return {"status": "ok", "db": "connected", "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=503, detail={"status": "error", "db": "disconnected", "error": str(e)})

@app.get("/api/v1/protocols")
def list_protocols():
    """List all protocols."""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    cursor.execute("""
        SELECT id, name, category, status, description, official_url, launch_date, created_at
        FROM protocols
        ORDER BY name
    """)
    
    protocols = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return {"protocols": [dict(p) for p in protocols], "count": len(protocols)}

@app.get("/api/v1/protocols/{protocol_id}")
def get_protocol(protocol_id: str):
    """Get single protocol with latest metrics."""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    # Get protocol details
    cursor.execute("""
        SELECT id, name, category, status, description, official_url, launch_date, created_at
        FROM protocols
        WHERE id = %s
    """, (protocol_id,))
    
    protocol = cursor.fetchone()
    if not protocol:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Protocol not found")
    
    # Get latest metrics for this protocol
    cursor.execute("""
        SELECT DISTINCT ON (metric_name)
            metric_name, value, unit, timestamp, source
        FROM metrics
        WHERE protocol_id = %s
        ORDER BY metric_name, timestamp DESC
    """, (protocol_id,))
    
    latest_metrics = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return {
        "protocol": dict(protocol),
        "latest_metrics": [dict(m) for m in latest_metrics]
    }

@app.get("/api/v1/metrics")
def get_metrics(
    protocol: Optional[str] = Query(None, description="Protocol name to filter by"),
    metric_name: Optional[str] = Query(None, description="Specific metric name"),
    limit: int = Query(30, ge=1, le=1000),
    offset: int = Query(0, ge=0)
):
    """Get time-series metrics."""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    query = """
        SELECT m.id, m.metric_name, m.value, m.unit, m.timestamp, m.source, m.source_url,
               p.name as protocol_name, p.id as protocol_id
        FROM metrics m
        JOIN protocols p ON m.protocol_id = p.id
        WHERE 1=1
    """
    params = []
    
    if protocol:
        query += " AND p.name = %s"
        params.append(protocol)
    
    if metric_name:
        query += " AND m.metric_name = %s"
        params.append(metric_name)
    
    query += " ORDER BY m.timestamp DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])
    
    cursor.execute(query, params)
    metrics = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return {"metrics": [dict(m) for m in metrics], "count": len(metrics), "limit": limit, "offset": offset}

@app.get("/api/v1/signals")
def get_signals(
    protocol: Optional[str] = Query(None, description="Protocol name to filter by"),
    event_type: Optional[str] = Query(None, description="Event type filter"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get latest signals (discrete observable events)."""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    query = """
        SELECT s.id, s.event_type, s.title, s.description, s.impact_score, 
               s.timestamp, s.source_url, p.name as protocol_name
        FROM signals s
        JOIN protocols p ON s.protocol_id = p.id
        WHERE 1=1
    """
    params = []
    
    if protocol:
        query += " AND p.name = %s"
        params.append(protocol)
    
    if event_type:
        query += " AND s.event_type = %s"
        params.append(event_type)
    
    query += " ORDER BY s.timestamp DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])
    
    cursor.execute(query, params)
    signals = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return {"signals": [dict(s) for s in signals], "count": len(signals), "limit": limit, "offset": offset}

@app.get("/api/v1/stats")
def get_stats():
    """Get database statistics."""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    stats = {}
    
    # Count tables
    cursor.execute("SELECT COUNT(*) as count FROM protocols")
    stats["protocols_count"] = cursor.fetchone()["count"]
    
    cursor.execute("SELECT COUNT(*) as count FROM metrics")
    stats["metrics_count"] = cursor.fetchone()["count"]
    
    cursor.execute("SELECT COUNT(*) as count FROM signals")
    stats["signals_count"] = cursor.fetchone()["count"]
    
    cursor.execute("SELECT COUNT(*) as count FROM entities")
    stats["entities_count"] = cursor.fetchone()["count"]
    
    cursor.execute("SELECT COUNT(*) as count FROM analysis")
    stats["analysis_count"] = cursor.fetchone()["count"]
    
    cursor.execute("SELECT COUNT(*) as count FROM ingestion_logs")
    stats["ingestion_logs_count"] = cursor.fetchone()["count"]
    
    # Latest ingestion
    cursor.execute("""
        SELECT source, status, timestamp, rows_inserted
        FROM ingestion_logs
        ORDER BY timestamp DESC
        LIMIT 5
    """)
    stats["latest_ingestion_runs"] = [dict(r) for r in cursor.fetchall()]
    
    cursor.close()
    conn.close()
    
    return {"stats": stats, "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/v1/agent-events")
def get_agent_events(limit: int = 20, agent_id: str = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if agent_id:
        cursor.execute("""
            SELECT id, agent_id, event_type, economic_role, amount, unit, 
                   context_tag, economic_intent, verified, timestamp
            FROM agent_events 
            WHERE agent_id = %s
            ORDER BY timestamp DESC LIMIT %s
        """, (agent_id, limit))
    else:
        cursor.execute("""
            SELECT id, agent_id, event_type, economic_role, amount, unit,
                   context_tag, economic_intent, verified, timestamp
            FROM agent_events 
            ORDER BY timestamp DESC LIMIT %s
        """, (limit,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    columns = ['id', 'agent_id', 'event_type', 'economic_role', 'amount', 'unit', 'context_tag', 'economic_intent', 'verified', 'timestamp']
    events = [dict(zip(columns, [str(v) if hasattr(v, 'hex') else v for v in row])) for row in rows]
    return {"count": len(events), "events": events}

# ============================================================
# OBSERVER PROTOCOL ENDPOINTS
# ============================================================

@app.post("/observer/register-agent")
def register_agent(
    public_key: str,
    agent_name: Optional[str] = None,
    framework: Optional[str] = None,
    alias: Optional[str] = None
):
    """Register a new agent with the Observer Protocol."""
    # Generate agent_id as SHA256 hash of public_key
    agent_id = hashlib.sha256(public_key.encode()).hexdigest()[:32]
    public_key_hash = hashlib.sha256(public_key.encode()).hexdigest()

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO observer_agents (agent_id, public_key_hash, agent_name, alias, framework, verified, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
            ON CONFLICT (agent_id) DO UPDATE SET
                agent_name = EXCLUDED.agent_name,
                alias = EXCLUDED.alias,
                framework = EXCLUDED.framework
            RETURNING agent_id
        """, (agent_id, public_key_hash, agent_name, alias or agent_name, framework, False))
        
        conn.commit()

        return {
            "agent_id": agent_id,
            "agent_name": agent_name,
            "verified": False,
            "message": "Registration successful. Submit a verified payment transaction to complete verification.",
            "next_step": f"POST /observer/submit-transaction with your agent_id and a Lightning preimage"
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.post("/observer/verify-agent")
def verify_agent(agent_id: str, signed_challenge: str):
    """Verify an agent with signed challenge (MVP: accepts any non-empty signature)."""
    if not signed_challenge or len(signed_challenge) == 0:
        raise HTTPException(status_code=400, detail="Signed challenge required")
    
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE observer_agents
            SET verified = TRUE,
                verified_at = NOW()
            WHERE agent_id = %s
            RETURNING agent_id
        """, (agent_id,))

        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Agent not found")

        conn.commit()

        return {
            "verified": True,
            "agent_id": agent_id
        }
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.post("/observer/submit-transaction")
def submit_transaction(
    agent_id: str,
    protocol: str,
    transaction_reference: str,
    timestamp: str,
    signature: str,
    optional_metadata: Optional[str] = None
):
    """Submit a verified transaction to the Observer Protocol.
    
    Cryptographically verifies the signature against the agent's registered public key.
    Only stores as 'verified=True' if signature validation passes.
    """
    import json
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Retrieve agent with public key
        cursor.execute("""
            SELECT verified, public_key FROM observer_agents WHERE agent_id = %s
        """, (agent_id,))

        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Agent not found")

        agent_verified, public_key = result
        if not agent_verified:
            raise HTTPException(status_code=403, detail="Agent not verified")

        if not public_key:
            raise HTTPException(status_code=400, detail="Agent has no registered public key")

        # Build the message that was signed (must match client-side format exactly)
        # Client builds attestation with ALL these fields before signing
        attestation = {
            "agent_id": agent_id,
            "protocol": protocol,
            "transaction_reference": transaction_reference,
            "timestamp": timestamp,
        }

        # Add fields from metadata in the same order as client
        if optional_metadata:
            try:
                metadata = json.loads(optional_metadata)
                # These fields are included in the signed message
                attestation["preimage"] = metadata.get("preimage")
                attestation["direction"] = metadata.get("direction", "outbound")
                attestation["amount_sats"] = metadata.get("amount_sats", 0)
                attestation["counterparty"] = metadata.get("counterparty", "unknown")
                attestation["memo"] = metadata.get("memo")
            except:
                pass

        # Include public_key in attestation (client includes this for verification)
        attestation["public_key"] = public_key

        # Use compact JSON (no spaces) to match Node.js JSON.stringify format
        message = json.dumps(attestation, separators=(',', ':'))
        message_bytes = message.encode('utf-8')

        # CRYPTGRAPHIC VERIFICATION: Verify signature against public key
        # Note: verify_signature_simple expects the raw message (it hashes internally)
        # The signature from noble-secp256k1 is over the SHA256 hash of the message
        # So we pass the raw message and let the verification function handle the hashing
        is_signature_valid = verify_signature_simple(message_bytes, signature, public_key)

        if not is_signature_valid:
            raise HTTPException(status_code=403, detail="Invalid signature: cryptographic verification failed")

        # Determine amount_bucket from optional_metadata if provided
        amount_bucket = "unknown"
        if optional_metadata:
            try:
                metadata = json.loads(optional_metadata)
                amount = metadata.get("amount_sats", 0)
                if amount < 1000:
                    amount_bucket = "micro"
                elif amount < 10000:
                    amount_bucket = "small"
                elif amount < 100000:
                    amount_bucket = "medium"
                else:
                    amount_bucket = "large"
            except:
                pass

        # Generate event_id
        cursor.execute("SELECT COUNT(*) FROM verified_events")
        count = cursor.fetchone()[0]
        event_id = f"event-{agent_id[:12]}-{count + 1:04d}"

        # Determine event_type and direction from metadata
        event_type = "payment.executed"
        direction = "outbound"
        counterparty_id = None
        service_description = None

        if optional_metadata:
            try:
                metadata = json.loads(optional_metadata)
                event_type = metadata.get("event_type", "payment.executed")
                direction = metadata.get("direction", "outbound")
                counterparty_id = metadata.get("counterparty_id")
                service_description = metadata.get("service_description")
            except:
                pass

        stored_at = datetime.utcnow()

        # Store with verified=True ONLY because cryptographic check passed
        cursor.execute("""
            INSERT INTO verified_events (
                event_id, agent_id, counterparty_id, event_type, protocol,
                transaction_hash, time_window, amount_bucket, direction,
                service_description, verified, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """, (
            event_id, agent_id, counterparty_id, event_type, protocol,
            transaction_reference, timestamp[:10] if timestamp else None,
            amount_bucket, direction, service_description, True
        ))

        conn.commit()

        return {
            "event_id": event_id,
            "verified": True,
            "cryptographic_verification": True,
            "stored_at": stored_at.isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Transaction submission failed: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.get("/observer/trends")
def get_trends():
    """Get trends from verified events (no auth required for MVP)."""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        # Get protocol counts
        cursor.execute("""
            SELECT protocol, COUNT(*) as count
            FROM verified_events
            GROUP BY protocol
            ORDER BY count DESC
        """)
        protocol_counts = [dict(r) for r in cursor.fetchall()]
        
        # Get total events
        cursor.execute("SELECT COUNT(*) as count FROM verified_events")
        total_events = cursor.fetchone()["count"]
        
        # Get total verified agents
        cursor.execute("SELECT COUNT(*) as count FROM observer_agents WHERE verified = TRUE")
        total_verified_agents = cursor.fetchone()["count"]
        
        # Get most active protocol
        most_active_protocol = None
        if protocol_counts:
            most_active_protocol = protocol_counts[0]["protocol"]
        
        return {
            "protocol_counts": protocol_counts,
            "total_events": total_events,
            "total_verified_agents": total_verified_agents,
            "most_active_protocol": most_active_protocol
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get trends: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.get("/observer/feed")
def get_feed(limit: int = 50):
    """Get last 50 verified events (anonymized — no agent_id in response)."""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        cursor.execute("""
            SELECT event_type, protocol, time_window, amount_bucket, verified, created_at
            FROM verified_events
            ORDER BY created_at DESC
            LIMIT %s
        """, (limit,))
        
        events = [dict(r) for r in cursor.fetchall()]
        
        return {
            "events": events,
            "count": len(events)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get feed: {str(e)}")
    finally:
        cursor.close()
        conn.close()


def _generate_badge_svg(
    agent_name: str,
    agent_seq: int,
    verified: bool,
    verified_at: Optional[datetime],
    tx_count: int,
    agent_id: str
) -> str:
    """Generate an Observer Protocol verification badge as SVG."""

    # Colors
    BG          = "#0a0a0f"
    ORANGE      = "#F7931A"
    PANEL_BG    = "#13131e"
    TEXT_LIGHT  = "#e8e8ed"
    TEXT_DIM    = "#6b6b80"
    GREEN       = "#00c853"
    BORDER      = "#252535"

    display_name = agent_name or f"agent-{agent_id[:8]}"
    seq_label    = f"#{agent_seq:04d}"
    date_label   = verified_at.strftime("%b %d, %Y") if verified_at else "—"
    tx_label     = f"{tx_count} verified tx"
    status_color = GREEN if verified else "#ff5252"
    status_text  = "VERIFIED" if verified else "UNVERIFIED"
    profile_url  = f"https://observerprotocol.org/agents/{agent_id}"

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="400" height="96" viewBox="0 0 400 96" role="img" aria-label="Observer Protocol Badge — {display_name}">
  <title>Observer Protocol — {display_name} {seq_label}</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="{PANEL_BG}"/>
      <stop offset="100%" stop-color="{BG}"/>
    </linearGradient>
    <clipPath id="r"><rect width="400" height="96" rx="8"/></clipPath>
  </defs>

  <!-- Background -->
  <rect width="400" height="96" rx="8" fill="url(#bg)"/>
  <rect width="400" height="96" rx="8" fill="none" stroke="{BORDER}" stroke-width="1"/>

  <!-- Left accent bar -->
  <rect width="4" height="96" rx="0" fill="{ORANGE}" clip-path="url(#r)"/>

  <!-- Orange OP circle logo -->
  <circle cx="36" cy="48" r="18" fill="{ORANGE}" opacity="0.15"/>
  <circle cx="36" cy="48" r="13" fill="none" stroke="{ORANGE}" stroke-width="2"/>
  <text x="36" y="53" font-family="monospace" font-size="11" font-weight="700"
        fill="{ORANGE}" text-anchor="middle">OP</text>

  <!-- Agent name + seq -->
  <text x="66" y="34" font-family="'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif"
        font-size="15" font-weight="700" fill="{TEXT_LIGHT}">{display_name}</text>
  <text x="66" y="52" font-family="'JetBrains Mono', 'Courier New', monospace"
        font-size="11" fill="{TEXT_DIM}">Agent {seq_label}</text>

  <!-- Status pill -->
  <rect x="66" y="60" width="78" height="18" rx="4" fill="{status_color}" opacity="0.15"/>
  <text x="105" y="73" font-family="monospace" font-size="10" font-weight="700"
        fill="{status_color}" text-anchor="middle">{status_text}</text>

  <!-- Right side stats -->
  <text x="390" y="34" font-family="monospace" font-size="10" fill="{TEXT_DIM}"
        text-anchor="end">{tx_label}</text>
  <text x="390" y="52" font-family="monospace" font-size="10" fill="{TEXT_DIM}"
        text-anchor="end">since {date_label}</text>

  <!-- Bottom label -->
  <text x="200" y="88" font-family="monospace" font-size="9" fill="{TEXT_DIM}"
        text-anchor="middle" opacity="0.7">OBSERVER PROTOCOL · observerprotocol.org</text>

  <!-- Invisible full-badge link -->
  <a href="{profile_url}">
    <rect width="400" height="96" fill="transparent"/>
  </a>
</svg>"""
    return svg


def _generate_not_found_badge_svg() -> str:
    """Badge for unknown agent IDs."""
    return """<svg xmlns="http://www.w3.org/2000/svg" width="400" height="96" viewBox="0 0 400 96">
  <rect width="400" height="96" rx="8" fill="#13131e" stroke="#252535" stroke-width="1"/>
  <rect width="4" height="96" fill="#555566"/>
  <text x="200" y="44" font-family="monospace" font-size="13" fill="#6b6b80" text-anchor="middle">OBSERVER PROTOCOL</text>
  <text x="200" y="64" font-family="monospace" font-size="11" fill="#ff5252" text-anchor="middle">Agent not found</text>
</svg>"""


@app.get("/observer/badge/{agent_id}.svg",
         responses={200: {"content": {"image/svg+xml": {}}}})
def get_agent_badge(agent_id: str):
    """
    Return a dynamic SVG verification badge for a registered Observer Protocol agent.
    Embed anywhere: <img src="https://api.agenticterminal.ai/observer/badge/AGENT_ID.svg">
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        # Fetch agent record
        cursor.execute("""
            SELECT agent_id, agent_name, verified, verified_at, created_at
            FROM observer_agents
            WHERE agent_id = %s
        """, (agent_id,))
        agent = cursor.fetchone()

        if not agent:
            svg = _generate_not_found_badge_svg()
            return Response(
                content=svg,
                media_type="image/svg+xml",
                headers={"Cache-Control": "no-cache", "X-Agent-Status": "not-found"}
            )

        # Get sequence number (rank by created_at)
        cursor.execute("""
            SELECT COUNT(*) as seq FROM observer_agents
            WHERE created_at <= %s
        """, (agent["created_at"],))
        seq = cursor.fetchone()["seq"]

        # Get verified event count
        cursor.execute("""
            SELECT COUNT(*) as cnt FROM verified_events
            WHERE agent_id = %s AND verified = TRUE
        """, (agent_id,))
        tx_count = cursor.fetchone()["cnt"]

        svg = _generate_badge_svg(
            agent_name  = agent["agent_name"] or agent_id[:12],
            agent_seq   = seq,
            verified    = agent["verified"],
            verified_at = agent["verified_at"],
            tx_count    = tx_count,
            agent_id    = agent_id
        )

        cache = "public, max-age=300" if agent["verified"] else "no-cache"
        return Response(
            content=svg,
            media_type="image/svg+xml",
            headers={
                "Cache-Control": cache,
                "X-Agent-Id": agent_id,
                "X-Verified": str(agent["verified"]).lower()
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Badge generation failed: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@app.get("/observer/agents/{agent_id}")
def get_agent_profile(agent_id: str):
    """Public agent profile — name, verification status, event count, first seen."""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute("""
            SELECT agent_id, agent_name, alias, framework,
                   verified, verified_at, created_at, access_level
            FROM observer_agents WHERE agent_id = %s
        """, (agent_id,))
        agent = cursor.fetchone()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        cursor.execute("""
            SELECT COUNT(*) as cnt FROM verified_events
            WHERE agent_id = %s AND verified = TRUE
        """, (agent_id,))
        tx_count = cursor.fetchone()["cnt"]

        cursor.execute("""
            SELECT COUNT(*) as seq FROM observer_agents
            WHERE created_at <= %s
        """, (agent["created_at"],))
        seq = cursor.fetchone()["seq"]

        return {
            "agent_id": agent_id,
            "agent_name": agent["agent_name"],
            "alias": agent["alias"],
            "framework": agent["framework"],
            "access_level": agent["access_level"],
            "verified": agent["verified"],
            "verified_at": agent["verified_at"].isoformat() if agent["verified_at"] else None,
            "first_seen": agent["created_at"].isoformat(),
            "sequence_number": seq,
            "verified_tx_count": tx_count,
            "badge_url": f"https://api.agenticterminal.ai/observer/badge/{agent_id}.svg",
            "profile_url": f"https://observerprotocol.org/agents/{agent_id}"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
