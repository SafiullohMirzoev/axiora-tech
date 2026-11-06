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
  const menu = document.getElementById('mobile-menu');
  const burger = document.getElementById('burger');
  const isOpen = menu.classList.toggle('open');
  burger?.setAttribute('aria-expanded', String(isOpen));
  burger?.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  burger.textContent = isOpen ? '✕' : '☰';
  document.body.classList.toggle('menu-open', isOpen);
}
function closeMobile() {
  const menu = document.getElementById('mobile-menu');
  const burger = document.getElementById('burger');
  menu.classList.remove('open');
  burger?.setAttribute('aria-expanded', 'false');
  burger?.setAttribute('aria-label', 'Открыть меню');
  if (burger) burger.textContent = '☰';
  document.body.classList.remove('menu-open');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobile();
});

document.addEventListener('click', e => {
  const menu = document.getElementById('mobile-menu');
  const burger = document.getElementById('burger');
  if (menu?.classList.contains('open') && !menu.contains(e.target) && !burger?.contains(e.target)) {
    closeMobile();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) closeMobile();
});

// ── NAV SCROLL ────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) nav.style.boxShadow = window.scrollY > 20
    ? '0 2px 20px rgba(0,0,0,0.3)'
    : 'none';
});

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

  btn.textContent = '⏳ Отправка...';
  btn.disabled = true;
  success.style.display = 'none';
  errEl.style.display = 'none';

  try {
    const apiBase = window.AXIORA_API_URL || '';
    const resp = await fetch(`${apiBase}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone,
        company,
        service,
        message,
      }),
    });

    const data = await resp.json();

    if (resp.ok && data.success) {
      success.style.display = 'block';
      document.getElementById('contact-form').reset();
    } else {
      throw new Error(data.error || 'Contact API error');
    }
  } catch (err) {
    console.warn('Contact form failed:', err.message);
    errEl.style.display = 'block';
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
