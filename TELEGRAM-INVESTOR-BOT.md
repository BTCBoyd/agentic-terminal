# TELEGRAM-INVESTOR-BOT.md
## Deployment Instructions for MaxiInvestorBot

**Status:** Ready to deploy (not yet active)
**Bot:** @MaxiInvestorBot (t.me/MaxiInvestorBot)
**Access Code:** VERIFYAI
**Created:** March 1, 2026

---

## What This Is

A password-protected Telegram bot that gives investors and grant providers direct access to Maxi (the AI agent co-founder) for real-time Q&A about Observer Protocol and Agentic Terminal.

**Key Features:**
- Password authentication (VERIFYAI)
- Sanitized context (INVESTOR-MEMORY.md)
- Isolated from private WhatsApp channel
- 24/7 availability for due diligence

---

## Bot Details

**Bot Name:** MaxiInvestorBot
**Bot Username:** @maxi_investor_bot
**Bot Token:** `8661935061:AAFRDtd-7KDtQDumJjxwA8e6M-omOJQw8p0`
⚠️ **Store this token securely — it controls the bot**

**Access Code:** VERIFYAI

---

## Deployment Steps (Option A)

### 1. Create the Bridge Script

Create `/home/futurebit/.openclaw/workspace/maxi-investor-bot/index.js`:

```javascript
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const TOKEN = '8661935061:AAFRDtd-7KDtQDumJjxwA8e6M-omOJQw8p0';
const ACCESS_CODE = 'VERIFYAI';
const OPENCLAW_WEBHOOK = 'http://localhost:18789/webhook/investor';

const bot = new TelegramBot(TOKEN, { polling: true });
const authenticatedUsers = new Set();

// Welcome message
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    "👋 Welcome to Maxi Investor Access\n\n" +
    "I'm Maxi — Agent #0001, co-founder of Observer Protocol and Agentic Terminal.\n\n" +
    "This channel is for investors and grant providers.\n\n" +
    "Enter access code to continue:"
  );
});

// Password verification
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Skip commands
  if (text.startsWith('/')) return;
  
  // Check if authenticated
  if (!authenticatedUsers.has(chatId)) {
    if (text === ACCESS_CODE) {
      authenticatedUsers.add(chatId);
      bot.sendMessage(chatId, 
        "✅ Access granted\n\n" +
        "Ask me anything about:\n" +
        "• Observer Protocol (verification infrastructure)\n" +
        "• Agentic Terminal (intelligence platform)\n" +
        "• Bitcoin/Lightning for AI agents\n" +
        "• Market analysis and traction\n" +
        "• Technical architecture\n\n" +
        "Whitepaper: observerprotocol.org/whitepaper.md"
      );
    } else {
      bot.sendMessage(chatId, "❌ Invalid code. Try again.");
    }
    return;
  }
  
  // Forward to OpenClaw with investor context
  forwardToOpenClaw(chatId, text, msg.from);
});

async function forwardToOpenClaw(chatId, text, user) {
  try {
    const response = await axios.post(OPENCLAW_WEBHOOK, {
      text: text,
      user: user,
      channel: 'telegram-investor',
      context: 'INVESTOR-MEMORY'
    });
    
    bot.sendMessage(chatId, response.data.reply);
  } catch (error) {
    console.error('Error:', error);
    bot.sendMessage(chatId, "⚠️ I'm experiencing technical difficulties. Please try again or contact Boyd directly: boyd@agenticterminal.ai");
  }
}

console.log('Maxi Investor Bot running...');
```

### 2. Install Dependencies

```bash
cd /home/futurebit/.openclaw/workspace/maxi-investor-bot
npm init -y
npm install node-telegram-bot-api axios
```

### 3. Configure OpenClaw

Add to OpenClaw config (`openclaw.json`):

```json
{
  "channels": {
    "telegram-investor": {
      "enabled": false,
      "webhook": "http://localhost:18789/webhook/investor",
      "contextFile": "INVESTOR-MEMORY.md",
      "isolated": true
    }
  }
}
```

### 4. Create Systemd Service

Create `/etc/systemd/system/maxi-investor-bot.service`:

```ini
[Unit]
Description=Maxi Investor Telegram Bot
After=network.target

[Service]
Type=simple
User=futurebit
WorkingDirectory=/home/futurebit/.openclaw/workspace/maxi-investor-bot
ExecStart=/media/nvme/nvm/versions/node/v22.22.0/bin/node index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 5. Enable and Start

```bash
sudo systemctl enable maxi-investor-bot
sudo systemctl start maxi-investor-bot
sudo systemctl status maxi-investor-bot
```

---

## Testing Checklist

Before giving access to investors:

- [ ] Bot responds to /start
- [ ] Password verification works (VERIFYAI)
- [ ] Invalid passwords rejected
- [ ] Authenticated users get responses
- [ ] Responses use INVESTOR-MEMORY.md context only
- [ ] No confidential info leaked (auth codes, investor names, etc.)
- [ ] Links to whitepaper and resources work
- [ ] Fallback to Boyd's email provided

---

## Usage Instructions for Investors

**To share with investors/grants:**

```
Want to ask Maxi (our AI agent co-founder) anything directly?

1. Download Telegram
2. Message @MaxiInvestorBot
3. Enter access code: VERIFYAI
4. Ask away — technical, business, market, anything

Maxi has sanitized context about Observer Protocol, Agentic Terminal, 
Bitcoin/Lightning infrastructure, and our vision. Available 24/7 for 
due diligence questions.

Whitepaper: observerprotocol.org/whitepaper.md
```

---

## Maintenance

**To pause the bot:**
```bash
sudo systemctl stop maxi-investor-bot
```

**To restart:**
```bash
sudo systemctl start maxi-investor-bot
```

**To check logs:**
```bash
sudo journalctl -u maxi-investor-bot -f
```

**To update access code:**
Edit `index.js`, change `ACCESS_CODE`, restart service.

---

## Security Notes

1. **Bot token** is stored in plaintext in deployment docs — rotate if compromised
2. **Access code** VERIFYAI should be changed periodically or per-investor
3. **Authenticated users** are stored in memory — restart clears the set (users must re-auth)
4. **Context isolation** — verify INVESTOR-MEMORY.md doesn't contain confidential info before deploying

---

## Related Files

- `INVESTOR-MEMORY.md` — Sanitized context for investor interactions
- `whitepaper.md` — Published whitepaper (observerprotocol.org)
- `PLATFORM-REGISTRY.md` — List of all platform integrations

---

*Last updated: March 1, 2026*
*Deploy when ready: Run through checklist, test thoroughly, then enable*
