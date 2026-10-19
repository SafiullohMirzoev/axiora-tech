// ── Chess Map Demo — ЖК «Соҳилӣ» ──────────────────────────────
const FLOORS = 10;
const APTS_PER_FLOOR = 8;
const STATUSES = ['free','free','free','sold','reserve','installment','sold','free'];
const ROOMS    = [1,1,2,2,3,3,4,4];
const AREAS    = {1:[34,40],2:[52,60],3:[70,80],4:[92,108]};
const PRICES   = {1:[45,55],2:[70,85],3:[95,115],4:[130,160]};

function rnd(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

// Generate apartment data
const CHESS_DATA = [];
for(let floor = FLOORS; floor >= 1; floor--) {
  const row = [];
  for(let pos = 0; pos < APTS_PER_FLOOR; pos++) {
    const rooms  = ROOMS[pos];
    const area   = rnd(AREAS[rooms][0], AREAS[rooms][1]);
    const price  = rnd(PRICES[rooms][0], PRICES[rooms][1]) * 1000;
    const pool   = floor >= 8
      ? ['free','free','reserve','installment']
      : ['free','free','sold','sold','reserve','installment'];
    const status = pool[Math.floor(Math.random()*pool.length)];
    const num    = `${floor < 10 ? '0'+floor : floor}${pos+1}`;
    row.push({ num, floor, rooms, area, price, status });
  }
  CHESS_DATA.push(row);
}

let chessFilterActive = 'all';

function renderChess() {
  const container = document.getElementById('chess-floors');
  if (!container) return;
  container.innerHTML = '';

  CHESS_DATA.forEach(row => {
    const floor = row[0].floor;
    const rowEl = document.createElement('div');
    rowEl.className = 'chess-floor';

    const fnEl = document.createElement('div');
    fnEl.className = 'chess-floor-num';
    fnEl.textContent = floor;
    rowEl.appendChild(fnEl);

    row.forEach(apt => {
      const el = document.createElement('div');
      el.className = `chess-apt ${apt.status}`;
      if (chessFilterActive !== 'all' && apt.status !== chessFilterActive) {
        el.classList.add('dimmed');
      }
      el.innerHTML = `<span class="ca-num">${apt.num}</span><span class="ca-r">${apt.rooms}к</span>`;
      el.title = `${apt.num} · ${apt.rooms}к · ${apt.area}м²`;
      el.onclick = () => {
        window._selectedApt = apt;
        showAptInfo(apt);
        document.querySelectorAll('.chess-apt').forEach(e => e.style.outline = 'none');
        el.style.outline = '2px solid var(--accent)';
      };
      rowEl.appendChild(el);
    });
    container.appendChild(rowEl);
  });
}

function showAptInfo(apt) {
  const info = document.getElementById('chess-info');
  if (!info) return;
  const STATUS_LABELS = {
    free:        t('chess.statusFree'),
    sold:        t('chess.statusSold'),
    reserve:     t('chess.statusReserve'),
    installment: t('chess.statusInst'),
  };
  const statusClass = apt.status;
  info.innerHTML = `
    <div class="ci-apt-num">№${apt.num}</div>
    <div class="ci-row"><span>${t('chess.floor')}</span><span>${apt.floor}</span></div>
    <div class="ci-row"><span>${t('chess.rooms')}</span><span>${apt.rooms} ${t('chess.rooms')}</span></div>
    <div class="ci-row"><span>${t('chess.area')}</span><span>${apt.area} м²</span></div>
    <div class="ci-row"><span>${t('chess.price')}</span><span>${apt.price.toLocaleString('ru')} $</span></div>
    <div class="ci-row"><span>${t('chess.status')}</span><span><span class="ci-status ${statusClass}">${STATUS_LABELS[apt.status]||apt.status}</span></span></div>
    ${apt.status === 'free' || apt.status === 'reserve'
      ? `<a href="#contact" class="ci-btn">${t('chess.requestBtn')}</a>`
      : ''}
  `;
}

function chessFilter(filter, btn) {
  chessFilterActive = filter;
  document.querySelectorAll('.cf-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderChess();
}

// Init after DOM ready
document.addEventListener('DOMContentLoaded', renderChess);
