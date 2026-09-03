const $ = (q, ctx=document) => ctx.querySelector(q);
const $$ = (q, ctx=document) => [...ctx.querySelectorAll(q)];

window.addEventListener('load', () => {
  const loader = $('.page-loader');
  if (loader) setTimeout(() => loader.classList.add('hidden'), 450);
});

const topbar = $('.topbar');
if (topbar) window.addEventListener('scroll', () => topbar.classList.toggle('scrolled', scrollY > 35));

const toggle = $('.nav-toggle');
const nav = $('#site-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  $$('#site-nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

let heroIndex = 0;
const heroSlides = $$('.hero-slides img');
if (heroSlides.length > 1) {
  setInterval(() => {
    heroSlides[heroIndex].classList.remove('active');
    heroIndex = (heroIndex + 1) % heroSlides.length;
    heroSlides[heroIndex].classList.add('active');
  }, 6500);
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, {threshold:.12});
$$('.reveal').forEach(el => observer.observe(el));

const data = window.DEWEES_DATA;
$$('[data-field="eventDate"]').forEach(el => el.textContent = data.event.date);
$$('[data-field="eventLocation"]').forEach(el => el.textContent = data.event.location);

// Countdown to DI XX — July 17, 2027 at 9:00 AM Eastern.
const countdown = $('#event-countdown');
function renderCountdown() {
  if (!countdown) return;
  const target = new Date(data.event.start).getTime();
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  countdown.innerHTML = [
    ['Days', days], ['Hrs', hours], ['Min', minutes], ['Sec', seconds]
  ].map(([label,value]) => `<span><b>${String(value).padStart(2,'0')}</b><small>${label}</small></span>`).join('');
}
renderCountdown();
setInterval(renderCountdown, 1000);

// Simple year timeline: year only in the rail; click to reveal details and, when available, one small verified image.
const rail = $('#year-rail');
let selectedYear = data.years[0];
if (rail) {
  data.years.forEach((y, i) => {
    const b = document.createElement('button');
    b.className = 'year-chip' + (i === 0 ? ' active' : '');
    b.textContent = y.year;
    b.setAttribute('aria-label', `Show ${y.year} Invitational details`);
    b.addEventListener('click', () => selectYear(y, b));
    rail.appendChild(b);
  });
}

function selectYear(y, button) {
  selectedYear = y;
  $$('.year-chip').forEach(x => x.classList.remove('active'));
  if (button) button.classList.add('active');

  const wrap = $('#stage-media-wrap');
  const img = $('#stage-image');
  if (wrap && img) {
    if (y.image) {
      wrap.hidden = false;
      img.hidden = false;
      img.src = y.image;
      img.alt = `${y.annual} — ${y.title}`;
      $('#stage-tag').textContent = y.tag;
      const funFact = $('#fun-fact-btn');
      if (funFact) funFact.hidden = y.year !== 2017;
    } else {
      wrap.hidden = true;
      img.hidden = true;
      img.removeAttribute('src');
      const funFact = $('#fun-fact-btn');
      if (funFact) funFact.hidden = true;
    }
  }
  $('#stage-year').textContent = y.annual;
  $('#stage-title').textContent = y.title;
  $('#stage-description').textContent = y.description;
  $('#stage-format').textContent = y.format;
  $('#stage-champion').textContent = y.champion;
}
selectYear(data.years[0], $('.year-chip'));

function openDialog(id) {
  const dlg = document.getElementById(id);
  if (!dlg) return;
  dlg.showModal();
  document.body.classList.add('modal-open');
}
$$('[data-open]').forEach(b => b.addEventListener('click', () => openDialog(b.dataset.open)));
$$('dialog .modal-close').forEach(b => b.addEventListener('click', () => {
  b.closest('dialog').close();
  document.body.classList.remove('modal-open');
}));
$$('dialog').forEach(d => d.addEventListener('click', e => {
  if (e.target === d) {
    d.close();
    document.body.classList.remove('modal-open');
  }
}));

const filterButtons = $$('.gallery-filters button');
const galleryItems = $$('.gallery-item');
filterButtons.forEach(b => b.addEventListener('click', () => {
  filterButtons.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  galleryItems.forEach(item => item.classList.toggle('hidden', b.dataset.filter !== 'all' && item.dataset.cat !== b.dataset.filter));
}));
galleryItems.forEach(item => item.addEventListener('click', () => {
  const lightbox = $('#lightbox');
  if (!lightbox) return;
  $('#lightbox img').src = item.dataset.src;
  $('#lightbox img').alt = item.querySelector('img').alt;
  openDialog('lightbox');
}));

$('#copyright-year').textContent = new Date().getFullYear();

const repeatChampions = $('#repeat-champions');
if (repeatChampions && data.repeatChampions) {
  repeatChampions.innerHTML = data.repeatChampions.map(c => `<article class="repeat-champion"><b>${c.titles === 3 ? 'Three-Time Champion' : 'Two-Time Champion'}</b><strong>${c.name}</strong><small>${c.years}</small></article>`).join('');
}

const golfChampions = $('#golf-champions');
if (golfChampions && data.golfChampions) {
  golfChampions.innerHTML = data.golfChampions.map(g => `<div class="golf-row"><strong>${g.year}</strong><span>${g.winners}</span></div>`).join('');
}

// Hall of Champions — horizontal playing-card presentation.
const winnerPhotos = {
  '2017': 'assets/years/2017/12th-winner-pic.jpg',
  '2023': 'assets/years/2023/di-16th-winner-lee-d-copy-2.jpg',
  '2024': 'assets/years/2024/dixviikyle-trophy.jpg',
  '2025': 'assets/years/2025/di-18-winner-rob-knarr.jpg',
  '2026': 'assets/years/2026/img-1483.jpeg'
};
const championScroll = $('#champion-scroll');
if (championScroll) {
  const official = data.champions.filter(row => !row.winner.startsWith('No '));
  championScroll.innerHTML = official.map(row => {
    const photo = winnerPhotos[row.year];
    const repeat = data.repeatChampions.find(c => c.name === row.winner);
    return `<article class="playing-card">
      <div class="card-top"><span>D.I. ${row.year}</span><small>${row.di}</small></div>
      <div class="card-center ${photo ? 'has-photo' : ''}">
        ${photo ? `<img src="${photo}" alt="${row.winner}, ${row.year} DeWees Invitational poker champion" loading="lazy">` : `<div class="card-monogram">DI</div>`}
      </div>
      <div class="card-name"><strong>${row.winner}</strong>${repeat ? `<small>${repeat.titles === 3 ? 'Three-Time Champion' : 'Two-Time Champion'}</small>` : '<small>Poker Champion</small>'}</div>
      <div class="card-suit">♠</div>
    </article>`;
  }).join('');
}


// 2017 fun-fact reveal: Kerry's Achilles injury.
const funFactBtn = $('#fun-fact-btn');
const achillesDialog = $('#achilles-fun-fact');
if (funFactBtn && achillesDialog) {
  funFactBtn.addEventListener('click', () => achillesDialog.showModal());
  achillesDialog.querySelector('.fun-fact-close')?.addEventListener('click', () => achillesDialog.close());
  achillesDialog.querySelector('.achilles-answer')?.addEventListener('click', (e) => {
    e.currentTarget.hidden = true;
    achillesDialog.querySelector('.achilles-reveal').hidden = false;
  });
  achillesDialog.querySelector('.postop-button')?.addEventListener('click', (e) => {
    e.currentTarget.hidden = true;
    achillesDialog.querySelector('.postop-photo').hidden = false;
  });
  achillesDialog.addEventListener('click', (e) => { if (e.target === achillesDialog) achillesDialog.close(); });
}
