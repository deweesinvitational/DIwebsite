const $ = (q, ctx=document) => ctx.querySelector(q);
const $$ = (q, ctx=document) => [...ctx.querySelectorAll(q)];

window.addEventListener('load', () => setTimeout(() => $('.page-loader').classList.add('hidden'), 450));

const topbar = $('.topbar');
window.addEventListener('scroll', () => topbar.classList.toggle('scrolled', scrollY > 35));

const toggle = $('.nav-toggle');
const nav = $('#site-nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
$$('#site-nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

let heroIndex = 0;
const heroSlides = $$('.hero-slides img');
setInterval(() => {
  heroSlides[heroIndex].classList.remove('active');
  heroIndex = (heroIndex + 1) % heroSlides.length;
  heroSlides[heroIndex].classList.add('active');
}, 6500);

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


const championsBody = $('#champions-table-body');
if (championsBody && data.champions) {
  championsBody.innerHTML = data.champions.map(row => `
    <tr class="${row.di === '—' ? 'no-event-row' : ''}">
      <td>${row.di}</td>
      <td>${row.year}</td>
      <td>${row.winner}</td>
    </tr>
  `).join('');
}

const rail = $('#year-rail');
data.years.forEach((y, i) => {
  const b = document.createElement('button');
  b.className = 'year-chip' + (i === 0 ? ' active' : '');
  b.innerHTML = `<strong>${y.label}</strong><small>${y.title}</small>`;
  b.addEventListener('click', () => selectYear(y, b));
  rail.appendChild(b);
});

let selectedYear = data.years[0];
function selectYear(y, button) {
  selectedYear = y;
  $$('.year-chip').forEach(x => x.classList.remove('active'));
  button.classList.add('active');
  const img = $('#stage-image');
  const placeholder = $('#stage-placeholder');
  if (y.image) {
    placeholder.hidden = true;
    img.hidden = false;
    img.style.opacity = 0;
    setTimeout(() => {
      img.src = y.image;
      img.alt = `${y.annual} — ${y.title}`;
      img.style.opacity = 1;
    }, 180);
  } else {
    img.hidden = true;
    img.removeAttribute('src');
    placeholder.hidden = false;
    placeholder.innerHTML = `<strong>${y.year}</strong><span>No verified photo in the ${y.year} archive</span>`;
  }
  $('#stage-tag').textContent = y.tag;
  $('#stage-year').textContent = y.annual;
  $('#stage-title').textContent = y.title;
  $('#stage-description').textContent = y.description;
  $('#stage-format').textContent = y.format;
  $('#stage-champion').textContent = y.champion;
  $('#stage-archive').textContent = y.archive;
}

function openDialog(id) {
  const dlg = document.getElementById(id);
  dlg.showModal();
  document.body.classList.add('modal-open');
}
$$('[data-open]').forEach(b => b.addEventListener('click', () => openDialog(b.dataset.open)));
$$('.site-modal .modal-close, .lightbox .modal-close').forEach(b => b.addEventListener('click', () => {
  b.closest('dialog').close();
  document.body.classList.remove('modal-open');
}));
$$('dialog').forEach(d => d.addEventListener('click', e => {
  if (e.target === d) {
    d.close();
    document.body.classList.remove('modal-open');
  }
}));

$('#open-year').addEventListener('click', () => {
  const images = selectedYear.media || [];
  const archiveMedia = images.length ? `
    <div class="year-archive-grid">
      ${images.map((src, i) => `<button class="year-archive-image" data-year-src="${src}"><img src="${src}" alt="${selectedYear.year} archive image ${i+1}" loading="lazy"></button>`).join('')}
    </div>` : `<div class="year-archive-empty"><strong>${selectedYear.year}</strong><span>No verified photographs are currently saved in this year's folder.</span></div>`;
  $('#year-modal-content').innerHTML = `
    <span class="eyebrow">${selectedYear.annual}</span>
    <h2>${selectedYear.title}</h2>
    <p>${selectedYear.description}</p>
    <div class="modal-grid">
      <div><small>Format</small><strong>${selectedYear.format}</strong></div>
      <div><small>Champion</small><strong>${selectedYear.champion}</strong></div>
      <div><small>Archive</small><strong>${selectedYear.archive}</strong></div>
      <div><small>Videos</small><strong>${selectedYear.videoCount ? `${selectedYear.videoCount} saved clip${selectedYear.videoCount === 1 ? '' : 's'} (held for video edit)` : 'None saved for this year'}</strong></div>
    </div>
    ${archiveMedia}`;
  $$('.year-archive-image', $('#year-modal-content')).forEach(btn => btn.addEventListener('click', () => {
    $('#lightbox img').src = btn.dataset.yearSrc;
    $('#lightbox img').alt = `${selectedYear.year} archive photo`;
    document.getElementById('year-modal').close();
    openDialog('lightbox');
  }));
  openDialog('year-modal');
});

const filterButtons = $$('.gallery-filters button');
const galleryItems = $$('.gallery-item');
filterButtons.forEach(b => b.addEventListener('click', () => {
  filterButtons.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  galleryItems.forEach(item => item.classList.toggle('hidden', b.dataset.filter !== 'all' && item.dataset.cat !== b.dataset.filter));
}));
galleryItems.forEach(item => item.addEventListener('click', () => {
  $('#lightbox img').src = item.dataset.src;
  $('#lightbox img').alt = item.querySelector('img').alt;
  openDialog('lightbox');
}));

$('#copyright-year').textContent = new Date().getFullYear();

const repeatChampions = $('#repeat-champions');
if (repeatChampions && data.repeatChampions) {
  repeatChampions.innerHTML = data.repeatChampions.map(c => `<article class="repeat-champion"><b>${c.titles}×</b><strong>${c.name}</strong><small>${c.years}</small></article>`).join('');
}
const golfChampions = $('#golf-champions');
if (golfChampions && data.golfChampions) {
  golfChampions.innerHTML = data.golfChampions.map(g => `<div class="golf-row"><strong>${g.year}</strong><span>${g.winners}</span></div>`).join('');
}
