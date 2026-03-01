/* ═══════════════════════════════════════════════════════════════
StreamGids — FotMob-style Script
All event handlers bound via addEventListener
═══════════════════════════════════════════════════════════════ */

// ── Config ──
var WM_KEY     = ‘eLLuTN9mYhAAWBNl1P3XOGgRKFA1toAVWhOiYX3m’;
var WM_BASE    = ‘https://api.watchmode.com/v1’;
var TMDB_TOKEN = ‘eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZWI4MDVlODg2MmYyODhkOTQ1NDhmOTU1NGYyZjc2YiIsIm5iZiI6MTY3OTQ3MzE2Ni43NzMsInN1YiI6IjY0MWFiYTBlZjlhYTQ3MDBiMTUxZGRmYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.E73D999tD0DBX0aJVVfyooRa3T750C-Y_Hk1TZLr-EM’;
var TMDB_BASE  = ‘https://api.themoviedb.org/3’;
var TMDB_IMG   = ‘https://image.tmdb.org/t/p/w300’;
var OMDB_KEY   = ‘’;

// ── Providers ──
var WANTED_PROVIDERS = [
{ match:‘netflix’,       key:‘netflix’,     name:‘Netflix’,      color:’#E50914’, text:’#fff’ },
{ match:‘prime video’,   key:‘prime video’, name:‘Prime Video’,  color:’#00A8E0’, text:’#fff’ },
{ match:‘amazon prime’,  key:‘prime video’, name:‘Prime Video’,  color:’#00A8E0’, text:’#fff’ },
{ match:‘disney plus’,   key:‘disney+’,     name:‘Disney+’,      color:’#113CCF’, text:’#fff’ },
{ match:‘disney+’,       key:‘disney+’,     name:‘Disney+’,      color:’#113CCF’, text:’#fff’ },
{ match:‘apple tv plus’, key:‘apple tv+’,   name:‘Apple TV+’,    color:’#555555’, text:’#fff’ },
{ match:‘apple tv+’,     key:‘apple tv+’,   name:‘Apple TV+’,    color:’#555555’, text:’#fff’ },
{ match:‘apple tv’,      key:‘apple tv+’,   name:‘Apple TV+’,    color:’#555555’, text:’#fff’ },
{ match:‘max ‘,          key:‘max’,         name:‘Max’,          color:’#5822B4’, text:’#fff’ },
{ match:‘hbo max’,       key:‘max’,         name:‘Max’,          color:’#5822B4’, text:’#fff’ },
{ match:‘skyshowtime’,   key:‘skyshowtime’, name:‘SkyShowtime’,  color:’#003E7E’, text:’#fff’ },
{ match:‘videoland’,     key:‘videoland’,   name:‘Videoland’,    color:’#CC0000’, text:’#fff’ },
{ match:‘path’,          key:‘pathe’,       name:‘Pathé Thuis’,  color:’#FF6B00’, text:’#fff’ },
{ match:‘npo’,           key:‘npo’,         name:‘NPO Start’,    color:’#FF6600’, text:’#fff’ },
{ match:‘paramount’,     key:‘paramount’,   name:‘Paramount+’,   color:’#0064FF’, text:’#fff’ },
{ match:‘discovery’,     key:‘discovery’,   name:‘Discovery+’,   color:’#0036A0’, text:’#fff’ },
{ match:‘viaplay’,       key:‘viaplay’,     name:‘Viaplay’,      color:’#1F1646’, text:’#fff’ },
{ match:‘canal’,         key:‘canal’,       name:‘Canal+’,       color:’#000000’, text:’#fff’ },
{ match:‘mubi’,          key:‘mubi’,        name:‘MUBI’,         color:’#00B4B4’, text:’#fff’ },
{ match:‘cinemember’,    key:‘cinemember’,  name:‘CineMember’,   color:’#E8003D’, text:’#fff’ },
{ match:‘film1’,         key:‘film1’,       name:‘Film1’,        color:’#D10000’, text:’#fff’ },
];
var POPULAR_KEYS = [‘netflix’,‘prime video’,‘max’,‘disney+’,‘videoland’,‘apple tv+’,‘skyshowtime’,‘viaplay’,‘pathe’,‘npo’,‘paramount’,‘discovery’,‘mubi’,‘cinemember’,‘film1’,‘canal’];
var TMDB_NL_PROVIDERS = {};

// ── Helpers ──
function matchProvider(n){var l=(n||’’).toLowerCase().replace(/[^a-z0-9\s]/g,’’).trim();return WANTED_PROVIDERS.find(function(p){return l.includes(p.match)});}
function getSvcStyle(n){var p=matchProvider(n);return p?{color:p.color,text:p.text}:{color:’#444’,text:’#fff’};}
function providerKey(n){var p=matchProvider(n);return p?p.key:(n||’’).toLowerCase().replace(/netherlands/gi,’’).replace(/\s+/g,’ ‘).trim();}
function isNLStreaming(n){return !!matchProvider(n);}
function detectOrigin(s){var n=(s||’’).toLowerCase();return [‘netflix’,‘disney’,‘max’,‘hbo’,‘videoland’,‘apple’,‘npo’].some(function(x){return n.includes(x)})?‘original’:‘licensed’;}
function resolveType(t){if(!t)return null;var s=String(t).toLowerCase();if(s===‘movie’)return ‘movie’;if(s.startsWith(‘tv_’)||s.includes(‘series’)||s.includes(‘miniseries’)||s.includes(‘special’))return ‘tv’;return null;}

// ── State ──
var allItems = [];
var typeFilter = ‘all’;
var svcFilter = ‘all’;
var detailCache = {};
var imgCache = {};
var allDays = [];
var selectedDate = null;
var wmSources = [];
var wmSourceMap = {};
var currentModalItem = null;
var collapsedSections = {};

// ── Session cache ──
function scGet(k){try{var v=sessionStorage.getItem(k);return v?JSON.parse(v):null;}catch(e){return null;}}
function scSet(k,v){try{sessionStorage.setItem(k,JSON.stringify(v));}catch(e){}}

// ── Date helpers ──
function dateOffset(o){var d=new Date();d.setDate(d.getDate()+o);return d.toISOString().slice(0,10);}
function dateStr(o){return dateOffset(o).replace(/-/g,’’);}
function isoDate(w){if(!w)return ‘’;var s=String(w);if(s.includes(’-’))return s.slice(0,10);return s.slice(0,4)+’-’+s.slice(4,6)+’-’+s.slice(6,8);}
function todayISO(){return new Date().toISOString().slice(0,10);}
function dayNameShort(iso){return new Date(iso+‘T12:00:00’).toLocaleDateString(‘nl-NL’,{weekday:‘short’}).replace(/^\w/,function(c){return c.toUpperCase();});}
function dayNum(iso){return new Date(iso+‘T12:00:00’).getDate();}
function monthShort(iso){return new Date(iso+‘T12:00:00’).toLocaleDateString(‘nl-NL’,{month:‘short’}).replace(/^\w/,function(c){return c.toUpperCase();});}
function fullDate(iso){return new Date(iso+‘T12:00:00’).toLocaleDateString(‘nl-NL’,{day:‘numeric’,month:‘long’,year:‘numeric’});}
function getDateLabel(iso){var t=todayISO();if(iso===t)return ‘Vandaag’;if(iso===dateOffset(-1))return ‘Gisteren’;if(iso===dateOffset(1))return ‘Morgen’;if(iso===dateOffset(-2))return ‘Eergisteren’;if(iso===dateOffset(2))return ‘Overmorgen’;return dayNameShort(iso);}

// ── Theme ──
function toggleTheme(){
var cur=document.documentElement.getAttribute(‘data-theme’);
var next=cur===‘dark’?‘light’:‘dark’;
document.documentElement.setAttribute(‘data-theme’,next);
try{localStorage.setItem(‘streamgids_theme’,next);}catch(e){}
}

// ── Share ──
function shareItem(){
if(!currentModalItem)return;
var t=currentModalItem.title||‘StreamGids’;
var txt=‘Bekijk “’+t+’” via StreamGids’;
if(navigator.share){navigator.share({title:t,text:txt,url:location.href}).catch(function(){});}
else{window.open(‘https://wa.me/?text=’+encodeURIComponent(txt+’ ‘+location.href),’_blank’);}
}

// ── API helpers ──
function wm(path,params){
params=params||{};
var url=new URL(WM_BASE+path);
url.searchParams.set(‘apiKey’,WM_KEY);
Object.keys(params).forEach(function(k){url.searchParams.set(k,params[k]);});
var ck=‘wm_’+url.toString();
var c=scGet(ck);if(c)return Promise.resolve(c);
return fetch(url.toString()).then(function(r){if(!r.ok)throw new Error(’WM ’+r.status);return r.json();}).then(function(d){scSet(ck,d);return d;});
}

function tmdb(path,params){
params=params||{};
var url=new URL(TMDB_BASE+path);
Object.keys(params).forEach(function(k){url.searchParams.set(k,params[k]);});
var ck=‘tmdb_’+url.toString();
var c=scGet(ck);if(c)return Promise.resolve(c);
return fetch(url.toString(),{headers:{‘Authorization’:’Bearer ’+TMDB_TOKEN,‘Content-Type’:‘application/json’}}).then(function(r){if(!r.ok)throw new Error(’TMDB ’+r.status);return r.json();}).then(function(d){scSet(ck,d);return d;});
}

function translateToNL(text){
if(!text||!text.trim())return Promise.resolve(‘Geen beschrijving beschikbaar.’);
return fetch(‘https://api.mymemory.translated.net/get?q=’+encodeURIComponent(text.slice(0,500))+’&langpair=en|nl’)
.then(function(r){return r.json();}).then(function(d){var t=d&&d.responseData&&d.responseData.translatedText;return(t&&t!==text&&t.toLowerCase().indexOf(‘mymemory’)===-1)?t:text;})
.catch(function(){return text;});
}

function fetchOMDB(id){
if(!OMDB_KEY||!id)return Promise.resolve(null);
var ck=‘omdb_’+id;var c=scGet(ck);if(c)return Promise.resolve(c);
return fetch(‘https://www.omdbapi.com/?apikey=’+OMDB_KEY+’&i=’+id).then(function(r){if(!r.ok)return null;return r.json();}).then(function(d){if(!d||d.Response===‘False’)return null;scSet(ck,d);return d;}).catch(function(){return null;});
}

// ── Watchmode data ──
function fetchWMSources(){
return wm(’/sources’,{regions:‘NL’}).then(function(data){
var all=Array.isArray(data)?data:[];
all.filter(function(s){return s.regions&&s.regions.includes(‘NL’);}).forEach(function(s){wmSourceMap[s.id]=s;});
wmSources=all.filter(function(s){return s.type===‘sub’&&s.regions&&s.regions.includes(‘NL’);});
}).catch(function(e){console.warn(‘WM sources:’,e);wmSources=[];});
}

function fetchWMReleases(){
var from=dateStr(-60),to=dateStr(30);
return Promise.all([
wm(’/releases’,{regions:‘NL’,start_date:from,end_date:to,types:‘movie’,limit:‘500’}),
wm(’/releases’,{regions:‘NL’,start_date:from,end_date:to,types:‘tv_series,tv_miniseries,tv_special,tv_movie’,limit:‘500’})
]).then(function(res){
function parse(r,ft){
return (r&&r.releases||[]).map(function(item){
var src=wmSourceMap[item.source_id]||{name:item.source_name||’’};
var sn=(src.name||’’).replace(/Netherlands/gi,’’).trim();
if(!sn||(!isNLStreaming(sn)&&!(src.regions&&src.regions.includes(‘NL’))))return null;
var rv=resolveType(item.type||item.title_type)||ft;
return Object.assign({},item,{img:item.poster_url||null,_type:rv,_date:isoDate(item.source_release_date),_src:Object.assign({},src,{name:sn||src.name}),_style:getSvcStyle(sn),_key:providerKey(sn),_originType:detectOrigin(sn),_source:‘watchmode’,_season:item.season_number||null});
}).filter(Boolean);
}
return parse(res[0],‘movie’).concat(parse(res[1],‘tv’));
});
}

// ── TMDB providers ──
function fetchTMDBProviders(){
return Promise.all([
tmdb(’/watch/providers/movie’,{watch_region:‘NL’,language:‘nl-NL’}),
tmdb(’/watch/providers/tv’,{watch_region:‘NL’,language:‘nl-NL’})
]).then(function(res){
var seen={};
(res[0].results||[]).concat(res[1].results||[]).forEach(function(p){
if(seen[p.provider_id])return;seen[p.provider_id]=true;
var m=matchProvider(p.provider_name);if(!m)return;
TMDB_NL_PROVIDERS[p.provider_id]={name:m.name,color:m.color,text:m.text,logo:p.logo_path?‘https://image.tmdb.org/t/p/original’+p.logo_path:null,rawName:p.provider_name};
});
});
}

function tmdbPages(path,params,maxP){
maxP=maxP||3;
return tmdb(path,Object.assign({},params,{page:1})).catch(function(){return{results:[],total_pages:0};}).then(function(first){
var all=(first.results||[]).slice();
var total=Math.min(first.total_pages||1,maxP);
if(total<=1)return all;
var promises=[];
for(var i=2;i<=total;i++){(function(pg){promises.push(tmdb(path,Object.assign({},params,{page:pg})).catch(function(){return{results:[]};}));})(i);}
return Promise.all(promises).then(function(rest){rest.forEach(function(r){all=all.concat(r.results||[]);});return all;});
});
}

function fetchTMDBReleases(){
var items=[];
var entries=Object.keys(TMDB_NL_PROVIDERS).map(function(id){return[id,TMDB_NL_PROVIDERS[id]];});
if(!entries.length)return Promise.resolve([]);

function makeItem(m,prov,id,type){
var date=type===‘movie’?(m.release_date||’’):(m.first_air_date||’’);
if(!date||!m.id)return null;
return{id:‘tmdb-’+m.id+’-’+id,title:m.title||m.name||m.original_title||m.original_name||’’,img:m.poster_path?TMDB_IMG+m.poster_path:null,_type:type,_date:date,_src:{name:prov.name,logo_100px:prov.logo},_style:{color:prov.color,text:prov.text},_key:providerKey(prov.name),_originType:detectOrigin(prov.name),_source:‘tmdb’,_providerId:Number(id),tmdb_id:m.id,user_rating:m.vote_average||0,overview:m.overview||’’};
}

var sub=document.getElementById(‘loadSub’);
if(sub)sub.textContent=‘TMDB: actuele titels ophalen…’;

return Promise.all([
tmdbPages(’/movie/now_playing’,{language:‘nl-NL’,region:‘NL’},5),
tmdbPages(’/tv/on_the_air’,{language:‘nl-NL’},5)
]).then(function(res){
var checks=res[0].slice(0,50).map(function(m){return Object.assign({},m,{_isTV:false});}).concat(res[1].slice(0,50).map(function(t){return Object.assign({},t,{_isTV:true});}));
var batchWork=Promise.resolve();
for(var i=0;i<checks.length;i+=10){(function(batch){
batchWork=batchWork.then(function(){
return Promise.all(batch.map(function(m){
return tmdb(’/’+(m._isTV?‘tv’:‘movie’)+’/’+m.id+’/watch/providers’).then(function(pd){
var flat=pd&&pd.results&&pd.results.NL&&pd.results.NL.flatrate||[];
flat.forEach(function(p){var prov=TMDB_NL_PROVIDERS[p.provider_id];if(!prov)return;var it=makeItem(m,prov,p.provider_id,m._isTV?‘tv’:‘movie’);if(it)items.push(it);});
}).catch(function(){});
}));
});
})(checks.slice(i,i+10));}
return batchWork;
}).then(function(){
var batchWork=Promise.resolve();
for(var i=0;i<entries.length;i+=4){(function(batch){
batchWork=batchWork.then(function(){
if(sub)sub.textContent=‘TMDB: ‘+batch.map(function(e){return e[1].name;}).join(’, ‘)+’…’;
return Promise.all(batch.map(function(e){
var id=e[0],prov=e[1];
var base={watch_region:‘NL’,with_watch_providers:id,with_watch_monetization_types:‘flatrate’,language:‘nl-NL’,sort_by:‘popularity.desc’};
var cutoff=dateOffset(-1095);
return Promise.all([
tmdbPages(’/discover/movie’,Object.assign({},base,{‘primary_release_date.gte’:cutoff}),5).catch(function(){return[];}),
tmdbPages(’/discover/tv’,Object.assign({},base,{‘first_air_date.gte’:cutoff}),5).catch(function(){return[];})
]).then(function(r){
r[0].forEach(function(m){var it=makeItem(m,prov,id,‘movie’);if(it)items.push(it);});
r[1].forEach(function(t){var it=makeItem(t,prov,id,‘tv’);if(it)items.push(it);});
});
})).catch(function(e){console.warn(‘TMDB batch:’,e);});
});
})(entries.slice(i,i+4));}
return batchWork;
}).then(function(){return items;});
}

// ── Merge & dedup ──
function mergeItems(wm,tm){
var result=[],seen={};
wm.forEach(function(i){if(!i._date)return;var k=(i.title||’’).toLowerCase().trim()+’|’+i._key;if(seen[k])return;seen[k]=true;result.push(i);});
var ts={};
tm.forEach(function(i){if(!i._date||!i.title)return;var dk=i.tmdb_id+’|’+i._key;if(ts[dk])return;ts[dk]=true;var tk=(i.title||’’).toLowerCase().trim()+’|’+i._key;if(seen[tk])return;seen[tk]=true;result.push(i);});
return result;
}

// ═══════════════════════════════════════════════════════════════
// DATE TABS
// ═══════════════════════════════════════════════════════════════
function buildDateTabs(){
var c=document.getElementById(‘dateTabs’);
allDays=[];
for(var i=-7;i<=14;i++)allDays.push(dateOffset(i));
var itemDays={};
allItems.forEach(function(it){if(it._date)itemDays[it._date]=true;});
Object.keys(itemDays).forEach(function(d){if(allDays.indexOf(d)===-1)allDays.push(d);});
allDays.sort();
if(!selectedDate)selectedDate=todayISO();
c.innerHTML=allDays.map(function(iso){
var label=getDateLabel(iso);
var isToday=iso===todayISO();
var isActive=iso===selectedDate;
var sub=isToday?’’:’<span class="dsub">’+dayNum(iso)+’ ‘+monthShort(iso)+’</span>’;
return ‘<button class="dtab'+(isActive?' active':'')+'" data-date="'+iso+'">’+label+sub+’</button>’;
}).join(’’);
// Scroll to active
setTimeout(function(){var a=c.querySelector(’.dtab.active’);if(a)a.scrollIntoView({behavior:‘smooth’,inline:‘center’,block:‘nearest’});},50);
}

function selectDate(iso){
selectedDate=iso;
document.querySelectorAll(’.dtab’).forEach(function(t){t.classList.toggle(‘active’,t.getAttribute(‘data-date’)===iso);});
renderMain();
}

// ═══════════════════════════════════════════════════════════════
// SERVICE BAR
// ═══════════════════════════════════════════════════════════════
function buildSvcBar(){
var bar=document.getElementById(‘svcBar’);
var provMap={};
allItems.forEach(function(item){
var k=item._key||’’;if(provMap[k])return;
provMap[k]={name:item._src&&item._src.name||k,style:item._style,logo:item._src&&item._src.logo_100px||null};
});
var keys=Object.keys(provMap).sort(function(a,b){
var ra=POPULAR_KEYS.indexOf(a);if(ra===-1)ra=999;
var rb=POPULAR_KEYS.indexOf(b);if(rb===-1)rb=999;
if(ra!==rb)return ra-rb;
return provMap[a].name.localeCompare(provMap[b].name);
});
var html=’<button class="sc active" data-k="all">Alle diensten</button>’;
keys.forEach(function(k){
var info=provMap[k];
var logo=info.logo?’<img src="'+info.logo+'" alt="'+info.name+'" onerror="this.style.display=\'none\'" loading="lazy">’:’<div class="dot" style="background:'+info.style.color+'"></div>’;
html+=’<button class="sc'+(svcFilter===k?' active':'')+'" data-k="'+k+'">’+logo+info.name+’</button>’;
});
bar.innerHTML=html;
}

// ═══════════════════════════════════════════════════════════════
// MAIN RENDER
// ═══════════════════════════════════════════════════════════════
function filteredItems(){
return allItems.filter(function(i){
if(typeFilter===‘movie’&&i._type!==‘movie’)return false;
if(typeFilter===‘tv’&&i._type!==‘tv’)return false;
if(svcFilter!==‘all’&&i._key!==svcFilter)return false;
return !!i._date;
});
}

function renderMain(){
var main=document.getElementById(‘main’);
main.innerHTML=’’;
var items=filteredItems().filter(function(i){return i._date===selectedDate;});

if(!items.length){
main.innerHTML=’<div class="empty-state"><div style="font-size:28px;margin-bottom:8px">📺</div><div>Geen releases op ‘+getDateLabel(selectedDate).toLowerCase()+’.</div><div style="margin-top:4px;font-size:12px;color:var(--t3)">Probeer een andere dag of filter.</div></div>’;
return;
}

// Group by service
var svcGroups={};var svcOrder=[];
items.forEach(function(item){
var k=item._key||‘overig’;
if(!svcGroups[k]){svcGroups[k]={name:item._src&&item._src.name||k,logo:item._src&&item._src.logo_100px||null,color:item._style&&item._style.color||’#444’,items:[]};svcOrder.push(k);}
svcGroups[k].items.push(item);
});

svcOrder.sort(function(a,b){
var ra=POPULAR_KEYS.indexOf(a);if(ra===-1)ra=999;
var rb=POPULAR_KEYS.indexOf(b);if(rb===-1)rb=999;
if(ra!==rb)return ra-rb;
return svcGroups[b].items.length-svcGroups[a].items.length;
});

svcOrder.forEach(function(key,idx){
var g=svcGroups[key];
var sec=document.createElement(‘div’);
sec.className=‘svc-section’+(collapsedSections[key]?’ collapsed’:’’);
sec.id=‘svc-’+key;
sec.style.animationDelay=(idx*0.04)+‘s’;

```
var logoHtml=g.logo?'<img class="svc-logo" src="'+g.logo+'" alt="'+g.name+'" onerror="this.style.display=\'none\'" loading="lazy">':'<div class="svc-dot" style="background:'+g.color+'">'+g.name.charAt(0)+'</div>';

var mc=g.items.filter(function(i){return i._type==='movie';}).length;
var tc=g.items.filter(function(i){return i._type==='tv';}).length;
var parts=[];
if(mc)parts.push(mc+' film'+(mc>1?'s':''));
if(tc)parts.push(tc+' serie'+(tc>1?'s':''));

sec.innerHTML='<div class="svc-hdr" data-key="'+key+'">'+logoHtml+'<div class="svc-name">'+g.name+'</div><div class="svc-cnt">'+parts.join(' · ')+'</div><svg class="svc-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div><div class="svc-body">'+g.items.map(function(item){return crowHtml(item);}).join('')+'</div>';
main.appendChild(sec);
```

});
}

function crowHtml(item){
var title=(item.title||’’).replace(/’/g,”'”).replace(/”/g,’"’);
var sid=String(item.id).replace(/[’”\]/g,’’);
var poster=imgCache[item.id]||item.img||’’;
var tl=item._type===‘movie’?‘Film’:‘Serie’;
var cls=item._type===‘movie’?‘film’:‘serie’;
var season=(item._type===‘tv’&&item._season)?’ · S’+item._season:’’;
var sn=(item._src&&item._src.name||‘Streaming’).replace(/Netherlands/gi,’’).trim();

return ‘<div class="crow" data-id="'+sid+'"><div class="crow-poster">’+(poster?’<img src=”’+poster+’” alt=”’+title+’” loading=“lazy” onerror=“this.parentElement.innerHTML='<div class=crow-fb>’+title.replace(/’/g,’’).replace(/”/g,’’)+’</div>'”>’:’<div class="crow-fb" id="fb-'+sid+'">’+title+’</div>’)+’</div><div class="crow-info"><div class="crow-title">’+title+’</div><div class="crow-meta">’+tl+season+’ · ‘+sn+’</div></div><div class="crow-badge '+cls+'">’+tl+’</div></div>’;
}

function toggleSection(key){
collapsedSections[key]=!collapsedSections[key];
var sec=document.getElementById(‘svc-’+key);
if(sec)sec.classList.toggle(‘collapsed’);
}

// ── Poster enrichment ──
function enrichMissingPosters(){
var missing=allItems.filter(function(i){return !i.img&&!imgCache[i.id]&&i.title;});
var idx=0;
function next(){
if(idx>=missing.length)return;
var batch=missing.slice(idx,idx+6);idx+=6;
Promise.all(batch.map(function(item){
var type=item._type===‘movie’?‘movie’:‘tv’;
return tmdb(’/search/’+type,{query:item.title,language:‘nl-NL’}).then(function(res){
var hit=(res.results||[]).find(function(r){return r.poster_path;});
if(!hit||!hit.poster_path)return;
var url=TMDB_IMG+hit.poster_path;
imgCache[item.id]=url;item.img=url;
}).catch(function(){});
})).then(next);
}
next();
}

// ═══════════════════════════════════════════════════════════════
// BOTTOM NAV
// ═══════════════════════════════════════════════════════════════
function setType(f){
typeFilter=f;
document.querySelectorAll(’.bnav’).forEach(function(n){n.classList.toggle(‘active’,n.getAttribute(‘data-f’)===f);});
var dt=document.getElementById(‘dateTabs’);
var sb=document.getElementById(‘svcBar’);
if(f===‘top10’){dt.style.display=‘none’;sb.style.display=‘none’;renderTop10();}
else if(f===‘livesport’){dt.style.display=‘none’;sb.style.display=‘none’;renderLiveSport();}
else{dt.style.display=’’;sb.style.display=’’;renderMain();}
}

// ═══════════════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════════════
function openModal(rawId){
var overlay=document.getElementById(‘overlay’);
var si=document.getElementById(‘si’);
var sd=document.getElementById(‘sd’);
var wb=document.getElementById(‘wb’);
var shareBtn=document.getElementById(‘shareBtn’);
var ratingsRow=document.getElementById(‘ratingsRow’);

var item=allItems.find(function(i){return String(i.id)===String(rawId);});
if(!item)return;
currentModalItem=item;

var title=item.title,img=item.img,_src=item._src,_style=item._style,_type=item._type,_originType=item._originType,_source=item._source,tmdb_id=item.tmdb_id;
var svcName=(_src&&_src.name||‘Streaming’).replace(/Netherlands/gi,’’).trim();
var color=_style&&_style.color||’#40e86a’;
var initPoster=imgCache[item.id]||img||’’;

si.innerHTML=’<div class="sp">’+(initPoster?’<img src="'+initPoster+'" alt="">’:’’)+’</div><div class="sinf"><div class="ssvc" style="color:'+color+'">’+svcName+’</div><div class="stitle">’+title+’</div><div class="smeta">’+(_type===‘movie’?‘Film’:‘Serie’)+’ · laden…</div></div>’;

sd.textContent=item.overview||‘Beschrijving laden…’;
ratingsRow.style.display=‘none’;ratingsRow.innerHTML=’’;
wb.style.display=‘none’;
if(shareBtn)shareBtn.style.display=‘flex’;
overlay.classList.add(‘open’);
document.body.style.overflow=‘hidden’;

// Async detail loading
var fullTitle=title,year=’’,runtime=’’,genres=’’;
var rawOverview=item.overview||’’;
var watchLink=null,imdbId=null;
var seasonInfo=item._season?‘Seizoen ‘+item._season:’’;
var posterUrl=initPoster;
var tmdbRating=item.user_rating||0;
var imdbRating=’’,rtRating=’’;

var resolvedTmdbId=tmdb_id||(_source===‘tmdb’?String(rawId).replace(/tmdb-(\d+)-.*/,’$1’):null);

var chain=Promise.resolve();

if(resolvedTmdbId){
chain=chain.then(function(){
var cKey=‘tmdb-’+_type+’-’+resolvedTmdbId;
if(detailCache[cKey])return detailCache[cKey];
var path=_type===‘movie’?’/movie/’+resolvedTmdbId:’/tv/’+resolvedTmdbId;
return Promise.all([tmdb(path,{language:‘nl-NL’}),tmdb(path+’/watch/providers’),tmdb(path+’/external_ids’).catch(function(){return{};})]).then(function(r){detailCache[cKey]={det:r[0],prov:r[1],extIds:r[2]};return detailCache[cKey];}).catch(function(e){console.warn(‘TMDB detail:’,e);detailCache[cKey]=null;return null;});
}).then(function(cached){
if(cached&&cached.det){
var d=cached.det;
fullTitle=d.title||d.name||title;
year=(d.release_date||d.first_air_date||’’).slice(0,4);
runtime=d.runtime?d.runtime+’ min’:(d.episode_run_time&&d.episode_run_time[0]?d.episode_run_time[0]+’ min/afl’:’’);
tmdbRating=d.vote_average||tmdbRating;
genres=(d.genres||[]).slice(0,4).map(function(g){return ‘<span class="stag">’+g.name+’</span>’;}).join(’’);
if(d.overview)rawOverview=d.overview;
if(_type===‘tv’&&d.number_of_seasons){seasonInfo=d.number_of_seasons+’ seizoen’+(d.number_of_seasons>1?‘en’:’’);}
if(d.poster_path){posterUrl=TMDB_IMG+d.poster_path;imgCache[item.id]=posterUrl;item.img=posterUrl;}
var nlProv=cached.prov&&cached.prov.results&&cached.prov.results.NL;
if(nlProv&&nlProv.link)watchLink=nlProv.link;
imdbId=cached.extIds&&cached.extIds.imdb_id||null;
}
});
}

chain.then(function(){
if(!watchLink){
var svc=(_src&&_src.name||’’).toLowerCase();
if(svc.includes(‘netflix’))watchLink=‘https://www.netflix.com/search?q=’+encodeURIComponent(fullTitle);
else if(svc.includes(‘prime’)||svc.includes(‘amazon’))watchLink=‘https://www.amazon.nl/s?k=’+encodeURIComponent(fullTitle);
else if(svc.includes(‘disney’))watchLink=‘https://www.disneyplus.com/search/’+encodeURIComponent(fullTitle);
else if(svc.includes(‘apple’))watchLink=‘https://tv.apple.com/’;
else if(svc.includes(‘max’)||svc.includes(‘hbo’))watchLink=‘https://www.max.com/’;
else if(svc.includes(‘sky’))watchLink=‘https://www.skyshowtime.com/’;
else if(svc.includes(‘videoland’))watchLink=‘https://www.videoland.com/’;
else if(svc.includes(‘path’))watchLink=‘https://www.pathe-thuis.nl/’;
else if(svc.includes(‘npo’))watchLink=‘https://npo.nl/’;
else if(svc.includes(‘paramount’))watchLink=‘https://www.paramountplus.com/nl/’;
else if(svc.includes(‘discovery’))watchLink=‘https://www.discoveryplus.com/nl/’;
}

```
var oBadge=_originType==='original'?'<div class="origin-badge original">Origineel</div>':'<div class="origin-badge licensed">Gelicenseerd</div>';
var metaParts=[_type==='movie'?'Film':'Serie'];
if(year)metaParts.push(year);
if(runtime)metaParts.push(runtime);
if(_type==='tv'&&seasonInfo)metaParts.push(seasonInfo);

si.innerHTML='<div class="sp">'+(posterUrl?'<img src="'+posterUrl+'" alt="">':'')+'</div><div class="sinf"><div class="ssvc" style="color:'+color+'">'+svcName+'</div><div class="stitle">'+fullTitle+'</div><div class="smeta">'+metaParts.join(' · ')+'</div><div class="stags">'+genres+'</div>'+oBadge+'</div>';

sd.textContent=rawOverview||'Geen beschrijving beschikbaar.';
if(rawOverview&&/^[A-Za-z\s]{20,}/.test(rawOverview.slice(0,60))){
  translateToNL(rawOverview).then(function(txt){if(currentModalItem===item&&txt&&txt!==rawOverview)sd.textContent=txt;});
}

var chips=[];
var imdbUrl=imdbId?'https://www.imdb.com/title/'+imdbId+'/':'https://www.imdb.com/find/?q='+encodeURIComponent(fullTitle)+'&s=tt';
chips.push('<a class="rating-chip imdb" href="'+imdbUrl+'" target="_blank" rel="noopener"><span class="chip-logo">IMDb</span>'+(imdbRating?imdbRating+'/10':'Bekijk')+'</a>');
var rtUrl='https://www.rottentomatoes.com/search?search='+encodeURIComponent(fullTitle);
chips.push('<a class="rating-chip rt" href="'+rtUrl+'" target="_blank" rel="noopener"><span class="chip-logo">🍅 RT</span>'+(rtRating||'Bekijk')+'</a>');
ratingsRow.innerHTML=chips.join('');ratingsRow.style.display='flex';

if(watchLink){
  wb.href=watchLink;wb.style.display='flex';
  var wbLogo=document.getElementById('wbLogo');
  var wbLabel=document.getElementById('wbLabel');
  var pLogo=item._src&&item._src.logo_100px||null;
  if(pLogo&&wbLogo){wbLogo.src=pLogo;wbLogo.alt=svcName;wbLogo.style.display='block';}
  else if(wbLogo){wbLogo.style.display='none';}
  if(wbLabel)wbLabel.textContent='Kijken op '+svcName;
}
```

});
}

function closeModal(){
document.getElementById(‘overlay’).classList.remove(‘open’);
document.body.style.overflow=’’;
currentModalItem=null;
}

// ═══════════════════════════════════════════════════════════════
// TOP 10
// ═══════════════════════════════════════════════════════════════
var top10Period=‘day’,top10Category=‘all’,top10Cache={};

function fetchTop10(period,cat){
var ck=‘t10_’+period+’_’+cat;
if(top10Cache[ck])return Promise.resolve(top10Cache[ck]);
var ep=cat===‘all’?’/trending/all/’+period:’/trending/’+cat+’/’+period;
return tmdb(ep,{language:‘nl-NL’,region:‘NL’}).then(function(d){var r=(d.results||[]).slice(0,10);top10Cache[ck]=r;return r;}).catch(function(){return[];});
}

function renderTop10(){
var main=document.getElementById(‘main’);main.innerHTML=’’;
var sec=document.createElement(‘section’);sec.className=‘top10-section’;
var pl=top10Period===‘day’?‘van vandaag’:‘van deze week’;
sec.innerHTML=’<div class="top10-title">Top 10 trending ‘+pl+’</div><div class="top10-sub">Meest bekeken content wereldwijd</div><div class="t10-tabs" id="t10tabs"></div><div id="t10list" class="t10-list"><div class="t10-loading"><div class="ld-spinner" style="margin:0 auto 8px"></div>Laden…</div></div><div class="t10-updated"></div>’;
main.appendChild(sec);
renderT10Tabs();
fetchTop10(top10Period,top10Category).then(function(items){
var el=document.getElementById(‘t10list’);if(!el)return;
if(!items.length){el.innerHTML=’<div class="t10-loading">Geen data.</div>’;return;}
el.innerHTML=items.map(function(item,idx){
var rank=idx+1;
var isTV=item.media_type===‘tv’||(!item.title&&item.name);
var title=item.title||item.name||’?’;
var poster=item.poster_path?TMDB_IMG+item.poster_path:’’;
var year=(item.release_date||item.first_air_date||’’).slice(0,4);
var score=item.vote_average?Number(item.vote_average).toFixed(1):’’;
var tl=isTV?‘Serie’:‘Film’;
var rc=rank<=3?‘r’+rank:’’;
var safe=title.replace(/’/g,”'”);
var mt=item.media_type||(isTV?‘tv’:‘movie’);
return ‘<div class="t10-item" data-tmdb="'+item.id+'" data-mt="'+mt+'" data-title="'+safe+'"><div class="t10-rank '+rc+'">’+rank+’</div><div class="t10-poster">’+(poster?’<img src="'+poster+'" alt="'+safe+'" loading="lazy">’:’’)+’</div><div class="t10-info"><div class="t10-name">’+title+’<span class="t10-badge">’+tl+’</span></div><div class="t10-meta">’+year+(score?’ · Trending #’+rank:’’)+’</div></div>’+(score?’<div class="t10-score">★ ‘+score+’</div>’:’’)+’</div>’;
}).join(’’);
});
}

function renderT10Tabs(){
var c=document.getElementById(‘t10tabs’);if(!c)return;
c.innerHTML=[‘day’,‘week’].map(function(p){return ‘<button class="t10-tab'+(top10Period===p?' active':'')+'" data-p="'+p+'">’+(p===‘day’?‘Vandaag’:‘Deze week’)+’</button>’;}).join(’’)+[‘all’,‘movie’,‘tv’].map(function(cat){return ‘<button class="t10-tab'+(top10Category===cat?' active':'')+'" data-c="'+cat+'">’+(cat===‘all’?‘Alles’:cat===‘movie’?‘Films’:‘Series’)+’</button>’;}).join(’’);
}

function openTop10Modal(tmdbId,mt,title){
var existing=allItems.find(function(i){return String(i.tmdb_id)===String(tmdbId);});
if(existing){openModal(existing.id);return;}
var fakeItem={id:‘t10-’+tmdbId,title:title,img:null,_type:mt===‘tv’?‘tv’:‘movie’,_date:’’,_src:{name:‘Streaming’},_style:{color:’#40e86a’,text:’#fff’},_key:‘streaming’,_originType:‘licensed’,_source:‘tmdb’,tmdb_id:tmdbId,overview:’’,user_rating:0};
allItems.push(fakeItem);
openModal(‘t10-’+tmdbId);
}

// ═══════════════════════════════════════════════════════════════
// LIVE SPORT
// ═══════════════════════════════════════════════════════════════
var FD_KEY=‘a5121338cb264baaa294099596feaf92’;
var FD_BASE=‘https://api.football-data.org/v4’;
var FOOTBALL_COMPS=[{code:‘DED’,name:‘Eredivisie’,streamer:‘ESPN’,plStreamer:null},{code:‘CL’,name:‘Champions League’,streamer:‘Viaplay’,plStreamer:null},{code:‘PL’,name:‘Premier League’,streamer:‘Viaplay’,plStreamer:‘Prime Video’},{code:‘PD’,name:‘La Liga’,streamer:‘Viaplay’,plStreamer:null},{code:‘BL1’,name:‘Bundesliga’,streamer:‘Ziggo Sport’,plStreamer:null},{code:‘FL1’,name:‘Ligue 1’,streamer:‘Canal+’,plStreamer:null}];
var PL_PRIME_MATCHDAYS={4:1,8:1,13:1,16:1,20:1,25:1,29:1,33:1,36:1};
var SPORT_STREAMERS={ESPN:{color:’#CC0000’,bg:‘rgba(204,0,0,0.85)’},Viaplay:{color:’#7B4FE3’,bg:‘rgba(123,79,227,0.85)’},‘Ziggo Sport’:{color:’#FF6B00’,bg:‘rgba(255,107,0,0.85)’},‘Canal+’:{color:’#555’,bg:‘rgba(70,70,70,0.85)’},‘Discovery+’:{color:’#0036A0’,bg:‘rgba(0,54,160,0.85)’},Netflix:{color:’#E50914’,bg:‘rgba(229,9,20,0.85)’},‘Prime Video’:{color:’#00A8E0’,bg:‘rgba(0,168,224,0.85)’}};
var sportFilter=‘today’,sportCache=null,sportFetchErrors=[];
var CORS_PROXIES=[function(u){return ‘https://corsproxy.io/?url=’+encodeURIComponent(u);},function(u){return ‘https://api.allorigins.win/raw?url=’+encodeURIComponent(u);}];

function fd(path,params){
params=params||{};
var url=new URL(FD_BASE+path);
Object.keys(params).forEach(function(k){url.searchParams.set(k,params[k]);});
var raw=url.toString(),ck=‘fd4_’+raw,c=scGet(ck);
if(c)return Promise.resolve(c);
var idx=0;
function tryProxy(){
if(idx>=CORS_PROXIES.length)return Promise.reject(new Error(‘football-data niet bereikbaar’));
var pUrl=CORS_PROXIES[idx++](raw);
return fetch(pUrl,{headers:{‘X-Auth-Token’:FD_KEY,‘Accept’:‘application/json’}}).then(function(r){if(!r.ok)throw new Error(’HTTP ’+r.status);return r.text();}).then(function(t){var d=JSON.parse(t);scSet(ck,d);return d;}).catch(function(e){console.warn(‘fd proxy fail:’,e.message);return tryProxy();});
}
return tryProxy();
}

function fetchSportEvents(){
if(sportCache)return Promise.resolve(sportCache);
var events=[],seenIds={},now=new Date();
sportFetchErrors=[];
var dateFrom=new Date(now.getTime()-86400000).toISOString().slice(0,10);
var dateTo=new Date(now.getTime()+45*86400000).toISOString().slice(0,10);
function add(ev){if(seenIds[ev.id])return;seenIds[ev.id]=true;events.push(ev);}
function nextWd(day,h,m){var d=new Date();var diff=((day-d.getDay()+7)%7)||7;d.setDate(d.getDate()+diff);d.setHours(h||2,m||0,0,0);return new Date(d);}

var footballFetches=FOOTBALL_COMPS.map(function(comp){
return fd(’/competitions/’+comp.code+’/matches’,{dateFrom:dateFrom,dateTo:dateTo}).then(function(data){
(data.matches||[]).forEach(function(m){
if(!m.utcDate)return;
if([‘FINISHED’,‘AWARDED’,‘CANCELLED’,‘POSTPONED’,‘SUSPENDED’].indexOf(m.status)!==-1)return;
var d=new Date(m.utcDate);if(isNaN(d.getTime()))return;
var home=m.homeTeam&&(m.homeTeam.shortName||m.homeTeam.name)||’?’;
var away=m.awayTeam&&(m.awayTeam.shortName||m.awayTeam.name)||’?’;
var str=comp.streamer;
if(comp.code===‘PL’&&comp.plStreamer&&PL_PRIME_MATCHDAYS[m.matchday])str=comp.plStreamer;
var live=[‘IN_PLAY’,‘PAUSED’,‘LIVE’].indexOf(m.status)!==-1;
add({id:‘fd-’+m.id,title:home+’ – ‘+away,subtitle:comp.name,sport:‘Voetbal’,icon:‘⚽’,streamer:str,date:d,venue:m.venue||’’,isLive:live});
});
}).catch(function(e){sportFetchErrors.push(comp.name+’: ’+e.message);});
});

var f1Fetch=function(){
var ck=‘jolpica_f1_2025’;var d=scGet(ck);
var p=d?Promise.resolve(d):fetch(‘https://api.jolpi.ca/ergast/f1/2025/’).then(function(r){if(r.ok)return r.json();throw new Error(‘F1’);}).catch(function(){return fetch(‘https://ergast.com/api/f1/2025.json’).then(function(r){return r.json();});}).then(function(data){scSet(ck,data);return data;}).catch(function(){return null;});
return p.then(function(data){
if(!data)return;
var races=data.MRData&&data.MRData.RaceTable&&data.MRData.RaceTable.Races||[];
races.forEach(function(race){
var rd=new Date(race.date+‘T’+(race.time||‘13:00:00’));
if(rd<new Date(now.getTime()-3600000)||rd>new Date(now.getTime()+45*86400000))return;
var loc=(race.Circuit&&race.Circuit.Location)?race.Circuit.Location.locality+’, ‘+race.Circuit.Location.country:’’;
add({id:‘f1-’+race.season+’-’+race.round,title:race.raceName,subtitle:‘Formule 1’,sport:‘F1’,icon:‘🏎️’,streamer:‘Viaplay’,date:rd,venue:loc,isLive:false});
});
});
};

add({id:‘wwe-raw’,title:‘WWE Raw’,subtitle:‘WWE’,sport:‘Wrestling’,icon:‘🤼’,streamer:‘Netflix’,date:nextWd(1,2,0),venue:‘Netflix NL’,isLive:false});
add({id:‘wwe-sd’,title:‘WWE SmackDown’,subtitle:‘WWE’,sport:‘Wrestling’,icon:‘🤼’,streamer:‘Netflix’,date:nextWd(5,2,0),venue:‘Netflix NL’,isLive:false});
add({id:‘ufc’,title:‘UFC Fight Night’,subtitle:‘UFC · MMA’,sport:‘MMA’,icon:‘🥋’,streamer:‘Discovery+’,date:nextWd(6,5,0),venue:‘Discovery+ NL’,isLive:false});

return Promise.all(footballFetches.concat([f1Fetch()])).catch(function(){}).then(function(){
events.sort(function(a,b){if(a.isLive&&!b.isLive)return -1;if(!a.isLive&&b.isLive)return 1;return a.date-b.date;});
sportCache=events.slice(0,80);
return sportCache;
});
}

function formatSportDate(d){
var now=new Date(),ts=now.toISOString().slice(0,10),es=d.toISOString().slice(0,10);
var tm=d.toLocaleTimeString(‘nl-NL’,{hour:‘2-digit’,minute:‘2-digit’});
if(es===ts)return ’Vandaag ’+tm;
var diff=Math.floor((d-now)/86400000);
if(diff===1)return ’Morgen ‘+tm;
if(diff>=0&&diff<7)return d.toLocaleDateString(‘nl-NL’,{weekday:‘long’})+’ ‘+tm;
return d.toLocaleDateString(‘nl-NL’,{day:‘numeric’,month:‘short’})+’ ’+tm;
}

function renderLiveSport(){
var main=document.getElementById(‘main’);main.innerHTML=’’;
var sec=document.createElement(‘section’);sec.className=‘sport-section’;
sec.innerHTML=’<div class="sport-hdr"><div class="sport-dot-live"></div><div class="sport-hdr-title">Live Sport</div></div><div class="sport-sub">Aankomende live sport op NL streaming</div><div class="sp-tabs" id="sptabs"></div><div id="splist" class="sp-list"><div class="t10-loading"><div class="ld-spinner" style="margin:0 auto 8px"></div>Laden…</div></div><div class="sp-updated"></div><div class="sp-disclaimer">Voetbal via football-data.org · F1 via Jolpica · WWE/UFC indicatief</div>’;
main.appendChild(sec);
renderSpTabs();
fetchSportEvents().then(function(evs){renderSportList(evs);});
}

function renderSpTabs(){
var c=document.getElementById(‘sptabs’);if(!c)return;
c.innerHTML=[‘all’,‘live’,‘today’,‘week’].map(function(f){
var labels={all:‘Alles’,live:‘Nu live’,today:‘Vandaag’,week:‘Deze week’};
return ‘<button class="sp-tab'+(sportFilter===f?' active':'')+'" data-sf="'+f+'">’+labels[f]+’</button>’;
}).join(’’);
}

function renderSportList(evs){
var el=document.getElementById(‘splist’);if(!el)return;
var now=new Date(),ts=now.toISOString().slice(0,10),we=new Date(now.getTime()+7*86400000);
var filtered=evs;
if(sportFilter===‘live’)filtered=evs.filter(function(e){return e.isLive;});
if(sportFilter===‘today’)filtered=evs.filter(function(e){return e.isLive||e.date.toISOString().slice(0,10)===ts;});
if(sportFilter===‘week’)filtered=evs.filter(function(e){return e.isLive||(e.date>=now&&e.date<=we);});
if(!filtered.length){el.innerHTML=’<div class="sp-empty">Geen evenementen gevonden.</div>’;return;}
el.innerHTML=filtered.map(function(ev){
var info=SPORT_STREAMERS[ev.streamer]||{color:’#888’,bg:‘rgba(100,100,100,0.85)’};
var tm=ev.isLive?’’:formatSportDate(ev.date);
var right=ev.isLive?’<div class="sp-live-badge">LIVE</div>’:’<div class="sp-time">’+tm+’</div>’;
return ‘<div class="sp-ev'+(ev.isLive?' live':'')+'"><div class="sp-icon">’+(ev.icon||‘🏆’)+’</div><div class="sp-info"><div class="sp-title">’+ev.title+’</div><div class="sp-meta">’+ev.subtitle+(ev.venue?’ · ‘+ev.venue:’’)+’</div></div><div class="sp-right">’+right+’<div class="sp-streamer" style="background:'+info.bg+';color:#fff">’+ev.streamer+’</div></div></div>’;
}).join(’’);
}

// ═══════════════════════════════════════════════════════════════
// EVENT LISTENERS (all bound here, not inline)
// ═══════════════════════════════════════════════════════════════
document.addEventListener(‘DOMContentLoaded’, function(){
console.log(’[StreamGids] DOMContentLoaded — binding events’);

// Theme toggle
var themeBtn=document.getElementById(‘themeBtn’);
if(themeBtn)themeBtn.addEventListener(‘click’,toggleTheme);

// Bottom nav
document.querySelectorAll(’.bnav’).forEach(function(btn){
btn.addEventListener(‘click’,function(){setType(btn.getAttribute(‘data-f’));});
});

// Share
var shareBtn=document.getElementById(‘shareBtn’);
if(shareBtn)shareBtn.addEventListener(‘click’,shareItem);

// Overlay close
var overlay=document.getElementById(‘overlay’);
if(overlay){
overlay.addEventListener(‘click’,function(e){if(e.target===overlay)closeModal();});
}

// ESC to close
document.addEventListener(‘keydown’,function(e){if(e.key===‘Escape’)closeModal();});

// Delegated clicks for date tabs
document.getElementById(‘dateTabs’).addEventListener(‘click’,function(e){
var tab=e.target.closest(’.dtab’);
if(tab)selectDate(tab.getAttribute(‘data-date’));
});

// Delegated clicks for service chips
document.getElementById(‘svcBar’).addEventListener(‘click’,function(e){
var chip=e.target.closest(’.sc’);
if(!chip)return;
svcFilter=chip.getAttribute(‘data-k’);
document.querySelectorAll(’.sc’).forEach(function(c){c.classList.toggle(‘active’,c.getAttribute(‘data-k’)===svcFilter);});
renderMain();
});

// Delegated clicks for main content
document.getElementById(‘main’).addEventListener(‘click’,function(e){
// Section header toggle
var hdr=e.target.closest(’.svc-hdr’);
if(hdr){toggleSection(hdr.getAttribute(‘data-key’));return;}
// Content row
var row=e.target.closest(’.crow’);
if(row){openModal(row.getAttribute(‘data-id’));return;}
// Top 10 item
var t10=e.target.closest(’.t10-item’);
if(t10){openTop10Modal(t10.getAttribute(‘data-tmdb’),t10.getAttribute(‘data-mt’),t10.getAttribute(‘data-title’));return;}
// Top 10 tabs
var t10tab=e.target.closest(’.t10-tab’);
if(t10tab){
if(t10tab.getAttribute(‘data-p’)){top10Period=t10tab.getAttribute(‘data-p’);}
if(t10tab.getAttribute(‘data-c’)){top10Category=t10tab.getAttribute(‘data-c’);}
renderTop10();return;
}
// Sport tabs
var sptab=e.target.closest(’.sp-tab’);
if(sptab){
sportFilter=sptab.getAttribute(‘data-sf’);
renderSpTabs();
if(sportCache)renderSportList(sportCache);
}
});

// Start loading data
init();
});

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════
function init(){
var loadText=document.getElementById(‘loadText’);
var loadSub=document.getElementById(‘loadSub’);
if(loadText)loadText.textContent=‘Streamingdiensten ophalen…’;
if(loadSub)loadSub.textContent=‘Watchmode + TMDB Nederland’;

Promise.all([
fetchWMSources(),
fetchTMDBProviders().catch(function(e){console.warn(‘TMDB providers:’,e);})
]).then(function(){
var tc=Object.keys(TMDB_NL_PROVIDERS).length;
if(loadText)loadText.textContent=‘Releases laden…’;
if(loadSub)loadSub.textContent=wmSources.length+’ WM + ‘+tc+’ TMDB diensten’;
return Promise.all([
fetchWMReleases().catch(function(e){console.warn(‘WM releases:’,e);return[];}),
fetchTMDBReleases().catch(function(e){console.warn(‘TMDB releases:’,e);return[];})
]);
}).then(function(res){
if(loadSub)loadSub.textContent=’’;
allItems=mergeItems(res[0],res[1]);
console.log(’[StreamGids] Loaded ‘+allItems.length+’ items’);
if(!allItems.length)throw new Error(‘Geen releases gevonden voor Nederland.’);
buildSvcBar();
buildDateTabs();
renderMain();
enrichMissingPosters();
}).catch(function(e){
console.error(’[StreamGids] Init error:’,e);
document.getElementById(‘main’).innerHTML=’<div class="error-screen"><div class="error-icon">⚠️</div><div class="error-title">Kon releases niet laden</div><div class="error-msg">’+(e.message||‘Controleer je internetverbinding.’)+’</div><button class="retry-btn" onclick="location.reload()">Opnieuw proberen</button></div>’;
});
}
