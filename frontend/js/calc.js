let calcMonths = 1;
const PRICE_PER_BLOCK = 5;
const DISCOUNTS = { 1: 0, 3: 0, 6: 0.10, 12: 0.20 };

function changeBlocks(delta) {
  const inp = document.getElementById('calc-blocks');
  if (!inp) return;
  let val = parseInt(inp.value) + delta;
  if (val < 1) val = 1;
  if (val > 100) val = 100;
  inp.value = val;
  calcPrice();
}

function setMonths(m, btn) {
  calcMonths = m;
  document.querySelectorAll('.cm-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  calcPrice();
}

function calcPrice() {
  const blocks = parseInt(document.getElementById('calc-blocks')?.value) || 1;
  const discount = DISCOUNTS[calcMonths] || 0;
  const monthly = blocks * PRICE_PER_BLOCK;
  const discounted = monthly * (1 - discount);
  const total = discounted * calcMonths;
  const saved = (monthly - discounted) * calcMonths;

  const priceEl    = document.getElementById('calc-price');
  const totalEl    = document.getElementById('calc-total');
  const econEl     = document.getElementById('calc-economy');
  const breakEl    = document.getElementById('calc-breakdown');
  if (!priceEl) return;

  priceEl.textContent = `$${discounted.toFixed(discounted % 1 === 0 ? 0 : 2)}`;
  totalEl.textContent = calcMonths > 1
    ? `За ${calcMonths} мес: $${total.toFixed(total % 1 === 0 ? 0 : 2)}`
    : '';

  if (discount > 0) {
    econEl.style.display = 'block';
    econEl.textContent = `Экономия: $${saved.toFixed(0)} (${(discount*100).toFixed(0)}% скидка)`;
  } else {
    econEl.style.display = 'none';
  }

  breakEl.innerHTML = `
    <div class="calc-row"><span>Блоков:</span><strong>${blocks}</strong></div>
    <div class="calc-row"><span>Цена/блок:</span><strong>$${PRICE_PER_BLOCK}/мес</strong></div>
    <div class="calc-row"><span>Модулей:</span><strong>6 (все включены)</strong></div>
    ${discount > 0 ? `<div class="calc-row"><span>Скидка:</span><strong style="color:var(--green)">−${(discount*100).toFixed(0)}%</strong></div>` : ''}
    <div class="calc-row" style="border-top:1px solid var(--border);padding-top:8px;margin-top:4px"><span>Период:</span><strong>${calcMonths} мес</strong></div>
  `;
}

document.addEventListener('DOMContentLoaded', calcPrice);
