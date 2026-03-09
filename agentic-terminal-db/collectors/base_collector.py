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
        
    def get_last_metric_value(self, protocol_id, metric_name):
        """Get the most recent value for a metric to validate new data."""
        try:
            self.cursor.execute("""
                SELECT value, timestamp 
                FROM metrics 
                WHERE protocol_id = %s AND metric_name = %s
                ORDER BY timestamp DESC 
                LIMIT 1
            """, (protocol_id, metric_name))
            result = self.cursor.fetchone()
            return result['value'] if result else None
        except Exception:
            return None
    
    def validate_metric_value(self, metric_name, new_value, last_value):
        """
        Validate a new metric value against data integrity rules.
        
        Rules:
        1. Never insert zero/null/undefined if last known value was non-zero
        2. Flag >50% variance for human review (log warning but still insert)
        3. Reject negative values for counts/stars
        
        Returns: (is_valid, should_insert, warning_msg)
        """
        # Rule 1: Never overwrite non-zero with zero/null/undefined
        if new_value is None or new_value == 0 or new_value == 'undefined':
            if last_value is not None and last_value != 0:
                warning = f"DATA INTEGRITY: Rejecting {metric_name}={new_value} (would overwrite last known value {last_value})"
                self.errors.append(warning)
                return False, False, warning
        
        # Rule 2: Check for >50% variance (flag but still insert)
        variance_warning = None
        if last_value is not None and last_value != 0:
            variance_pct = abs(new_value - last_value) / last_value
            if variance_pct > 0.5:
                variance_warning = f"DATA INTEGRITY WARNING: {metric_name} changed {variance_pct*100:.1f}% ({last_value} -> {new_value})"
        
        # Rule 3: Reject negative values for count-based metrics
        count_metrics = ['stars', 'forks', 'nodes', 'channels', 'issues', 'agents']
        if any(m in metric_name.lower() for m in count_metrics):
            if new_value is not None and new_value < 0:
                warning = f"DATA INTEGRITY: Rejecting negative {metric_name}={new_value}"
                self.errors.append(warning)
                return False, False, warning
        
        return True, True, variance_warning
    
    def insert_metric(self, protocol_id, metric_name, timestamp, value, unit=None, source=None, source_url=None):
        """Insert a metric record with data integrity validation."""
        try:
            # Get last known value for validation
            last_value = self.get_last_metric_value(protocol_id, metric_name)
            
            # Validate the new value
            is_valid, should_insert, warning = self.validate_metric_value(
                metric_name, value, last_value
            )
            
            if warning:
                print(f"[DATA INTEGRITY] {warning}")
            
            if not should_insert:
                print(f"[DATA INTEGRITY] Skipped insert for {metric_name}")
                return False
            
            # Proceed with insert
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
