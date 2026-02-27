// ── Config ────────────────────────────────────────────────────────────────────
const WM_KEY     = 'eLLuTN9mYhAAWBNl1P3XOGgRKFA1toAVWhOiYX3m';
const WM_BASE    = 'https://api.watchmode.com/v1';
const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZWI4MDVlODg2MmYyODhkOTQ1NDhmOTU1NGYyZjc2YiIsIm5iZiI6MTY3OTQ3MzE2Ni43NzMsInN1YiI6IjY0MWFiYTBlZjlhYTQ3MDBiMTUxZGRmYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.E73D999tD0DBX0aJVVfyooRa3T750C-Y_Hk1TZLr-EM';
const TMDB_BASE  = 'https://api.themoviedb.org/3';
const TMDB_IMG   = 'https://image.tmdb.org/t/p/w300';
const OMDB_KEY   = '';

// ── Providers ─────────────────────────────────────────────────────────────────
const WANTED_PROVIDERS = [
  { match: 'netflix',       key: 'netflix',     name: 'Netflix',        color: '#E50914', text: '#fff' },
  { match: 'prime video',   key: 'prime video', name: 'Prime Video',    color: '#00A8E0', text: '#fff' },
  { match: 'amazon prime',  key: 'prime video', name: 'Prime Video',    color: '#00A8E0', text: '#fff' },
  { match: 'disney plus',   key: 'disney+',     name: 'Disney+',        color: '#113CCF', text: '#fff' },
  { match: 'disney+',       key: 'disney+',     name: 'Disney+',        color: '#113CCF', text: '#fff' },
  { match: 'apple tv plus', key: 'apple tv+',   name: 'Apple TV+',      color: '#555555', text: '#fff' },
  { match: 'apple tv+',     key: 'apple tv+',   name: 'Apple TV+',      color: '#555555', text: '#fff' },
  { match: 'apple tv',      key: 'apple tv+',   name: 'Apple TV+',      color: '#555555', text: '#fff' },
  { match: 'max ',          key: 'max',         name: 'Max',            color: '#5822B4', text: '#fff' },
  { match: 'hbo max',       key: 'max',         name: 'Max',            color: '#5822B4', text: '#fff' },
  { match: 'skyshowtime',   key: 'skyshowtime', name: 'SkyShowtime',    color: '#003E7E', text: '#fff' },
  { match: 'videoland',     key: 'videoland',   name: 'Videoland',      color: '#CC0000', text: '#fff' },
  { match: 'path',          key: 'pathe',       name: 'Pathé Thuis',    color: '#FF6B00', text: '#fff' },
  { match: 'npo',           key: 'npo',         name: 'NPO Start',      color: '#FF6600', text: '#fff' },
  { match: 'paramount',     key: 'paramount',   name: 'Paramount+',     color: '#0064FF', text: '#fff' },
  { match: 'discovery',     key: 'discovery',   name: 'Discovery+',     color: '#0036A0', text: '#fff' },
  { match: 'viaplay',       key: 'viaplay',     name: 'Viaplay',        color: '#1F1646', text: '#fff' },
  { match: 'canal',         key: 'canal',       name: 'Canal+',         color: '#000000', text: '#fff' },
  { match: 'mubi',          key: 'mubi',        name: 'MUBI',           color: '#00B4B4', text: '#fff' },
  { match: 'cinemember',    key: 'cinemember',  name: 'CineMember',     color: '#E8003D', text: '#fff' },
  { match: 'film1',         key: 'film1',       name: 'Film1',          color: '#D10000', text: '#fff' },
];

const POPULAR_KEYS = [
  'netflix','prime video','max','disney+','videoland',
  'apple tv+','skyshowtime','viaplay','pathe','npo',
  'paramount','discovery','mubi','cinemember','film1','canal',
];

let TMDB_NL_PROVIDERS = {};

// ── Helpers ───────────────────────────────────────────────────────────────────
function matchProvider(name) {
  const lower = (name || '').toLowerCase().replace(/[^a-z0-9\s]/g,'').trim();
  return WANTED_PROVIDERS.find(p => lower.includes(p.match));
}
function getSvcStyle(name = '') {
  const p = matchProvider(name);
  return p ? { color: p.color, text: p.text } : { color: '#444444', text: '#fff' };
}
function providerKey(name) {
  const p = matchProvider(name);
  return p ? p.key : (name || '').toLowerCase().replace(/netherlands/gi,'').replace(/\s+/g,' ').trim();
}
function isNLStreaming(name) { return !!matchProvider(name); }
function detectOrigin(svcName) {
  const n = (svcName || '').toLowerCase();
  return ['netflix','disney','max','hbo','videoland','apple','npo'].some(s => n.includes(s))
    ? 'original' : 'licensed';
}
function resolveType(apiType) {
  if (!apiType) return null;
  const t = String(apiType).toLowerCase();
  if (t === 'movie') return 'movie';
  if (t.startsWith('tv_') || t.includes('series') || t.includes('miniseries') || t.includes('special')) return 'tv';
  return null;
}

// ── State ─────────────────────────────────────────────────────────────────────
let allItems = [];
let typeFilter = 'all', svcFilter = 'all';
const detailCache = {};
const imgCache = {};
const WINDOW_SIZE = 7;
let allDays = [], windowStart = 0;
let wmSources = [], wmSourceMap = {};
let currentModalItem = null;

// ── Thema ─────────────────────────────────────────────────────────────────────
function applyTheme(theme) {
  if (theme === 'light') {
    document.body.dataset.theme = 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f5f5f7');
    document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute('content', 'default');
  } else {
    delete document.body.dataset.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#050509');
    document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute('content', 'black-translucent');
  }
}
function toggleTheme() {
  const next = document.body.dataset.theme === 'light' ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem('streamgids_theme', next);
}

// ── Web Share ─────────────────────────────────────────────────────────────────
async function shareItem() {
  if (!currentModalItem) return;
  const title = currentModalItem.title || 'StreamGids';
  const text = `Bekijk "${title}" via StreamGids`;
  if (navigator.share) {
    try { await navigator.share({ title, text, url: window.location.href }); }
    catch(e) { console.log('Delen geannuleerd:', e); }
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + window.location.href)}`, '_blank');
  }
}

// ── Session cache ─────────────────────────────────────────────────────────────
function scGet(key) {
  try { const v = sessionStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function scSet(key, val) {
  try { sessionStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── Datum helpers ─────────────────────────────────────────────────────────────
function dateOffset(offset) {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}
function dateStr(offset = 0) { return dateOffset(offset).replace(/-/g, ''); }
function isoDate(wmDate) {
  if (!wmDate) return '';
  const s = String(wmDate);
  if (s.includes('-')) return s.slice(0, 10);
  return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`;
}
function todayISO() { return new Date().toISOString().slice(0, 10); }
function dayName(iso) {
  const n = new Date(iso + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'long' });
  return n.charAt(0).toUpperCase() + n.slice(1);
}
function fullDate(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('nl-NL', { day:'numeric', month:'long', year:'numeric' });
}
function shortDate(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('nl-NL', { day:'numeric', month:'short' });
}

// ── API helpers ───────────────────────────────────────────────────────────────
async function wm(path, params = {}) {
  const url = new URL(WM_BASE + path);
  url.searchParams.set('apiKey', WM_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const cKey = 'wm_' + url.toString();
  const cached = scGet(cKey); if (cached) return cached;
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`Watchmode ${r.status}`);
  const data = await r.json(); scSet(cKey, data); return data;
}

async function tmdb(path, params = {}) {
  const url = new URL(TMDB_BASE + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const cKey = 'tmdb_' + url.toString();
  const cached = scGet(cKey); if (cached) return cached;
  const r = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${TMDB_TOKEN}`, 'Content-Type': 'application/json' }
  });
  if (!r.ok) throw new Error(`TMDB ${r.status} (${path})`);
  const data = await r.json(); scSet(cKey, data); return data;
}

async function translateToNL(text) {
  if (!text || !text.trim()) return 'Geen beschrijving beschikbaar.';
  try {
    const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=en|nl`);
    const d = await r.json();
    const t = d?.responseData?.translatedText;
    return (t && t !== text && !t.toLowerCase().includes('mymemory')) ? t : text;
  } catch { return text; }
}

async function fetchOMDB(imdbId) {
  if (!OMDB_KEY || !imdbId) return null;
  const cKey = 'omdb_' + imdbId;
  const cached = scGet(cKey); if (cached) return cached;
  try {
    const r = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_KEY}&i=${imdbId}`);
    if (!r.ok) return null;
    const d = await r.json();
    if (d.Response === 'False') return null;
    scSet(cKey, d); return d;
  } catch { return null; }
}

// ── Watchmode ─────────────────────────────────────────────────────────────────
async function fetchWMSources() {
  try {
    const data = await wm('/sources', { regions: 'NL' });
    const all = Array.isArray(data) ? data : [];
    all.filter(s => s.regions?.includes('NL')).forEach(s => { wmSourceMap[s.id] = s; });
    wmSources = all.filter(s => s.type === 'sub' && s.regions?.includes('NL'))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } catch(e) { console.warn('WM sources failed:', e); wmSources = []; }
}

async function fetchWMReleases() {
  const from = dateStr(-60), to = dateStr(30);
  const [movRes, tvRes] = await Promise.all([
    wm('/releases', { regions:'NL', start_date:from, end_date:to, types:'movie', limit:500 }),
    wm('/releases', { regions:'NL', start_date:from, end_date:to, types:'tv_series,tv_miniseries,tv_special,tv_movie', limit:500 }),
  ]);
  function parse(res, fallbackType) {
    return (res?.releases || []).map(item => {
      const src = wmSourceMap[item.source_id] || { name: item.source_name || '' };
      const svcName = (src.name || '').replace(/Netherlands/gi,'').trim();
      if (!svcName || (!isNLStreaming(svcName) && !src.regions?.includes('NL'))) return null;
      const resolved = resolveType(item.type || item.title_type) || fallbackType;
      return {
        ...item,
        img: item.poster_url || null,
        _type: resolved,
        _date: isoDate(item.source_release_date),
        _src: { ...src, name: svcName || src.name },
        _style: getSvcStyle(svcName),
        _key: providerKey(svcName),
        _originType: detectOrigin(svcName),
        _source: 'watchmode',
        _season: item.season_number || null,
      };
    }).filter(Boolean);
  }
  return [...parse(movRes, 'movie'), ...parse(tvRes, 'tv')];
}

// ── TMDB providers ────────────────────────────────────────────────────────────
async function fetchTMDBProviders() {
  const [movData, tvData] = await Promise.all([
    tmdb('/watch/providers/movie', { watch_region: 'NL', language: 'nl-NL' }),
    tmdb('/watch/providers/tv',    { watch_region: 'NL', language: 'nl-NL' }),
  ]);
  const seen = new Set();
  [...(movData.results||[]), ...(tvData.results||[])].forEach(p => {
    if (seen.has(p.provider_id)) return; seen.add(p.provider_id);
    const matched = matchProvider(p.provider_name); if (!matched) return;
    TMDB_NL_PROVIDERS[p.provider_id] = {
      name: matched.name, color: matched.color, text: matched.text,
      logo: p.logo_path ? `https://image.tmdb.org/t/p/original${p.logo_path}` : null,
      rawName: p.provider_name,
    };
  });
}

async function tmdbPages(path, params, maxPages = 3) {
  const first = await tmdb(path, { ...params, page: 1 }).catch(() => ({ results: [], total_pages: 0 }));
  const all = [...(first.results || [])];
  const total = Math.min(first.total_pages || 1, maxPages);
  if (total > 1) {
    const rest = await Promise.all(
      Array.from({ length: total - 1 }, (_, i) =>
        tmdb(path, { ...params, page: i + 2 }).catch(() => ({ results: [] }))
      )
    );
    rest.forEach(r => all.push(...(r.results || [])));
  }
  return all;
}

async function fetchTMDBReleases() {
  const items = [];
  const providerEntries = Object.entries(TMDB_NL_PROVIDERS);
  if (!providerEntries.length) return [];

  function makeItem(m, prov, id, type) {
    const date = type === 'movie' ? (m.release_date || '') : (m.first_air_date || '');
    if (!date || !m.id) return null;
    return {
      id: `tmdb-${m.id}-${id}`,
      title: m.title || m.name || m.original_title || m.original_name || '',
      img: m.poster_path ? `${TMDB_IMG}${m.poster_path}` : null,
      _type: type, _date: date,
      _src: { name: prov.name, logo_100px: prov.logo },
      _style: { color: prov.color, text: prov.text },
      _key: providerKey(prov.name),
      _originType: detectOrigin(prov.name),
      _source: 'tmdb', _providerId: Number(id),
      tmdb_id: m.id, user_rating: m.vote_average || 0, overview: m.overview || '',
    };
  }

  document.getElementById('loadSub').textContent = 'TMDB: actuele titels ophalen…';
  try {
    const [nowMov, onAirTV] = await Promise.all([
      tmdbPages('/movie/now_playing', { language:'nl-NL', region:'NL' }, 5),
      tmdbPages('/tv/on_the_air',     { language:'nl-NL' }, 5),
    ]);
    const checkItems = [
      ...nowMov.slice(0, 50).map(m => ({ ...m, _isTV: false })),
      ...onAirTV.slice(0, 50).map(t => ({ ...t, _isTV: true })),
    ];
    const batchSize = 10;
    for (let i = 0; i < checkItems.length; i += batchSize) {
      await Promise.all(checkItems.slice(i, i + batchSize).map(async m => {
        try {
          const pd = await tmdb(`/${m._isTV ? 'tv' : 'movie'}/${m.id}/watch/providers`);
          const flat = pd?.results?.NL?.flatrate || [];
          for (const p of flat) {
            const prov = TMDB_NL_PROVIDERS[p.provider_id]; if (!prov) continue;
            const it = makeItem(m, prov, p.provider_id, m._isTV ? 'tv' : 'movie');
            if (it) items.push(it);
          }
        } catch {}
      }));
    }
  } catch(e) { console.warn('TMDB now_playing/on_the_air:', e); }

  const BATCH = 4;
  for (let i = 0; i < providerEntries.length; i += BATCH) {
    const batch = providerEntries.slice(i, i + BATCH);
    document.getElementById('loadSub').textContent = `TMDB: ${batch.map(([,p]) => p.name).join(', ')}…`;
    await Promise.all(batch.map(async ([id, prov]) => {
      const base = {
        watch_region: 'NL', with_watch_providers: id,
        with_watch_monetization_types: 'flatrate',
        language: 'nl-NL', sort_by: 'popularity.desc',
      };
      const cutoff = dateOffset(-1095);
      const [movs, tvs] = await Promise.all([
        tmdbPages('/discover/movie', { ...base, 'primary_release_date.gte': cutoff }, 5).catch(() => []),
        tmdbPages('/discover/tv',    { ...base, 'first_air_date.gte': cutoff }, 5).catch(() => []),
      ]);
      movs.forEach(m => { const it = makeItem(m, prov, id, 'movie'); if (it) items.push(it); });
      tvs.forEach(t  => { const it = makeItem(t, prov, id, 'tv');    if (it) items.push(it); });
    })).catch(e => console.warn('TMDB discover batch:', e));
  }

  return items;
}

// ── Samenvoegen & dedupliceren ────────────────────────────────────────────────
function mergeItems(wmItems, tmdbItems) {
  const result = [], seen = new Set();
  for (const item of wmItems) {
    if (!item._date) continue;
    const k = `${(item.title||'').toLowerCase().trim()}|${item._key}`;
    if (seen.has(k)) continue; seen.add(k); result.push(item);
  }
  const tmdbSeen = new Set();
  for (const item of tmdbItems) {
    if (!item._date || !item.title) continue;
    const dupKey = `${item.tmdb_id}|${item._key}`;
    if (tmdbSeen.has(dupKey)) continue; tmdbSeen.add(dupKey);
    const titleKey = `${(item.title||'').toLowerCase().trim()}|${item._key}`;
    if (seen.has(titleKey)) continue; seen.add(titleKey); result.push(item);
  }
  return result;
}

// ── Service bar ───────────────────────────────────────────────────────────────
function buildSvcBar() {
  const bar = document.getElementById('svcBar');
  const provMap = new Map();
  for (const item of allItems) {
    const key = item._key || ''; if (provMap.has(key)) continue;
    provMap.set(key, { name: item._src?.name || key, style: item._style, logo: item._src?.logo_100px || null });
  }
  const entries = [...provMap.entries()].sort((a, b) => {
    const keyA = String(a[0]).toLowerCase(), keyB = String(b[0]).toLowerCase();
    const rankA = POPULAR_KEYS.indexOf(keyA) === -1 ? 999 : POPULAR_KEYS.indexOf(keyA);
    const rankB = POPULAR_KEYS.indexOf(keyB) === -1 ? 999 : POPULAR_KEYS.indexOf(keyB);
    if (rankA !== rankB) return rankA - rankB;
    return a[1].name.localeCompare(b[1].name);
  });
  bar.innerHTML = `<button class="sc active" data-k="all" onclick="setSvc(this)" aria-pressed="true">Alle streamers</button>`;
  entries.forEach(([key, info]) => {
    const logoEl = info.logo
      ? `<img src="${info.logo}" alt="${info.name} logo" onerror="this.style.display='none'" loading="lazy">`
      : `<div class="dot" style="background:${info.style.color}" aria-hidden="true"></div>`;
    bar.innerHTML += `<button class="sc${svcFilter===key?' active':''}" data-k="${key}" onclick="setSvc(this)" aria-pressed="${svcFilter===key}">${logoEl}${info.name}</button>`;
  });
}

// ── Filters & rendering ───────────────────────────────────────────────────────
function filteredItems() {
  return allItems.filter(i => {
    if (typeFilter === 'movie' && i._type !== 'movie') return false;
    if (typeFilter === 'tv'    && i._type !== 'tv')    return false;
    if (svcFilter !== 'all'   && i._key !== svcFilter) return false;
    return !!i._date;
  });
}

function buildDayList() {
  const set = new Set();
  for (let i = -30; i <= 30; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    set.add(d.toISOString().slice(0, 10));
  }
  filteredItems().forEach(i => set.add(i._date));
  allDays = [...set].sort();
  const today = todayISO();
  let idx = allDays.indexOf(today);
  if (idx === -1) idx = allDays.findIndex(d => d >= today);
  if (idx === -1) idx = Math.max(0, allDays.length - WINDOW_SIZE);
  windowStart = idx;
}

function grouped() {
  const map = {};
  filteredItems().forEach(i => {
    if (!map[i._date]) map[i._date] = { movies: [], tv: [] };
    (i._type === 'movie' ? map[i._date].movies : map[i._date].tv).push(i);
  });
  return map;
}

function shiftWindow(delta) {
  windowStart = Math.max(0, Math.min(allDays.length - WINDOW_SIZE, windowStart + delta));
  renderAll(); window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateNavBar() {
  const bar = document.getElementById('navBar');
  if (!allDays.length) { bar.style.display = 'none'; return; }
  bar.style.display = 'flex';
  const vis = allDays.slice(windowStart, windowStart + WINDOW_SIZE);
  document.getElementById('navRange').textContent = vis.length
    ? `${shortDate(vis[0])} – ${shortDate(vis[vis.length-1])}` : '';
  document.getElementById('btnPrev').disabled = windowStart <= 0;
  document.getElementById('btnNext').disabled = windowStart + WINDOW_SIZE >= allDays.length;
}

function renderAll() {
  const main = document.getElementById('main'); main.innerHTML = '';
  const g = grouped(), today = todayISO();
  const vis = allDays.slice(windowStart, windowStart + WINDOW_SIZE);
  vis.forEach((iso, i) => {
    const data = g[iso];
    const movies = data?.movies || [], tv = data?.tv || [];
    const sec = document.createElement('section');
    sec.className = 'day-section'; sec.style.animationDelay = `${i * 0.04}s`;
    const chip = iso === today ? '<span class="today-chip">Vandaag</span>' : '';
    let html = `
      <div class="day-header"><div class="day-name">${dayName(iso)}</div>${chip}</div>
      <div class="day-sub">${fullDate(iso)}</div>`;
    if (!movies.length && !tv.length) {
      html += `<div class="empty-day">Geen nieuwe releases op deze dag.</div>`;
    } else {
      const allForDay = [...movies, ...tv];
      html += `<div class="day-count-sub">${allForDay.length} titel${allForDay.length !== 1 ? 's' : ''} nieuw</div>`;
      if (movies.length) {
        html += `<div class="cat-row-list">🎬 Films <span class="cat-count">${movies.length}</span></div>`;
        html += `<div class="list-view">${movies.map(listRowHtml).join('')}</div>`;
      }
      if (tv.length) {
        html += `<div class="cat-row-list" style="margin-top:${movies.length?'14px':'0'}">📺 Series <span class="cat-count">${tv.length}</span></div>`;
        html += `<div class="list-view">${tv.map(listRowHtml).join('')}</div>`;
      }
    }
    html += '<div class="divider"></div>';
    sec.innerHTML = html; main.appendChild(sec);
  });
  if (!vis.length) {
    main.innerHTML = `<div class="loading-screen"><div class="loading-text">Geen releases gevonden.</div></div>`;
  }
  updateNavBar();
}

async function cardImgError(imgEl, itemId) {
  imgEl.style.display = 'none';
  const fallback = imgEl.nextElementSibling;
  if (fallback) fallback.style.display = 'flex';
  if (imgCache[itemId]) {
    imgEl.src = imgCache[itemId]; imgEl.style.display = 'block';
    if (fallback) fallback.style.display = 'none'; return;
  }
  const item = allItems.find(i => String(i.id) === String(itemId));
  if (!item || !item.title) return;
  try {
    const type = item._type === 'movie' ? 'movie' : 'tv';
    const res = await tmdb(`/search/${type}`, { query: item.title, language: 'nl-NL' });
    const hit = (res.results || []).find(r => r.poster_path);
    if (hit?.poster_path) {
      const url = `${TMDB_IMG}${hit.poster_path}`;
      imgCache[itemId] = url; item.img = url;
      imgEl.src = url; imgEl.style.display = 'block';
      if (fallback) fallback.style.display = 'none';
    }
  } catch {}
}

// Proactively fetch missing posters after render and update DOM
async function enrichMissingPosters() {
  const missing = allItems.filter(i => !i.img && !imgCache[i.id] && i.title);
  const BATCH = 6;
  for (let i = 0; i < missing.length; i += BATCH) {
    await Promise.all(missing.slice(i, i + BATCH).map(async item => {
      try {
        const type = item._type === 'movie' ? 'movie' : 'tv';
        const res = await tmdb(`/search/${type}`, { query: item.title, language: 'nl-NL' });
        const hit = (res.results || []).find(r => r.poster_path);
        if (!hit?.poster_path) return;
        const url = `${TMDB_IMG}${hit.poster_path}`;
        imgCache[item.id] = url; item.img = url;
        // Update all visible fallback divs for this item
        const safeId = String(item.id).replace(/['"\\]/g, '');
        const fallbackEl = document.getElementById(`fallback-${safeId}`);
        if (fallbackEl) {
          const poster = fallbackEl.closest('.list-poster');
          if (poster) {
            const img = document.createElement('img');
            img.src = url; img.alt = item.title;
            img.loading = 'lazy';
            img.onerror = () => {};
            poster.insertBefore(img, fallbackEl);
            fallbackEl.style.display = 'none';
          }
        }
      } catch {}
    }));
  }
}

function cardHtml(item) {
  return listRowHtml(item);
}

function listRowHtml(item) {
  const title = (item.title || '').replace(/'/g, "&#39;").replace(/"/g, '&quot;');
  const { color, text } = item._style;
  const svcName = (item._src?.name || 'Streaming').replace(/Netherlands/gi,'').trim();
  const safeId = String(item.id).replace(/['"\\]/g, '');
  const posterSrc = imgCache[item.id] || item.img || '';
  const typeLabel = item._type === 'movie' ? 'Film' : 'Serie';
  const seasonLabel = (item._type === 'tv' && item._season) ? ` · S${item._season}` : '';
  const rating = item.user_rating ? Number(item.user_rating).toFixed(1) : '';
  const isNew = false; // badge removed

  const logoEl = item._src?.logo_100px
    ? `<img class="list-svc-logo" src="${item._src.logo_100px}" alt="${svcName}" onerror="this.style.display='none'" loading="lazy">`
    : `<div class="list-svc-dot" style="background:${color}"></div>`;

  const imdbEl = rating
    ? `<div class="list-imdb"><span class="list-imdb-label">IMDb</span>${rating}</div>`
    : '';

  const newBadge = isNew ? `<span class="list-new-badge">⭐ Nieuw!</span>` : '';

  return `
    <div class="list-row" onclick="openModal('${safeId}')" role="article" aria-label="${title} op ${svcName}">
      <div class="list-poster">
        ${posterSrc
          ? `<img src="${posterSrc}" alt="Poster van ${title}" loading="lazy" onerror="cardImgError(this,'${safeId}')">`
          : `<div class="fallback" id="fallback-${safeId}" style="display:flex;align-items:center;justify-content:center;height:100%;padding:8px;font-size:10px;color:var(--t2);text-align:center">${title}</div>`}
        <div class="list-type-badge">${typeLabel}${seasonLabel}</div>
      </div>
      <div class="list-info">
        <div class="list-title">${title}</div>
        <div class="list-genre">${typeLabel} · ${svcName}</div>
        <div class="list-svc-row">
          ${logoEl}
          <span class="list-svc-link" style="color:${color}">Kijk op ${svcName}</span>
        </div>
      </div>
      <div class="list-right">
        ${imdbEl}
      </div>
    </div>`;
}

// ── Modal ─────────────────────────────────────────────────────────────────────
async function openModal(rawId) {
  const overlay    = document.getElementById('overlay');
  const si         = document.getElementById('si');
  const sd         = document.getElementById('sd');
  const wb         = document.getElementById('wb');
  const shareBtn   = document.getElementById('shareBtn');
  const ratingsRow = document.getElementById('ratingsRow');

  const item = allItems.find(i => String(i.id) === String(rawId));
  if (!item) return;
  currentModalItem = item;

  const { title, img, _src, _style, _type, _originType, _source, tmdb_id } = item;
  const svcName = (_src?.name || 'Streaming').replace(/Netherlands/gi,'').trim();
  const { color } = _style;
  const initPoster = imgCache[item.id] || img || '';

  si.innerHTML = `
    <div class="sp">${initPoster ? `<img src="${initPoster}" alt="">` : ''}</div>
    <div class="sinf">
      <div class="ssvc" style="color:${color}">${svcName}</div>
      <div class="stitle">${title}</div>
      <div class="smeta">${_type === 'movie' ? 'Film' : 'Serie'} · laden…</div>
    </div>`;

  const immediateOverview = item.overview || '';
  sd.textContent = immediateOverview || 'Beschrijving laden…';
  ratingsRow.style.display = 'none';
  ratingsRow.innerHTML = '';
  wb.style.display = 'none';
  if (shareBtn) shareBtn.style.display = 'flex';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  let fullTitle = title, year = '', runtime = '', rating = '', genres = '';
  let rawOverview = immediateOverview;
  let watchLink = null, imdbId = null;
  let seasonInfo = item._season ? `Seizoen ${item._season}` : '';
  let posterUrl = initPoster;
  let tmdbRating = item.user_rating || 0;
  let imdbRating = '', rtRating = '';

  const resolvedTmdbId = tmdb_id
    || (_source === 'tmdb' ? String(rawId).replace(/tmdb-(\d+)-.*/,'$1') : null);

  if (resolvedTmdbId) {
    const cKey = `tmdb-${_type}-${resolvedTmdbId}`;
    if (!detailCache[cKey]) {
      try {
        const path = _type === 'movie' ? `/movie/${resolvedTmdbId}` : `/tv/${resolvedTmdbId}`;
        const [det, prov, extIds] = await Promise.all([
          tmdb(path, { language: 'nl-NL' }),
          tmdb(`${path}/watch/providers`),
          tmdb(`${path}/external_ids`).catch(() => ({})),
        ]);
        detailCache[cKey] = { det, prov, extIds };
      } catch(e) { console.warn('TMDB detail:', e); detailCache[cKey] = null; }
    }
    const cached = detailCache[cKey];
    if (cached?.det) {
      const d = cached.det;
      fullTitle    = d.title || d.name || title;
      year         = (d.release_date || d.first_air_date || '').slice(0, 4);
      runtime      = d.runtime ? `${d.runtime} min` : (d.episode_run_time?.[0] ? `${d.episode_run_time[0]} min/afl` : '');
      tmdbRating   = d.vote_average || tmdbRating;
      genres       = (d.genres || []).slice(0, 4).map(g => `<span class="stag">${g.name}</span>`).join('');
      if (d.overview) rawOverview = d.overview;
      if (_type === 'tv' && d.number_of_seasons) {
        seasonInfo = `${d.number_of_seasons} seizoen${d.number_of_seasons > 1 ? 'en' : ''}`;
        if (!item._season) item._season = d.number_of_seasons;
      }
      if (d.poster_path) {
        posterUrl = `${TMDB_IMG}${d.poster_path}`;
        imgCache[item.id] = posterUrl; item.img = posterUrl;
      }
      const nlProv = cached.prov?.results?.NL;
      if (nlProv?.link) watchLink = nlProv.link;
      imdbId = cached.extIds?.imdb_id || null;
    }
  }

  const wmId = item.watchmode_id || (_source === 'watchmode' ? rawId : null);
  if (wmId && String(wmId) !== '0') {
    const wKey = `wm-${wmId}`;
    if (!detailCache[wKey]) {
      try { detailCache[wKey] = await wm(`/title/${wmId}/details`); }
      catch { detailCache[wKey] = null; }
    }
    const d = detailCache[wKey];
    if (d) {
      if (!year)        year    = d.year ? String(d.year) : year;
      if (!runtime)     runtime = d.runtime_minutes ? `${d.runtime_minutes} min` : '';
      if (!tmdbRating)  tmdbRating = d.user_rating || 0;
      if (!genres && d.genres) {
        genres = (d.genres||[]).slice(0,4).map(g => {
          const n = typeof g === 'object' ? (g.name||'') : (typeof g === 'string' ? g : '');
          return (!n || !isNaN(n)) ? '' : `<span class="stag">${n}</span>`;
        }).filter(Boolean).join('');
      }
      if (!posterUrl && d.poster) { posterUrl = d.poster; imgCache[item.id] = posterUrl; }
      if (!rawOverview && d.plot_overview) rawOverview = d.plot_overview;
      if (!watchLink && d.sources?.length) {
        const nlSub = d.sources.find(s => s.region==='NL' && s.type==='sub');
        const usSub = d.sources.find(s => s.region==='US' && s.type==='sub');
        const nlAny = d.sources.find(s => s.region==='NL');
        watchLink = nlSub?.web_url || usSub?.web_url || nlAny?.web_url || d.sources[0]?.web_url || null;
      }
      if (!imdbId && d.imdb_id) imdbId = d.imdb_id;
    }
  }

  if (!resolvedTmdbId && _source === 'watchmode' && !rawOverview) {
    try {
      const type = _type === 'movie' ? 'movie' : 'tv';
      const searchRes = await tmdb(`/search/${type}`, { query: title, language: 'nl-NL' });
      const hit = (searchRes.results || []).find(r => r.id);
      if (hit) {
        if (!rawOverview && hit.overview) rawOverview = hit.overview;
        if (!posterUrl && hit.poster_path) {
          posterUrl = `${TMDB_IMG}${hit.poster_path}`;
          imgCache[item.id] = posterUrl; item.img = posterUrl;
        }
        if (!tmdbRating && hit.vote_average) tmdbRating = hit.vote_average;
        if (!imdbId) {
          try {
            const extIds = await tmdb(`/${type}/${hit.id}/external_ids`);
            imdbId = extIds?.imdb_id || null;
          } catch {}
        }
      }
    } catch(e) { console.warn('TMDB search fallback:', e); }
  }

  if (imdbId && OMDB_KEY) {
    const omdbData = await fetchOMDB(imdbId);
    if (omdbData) {
      imdbRating = omdbData.imdbRating && omdbData.imdbRating !== 'N/A' ? omdbData.imdbRating : '';
      const rtEntry = (omdbData.Ratings || []).find(r => r.Source === 'Rotten Tomatoes');
      rtRating = rtEntry?.Value || '';
    }
  }

  if (!watchLink) {
    const svc = (_src?.name || '').toLowerCase();
    if      (svc.includes('netflix'))                       watchLink = `https://www.netflix.com/search?q=${encodeURIComponent(fullTitle)}`;
    else if (svc.includes('prime')||svc.includes('amazon')) watchLink = `https://www.amazon.nl/s?k=${encodeURIComponent(fullTitle)}`;
    else if (svc.includes('disney'))                        watchLink = `https://www.disneyplus.com/search/${encodeURIComponent(fullTitle)}`;
    else if (svc.includes('apple'))                         watchLink = `https://tv.apple.com/`;
    else if (svc.includes('max')||svc.includes('hbo'))      watchLink = `https://www.max.com/`;
    else if (svc.includes('sky'))                           watchLink = `https://www.skyshowtime.com/`;
    else if (svc.includes('videoland'))                     watchLink = `https://www.videoland.com/`;
    else if (svc.includes('path'))                          watchLink = `https://www.pathe-thuis.nl/`;
    else if (svc.includes('npo'))                           watchLink = `https://npo.nl/`;
    else if (svc.includes('paramount'))                     watchLink = `https://www.paramountplus.com/nl/`;
    else if (svc.includes('discovery'))                     watchLink = `https://www.discoveryplus.com/nl/`;
  }

  const oBadge = _originType === 'original'
    ? '<div class="origin-badge original" style="display:inline-block;margin-top:4px">Originele content</div>'
    : '<div class="origin-badge licensed" style="display:inline-block;margin-top:4px">Gelicenseerde content</div>';

  const metaParts = [_type === 'movie' ? 'Film' : 'Serie'];
  if (year)       metaParts.push(year);
  if (runtime)    metaParts.push(runtime);
  if (_type === 'tv' && seasonInfo) metaParts.push(seasonInfo);

  si.innerHTML = `
    <div class="sp">${posterUrl ? `<img src="${posterUrl}" alt="">` : ''}</div>
    <div class="sinf">
      <div class="ssvc" style="color:${color}">${svcName}</div>
      <div class="stitle">${fullTitle}</div>
      <div class="smeta">${metaParts.join(' · ')}</div>
      <div class="stags">${genres}</div>
      ${oBadge}
    </div>`;

  const nlOverview = rawOverview || 'Geen beschrijving beschikbaar.';
  sd.textContent = nlOverview;
  if (rawOverview && /^[A-Za-z\s]{20,}/.test(rawOverview.slice(0, 60))) {
    translateToNL(rawOverview).then(txt => {
      if (currentModalItem === item && txt && txt !== rawOverview) sd.textContent = txt;
    }).catch(() => {});
  }

  const ratingChips = [];
  // TMDB rating removed — only IMDb and RT shown

  const imdbUrl = imdbId
    ? `https://www.imdb.com/title/${imdbId}/`
    : `https://www.imdb.com/find/?q=${encodeURIComponent(fullTitle)}&s=tt`;
  ratingChips.push(`<a class="rating-chip imdb" href="${imdbUrl}" target="_blank" rel="noopener" aria-label="IMDB${imdbRating ? ' ' + imdbRating : ''}">
    <span class="chip-logo">IMDb</span>${imdbRating ? imdbRating + '/10' : 'Bekijk op IMDb'}
  </a>`);

  const rtUrl = `https://www.rottentomatoes.com/search?search=${encodeURIComponent(fullTitle)}`;
  const rtEmoji = (() => {
    if (!rtRating) return '🍅';
    const pct = parseInt(rtRating);
    return pct >= 60 ? '🍅' : '🤢';
  })();
  ratingChips.push(`<a class="rating-chip rt" href="${rtUrl}" target="_blank" rel="noopener" aria-label="Rotten Tomatoes${rtRating ? ' ' + rtRating : ''}">
    <span class="chip-logo">${rtEmoji} RT</span>${rtRating || 'Bekijk op RT'}
  </a>`);

  ratingsRow.innerHTML = ratingChips.join('');
  ratingsRow.style.display = 'flex';

  if (watchLink) {
    wb.href = watchLink;
    wb.style.display = 'flex';
    const wbLogo = document.getElementById('wbLogo');
    const wbLabel = document.getElementById('wbLabel');
    const provLogo = item._src?.logo_100px || null;
    if (provLogo && wbLogo) {
      wbLogo.src = provLogo;
      wbLogo.alt = svcName;
      wbLogo.style.display = 'block';
    } else if (wbLogo) {
      wbLogo.style.display = 'none';
    }
    if (wbLabel) wbLabel.textContent = `Kijken op ${svcName}`;
  }
}

function closeBg(e) {
  if (e.target === document.getElementById('overlay')) {
    document.getElementById('overlay').classList.remove('open');
    document.body.style.overflow = '';
    currentModalItem = null;
  }
}

function setType(el) {
  typeFilter = el.dataset.f;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');

  const svcBar = document.getElementById('svcBar');
  const navBar = document.getElementById('navBar');

  if (typeFilter === 'top10') {
    svcBar.style.display = 'none';
    navBar.style.display = 'none';
    renderTop10();
  } else if (typeFilter === 'livesport') {
    svcBar.style.display = 'none';
    navBar.style.display = 'none';
    renderLiveSport();
  } else {
    svcBar.style.display = '';
    buildDayList(); renderAll();
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// ── Live Sport — football-data.org + Jolpica F1 + statische events ───────────
// ══════════════════════════════════════════════════════════════════════════════

const FD_KEY  = 'a5121338cb264baaa294099596feaf92';
const FD_BASE = 'https://api.football-data.org/v4';

// NL uitzendrechten (seizoen 2024/25)
// Eredivisie      → ESPN NL
// Champions League→ Viaplay NL
// Premier League  → Viaplay NL  (select wedstrijden ook Prime Video NL)
// La Liga         → Viaplay NL
// Bundesliga      → Ziggo Sport NL
// Ligue 1         → Canal+ NL
const FOOTBALL_COMPS = [
  { code: 'DED', name: 'Eredivisie',        streamer: 'ESPN',        plStreamer: null },
  { code: 'CL',  name: 'Champions League',  streamer: 'Viaplay',     plStreamer: null },
  { code: 'PL',  name: 'Premier League',    streamer: 'Viaplay',     plStreamer: 'Prime Video' },
  { code: 'PD',  name: 'La Liga',           streamer: 'Viaplay',     plStreamer: null },
  { code: 'BL1', name: 'Bundesliga',        streamer: 'Ziggo Sport', plStreamer: null },
  { code: 'FL1', name: 'Ligue 1',           streamer: 'Canal+',      plStreamer: null },
];

// Premier League matchdays op Prime Video NL (indicatief — vaste speelrondes)
// football-data.org geeft matchday nummer; even matchdays op PL gaan vaak naar Prime Video NL
const PL_PRIME_MATCHDAYS = new Set([4, 8, 13, 16, 20, 25, 29, 33, 36]);

const SPORT_STREAMERS = {
  'ESPN':          { color: '#CC0000', bg: 'rgba(204,0,0,0.85)' },
  'Viaplay':       { color: '#7B4FE3', bg: 'rgba(123,79,227,0.85)' },
  'Ziggo Sport':   { color: '#FF6B00', bg: 'rgba(255,107,0,0.85)' },
  'Canal+':        { color: '#555',    bg: 'rgba(70,70,70,0.85)' },
  'Discovery+':    { color: '#0036A0', bg: 'rgba(0,54,160,0.85)' },
  'Netflix':       { color: '#E50914', bg: 'rgba(229,9,20,0.85)' },
  'Prime Video':   { color: '#00A8E0', bg: 'rgba(0,168,224,0.85)' },
  'Ziggo/Viaplay': { color: '#a065e0', bg: 'rgba(100,60,180,0.85)' },
};

let sportFilter = 'today';
let sportCache  = null;

// Fetch helper voor football-data.org
// football-data.org blokkeert directe browser-requests (CORS),
// daarom routeren we via een lichtgewicht CORS-proxy.
const CORS_PROXIES = [
  u => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
  u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
];

async function fd(path, params = {}) {
  const url = new URL(FD_BASE + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const rawUrl = url.toString();
  const cKey   = 'fd4_' + rawUrl;
  const cached = scGet(cKey);
  if (cached) return cached;

  let lastErr;
  for (const proxyFn of CORS_PROXIES) {
    try {
      const proxyUrl = proxyFn(rawUrl);
      const r = await fetch(proxyUrl, {
        headers: { 'X-Auth-Token': FD_KEY, 'Accept': 'application/json' },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const text = await r.text();
      const data = JSON.parse(text);
      scSet(cKey, data);
      return data;
    } catch(e) {
      lastErr = e;
      console.warn(`fd proxy failed (${path}):`, e.message);
    }
  }
  throw new Error(`football-data niet bereikbaar: ${lastErr?.message}`);
}

let sportFetchErrors = [];

async function fetchSportEvents() {
  if (sportCache) return sportCache;

  const events   = [];
  const seenIds  = new Set();
  const now      = new Date();
  sportFetchErrors = [];

  // Gisteren t/m 45 dagen vooruit (ook vandaag meenemen)
  const dateFrom = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
  const dateTo   = new Date(now.getTime() + 45 * 86400000).toISOString().slice(0, 10);

  function addEvent(ev) {
    if (seenIds.has(ev.id)) return;
    seenIds.add(ev.id);
    events.push(ev);
  }

  // ── 1. Voetbal via football-data.org ─────────────────────────────────────
  // GEEN status-filter meegeven — v4 accepteert geen komma-lijst.
  // Alles ophalen binnen datumrange, daarna client-side filteren op niet-FINISHED.
  const footballFetches = FOOTBALL_COMPS.map(async (comp) => {
    try {
      const data = await fd(`/competitions/${comp.code}/matches`, {
        dateFrom,
        dateTo,
      });

      const matches = data.matches || [];
      console.log(`[football-data] ${comp.code}: ${matches.length} matches`);

      matches.forEach(m => {
        if (!m.utcDate) return;
        // Sla al afgespeelde wedstrijden over
        if (['FINISHED', 'AWARDED', 'CANCELLED', 'POSTPONED', 'SUSPENDED'].includes(m.status)) return;

        const matchDate = new Date(m.utcDate);
        if (isNaN(matchDate.getTime())) return;

        const home = m.homeTeam?.shortName || m.homeTeam?.name || '?';
        const away = m.awayTeam?.shortName || m.awayTeam?.name || '?';

        // Bepaal streamer — voor PL kijk ook naar matchday
        let streamer = comp.streamer;
        if (comp.code === 'PL' && comp.plStreamer && PL_PRIME_MATCHDAYS.has(m.matchday)) {
          streamer = comp.plStreamer;
        }

        const isLive = ['IN_PLAY', 'PAUSED', 'LIVE'].includes(m.status);

        addEvent({
          id:       `fd-${m.id}`,
          title:    `${home} – ${away}`,
          subtitle: comp.name,
          sport:    'Voetbal',
          icon:     '⚽',
          streamer,
          date:     matchDate,
          venue:    m.venue || '',
          isLive,
        });
      });
    } catch(e) {
      const msg = `${comp.name}: ${e.message}`;
      console.error('[football-data]', msg);
      sportFetchErrors.push(msg);
    }
  });

  // ── 2. Formule 1 via Jolpica (Ergast-vervanger, gratis) ───────────────────
  const f1Fetch = async () => {
    const cKey = 'jolpica_f1_2025';
    let data = scGet(cKey);
    if (!data) {
      try {
        // Jolpica is de officiële opvolger van Ergast
        const r = await fetch('https://api.jolpi.ca/ergast/f1/2025/');
        if (r.ok) { data = await r.json(); scSet(cKey, data); }
      } catch {}
      // Fallback: Ergast zelf
      if (!data) {
        try {
          const r = await fetch('https://ergast.com/api/f1/2025.json');
          if (r.ok) { data = await r.json(); scSet(cKey, data); }
        } catch {}
      }
    }
    const races = data?.MRData?.RaceTable?.Races || [];
    races.forEach(race => {
      const raceDate = new Date(race.date + 'T' + (race.time || '13:00:00'));
      if (raceDate < new Date(now.getTime() - 3600000)) return; // al gestart
      if (raceDate > new Date(now.getTime() + 45 * 86400000)) return;

      addEvent({
        id:       `f1-race-${race.season}-${race.round}`,
        title:    race.raceName,
        subtitle: `Formule 1 · ${race.Circuit?.circuitName || ''}`,
        sport:    'Formule 1',
        icon:     '🏎️',
        streamer: 'Viaplay',
        date:     raceDate,
        venue:    `${race.Circuit?.Location?.locality || ''}, ${race.Circuit?.Location?.country || ''}`,
        isLive:   false,
      });

      // Kwalificatie
      if (race.Qualifying?.date) {
        const qDate = new Date(race.Qualifying.date + 'T' + (race.Qualifying.time || '15:00:00'));
        if (qDate >= new Date(now.getTime() - 3600000) && qDate <= new Date(now.getTime() + 45 * 86400000)) {
          addEvent({
            id:       `f1-quali-${race.season}-${race.round}`,
            title:    `Kwalificatie – ${race.raceName}`,
            subtitle: `Formule 1 · ${race.Circuit?.circuitName || ''}`,
            sport:    'Formule 1',
            icon:     '🏎️',
            streamer: 'Viaplay',
            date:     qDate,
            venue:    `${race.Circuit?.Location?.locality || ''}, ${race.Circuit?.Location?.country || ''}`,
            isLive:   false,
          });
        }
      }

      // Sprint (als aanwezig)
      if (race.Sprint?.date) {
        const spDate = new Date(race.Sprint.date + 'T' + (race.Sprint.time || '12:00:00'));
        if (spDate >= new Date(now.getTime() - 3600000) && spDate <= new Date(now.getTime() + 45 * 86400000)) {
          addEvent({
            id:       `f1-sprint-${race.season}-${race.round}`,
            title:    `Sprint – ${race.raceName}`,
            subtitle: `Formule 1 · ${race.Circuit?.circuitName || ''}`,
            sport:    'Formule 1',
            icon:     '🏎️',
            streamer: 'Viaplay',
            date:     spDate,
            venue:    `${race.Circuit?.Location?.locality || ''}, ${race.Circuit?.Location?.country || ''}`,
            isLive:   false,
          });
        }
      }
    });
  };

  // ── 3. Statische recurring events (WWE / UFC) ─────────────────────────────
  // WWE Raw — elke maandag op Netflix NL, 02:00 NL-tijd (21:00 ET)
  function nextWeekday(targetDay, hour = 2, minute = 0) {
    const d = new Date();
    const diff = (targetDay - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    d.setHours(hour, minute, 0, 0);
    return new Date(d);
  }

  // WWE Raw (maandag), SmackDown (vrijdag) — beide op Netflix NL
  addEvent({
    id:       'wwe-raw-next',
    title:    'WWE Raw',
    subtitle: 'WWE · Wrestling',
    sport:    'Wrestling',
    icon:     '🤼',
    streamer: 'Netflix',
    date:     nextWeekday(1, 2, 0),
    venue:    'Netflix NL – Live',
    isLive:   false,
  });
  addEvent({
    id:       'wwe-smackdown-next',
    title:    'WWE SmackDown',
    subtitle: 'WWE · Wrestling',
    sport:    'Wrestling',
    icon:     '🤼',
    streamer: 'Netflix',
    date:     nextWeekday(5, 2, 0),
    venue:    'Netflix NL – Live',
    isLive:   false,
  });

  // UFC Fight Night — gemiddeld elke 2 weken, zaterdag ~05:00 NL
  // Toont de eerstvolgende zaterdag als indicatie
  addEvent({
    id:       'ufc-next-event',
    title:    'UFC Fight Night',
    subtitle: 'UFC · MMA',
    sport:    'MMA',
    icon:     '🥋',
    streamer: 'Discovery+',
    date:     nextWeekday(6, 5, 0),
    venue:    'Discovery+ NL – indicatieve datum',
    isLive:   false,
  });

  // NBA — meerdere avonden per week via ESPN NL (indicatief)
  addEvent({
    id:       'nba-next',
    title:    'NBA – Avondprogramma',
    subtitle: 'NBA · Basketbal',
    sport:    'Basketbal',
    icon:     '🏀',
    streamer: 'ESPN',
    date:     nextWeekday(3, 1, 30), // donderdag ~01:30 NL
    venue:    'ESPN NL – regulier seizoen',
    isLive:   false,
  });

  // ── Fetches parallel uitvoeren ────────────────────────────────────────────
  await Promise.all([...footballFetches, f1Fetch()]).catch(() => {});

  // Sorteer: live eerst, dan chronologisch
  events.sort((a, b) => {
    if (a.isLive && !b.isLive) return -1;
    if (!a.isLive && b.isLive) return 1;
    return a.date - b.date;
  });

  sportCache = events.slice(0, 80);
  return sportCache;
}

function formatSportDate(date) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const evStr    = date.toISOString().slice(0, 10);
  const timeStr  = date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  const diffDays = Math.floor((date - now) / 86400000);

  if (evStr === todayStr)           return `Vandaag ${timeStr}`;
  if (diffDays === 1)               return `Morgen ${timeStr}`;
  if (diffDays >= 0 && diffDays < 7)
    return date.toLocaleDateString('nl-NL', { weekday: 'long' }) + ' ' + timeStr;
  return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) + ' ' + timeStr;
}

async function renderLiveSport() {
  const main = document.getElementById('main');
  main.innerHTML = '';

  const sec = document.createElement('section');
  sec.className = 'livesport-section';
  const updateTime = new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });

  sec.innerHTML = `
    <div class="livesport-header">
      <div class="livesport-live-dot"></div>
      <div class="livesport-title">Live Sport</div>
    </div>
    <div class="livesport-sub">Aankomende live sportevenementen op Nederlandse streamingdiensten</div>
    <div class="livesport-tab-row">
      <button class="livesport-tab${sportFilter==='all'   ?' active':''}" onclick="setSportFilter('all')">Alles</button>
      <button class="livesport-tab${sportFilter==='live'  ?' active':''}" onclick="setSportFilter('live')">Nu live</button>
      <button class="livesport-tab${sportFilter==='today' ?' active':''}" onclick="setSportFilter('today')">Vandaag</button>
      <button class="livesport-tab${sportFilter==='week'  ?' active':''}" onclick="setSportFilter('week')">Deze week</button>
    </div>
    <div id="sportList" class="livesport-list">
      <div class="top10-loading">
        <div class="spinner" style="margin:0 auto 8px"></div>Sportagenda laden via football-data.org…
      </div>
    </div>
    <div class="livesport-updated">Bijgewerkt om ${updateTime}</div>
    <div class="livesport-disclaimer">
      Voetbalwedstrijden via football-data.org (Eredivisie, CL, PL, La Liga, Bundesliga, Ligue 1).
      F1 via Jolpica/Ergast. WWE &amp; UFC zijn indicatieve data op basis van bekende uitzendrechten in NL.
      Controleer altijd de dienst zelf voor actuele beschikbaarheid.
    </div>`;

  main.appendChild(sec);

  const allEvents = await fetchSportEvents();
  renderSportList(allEvents);

  // Toon laadfouten onder de lijst als er iets misging
  if (sportFetchErrors.length) {
    const listEl = document.getElementById('sportList');
    if (listEl) {
      listEl.insertAdjacentHTML('beforeend', `
        <div style="font-size:11px;color:#ff6b6b;margin-top:10px;padding:8px;border-radius:8px;background:rgba(255,59,48,0.08)">
          ⚠️ ${sportFetchErrors.length} bron(nen) konden niet worden geladen:<br>
          ${sportFetchErrors.map(e => `<div style="margin-top:3px">${e}</div>`).join('')}
        </div>`);
    }
  }
}

function renderSportList(allEvents) {
  const listEl = document.getElementById('sportList');
  if (!listEl) return;

  const now      = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const weekEnd  = new Date(now.getTime() + 7 * 86400000);

  let events = allEvents;
  if (sportFilter === 'live')  events = allEvents.filter(e => e.isLive);
  if (sportFilter === 'today') events = allEvents.filter(e => e.isLive || e.date.toISOString().slice(0,10) === todayStr);
  if (sportFilter === 'week')  events = allEvents.filter(e => e.isLive || (e.date >= now && e.date <= weekEnd));

  if (!events.length) {
    const msg = sportFilter === 'live'
      ? 'Geen live evenementen op dit moment.'
      : 'Geen evenementen gevonden voor deze periode.';
    const errHtml = sportFetchErrors.length
      ? `<div style="font-size:11px;color:#ff6b6b;margin-top:8px;padding:8px;border-radius:8px;background:rgba(255,59,48,0.08)">
          ⚠️ Laadfouten: ${sportFetchErrors.map(e => `<div>${e}</div>`).join('')}
         </div>` : '';
    listEl.innerHTML = `<div class="livesport-empty">${msg}</div>${errHtml}`;
    return;
  }

  listEl.innerHTML = events.map(ev => {
    const info      = SPORT_STREAMERS[ev.streamer] || { color: '#888', bg: 'rgba(100,100,100,0.85)' };
    const textColor = info.textColor || '#fff';
    const timeLabel = ev.isLive ? '' : formatSportDate(ev.date);
    const rightEl   = ev.isLive
      ? `<div class="sport-live-badge">LIVE</div>`
      : `<div class="sport-time">${timeLabel}</div>`;

    return `
      <div class="sport-event${ev.isLive ? ' is-live' : ''}">
        <div class="sport-icon">${ev.icon || '🏆'}</div>
        <div class="sport-info">
          <div class="sport-title">${ev.title}</div>
          <div class="sport-meta">${ev.subtitle}${ev.venue ? ' · ' + ev.venue : ''}</div>
        </div>
        <div class="sport-right">
          ${rightEl}
          <div class="sport-streamer" style="background:${info.bg};color:${textColor}">${ev.streamer}</div>
        </div>
      </div>`;
  }).join('');
}

function setSportFilter(f) {
  sportFilter = f;
  document.querySelectorAll('.livesport-tab').forEach(t => {
    const labelMap = { 'Alles': 'all', 'Nu live': 'live', 'Vandaag': 'today', 'Deze week': 'week' };
    t.classList.toggle('active', labelMap[t.textContent.trim()] === f);
  });
  if (sportCache) renderSportList(sportCache);
}

// ── Top 10 ────────────────────────────────────────────────────────────────────
let top10Period = 'day';
let top10Category = 'all';
let top10Cache = {};

async function fetchTop10(period, category) {
  const cKey = `top10_${period}_${category}`;
  if (top10Cache[cKey]) return top10Cache[cKey];
  const endpoint = category === 'all'
    ? `/trending/all/${period}`
    : `/trending/${category}/${period}`;
  try {
    const data = await tmdb(endpoint, { language: 'nl-NL', region: 'NL' });
    const results = (data.results || []).slice(0, 10);
    top10Cache[cKey] = results;
    return results;
  } catch(e) {
    console.warn('Top10 fetch error:', e);
    return [];
  }
}

async function renderTop10() {
  const main = document.getElementById('main');
  main.innerHTML = '';

  const sec = document.createElement('section');
  sec.className = 'top10-section';

  const periodLabel = top10Period === 'day' ? 'van vandaag' : 'van deze week';
  const updateTime = new Date().toLocaleTimeString('nl-NL', { hour:'2-digit', minute:'2-digit' });

  sec.innerHTML = `
    <div class="top10-header">
      <div class="top10-title">Top 10 trending ${periodLabel}</div>
    </div>
    <div class="top10-sub">Meest bekeken content op streaming wereldwijd</div>
    <div class="top10-tab-row">
      <button class="top10-tab${top10Period==='day'?' active':''}"    onclick="switchTop10Period('day')">Vandaag</button>
      <button class="top10-tab${top10Period==='week'?' active':''}"   onclick="switchTop10Period('week')">Deze week</button>
      <button class="top10-tab${top10Category==='all'?' active':''}"  onclick="switchTop10Cat('all')">Alles</button>
      <button class="top10-tab${top10Category==='movie'?' active':''}" onclick="switchTop10Cat('movie')">Films</button>
      <button class="top10-tab${top10Category==='tv'?' active':''}"   onclick="switchTop10Cat('tv')">Series</button>
    </div>
    <div id="top10List" class="top10-list">
      <div class="top10-loading"><div class="spinner" style="margin:0 auto 8px"></div>Laden…</div>
    </div>
    <div class="top10-updated">Bijgewerkt om ${updateTime}</div>`;

  main.appendChild(sec);

  const items = await fetchTop10(top10Period, top10Category);
  const listEl = document.getElementById('top10List');
  if (!listEl) return;

  if (!items.length) {
    listEl.innerHTML = '<div class="top10-loading">Geen data beschikbaar.</div>';
    return;
  }

  listEl.innerHTML = items.map((item, idx) => {
    const rank = idx + 1;
    const isTV = item.media_type === 'tv' || (!item.title && item.name);
    const title = item.title || item.name || item.original_title || item.original_name || '?';
    const poster = item.poster_path ? `${TMDB_IMG}${item.poster_path}` : '';
    const year = (item.release_date || item.first_air_date || '').slice(0, 4);
    const score = item.vote_average ? Number(item.vote_average).toFixed(1) : '';
    const typeLabel = isTV ? 'Serie' : 'Film';
    const rankCls = rank <= 3 ? `rank-${rank}` : '';
    const safeTitle = title.replace(/'/g,"&#39;");
    const tmdbId = item.id;
    const mediaType = item.media_type || (isTV ? 'tv' : 'movie');

    // Detect cinema-only: movies without streaming providers
    const hasStreamingProviders = item._hasStreaming !== false; // will be updated async
    const sourceLabel = (!isTV && item._cinemaOnly) ? 'In de bioscoop' : 'Streaming';
    const sourceBadgeStyle = (!isTV && item._cinemaOnly)
      ? 'background:rgba(255,107,0,0.15);color:#ff6b2b;border-color:rgba(255,107,0,0.4)'
      : '';

    return `
      <div class="top10-item" onclick="openTop10Modal(${tmdbId},'${mediaType}','${safeTitle}')" role="button">
        <div class="top10-rank ${rankCls}">${rank}</div>
        <div class="top10-poster">
          ${poster ? `<img src="${poster}" alt="${safeTitle}" loading="lazy">` : ''}
        </div>
        <div class="top10-info">
          <div class="top10-name">${title}<span class="top10-type-badge" style="${sourceBadgeStyle}">${typeLabel} · ${sourceLabel}</span></div>
          <div class="top10-meta">${year}${score ? ` · Trending #${rank}` : ''}</div>
        </div>
        ${score ? `<div class="top10-score">★ ${score}</div>` : ''}
      </div>`;
  }).join('');

  // Async: check which movies are cinema-only (no NL streaming providers)
  items.forEach(async (item, idx) => {
    if (item.media_type === 'tv' || (!item.title && item.name)) return;
    try {
      const pd = await tmdb(`/movie/${item.id}/watch/providers`);
      const nlFlat = pd?.results?.NL?.flatrate || [];
      const hasSub = nlFlat.length > 0;
      if (!hasSub) {
        // Update this row's badge
        const allRows = document.querySelectorAll('.top10-item');
        const row = allRows[idx];
        if (row) {
          const badge = row.querySelector('.top10-type-badge');
          if (badge) {
            badge.textContent = 'Film · In de bioscoop';
            badge.style.cssText = 'background:rgba(255,107,0,0.15);color:#ff6b2b;border-color:rgba(255,107,0,0.4)';
          }
        }
      }
    } catch {}
  });
}

function switchTop10Period(p) { top10Period = p; renderTop10(); }
function switchTop10Cat(c)    { top10Category = c; renderTop10(); }

async function openTop10Modal(tmdbId, mediaType, fallbackTitle) {
  const existing = allItems.find(i => String(i.tmdb_id) === String(tmdbId));
  if (existing) { openModal(existing.id); return; }

  const fakeItem = {
    id: `top10-${tmdbId}`,
    title: fallbackTitle,
    img: null,
    _type: mediaType === 'tv' ? 'tv' : 'movie',
    _date: '',
    _src: { name: 'Streaming' },
    _style: { color: '#0a84ff', text: '#fff' },
    _key: 'streaming',
    _originType: 'licensed',
    _source: 'tmdb',
    tmdb_id: tmdbId,
    overview: '',
    user_rating: 0,
  };
  allItems.push(fakeItem);
  openModal(`top10-${tmdbId}`);
}

function setSvc(el) {
  svcFilter = el.dataset.k;
  document.querySelectorAll('.sc').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  buildDayList(); renderAll();
  enrichMissingPosters();
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const overlay = document.getElementById('overlay');
    if (overlay.classList.contains('open')) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      currentModalItem = null;
    }
  }
});

async function init() {
  try {
    const loading = document.querySelector('.loading-text');
    const loadSub = document.getElementById('loadSub');
    loading.textContent = 'Streamingdiensten ophalen…';
    loadSub.textContent = 'Watchmode + TMDB Nederland';

    await Promise.all([
      fetchWMSources().catch(e => console.warn('WM sources:', e)),
      fetchTMDBProviders().catch(e => console.warn('TMDB providers:', e)),
    ]);

    const tmdbCount = Object.keys(TMDB_NL_PROVIDERS).length;
    loading.textContent = 'Releases laden…';
    loadSub.textContent = `${wmSources.length} WM + ${tmdbCount} TMDB diensten`;

    const [wmItems, tmdbItems] = await Promise.all([
      fetchWMReleases().catch(e => { console.warn('WM releases:', e); return []; }),
      fetchTMDBReleases().catch(e => { console.warn('TMDB releases:', e); return []; }),
    ]);

    loadSub.textContent = '';
    allItems = mergeItems(wmItems, tmdbItems);

    if (!allItems.length) throw new Error('Geen releases gevonden voor Nederland.');
    buildSvcBar(); buildDayList(); renderAll();
    enrichMissingPosters();
  } catch(e) {
    console.error(e);
    document.getElementById('main').innerHTML = `
      <div class="error-screen">
        <div class="error-icon">⚠️</div>
        <div class="error-title">Kon releases niet laden</div>
        <div class="error-msg">${e.message || 'Controleer je internetverbinding.'}</div>
        <button class="retry-btn" onclick="location.reload()">Opnieuw proberen</button>
      </div>`;
  }
}
init();