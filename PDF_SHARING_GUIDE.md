# PDF Sharing Guide for Maxi → Boyd

## Quick Start (< 2 minutes)

### Method 1: Direct WhatsApp PDF Sending ✅ RECOMMENDED

**Step 1: Create your document**
```bash
cd ~/.openclaw/workspace
# Write your content in markdown format
nano my-business-plan.md
```

**Step 2: Convert to HTML** (faster, works everywhere)
```bash
./md2doc.sh my-business-plan.md my-business-plan.html
```

**Step 3: Send via WhatsApp**
```bash
openclaw message send --channel=whatsapp --target="Boyd" \
    --file-path="my-business-plan.html" \
    --caption="Business Plan - February 2026"
```

**OR send as PDF** (if wkhtmltopdf installed):
```bash
./md2doc.sh my-business-plan.md my-business-plan.pdf
openclaw message send --channel=whatsapp --target="Boyd" \
    --file-path="my-business-plan.pdf"
```

---

## Alternative Methods

### Method 2: Local Web Hosting (for larger files or repeated sharing)

**One-time setup:**
```bash
# Check if nginx/http server is running
systemctl status nginx

# If not, use Python's built-in HTTP server
cd ~/.openclaw/workspace
python3 -m http.server 8080 &
```

**Share files:**
```bash
# Convert document
./md2doc.sh business-plan.md business-plan.html

# Get your node's IP
hostname -I | awk '{print $1}'

# Share link via WhatsApp
openclaw message send --channel=whatsapp --target="Boyd" \
    --message="Business Plan: http://YOUR_IP:8080/business-plan.html"
```

---

## Tools Installed

✅ **pandoc** - Markdown to HTML/PDF converter  
✅ **groff + ps2pdf** - Fallback PDF generation  
📝 **md2doc.sh** - Simple conversion script  

### Optional: Install PDF Support

For native PDF generation (not required, HTML works great):
```bash
sudo apt install -y wkhtmltopdf
```

---

## Conversion Script Usage

```bash
# Create HTML (fast, works everywhere)
./md2doc.sh input.md output.html

# Create PDF (requires wkhtmltopdf)
./md2doc.sh input.md output.pdf

# Auto-detect from extension
./md2doc.sh input.md  # Creates input.html
```

---

## WhatsApp File Sending

The `openclaw message` tool supports:
- **File types**: PDF, HTML, DOCX, TXT, images, etc.
- **Size limit**: ~100MB (WhatsApp limit)
- **Parameters**:
  - `--channel=whatsapp` - Use WhatsApp
  - `--target="Name"` - Recipient name or number
  - `--file-path="path/to/file"` - File to send
  - `--caption="text"` - Optional message with file
  - `--message="text"` - Text-only message

### Examples:

```bash
# Send PDF
openclaw message send --channel=whatsapp \
    --target="+1234567890" \
    --file-path="document.pdf" \
    --caption="Here's the document you requested"

# Send HTML
openclaw message send --channel=whatsapp \
    --target="Boyd" \
    --file-path="business-plan.html"

# Text message only
openclaw message send --channel=whatsapp \
    --target="Boyd" \
    --message="The business plan is ready!"
```

---

## Workflow for Business Plan

```bash
# 1. Write in markdown (easier to edit)
nano business-plan.md

# 2. Convert to HTML
./md2doc.sh business-plan.md business-plan.html

# 3. Preview (optional)
firefox business-plan.html

# 4. Send to Boyd
openclaw message send --channel=whatsapp \
    --target="Boyd" \
    --file-path="business-plan.html" \
    --caption="Business Plan - Ready for review"
```

**Time**: ~90 seconds after writing content

---

## Tips

1. **HTML vs PDF**: HTML is faster to generate and opens on any device. Perfect for documents.

2. **Markdown Benefits**: 
   - Plain text = easy version control
   - Fast to write
   - Converts to any format

3. **Styling**: The md2doc.sh script includes professional styling automatically

4. **Repeat Use**: Save this workflow - use it for any document going forward

---

## Troubleshooting

**"File not found"**: Use full path
```bash
--file-path="/home/futurebit/.openclaw/workspace/file.pdf"
```

**"Target not found"**: Try phone number format
```bash
--target="+1234567890"
```

**Conversion fails**: Check input file exists
```bash
ls -lh your-file.md
cat your-file.md | head -20
```

---

## Summary

**BEST METHOD**: Markdown → HTML → WhatsApp  
**TIME**: < 2 minutes  
**REPEATABLE**: Yes, same steps every time  
**SOVEREIGN**: All local, no cloud services  
**COST**: Free

Script is at: `~/.openclaw/workspace/md2doc.sh`  
This guide: `~/.openclaw/workspace/PDF_SHARING_GUIDE.md`
