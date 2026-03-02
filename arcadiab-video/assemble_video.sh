#!/bin/bash
# ArcadiaB "El Peso Se Derrite" Video Assembly Pipeline
# Created: February 26, 2026

set -e

# Configuration
OUTPUT_DIR="/home/futurebit/.openclaw/workspace/arcadiab-video/output"
ASSETS_DIR="/home/futurebit/.openclaw/workspace/arcadiab-video/assets"
OVERLAYS_DIR="/home/futurebit/.openclaw/workspace/arcadiab-video/text-overlays"
FINAL_OUTPUT="$OUTPUT_DIR/arcadiab_el_peso_se_derrite_final.mp4"

# Video settings
RESOLUTION="1080x1920"  # 9:16 vertical for TikTok/Reels/Shorts
FPS=30
VIDEO_CODEC="libx264"
AUDIO_CODEC="aac"
CRF=23  # Quality (lower = better, 18-28 range)

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "🎬 ArcadiaB Video Assembly Pipeline"
echo "=================================="
echo ""

# Check for required assets
echo "📁 Checking assets..."

if [ ! -f "$ASSETS_DIR/Roman Soto - Iridescence.mp3" ]; then
    echo "❌ Music file not found: $ASSETS_DIR/Roman Soto - Iridescence.mp3"
    echo "   Please add the music file to the assets directory"
    exit 1
fi

# Count video files
VIDEO_COUNT=$(ls -1 "$ASSETS_DIR"/*.mp4 2>/dev/null | wc -l)
if [ "$VIDEO_COUNT" -eq 0 ]; then
    echo "❌ No video files found in $ASSETS_DIR"
    echo "   Please add video clips to the assets directory"
    exit 1
fi

echo "✅ Found $VIDEO_COUNT video clips"
echo "✅ Found music track"
echo ""

# Step 1: Prepare individual clips with consistent format
echo "🔄 Step 1: Standardizing video clips..."
CLIP_LIST="$OUTPUT_DIR/clip_list.txt"
> "$CLIP_LIST"

CLIP_NUM=0
for video in "$ASSETS_DIR"/*.mp4; do
    if [ -f "$video" ]; then
        CLIP_NUM=$((CLIP_NUM + 1))
        BASENAME=$(basename "$video" .mp4)
        OUTPUT_CLIP="$OUTPUT_DIR/clip_$(printf "%02d" $CLIP_NUM).mp4"
        
        echo "   Processing: $BASENAME"
        
        # Standardize: 9:16 aspect ratio, 30fps, same resolution
        ffmpeg -y -i "$video" \
            -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black" \
            -r $FPS \
            -c:v $VIDEO_CODEC -crf $CRF -preset fast \
            -c:a $AUDIO_CODEC -b:a 128k \
            -movflags +faststart \
            "$OUTPUT_CLIP" 2>/dev/null
        
        echo "file 'clip_$(printf "%02d" $CLIP_NUM).mp4'" >> "$CLIP_LIST"
    fi
done

echo "✅ Standardized $CLIP_NUM clips"
echo ""

# Step 2: Concatenate clips
echo "🔄 Step 2: Concatenating video clips..."
CONCAT_VIDEO="$OUTPUT_DIR/concatenated.mp4"
ffmpeg -y -f concat -safe 0 -i "$CLIP_LIST" \
    -c copy "$CONCAT_VIDEO" 2>/dev/null

echo "✅ Clips concatenated"
echo ""

# Step 3: Add text overlays at specific timestamps
echo "🔄 Step 3: Adding text overlays..."

# Create overlay filter complex
# Timeline: 0-3s: 2004, 3-6s: 2008, 6-9s: 2012, 9-12s: 2016, 12-15s: 2020, 15-18s: 2024, 18-21s: 2026, 21-24s: question, 24-27s: tagline

OVERLAY_VIDEO="$OUTPUT_DIR/with_overlays.mp4"

ffmpeg -y -i "$CONCAT_VIDEO" \
    -i "$OVERLAYS_DIR/2004.png" \
    -i "$OVERLAYS_DIR/2008.png" \
    -i "$OVERLAYS_DIR/2012.png" \
    -i "$OVERLAYS_DIR/2016.png" \
    -i "$OVERLAYS_DIR/2020.png" \
    -i "$OVERLAYS_DIR/2024.png" \
    -i "$OVERLAYS_DIR/2026.png" \
    -i "$OVERLAYS_DIR/question.png" \
    -i "$OVERLAYS_DIR/tagline.png" \
    -filter_complex "
        [0:v][1:v] overlay=0:0:enable='between(t,0,3)' [v1];
        [v1][2:v] overlay=0:0:enable='between(t,3,6)' [v2];
        [v2][3:v] overlay=0:0:enable='between(t,6,9)' [v3];
        [v3][4:v] overlay=0:0:enable='between(t,9,12)' [v4];
        [v4][5:v] overlay=0:0:enable='between(t,12,15)' [v5];
        [v5][6:v] overlay=0:0:enable='between(t,15,18)' [v6];
        [v6][7:v] overlay=0:0:enable='between(t,18,21)' [v7];
        [v7][8:v] overlay=0:0:enable='between(t,21,24)' [v8];
        [v8][9:v] overlay=0:0:enable='between(t,24,27)' [v9]
    " \
    -c:v $VIDEO_CODEC -crf $CRF -preset fast \
    -an "$OVERLAY_VIDEO" 2>/dev/null

echo "✅ Text overlays added"
echo ""

# Step 4: Add music and end card
echo "🔄 Step 4: Adding music and end card..."

# Get video duration
VIDEO_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OVERLAY_VIDEO" | cut -d. -f1)
echo "   Video duration: ${VIDEO_DURATION}s"

# Create end card video (3 seconds)
END_CARD_VIDEO="$OUTPUT_DIR/end_card_segment.mp4"
ffmpeg -y -loop 1 -i "/home/futurebit/.openclaw/workspace/arcadiab-video/end-card.png" \
    -t 3 \
    -vf "scale=1080:1920,format=yuv420p" \
    -r $FPS \
    -c:v $VIDEO_CODEC -crf $CRF \
    "$END_CARD_VIDEO" 2>/dev/null

# Concatenate main video with end card
FINAL_LIST="$OUTPUT_DIR/final_list.txt"
echo "file 'with_overlays.mp4'" > "$FINAL_LIST"
echo "file 'end_card_segment.mp4'" >> "$FINAL_LIST"

VIDEO_WITH_END="$OUTPUT_DIR/video_with_end.mp4"
ffmpeg -y -f concat -safe 0 -i "$FINAL_LIST" -c copy "$VIDEO_WITH_END" 2>/dev/null

# Add background music
MUSIC_FILE="$ASSETS_DIR/Roman Soto - Iridescence.mp3"
FINAL_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$VIDEO_WITH_END" | cut -d. -f1)

echo "   Final video duration: ${FINAL_DURATION}s"
echo "   Adding background music..."

ffmpeg -y -i "$VIDEO_WITH_END" -i "$MUSIC_FILE" \
    -filter_complex "
        [1:a] afade=t=out:st=$(($FINAL_DURATION-2)):d=2,volume=0.3 [music];
        [0:a][music] amix=inputs=2:duration=first:dropout_transition=2 [audio]
    " \
    -map 0:v -map "[audio]" \
    -c:v copy -c:a $AUDIO_CODEC -b:a 192k \
    -shortest "$FINAL_OUTPUT" 2>/dev/null

echo "✅ Music added"
echo ""

# Step 5: Generate thumbnail
echo "🔄 Step 5: Generating thumbnail..."
ffmpeg -y -i "$FINAL_OUTPUT" -ss 00:00:01 -vframes 1 "$OUTPUT_DIR/thumbnail.jpg" 2>/dev/null

echo "✅ Thumbnail created"
echo ""

# Cleanup intermediate files
rm -f "$OUTPUT_DIR"/clip_*.mp4 "$CLIP_LIST" "$CONCAT_VIDEO" "$OVERLAY_VIDEO" "$END_CARD_VIDEO" "$VIDEO_WITH_END" "$FINAL_LIST"

# Final stats
echo "🎉 VIDEO ASSEMBLY COMPLETE!"
echo "=========================="
echo ""
echo "Output file: $FINAL_OUTPUT"
echo "File size: $(du -h "$FINAL_OUTPUT" | cut -f1)"
echo "Duration: $(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$FINAL_OUTPUT" | cut -d. -f1)s"
echo "Resolution: $RESOLUTION"
echo "Thumbnail: $OUTPUT_DIR/thumbnail.jpg"
echo ""
echo "Ready for upload to: TikTok, Instagram Reels, YouTube Shorts"
