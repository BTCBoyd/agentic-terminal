#!/usr/bin/env python3
"""
Lightning Network collector - fetches data from 1ML.com API
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from base_collector import BaseCollector
import requests
from datetime import datetime
import time

def main():
    start_time = time.time()
    collector = BaseCollector("1ml_lightning")
    
    try:
        collector.connect()
        
        # Fetch data from 1ML
        url = "https://1ml.com/statistics?json=true"
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        # Get Lightning Network protocol ID
        protocol_id = collector.get_protocol_id("Lightning Network")
        if not protocol_id:
            collector.errors.append("Lightning Network protocol not found in database")
            collector.log_ingestion("failed", int((time.time() - start_time) * 1000))
            collector.close()
            return
            
        timestamp = datetime.utcnow()
        
        # Insert metrics
        metrics = [
            ("lightning_node_count", data.get("numberofnodes"), "count"),
            ("lightning_channel_count", data.get("numberofchannels"), "count"),
            ("lightning_capacity_btc", data.get("networkcapacity") / 100000000 if data.get("networkcapacity") else None, "btc"),
            ("lightning_capacity_usd", data.get("networkcapacity_usd"), "usd"),
            ("lightning_new_nodes_24h", data.get("newnodes"), "count"),
            ("lightning_new_channels_24h", data.get("newchannels"), "count"),
        ]
        
        for metric_name, value, unit in metrics:
            if value is not None:
                collector.insert_metric(
                    protocol_id=protocol_id,
                    metric_name=metric_name,
                    timestamp=timestamp,
                    value=float(value),
                    unit=unit,
                    source="1ml.com",
                    source_url="https://1ml.com/statistics"
                )
                
        # Also insert L402 metrics if available in data
        l402_protocol_id = collector.get_protocol_id("L402")
        if l402_protocol_id:
            # L402 doesn't have direct metrics from 1ML, but we track it as a Lightning-based protocol
            pass
        
        duration_ms = int((time.time() - start_time) * 1000)
        status = "success" if not collector.errors else "partial"
        collector.log_ingestion(status, duration_ms)
        
        print(f"[{datetime.utcnow().isoformat()}] Lightning collector: {collector.rows_inserted} metrics inserted, status={status}")
        
    except Exception as e:
        collector.errors.append(f"Fatal error: {str(e)}")
        duration_ms = int((time.time() - start_time) * 1000)
        collector.log_ingestion("failed", duration_ms)
        print(f"[{datetime.utcnow().isoformat()}] Lightning collector failed: {str(e)}")
        
    finally:
        collector.close()

if __name__ == "__main__":
    main()
