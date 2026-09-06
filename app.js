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

// Simple year timeline: year only in the rail; click to reveal details and, when available, one small verified image.
const rail = $('#year-rail');
let selectedYear = data.years[0];

function makeYearButton(y, isClone = false) {
  const b = document.createElement('button');
  b.className = 'year-chip' + (y.year === selectedYear.year ? ' active' : '') + (isClone ? ' year-chip-clone' : '');
  b.textContent = y.year;
  b.dataset.year = y.year;
  b.setAttribute('aria-label', `Show ${y.year} Invitational details`);
  if (isClone) b.setAttribute('aria-hidden', 'true');
  b.addEventListener('click', () => selectYear(y, b));
  return b;
}

if (rail) data.years.forEach(y => rail.appendChild(makeYearButton(y)));

function selectYear(y, button) {
  selectedYear = y;
  $$('.year-chip').forEach(x => x.classList.toggle('active', Number(x.dataset.year) === y.year));

  const wrap = $('#stage-media-wrap');
  const img = $('#stage-image');
  if (wrap && img) {
    const oldPair = wrap.querySelector('.timeline-two-photo');
    if (oldPair) oldPair.remove();

    if (Array.isArray(y.timelineImages) && y.timelineImages.length === 2) {
      wrap.hidden = false;
      img.hidden = true;
      img.removeAttribute('src');
      const pair = document.createElement('div');
      pair.className = 'timeline-two-photo';
      y.timelineImages.forEach((src) => {
        const photo = document.createElement('img');
        photo.src = src;
        photo.alt = `${y.annual} — ${y.title}`;
        pair.appendChild(photo);
      });
      wrap.appendChild(pair);
    } else if (y.image) {
      wrap.hidden = false;
      img.hidden = false;
      img.src = y.image;
      img.alt = `${y.annual} — ${y.title}`;
    } else {
      wrap.hidden = true;
      img.hidden = true;
      img.removeAttribute('src');
    }
    // All gold timeline tabs are intentionally removed. The 2017 red cross remains independent.
    const stageTag = $('#stage-tag');
    if (stageTag) stageTag.hidden = true;
    const funFact = $('#fun-fact-btn');
    if (funFact) funFact.hidden = y.year !== 2017 || wrap.hidden;
  }

  $('#stage-year').textContent = y.annual;
  $('#stage-title').textContent = y.title;
  $('#stage-description').textContent = y.description;
  $('#stage-description').style.whiteSpace = y.description.includes('\n') ? 'pre-line' : '';
  $('#stage-format').textContent = y.format || '';
  $('#stage-champion').textContent = y.champion || '';
  const details = $('#stage-format')?.closest('dl');
  if (details) details.hidden = Boolean(y.hideDetails);
}
selectYear(data.years[0], $('.year-chip'));

// Slow, seamless leftward year loop. A duplicated set makes the wrap visually continuous.
if (rail) {
  data.years.forEach(y => rail.appendChild(makeYearButton(y, true)));
  let paused = false;
  let resumeTimer;
  let lastStep = 0;
  const pauseBriefly = () => {
    paused = true;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { paused = false; }, 1400);
  };
  const moveYears = (now) => {
    if (!paused && rail.scrollWidth > rail.clientWidth && now - lastStep >= 34) {
      rail.scrollLeft += 1;
      const half = rail.scrollWidth / 2;
      if (rail.scrollLeft >= half) rail.scrollLeft -= half;
      lastStep = now;
    }
    requestAnimationFrame(moveYears);
  };
  ['wheel','touchstart','pointerdown','focusin'].forEach(evt => rail.addEventListener(evt, pauseBriefly, {passive:true}));
  requestAnimationFrame(moveYears);
}

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
  repeatChampions.innerHTML = data.repeatChampions.map(c => `<article class="repeat-champion"><b>${c.titles === 3 ? 'Three-Time<br>Poker Champion' : 'Two-Time<br>Poker Champion'}</b><strong>${c.name}</strong><small>${c.years}</small></article>`).join('');
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
  '2026': 'assets/years/2026/img-1485-full.jpeg'
};
const championScroll = $('#champion-scroll');
if (championScroll) {
  const official = data.champions.filter(row => !row.winner.startsWith('No '));
  championScroll.innerHTML = official.map(row => {
    const photo = winnerPhotos[row.year];
    const repeat = data.repeatChampions.find(c => c.name === row.winner);
    return `<article class="playing-card">
      <div class="card-top"><span>D.I. ${row.di}</span><small>${row.year}</small></div>
      <div class="card-center ${photo ? 'has-photo' : ''}">
        ${photo ? `<img src="${photo}" alt="${row.winner}, ${row.year} DeWees Invitational poker champion" loading="lazy">` : `<div class="card-monogram">DI</div>`}
      </div>
      <div class="card-name"><strong>${row.winner}</strong>${repeat ? `<small>${repeat.titles === 3 ? 'Three-Time Champion' : 'Two-Time Champion'}</small>` : '<small>Poker Champion</small>'}</div>
      <div class="card-suit">♠</div>
    </article>`;
  }).join('');


  // Keep the champion cards moving gently to the left. Duplicate the row for a seamless loop.
  {
    const original = championScroll.innerHTML;
    championScroll.insertAdjacentHTML('beforeend', original.replaceAll('<article class="playing-card"', '<article class="playing-card clone" aria-hidden="true"'));
    let paused = false;
    let resumeTimer;
    let lastStep = 0;
    const tick = (now) => {
      if (!paused && championScroll.scrollWidth > championScroll.clientWidth && now - lastStep >= 38) {
        championScroll.scrollLeft += 1;
        const half = championScroll.scrollWidth / 2;
        if (championScroll.scrollLeft >= half) championScroll.scrollLeft -= half;
        lastStep = now;
      }
      requestAnimationFrame(tick);
    };
    const pauseBriefly = () => { paused = true; clearTimeout(resumeTimer); resumeTimer = setTimeout(() => paused = false, 1400); };
    ['wheel','touchstart','pointerdown','focusin'].forEach(evt => championScroll.addEventListener(evt, pauseBriefly, {passive:true}));
    requestAnimationFrame(tick);
  }
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
  achillesDialog.querySelector('.postop-button')?.addEventListener('click', () => {
    const postopDialog = $('#postop-photo-dialog');
    if (postopDialog) postopDialog.showModal();
  });
  const postopDialog = $('#postop-photo-dialog');
  postopDialog?.querySelector('.postop-close')?.addEventListener('click', () => postopDialog.close());
  postopDialog?.addEventListener('click', (e) => { if (e.target === postopDialog) postopDialog.close(); });
  achillesDialog.addEventListener('click', (e) => { if (e.target === achillesDialog) achillesDialog.close(); });
}

// Header countdown to DI XX.
const headerCountdown = $('#header-countdown');
if (headerCountdown) {
  const target = new Date(data.event.start).getTime();
  const renderCountdown = () => {
    const remaining = Math.max(0, target - Date.now());
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    headerCountdown.innerHTML = [
      ['Days', days], ['Hours', hours], ['Minutes', minutes], ['Seconds', seconds]
    ].map(([label, value]) => `<span><b>${String(value).padStart(2,'0')}</b><small>${label}</small></span>`).join('');
  };
  renderCountdown();
  setInterval(renderCountdown, 1000);
}

// Swing reel: no poster still; quick fade into the first swing when playback begins.
const swingReel = $('.swing-reel-video');
if (swingReel) {
  swingReel.addEventListener('play', () => {
    swingReel.classList.remove('swing-fade-in');
    void swingReel.offsetWidth;
    swingReel.classList.add('swing-fade-in');
  });
}

// Memories From the Invitational — text-only moderated guestbook.
// The publishable Supabase key is safe for browser use; Row Level Security controls access.
const MEMORIES_SUPABASE_URL = 'https://pmtuhuktxvtehsgxroqg.supabase.co';
const MEMORIES_SUPABASE_KEY = 'sb_publishable_KLodHn8AM8z2T-EuYXyb-A_Tfxsmyd6';
const MEMORIES_ACCESS_CODE = 'kerry719';
const MEMORIES_TABLE = 'Memories';

const memoriesList = $('#memory-list');
const memoryForm = $('#memory-form');
const memoryStatus = $('#memory-form-status');
const memorySubmit = $('#memory-submit');

function memoriesHeaders(extra = {}) {
  return {
    'apikey': MEMORIES_SUPABASE_KEY,
    'Authorization': `Bearer ${MEMORIES_SUPABASE_KEY}`,
    ...extra
  };
}

function createMemoryCard(row) {
  const article = document.createElement('article');
  article.className = 'memory-card';

  const meta = document.createElement('div');
  meta.className = 'memory-card-meta';

  const name = document.createElement('strong');
  name.textContent = row.name || 'Anonymous';
  meta.appendChild(name);

  if (row.year) {
    const year = document.createElement('span');
    year.textContent = row.year;
    meta.appendChild(year);
  }

  const quote = document.createElement('p');
  quote.textContent = row.memory || '';

  article.append(meta, quote);
  return article;
}

async function loadApprovedMemories() {
  if (!memoriesList) return;
  try {
    const endpoint = `${MEMORIES_SUPABASE_URL}/rest/v1/${encodeURIComponent(MEMORIES_TABLE)}?select=name,year,memory,created_at&approved=eq.true&order=created_at.desc`;
    const response = await fetch(endpoint, { headers: memoriesHeaders() });
    if (!response.ok) throw new Error(`Supabase returned ${response.status}`);
    const rows = await response.json();
    memoriesList.replaceChildren();
    if (!Array.isArray(rows) || rows.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'memory-empty';
      empty.textContent = 'Be the first to share a memory.';
      memoriesList.appendChild(empty);
      return;
    }
    rows.forEach(row => memoriesList.appendChild(createMemoryCard(row)));
  } catch (error) {
    console.error('Unable to load approved memories:', error);
    memoriesList.replaceChildren();
    const unavailable = document.createElement('p');
    unavailable.className = 'memory-empty';
    unavailable.textContent = 'Memories are temporarily unavailable.';
    memoriesList.appendChild(unavailable);
  }
}

if (memoryForm) {
  memoryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = $('#memory-name')?.value.trim() || '';
    const year = $('#memory-year')?.value.trim() || '';
    const memory = $('#memory-text')?.value.trim() || '';
    const code = $('#memory-code')?.value || '';

    if (code !== MEMORIES_ACCESS_CODE) {
      memoryStatus.textContent = 'That access code is not correct.';
      memoryStatus.className = 'memory-form-status error';
      $('#memory-code')?.focus();
      return;
    }

    if (!name || !memory) {
      memoryStatus.textContent = 'Please enter your name and memory.';
      memoryStatus.className = 'memory-form-status error';
      return;
    }

    memorySubmit.disabled = true;
    memorySubmit.textContent = 'Submitting…';
    memoryStatus.textContent = '';
    memoryStatus.className = 'memory-form-status';

    try {
      const response = await fetch(`${MEMORIES_SUPABASE_URL}/rest/v1/${encodeURIComponent(MEMORIES_TABLE)}`, {
        method: 'POST',
        headers: memoriesHeaders({
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }),
        body: JSON.stringify({
          name,
          year: year || null,
          memory,
          media_url: null,
          media_type: null,
          approved: false
        })
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Supabase returned ${response.status}: ${details}`);
      }

      memoryForm.reset();
      memoryStatus.textContent = 'Thanks — your memory was submitted and will appear after Kerry approves it.';
      memoryStatus.className = 'memory-form-status success';
    } catch (error) {
      console.error('Unable to submit memory:', error);
      memoryStatus.textContent = 'The memory could not be submitted. Please try again.';
      memoryStatus.className = 'memory-form-status error';
    } finally {
      memorySubmit.disabled = false;
      memorySubmit.textContent = 'Submit Memory';
    }
  });
}

loadApprovedMemories();
