#!/usr/bin/env python3
"""
Seed signals table from existing evidence-data.json
Maps evidence entries to the signals schema with protocol lookup
"""

import json
import psycopg2
import psycopg2.extras
from datetime import datetime
from typing import Optional

# Database connection
DB_URL = "postgresql://agentic_terminal:at_secure_2026@localhost/agentic_terminal_db"

# Evidence data path
EVIDENCE_FILE = "/home/futurebit/.openclaw/workspace/agenticterminal-website/evidence-data.json"

# Protocol name mapping (evidence text -> protocol name in DB)
PROTOCOL_KEYWORDS = {
    "L402": "L402",
    "l402": "L402",
    "lightning-agent-tools": "L402",
    "x402": "x402",
    "X402": "x402",
    "Lightning Network": "Lightning Network",
    "Lightning": "Lightning Network",
    "Lightning Labs": "Lightning Network",
    "Ark": "Ark Protocol",
    "Alby": "Alby Hub",
    "clw.cash": "clw.cash",
    "ERC-8004": "ERC-8004",
}

def get_db_connection():
    """Get database connection."""
    return psycopg2.connect(DB_URL)

def get_protocols() -> dict:
    """Fetch protocols from DB and build name->id mapping"""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    cursor.execute("SELECT id, name FROM protocols")
    protocols = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    name_to_id = {}
    for p in protocols:
        name_to_id[p["name"]] = p["id"]
    return name_to_id

def detect_protocol_id(evidence: dict, protocol_map: dict) -> Optional[str]:
    """Detect protocol_id from evidence text using keyword matching"""
    text = f"{evidence.get('event', '')} {evidence.get('description', '')} {evidence.get('category', '')}"
    
    # Check for explicit protocol mentions
    for keyword, protocol_name in PROTOCOL_KEYWORDS.items():
        if keyword in text:
            if protocol_name in protocol_map:
                return protocol_map[protocol_name]
    
    # Category-based mapping
    category = evidence.get("category", "")
    if category == "Infrastructure":
        # Default to Lightning Network for infrastructure if Lightning mentioned
        if "Lightning" in text or "lightning" in text:
            return protocol_map.get("Lightning Network")
    
    return None

def map_event_type(evidence: dict) -> str:
    """Map evidence category/tags to event_type"""
    category = evidence.get("category", "").lower()
    event = evidence.get("event", "").lower()
    
    if "launch" in event or "launches" in event:
        return "launch"
    elif "integration" in event or "integrates" in event:
        return "integration"
    elif category == "infrastructure":
        return "launch"
    elif category == "protocol":
        return "release"
    else:
        return "signal"

def map_impact_score(evidence: dict) -> int:
    """Determine impact score based on priority/category"""
    category = evidence.get("category", "")
    event = evidence.get("event", "")
    
    # High priority categories
    high_priority = ["Infrastructure", "Protocol", "Mainstream"]
    if category in high_priority:
        return 7
    
    # High priority keywords
    if any(kw in event for kw in ["Launches", "Releases", "Surge", "Milestone", "Names AI Agent"]):
        return 7
    
    return 5

def insert_signal(cursor, signal: dict) -> bool:
    """Insert a signal into the database"""
    try:
        cursor.execute("""
            INSERT INTO signals (protocol_id, timestamp, event_type, title, description, impact_score, source_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            signal.get("protocol_id"),
            signal["timestamp"],
            signal["event_type"],
            signal["title"],
            signal.get("description"),
            signal["impact_score"],
            signal.get("source_url")
        ))
        return True
    except Exception as e:
        print(f"  DB Error: {e}")
        return False

def main():
    # Load evidence data
    with open(EVIDENCE_FILE, "r") as f:
        evidence_data = json.load(f)
    
    print(f"Loaded {len(evidence_data)} evidence entries")
    
    # Get protocol mapping
    protocol_name_to_id = get_protocols()
    print(f"Found {len(protocol_name_to_id)} protocols: {list(protocol_name_to_id.keys())}")
    
    # Connect to database
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Process each evidence entry
    inserted = 0
    failed = 0
    
    for evidence in evidence_data:
        date_str = evidence.get("date", datetime.now().strftime("%Y-%m-%d"))
        
        # Detect protocol
        protocol_id = detect_protocol_id(evidence, protocol_name_to_id)
        
        # Create signal
        signal = {
            "protocol_id": protocol_id,
            "timestamp": f"{date_str}T00:00:00",
            "event_type": map_event_type(evidence),
            "title": evidence.get("event", "Untitled Signal"),
            "description": evidence.get("description", ""),
            "impact_score": map_impact_score(evidence),
            "source_url": evidence.get("source")
        }
        
        # Insert into DB
        if insert_signal(cursor, signal):
            inserted += 1
            protocol_info = protocol_id[:8] if protocol_id else 'None'
            print(f"✓ Inserted: {signal['title'][:60]}... (protocol: {protocol_info}...)")
        else:
            failed += 1
            print(f"✗ Failed: {signal['title'][:50]}...")
    
    # Commit and close
    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"\n{'='*60}")
    print(f"SEED COMPLETE")
    print(f"{'='*60}")
    print(f"Total evidence entries: {len(evidence_data)}")
    print(f"Successfully inserted: {inserted}")
    print(f"Failed: {failed}")

if __name__ == "__main__":
    main()
