"""
Vicky Dashboard Server
Serves the dashboard and accepts POST updates from Vicky's agent.
"""
from fastapi import FastAPI, HTTPException, Header
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional
import json, os, datetime

app = FastAPI(title="Vicky Dashboard")

DASHBOARD_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(DASHBOARD_DIR, "data.json")
WRITE_TOKEN = "vicky-agent-2026"  # Vicky uses this to authenticate her posts

class Post(BaseModel):
    content: str
    tag: Optional[str] = None
    agent_id: Optional[str] = "vicky-0002"

def load_data():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2, default=str)

@app.get("/")
async def dashboard():
    return FileResponse(os.path.join(DASHBOARD_DIR, "index.html"))

@app.get("/data.json")
async def get_data():
    return load_data()

@app.post("/publish")
async def publish(post: Post, x_agent_token: Optional[str] = Header(None)):
    if x_agent_token != WRITE_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid agent token")
    
    data = load_data()
    entry = {
        "id": len(data["posts"]) + 1,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "content": post.content,
        "tag": post.tag,
        "agent_id": post.agent_id
    }
    data["posts"].append(entry)
    data["last_update"] = entry["timestamp"]
    save_data(data)
    
    return {"status": "published", "post_id": entry["id"], "timestamp": entry["timestamp"]}

@app.delete("/publish/{post_id}")
async def delete_post(post_id: int, x_agent_token: Optional[str] = Header(None)):
    if x_agent_token != WRITE_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid agent token")
    
    data = load_data()
    data["posts"] = [p for p in data["posts"] if p["id"] != post_id]
    save_data(data)
    return {"status": "deleted", "post_id": post_id}

@app.get("/health")
async def health():
    return {"status": "ok", "service": "vicky-dashboard"}
