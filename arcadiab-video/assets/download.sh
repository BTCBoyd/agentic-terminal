#!/bin/bash
# Download script for Google Drive shared folder contents

FOLDER_ID="1V_eZ6_G6IM2Ah7vMWmjOihpUL6SII8-F"

# Install gdown if not present
if ! command -v gdown &> /dev/null; then
    echo "Installing gdown..."
    pip3 install gdown --break-system-packages -q 2>/dev/null || \
    pip3 install gdown -q 2>/dev/null || \
    pip install gdown -q 2>/dev/null
fi

# Download entire folder
echo "Downloading from Google Drive..."
gdown --folder "https://drive.google.com/drive/folders/$FOLDER_ID" -O .

echo "Download complete!"
ls -lh *.mp4 *.mp3 *.jpg 2>/dev/null || echo "No media files found"
