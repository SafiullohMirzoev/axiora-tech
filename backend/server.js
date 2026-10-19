require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');
const path      = require('path');

const app = express();

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rate limit: 5 form submissions per 10 min per IP
const formLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: 'Слишком много заявок. Попробуйте через 10 минут.' }
});

// ── Telegram sender ────────────────────────────────────────────
async function sendToTelegram(text) {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || token === 'YOUR_BOT_TOKEN_HERE') {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN не настроен в .env');
    return { ok: false, reason: 'token_not_set' };
  }

  const { default: fetch } = await import('node-fetch');
  const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  });
  return resp.json();
}

// ── POST /api/contact ──────────────────────────────────────────
app.post('/api/contact', formLimiter, async (req, res) => {
  const { name, phone, company, service, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'name и phone обязательны' });
  }

  const serviceLabels = {
    silk_crm:     'Silk CRM',
    telegram_bot: 'Telegram-бот',
    website:      'Сайт для ЖК',
    custom_crm:   'Индивидуальная CRM',
    other:        'Другое',
  };

  const text = `
🏢 *Новая заявка — Axiora Tech*
━━━━━━━━━━━━━━━━
👤 *Имя:* ${name}
📞 *Телефон:* ${phone}
🏗 *Компания/ЖК:* ${company || '—'}
💼 *Интересует:* ${serviceLabels[service] || service || '—'}
📝 *Сообщение:*
${message || '—'}
━━━━━━━━━━━━━━━━
🌐 binosozcrm.tj | IP: ${req.ip}
  `.trim();

  // Log to console as backup
  console.log('\n📩 Новая заявка:', { name, phone, company, service });

  try {
    const result = await sendToTelegram(text);
    if (result.ok) {
      res.json({ success: true, message: 'Заявка отправлена в Telegram' });
    } else {
      console.warn('Telegram error:', result);
      // Still return success to user — log the lead
      res.json({ success: true, message: 'Заявка получена' });
    }
  } catch (err) {
    console.error('Contact form error:', err);
    res.json({ success: true, message: 'Заявка получена' });
  }
});

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Axiora Tech', time: new Date().toISOString() });
});

// ── SPA fallback ───────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Start ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Axiora Tech Backend запущен`);
  console.log(`📡 http://localhost:${PORT}`);
  console.log(`\n⚙️  Настройте .env:`);
  console.log(`   TELEGRAM_BOT_TOKEN=ваш_токен`);
  console.log(`   TELEGRAM_CHAT_ID=ваш_chat_id\n`);
});
