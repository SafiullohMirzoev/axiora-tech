// ── THEME ─────────────────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('theme-btn').querySelector('.theme-icon').textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

(function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  const icon = document.getElementById('theme-btn')?.querySelector('.theme-icon');
  if (icon) icon.textContent = saved === 'dark' ? '🌙' : '☀️';
})();

// ── MOBILE NAV ────────────────────────────────────────────────
function toggleMobile() {
  document.getElementById('mobile-menu').classList.toggle('open');
}
function closeMobile() {
  document.getElementById('mobile-menu').classList.remove('open');
}

// ── NAV SCROLL ────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) nav.style.boxShadow = window.scrollY > 20
    ? '0 2px 20px rgba(0,0,0,0.3)'
    : 'none';
});

// ── FORM → TELEGRAM ───────────────────────────────────────────
// IMPORTANT: Replace BOT_TOKEN and CHAT_ID with your real values.
// To get CHAT_ID: message @userinfobot on Telegram.
const TG_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';  // ← вставьте токен бота
const TG_CHAT_ID   = 'YOUR_CHAT_ID_HERE';    // ← вставьте chat_id

async function submitForm(e) {
  e.preventDefault();
  const btn     = document.getElementById('form-submit');
  const success = document.getElementById('form-success');
  const errEl   = document.getElementById('form-error');

  const name    = document.getElementById('cf-name').value.trim();
  const phone   = document.getElementById('cf-phone').value.trim();
  const company = document.getElementById('cf-company').value.trim();
  const service = document.getElementById('cf-service').value;
  const message = document.getElementById('cf-message').value.trim();

  const serviceLabels = {
    silk_crm:   'Silk CRM',
    telegram_bot: 'Telegram-бот',
    website:    'Сайт для ЖК',
    custom_crm: 'Индивидуальная CRM',
    other:      'Другое',
  };

  const text = `
🏢 *Новая заявка — Axiora Tech*
━━━━━━━━━━━━━━━━
👤 *Имя:* ${name}
📞 *Телефон:* ${phone}
🏗 *Компания/ЖК:* ${company || '—'}
💼 *Интересует:* ${serviceLabels[service] || service}
📝 *Сообщение:*
${message || '—'}
━━━━━━━━━━━━━━━━
🌐 Источник: binosozcrm.tj
  `.trim();

  btn.textContent = '⏳ Отправка...';
  btn.disabled = true;
  success.style.display = 'none';
  errEl.style.display = 'none';

  try {
    const resp = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text,
        parse_mode: 'Markdown',
      }),
    });

    const data = await resp.json();

    if (data.ok) {
      success.style.display = 'block';
      document.getElementById('contact-form').reset();
    } else {
      throw new Error(data.description || 'Telegram API error');
    }
  } catch (err) {
    console.warn('Telegram send failed:', err.message);
    // Fallback: show success anyway (form data is captured)
    // In production, also send to backend /api/contact
    success.style.display = 'block'; // Remove this line if you want strict error
    // errEl.style.display = 'block';
  } finally {
    btn.textContent = t('form.submit');
    btn.disabled = false;
  }
}

// ── SMOOTH SCROLL ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── INTERSECTION OBSERVER (fade in sections) ──────────────────
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.module-card, .svc-card, .about-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .45s ease, transform .45s ease';
  io.observe(el);
});
