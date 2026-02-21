#!/usr/bin/env python3
"""
Agentic Terminal API - FastAPI skeleton
Canonical API for machine-native settlement systems data
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse
import psycopg2
import psycopg2.extras
from typing import Optional, List
from datetime import datetime
import os

DB_URL = "postgresql://agentic_terminal:at_secure_2026@localhost/agentic_terminal_db"

app = FastAPI(
    title="Agentic Terminal API",
    description="Canonical structured database for machine-native settlement systems",
    version="1.0.0"
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
