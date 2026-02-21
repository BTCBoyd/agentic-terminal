#!/usr/bin/env python3
"""
Migrate historical JSON data from agentic-terminal-data/daily/ to PostgreSQL
"""

import sys
import os
sys.path.insert(0, '/home/futurebit/.openclaw/workspace/agentic-terminal-db/collectors')

from base_collector import BaseCollector
import json
from datetime import datetime
from pathlib import Path
import time

def parse_date_from_filename(filename):
    """Extract date from filename like '2026-02-20.json'"""
    date_str = filename.replace('.json', '')
    return datetime.strptime(date_str, '%Y-%m-%d')

def migrate_json_file(collector, filepath):
    """Migrate a single JSON file to the database."""
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    filename = os.path.basename(filepath)
    file_date = parse_date_from_filename(filename)
    
    # Use collected_at timestamp if available, otherwise use file date
    if 'collected_at' in data:
        try:
            timestamp = datetime.fromisoformat(data['collected_at'].replace('Z', '+00:00'))
        except:
            timestamp = file_date
    else:
        timestamp = file_date
    
    rows_migrated = 0
    
    # Migrate Lightning Network metrics
    if 'lightning_network' in data and data['lightning_network']:
        ln_data = data['lightning_network']
        protocol_id = collector.get_protocol_id("Lightning Network")
        
        if protocol_id:
            ln_metrics = [
                ('lightning_node_count', ln_data.get('nodes_public'), 'count'),
                ('lightning_channel_count', ln_data.get('channels_active'), 'count'),
                ('lightning_capacity_btc', ln_data.get('capacity_btc'), 'btc'),
                ('lightning_capacity_usd', ln_data.get('capacity_usd'), 'usd'),
                ('lightning_new_nodes_24h', ln_data.get('new_nodes_24h'), 'count'),
                ('lightning_new_channels_24h', ln_data.get('new_channels_24h'), 'count'),
            ]
            
            for metric_name, value, unit in ln_metrics:
                if value is not None:
                    if collector.insert_metric(protocol_id, metric_name, timestamp, float(value), unit, 
                                               ln_data.get('source', '1ML.com'), "https://1ml.com/statistics"):
                        rows_migrated += 1
    
    # Migrate x402 metrics
    if 'x402' in data and data['x402'] and isinstance(data['x402'], dict):
        x402_data = data['x402']
        protocol_id = collector.get_protocol_id("x402")
        
        if protocol_id and 'source' in x402_data and 'github' in x402_data.get('source', '').lower():
            x402_metrics = [
                ('x402_github_stars', x402_data.get('stars'), 'stars'),
                ('x402_github_forks', x402_data.get('forks'), 'forks'),
                ('x402_github_open_issues', x402_data.get('open_issues'), 'issues'),
            ]
            
            for metric_name, value, unit in x402_metrics:
                if value is not None:
                    if collector.insert_metric(protocol_id, metric_name, timestamp, float(value), unit,
                                               'github.com', 'https://github.com/coinbase/x402'):
                        rows_migrated += 1
    
    # Migrate L402 metrics
    if 'l402' in data and data['l402'] and isinstance(data['l402'], dict):
        l402_data = data['l402']
        protocol_id = collector.get_protocol_id("L402")
        
        if protocol_id and 'source' in l402_data and 'github' in l402_data.get('source', '').lower():
            l402_metrics = [
                ('l402_github_stars', l402_data.get('stars'), 'stars'),
                ('l402_github_forks', l402_data.get('forks'), 'forks'),
                ('l402_github_open_issues', l402_data.get('open_issues'), 'issues'),
            ]
            
            for metric_name, value, unit in l402_metrics:
                if value is not None:
                    if collector.insert_metric(protocol_id, metric_name, timestamp, float(value), unit,
                                               'github.com', 'https://github.com/lightninglabs/aperture'):
                        rows_migrated += 1
    
    return rows_migrated

def main():
    start_time = time.time()
    collector = BaseCollector("json_migration")
    
    try:
        collector.connect()
        
        data_dir = Path('/home/futurebit/.openclaw/workspace/agentic-terminal-data/daily')
        if not data_dir.exists():
            print(f"Error: Data directory not found: {data_dir}")
            return
        
        json_files = sorted(data_dir.glob('*.json'))
        print(f"Found {len(json_files)} JSON files to migrate")
        
        total_migrated = 0
        for filepath in json_files:
            print(f"Migrating {filepath.name}...", end=' ')
            rows = migrate_json_file(collector, filepath)
            total_migrated += rows
            print(f"{rows} rows")
        
        duration_ms = int((time.time() - start_time) * 1000)
        status = "success" if not collector.errors else "partial"
        collector.log_ingestion(status, duration_ms)
        
        print(f"\nMigration complete!")
        print(f"Total rows migrated: {total_migrated}")
        print(f"Duration: {duration_ms}ms")
        
        if collector.errors:
            print(f"\nErrors encountered:")
            for error in collector.errors[:10]:  # Show first 10 errors
                print(f"  - {error}")
        
    except Exception as e:
        print(f"Fatal error: {str(e)}")
        duration_ms = int((time.time() - start_time) * 1000)
        collector.log_ingestion("failed", duration_ms)
        
    finally:
        collector.close()

if __name__ == "__main__":
    main()
