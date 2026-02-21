#!/usr/bin/env python3
"""
GitHub collector - fetches stars/forks for key agent payment repos
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from base_collector import BaseCollector
import requests
from datetime import datetime
import time

# Map GitHub repos to protocols and their metric names
REPO_MAP = {
    ("coinbase", "x402"): {
        "protocol": "x402",
        "stars_metric": "x402_github_stars",
        "forks_metric": "x402_github_forks",
    },
    ("lightninglabs", "aperture"): {
        "protocol": "L402",
        "stars_metric": "l402_github_stars",
        "forks_metric": "l402_github_forks",
    },
    ("arkade-os", "arkd"): {
        "protocol": "Ark Protocol",
        "stars_metric": "ark_github_stars",
        "forks_metric": "ark_github_forks",
    },
}

def fetch_github_repo(owner, repo):
    """Fetch repository data from GitHub API."""
    url = f"https://api.github.com/repos/{owner}/{repo}"
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.json()

def main():
    start_time = time.time()
    collector = BaseCollector("github_repos")
    
    try:
        collector.connect()
        timestamp = datetime.utcnow()
        
        for (owner, repo), config in REPO_MAP.items():
            try:
                # Fetch repo data
                data = fetch_github_repo(owner, repo)
                
                # Get protocol ID
                protocol_id = collector.get_protocol_id(config["protocol"])
                if not protocol_id:
                    collector.errors.append(f"Protocol not found: {config['protocol']}")
                    continue
                
                # Insert stars metric
                if data.get("stargazers_count") is not None:
                    collector.insert_metric(
                        protocol_id=protocol_id,
                        metric_name=config["stars_metric"],
                        timestamp=timestamp,
                        value=float(data["stargazers_count"]),
                        unit="stars",
                        source="github.com",
                        source_url=data.get("html_url", f"https://github.com/{owner}/{repo}")
                    )
                
                # Insert forks metric
                if data.get("forks_count") is not None:
                    collector.insert_metric(
                        protocol_id=protocol_id,
                        metric_name=config["forks_metric"],
                        timestamp=timestamp,
                        value=float(data["forks_count"]),
                        unit="forks",
                        source="github.com",
                        source_url=data.get("html_url", f"https://github.com/{owner}/{repo}")
                    )
                    
                # Insert open issues count as additional metric
                if data.get("open_issues_count") is not None:
                    metric_name = config["stars_metric"].replace("_stars", "_open_issues")
                    collector.insert_metric(
                        protocol_id=protocol_id,
                        metric_name=metric_name,
                        timestamp=timestamp,
                        value=float(data["open_issues_count"]),
                        unit="issues",
                        source="github.com",
                        source_url=data.get("html_url", f"https://github.com/{owner}/{repo}")
                    )
                    
            except Exception as e:
                collector.errors.append(f"Error fetching {owner}/{repo}: {str(e)}")
                continue
        
        duration_ms = int((time.time() - start_time) * 1000)
        status = "success" if not collector.errors else "partial"
        collector.log_ingestion(status, duration_ms)
        
        print(f"[{datetime.utcnow().isoformat()}] GitHub collector: {collector.rows_inserted} metrics inserted, status={status}")
        if collector.errors:
            print(f"  Errors: {len(collector.errors)}")
        
    except Exception as e:
        collector.errors.append(f"Fatal error: {str(e)}")
        duration_ms = int((time.time() - start_time) * 1000)
        collector.log_ingestion("failed", duration_ms)
        print(f"[{datetime.utcnow().isoformat()}] GitHub collector failed: {str(e)}")
        
    finally:
        collector.close()

if __name__ == "__main__":
    main()
