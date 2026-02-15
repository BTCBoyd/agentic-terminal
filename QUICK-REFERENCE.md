# PDF Sharing - Quick Reference Card

## 📝 THE 3-STEP PROCESS

```bash
# 1. Write in markdown
nano my-document.md

# 2. Convert to HTML (1 second)
./md2doc.sh my-document.md my-document.html

# 3. Send via WhatsApp (use message tool)
```

## 🚀 ONE-LINE AUTOMATION

```bash
./send-pdf-to-boyd.sh my-document.md "Your message here"
```

## 📱 WHATSAPP SENDING

```
message tool parameters:
  action: "send"
  channel: "whatsapp"
  target: "Boyd" or "+1234567890"
  filePath: "document.html"
  caption: "Optional message"
```

## 🎯 FOR YOUR BUSINESS PLAN

```bash
cd ~/.openclaw/workspace
nano business-plan.md        # Write it
./md2doc.sh business-plan.md # Convert it (1 sec)
# Then send via WhatsApp message tool
```

## 📚 FILES LOCATION

All scripts: `~/.openclaw/workspace/`
- `md2doc.sh` - Converter
- `send-pdf-to-boyd.sh` - Auto-sender
- `PDF_SHARING_GUIDE.md` - Full guide
- `sample-business-plan.md` - Example

## ⏱️ TIME

Write → Convert → Send
5min → 1sec → 1sec

**Total: ~90 seconds** (after writing)

---

Save this file! Use it every time you need to share documents.
