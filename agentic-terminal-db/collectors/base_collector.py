#!/usr/bin/env python3
"""
Base collector class for Agentic Terminal data ingestion.
Handles DB connection, logging, and standardized metric writes.
"""

import psycopg2
import psycopg2.extras
from datetime import datetime
import os

DB_URL = "postgresql://agentic_terminal:at_secure_2026@localhost/agentic_terminal_db"

class BaseCollector:
    def __init__(self, source_name):
        self.source_name = source_name
        self.conn = None
        self.cursor = None
        self.rows_inserted = 0
        self.errors = []
        
    def connect(self):
        """Establish database connection."""
        self.conn = psycopg2.connect(DB_URL)
        self.cursor = self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
    def close(self):
        """Close database connection."""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
            
    def log_ingestion(self, status, duration_ms):
        """Log the ingestion run."""
        self.cursor.execute("""
            INSERT INTO ingestion_logs (source, status, rows_inserted, errors, duration_ms)
            VALUES (%s, %s, %s, %s, %s)
        """, (self.source_name, status, self.rows_inserted, 
              '\n'.join(self.errors) if self.errors else None, duration_ms))
        self.conn.commit()
        
    def get_protocol_id(self, protocol_name):
        """Get protocol UUID by name."""
        self.cursor.execute(
            "SELECT id FROM protocols WHERE name = %s",
            (protocol_name,)
        )
        result = self.cursor.fetchone()
        return result['id'] if result else None
        
    def insert_metric(self, protocol_id, metric_name, timestamp, value, unit=None, source=None, source_url=None):
        """Insert a metric record."""
        try:
            self.cursor.execute("""
                INSERT INTO metrics (protocol_id, metric_name, timestamp, value, unit, source, source_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (protocol_id, metric_name, timestamp, value, unit, source, source_url))
            self.conn.commit()
            self.rows_inserted += 1
            return True
        except Exception as e:
            self.errors.append(f"Error inserting metric {metric_name}: {str(e)}")
            return False
            
    def insert_signal(self, protocol_id, timestamp, event_type, title, description=None, 
                      impact_score=None, source_url=None):
        """Insert a signal record."""
        try:
            self.cursor.execute("""
                INSERT INTO signals (protocol_id, timestamp, event_type, title, description, impact_score, source_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (protocol_id, timestamp, event_type, title, description, impact_score, source_url))
            self.conn.commit()
            self.rows_inserted += 1
            return True
        except Exception as e:
            self.errors.append(f"Error inserting signal {title}: {str(e)}")
            return False
