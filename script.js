/* ============================================================
   TERMINAL HACKER PORTFOLIO — script.js
   Modular vanilla JS: GitHub repos + contribution graph,
   Lanyard Discord presence, command palette, matrix rain, etc.
   ============================================================ */

'use strict';

/* ============================================================
   CONFIG — 👇 INSERT YOUR DETAILS HERE 👇
   ============================================================ */
const CONFIG = {
  /* Display name shown in the hero and footer. */
  NAME: 'Sordonyx',

  /* GitHub username (used for the repos API, avatar, heatmap). */
  GITHUB_USERNAME: 'joeajwas',

  /* One-line bio shown under the hero typewriter. */
  BIO: 'I am just a regular programmer, nothing much.',

  /* Numeric Discord User ID (right-click yourself on Discord ->
     Copy User ID). Used by the Lanyard API for live presence. */
  DISCORD_USER_ID: '1018907272908374017',

  /* Your Discord invite link, e.g. 'https://discord.gg/xyz'. */
  DISCORD_INVITE_URL: 'https://discord.gg/sKqXcZhNvr',

  /* Contact email (copy-to-clipboard from hero + palette). */
  EMAIL: 'kumarmajhi743@gmail.com',

  /* Optional social handles (leave '' to hide the link). */
  TWITTER: '',
  LINKEDIN: '',

  /* Optional DEV.to username — shows a "latest posts" section.
     Leave '' to hide the section entirely. */
  DEVTO_USERNAME: '',

  /* Enable the matrix rain background on load (toggle via Ctrl+K). */
  MATRIX_RAIN: true,

  /* Exclude repos you don't want shown (case-insensitive substring match). */
  EXCLUDED_REPOS: ['demo', 'test', 'playground'],

  /* Only show repos with at least this many stars? Set 0 for all. */
  MIN_STARS: 0,

  /* Max repos to display in the carousel (0 = unlimited). */
  MAX_REPOS: 0,

  /* How long (ms) to reuse cached GitHub data before refetching.
     3_600_000 = 1 hour. */
  CACHE_TTL: 3_600_000,

  /* Work history — edit freely. Order: newest first. */
  EXPERIENCE: [
    {
      period: '2024 — Present',
      role: 'Full-Stack Developer & Server Architect',
      company: 'Sector Zero Project',
      desc: 'Building custom server daemons, automation tools, and web portals.',
    },
    {
      period: '2022 — 2024',
      role: 'Software Engineer',
      company: 'Open Source Projects',
      desc: 'Contributed to community tooling, Python automation scripts, and libraries.',
    },
    {
      period: '2020 — 2022',
      role: 'The Learning Era',
      company: 'self-taught.txt',
      desc: 'Drank coffee, broke servers, and learned how to fix them.',
    },
  ],

  /* Testimonials — edit freely. */
  TESTIMONIALS: [
    {
      quote: 'Shipping code like a machine. Would hire again.',
      author: 'Some Client',
      role: 'Freelance gig',
    },
    {
      quote: 'The PRs are clean, the comments are readable, the coffee is flowing.',
      author: 'A Maintainer',
      role: 'Open source',
    },
  ],
};

/* Endpoints (computed so they always match CONFIG) */
const API = {
  github: `https://api.github.com/users/${CONFIG.GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
  githubProfile: `https://api.github.com/users/${CONFIG.GITHUB_USERNAME}`,
  lanyard: `https://api.lanyard.rest/v1/users/${CONFIG.DISCORD_USER_ID}`,
};

const CACHE_KEY = 'portfolio-gh-cache-v1';

/* Common language -> badge color (fallback gray for others) */
const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572a5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Java: '#b07219',
  Go: '#00add8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4f5d95',
  Shell: '#89e051',
  Swift: '#f05138',
  Kotlin: '#a97bff',
  Dart: '#00b4ab',
  Vue: '#41b883',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  'Jupyter Notebook': '#da5b0b',
  SCSS: '#c6538c',
  Lua: '#000080',
  Zig: '#ec915c',
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const esc = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/* ============================================================
   UTILITIES
   ============================================================ */
function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch (_) { /* storage full / disabled — ignore */ }
}

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.data) return null;
    return {
      data: parsed.data,
      stale: Date.now() - parsed.ts > CONFIG.CACHE_TTL,
    };
  } catch (_) {
    return null;
  }
}

/* 1234 -> "1.2k", 1500000 -> "1.5M" */
function formatCount(n) {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
  return (n / 1_000_000).toFixed(1) + 'M';
}

function scrollToId(id) {
  const el = $(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ============================================================
   HERO — typewriter, socials, GitHub avatar enrichment
   ============================================================ */
const TYPEWRITER_PHRASES = [
  'Full-Stack Developer & Open Source Enthusiast',
  'I build tools, web apps, and automation that feel like magic.',
  'Currently exploring Rust & Go · drinking way too much coffee.',
];

async function initHero() {
  $('#hero-name').textContent = CONFIG.NAME;
  $('#hero-bio').textContent = CONFIG.BIO;
  $('#footer-name').textContent = CONFIG.NAME;

  // Build social links from CONFIG.
  const socials = $('#socials');
  const links = [
    ['github', `https://github.com/${CONFIG.GITHUB_USERNAME}`, !!CONFIG.GITHUB_USERNAME],
    ['linkedin', `https://linkedin.com/in/${CONFIG.LINKEDIN}`, !!CONFIG.LINKEDIN],
    ['x/twitter', `https://twitter.com/${CONFIG.TWITTER}`, !!CONFIG.TWITTER],
    ['email', `mailto:${CONFIG.EMAIL}`, !!CONFIG.EMAIL],
  ];
  socials.innerHTML = links
    .filter(([, , show]) => show)
    .map(([label, href]) => `<a class="social-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">[${esc(label)}]</a>`)
    .join('');

  // Click the email link to copy it instead of opening mailto.
  socials.querySelectorAll('.social-link[href^="mailto"]').forEach((a) => {
    a.addEventListener('click', (e) => { e.preventDefault(); copyEmail(); });
  });

  // Typewriter loop.
  const tw = $('#typewriter');
  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;
  const tick = () => {
    const phrase = TYPEWRITER_PHRASES[phraseIdx];
    charIdx += deleting ? -1 : 1;
    tw.textContent = phrase.slice(0, charIdx);
    if (!deleting && charIdx === phrase.length) {
      deleting = true;
      setTimeout(tick, 2200); // pause before deleting
      return;
    }
    if (deleting && charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % TYPEWRITER_PHRASES.length;
      setTimeout(tick, 400);
      return;
    }
    setTimeout(tick, deleting ? 28 : 55);
  };
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) tick();
  else tw.textContent = TYPEWRITER_PHRASES[0];

  // Enrich hero with GitHub profile (avatar, name, extra info).
  if (CONFIG.GITHUB_USERNAME && CONFIG.GITHUB_USERNAME !== 'YOUR_GITHUB_USERNAME') {
    try {
      const res = await fetch(API.githubProfile);
      if (res.ok) {
        const p = await res.json();
        const avatar = $('#hero-avatar');
        avatar.src = p.avatar_url;
        avatar.onerror = () => { avatar.classList.remove('skel'); };
        avatar.classList.remove('skel');
        $('#hero-gh-name').textContent = '@' + CONFIG.GITHUB_USERNAME;
        $('#hero-gh-extra').innerHTML =
          `&gt; gh profile --repo=${p.public_repos} --followers=${p.followers}` +
          (p.blog ? ` --site=<a href="${esc(p.blog)}" target="_blank" rel="noopener noreferrer">${esc(p.blog)}</a>` : '');
      }
    } catch (_) { /* keep placeholder */ }
  }
}

/* ============================================================
   COPY EMAIL + TOAST
   ============================================================ */
let toastTimer = null;
function showToast(msg) {
  const toast = $('#toast');
  toast.textContent = '> ' + msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

async function copyEmail() {
  const email = CONFIG.EMAIL || '';
  if (!email) return;
  try {
    await navigator.clipboard.writeText(email);
    showToast('copied ' + email + ' to clipboard');
  } catch (_) {
    showToast('email: ' + email);
  }
}

/* ============================================================
   GITHUB — fetch repos with cache + rate-limit fallback
   ============================================================ */
async function fetchRepos() {
  const cached = getCache();

  // If a fresh cache exists, use it without hitting the API.
  if (cached && !cached.stale) return { repos: cached.data, rateLimited: false };

  // No configured username -> render a helpful placeholder.
  if (CONFIG.GITHUB_USERNAME === 'YOUR_GITHUB_USERNAME') {
    return { repos: [], rateLimited: false, notConfigured: true };
  }

  try {
    const res = await fetch(API.github, { headers: { Accept: 'application/vnd.github+json' } });

    // 403 + rate-limit body -> return whatever cache we have.
    if (res.status === 403) return { repos: cached ? cached.data : [], rateLimited: true };

    if (!res.ok) return { repos: cached ? cached.data : [], error: res.status };

    const repos = (await res.json())
      .filter((r) => !r.fork) // skip forks
      .filter((r) => !CONFIG.EXCLUDED_REPOS.some((w) => r.name.toLowerCase().includes(w)))
      .filter((r) => r.stargazers_count >= CONFIG.MIN_STARS);

    if (CONFIG.MAX_REPOS > 0) repos.length = Math.min(repos.length, CONFIG.MAX_REPOS);

    setCache(repos);
    return { repos, rateLimited: false };
  } catch (err) {
    // Network error -> fall back to cached data if present.
    return { repos: cached ? cached.data : [], error: err.message };
  }
}

/* ---------- Project card renderers ---------- */
function createProjectCard(repo) {
  const lang = repo.language || null;
  const langColor = (lang && LANG_COLORS[lang]) || '#8b98a5';
  const demo = repo.homepage && !/^https?:\/\/$/.test(repo.homepage) ? repo.homepage : null;
  const desc = repo.description || 'No description provided.';

  const card = document.createElement('article');
  card.className = 'project-card';
  card.setAttribute('role', 'listitem');
  card.setAttribute('data-lang', (lang || 'Other').toLowerCase());

  card.innerHTML = `
    <div class="project-card-top">
      <span class="project-icon">&#128196;</span>
      <h3 class="project-name" title="${esc(repo.full_name)}">${esc(repo.name)}</h3>
    </div>
    <p class="project-desc ${desc === 'No description provided.' ? 'empty' : ''}">${esc(desc)}</p>
    <div class="project-badges">
      ${lang ? `<span class="lang-badge"><span class="lang-dot" style="background:${langColor}"></span>${esc(lang)}</span>` : ''}
      <span class="repo-stats">
        <span class="star" title="Stars">&#11088; ${formatCount(repo.stargazers_count)}</span>
        <span title="Forks">&#128256; ${formatCount(repo.forks_count)}</span>
      </span>
    </div>
    <div class="project-links">
      <a class="btn-gh" href="${esc(repo.html_url)}" target="_blank" rel="noopener noreferrer">&#9662; GitHub</a>
      <a class="btn-demo ${demo ? '' : 'disabled'}" href="${demo ? esc(demo) : '#'}"
         ${demo ? 'target="_blank" rel="noopener noreferrer"' : 'aria-disabled="true"'}>&#9654; Live Demo</a>
    </div>
  `;
  return card;
}

function createFallbackCard({ rateLimited, error, notConfigured, empty }) {
  const card = document.createElement('div');
  card.className = 'fallback-card';
  card.setAttribute('role', 'listitem');

  if (notConfigured) {
    card.innerHTML = `
      <h3>&#9888; GitHub not configured</h3>
      <p>Open <code>script.js</code> and replace <code>YOUR_GITHUB_USERNAME</code> inside the
      <code>CONFIG</code> block at the top with your GitHub username.</p>
    `;
  } else if (rateLimited) {
    card.innerHTML = `
      <h3>&#9888; GitHub API rate limit hit</h3>
      <p>The GitHub API (60 req/hr per IP) limited us before we could fetch fresh data.
      ${'Your repos were loaded from local cache.'}</p>
      <p>Browse them directly instead:
      <a href="https://github.com/${esc(CONFIG.GITHUB_USERNAME)}" target="_blank" rel="noopener noreferrer">
      github.com/${esc(CONFIG.GITHUB_USERNAME)}</a></p>
    `;
  } else if (empty) {
    card.innerHTML = `
      <h3>&#128266; No public repositories yet</h3>
      <p>This carousel fills up automatically as you push to GitHub.</p>
      <p>Tip: make a repo public (or pin your favorites) and it will show up here.
      <a href="https://github.com/${esc(CONFIG.GITHUB_USERNAME)}?tab=repositories" target="_blank" rel="noopener noreferrer">
      View your repos</a></p>
    `;
  } else {
    card.innerHTML = `
      <h3>&#9888; Could not load repos${error ? ' (' + esc(error) + ')' : ''}</h3>
      <p>Something went wrong talking to the GitHub API.</p>
      <p><a href="https://github.com/${esc(CONFIG.GITHUB_USERNAME)}" target="_blank" rel="noopener noreferrer">
      Open profile on GitHub</a></p>
    `;
  }
  return card;
}

function createSkeletonCard() {
  const card = document.createElement('div');
  card.className = 'project-card skel-card';
  card.setAttribute('aria-hidden', 'true');
  card.innerHTML = `
    <span class="skel skel-name"></span>
    <span class="skel skel-desc"></span>
    <span class="skel skel-desc short"></span>
    <span class="skel skel-tag"></span>
  `;
  return card;
}

/* ---------- State & rendering ---------- */
const state = {
  repos: [],
  query: '',
  lang: 'All',
  sort: 'stars',
};

function renderFilterTabs(repos) {
  const tabs = $('#filter-tabs');
  const langs = ['All', ...new Set(repos.map((r) => r.language || 'Other'))]
    .filter(Boolean)
    .slice(0, 8);

  tabs.innerHTML = langs
    .map(
      (l, i) =>
        `<button class="filter-tab ${i === 0 ? 'active' : ''}" data-lang="${esc(l)}" role="tab"
         aria-selected="${i === 0}">${esc(l)}</button>`
    )
    .join('');

  tabs.querySelectorAll('.filter-tab').forEach((tab) =>
    tab.addEventListener('click', () => {
      state.lang = tab.dataset.lang;
      tabs.querySelectorAll('.filter-tab').forEach((t) => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
      renderProjects();
    })
  );
}

function renderProjects() {
  const carousel = $('#carousel');
  const { repos, query, lang, sort } = state;

  if (!repos.length) return;

  const filtered = repos
    .filter((r) => {
      const repoLang = (r.language || 'Other').toLowerCase();
      const matchesLang = lang.toLowerCase() === 'all' || repoLang === lang.toLowerCase();
      const matchesQuery =
        query === '' ||
        `${r.name} ${r.description || ''} ${r.language || ''}`.toLowerCase().includes(query);
      return matchesLang && matchesQuery;
    })
    .sort((a, b) => {
      if (sort === 'stars') return b.stargazers_count - a.stargazers_count;
      if (sort === 'updated') return new Date(b.updated_at) - new Date(a.updated_at);
      return a.name.localeCompare(b.name);
    });

  carousel.innerHTML = '';
  $('#repo-count').textContent = repos.length;
  $('#sort-label').textContent = `--sort=${sort}`;

  if (filtered.length === 0) {
    carousel.innerHTML = `
      <div class="fallback-card">
        <h3>&#128269; No matches</h3>
        <p>Nothing found for "<code>${esc(query)}</code>" in language "${esc(lang)}".
        Try clearing the search or picking a different tab.</p>
      </div>`;
    return;
  }

  filtered.forEach((repo) => carousel.appendChild(createProjectCard(repo)));
}

async function initProjects() {
  const carousel = $('#carousel');

  // 1) Show skeleton cards while fetching.
  for (let i = 0; i < 5; i++) carousel.appendChild(createSkeletonCard());

  // 2) Fetch real data.
  const { repos, rateLimited, error, notConfigured } = await fetchRepos();

  // 3) Swap skeletons for real cards.
  carousel.innerHTML = '';

  if (repos.length) {
    state.repos = repos;
    renderFilterTabs(repos);
    renderProjects();
  } else {
    carousel.appendChild(
      createFallbackCard({ rateLimited, error, notConfigured, empty: !rateLimited && !error && !notConfigured })
    );
  }

  // 4) If data was stale, kick off a background refresh.
  const cached = getCache();
  if (cached && cached.stale && !notConfigured) {
    setTimeout(() => initProjects(), 2000);
  }
}

/* ============================================================
   CAROUSEL — arrow buttons + drag-to-scroll
   ============================================================ */
function initCarousel() {
  const carousel = $('#carousel');
  const prev = $('#carousel-prev');
  const next = $('#carousel-next');

  prev.addEventListener('click', () => carousel.scrollBy({ left: -340, behavior: 'smooth' }));
  next.addEventListener('click', () => carousel.scrollBy({ left: 340, behavior: 'smooth' }));

  // Drag to scroll (mouse + touch).
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let dragged = false;

  carousel.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDown = true;
    dragged = false;
    startX = e.clientX;
    scrollLeft = carousel.scrollLeft;
    carousel.classList.add('dragging');
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 15) dragged = true; // Increased threshold prevents click absorption
    carousel.scrollLeft = scrollLeft - dx;
  });

  window.addEventListener('pointerup', () => {
    isDown = false;
    carousel.classList.remove('dragging');
    setTimeout(() => { dragged = false; }, 80);
  });

  // Suppress link clicks only when a genuine drag gesture took place.
  carousel.addEventListener('click', (e) => {
    if (dragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // Smooth momentum when releasing a drag.
  carousel.addEventListener('pointerup', (e) => {
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40) {
      carousel.scrollBy({ left: -dx * 1.2, behavior: 'smooth' });
    }
  });

  // Convert vertical wheel to horizontal only when there is scroll space.
  carousel.addEventListener('wheel', (e) => {
    const canScroll = carousel.scrollWidth > carousel.clientWidth + 1;
    if (canScroll && !e.shiftKey) {
      carousel.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive: false });
}

/* ============================================================
   SEARCH — debounced input listener
   ============================================================ */
function initSearch() {
  const input = $('#search-input');
  let timer;
  input.addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      state.query = e.target.value.trim().toLowerCase();
      renderProjects();
    }, 220);
  });
}

/* ---------- Sort (custom terminal-styled dropdown) ---------- */
function setSort(key) {
  state.sort = key;
  $('#sort-value').textContent = key;
  $('#sort-label').textContent = `--sort=${key}`;
  $$('#sort-menu [role="option"]').forEach((o) =>
    o.setAttribute('aria-selected', String(o.dataset.sort === key))
  );
  renderProjects();
}

function initSort() {
  const btn = $('#sort-btn');
  const menu = $('#sort-menu');
  const options = [...$$('#sort-menu [role="option"]')];
  let activeIdx = 0;

  const close = (restoreFocus = false) => {
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (restoreFocus) btn.focus();
  };
  const open = () => {
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    activeIdx = options.findIndex((o) => o.dataset.sort === state.sort);
    if (activeIdx < 0) activeIdx = 0;
    options.forEach((o, i) => o.classList.toggle('active', i === activeIdx));
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden ? open() : close();
  });

  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
      options[activeIdx]?.focus();
    }
  });

  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(true); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = (activeIdx + (e.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length;
      options.forEach((o, i) => o.classList.toggle('active', i === activeIdx));
      options[activeIdx].focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      options[activeIdx].click();
    }
  });

  options.forEach((o) => o.addEventListener('click', (e) => {
    e.stopPropagation();
    setSort(o.dataset.sort);
    close(true);
  }));

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.sort-dropdown')) close();
  });
}

/* ============================================================
   ACTIVITY — GitHub contribution heatmap (ghchart image)
   ============================================================ */
function initActivity() {
  const body = $('#activity-body');
  const img = document.createElement('img');
  img.className = 'gh-chart';
  img.alt = `${CONFIG.GITHUB_USERNAME}'s GitHub contribution graph`;
  img.src = `https://ghchart.rshah.org/00ff41/${CONFIG.GITHUB_USERNAME}`;

  img.addEventListener('load', () => {
    body.innerHTML = '';
    body.appendChild(img);
    const legend = document.createElement('p');
    legend.className = 'gh-chart-legend';
    legend.textContent = '> less';
    body.appendChild(legend);
  });

  img.addEventListener('error', () => {
    body.innerHTML = `
      <p class="line out">Could not fetch the contribution graph.</p>
      <p class="line out muted">It should load once deployed. Try
      <a href="https://github.com/${esc(CONFIG.GITHUB_USERNAME)}" target="_blank" rel="noopener noreferrer">
      github.com/${esc(CONFIG.GITHUB_USERNAME)}</a></p>`;
  });
}

/* ============================================================
   EXPERIENCE — timeline from CONFIG.EXPERIENCE
   ============================================================ */
function initExperience() {
  const body = $('#timeline-body');
  body.innerHTML = CONFIG.EXPERIENCE.map(
    (item) => `
    <div class="timeline-item">
      <p class="timeline-period">$ ${esc(item.period)}</p>
      <p class="timeline-role">${esc(item.role)}</p>
      <p class="timeline-company">@ ${esc(item.company)}</p>
      <p class="timeline-desc">${esc(item.desc)}</p>
    </div>`
  ).join('');
}

/* ============================================================
   BLOG — DEV.to API integration
   ============================================================ */
async function initBlog() {
  const section = $('#blog');
  const body = $('#blog-body');

  if (!CONFIG.DEVTO_USERNAME) {
    section.hidden = true;
    return;
  }
  section.hidden = false;

  try {
    const res = await fetch(`https://dev.to/api/articles?username=${encodeURIComponent(CONFIG.DEVTO_USERNAME)}&per_page=4`);
    if (!res.ok) throw new Error('feed fetch failed');

    const items = await res.json();
    if (!items.length) throw new Error('empty feed');

    body.innerHTML = items
      .map(
        (p) => `
      <a class="blog-post" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">
        <span class="blog-title">${esc(p.title)}</span>
        <span class="blog-date">$ cat ${new Date(p.published_at).toLocaleDateString()}</span>
      </a>`
      )
      .join('');
  } catch (_) {
    body.innerHTML = `
      <p class="line out">Could not fetch the feed right now.</p>
      <p class="line out muted">Set <code>CONFIG.DEVTO_USERNAME</code> in script.js, or try again later.</p>`;
  }
}

/* ============================================================
   TESTIMONIALS — from CONFIG.TESTIMONIALS
   ============================================================ */
function initTestimonials() {
  const grid = $('#testimonials-grid');
  grid.innerHTML = CONFIG.TESTIMONIALS.map(
    (t) => `
    <div class="terminal testimonial-card">
      <p class="testimonial-quote">${esc(t.quote)}</p>
      <p class="testimonial-author">${esc(t.author)} <span class="t-role">— ${esc(t.role || '')}</span></p>
    </div>`
  ).join('');
}

/* ============================================================
   DISCORD — live presence via Lanyard REST API
   ============================================================ */
const STATUS_COLORS = { online: 'online', idle: 'idle', dnd: 'dnd', offline: 'offline' };

function discordDefaultAvatar(id = '0') {
  try {
    const index = Number((BigInt(id) >> 22n) % 6n);
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
  } catch (_) {
    return `https://cdn.discordapp.com/embed/avatars/0.png`;
  }
}

async function fetchPresence() {
  if (CONFIG.DISCORD_USER_ID === 'YOUR_DISCORD_USER_ID') return { error: 'not_configured' };
  try {
    const res = await fetch(API.lanyard);
    const json = await res.json();
    if (!res.ok || !json.success) {
      const code = json && json.error && json.error.code;
      return { error: code === 'user_not_monitored' ? 'not_monitored' : 'unavailable' };
    }
    return json.data || { error: 'empty' };
  } catch (_) {
    return { error: 'network' };
  }
}

function renderPresence(data) {
  const body = $('#discord-body');
  const updated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fallbackAvatar = discordDefaultAvatar(CONFIG.DISCORD_USER_ID);

  const renderError = (title, msg) => {
    body.innerHTML = `
      <div class="presence">
        <div class="presence-avatar-wrap">
          <img class="presence-avatar" src="${fallbackAvatar}" alt="" />
          <span class="presence-status offline"></span>
        </div>
        <div>
          <p class="presence-name">${esc(title)}</p>
          <p class="presence-tag">${esc(msg)}</p>
        </div>
      </div>
      ${msg.includes('Lanyard') ? '<p class="lanyard-note">Track yourself free at <a href="https://lanyard.rest/dashboard" target="_blank" rel="noopener noreferrer">lanyard.rest/dashboard</a></p>' : ''}
      <p class="presence-meta">$ last updated: ${updated}</p>`;
  };

  if (!data || data.error) {
    if (data && data.error === 'not_monitored') {
      renderError('Not tracked yet', 'Add your Discord ID to Lanyard to show live presence.');
    } else if (data && data.error === 'not_configured') {
      renderError('Not configured', 'Set DISCORD_USER_ID in CONFIG to show live presence.');
    } else {
      renderError('Offline or unavailable', 'Presence could not be fetched right now.');
    }
    return;
  }

  const user = data.discord_user || {};
  const status = data.discord_status || 'offline';
  const statusClass = STATUS_COLORS[status] || 'offline';

  const displayName = user.global_name || user.username || 'Unknown';
  const tagline = user.discriminator && user.discriminator !== '0'
    ? `${user.username}#${user.discriminator}`
    : `@${user.username || displayName}`;

  const avatar = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    : fallbackAvatar;

  const custom = (data.activities || []).find((a) => a.type === 4);
  const game = (data.activities || []).find((a) => a.type === 0 && a.name);
  const spotify = data.spotify;

  const activityHtml = spotify
    ? `
        <div class="spotify-block">
          <img class="spotify-album" src="${esc(spotify.album_art_url)}" alt="" />
          <div>
            <p class="spotify-song"><span class="spotify-pulse">&#9835;</span> ${esc(spotify.song)}</p>
            <p class="spotify-artist">${esc(spotify.artist)}</p>
          </div>
        </div>`
    : game
      ? `<p class="activity-detail"><span class="spotify-pulse">&#9654;</span> Playing ${esc(game.name)}${game.details ? ' &mdash; ' + esc(game.details) : ''}</p>`
      : `<p class="activity-detail">Nothing currently &mdash; idle in the terminal.</p>`;

  body.innerHTML = `
    <div class="presence">
      <div class="presence-avatar-wrap">
        <img class="presence-avatar" src="${esc(avatar)}" alt="Discord avatar of ${esc(displayName)}" />
        <span class="presence-status ${statusClass}" title="${esc(status)}"></span>
      </div>
      <div>
        <p class="presence-name">${esc(displayName)}</p>
        <p class="presence-tag">${esc(tagline)} &middot; ${esc(status)}</p>
      </div>
    </div>

    <div class="presence-activity">
      <p class="activity-label">CURRENT ACTIVITY</p>
      ${custom && custom.state
        ? `<p class="custom-status">&#8220;${esc(custom.state)}&#8221;</p>`
        : ''}
      ${activityHtml}
    </div>
    <p class="presence-meta">$ last updated: ${updated}</p>
  `;
}

async function initDiscord() {
  const refresh = async () => {
    const data = await fetchPresence();
    renderPresence(data);
  };

  await refresh();
  setInterval(refresh, 30_000);
}

/* ============================================================
   GUILD INFO — Discord server stats from invite code
   ============================================================ */
async function initGuildInfo() {
  const el = $('#guild-info');
  const match = (CONFIG.DISCORD_INVITE_URL || '').match(/discord\.(?:gg|com\/invite)\/([\w-]+)/i);
  if (!match) return;

  try {
    const res = await fetch(`https://discord.com/api/v9/invites/${match[1]}?with_counts=true`);
    if (!res.ok) return;
    const j = await res.json();
    if (!j.guild) return;

    el.innerHTML = `
      <img class="guild-icon" src="https://cdn.discordapp.com/icons/${j.guild.id}/${j.guild.icon}.png" alt="" onerror="this.style.display='none'" />
      <div>
        <p class="guild-name">${esc(j.guild.name)}</p>
        <p class="guild-stats">${j.approximate_member_count ?? '?'} members &middot; ${j.approximate_presence_count ?? '?'} online</p>
      </div>`;
  } catch (_) { /* hide silently if CORS/network blocks it */ }
}

/* ============================================================
   MATRIX RAIN — canvas background
   ============================================================ */
const matrix = { on: CONFIG.MATRIX_RAIN, interval: null, active: false };

function initMatrix() {
  const canvas = $('#matrix');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01<>[]{}/\|=+-*$#@%&';

  let drops = [];
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drops = new Array(Math.floor(canvas.width / 18)).fill(1);
  };
  resize();
  window.addEventListener('resize', resize);

  const start = () => {
    if (matrix.active) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    matrix.active = true;
    document.body.classList.add('matrix-on');
    matrix.interval = setInterval(() => {
      if (document.hidden) return; // Saves performance when tab is hidden
      ctx.fillStyle = 'rgba(5, 8, 5, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '14px monospace';
      for (let i = 0; i < drops.length; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillStyle = Math.random() > 0.975 ? '#3fff7a' : '#1f7a3d';
        ctx.fillText(ch, i * 18, drops[i] * 18);
        if (drops[i] * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }, 60);
  };

  const stop = () => {
    matrix.active = false;
    document.body.classList.remove('matrix-on');
    clearInterval(matrix.interval);
  };

  if (matrix.on) start();
  matrix.start = start;
  matrix.stop = stop;
}

function toggleMatrix() {
  matrix.on ? (matrix.stop(), (matrix.on = false)) : (matrix.on = true, matrix.start());
}

/* ============================================================
   COMMAND PALETTE — open with Ctrl/Cmd+K
   ============================================================ */
const COMMANDS = [
  { id: 'help', label: 'help — list available commands', run: () => showToast('ls · grep · sort · activity · history · blog · echo · discord · cat · matrix · exit') },
  { id: 'whoami', label: 'whoami — scroll to top', run: () => scrollToId('#hero') },
  { id: 'ls', label: 'ls ./projects — scroll to projects', run: () => scrollToId('#projects') },
  { id: 'grep', label: 'grep — focus project search', run: () => $('#search-input').focus() },
  { id: 'sortstars', label: 'sort --by=stars — sort projects by stars', run: () => setSort('stars') },
  { id: 'sortupdated', label: 'sort --by=updated — sort projects by latest update', run: () => setSort('updated') },
  { id: 'sortname', label: 'sort --by=name — sort projects alphabetically', run: () => setSort('name') },
  { id: 'activity', label: 'activity --graph — scroll to contribution graph', run: () => scrollToId('#activity') },
  { id: 'history', label: 'history --work — scroll to experience', run: () => scrollToId('#experience') },
  { id: 'blog', label: 'blog --feed — scroll to latest posts', run: () => scrollToId('#blog') },
  { id: 'echo', label: 'echo $REVIEWS — scroll to testimonials', run: () => scrollToId('#testimonials') },
  { id: 'discord', label: 'discord --status — scroll to Discord presence', run: () => scrollToId('#discord') },
  { id: 'mail', label: 'cat email.txt — copy email', run: () => copyEmail() },
  { id: 'matrix', label: 'matrix --toggle — toggle rain effect', run: () => toggleMatrix() },
  { id: 'exit', label: 'exit — scroll to footer', run: () => scrollToId('#footer') },
];

function initPalette() {
  const overlay = $('#palette');
  const input = $('#palette-input');
  const results = $('#palette-results');
  let activeIndex = 0;

  const open = () => {
    overlay.hidden = false;
    input.value = '';
    activeIndex = 0;
    render('');
    input.focus();
  };
  const close = () => { overlay.hidden = true; };

  const render = (query) => {
    const q = query.trim().toLowerCase();
    const list = COMMANDS.filter((c) => c.label.toLowerCase().includes(q) || c.id.includes(q));
    activeIndex = 0;
    results.innerHTML = list
      .map(
        (c, i) =>
          `<li class="palette-item ${i === 0 ? 'active' : ''}" data-id="${c.id}" role="option">` +
          `<span class="cmd-prefix">&gt;_</span> ${esc(c.label)}</li>`
      )
      .join('');
    if (list.length) results.querySelector('.palette-item').scrollIntoView({ block: 'nearest' });
  };

  const runActive = () => {
    const item = results.querySelector('.palette-item.active');
    if (!item) return;
    const cmd = COMMANDS.find((c) => c.id === item.dataset.id);
    if (cmd) { close(); cmd.run(); }
  };

  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  input.addEventListener('input', () => render(input.value));

  input.addEventListener('keydown', (e) => {
    const items = [...results.querySelectorAll('.palette-item')];
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      items.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      items.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runActive();
    }
  });

  results.addEventListener('click', (e) => {
    const item = e.target.closest('.palette-item');
    if (!item) return;
    const cmd = COMMANDS.find((c) => c.id === item.dataset.id);
    if (cmd) { close(); cmd.run(); }
  });

  // Global shortcuts.
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      overlay.hidden ? open() : close();
    } else if (e.key === 'Escape') {
      close();
    } else if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
      const typing = /^(input|textarea|select)$/i.test(document.activeElement.tagName);
      if (!typing) { e.preventDefault(); $('#search-input').focus(); }
    }
  });

  $('#palette-hint').addEventListener('click', () => open());
}

/* ============================================================
   BACK TO TOP
   ============================================================ */
function initToTop() {
  const btn = $('#to-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  $('#year').textContent = new Date().getFullYear();

  if (CONFIG.DISCORD_INVITE_URL !== 'YOUR_DISCORD_INVITE_URL') {
    $('#discord-cta').setAttribute('href', CONFIG.DISCORD_INVITE_URL);
  }

  initHero();
  initSearch();
  initSort();
  initCarousel();
  initProjects();
  initActivity();
  initExperience();
  initBlog();
  initTestimonials();
  initDiscord();
  initGuildInfo();
  initMatrix();
  initPalette();
  initToTop();
});
