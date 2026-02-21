#!/bin/bash
# Run all data collectors for Agentic Terminal

set -e

COLLECTORS_DIR="/home/futurebit/.openclaw/workspace/agentic-terminal-db/collectors"
LOG_FILE="/home/futurebit/.openclaw/workspace/agentic-terminal-db/ingestion.log"

# Use virtual environment Python
PYTHON="/home/futurebit/.openclaw/workspace/agentic-terminal-db/venv/bin/python3"

echo "[$(date -Iseconds)] Starting collection run..." >> "$LOG_FILE"

# Run Lightning collector
echo "[$(date -Iseconds)] Running lightning_collector.py..." >> "$LOG_FILE"
$PYTHON "$COLLECTORS_DIR/lightning_collector.py" >> "$LOG_FILE" 2>&1 || true

# Run GitHub collector
echo "[$(date -Iseconds)] Running github_collector.py..." >> "$LOG_FILE"
$PYTHON "$COLLECTORS_DIR/github_collector.py" >> "$LOG_FILE" 2>&1 || true

echo "[$(date -Iseconds)] Collection run complete" >> "$LOG_FILE"
echo "---" >> "$LOG_FILE"
