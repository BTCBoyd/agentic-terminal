#!/bin/bash
# ArcadiaB "El Peso Se Derrite" Video Assembly Pipeline - SEQUENTIAL VERSION
# Created: February 26, 2026

set -e

OUTPUT_DIR="/home/futurebit/.openclaw/workspace/arcadiab-video/output"
ASSETS_DIR="/home/futurebit/.openclaw/workspace/arcadiab-video/assets"
OVERLAYS_DIR="/home/futurebit/.openclaw/workspace/arcadiab-video/text-overlays"
FINAL_OUTPUT="$OUTPUT_DIR/arcadiab_el_peso_se_derrite_final.mp4"

mkdir -p "$OUTPUT_DIR"

echo "🎬 ArcadiaB Video Assembly Pipeline"
echo "=================================="
echo ""

echo "📁 Checking assets..."
if [ ! -f "$ASSETS_DIR/Roman Soto - Iridescence.mp3" ]; then
    echo "❌ Music file not found"
    exit 1
fi
VIDEO_COUNT=$(ls -1 "$ASSETS_DIR"/*.mp4 2>/dev/null | wc -l)
echo "✅ Found $VIDEO_COUNT video clips"
echo "✅ Found music track"
echo ""

# Step 1: Standardize clips
echo "🔄 Step 1: Standardizing clips..."
CLIP_LIST="$OUTPUT_DIR/clip_list.txt"
> "$CLIP_LIST"

CLIP_NUM=0
for video in "$ASSETS_DIR"/*.mp4; do
    if [ -f "$video" ]; then
        CLIP_NUM=$((CLIP_NUM + 1))
        OUTPUT_CLIP="$OUTPUT_DIR/clip_$(printf "%02d" $CLIP_NUM).mp4"
        echo "   Clip $CLIP_NUM"
        ffmpeg -y -i "$video" \
            -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black" \
            -r 30 -c:v libx264 -crf 23 -preset fast -an "$OUTPUT_CLIP" 2>/dev/null
        echo "file 'clip_$(printf "%02d" $CLIP_NUM).mp4'" >> "$CLIP_LIST"
    fi
done
echo "✅ Standardized $CLIP_NUM clips"
echo ""

# Step 2: Concatenate
echo "🔄 Step 2: Concatenating..."
CONCAT="$OUTPUT_DIR/concat.mp4"
ffmpeg -y -f concat -safe 0 -i "$CLIP_LIST" -c copy "$CONCAT" 2>/dev/null
echo "✅ Concatenated"
echo ""

# Step 3: Split into segments and add overlays
echo "🔄 Step 3: Processing segments with overlays..."

# Get total duration
TOTAL_DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$CONCAT" | cut -d. -f1)
echo "   Total duration: ${TOTAL_DUR}s"

# Create 3-second segments with overlays
SEGMENT_DUR=3
NUM_SEGMENTS=$((TOTAL_DUR / SEGMENT_DUR))
[ $NUM_SEGMENTS -gt 9 ] && NUM_SEGMENTS=9

echo "   Creating $NUM_SEGMENTS segments..."

SEGMENT_LIST="$OUTPUT_DIR/seg_list.txt"
> "$SEGMENT_LIST"

OVERLAYS=("2004.png" "2008.png" "2012.png" "2016.png" "2020.png" "2024.png" "2026.png" "question.png" "tagline.png")

for i in $(seq 0 $((NUM_SEGMENTS - 1))); do
    START=$((i * SEGMENT_DUR))
    SEG_FILE="$OUTPUT_DIR/seg_$(printf "%02d" $i).mp4"
    OVERLAY="${OVERLAYS[$i]}"
    
    if [ -f "$OVERLAYS_DIR/$OVERLAY" ]; then
        echo "   Segment $i: ${START}s-${SEGMENT_DUR}s + $OVERLAY"
        ffmpeg -y -i "$CONCAT" -i "$OVERLAYS_DIR/$OVERLAY" \
            -ss $START -t $SEGMENT_DUR \
            -filter_complex "[1:v]scale=1080:1920[ol];[0:v][ol]overlay=0:0" \
            -c:v libx264 -crf 23 -preset fast -an "$SEG_FILE" 2>/dev/null
        echo "file 'seg_$(printf "%02d" $i).mp4'" >> "$SEGMENT_LIST"
    fi
done
echo "✅ Segments created"
echo ""

# Step 4: Concatenate segments
echo "🔄 Step 4: Assembling final video..."
WITH_OVERLAYS="$OUTPUT_DIR/with_overlays.mp4"
ffmpeg -y -f concat -safe 0 -i "$SEGMENT_LIST" -c copy "$WITH_OVERLAYS" 2>/dev/null
echo "✅ Overlays assembled"
echo ""

# Step 5: Add end card (3 seconds)
echo "🔄 Step 5: Adding end card..."
END_CARD="$OUTPUT_DIR/endcard.mp4"
ffmpeg -y -loop 1 -i "/home/futurebit/.openclaw/workspace/arcadiab-video/end-card.png" \
    -t 3 -vf "scale=1080:1920,format=yuv420p" -r 30 -c:v libx264 -crf 23 "$END_CARD" 2>/dev/null

FINAL_LIST="$OUTPUT_DIR/final_list.txt"
echo "file 'with_overlays.mp4'" > "$FINAL_LIST"
echo "file 'endcard.mp4'" >> "$FINAL_LIST"

VIDEO_ONLY="$OUTPUT_DIR/video_only.mp4"
ffmpeg -y -f concat -safe 0 -i "$FINAL_LIST" -c copy "$VIDEO_ONLY" 2>/dev/null
echo "✅ End card added"
echo ""

# Step 6: Add music
echo "🔄 Step 6: Adding music..."
FINAL_DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$VIDEO_ONLY" | cut -d. -f1)

echo "   Final duration: ${FINAL_DUR}s"

ffmpeg -y -i "$VIDEO_ONLY" -i "$ASSETS_DIR/Roman Soto - Iridescence.mp3" \
    -filter_complex "[1:a] afade=t=out:st=$(($FINAL_DUR-2)):d=2,volume=0.3[music];[0:a][music]amix=inputs=2:duration=first[aout]" \
    -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k -shortest "$FINAL_OUTPUT" 2>/dev/null

echo "✅ Music added"
echo ""

# Generate thumbnail
ffmpeg -y -i "$FINAL_OUTPUT" -ss 00:00:01 -vframes 1 "$OUTPUT_DIR/thumbnail.jpg" 2>/dev/null

# Cleanup intermediates
rm -f "$OUTPUT_DIR"/clip_*.mp4 "$OUTPUT_DIR"/seg_*.mp4 "$CLIP_LIST" "$SEGMENT_LIST" "$FINAL_LIST"
rm -f "$CONCAT" "$WITH_OVERLAYS" "$END_CARD" "$VIDEO_ONLY"

# Results
echo "🎉 VIDEO ASSEMBLY COMPLETE!"
echo "=========================="
echo ""
echo "📁 Output: $FINAL_OUTPUT"
echo "📊 Size: $(du -h "$FINAL_OUTPUT" | cut -f1)"
echo "⏱️ Duration: ${FINAL_DUR}s"
echo "🖼️ Thumbnail: $OUTPUT_DIR/thumbnail.jpg"
echo ""
echo "✅ Ready for: TikTok, Instagram Reels, YouTube Shorts"
