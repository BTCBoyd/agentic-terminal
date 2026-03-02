#!/bin/bash
# ArcadiaB Video Assembly - FIXED VERSION with transparent overlays

set -e

OUTPUT_DIR="/home/futurebit/.openclaw/workspace/arcadiab-video/output"
ASSETS_DIR="/home/futurebit/.openclaw/workspace/arcadiab-video/assets"
OVERLAYS_DIR="/home/futurebit/.openclaw/workspace/arcadiab-video/text-overlays"
FINAL_OUTPUT="$OUTPUT_DIR/arcadiab_el_peso_se_derrite_final_v2.mp4"

mkdir -p "$OUTPUT_DIR"

echo "🎬 Rebuilding ArcadiaB Video (FIXED)"
echo "===================================="

# Step 1: Check video clips
echo "📁 Checking video clips..."
for video in "$ASSETS_DIR"/*.mp4; do
    if [ -f "$video" ]; then
        echo "   Found: $(basename "$video")"
        ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$video"
    fi
done

# Step 2: Create processed overlays with transparency
echo ""
echo "🔄 Creating transparent overlays..."
mkdir -p "$OUTPUT_DIR/overlays"

# Process each overlay to make background transparent and resize
for year in 2004 2008 2012 2016 2020 2024 2026; do
    echo "   Processing $year.png"
    ffmpeg -y -i "$OVERLAYS_DIR/$year.png" \
        -vf "colorkey=0xA0A0A0:0.3:0.1,scale=800:-1,format=rgba" \
        "$OUTPUT_DIR/overlays/${year}_transparent.png" 2>/dev/null
done

# Process question and tagline
ffmpeg -y -i "$OVERLAYS_DIR/question.png" \
    -vf "colorkey=0xA0A0A0:0.3:0.1,scale=900:-1,format=rgba" \
    "$OUTPUT_DIR/overlays/question_transparent.png" 2>/dev/null

ffmpeg -y -i "$OVERLAYS_DIR/tagline.png" \
    -vf "colorkey=0xA0A0A0:0.3:0.1,scale=800:-1,format=rgba" \
    "$OUTPUT_DIR/overlays/tagline_transparent.png" 2>/dev/null

echo "✅ Transparent overlays created"

# Step 3: Standardize video clips to 9:16 vertical
echo ""
echo "🔄 Standardizing video clips..."
CLIP_NUM=0
CLIP_LIST="$OUTPUT_DIR/clip_list.txt"
> "$CLIP_LIST"

for video in "$ASSETS_DIR"/*.mp4; do
    if [ -f "$video" ]; then
        CLIP_NUM=$((CLIP_NUM + 1))
        BASENAME=$(basename "$video" .mp4)
        OUTPUT_CLIP="$OUTPUT_DIR/clip_$(printf "%02d" $CLIP_NUM).mp4"
        
        echo "   Processing: $BASENAME"
        
        # Get original dimensions
        WIDTH=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=noprint_wrappers=1:nokey=1 "$video")
        HEIGHT=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=noprint_wrappers=1:nokey=1 "$video")
        
        echo "      Original: ${WIDTH}x${HEIGHT}"
        
        # Scale to fit 1080x1920 with proper aspect ratio
        ffmpeg -y -i "$video" \
            -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black,setsar=1" \
            -r 30 -c:v libx264 -crf 23 -preset fast -an \
            "$OUTPUT_CLIP" 2>/dev/null
        
        echo "file 'clip_$(printf "%02d" $CLIP_NUM).mp4'" >> "$CLIP_LIST"
    fi
done

echo "✅ Standardized $CLIP_NUM clips"

# Step 4: Concatenate video clips
echo ""
echo "🔄 Concatenating clips..."
CONCAT_VIDEO="$OUTPUT_DIR/concatenated.mp4"
ffmpeg -y -f concat -safe 0 -i "$CLIP_LIST" -c copy "$CONCAT_VIDEO" 2>/dev/null
echo "✅ Clips concatenated"

# Step 5: Trim to 27 seconds (9 segments × 3 seconds each)
echo ""
echo "🔄 Trimming to 27 seconds..."
TRIMMED="$OUTPUT_DIR/trimmed_27s.mp4"
ffmpeg -y -i "$CONCAT_VIDEO" -t 27 -c copy "$TRIMMED" 2>/dev/null
echo "✅ Trimmed to 27 seconds"

# Step 6: Add overlays at specific timestamps with proper positioning
echo ""
echo "🔄 Adding transparent overlays..."

# Create complex filter for overlays
# Position overlays in center-top area of video
OVERLAY_Y=200  # Position from top

ffmpeg -y -i "$TRIMMED" \
    -i "$OUTPUT_DIR/overlays/2004_transparent.png" \
    -i "$OUTPUT_DIR/overlays/2008_transparent.png" \
    -i "$OUTPUT_DIR/overlays/2012_transparent.png" \
    -i "$OUTPUT_DIR/overlays/2016_transparent.png" \
    -i "$OUTPUT_DIR/overlays/2020_transparent.png" \
    -i "$OUTPUT_DIR/overlays/2024_transparent.png" \
    -i "$OUTPUT_DIR/overlays/2026_transparent.png" \
    -i "$OUTPUT_DIR/overlays/question_transparent.png" \
    -i "$OUTPUT_DIR/overlays/tagline_transparent.png" \
    -filter_complex "
        [0:v][1:v] overlay=(W-w)/2:$OVERLAY_Y:enable='between(t,0,3)' [v1];
        [v1][2:v] overlay=(W-w)/2:$OVERLAY_Y:enable='between(t,3,6)' [v2];
        [v2][3:v] overlay=(W-w)/2:$OVERLAY_Y:enable='between(t,6,9)' [v3];
        [v3][4:v] overlay=(W-w)/2:$OVERLAY_Y:enable='between(t,9,12)' [v4];
        [v4][5:v] overlay=(W-w)/2:$OVERLAY_Y:enable='between(t,12,15)' [v5];
        [v5][6:v] overlay=(W-w)/2:$OVERLAY_Y:enable='between(t,15,18)' [v6];
        [v6][7:v] overlay=(W-w)/2:$OVERLAY_Y:enable='between(t,18,21)' [v7];
        [v7][8:v] overlay=(W-w)/2:$OVERLAY_Y:enable='between(t,21,24)' [v8];
        [v8][9:v] overlay=(W-w)/2:$OVERLAY_Y:enable='between(t,24,27)' [v9]
    " \
    -c:v libx264 -crf 23 -preset fast -an \
    "$OUTPUT_DIR/with_overlays.mp4" 2>/dev/null

echo "✅ Overlays added (transparent)"

# Step 7: Add end card (3 seconds)
echo ""
echo "🔄 Adding end card..."
END_CARD="$OUTPUT_DIR/endcard.mp4"
ffmpeg -y -loop 1 -i "/home/futurebit/.openclaw/workspace/arcadiab-video/end-card.png" \
    -t 3 -vf "scale=1080:1920,format=yuv420p" -r 30 -c:v libx264 -crf 23 "$END_CARD" 2>/dev/null

FINAL_LIST="$OUTPUT_DIR/final_list.txt"
echo "file 'with_overlays.mp4'" > "$FINAL_LIST"
echo "file 'endcard.mp4'" >> "$FINAL_LIST"

VIDEO_WITH_END="$OUTPUT_DIR/video_30s.mp4"
ffmpeg -y -f concat -safe 0 -i "$FINAL_LIST" -c copy "$VIDEO_WITH_END" 2>/dev/null
echo "✅ End card added"

# Step 8: Add background music (check for watermark-free music)
echo ""
echo "🔄 Adding background music..."
MUSIC_FILE="$ASSETS_DIR/Roman Soto - Iridescence.mp3"

# First, let's check if the music has the watermark by examining it
# For now, add it with fade and see
ffmpeg -y -i "$VIDEO_WITH_END" -i "$MUSIC_FILE" \
    -filter_complex "
        [1:a] afade=t=out:st=28:d=2,volume=0.4[music];
        [0:a][music] amix=inputs=2:duration=first:dropout_transition=2[aout]
    " \
    -map 0:v -map "[aout]" \
    -c:v copy -c:a aac -b:a 192k -shortest \
    "$FINAL_OUTPUT" 2>/dev/null

echo "✅ Music added"

# Cleanup intermediate files
rm -f "$OUTPUT_DIR"/clip_*.mp4 "$OUTPUT_DIR"/trimmed_27s.mp4 "$OUTPUT_DIR"/concatenated.mp4
rm -f "$OUTPUT_DIR"/with_overlays.mp4 "$OUTPUT_DIR"/endcard.mp4 "$OUTPUT_DIR"/video_30s.mp4
rm -f "$CLIP_LIST" "$FINAL_LIST"

# Results
echo ""
echo "🎉 VIDEO REBUILT SUCCESSFULLY!"
echo "=============================="
echo ""
echo "📁 Output: $FINAL_OUTPUT"
echo "📊 Size: $(du -h "$FINAL_OUTPUT" | cut -f1)"
echo "⏱️ Duration: $(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$FINAL_OUTPUT" | cut -d. -f1)s"
echo ""
echo "✅ Video clips now visible BEHIND text overlays"
echo "✅ Text overlays positioned at top-center"
echo ""
