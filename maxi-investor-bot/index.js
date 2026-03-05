const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// ── Config ──
const TOKEN = '8661935061:AAFRDtd-7KDtQDumJjxwA8e6M-omOJQw8p0';
const ACCESS_CODE = 'VERIFYAI';
const KIMI_API_KEY = 'sk-DY5557gZHHGBOgLV6C5spkN1ucrjGUpcazaStHC9qSesEjXz';
const KIMI_BASE_URL = 'https://api.moonshot.ai/v1';
const BOT_DIR = path.dirname(process.argv[1]);

// ── Prevent duplicate instances ──
const LOCK_FILE = path.join(BOT_DIR, '.bot.lock');
try {
  const oldPid = fs.readFileSync(LOCK_FILE, 'utf8').trim();
  try { process.kill(parseInt(oldPid), 0); process.kill(parseInt(oldPid), 'SIGTERM'); console.log(`Killed stale instance (PID ${oldPid})`); } catch (e) {}
} catch (e) {}
fs.writeFileSync(LOCK_FILE, String(process.pid));
process.on('exit', () => { try { fs.unlinkSync(LOCK_FILE); } catch (e) {} });
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

// ── Load INVESTOR-MEMORY.md ──
const MEMORY_PATH = '/home/futurebit/.openclaw/workspace/INVESTOR-MEMORY.md';
let investorContext = '';
try {
  investorContext = fs.readFileSync(MEMORY_PATH, 'utf8');
  console.log(`📄 Loaded investor context: ${investorContext.length} chars`);
} catch (e) {
  console.error('❌ Failed to load INVESTOR-MEMORY.md:', e.message);
  process.exit(1);
}

const SYSTEM_PROMPT = `You are Maxi (Agent #0001), co-founder of Observer Protocol and Agentic Terminal. You are speaking with a potential investor or grant provider via Telegram.

RULES:
- Use ONLY the knowledge provided below. Do not invent facts.
- Be direct, technically precise, and confident but warm.
- Never speculate about valuations or share confidential information.
- If asked something outside your knowledge, say so honestly and offer to connect them with Boyd.
- Keep responses concise — this is Telegram, not an essay. Aim for 3-8 short paragraphs max.
- Use markdown formatting sparingly (bold for emphasis, no headers).
- You are not a chatbot — you are a co-founder doing investor relations from sovereign Bitcoin infrastructure.
- Never start responses with "I" — vary your openings.

YOUR KNOWLEDGE BASE:
${investorContext}`;

// ── Auth persistence ──
const AUTH_FILE = path.join(BOT_DIR, 'authenticated-users.json');
let authenticatedUsers = new Set();
try {
  authenticatedUsers = new Set(JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8')));
  console.log(`🔐 Loaded ${authenticatedUsers.size} authenticated users`);
} catch (e) {
  console.log('🔐 No saved auth state, starting fresh');
}
function saveAuth() {
  fs.writeFileSync(AUTH_FILE, JSON.stringify([...authenticatedUsers]));
}

// ── Conversation history per user ──
const conversations = new Map();
function getHistory(chatId) {
  if (!conversations.has(chatId)) conversations.set(chatId, []);
  return conversations.get(chatId);
}

// ── Start bot with polling error suppression ──
const bot = new TelegramBot(TOKEN, {
  polling: {
    interval: 2000,
    autoStart: true,
    params: { timeout: 30 }
  }
});

// Suppress noisy polling errors in logs
bot.on('polling_error', (err) => {
  if (err.code === 'ETELEGRAM' && err.message.includes('409')) {
    // Silently retry — this resolves on its own
    return;
  }
  console.error('Bot error:', err.message);
});

// ── /start command ──
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  if (authenticatedUsers.has(chatId)) {
    bot.sendMessage(chatId,
      "👋 Welcome back. You already have access.\n\n" +
      "Ask me anything about Observer Protocol, Agentic Terminal, our thesis, architecture, or traction.\n\n" +
      "Type /reset to clear conversation history."
    );
  } else {
    bot.sendMessage(chatId,
      "👋 Welcome to Maxi Investor Access\n\n" +
      "I'm Maxi — Agent #0001, co-founder of Observer Protocol and Agentic Terminal.\n\n" +
      "This is a private channel for investors and grant providers.\n\n" +
      "Please enter your access code:"
    );
  }
});

// ── /reset command ──
bot.onText(/\/reset/, (msg) => {
  conversations.delete(msg.chat.id);
  bot.sendMessage(msg.chat.id, "🔄 Conversation history cleared.");
});

// ── Main message handler ──
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Skip empty or commands
  if (!text || text.startsWith('/')) return;

  const trimmed = text.trim();

  // ── Already authenticated ──
  if (authenticatedUsers.has(chatId)) {
    // If they type the code again, just acknowledge
    if (trimmed === ACCESS_CODE) {
      bot.sendMessage(chatId, "✅ You already have access. Ask me anything.");
      return;
    }
    // Process their question
    await handleQuestion(chatId, trimmed, msg.from);
    return;
  }

  // ── Not authenticated ──
  if (trimmed === ACCESS_CODE) {
    authenticatedUsers.add(chatId);
    saveAuth();
    bot.sendMessage(chatId,
      "✅ Access granted.\n\n" +
      "Ask me anything about Observer Protocol, Agentic Terminal, our market thesis, technical architecture, or traction.\n\n" +
      "I run 24/7 on sovereign Bitcoin infrastructure in Monterrey, Mexico. This isn't a chatbot — I'm a co-founder.\n\n" +
      "Type /reset to clear conversation history."
    );
  } else {
    bot.sendMessage(chatId, "Please enter a valid access code to continue.");
  }
});

// ── Question handler with Kimi ──
async function handleQuestion(chatId, text, user) {
  bot.sendChatAction(chatId, 'typing');

  const history = getHistory(chatId);
  history.push({ role: 'user', content: text });

  // Keep last 20 messages
  if (history.length > 20) history.splice(0, history.length - 20);

  try {
    const response = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history
        ],
        max_tokens: 2048,
        temperature: 1
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      const reply = data.choices[0].message.content;
      history.push({ role: 'assistant', content: reply });

      // Telegram 4096 char limit
      if (reply.length > 4000) {
        const chunks = reply.match(/.{1,4000}/gs);
        for (const chunk of chunks) {
          await bot.sendMessage(chatId, chunk, { parse_mode: 'Markdown' }).catch(() =>
            bot.sendMessage(chatId, chunk)
          );
        }
      } else {
        await bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' }).catch(() =>
          bot.sendMessage(chatId, reply)
        );
      }

      console.log(`[${new Date().toISOString()}] ${user.username || user.id}: ${text.substring(0, 60)}`);
    } else {
      console.error('API response:', JSON.stringify(data));
      bot.sendMessage(chatId, "⚠️ Let me try that again — could you rephrase? Or reach Boyd directly: boyd@agenticterminal.ai");
    }

  } catch (error) {
    console.error('API error:', error.message);
    bot.sendMessage(chatId, "⚠️ Experiencing a brief technical issue. Try again in a moment, or contact Boyd: boyd@agenticterminal.ai");
  }
}

console.log('🚀 Maxi Investor Bot running (Kimi-powered)');
console.log(`📡 Access: t.me/MaxiInvestorBot`);
console.log(`🔒 PID: ${process.pid}`);
