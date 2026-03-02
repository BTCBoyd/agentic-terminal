#!/usr/bin/env python3
"""Download files from Google Drive shared folder"""
import os
import re
import json
import requests

# Folder ID from the shared link
FOLDER_ID = "1V_eZ6_G6IM2Ah7vMWmjOihpUL6SII8-F"
OUTPUT_DIR = "/home/futurebit/.openclaw/workspace/arcadiab-video/assets"

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Get folder contents via Google Drive API (no auth needed for public shares)
url = f"https://drive.google.com/drive/folders/{FOLDER_ID}"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

print(f"Fetching folder contents from {url}...")
response = requests.get(url, headers=headers)
print(f"Status: {response.status_code}")

# Parse for file IDs and names
# Look for data-id attributes in the HTML
file_pattern = r'data-id="([a-zA-Z0-9_-]+)"[^>]*>\s*<[^>]*>\s*<[^>]*>([^<]+)</span>'
matches = re.findall(file_pattern, response.text)

print(f"Found {len(matches)} potential files")
for file_id, filename in matches[:10]:
    print(f"  - {filename}: {file_id}")

# Alternative: Look for JSON data in the page
if "_DRIVE_ivd" in response.text:
    print("Found Drive initialization data")
    
print("\nAttempting direct download approach...")

# For publicly shared files, we can use the export/download URL
# Pattern: https://drive.google.com/uc?export=download&id=FILE_ID

# Based on the video files we saw, let's construct the download URLs
# We need to extract the actual file IDs from the page

# Try to find the file list in the page's JavaScript
import re

# Look for file entries in the data
file_entries = re.findall(r'"([a-zA-Z0-9_-]{25,})"[^}]*"name"\s*:\s*"([^"]+\.mp4|[^"]+\.mp3|[^"]+\.jpg)"', response.text)
print(f"\nFound {len(file_entries)} media files via JSON pattern")
for file_id, name in file_entries:
    print(f"  {name}: {file_id}")
