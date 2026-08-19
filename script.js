'use strict';

const CONFIG = {
  NAME: 'Sordonyx',
  GITHUB_USERNAME: 'joeajwas',
  BIO: 'I am just a regular programmer, nothing much.',
  DISCORD_USER_ID: '1018907272908374017',
  DISCORD_INVITE_URL: 'https://discord.gg/sKqXcZhNvr',
  EMAIL: 'kumarmajhi743@gmail.com',
  TWITTER: '',
  LINKEDIN: '',
  DEVTO_USERNAME: '',
  MATRIX_RAIN: true,
  EXCLUDED_REPOS: ['demo', 'test', 'playground'],
  MIN_STARS: 0,
  MAX_REPOS: 0,
  CACHE_TTL: 3_600_000,

  /* Your exact journey */
  EXPERIENCE: [
    {
      period: '2025 — Present',
      role: 'Advanced Engineering & High-Level Systems',
      company: 'next_gen.sh',
      desc: 'Leveling up architecture, diving into performance-driven code, backend systems, and complex workflows.',
    },
    {
      period: '2023 — 2025',
      role: 'Game Systems & Custom Projects',
      company: 'sandbox_experiments/',
      desc: 'Engineered custom tools, dedicated game servers, and dynamic web apps built for friends and community.',
    },
    {
      period: '2021 — 2023',
      role: 'The Self-Taught Genesis',
      company: 'hello_world.py',
      desc: 'Wrote first lines of code, broke environments, read docs, and mastered fundamentals completely self-taught.',
    },
  ],

  /* Replaces Reviews with System Specs */
  SPECS: [
    { label: 'OS', value: 'Arch Linux / Ubuntu / Win 11' },
    { label: 'Languages', value: 'Python, TypeScript, JavaScript, HTML/CSS' },
    { label: 'Backend & Data', value: 'Node.js, Express, REST APIs, JSON DBs' },
    { label: 'Infrastructure', value: 'Docker, Pterodactyl Panel, Git, Linux CLI' },
    { label: 'Tooling', value: 'Neovim, VS Code, Google Cloud IDX, Bash' },
    { label: 'Focus', value: 'Game Modding, Automation Daemons, Systems' }
  ]
};

const API = {
  github: `https://api.github.com/users/${CONFIG.GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
  githubProfile: `https://api.github.com/users/${CONFIG.GITHUB_USERNAME}`,
  lanyard: `https://api.lanyard.rest/v1/users/${CONFIG.DISCORD_USER_ID}`,
};

const CACHE_KEY = 'portfolio-gh-cache-v1';

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

function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch (_) {}
}

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.data) return null;
    return { data: parsed.data, stale: Date.now() - parsed.ts > CONFIG.CACHE_TTL };
  } catch (_) {
    return null;
  }
}

function formatCount(n) {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
  return (n / 1_000_000).toFixed(1) + 'M';
}

function scrollToId(id) {
  const el = $(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const TYPEWRITER_PHRASES = [
  'Full-Stack Developer & Open Source Enthusiast',
  'I build tools, web apps, and automation that feel like magic.',
  'Currently exploring high-level architecture & performance systems.',
];

async function initHero() {
  $('#hero-name').textContent = CONFIG.NAME;
  $('#hero-bio').textContent = CONFIG.BIO;
  $('#footer-name').textContent = CONFIG.NAME;

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

  socials.querySelectorAll('.social-link[href^="mailto"]').forEach((a) => {
    a.addEventListener('click', (e) => { e.preventDefault(); copyEmail(); });
  });

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
      setTimeout(tick, 2200);
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
    } catch (_) {}
  }
}

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

async function fetchRepos() {
  const cached = getCache();
  if (cached && !cached.stale) return { repos: cached.data, rateLimited: false };

  try {
    const res = await fetch(API.github, { headers: { Accept: 'application/vnd.github+json' } });
    if (res.status === 403) return { repos: cached ? cached.data : [], rateLimited: true };
    if (!res.ok) return { repos: cached ? cached.data : [], error: res.status };

    const repos = (await res.json())
      .filter((r) => !r.fork)
      .filter((r) => !CONFIG.EXCLUDED_REPOS.some((w) => r.name.toLowerCase().includes(w)))
      .filter((r) => r.stargazers_count >= CONFIG.MIN_STARS);

    setCache(repos);
    return { repos, rateLimited: false };
  } catch (err) {
    return { repos: cached ? cached.data : [], error: err.message };
  }
}

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

const state = {
  repos: [],
  query: '',
  lang: 'All',
  sort: 'stars',
};

function renderFilterTabs(repos) {
  const tabs = $('#filter-tabs');
  const langs = ['All', ...new Set(repos.map((r) => r.language || 'Other'))].filter(Boolean).slice(0, 8);

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
      const matchesQuery = query === '' || `${r.name} ${r.description || ''} ${r.language || ''}`.toLowerCase().includes(query);
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
    carousel.innerHTML = `<div class="fallback-card"><h3>&#128269; No matches</h3><p>Nothing found for "${esc(query)}".</p></div>`;
    return;
  }

  filtered.forEach((repo) => carousel.appendChild(createProjectCard(repo)));
}

async function initProjects() {
  const carousel = $('#carousel');
  carousel.innerHTML = '<div class="skel project-card" style="height:180px; width:300px;"></div>';

  const { repos } = await fetchRepos();
  carousel.innerHTML = '';

  if (repos.length) {
    state.repos = repos;
    renderFilterTabs(repos);
    renderProjects();
  }
}

function initCarousel() {
  const carousel = $('#carousel');
  const prev = $('#carousel-prev');
  const next = $('#carousel-next');

  prev.addEventListener('click', () => carousel.scrollBy({ left: -340, behavior: 'smooth' }));
  next.addEventListener('click', () => carousel.scrollBy({ left: 340, behavior: 'smooth' }));

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
    if (Math.abs(dx) > 15) dragged = true;
    carousel.scrollLeft = scrollLeft - dx;
  });

  window.addEventListener('pointerup', () => {
    isDown = false;
    carousel.classList.remove('dragging');
    setTimeout(() => { dragged = false; }, 80);
  });

  carousel.addEventListener('click', (e) => {
    if (dragged) { e.preventDefault(); e.stopPropagation(); }
  }, true);
}

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

  const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  const open = () => { menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); };

  btn.addEventListener('click', (e) => { e.stopPropagation(); menu.hidden ? open() : close(); });
  options.forEach((o) => o.addEventListener('click', (e) => { e.stopPropagation(); setSort(o.dataset.sort); close(); }));
  document.addEventListener('click', (e) => { if (!e.target.closest('.sort-dropdown')) close(); });
}

function initActivity() {
  const body = $('#activity-body');
  const img = document.createElement('img');
  img.className = 'gh-chart';
  img.alt = `${CONFIG.GITHUB_USERNAME}'s GitHub contribution graph`;
  img.src = `https://ghchart.rshah.org/00ff41/${CONFIG.GITHUB_USERNAME}`;
  img.onload = () => { body.innerHTML = ''; body.appendChild(img); };
  img.onerror = () => { body.innerHTML = '<p class="line out muted">Graph loaded once deployed.</p>'; };
}

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

function initSpecs() {
  const grid = $('#stack-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="neofetch-ascii">
      <pre class="ascii-art">
   /\\_/\\  
  ( o.o ) 
   > ^ <  
 DEV_BOX
      </pre>
    </div>
    <div class="neofetch-info">
      ${CONFIG.SPECS.map(s => `
        <p class="line">
          <span class="highlight prompt">${esc(s.label)}</span>: <span class="muted">${esc(s.value)}</span>
        </p>
      `).join('')}
      <div class="color-blocks">
        <span class="c-block" style="background:#ff5566;"></span>
        <span class="c-block" style="background:#ffb52e;"></span>
        <span class="c-block" style="background:#3fff7a;"></span>
        <span class="c-block" style="background:#35e0ff;"></span>
        <span class="c-block" style="background:#a97bff;"></span>
      </div>
    </div>
  `;
}

async function initDiscord() {
  const body = $('#discord-body');
  const updated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  try {
    const res = await fetch(API.lanyard);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error();

    const user = json.data.discord_user || {};
    const status = json.data.discord_status || 'offline';
    const avatar = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
      : `https://github.com/${esc(CONFIG.GITHUB_USERNAME)}.png`;

    body.innerHTML = `
      <div class="presence">
        <div class="presence-avatar-wrap">
          <img class="presence-avatar" src="${esc(avatar)}" alt="Discord avatar" />
          <span class="presence-status ${status}"></span>
        </div>
        <div>
          <p class="presence-name">${esc(user.global_name || user.username)}</p>
          <p class="presence-tag">@${esc(user.username)} &middot; ${status}</p>
        </div>
      </div>
      <div class="presence-activity">
        <p class="activity-label">CURRENT ACTIVITY</p>
        <p class="activity-detail">Active in terminal &amp; servers</p>
      </div>
      <p class="presence-meta">$ last updated: ${updated}</p>
    `;
  } catch (_) {
    body.innerHTML = `
      <div class="presence">
        <div class="presence-avatar-wrap">
          <img class="presence-avatar" src="https://github.com/${esc(CONFIG.GITHUB_USERNAME)}.png" alt="Avatar" />
          <span class="presence-status online"></span>
        </div>
        <div>
          <p class="presence-name">${esc(CONFIG.NAME)}</p>
          <p class="presence-tag">@${esc(CONFIG.GITHUB_USERNAME)} &middot; Online</p>
        </div>
      </div>
      <div class="presence-activity">
        <p class="activity-label">CURRENT ACTIVITY</p>
        <p class="activity-detail"><span class="spotify-pulse">&#9654;</span> Building high-level systems &amp; servers</p>
      </div>
      <p class="presence-meta">$ last updated: ${updated}</p>
    `;
  }
}

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
  } catch (_) {}
}

const matrix = { on: CONFIG.MATRIX_RAIN, interval: null, active: false };

function initMatrix() {
  const canvas = $('#matrix');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01<>[]{}/\\|=+-*$#@%&';

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
    matrix.active = true;
    document.body.classList.add('matrix-on');
    matrix.interval = setInterval(() => {
      if (document.hidden) return;
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

const COMMANDS = [
  { id: 'help', label: 'help — list available commands', run: () => showToast('ls · grep · sort · activity · history · specs · discord · cat · matrix · exit') },
  { id: 'whoami', label: 'whoami — scroll to top', run: () => scrollToId('#hero') },
  { id: 'ls', label: 'ls ./projects — scroll to projects', run: () => scrollToId('#projects') },
  { id: 'grep', label: 'grep — focus project search', run: () => $('#search-input').focus() },
  { id: 'sortstars', label: 'sort --by=stars — sort projects by stars', run: () => setSort('stars') },
  { id: 'sortupdated', label: 'sort --by=updated — sort projects by latest update', run: () => setSort('updated') },
  { id: 'sortname', label: 'sort --by=name — sort projects alphabetically', run: () => setSort('name') },
  { id: 'activity', label: 'activity --graph — scroll to contribution graph', run: () => scrollToId('#activity') },
  { id: 'history', label: 'history --work — scroll to experience', run: () => scrollToId('#experience') },
  { id: 'specs', label: 'neofetch --specs — inspect environment & stack', run: () => scrollToId('#stack') },
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
      .map((c, i) => `<li class="palette-item ${i === 0 ? 'active' : ''}" data-id="${c.id}" role="option"><span class="cmd-prefix">&gt;_</span> ${esc(c.label)}</li>`)
      .join('');
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

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      overlay.hidden ? open() : close();
    }
  });

  $('#palette-hint').addEventListener('click', open);
}

function initToTop() {
  const btn = $('#to-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

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
  initSpecs();
  initDiscord();
  initGuildInfo();
  initMatrix();
  initPalette();
  initToTop();
});
