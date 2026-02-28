// ── Config ────────────────────────────────────────────────────────────────────
const WM_KEY     = ‘eLLuTN9mYhAAWBNl1P3XOGgRKFA1toAVWhOiYX3m’;
const WM_BASE    = ‘https://api.watchmode.com/v1’;
const TMDB_TOKEN = ‘eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZWI4MDVlODg2MmYyODhkOTQ1NDhmOTU1NGYyZjc2YiIsIm5iZiI6MTY3OTQ3MzE2Ni43NzMsInN1YiI6IjY0MWFiYTBlZjlhYTQ3MDBiMTUxZGRmYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.E73D999tD0DBX0aJVVfyooRa3T750C-Y_Hk1TZLr-EM’;
const TMDB_BASE  = ‘https://api.themoviedb.org/3’;
const TMDB_IMG   = ‘https://image.tmdb.org/t/p/w300’;
const OMDB_KEY   = ‘’;

// ── Fetch with timeout ────────────────────────────────────────────────────────
async function fetchWithTimeout(url, options = {}, ms = 8000) {
const controller = new AbortController();
const tid = setTimeout(() => controller.abort(), ms);
try {
const r = await fetch(url, { …options, signal: controller.signal });
clearTimeout(tid);
return r;
} catch (e) {
clearTimeout(tid);
throw e;
}
}

// ── Providers ─────────────────────────────────────────────────────────────────
const WANTED_PROVIDERS = [
{ match: ‘netflix’,       key: ‘netflix’,     name: ‘Netflix’,        color: ‘#E50914’, text: ‘#fff’ },
{ match: ‘prime video’,   key: ‘prime video’, name: ‘Prime Video’,    color: ‘#00A8E0’, text: ‘#fff’ },
{ match: ‘amazon prime’,  key: ‘prime video’, name: ‘Prime Video’,    color: ‘#00A8E0’, text: ‘#fff’ },
{ match: ‘disney plus’,   key: ‘disney+’,     name: ‘Disney+’,        color: ‘#113CCF’, text: ‘#fff’ },
{ match: ‘disney+’,       key: ‘disney+’,     name: ‘Disney+’,        color: ‘#113CCF’, text: ‘#fff’ },
{ match: ‘apple tv plus’, key: ‘apple tv+’,   name: ‘Apple TV+’,      color: ‘#555555’, text: ‘#fff’ },
{ match: ‘apple tv+’,     key: ‘apple tv+’,   name: ‘Apple TV+’,      color: ‘#555555’, text: ‘#fff’ },
{ match: ‘apple tv’,      key: ‘apple tv+’,   name: ‘Apple TV+’,      color: ‘#555555’, text: ‘#fff’ },
{ match: ’max ’,          key: ‘max’,         name: ‘Max’,            color: ‘#5822B4’, text: ‘#fff’ },
{ match: ‘hbo max’,       key: ‘max’,         name: ‘Max’,            color: ‘#5822B4’, text: ‘#fff’ },
{ match: ‘skyshowtime’,   key: ‘skyshowtime’, name: ‘SkyShowtime’,    color: ‘#003E7E’, text: ‘#fff’ },
{ match: ‘videoland’,     key: ‘videoland’,   name: ‘Videoland’,      color: ‘#CC0000’, text: ‘#fff’ },
{ match: ‘path’,          key: ‘pathe’,       name: ‘Pathé Thuis’,    color: ‘#FF6B00’, text: ‘#fff’ },
{ match: ‘npo’,           key: ‘npo’,         name: ‘NPO Start’,      color: ‘#FF6600’, text: ‘#fff’ },
{ match: ‘paramount’,     key: ‘paramount’,   name: ‘Paramount+’,     color: ‘#0064FF’, text: ‘#fff’ },
{ match: ‘discovery’,     key: ‘discovery’,   name: ‘Discovery+’,     color: ‘#0036A0’, text: ‘#fff’ },
{ match: ‘viaplay’,       key: ‘viaplay’,     name: ‘Viaplay’,        color: ‘#1F1646’, text: ‘#fff’ },
{ match: ‘canal’,         key: ‘canal’,       name: ‘Canal+’,         color: ‘#000000’, text: ‘#fff’ },
{ match: ‘mubi’,          key: ‘mubi’,        name: ‘MUBI’,           color: ‘#00B4B4’, text: ‘#fff’ },
{ match: ‘cinemember’,    key: ‘cinemember’,  name: ‘CineMember’,     color: ‘#E8003D’, text: ‘#fff’ },
{ match: ‘film1’,         key: ‘film1’,       name: ‘Film1’,          color: ‘#D10000’, text: ‘#fff’ },
];

const POPULAR_KEYS = [
‘netflix’,‘prime video’,‘max’,‘disney+’,‘videoland’,
‘apple tv+’,‘skyshowtime’,‘viaplay’,‘pathe’,‘npo’,
‘paramount’,‘discovery’,‘mubi’,‘cinemember’,‘film1’,‘canal’,
];

let TMDB_NL_PROVIDERS = {};

// ── Helpers ───────────────────────────────────────────────────────────────────
function matchProvider(name) {
const lower = (name || ‘’).toLowerCase().replace(/[^a-z0-9\s]/g,’’).trim();
return WANTED_PROVIDERS.find(p => lower.includes(p.match));
}
function getSvcStyle(name = ‘’) {
const p = matchProvider(name);
return p ? { color: p.color, text: p.text } : { color: ‘#444444’, text: ‘#fff’ };
}
function providerKey(name) {
const p = matchProvider(name);
return p ? p.key : (name || ‘’).toLowerCase().replace(/netherlands/gi,’’).replace(/\s+/g,’ ’).trim();
}
function isNLStreaming(name) { return !!matchProvider(name); }
function detectOrigin(svcName) {
const n = (svcName || ‘’).toLowerCase();
return [‘netflix’,‘disney’,‘max’,‘hbo’,‘videoland’,‘apple’,‘npo’].some(s => n.includes(s))
? ‘original’ : ‘licensed’;
}
function resolveType(apiType) {
if (!apiType) return null;
const t = String(apiType).toLowerCase();
if (t === ‘movie’) return ‘movie’;
if (t.startsWith(‘tv_’) || t.includes(‘series’) || t.includes(‘miniseries’) || t.includes(‘special’)) return ‘tv’;
return null;
}

// ── State ─────────────────────────────────────────────────────────────────────
let allItems = [];
let typeFilter = ‘all’, svcFilter = ‘all’;
const detailCache = {};
const imgCache = {};
let allDays = [], activeDayIso = ‘’;
let wmSources = [], wmSourceMap = {};
let currentModalItem = null;
let searchMode = false, searchQuery = ‘’;
let collapsedGroups = new Set();

// ── Theme ─────────────────────────────────────────────────────────────────────
function applyTheme(theme) {
if (theme === ‘light’) {
document.documentElement.setAttribute(‘data-theme’, ‘light’);
document.body.style.background = ‘’;
document.body.style.color = ‘’;
} else {
document.documentElement.removeAttribute(‘data-theme’);
document.body.style.background = ‘’;
document.body.style.color = ‘’;
}
}

function toggleTheme() {
const isLight = document.documentElement.getAttribute(‘data-theme’) === ‘light’;
const next = isLight ? ‘dark’ : ‘light’;
applyTheme(next);
localStorage.setItem(‘streamgids_theme’, next);
}

// ── Search ────────────────────────────────────────────────────────────────────
function toggleSearch() {
const wrap = document.getElementById(‘searchWrap’);
const input = document.getElementById(‘searchInput’);
const dateWrap = document.getElementById(‘dateStripWrap’);
const svcWrap = document.getElementById(‘svcStripWrap’);

if (wrap.style.display === ‘none’) {
wrap.style.display = ‘block’;
dateWrap.style.display = ‘none’;
svcWrap.style.display = ‘none’;
searchMode = true;
input.focus();
} else {
wrap.style.display = ‘none’;
dateWrap.style.display = ‘’;
svcWrap.style.display = ‘’;
searchMode = false;
searchQuery = ‘’;
input.value = ‘’;
renderActiveView();
}
}

function onSearch(q) {
searchQuery = q.trim().toLowerCase();
renderSearch();
}

function renderSearch() {
const main = document.getElementById(‘main’);
if (!searchQuery) {
main.innerHTML = `<div class="search-empty">Typ om te zoeken in films & series.</div>`;
return;
}
const results = allItems.filter(i => (i.title || ‘’).toLowerCase().includes(searchQuery));
if (!results.length) {
main.innerHTML = `<div class="search-empty">Geen resultaten voor "<strong>${searchQuery}</strong>".</div>`;
return;
}
main.innerHTML = `<div class="search-results-wrap">${results.map(releaseRowHtml).join('')}</div>`;
}

// ── Share ─────────────────────────────────────────────────────────────────────
async function shareItem() {
if (!currentModalItem) return;
const title = currentModalItem.title || ‘StreamGids’;
const text = `Bekijk "${title}" via StreamGids`;
if (navigator.share) {
try { await navigator.share({ title, text, url: window.location.href }); } catch {}
} else {
window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + window.location.href)}`, ‘_blank’);
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
function dateStr(offset = 0) { return dateOffset(offset).replace(/-/g, ‘’); }
function isoDate(wmDate) {
if (!wmDate) return ‘’;
const s = String(wmDate);
if (s.includes(’-’)) return s.slice(0, 10);
return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`;
}
function todayISO() { return new Date().toISOString().slice(0, 10); }
function dayName(iso) {
const n = new Date(iso + ‘T12:00:00’).toLocaleDateString(‘nl-NL’, { weekday: ‘long’ });
return n.charAt(0).toUpperCase() + n.slice(1);
}
function shortDayName(iso) {
const n = new Date(iso + ‘T12:00:00’).toLocaleDateString(‘nl-NL’, { weekday: ‘short’ });
return n.charAt(0).toUpperCase() + n.slice(1);
}
function dayNumber(iso) {
return new Date(iso + ‘T12:00:00’).getDate();
}
function fullDate(iso) {
return new Date(iso + ‘T12:00:00’).toLocaleDateString(‘nl-NL’, { day:‘numeric’, month:‘long’, year:‘numeric’ });
}

// ── API helpers ───────────────────────────────────────────────────────────────
async function wm(path, params = {}) {
const url = new URL(WM_BASE + path);
url.searchParams.set(‘apiKey’, WM_KEY);
Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
const cKey = ‘wm_’ + url.toString();
const cached = scGet(cKey); if (cached) return cached;
const r = await fetchWithTimeout(url.toString(), {}, 10000);
if (!r.ok) throw new Error(`Watchmode ${r.status}`);
const data = await r.json(); scSet(cKey, data); return data;
}

async function tmdb(path, params = {}) {
const url = new URL(TMDB_BASE + path);
Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
const cKey = ‘tmdb_’ + url.toString();
const cached = scGet(cKey); if (cached) return cached;
const r = await fetchWithTimeout(url.toString(), {
headers: { ‘Authorization’: `Bearer ${TMDB_TOKEN}`, ‘Content-Type’: ‘application/json’ }
}, 8000);
if (!r.ok) throw new Error(`TMDB ${r.status} (${path})`);
const data = await r.json(); scSet(cKey, data); return data;
}

async function translateToNL(text) {
if (!text || !text.trim()) return ‘Geen beschrijving beschikbaar.’;
try {
const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=en|nl`);
const d = await r.json();
const t = d?.responseData?.translatedText;
return (t && t !== text && !t.toLowerCase().includes(‘mymemory’)) ? t : text;
} catch { return text; }
}

async function fetchOMDB(imdbId) {
if (!OMDB_KEY || !imdbId) return null;
const cKey = ‘omdb_’ + imdbId;
const cached = scGet(cKey); if (cached) return cached;
try {
const r = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_KEY}&i=${imdbId}`);
if (!r.ok) return null;
const d = await r.json();
if (d.Response === ‘False’) return null;
scSet(cKey, d); return d;
} catch { return null; }
}

// ── Watchmode ─────────────────────────────────────────────────────────────────
async function fetchWMSources() {
try {
const data = await wm(’/sources’, { regions: ‘NL’ });
const all = Array.isArray(data) ? data : [];
all.filter(s => s.regions?.includes(‘NL’)).forEach(s => { wmSourceMap[s.id] = s; });
wmSources = all.filter(s => s.type === ‘sub’ && s.regions?.includes(‘NL’))
.sort((a, b) => (a.name || ‘’).localeCompare(b.name || ‘’));
} catch(e) { console.warn(‘WM sources failed:’, e); wmSources = []; }
}

async function fetchWMReleases() {
const from = dateStr(-60), to = dateStr(30);
const [movRes, tvRes] = await Promise.all([
wm(’/releases’, { regions:‘NL’, start_date:from, end_date:to, types:‘movie’, limit:500 }),
wm(’/releases’, { regions:‘NL’, start_date:from, end_date:to, types:‘tv_series,tv_miniseries,tv_special,tv_movie’, limit:500 }),
]);
function parse(res, fallbackType) {
return (res?.releases || []).map(item => {
const src = wmSourceMap[item.source_id] || { name: item.source_name || ‘’ };
const svcName = (src.name || ‘’).replace(/Netherlands/gi,’’).trim();
if (!svcName || (!isNLStreaming(svcName) && !src.regions?.includes(‘NL’))) return null;
const resolved = resolveType(item.type || item.title_type) || fallbackType;
return {
…item,
img: item.poster_url || null,
_type: resolved,
_date: isoDate(item.source_release_date),
_src: { …src, name: svcName || src.name },
_style: getSvcStyle(svcName),
_key: providerKey(svcName),
_originType: detectOrigin(svcName),
_source: ‘watchmode’,
_season: item.season_number || null,
};
}).filter(Boolean);
}
return […parse(movRes, ‘movie’), …parse(tvRes, ‘tv’)];
}

// ── TMDB providers ────────────────────────────────────────────────────────────
async function fetchTMDBProviders() {
const [movData, tvData] = await Promise.all([
tmdb(’/watch/providers/movie’, { watch_region: ‘NL’, language: ‘nl-NL’ }),
tmdb(’/watch/providers/tv’,    { watch_region: ‘NL’, language: ‘nl-NL’ }),
]);
const seen = new Set();
[…(movData.results||[]), …(tvData.results||[])].forEach(p => {
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
const first = await tmdb(path, { …params, page: 1 }).catch(() => ({ results: [], total_pages: 0 }));
const all = […(first.results || [])];
const total = Math.min(first.total_pages || 1, maxPages);
if (total > 1) {
const rest = await Promise.all(
Array.from({ length: total - 1 }, (_, i) =>
tmdb(path, { …params, page: i + 2 }).catch(() => ({ results: [] }))
)
);
rest.forEach(r => all.push(…(r.results || [])));
}
return all;
}

async function fetchTMDBReleases() {
const items = [];
const providerEntries = Object.entries(TMDB_NL_PROVIDERS);
if (!providerEntries.length) return [];

function makeItem(m, prov, id, type) {
const date = type === ‘movie’ ? (m.release_date || ‘’) : (m.first_air_date || ‘’);
if (!date || !m.id) return null;
return {
id: `tmdb-${m.id}-${id}`,
title: m.title || m.name || m.original_title || m.original_name || ‘’,
img: m.poster_path ? `${TMDB_IMG}${m.poster_path}` : null,
_type: type, _date: date,
_src: { name: prov.name, logo_100px: prov.logo },
_style: { color: prov.color, text: prov.text },
_key: providerKey(prov.name),
_originType: detectOrigin(prov.name),
_source: ‘tmdb’, _providerId: Number(id),
tmdb_id: m.id, user_rating: m.vote_average || 0, overview: m.overview || ‘’,
};
}

const loadSub = document.getElementById(‘loadSub’);
if (loadSub) loadSub.textContent = ‘TMDB: actuele titels ophalen…’;

// Wrap single tmdb call with per-call timeout
const tmdbSafe = (path, params) => Promise.race([
tmdb(path, params),
new Promise((_, rej) => setTimeout(() => rej(new Error(‘timeout’)), 6000)),
]).catch(() => ({ results: [] }));

try {
const [nowMov, onAirTV] = await Promise.all([
tmdbPages(’/movie/now_playing’, { language:‘nl-NL’, region:‘NL’ }, 2).catch(() => []),
tmdbPages(’/tv/on_the_air’,     { language:‘nl-NL’ }, 2).catch(() => []),
]);
const checkItems = [
…nowMov.slice(0, 25).map(m => ({ …m, _isTV: false })),
…onAirTV.slice(0, 25).map(t => ({ …t, _isTV: true })),
];
await Promise.all(checkItems.map(async m => {
try {
const pd = await tmdbSafe(`/${m._isTV ? 'tv' : 'movie'}/${m.id}/watch/providers`, {});
const flat = pd?.results?.NL?.flatrate || [];
for (const p of flat) {
const prov = TMDB_NL_PROVIDERS[p.provider_id]; if (!prov) continue;
const it = makeItem(m, prov, p.provider_id, m._isTV ? ‘tv’ : ‘movie’);
if (it) items.push(it);
}
} catch {}
}));
} catch(e) { console.warn(‘TMDB now_playing/on_the_air:’, e); }

const BATCH = 6;
for (let i = 0; i < providerEntries.length; i += BATCH) {
const batch = providerEntries.slice(i, i + BATCH);
if (loadSub) loadSub.textContent = `TMDB: ${batch.map(([,p]) => p.name).join(', ')}…`;
await Promise.all(batch.map(async ([id, prov]) => {
const base = {
watch_region: ‘NL’, with_watch_providers: id,
with_watch_monetization_types: ‘flatrate’,
language: ‘nl-NL’, sort_by: ‘popularity.desc’,
};
const cutoff = dateOffset(-730);
const [movs, tvs] = await Promise.all([
tmdbPages(’/discover/movie’, { …base, ‘primary_release_date.gte’: cutoff }, 2).catch(() => []),
tmdbPages(’/discover/tv’,    { …base, ‘first_air_date.gte’: cutoff }, 2).catch(() => []),
]);
movs.forEach(m => { const it = makeItem(m, prov, id, ‘movie’); if (it) items.push(it); });
tvs.forEach(t  => { const it = makeItem(t, prov, id, ‘tv’);    if (it) items.push(it); });
})).catch(e => console.warn(‘TMDB discover batch:’, e));
}

return items;
}

// ── Merge & dedup ─────────────────────────────────────────────────────────────
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

// ── Date tabs (FotMob style) ──────────────────────────────────────────────────
function buildDateStrip() {
const strip = document.getElementById(‘dateStrip’);
const today = todayISO();

// Build range: 7 days back, today, 14 days ahead
const days = [];
for (let i = -7; i <= 14; i++) {
days.push(dateOffset(i));
}

// Also include all days that have items
const itemDays = new Set(filteredItems().map(i => i._date).filter(Boolean));
itemDays.forEach(d => {
if (!days.includes(d)) days.push(d);
});
days.sort();
allDays = days;

if (!activeDayIso || !days.includes(activeDayIso)) {
activeDayIso = today;
}

strip.innerHTML = days.map(iso => {
const isToday = iso === today;
const isActive = iso === activeDayIso;
const itemsOnDay = filteredItems().filter(i => i._date === iso).length;
const hasItems = itemsOnDay > 0;

```
let label;
if (isToday) label = 'Vandaag';
else if (iso === dateOffset(-1)) label = 'Gisteren';
else if (iso === dateOffset(1)) label = 'Morgen';
else label = shortDayName(iso);

return `<button class="date-tab${isActive ? ' active' : ''}${isToday ? ' is-today' : ''}" 
  onclick="selectDay('${iso}')" title="${fullDate(iso)}">
  <div class="dt-weekday">${label}</div>
  <div class="dt-day">${dayNumber(iso)}</div>
  <div class="dt-underline"></div>
</button>`;
```

}).join(’’);

// Scroll active tab into view
setTimeout(() => {
const activeBtn = strip.querySelector(’.date-tab.active’);
if (activeBtn) activeBtn.scrollIntoView({ behavior: ‘smooth’, block: ‘nearest’, inline: ‘center’ });
}, 50);
}

function selectDay(iso) {
activeDayIso = iso;
buildDateStrip();
renderDayContent();
}

// ── Service filter strip ───────────────────────────────────────────────────────
function buildSvcStrip() {
const strip = document.getElementById(‘svcStrip’);
const provMap = new Map();
for (const item of allItems) {
const key = item._key || ‘’;
if (provMap.has(key)) continue;
provMap.set(key, { name: item._src?.name || key, style: item._style, logo: item._src?.logo_100px || null });
}
const entries = […provMap.entries()].sort((a, b) => {
const ra = POPULAR_KEYS.indexOf(String(a[0]).toLowerCase());
const rb = POPULAR_KEYS.indexOf(String(b[0]).toLowerCase());
if (ra !== -1 && rb === -1) return -1;
if (ra === -1 && rb !== -1) return 1;
if (ra !== rb) return ra - rb;
return a[1].name.localeCompare(b[1].name);
});

strip.innerHTML = `<button class="svc-chip${svcFilter==='all'?' active':''}" data-k="all" onclick="setSvc(this)">Alle</button>`;
entries.forEach(([key, info]) => {
const logoEl = info.logo
? `<img src="${info.logo}" alt="${info.name}" onerror="this.style.display='none'" loading="lazy">`
: `<div class="chip-dot" style="background:${info.style.color}"></div>`;
strip.innerHTML += `<button class="svc-chip${svcFilter===key?' active':''}" data-k="${key}" onclick="setSvc(this)">${logoEl}${info.name}</button>`;
});
}

// ── Filters ───────────────────────────────────────────────────────────────────
function filteredItems() {
return allItems.filter(i => {
if (typeFilter === ‘movie’ && i._type !== ‘movie’) return false;
if (typeFilter === ‘tv’    && i._type !== ‘tv’)    return false;
if (svcFilter !== ‘all’   && i._key !== svcFilter) return false;
return !!i._date;
});
}

// ── Render: grouped by service (FotMob league style) ─────────────────────────
function renderDayContent() {
const main = document.getElementById(‘main’);
const items = filteredItems().filter(i => i._date === activeDayIso);
const today = todayISO();

if (!items.length) {
main.innerHTML = ` <div class="day-label-bar"> <span class="day-label-name">${dayName(activeDayIso)}</span> ${activeDayIso === today ? '<span class="day-label-today">Vandaag</span>' : ''} </div> <div class="empty-day">Geen nieuwe releases op ${activeDayIso === today ? 'vandaag' : 'deze dag'}.</div>`;
return;
}

// Group by service
const groupMap = new Map();
for (const item of items) {
const key = item._key || ‘overig’;
if (!groupMap.has(key)) groupMap.set(key, { info: null, items: [] });
const g = groupMap.get(key);
if (!g.info) g.info = { name: (item._src?.name || key).replace(/Netherlands/gi,’’).trim(), color: item._style.color, logo: item._src?.logo_100px || null };
g.items.push(item);
}

// Sort groups by popularity
const sortedGroups = […groupMap.entries()].sort((a, b) => {
const ra = POPULAR_KEYS.indexOf(a[0]);
const rb = POPULAR_KEYS.indexOf(b[0]);
if (ra !== -1 && rb === -1) return -1;
if (ra === -1 && rb !== -1) return 1;
if (ra !== rb) return ra - rb;
return a[1].info.name.localeCompare(b[1].info.name);
});

const totalCount = items.length;
let html = ` <div class="day-label-bar"> <span class="day-label-name">${dayName(activeDayIso)}</span> ${activeDayIso === today ? '<span class="day-label-today">Vandaag</span>' : ''} <span class="day-label-count">${totalCount} titel${totalCount !== 1 ? 's' : ''}</span> </div>`;

for (const [key, group] of sortedGroups) {
const isCollapsed = collapsedGroups.has(key);
const logoEl = group.info.logo
? `<img class="sgh-logo" src="${group.info.logo}" alt="${group.info.name}" onerror="this.style.display='none'" loading="lazy">`
: `<div class="sgh-dot" style="background:${group.info.color}"></div>`;

```
html += `
  <div class="svc-group${isCollapsed ? ' collapsed' : ''}" id="grp-${key.replace(/[^a-z0-9]/g,'-')}">
    <div class="svc-group-header" onclick="toggleGroup('${key.replace(/'/g,"\\'")}')">
      ${logoEl}
      <span class="sgh-name">${group.info.name}</span>
      <span class="sgh-count">${group.items.length}</span>
      <span class="sgh-arrow">▾</span>
    </div>
    <div class="svc-group-body">
      ${group.items.map(releaseRowHtml).join('')}
    </div>
  </div>`;
```

}

main.innerHTML = html;
}

function toggleGroup(key) {
if (collapsedGroups.has(key)) {
collapsedGroups.delete(key);
} else {
collapsedGroups.add(key);
}
const safeKey = key.replace(/[^a-z0-9]/g, ‘-’);
const el = document.getElementById(`grp-${safeKey}`);
if (el) el.classList.toggle(‘collapsed’);
}

// ── Release Row (single item row) ─────────────────────────────────────────────
function releaseRowHtml(item) {
const title = (item.title || ‘’).replace(/’/g, “'”).replace(/”/g, ‘"’);
const safeId = String(item.id).replace(/[’”\]/g, ‘’);
const posterSrc = imgCache[item.id] || item.img || ‘’;
const typeLabel = item._type === ‘movie’ ? ‘FILM’ : ‘SERIE’;
const seasonLabel = (item._type === ‘tv’ && item._season) ? ` S${item._season}` : ‘’;
const rating = item.user_rating ? Number(item.user_rating).toFixed(1) : ‘’;
const genre = item.genres?.[0]?.name || (item._type === ‘movie’ ? ‘Film’ : ‘Serie’);

return `<div class="release-row" onclick="openModal('${safeId}')" role="button" aria-label="${title}"> <div class="rr-poster"> ${posterSrc ?`<img src="${posterSrc}" alt="Poster" loading="lazy" onerror="cardImgError(this,'${safeId}')">`:`<div class="rr-fallback" id="fallback-${safeId}">${title}</div>`} <div class="rr-type-pill">${typeLabel}${seasonLabel}</div> </div> <div class="rr-info"> <div class="rr-title">${title}</div> <div class="rr-meta">${genre}</div> </div> <div class="rr-right"> ${rating ? `<div class="rr-imdb">IMDb ${rating}</div>` : ''} </div> </div>`;
}

// ── Image fallback helpers ────────────────────────────────────────────────────
async function cardImgError(imgEl, itemId) {
imgEl.style.display = ‘none’;
const fallback = document.getElementById(`fallback-${itemId}`);
if (fallback) fallback.style.display = ‘flex’;
if (imgCache[itemId]) {
imgEl.src = imgCache[itemId]; imgEl.style.display = ‘block’;
if (fallback) fallback.style.display = ‘none’; return;
}
const item = allItems.find(i => String(i.id) === String(itemId));
if (!item?.title) return;
try {
const type = item._type === ‘movie’ ? ‘movie’ : ‘tv’;
const res = await tmdb(`/search/${type}`, { query: item.title, language: ‘nl-NL’ });
const hit = (res.results || []).find(r => r.poster_path);
if (hit?.poster_path) {
const url = `${TMDB_IMG}${hit.poster_path}`;
imgCache[itemId] = url; item.img = url;
imgEl.src = url; imgEl.style.display = ‘block’;
if (fallback) fallback.style.display = ‘none’;
}
} catch {}
}

async function enrichMissingPosters() {
const missing = allItems.filter(i => !i.img && !imgCache[i.id] && i.title);
const BATCH = 6;
for (let i = 0; i < missing.length; i += BATCH) {
await Promise.all(missing.slice(i, i + BATCH).map(async item => {
try {
const type = item._type === ‘movie’ ? ‘movie’ : ‘tv’;
const res = await tmdb(`/search/${type}`, { query: item.title, language: ‘nl-NL’ });
const hit = (res.results || []).find(r => r.poster_path);
if (!hit?.poster_path) return;
const url = `${TMDB_IMG}${hit.poster_path}`;
imgCache[item.id] = url; item.img = url;
const fallbackEl = document.getElementById(`fallback-${String(item.id).replace(/['"\\]/g,'')}`);
if (fallbackEl) {
const poster = fallbackEl.closest(’.rr-poster’);
if (poster) {
const img = document.createElement(‘img’);
img.src = url; img.alt = item.title; img.loading = ‘lazy’;
poster.insertBefore(img, fallbackEl);
fallbackEl.style.display = ‘none’;
}
}
} catch {}
}));
}
}

// ── Render dispatch ───────────────────────────────────────────────────────────
function renderActiveView() {
if (searchMode) { renderSearch(); return; }
if (typeFilter === ‘top10’) { renderTop10(); return; }
if (typeFilter === ‘livesport’) { renderLiveSport(); return; }
buildDateStrip();
renderDayContent();
}

// ── Type filter (bottom nav) ──────────────────────────────────────────────────
function setType(el) {
typeFilter = el.dataset.f;
document.querySelectorAll(’.bnav-item’).forEach(b => b.classList.remove(‘active’));
el.classList.add(‘active’);

const dateWrap = document.getElementById(‘dateStripWrap’);
const svcWrap = document.getElementById(‘svcStripWrap’);

if (typeFilter === ‘top10’ || typeFilter === ‘livesport’) {
dateWrap.style.display = ‘none’;
svcWrap.style.display = ‘none’;
renderActiveView();
} else {
dateWrap.style.display = ‘’;
svcWrap.style.display = ‘’;
buildDateStrip();
renderDayContent();
}
}

function setSvc(el) {
svcFilter = el.dataset.k;
document.querySelectorAll(’.svc-chip’).forEach(c => c.classList.remove(‘active’));
el.classList.add(‘active’);
buildDateStrip();
renderDayContent();
enrichMissingPosters();
}

// ── Modal ─────────────────────────────────────────────────────────────────────
async function openModal(rawId) {
const overlay    = document.getElementById(‘overlay’);
const si         = document.getElementById(‘si’);
const sd         = document.getElementById(‘sd’);
const wb         = document.getElementById(‘wb’);
const shareBtn   = document.getElementById(‘shareBtn’);
const ratingsRow = document.getElementById(‘ratingsRow’);

const item = allItems.find(i => String(i.id) === String(rawId));
if (!item) return;
currentModalItem = item;

const { title, img, _src, _style, _type, _originType, _source, tmdb_id } = item;
const svcName = (_src?.name || ‘Streaming’).replace(/Netherlands/gi,’’).trim();
const { color } = _style;
const initPoster = imgCache[item.id] || img || ‘’;

si.innerHTML = `<div class="sp">${initPoster ?`<img src="${initPoster}" alt="">` : ''}</div> <div class="sinf"> <div class="ssvc" style="color:${color}">${svcName}</div> <div class="stitle">${title}</div> <div class="smeta">${_type === 'movie' ? 'Film' : 'Serie'} · laden…</div> </div>`;

sd.textContent = item.overview || ‘Beschrijving laden…’;
ratingsRow.style.display = ‘none’;
ratingsRow.innerHTML = ‘’;
wb.style.display = ‘none’;
if (shareBtn) shareBtn.style.display = ‘flex’;
overlay.classList.add(‘open’);
document.body.style.overflow = ‘hidden’;

let fullTitle = title, year = ‘’, runtime = ‘’, rating = ‘’, genres = ‘’;
let rawOverview = item.overview || ‘’;
let watchLink = null, imdbId = null;
let seasonInfo = item._season ? `Seizoen ${item._season}` : ‘’;
let posterUrl = initPoster;
let tmdbRating = item.user_rating || 0;
let imdbRating = ‘’, rtRating = ‘’;

const resolvedTmdbId = tmdb_id
|| (_source === ‘tmdb’ ? String(rawId).replace(/tmdb-(\d+)-.*/,’$1’) : null);

if (resolvedTmdbId) {
const cKey = `tmdb-${_type}-${resolvedTmdbId}`;
if (!detailCache[cKey]) {
try {
const path = _type === ‘movie’ ? `/movie/${resolvedTmdbId}` : `/tv/${resolvedTmdbId}`;
const [det, prov, extIds] = await Promise.all([
tmdb(path, { language: ‘nl-NL’ }),
tmdb(`${path}/watch/providers`),
tmdb(`${path}/external_ids`).catch(() => ({})),
]);
detailCache[cKey] = { det, prov, extIds };
} catch(e) { detailCache[cKey] = null; }
}
const cached = detailCache[cKey];
if (cached?.det) {
const d = cached.det;
fullTitle    = d.title || d.name || title;
year         = (d.release_date || d.first_air_date || ‘’).slice(0, 4);
runtime      = d.runtime ? `${d.runtime} min` : (d.episode_run_time?.[0] ? `${d.episode_run_time[0]} min/afl` : ‘’);
tmdbRating   = d.vote_average || tmdbRating;
genres       = (d.genres || []).slice(0, 4).map(g => `<span class="stag">${g.name}</span>`).join(’’);
if (d.overview) rawOverview = d.overview;
if (_type === ‘tv’ && d.number_of_seasons) {
seasonInfo = `${d.number_of_seasons} seizoen${d.number_of_seasons > 1 ? 'en' : ''}`;
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

const wmId = item.watchmode_id || (_source === ‘watchmode’ ? rawId : null);
if (wmId && String(wmId) !== ‘0’) {
const wKey = `wm-${wmId}`;
if (!detailCache[wKey]) {
try { detailCache[wKey] = await wm(`/title/${wmId}/details`); }
catch { detailCache[wKey] = null; }
}
const d = detailCache[wKey];
if (d) {
if (!year)       year    = d.year ? String(d.year) : year;
if (!runtime)    runtime = d.runtime_minutes ? `${d.runtime_minutes} min` : ‘’;
if (!tmdbRating) tmdbRating = d.user_rating || 0;
if (!genres && d.genres) {
genres = (d.genres||[]).slice(0,4).map(g => {
const n = typeof g === ‘object’ ? (g.name||’’) : (typeof g === ‘string’ ? g : ‘’);
return (!n || !isNaN(n)) ? ‘’ : `<span class="stag">${n}</span>`;
}).filter(Boolean).join(’’);
}
if (!posterUrl && d.poster) { posterUrl = d.poster; imgCache[item.id] = posterUrl; }
if (!rawOverview && d.plot_overview) rawOverview = d.plot_overview;
if (!watchLink && d.sources?.length) {
const nlSub = d.sources.find(s => s.region===‘NL’ && s.type===‘sub’);
const usSub = d.sources.find(s => s.region===‘US’ && s.type===‘sub’);
const nlAny = d.sources.find(s => s.region===‘NL’);
watchLink = nlSub?.web_url || usSub?.web_url || nlAny?.web_url || d.sources[0]?.web_url || null;
}
if (!imdbId && d.imdb_id) imdbId = d.imdb_id;
}
}

if (!resolvedTmdbId && _source === ‘watchmode’ && !rawOverview) {
try {
const type = _type === ‘movie’ ? ‘movie’ : ‘tv’;
const searchRes = await tmdb(`/search/${type}`, { query: title, language: ‘nl-NL’ });
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
} catch {}
}

if (imdbId && OMDB_KEY) {
const omdbData = await fetchOMDB(imdbId);
if (omdbData) {
imdbRating = omdbData.imdbRating && omdbData.imdbRating !== ‘N/A’ ? omdbData.imdbRating : ‘’;
const rtEntry = (omdbData.Ratings || []).find(r => r.Source === ‘Rotten Tomatoes’);
rtRating = rtEntry?.Value || ‘’;
}
}

if (!watchLink) {
const svc = (_src?.name || ‘’).toLowerCase();
if (svc.includes(‘netflix’))                         watchLink = `https://www.netflix.com/search?q=${encodeURIComponent(fullTitle)}`;
else if (svc.includes(‘prime’)||svc.includes(‘amazon’)) watchLink = `https://www.amazon.nl/s?k=${encodeURIComponent(fullTitle)}`;
else if (svc.includes(‘disney’))                     watchLink = `https://www.disneyplus.com/search/${encodeURIComponent(fullTitle)}`;
else if (svc.includes(‘apple’))                      watchLink = `https://tv.apple.com/`;
else if (svc.includes(‘max’)||svc.includes(‘hbo’))   watchLink = `https://www.max.com/`;
else if (svc.includes(‘sky’))                        watchLink = `https://www.skyshowtime.com/`;
else if (svc.includes(‘videoland’))                  watchLink = `https://www.videoland.com/`;
else if (svc.includes(‘path’))                       watchLink = `https://www.pathe-thuis.nl/`;
else if (svc.includes(‘npo’))                        watchLink = `https://npo.nl/`;
else if (svc.includes(‘paramount’))                  watchLink = `https://www.paramountplus.com/nl/`;
else if (svc.includes(‘discovery’))                  watchLink = `https://www.discoveryplus.com/nl/`;
}

const oBadge = _originType === ‘original’
? ‘<div class="origin-badge original">Originele content</div>’
: ‘<div class="origin-badge licensed">Gelicenseerde content</div>’;

const metaParts = [_type === ‘movie’ ? ‘Film’ : ‘Serie’];
if (year)       metaParts.push(year);
if (runtime)    metaParts.push(runtime);
if (_type === ‘tv’ && seasonInfo) metaParts.push(seasonInfo);

si.innerHTML = `<div class="sp">${posterUrl ?`<img src="${posterUrl}" alt="">` : ''}</div> <div class="sinf"> <div class="ssvc" style="color:${color}">${svcName}</div> <div class="stitle">${fullTitle}</div> <div class="smeta">${metaParts.join(' · ')}</div> <div class="stags">${genres}</div> ${oBadge} </div>`;

sd.textContent = rawOverview || ‘Geen beschrijving beschikbaar.’;
if (rawOverview && /^[A-Za-z\s]{20,}/.test(rawOverview.slice(0, 60))) {
translateToNL(rawOverview).then(txt => {
if (currentModalItem === item && txt && txt !== rawOverview) sd.textContent = txt;
}).catch(() => {});
}

const imdbUrl = imdbId
? `https://www.imdb.com/title/${imdbId}/`
: `https://www.imdb.com/find/?q=${encodeURIComponent(fullTitle)}&s=tt`;

ratingsRow.innerHTML = ` <a class="rating-chip imdb" href="${imdbUrl}" target="_blank" rel="noopener"> <span class="chip-logo">IMDb</span>${imdbRating ? imdbRating + '/10' : 'Bekijk op IMDb'} </a> <a class="rating-chip rt" href="https://www.rottentomatoes.com/search?search=${encodeURIComponent(fullTitle)}" target="_blank" rel="noopener"> <span class="chip-logo">${!rtRating ? '🍅' : parseInt(rtRating) >= 60 ? '🍅' : '🤢'} RT</span>${rtRating || 'Bekijk op RT'} </a>`;
ratingsRow.style.display = ‘flex’;

if (watchLink) {
wb.href = watchLink;
wb.style.display = ‘flex’;
const wbLogo = document.getElementById(‘wbLogo’);
const wbLabel = document.getElementById(‘wbLabel’);
const provLogo = item._src?.logo_100px || null;
if (provLogo && wbLogo) { wbLogo.src = provLogo; wbLogo.style.display = ‘block’; }
else if (wbLogo) wbLogo.style.display = ‘none’;
if (wbLabel) wbLabel.textContent = `Kijken op ${svcName}`;
}
}

function closeBg(e) {
if (e.target === document.getElementById(‘overlay’)) {
document.getElementById(‘overlay’).classList.remove(‘open’);
document.body.style.overflow = ‘’;
currentModalItem = null;
}
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Live Sport ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const FD_KEY  = ‘a5121338cb264baaa294099596feaf92’;
const FD_BASE = ‘https://api.football-data.org/v4’;

const FOOTBALL_COMPS = [
{ code: ‘DED’, name: ‘Eredivisie’,        streamer: ‘ESPN’,        plStreamer: null },
{ code: ‘CL’,  name: ‘Champions League’,  streamer: ‘Viaplay’,     plStreamer: null },
{ code: ‘PL’,  name: ‘Premier League’,    streamer: ‘Viaplay’,     plStreamer: ‘Prime Video’ },
{ code: ‘PD’,  name: ‘La Liga’,           streamer: ‘Viaplay’,     plStreamer: null },
{ code: ‘BL1’, name: ‘Bundesliga’,        streamer: ‘Ziggo Sport’, plStreamer: null },
{ code: ‘FL1’, name: ‘Ligue 1’,           streamer: ‘Canal+’,      plStreamer: null },
];

const PL_PRIME_MATCHDAYS = new Set([4, 8, 13, 16, 20, 25, 29, 33, 36]);

const SPORT_STREAMERS = {
‘ESPN’:          { color: ‘#CC0000’, bg: ‘rgba(204,0,0,0.85)’ },
‘Viaplay’:       { color: ‘#7B4FE3’, bg: ‘rgba(123,79,227,0.85)’ },
‘Ziggo Sport’:   { color: ‘#FF6B00’, bg: ‘rgba(255,107,0,0.85)’ },
‘Canal+’:        { color: ‘#555’,    bg: ‘rgba(70,70,70,0.85)’ },
‘Discovery+’:    { color: ‘#0036A0’, bg: ‘rgba(0,54,160,0.85)’ },
‘Netflix’:       { color: ‘#E50914’, bg: ‘rgba(229,9,20,0.85)’ },
‘Prime Video’:   { color: ‘#00A8E0’, bg: ‘rgba(0,168,224,0.85)’ },
};

let sportFilter = ‘today’, sportCache = null;
let sportFetchErrors = [];

const CORS_PROXIES = [
u => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
];

async function fd(path, params = {}) {
const url = new URL(FD_BASE + path);
Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
const rawUrl = url.toString();
const cKey = ‘fd4_’ + rawUrl;
const cached = scGet(cKey); if (cached) return cached;
let lastErr;
for (const proxyFn of CORS_PROXIES) {
try {
const r = await fetch(proxyFn(rawUrl), { headers: { ‘X-Auth-Token’: FD_KEY, ‘Accept’: ‘application/json’ } });
if (!r.ok) throw new Error(`HTTP ${r.status}`);
const data = JSON.parse(await r.text());
scSet(cKey, data); return data;
} catch(e) { lastErr = e; }
}
throw new Error(`football-data niet bereikbaar: ${lastErr?.message}`);
}

async function fetchSportEvents() {
if (sportCache) return sportCache;
const events = [], seenIds = new Set(), now = new Date();
sportFetchErrors = [];
const dateFrom = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
const dateTo   = new Date(now.getTime() + 45 * 86400000).toISOString().slice(0, 10);

function addEvent(ev) { if (!seenIds.has(ev.id)) { seenIds.add(ev.id); events.push(ev); } }

const footballFetches = FOOTBALL_COMPS.map(async comp => {
try {
const data = await fd(`/competitions/${comp.code}/matches`, { dateFrom, dateTo });
(data.matches || []).forEach(m => {
if (!m.utcDate) return;
if ([‘FINISHED’,‘AWARDED’,‘CANCELLED’,‘POSTPONED’,‘SUSPENDED’].includes(m.status)) return;
const matchDate = new Date(m.utcDate);
if (isNaN(matchDate.getTime())) return;
const home = m.homeTeam?.shortName || m.homeTeam?.name || ‘?’;
const away = m.awayTeam?.shortName || m.awayTeam?.name || ‘?’;
let streamer = comp.streamer;
if (comp.code === ‘PL’ && comp.plStreamer && PL_PRIME_MATCHDAYS.has(m.matchday)) streamer = comp.plStreamer;
addEvent({
id: `fd-${m.id}`, title: `${home} – ${away}`, subtitle: comp.name,
sport: ‘Voetbal’, icon: ‘⚽’, streamer, date: matchDate, venue: m.venue || ‘’,
isLive: [‘IN_PLAY’,‘PAUSED’,‘LIVE’].includes(m.status),
});
});
} catch(e) { sportFetchErrors.push(`${comp.name}: ${e.message}`); }
});

const f1Fetch = async () => {
const cKey = ‘jolpica_f1_2025’;
let data = scGet(cKey);
if (!data) {
try { const r = await fetch(‘https://api.jolpi.ca/ergast/f1/2025/’); if (r.ok) { data = await r.json(); scSet(cKey, data); } } catch {}
if (!data) { try { const r = await fetch(‘https://ergast.com/api/f1/2025.json’); if (r.ok) { data = await r.json(); scSet(cKey, data); } } catch {} }
}
(data?.MRData?.RaceTable?.Races || []).forEach(race => {
const raceDate = new Date(race.date + ‘T’ + (race.time || ‘13:00:00’));
if (raceDate < new Date(now.getTime() - 3600000)) return;
if (raceDate > new Date(now.getTime() + 45 * 86400000)) return;
addEvent({ id:`f1-race-${race.season}-${race.round}`, title:race.raceName, subtitle:`Formule 1 · ${race.Circuit?.circuitName||''}`, sport:‘Formule 1’, icon:‘🏎️’, streamer:‘Viaplay’, date:raceDate, venue:`${race.Circuit?.Location?.locality||''}, ${race.Circuit?.Location?.country||''}`, isLive:false });
if (race.Qualifying?.date) {
const qDate = new Date(race.Qualifying.date+‘T’+(race.Qualifying.time||‘15:00:00’));
if (qDate >= new Date(now.getTime()-3600000)) addEvent({ id:`f1-quali-${race.season}-${race.round}`, title:`Kwalificatie – ${race.raceName}`, subtitle:`Formule 1 · ${race.Circuit?.circuitName||''}`, sport:‘Formule 1’, icon:‘🏎️’, streamer:‘Viaplay’, date:qDate, venue:’’, isLive:false });
}
if (race.Sprint?.date) {
const spDate = new Date(race.Sprint.date+‘T’+(race.Sprint.time||‘12:00:00’));
if (spDate >= new Date(now.getTime()-3600000)) addEvent({ id:`f1-sprint-${race.season}-${race.round}`, title:`Sprint – ${race.raceName}`, subtitle:`Formule 1`, sport:‘Formule 1’, icon:‘🏎️’, streamer:‘Viaplay’, date:spDate, venue:’’, isLive:false });
}
});
};

function nextWeekday(targetDay, hour=2, minute=0) {
const d = new Date(); const diff = (targetDay - d.getDay() + 7) % 7 || 7;
d.setDate(d.getDate()+diff); d.setHours(hour,minute,0,0); return new Date(d);
}
addEvent({ id:‘wwe-raw-next’, title:‘WWE Raw’, subtitle:‘WWE · Wrestling’, sport:‘Wrestling’, icon:‘🤼’, streamer:‘Netflix’, date:nextWeekday(1,2,0), venue:‘Netflix NL – Live’, isLive:false });
addEvent({ id:‘wwe-smackdown-next’, title:‘WWE SmackDown’, subtitle:‘WWE · Wrestling’, sport:‘Wrestling’, icon:‘🤼’, streamer:‘Netflix’, date:nextWeekday(5,2,0), venue:‘Netflix NL – Live’, isLive:false });
addEvent({ id:‘ufc-next-event’, title:‘UFC Fight Night’, subtitle:‘UFC · MMA’, sport:‘MMA’, icon:‘🥋’, streamer:‘Discovery+’, date:nextWeekday(6,5,0), venue:‘Discovery+ NL’, isLive:false });
addEvent({ id:‘nba-next’, title:‘NBA – Avondprogramma’, subtitle:‘NBA · Basketbal’, sport:‘Basketbal’, icon:‘🏀’, streamer:‘ESPN’, date:nextWeekday(3,1,30), venue:‘ESPN NL’, isLive:false });

await Promise.all([…footballFetches, f1Fetch()]).catch(() => {});
events.sort((a,b) => { if (a.isLive&&!b.isLive) return -1; if (!a.isLive&&b.isLive) return 1; return a.date-b.date; });
sportCache = events.slice(0,80);
return sportCache;
}

function formatSportDate(date) {
const now = new Date();
const evStr = date.toISOString().slice(0,10);
const timeStr = date.toLocaleTimeString(‘nl-NL’, { hour:‘2-digit’, minute:‘2-digit’ });
const diffDays = Math.floor((date - now) / 86400000);
if (evStr === now.toISOString().slice(0,10)) return `Vandaag ${timeStr}`;
if (diffDays === 1) return `Morgen ${timeStr}`;
if (diffDays >= 0 && diffDays < 7) return date.toLocaleDateString(‘nl-NL’,{weekday:‘long’})+’ ‘+timeStr;
return date.toLocaleDateString(‘nl-NL’,{day:‘numeric’,month:‘short’})+’ ’+timeStr;
}

async function renderLiveSport() {
const main = document.getElementById(‘main’);
main.innerHTML = ‘’;

const updateTime = new Date().toLocaleTimeString(‘nl-NL’, { hour:‘2-digit’, minute:‘2-digit’ });

const wrap = document.createElement(‘div’);
wrap.className = ‘livesport-section’;
wrap.innerHTML = ` <div class="livesport-header"> <div class="live-dot"></div> <span class="section-title">Live Sport</span> </div> <div class="section-sub">Aankomende live sportevenementen op Nederlandse streamingdiensten</div> <div class="sport-tab-row"> <button class="sport-tab${sportFilter==='all'?' active':''}"   onclick="setSportFilter('all')">Alles</button> <button class="sport-tab${sportFilter==='live'?' active':''}"  onclick="setSportFilter('live')">Nu live</button> <button class="sport-tab${sportFilter==='today'?' active':''}" onclick="setSportFilter('today')">Vandaag</button> <button class="sport-tab${sportFilter==='week'?' active':''}"  onclick="setSportFilter('week')">Deze week</button> </div> <div id="sportList" class="livesport-list"> <div style="text-align:center;padding:40px 20px"> <div class="spinner" style="margin:0 auto 10px"></div> <div style="font-size:13px;color:var(--t3)">Sportagenda laden…</div> </div> </div> <div class="livesport-updated">Bijgewerkt om ${updateTime}</div> <div class="livesport-disclaimer">Voetbalwedstrijden via football-data.org. F1 via Jolpica/Ergast. WWE & UFC zijn indicatieve data. Controleer de dienst zelf voor actuele beschikbaarheid.</div>`;

main.appendChild(wrap);

const allEvents = await fetchSportEvents();
renderSportList(allEvents);
}

function renderSportList(allEvents) {
const listEl = document.getElementById(‘sportList’);
if (!listEl) return;
const now = new Date();
const todayStr = now.toISOString().slice(0,10);
const weekEnd = new Date(now.getTime() + 7*86400000);
let events = allEvents;
if (sportFilter===‘live’) events = allEvents.filter(e=>e.isLive);
if (sportFilter===‘today’) events = allEvents.filter(e=>e.isLive||e.date.toISOString().slice(0,10)===todayStr);
if (sportFilter===‘week’) events = allEvents.filter(e=>e.isLive||(e.date>=now&&e.date<=weekEnd));
if (!events.length) { listEl.innerHTML = `<div class="livesport-empty">${sportFilter==='live'?'Geen live evenementen op dit moment.':'Geen evenementen gevonden voor deze periode.'}</div>`; return; }
listEl.innerHTML = events.map(ev => {
const info = SPORT_STREAMERS[ev.streamer]||{color:’#888’,bg:‘rgba(100,100,100,0.85)’};
const rightEl = ev.isLive ? `<div class="sport-live-badge">LIVE</div>` : `<div class="sport-time">${formatSportDate(ev.date)}</div>`;
return `<div class="sport-event${ev.isLive?' is-live':''}"> <div class="sport-icon">${ev.icon||'🏆'}</div> <div class="sport-info"> <div class="sport-title">${ev.title}</div> <div class="sport-meta">${ev.subtitle}${ev.venue?' · '+ev.venue:''}</div> </div> <div class="sport-right"> ${rightEl} <div class="sport-streamer" style="background:${info.bg};color:#fff">${ev.streamer}</div> </div> </div>`;
}).join(’’);
}

function setSportFilter(f) {
sportFilter = f;
document.querySelectorAll(’.sport-tab’).forEach(t => t.classList.toggle(‘active’, t.textContent.trim().toLowerCase() === ({all:‘alles’,live:‘nu live’,today:‘vandaag’,week:‘deze week’}[f]||’’)));
if (sportCache) renderSportList(sportCache);
}

// ── Top 10 ────────────────────────────────────────────────────────────────────
let top10Period = ‘day’, top10Category = ‘all’, top10Cache = {};

async function fetchTop10(period, category) {
const cKey = `top10_${period}_${category}`;
if (top10Cache[cKey]) return top10Cache[cKey];
const endpoint = category === ‘all’ ? `/trending/all/${period}` : `/trending/${category}/${period}`;
try {
const data = await tmdb(endpoint, { language:‘nl-NL’, region:‘NL’ });
const results = (data.results||[]).slice(0,10);
top10Cache[cKey] = results; return results;
} catch { return []; }
}

async function renderTop10() {
const main = document.getElementById(‘main’);
main.innerHTML = ‘’;
const periodLabel = top10Period === ‘day’ ? ‘van vandaag’ : ‘van deze week’;
const updateTime = new Date().toLocaleTimeString(‘nl-NL’,{hour:‘2-digit’,minute:‘2-digit’});

const wrap = document.createElement(‘div’);
wrap.className = ‘top10-section’;
wrap.innerHTML = ` <div class="section-header"> <div class="section-title">Top 10 trending ${periodLabel}</div> </div> <div class="section-sub">Meest bekeken content op streaming wereldwijd</div> <div class="tab-row"> <button class="tab-btn${top10Period==='day'?' active':''}"    onclick="switchTop10Period('day')">Vandaag</button> <button class="tab-btn${top10Period==='week'?' active':''}"   onclick="switchTop10Period('week')">Deze week</button> <button class="tab-btn${top10Category==='all'?' active':''}"  onclick="switchTop10Cat('all')">Alles</button> <button class="tab-btn${top10Category==='movie'?' active':''}" onclick="switchTop10Cat('movie')">Films</button> <button class="tab-btn${top10Category==='tv'?' active':''}"   onclick="switchTop10Cat('tv')">Series</button> </div> <div id="top10List" class="top10-list"> <div class="top10-loading"><div class="spinner" style="margin:0 auto 10px"></div>Laden…</div> </div> <div class="top10-updated">Bijgewerkt om ${updateTime}</div>`;

main.appendChild(wrap);

const items = await fetchTop10(top10Period, top10Category);
const listEl = document.getElementById(‘top10List’);
if (!listEl) return;
if (!items.length) { listEl.innerHTML = ‘<div class="top10-loading">Geen data beschikbaar.</div>’; return; }

listEl.innerHTML = items.map((item, idx) => {
const rank = idx+1;
const isTV = item.media_type===‘tv’||(!item.title&&item.name);
const title = item.title||item.name||item.original_title||item.original_name||’?’;
const poster = item.poster_path ? `${TMDB_IMG}${item.poster_path}` : ‘’;
const year = (item.release_date||item.first_air_date||’’).slice(0,4);
const score = item.vote_average ? Number(item.vote_average).toFixed(1) : ‘’;
const rankCls = rank<=3?`rank-${rank}`:’’;
const safeTitle = title.replace(/’/g,”'”);
const mediaType = item.media_type||(isTV?‘tv’:‘movie’);
return `<div class="top10-item" onclick="openTop10Modal(${item.id},'${mediaType}','${safeTitle}')" role="button"> <div class="top10-rank ${rankCls}">${rank}</div> <div class="top10-poster">${poster?`<img src="${poster}" alt="${safeTitle}" loading="lazy">`:''}</div> <div class="top10-info"> <div class="top10-name">${title}</div> <div class="top10-meta">${year}${score?` · Trending #${rank}`:''}</div> <div class="top10-badge">${isTV?'Serie':'Film'}</div> </div> ${score?`<div class="top10-score">★ ${score}</div>`:''} </div>`;
}).join(’’);

// Async: cinema detection
items.forEach(async (item, idx) => {
if (item.media_type===‘tv’||(!item.title&&item.name)) return;
try {
const pd = await tmdb(`/movie/${item.id}/watch/providers`);
const hasSub = (pd?.results?.NL?.flatrate||[]).length > 0;
if (!hasSub) {
const rows = document.querySelectorAll(’.top10-item’);
const badge = rows[idx]?.querySelector(’.top10-badge’);
if (badge) { badge.textContent=‘Film · Bioscoop’; badge.style.cssText=‘background:rgba(255,107,0,0.15);color:#ff6b2b;border:1px solid rgba(255,107,0,0.4)’; }
}
} catch {}
});
}

function switchTop10Period(p) { top10Period=p; renderTop10(); }
function switchTop10Cat(c) { top10Category=c; renderTop10(); }

async function openTop10Modal(tmdbId, mediaType, fallbackTitle) {
const existing = allItems.find(i => String(i.tmdb_id)===String(tmdbId));
if (existing) { openModal(existing.id); return; }
const fakeItem = {
id:`top10-${tmdbId}`, title:fallbackTitle, img:null,
_type: mediaType===‘tv’?‘tv’:‘movie’, _date:’’,
_src:{name:‘Streaming’}, _style:{color:’#0a84ff’,text:’#fff’},
_key:‘streaming’, _originType:‘licensed’, _source:‘tmdb’,
tmdb_id:tmdbId, overview:’’, user_rating:0,
};
allItems.push(fakeItem);
openModal(`top10-${tmdbId}`);
}

// ── Keyboard shortcuts ────────────────────────────────────────────────────────
document.addEventListener(‘keydown’, e => {
if (e.key === ‘Escape’) {
const overlay = document.getElementById(‘overlay’);
if (overlay.classList.contains(‘open’)) {
overlay.classList.remove(‘open’);
document.body.style.overflow = ‘’;
currentModalItem = null;
} else if (searchMode) {
toggleSearch();
}
}
});

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
// Apply saved theme
const savedTheme = localStorage.getItem(‘streamgids_theme’) || ‘dark’;
applyTheme(savedTheme);

const loadingText = document.querySelector(’.loading-text’);
const loadSub = document.getElementById(‘loadSub’);

// Helper to timeout an entire phase
const withTimeout = (promise, ms, fallback) =>
Promise.race([promise, new Promise(res => setTimeout(() => res(fallback), ms))]);

try {
if (loadingText) loadingText.textContent = ‘Verbinden…’;
if (loadSub) loadSub.textContent = ‘TMDB & Watchmode ophalen’;

```
// Phase 1 – sources/providers (max 10s total)
await withTimeout(Promise.all([
  fetchWMSources().catch(() => {}),
  fetchTMDBProviders().catch(() => {}),
]), 10000, null);

if (loadingText) loadingText.textContent = 'Releases laden…';
if (loadSub) loadSub.textContent = 'Dit kan 15–30 seconden duren';

// Phase 2 – releases (max 45s total; show whatever we have)
const [wmItems, tmdbItems] = await withTimeout(
  Promise.all([
    fetchWMReleases().catch(e => { console.warn('WM:', e); return []; }),
    fetchTMDBReleases().catch(e => { console.warn('TMDB:', e); return []; }),
  ]),
  45000,
  [[], []]
);

if (loadSub) loadSub.textContent = '';
allItems = mergeItems(
  Array.isArray(wmItems) ? wmItems : [],
  Array.isArray(tmdbItems) ? tmdbItems : []
);

if (!allItems.length) throw new Error('Geen releases gevonden. Controleer je verbinding en probeer opnieuw.');

activeDayIso = todayISO();
buildSvcStrip();
buildDateStrip();
renderDayContent();
enrichMissingPosters();
```

} catch(e) {
console.error(e);
document.getElementById(‘main’).innerHTML = ` <div class="error-screen"> <div class="error-icon">⚠️</div> <div class="error-title">Kon releases niet laden</div> <div class="error-msg">${e.message || 'Controleer je internetverbinding.'}</div> <button class="retry-btn" onclick="location.reload()">Opnieuw proberen</button> </div>`;
}
}

init();
