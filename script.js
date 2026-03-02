/* ═══════════════════════════════════════════════════════════════
   Streamgids
   ═══════════════════════════════════════════════════════════════ */

/* ┌──────────────────────────────────────────────────────────────┐
   │  GOOGLE SHEETS - Handmatige releases                        │
   │                                                             │
   │  Stap 1: Maak een Google Sheet met deze kolommen:           │
   │          titel | tmdb_id | datum | dienst | type            │
   │                                                             │
   │  Stap 2: Bestand > Delen > Publiceren op het web > CSV      │
   │                                                             │
   │  Stap 3: Plak de URL hieronder                              │
   │                                                             │
   │  Voorbeeld rij:                                             │
   │  Brothers | 16234 | 2025-03-02 | netflix | movie            │
   │  The Wolf of Wall Street | 106646 | 2025-03-01 | netflix | movie │
   │                                                             │
   │  tmdb_id is optioneel - zonder ID zoekt het script auto     │
   │  dienst = netflix, disney+, prime video, max, etc.          │
   │  type = movie of tv                                         │
   └──────────────────────────────────────────────────────────────┘ */

var GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSoYyeD3v2ElTcXt5I9IlPOHYBc8GwpRW_N06WFtgjUd20dIKEcEte7Vcdfik_kvfbDgs4xoS5wJU-c/pub?gid=0&single=true&output=csv';  // <-- PLAK HIER JE GOOGLE SHEETS CSV URL

var WM_KEY     = 'eLLuTN9mYhAAWBNl1P3XOGgRKFA1toAVWhOiYX3m';
var WM_BASE    = 'https://api.watchmode.com/v1';
var TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZWI4MDVlODg2MmYyODhkOTQ1NDhmOTU1NGYyZjc2YiIsIm5iZiI6MTY3OTQ3MzE2Ni43NzMsInN1YiI6IjY0MWFiYTBlZjlhYTQ3MDBiMTUxZGRmYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.E73D999tD0DBX0aJVVfyooRa3T750C-Y_Hk1TZLr-EM';
var TMDB_BASE  = 'https://api.themoviedb.org/3';
var TMDB_IMG   = 'https://image.tmdb.org/t/p/w300';
var OMDB_KEY   = '';

/* ── Sport league logos (public URLs) ── */
var SPORT_LOGOS = {
  'Eredivisie':       'https://crests.football-data.org/ED.png',
  'Champions League': 'https://crests.football-data.org/CL.png',
  'Premier League':   'https://crests.football-data.org/PL.png',
  'La Liga':          'https://crests.football-data.org/PD.png',
  'Bundesliga':       'https://crests.football-data.org/BL1.png',
  'Ligue 1':          'https://crests.football-data.org/FL1.png',
  'Formule 1':        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/F1.svg/120px-F1.svg.png',
  'F1':               'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/F1.svg/120px-F1.svg.png',
  'WWE':              'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/WWE_logo_2023.svg/120px-WWE_logo_2023.svg.png',
  'UFC':              'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/UFC_logo.svg/120px-UFC_logo.svg.png',
  'MMA':              'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/UFC_logo.svg/120px-UFC_logo.svg.png',
  'NBA':              'https://upload.wikimedia.org/wikipedia/en/thumb/0/03/National_Basketball_Association_logo.svg/105px-National_Basketball_Association_logo.svg.png',
  'Basketbal':        'https://upload.wikimedia.org/wikipedia/en/thumb/0/03/National_Basketball_Association_logo.svg/105px-National_Basketball_Association_logo.svg.png',
  'Wrestling':        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/WWE_logo_2023.svg/120px-WWE_logo_2023.svg.png',
};

var WANTED_PROVIDERS = [
  { match:'netflix',       key:'netflix',     name:'Netflix',      color:'#E50914', text:'#fff' },
  { match:'prime video',   key:'prime video', name:'Prime Video',  color:'#00A8E0', text:'#fff' },
  { match:'amazon prime',  key:'prime video', name:'Prime Video',  color:'#00A8E0', text:'#fff' },
  { match:'disney plus',   key:'disney+',     name:'Disney+',      color:'#113CCF', text:'#fff' },
  { match:'disney+',       key:'disney+',     name:'Disney+',      color:'#113CCF', text:'#fff' },
  { match:'apple tv plus', key:'apple tv+',   name:'Apple TV+',    color:'#555555', text:'#fff' },
  { match:'apple tv+',     key:'apple tv+',   name:'Apple TV+',    color:'#555555', text:'#fff' },
  { match:'appletv+',      key:'apple tv+',   name:'Apple TV+',    color:'#555555', text:'#fff' },
  { match:'appletv',       key:'apple tv+',   name:'Apple TV+',    color:'#555555', text:'#fff' },
  { match:'apple tv',      key:'apple tv+',   name:'Apple TV+',    color:'#555555', text:'#fff' },
  { match:'max ',          key:'max',         name:'Max',          color:'#5822B4', text:'#fff' },
  { match:'hbo max',       key:'max',         name:'Max',          color:'#5822B4', text:'#fff' },
  { match:'skyshowtime',   key:'skyshowtime', name:'SkyShowtime',  color:'#003E7E', text:'#fff' },
  { match:'videoland',     key:'videoland',   name:'Videoland',    color:'#CC0000', text:'#fff' },
  { match:'path',          key:'pathe',       name:'Pathe Thuis',  color:'#FF6B00', text:'#fff' },
  { match:'npo',           key:'npo',         name:'NPO Start',    color:'#FF6600', text:'#fff' },
  { match:'paramount',     key:'paramount',   name:'Paramount+',   color:'#0064FF', text:'#fff' },
  { match:'discovery',     key:'discovery',   name:'Discovery+',   color:'#0036A0', text:'#fff' },
  { match:'viaplay',       key:'viaplay',     name:'Viaplay',      color:'#1F1646', text:'#fff' },
  { match:'canal',         key:'canal',       name:'Canal+',       color:'#000000', text:'#fff' },
  { match:'mubi',          key:'mubi',        name:'MUBI',         color:'#00B4B4', text:'#fff' },
  { match:'cinemember',    key:'cinemember',  name:'CineMember',   color:'#E8003D', text:'#fff' },
  { match:'film1',         key:'film1',       name:'Film1',        color:'#D10000', text:'#fff' },
];
var POPULAR_KEYS = ['netflix','prime video','max','disney+','videoland','apple tv+','skyshowtime','viaplay','pathe','npo','paramount','discovery','mubi','cinemember','film1','canal'];
var TMDB_NL_PROVIDERS = {};

function matchProvider(n){var l=(n||'').toLowerCase().replace(/[^a-z0-9\s]/g,'').trim();return WANTED_PROVIDERS.find(function(p){return l.includes(p.match)});}
function getSvcStyle(n){var p=matchProvider(n);return p?{color:p.color,text:p.text}:{color:'#444',text:'#fff'};}
function providerKey(n){var p=matchProvider(n);return p?p.key:(n||'').toLowerCase().replace(/netherlands/gi,'').replace(/\s+/g,' ').trim();}
function isNLStreaming(n){return !!matchProvider(n);}
function detectOrigin(s){var n=(s||'').toLowerCase();return ['netflix','disney','max','hbo','videoland','apple','npo'].some(function(x){return n.includes(x)})?'original':'licensed';}
function resolveType(t){if(!t)return null;var s=String(t).toLowerCase();if(s==='movie')return 'movie';if(s.startsWith('tv_')||s.includes('series')||s.includes('miniseries')||s.includes('special'))return 'tv';return null;}

var allItems=[];var typeFilter='all';var svcFilter='all';var detailCache={};var imgCache={};
var allDays=[];var selectedDate=null;var wmSources=[];var wmSourceMap={};var currentModalItem=null;var collapsedSections={};

function scGet(k){try{var v=sessionStorage.getItem(k);return v?JSON.parse(v):null;}catch(e){return null;}}
function scSet(k,v){try{sessionStorage.setItem(k,JSON.stringify(v));}catch(e){}}

function dateOffset(o){var d=new Date();d.setDate(d.getDate()+o);var y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');return y+'-'+m+'-'+dd;}
function dateStr(o){return dateOffset(o).replace(/-/g,'');}
function isoDate(w){if(!w)return '';var s=String(w);if(s.includes('-'))return s.slice(0,10);return s.slice(0,4)+'-'+s.slice(4,6)+'-'+s.slice(6,8);}
function todayISO(){var d=new Date();var y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');return y+'-'+m+'-'+dd;}
function dayNameShort(iso){return new Date(iso+'T12:00:00').toLocaleDateString('nl-NL',{weekday:'short'}).replace(/^\w/,function(c){return c.toUpperCase();});}
function dayNum(iso){return new Date(iso+'T12:00:00').getDate();}
function monthShort(iso){return new Date(iso+'T12:00:00').toLocaleDateString('nl-NL',{month:'short'}).replace(/^\w/,function(c){return c.toUpperCase();});}
function fullDate(iso){return new Date(iso+'T12:00:00').toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'});}
function getDateLabel(iso){var t=todayISO();if(iso===t)return 'Vandaag';if(iso===dateOffset(-1))return 'Gisteren';if(iso===dateOffset(1))return 'Morgen';return dayNameShort(iso);}

function toggleTheme(){
  var cur=document.documentElement.getAttribute('data-theme');
  var next=cur==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',next);
  try{localStorage.setItem('streamgids_theme',next);}catch(e){}
}

function shareItem(){
  if(!currentModalItem)return;
  var t=currentModalItem.title||'StreamGids';
  var txt='Bekijk "'+t+'" via StreamGids';
  if(navigator.share){navigator.share({title:t,text:txt,url:location.href}).catch(function(){});}
  else{window.open('https://wa.me/?text='+encodeURIComponent(txt+' '+location.href),'_blank');}
}

function wm(path,params){
  params=params||{};var url=new URL(WM_BASE+path);url.searchParams.set('apiKey',WM_KEY);
  Object.keys(params).forEach(function(k){url.searchParams.set(k,params[k]);});
  var ck='wm_'+url.toString();var c=scGet(ck);if(c)return Promise.resolve(c);
  return fetch(url.toString()).then(function(r){if(!r.ok)throw new Error('WM '+r.status);return r.json();}).then(function(d){scSet(ck,d);return d;});
}
function tmdb(path,params){
  params=params||{};var url=new URL(TMDB_BASE+path);
  Object.keys(params).forEach(function(k){url.searchParams.set(k,params[k]);});
  var ck='tmdb_'+url.toString();var c=scGet(ck);if(c)return Promise.resolve(c);
  return fetch(url.toString(),{headers:{'Authorization':'Bearer '+TMDB_TOKEN,'Content-Type':'application/json'}}).then(function(r){if(!r.ok)throw new Error('TMDB '+r.status);return r.json();}).then(function(d){scSet(ck,d);return d;});
}
function translateToNL(text){
  if(!text||!text.trim())return Promise.resolve('Geen beschrijving beschikbaar.');
  return fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(text.slice(0,500))+'&langpair=en|nl').then(function(r){return r.json();}).then(function(d){var t=d&&d.responseData&&d.responseData.translatedText;return(t&&t!==text&&t.toLowerCase().indexOf('mymemory')===-1)?t:text;}).catch(function(){return text;});
}

function fetchWMSources(){
  return wm('/sources',{regions:'NL'}).then(function(data){
    var all=Array.isArray(data)?data:[];
    all.filter(function(s){return s.regions&&s.regions.includes('NL');}).forEach(function(s){wmSourceMap[s.id]=s;});
    wmSources=all.filter(function(s){return s.type==='sub'&&s.regions&&s.regions.includes('NL');});
  }).catch(function(e){console.warn('WM sources:',e);wmSources=[];});
}
function fetchWMReleases(){
  var from=dateStr(-60),to=dateStr(30);
  return Promise.all([wm('/releases',{regions:'NL',start_date:from,end_date:to,types:'movie',limit:'500'}),wm('/releases',{regions:'NL',start_date:from,end_date:to,types:'tv_series,tv_miniseries,tv_special,tv_movie',limit:'500'})]).then(function(res){
    function parse(r,ft){return(r&&r.releases||[]).map(function(item){var src=wmSourceMap[item.source_id]||{name:item.source_name||''};var sn=(src.name||'').replace(/Netherlands/gi,'').trim();if(!sn||(!isNLStreaming(sn)&&!(src.regions&&src.regions.includes('NL'))))return null;var rv=resolveType(item.type||item.title_type)||ft;return Object.assign({},item,{img:item.poster_url||null,_type:rv,_date:isoDate(item.source_release_date),_src:Object.assign({},src,{name:sn||src.name}),_style:getSvcStyle(sn),_key:providerKey(sn),_originType:detectOrigin(sn),_source:'watchmode',_season:item.season_number||null});}).filter(Boolean);}
    return parse(res[0],'movie').concat(parse(res[1],'tv'));
  });
}
function fetchTMDBProviders(){
  return Promise.all([tmdb('/watch/providers/movie',{watch_region:'NL',language:'nl-NL'}),tmdb('/watch/providers/tv',{watch_region:'NL',language:'nl-NL'})]).then(function(res){
    var seen={};(res[0].results||[]).concat(res[1].results||[]).forEach(function(p){if(seen[p.provider_id])return;seen[p.provider_id]=true;var m=matchProvider(p.provider_name);if(!m)return;TMDB_NL_PROVIDERS[p.provider_id]={name:m.name,color:m.color,text:m.text,logo:p.logo_path?'https://image.tmdb.org/t/p/original'+p.logo_path:null,rawName:p.provider_name};});
  });
}
function tmdbPages(path,params,maxP){
  maxP=maxP||3;return tmdb(path,Object.assign({},params,{page:1})).catch(function(){return{results:[],total_pages:0};}).then(function(first){var all=(first.results||[]).slice();var total=Math.min(first.total_pages||1,maxP);if(total<=1)return all;var ps=[];for(var i=2;i<=total;i++){(function(pg){ps.push(tmdb(path,Object.assign({},params,{page:pg})).catch(function(){return{results:[]};}));})(i);}return Promise.all(ps).then(function(rest){rest.forEach(function(r){all=all.concat(r.results||[]);});return all;});});
}
function fetchTMDBReleases(){
  var items=[];var entries=Object.keys(TMDB_NL_PROVIDERS).map(function(id){return[id,TMDB_NL_PROVIDERS[id]];});if(!entries.length)return Promise.resolve([]);
  function makeItem(m,prov,id,type,overrideDate,epInfo){var date=overrideDate||(type==='movie'?(m.release_date||''):(m.first_air_date||''));if(!date||!m.id)return null;return{id:'tmdb-'+m.id+'-'+id+(overrideDate?'-'+overrideDate:''),title:m.title||m.name||m.original_title||m.original_name||'',img:m.poster_path?TMDB_IMG+m.poster_path:null,_type:type,_date:date,_src:{name:prov.name,logo_100px:prov.logo},_style:{color:prov.color,text:prov.text},_key:providerKey(prov.name),_originType:detectOrigin(prov.name),_source:'tmdb',_providerId:Number(id),tmdb_id:m.id,user_rating:m.vote_average||0,overview:m.overview||'',_epInfo:epInfo||null,_genres:m.genre_ids||[]};}  var sub=document.getElementById('loadSub');if(sub)sub.textContent='TMDB: actuele titels ophalen...';
  return Promise.all([tmdbPages('/movie/now_playing',{language:'nl-NL',region:'NL'},5),tmdbPages('/tv/on_the_air',{language:'nl-NL'},5)]).then(function(res){
    /* For TV on_the_air: fetch episode air dates so weekly episodes show on correct day */
    var tvShows=res[1].slice(0,50);
    var epDateMap={};/* tmdb_id -> {date, epInfo} */
    var epBatch=Promise.resolve();
    for(var ei=0;ei<tvShows.length;ei+=10){(function(batch){
      epBatch=epBatch.then(function(){return Promise.all(batch.map(function(show){
        return tmdb('/tv/'+show.id,{language:'nl-NL'}).then(function(detail){
          var candidates=[];
          if(detail.next_episode_to_air){
            candidates.push({date:detail.next_episode_to_air.air_date,s:detail.next_episode_to_air.season_number,e:detail.next_episode_to_air.episode_number,name:detail.next_episode_to_air.name||''});
          }
          if(detail.last_episode_to_air){
            candidates.push({date:detail.last_episode_to_air.air_date,s:detail.last_episode_to_air.season_number,e:detail.last_episode_to_air.episode_number,name:detail.last_episode_to_air.name||''});
          }
          var today=todayISO();
          var best=null;
          candidates.forEach(function(c){
            if(!c.date)return;
            if(!best)best=c;
            else if(Math.abs(new Date(c.date)-new Date(today))<Math.abs(new Date(best.date)-new Date(today)))best=c;
          });
          if(best)epDateMap[show.id]=best;
        }).catch(function(){});
      }));});
    })(tvShows.slice(ei,ei+10));}
    return epBatch.then(function(){
      var checks=res[0].slice(0,50).map(function(m){return Object.assign({},m,{_isTV:false});}).concat(tvShows.map(function(t){var ep=epDateMap[t.id];return Object.assign({},t,{_isTV:true,_epDate:ep?ep.date:null,_epInfo:ep?{s:ep.s,e:ep.e,name:ep.name}:null});}));
      var bw=Promise.resolve();for(var i=0;i<checks.length;i+=10){(function(batch){bw=bw.then(function(){return Promise.all(batch.map(function(m){return tmdb('/'+(m._isTV?'tv':'movie')+'/'+m.id+'/watch/providers').then(function(pd){var flat=pd&&pd.results&&pd.results.NL&&pd.results.NL.flatrate||[];flat.forEach(function(p){var prov=TMDB_NL_PROVIDERS[p.provider_id];if(!prov)return;var epDate=m._isTV?m._epDate:null;var epInfo=m._isTV?m._epInfo:null;var it=makeItem(m,prov,p.provider_id,m._isTV?'tv':'movie',epDate,epInfo);if(it)items.push(it);});}).catch(function(){});}));});})(checks.slice(i,i+10));}
      return bw;
    });
  }).then(function(){
    var bw=Promise.resolve();for(var i=0;i<entries.length;i+=4){(function(batch){bw=bw.then(function(){if(sub)sub.textContent='TMDB: '+batch.map(function(e){return e[1].name;}).join(', ')+'...';return Promise.all(batch.map(function(e){var id=e[0],prov=e[1];var base={watch_region:'NL',with_watch_providers:id,with_watch_monetization_types:'flatrate',language:'nl-NL',sort_by:'popularity.desc'};var cutoff=dateOffset(-1095);return Promise.all([tmdbPages('/discover/movie',Object.assign({},base,{'primary_release_date.gte':cutoff}),5).catch(function(){return[];}),tmdbPages('/discover/tv',Object.assign({},base,{'first_air_date.gte':cutoff}),5).catch(function(){return[];})]).then(function(r){r[0].forEach(function(m){var it=makeItem(m,prov,id,'movie');if(it)items.push(it);});r[1].forEach(function(t){var it=makeItem(t,prov,id,'tv');if(it)items.push(it);});});})).catch(function(){});});})(entries.slice(i,i+4));}
    return bw;
  }).then(function(){return items;});
}
/* ── Google Sheets CSV fetch ── */
function fetchGoogleSheet(){
  if(!GOOGLE_SHEET_CSV_URL)return Promise.resolve([]);
  var ck='gsheet_'+GOOGLE_SHEET_CSV_URL;var c=scGet(ck);if(c)return Promise.resolve(c);
  return fetch(GOOGLE_SHEET_CSV_URL).then(function(r){
    if(!r.ok)throw new Error('Sheet HTTP '+r.status);
    return r.text();
  }).then(function(csv){
    var lines=csv.split('\n');if(lines.length<2)return[];
    /* Parse header to find column indices */
    var hdr=lines[0].split(',').map(function(h){return h.trim().toLowerCase().replace(/['"]/g,'');});
    var ci={titel:hdr.indexOf('titel'),tmdb_id:hdr.indexOf('tmdb_id'),datum:hdr.indexOf('datum'),dienst:hdr.indexOf('dienst'),type:hdr.indexOf('type')};
    if(ci.titel===-1)ci.titel=0;if(ci.datum===-1)ci.datum=2;if(ci.dienst===-1)ci.dienst=3;
    var items=[];
    for(var i=1;i<lines.length;i++){
      var line=lines[i].trim();if(!line)continue;
      /* Simple CSV parse (handles basic quoting) */
      var cols=[];var cur='',inQ=false;
      for(var j=0;j<line.length;j++){
        var ch=line[j];
        if(ch==='"'){inQ=!inQ;}
        else if(ch===','&&!inQ){cols.push(cur.trim());cur='';}
        else{cur+=ch;}
      }
      cols.push(cur.trim());
      var titel=(cols[ci.titel]||'').replace(/^["']|["']$/g,'').trim();
      var tmdbId=(ci.tmdb_id>=0&&cols[ci.tmdb_id]||'').replace(/^["']|["']$/g,'').trim();
      var datum=(cols[ci.datum]||'').replace(/^["']|["']$/g,'').trim();
      var dienst=(cols[ci.dienst]||'').replace(/^["']|["']$/g,'').trim().toLowerCase();
      var type=(ci.type>=0&&cols[ci.type]||'movie').replace(/^["']|["']$/g,'').trim().toLowerCase();
      if(!titel||!datum)continue;
      /* Match to known provider */
      var prov=matchProvider(dienst);
      var svcName=prov?prov.name:dienst;
      var svcColor=prov?prov.color:'#444';
      var svcKey=prov?prov.key:dienst;
      items.push({
        id:'gs-'+i+'-'+titel.replace(/\s/g,'-').slice(0,20),
        title:titel,
        img:null,
        _type:type==='tv'?'tv':'movie',
        _date:datum,
        _src:{name:svcName,logo_100px:null},
        _style:{color:svcColor,text:'#fff'},
        _key:svcKey,
        _originType:detectOrigin(svcName),
        _source:'googlesheet',
        tmdb_id:tmdbId?Number(tmdbId):null,
        overview:'',
        user_rating:0
      });
    }
    console.log('[StreamGids] Google Sheet: '+items.length+' handmatige releases');
    scSet(ck,items);
    return items;
  }).catch(function(e){console.warn('[StreamGids] Google Sheet fout:',e);return[];});
}

/* ── Enrich Google Sheet items with TMDB posters/info ── */
function enrichSheetItems(items){
  if(!items.length)return Promise.resolve(items);
  var idx=0;
  function next(){
    if(idx>=items.length)return Promise.resolve();
    var batch=items.slice(idx,idx+5);idx+=5;
    return Promise.all(batch.map(function(item){
      /* If tmdb_id is set, fetch directly */
      var p;
      if(item.tmdb_id){
        var type=item._type==='tv'?'tv':'movie';
        p=tmdb('/'+type+'/'+item.tmdb_id,{language:'nl-NL'});
      }else{
        /* Search by title */
        var type=item._type==='tv'?'tv':'movie';
        p=tmdb('/search/'+type,{query:item.title,language:'nl-NL'}).then(function(res){
          var hit=(res.results||[])[0];
          if(hit){item.tmdb_id=hit.id;return hit;}
          return null;
        });
      }
      return p.then(function(d){
        if(!d)return;
        if(d.poster_path){item.img=TMDB_IMG+d.poster_path;imgCache[item.id]=item.img;}
        if(d.overview&&!item.overview)item.overview=d.overview;
        if(!item.title&&(d.title||d.name))item.title=d.title||d.name;
      }).catch(function(){});
    })).then(next);
  }
  return next().then(function(){
    /* Also enrich provider logos for sheet items */
    items.forEach(function(item){
      if(!item._src.logo_100px){
        var pk=(item._key||'').toLowerCase();
        Object.keys(TMDB_NL_PROVIDERS).forEach(function(pid){
          var pr=TMDB_NL_PROVIDERS[pid];
          if(pr&&pr.name&&providerKey(pr.name)===pk&&pr.logo)item._src.logo_100px=pr.logo;
        });
      }
    });
    return items;
  });
}

function mergeItems(wm,tm,gs){
  var result=[],seen={},titleSeen={};
  wm.forEach(function(i){if(!i._date)return;var k=(i.title||'').toLowerCase().trim()+'|'+i._key;if(seen[k])return;seen[k]=true;titleSeen[(i.title||'').toLowerCase().trim()]=true;result.push(i);});
  var ts={};tm.forEach(function(i){if(!i._date||!i.title)return;var dk=i.tmdb_id+'|'+i._key;if(ts[dk])return;ts[dk]=true;var tk=(i.title||'').toLowerCase().trim()+'|'+i._key;if(seen[tk])return;seen[tk]=true;titleSeen[(i.title||'').toLowerCase().trim()]=true;result.push(i);});
  /* Google Sheet items — skip if same title+provider+date already exists, or same title+provider */
  (gs||[]).forEach(function(i){if(!i._date||!i.title)return;var tl=(i.title||'').toLowerCase().trim();var gk=tl+'|'+i._key+'|'+i._date;if(seen[gk])return;seen[gk]=true;var gk2=tl+'|'+i._key;if(seen[gk2])return;seen[gk2]=true;result.push(i);});
  return result;
}

/* ── DATE TABS ── */
function buildDateTabs(){
  var c=document.getElementById('dateTabs');allDays=[];
  var minDate=dateOffset(-7),maxDate=dateOffset(14);
  for(var i=-7;i<=14;i++)allDays.push(dateOffset(i));
  /* Do NOT add item dates outside -7/+14 range */
  if(!selectedDate)selectedDate=todayISO();
  /* Ensure selectedDate is within range */
  if(selectedDate<minDate||selectedDate>maxDate)selectedDate=todayISO();
  c.innerHTML=allDays.map(function(iso){
    var label=getDateLabel(iso);var isActive=iso===selectedDate;
    var sub=iso===todayISO()?'':'<span class="dsub">'+dayNum(iso)+' '+monthShort(iso)+'</span>';
    return '<button class="dtab'+(isActive?' active':'')+'" data-date="'+iso+'">'+label+sub+'</button>';
  }).join('');
  setTimeout(function(){var a=c.querySelector('.dtab.active');if(a)a.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});},50);
}
function selectDate(iso){selectedDate=iso;document.querySelectorAll('.dtab').forEach(function(t){t.classList.toggle('active',t.getAttribute('data-date')===iso);});renderMain();}

/* ── SERVICE BAR ── */
function buildSvcBar(){
  var bar=document.getElementById('svcBar');var provMap={};
  allItems.forEach(function(item){var k=item._key||'';if(provMap[k])return;provMap[k]={name:item._src&&item._src.name||k,style:item._style,logo:item._src&&item._src.logo_100px||null};});
  var keys=Object.keys(provMap).sort(function(a,b){var ra=POPULAR_KEYS.indexOf(a);if(ra===-1)ra=999;var rb=POPULAR_KEYS.indexOf(b);if(rb===-1)rb=999;if(ra!==rb)return ra-rb;return provMap[a].name.localeCompare(provMap[b].name);});
  var html='<button class="sc active" data-k="all">Alle streamers</button>';
  keys.forEach(function(k){var info=provMap[k];var logo=info.logo?'<img src="'+info.logo+'" alt="'+info.name+'" onerror="this.style.display=\'none\'" loading="lazy">':'<div class="dot" style="background:'+info.style.color+'"></div>';html+='<button class="sc'+(svcFilter===k?' active':'')+'" data-k="'+k+'">'+logo+info.name+'</button>';});
  bar.innerHTML=html;
}

/* ── MAIN RENDER ── */
function filteredItems(){return allItems.filter(function(i){if(typeFilter==='movie'&&i._type!=='movie')return false;if(typeFilter==='tv'&&i._type!=='tv')return false;if(svcFilter!=='all'&&i._key!==svcFilter)return false;return !!i._date;});}

function renderMain(){
  var main=document.getElementById('main');main.innerHTML='';
  var items=filteredItems().filter(function(i){return i._date===selectedDate;});
  /* Hide items without poster */
  items=items.filter(function(i){return imgCache[i.id]||i.img;});
  items=applyContentFilter(items);
  if(!items.length){main.innerHTML='<div class="empty-state"><div style="font-size:16px;margin-bottom:6px;font-weight:600">Geen releases</div><div style="font-size:13px;color:var(--t3)">Geen nieuwe content op '+getDateLabel(selectedDate).toLowerCase()+'. Probeer een andere dag.</div></div>';return;}
  var svcGroups={};var svcOrder=[];
  items.forEach(function(item){var k=item._key||'overig';if(!svcGroups[k]){svcGroups[k]={name:item._src&&item._src.name||k,logo:item._src&&item._src.logo_100px||null,color:item._style&&item._style.color||'#444',items:[]};svcOrder.push(k);}svcGroups[k].items.push(item);});
  svcOrder.sort(function(a,b){var ra=POPULAR_KEYS.indexOf(a);if(ra===-1)ra=999;var rb=POPULAR_KEYS.indexOf(b);if(rb===-1)rb=999;if(ra!==rb)return ra-rb;return svcGroups[b].items.length-svcGroups[a].items.length;});
  svcOrder.forEach(function(key,idx){
    var g=svcGroups[key];var sec=document.createElement('div');sec.className='svc-section'+(collapsedSections[key]?' collapsed':'');sec.id='svc-'+key;sec.style.animationDelay=(idx*0.04)+'s';
    var logoHtml=g.logo?'<img class="svc-logo" src="'+g.logo+'" alt="'+g.name+'" onerror="this.style.display=\'none\'" loading="lazy">':'<div class="svc-dot" style="background:'+g.color+'">'+g.name.charAt(0)+'</div>';
    var mc=g.items.filter(function(i){return i._type==='movie';}).length;var tc=g.items.filter(function(i){return i._type==='tv';}).length;var parts=[];if(mc)parts.push(mc+' film'+(mc>1?'s':''));if(tc)parts.push(tc+' serie'+(tc>1?'s':''));
    sec.innerHTML='<div class="svc-hdr" data-key="'+key+'">'+logoHtml+'<div class="svc-name">'+g.name+'</div><div class="svc-cnt">'+parts.join(' · ')+'</div><svg class="svc-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div><div class="svc-body">'+g.items.map(function(item){return crowHtml(item);}).join('')+'</div>';
    main.appendChild(sec);
  });
}
function crowHtml(item){
  var title=(item.title||'').replace(/'/g,"&#39;").replace(/"/g,'&quot;');var sid=String(item.id).replace(/['"\\]/g,'');var poster=imgCache[item.id]||item.img||'';var tl=item._type==='movie'?'Film':'Serie';var cls=item._type==='movie'?'film':'serie';var sn=(item._src&&item._src.name||'Streaming').replace(/Netherlands/gi,'').trim();
  var epBadge='';
  if(item._type==='tv'&&item._epInfo&&item._epInfo.s){
    epBadge='<div class="crow-ep-badge">Nieuwe aflevering</div>';
  }else if(item._type==='tv'&&item._season){
    epBadge='<div class="crow-ep-badge">Nieuw seizoen (S'+item._season+')</div>';
  }else if(item._type==='tv'&&item._source==='googlesheet'){
    epBadge='<div class="crow-ep-badge">Nieuwe aflevering</div>';
  }
  return '<div class="crow" data-id="'+sid+'"><div class="crow-poster">'+(poster?'<img src="'+poster+'" alt="'+title+'" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=crow-fb>'+title.replace(/'/g,'').replace(/"/g,'')+'</div>\'">':'<div class="crow-fb" id="fb-'+sid+'">'+title+'</div>')+'</div><div class="crow-info"><div class="crow-title">'+title+'</div>'+epBadge+'<div class="crow-meta">'+tl+' - '+sn+'</div></div><div class="crow-badge '+cls+'">'+tl+'</div></div>';
}
function toggleSection(key){collapsedSections[key]=!collapsedSections[key];var sec=document.getElementById('svc-'+key);if(sec)sec.classList.toggle('collapsed');}
function enrichMissingPosters(){var missing=allItems.filter(function(i){return !i.img&&!imgCache[i.id]&&i.title;});var idx=0;function next(){if(idx>=missing.length)return;var batch=missing.slice(idx,idx+6);idx+=6;Promise.all(batch.map(function(item){var type=item._type==='movie'?'movie':'tv';return tmdb('/search/'+type,{query:item.title,language:'nl-NL'}).then(function(res){var hit=(res.results||[]).find(function(r){return r.poster_path;});if(!hit||!hit.poster_path)return;var url=TMDB_IMG+hit.poster_path;imgCache[item.id]=url;item.img=url;}).catch(function(){});})).then(next);}next();}

/* ── BOTTOM NAV ── */
function setType(f){
  typeFilter=f;document.querySelectorAll('.bnav').forEach(function(n){n.classList.toggle('active',n.getAttribute('data-f')===f);});
  var dt=document.getElementById('dateTabs');var sb=document.getElementById('svcBar');var fb=document.getElementById('filterBar');
  /* Slogan always stays visible */
  if(f==='top10'){dt.style.display='none';sb.style.display='none';if(fb)fb.style.display='none';renderTop10();}
  else if(f==='livesport'){dt.style.display='none';sb.style.display='none';if(fb)fb.style.display='none';renderLiveSport();}
  else if(f==='search'){dt.style.display='none';sb.style.display='none';if(fb)fb.style.display='none';renderSearch();}
  else{dt.style.display='';sb.style.display='';if(fb)fb.style.display='';updateFilterChips(f);renderMain();}
}

/* ── MODAL ── */
function openModal(rawId){
  var overlay=document.getElementById('overlay');var si=document.getElementById('si');var sd=document.getElementById('sd');var wb=document.getElementById('wb');var shareBtn=document.getElementById('shareBtn');var ratingsRow=document.getElementById('ratingsRow');
  var item=allItems.find(function(i){return String(i.id)===String(rawId);});if(!item)return;currentModalItem=item;
  var title=item.title,_src=item._src,_style=item._style,_type=item._type,_originType=item._originType,_source=item._source,tmdb_id=item.tmdb_id;
  var svcName=(_src&&_src.name||'Streaming').replace(/Netherlands/gi,'').trim();var color=_style&&_style.color||'#40e86a';var initPoster=imgCache[item.id]||item.img||'';
  si.innerHTML='<div class="sheet-header"><div class="sp">'+(initPoster?'<img src="'+initPoster+'" alt="">':'')+'</div><div class="sinf"><div class="ssvc" style="color:'+color+'">'+svcName+'</div><div class="stitle">'+title+'</div><div class="smeta">'+(_type==='movie'?'Film':'Serie')+' - laden...</div></div></div>';
  sd.textContent=item.overview||'Beschrijving laden...';ratingsRow.style.display='none';ratingsRow.innerHTML='';wb.style.display='none';if(shareBtn)shareBtn.style.display='flex';
  overlay.classList.add('open');document.body.style.overflow='hidden';
  var fullTitle=title,year='',runtime='',genres='',rawOverview=item.overview||'',watchLink=null,imdbId=null,seasonInfo=item._season?'Seizoen '+item._season:'',posterUrl=initPoster,tmdbRating=item.user_rating||0;
  var resolvedTmdbId=tmdb_id||(_source==='tmdb'?String(rawId).replace(/tmdb-(\d+)-.*/,'$1'):null);
  var chain=Promise.resolve();
  if(resolvedTmdbId){chain=chain.then(function(){var cKey='tmdb-'+_type+'-'+resolvedTmdbId;if(detailCache[cKey])return detailCache[cKey];var path=_type==='movie'?'/movie/'+resolvedTmdbId:'/tv/'+resolvedTmdbId;return Promise.all([tmdb(path,{language:'nl-NL'}),tmdb(path+'/watch/providers'),tmdb(path+'/external_ids').catch(function(){return{};})]).then(function(r){detailCache[cKey]={det:r[0],prov:r[1],extIds:r[2]};return detailCache[cKey];}).catch(function(){detailCache[cKey]=null;return null;});}).then(function(cached){if(cached&&cached.det){var d=cached.det;fullTitle=d.title||d.name||title;year=(d.release_date||d.first_air_date||'').slice(0,4);runtime=d.runtime?d.runtime+' min':'';tmdbRating=d.vote_average||tmdbRating;genres=(d.genres||[]).slice(0,4).map(function(g){return '<span class="stag">'+g.name+'</span>';}).join('');if(d.overview)rawOverview=d.overview;if(_type==='tv'&&d.number_of_seasons)seasonInfo=d.number_of_seasons+' seizoen'+(d.number_of_seasons>1?'en':'');if(d.poster_path){posterUrl=TMDB_IMG+d.poster_path;imgCache[item.id]=posterUrl;item.img=posterUrl;}var nlProv=cached.prov&&cached.prov.results&&cached.prov.results.NL;if(nlProv&&nlProv.link)watchLink=nlProv.link;imdbId=cached.extIds&&cached.extIds.imdb_id||null;}});}
  chain.then(function(){
    if(!watchLink){var svc=(_src&&_src.name||'').toLowerCase();if(svc.includes('netflix'))watchLink='https://www.netflix.com/search?q='+encodeURIComponent(fullTitle);else if(svc.includes('prime'))watchLink='https://www.amazon.nl/s?k='+encodeURIComponent(fullTitle);else if(svc.includes('disney'))watchLink='https://www.disneyplus.com/search/'+encodeURIComponent(fullTitle);else if(svc.includes('apple'))watchLink='https://tv.apple.com/';else if(svc.includes('max'))watchLink='https://www.max.com/';else if(svc.includes('sky'))watchLink='https://www.skyshowtime.com/';else if(svc.includes('videoland'))watchLink='https://www.videoland.com/';else if(svc.includes('path'))watchLink='https://www.pathe-thuis.nl/';else if(svc.includes('npo'))watchLink='https://npo.nl/';else if(svc.includes('paramount'))watchLink='https://www.paramountplus.com/nl/';else if(svc.includes('discovery'))watchLink='https://www.discoveryplus.com/nl/';}
    var mp=[_type==='movie'?'Film':'Serie'];if(year)mp.push(year);if(runtime)mp.push(runtime);if(_type==='tv'&&seasonInfo)mp.push(seasonInfo);
    si.innerHTML='<div class="sheet-header"><div class="sp">'+(posterUrl?'<img src="'+posterUrl+'" alt="">':'')+'</div><div class="sinf"><div class="ssvc" style="color:'+color+'">'+svcName+'</div><div class="stitle">'+fullTitle+'</div><div class="smeta">'+mp.join(' - ')+'</div><div class="stags">'+genres+'</div></div></div>';
    sd.textContent=rawOverview||'Geen beschrijving beschikbaar.';
    if(rawOverview&&/^[A-Za-z\s]{20,}/.test(rawOverview.slice(0,60))){translateToNL(rawOverview).then(function(txt){if(currentModalItem===item&&txt&&txt!==rawOverview)sd.textContent=txt;});}
    var chips=[];var imdbUrl=imdbId?'https://www.imdb.com/title/'+imdbId+'/':'https://www.imdb.com/find/?q='+encodeURIComponent(fullTitle)+'&s=tt';
    chips.push('<a class="rating-chip imdb" href="'+imdbUrl+'" target="_blank" rel="noopener"><span class="chip-logo">IMDb</span>Bekijk</a>');
    chips.push('<a class="rating-chip rt" href="https://www.rottentomatoes.com/search?search='+encodeURIComponent(fullTitle)+'" target="_blank" rel="noopener"><span class="chip-logo">RT</span>Bekijk</a>');
    ratingsRow.innerHTML=chips.join('');ratingsRow.style.display='flex';
    if(watchLink){wb.href=watchLink;wb.style.display='flex';var wbLogo=document.getElementById('wbLogo');var wbLabel=document.getElementById('wbLabel');var pLogo=item._src&&item._src.logo_100px||null;
      /* If no logo from item, try to find from TMDB_NL_PROVIDERS */
      if(!pLogo){var pKey=(item._key||'').toLowerCase();Object.keys(TMDB_NL_PROVIDERS).forEach(function(pid){var pr=TMDB_NL_PROVIDERS[pid];if(pr&&pr.name&&providerKey(pr.name)===pKey&&pr.logo)pLogo=pr.logo;});}
      if(pLogo&&wbLogo){wbLogo.src=pLogo;wbLogo.alt=svcName;wbLogo.style.display='block';}else if(wbLogo){wbLogo.style.display='none';}if(wbLabel)wbLabel.textContent='Kijken op '+svcName;}
  });
}
function closeModal(){document.getElementById('overlay').classList.remove('open');document.body.style.overflow='';currentModalItem=null;}

/* ── TOP 10 ── */
var top10Period='day',top10Category='all',top10Cache={};
function fetchTop10(p,c){var ck='t10_'+p+'_'+c;if(top10Cache[ck])return Promise.resolve(top10Cache[ck]);var ep=c==='all'?'/trending/all/'+p:'/trending/'+c+'/'+p;return tmdb(ep,{language:'nl-NL',region:'NL'}).then(function(d){var r=(d.results||[]).slice(0,20);top10Cache[ck]=r;return r;}).catch(function(){return[];});}
function renderTop10(){
  var main=document.getElementById('main');main.innerHTML='';var sec=document.createElement('section');sec.className='top10-section';
  sec.innerHTML='<div class="top10-title">Top 10 trending '+(top10Period==='day'?'vandaag':'deze week')+'</div><div class="top10-sub">Meest bekeken op streaming</div><div class="t10-tabs" id="t10tabs"></div><div id="t10list" class="t10-list"><div class="t10-loading"><div class="ld-spinner" style="margin:0 auto 8px"></div>Laden...</div></div>';
  main.appendChild(sec);renderT10Tabs();
  fetchTop10(top10Period,top10Category).then(function(items){
    var el=document.getElementById('t10list');if(!el)return;if(!items.length){el.innerHTML='<div class="t10-loading">Geen data.</div>';return;}
    /* Check NL streaming availability for each item, filter out cinema-only */
    var checks=items.map(function(item){
      var isTV=item.media_type==='tv'||(!item.title&&item.name);
      var type=isTV?'tv':'movie';
      return tmdb('/'+type+'/'+item.id+'/watch/providers').then(function(pd){
        var nlFlat=pd&&pd.results&&pd.results.NL&&pd.results.NL.flatrate||[];
        item._nlProviders=nlFlat;
        item._hasNLStream=nlFlat.length>0;
        /* Find matching provider name */
        item._streamerLabel='';
        for(var i=0;i<nlFlat.length;i++){
          var m=matchProvider(nlFlat[i].provider_name);
          if(m){item._streamerLabel=m.name;break;}
        }
        if(!item._streamerLabel&&nlFlat.length>0)item._streamerLabel=nlFlat[0].provider_name||'';
      }).catch(function(){item._nlProviders=[];item._hasNLStream=false;item._streamerLabel='';});
    });
    Promise.all(checks).then(function(){
      /* Filter out items that are not available on NL streaming */
      var streamable=items.filter(function(item){return item._hasNLStream;});
      if(!streamable.length){el.innerHTML='<div class="t10-loading">Geen streambare content gevonden.</div>';return;}
      el.innerHTML=streamable.slice(0,10).map(function(item,idx){
        var rank=idx+1;var isTV=item.media_type==='tv'||(!item.title&&item.name);
        var title=item.title||item.name||'?';var poster=item.poster_path?TMDB_IMG+item.poster_path:'';
        var year=(item.release_date||item.first_air_date||'').slice(0,4);
        var score=item.vote_average?Number(item.vote_average).toFixed(1):'';
        var tl=isTV?'Serie':'Film';var rc=rank<=3?'r'+rank:'';
        var safe=title.replace(/'/g,"&#39;");var mt=item.media_type||(isTV?'tv':'movie');
        var streamerHtml=item._streamerLabel?'<span class="t10-streamer">'+item._streamerLabel+'</span>':'';
        return '<div class="t10-item" data-tmdb="'+item.id+'" data-mt="'+mt+'" data-title="'+safe+'"><div class="t10-rank '+rc+'">'+rank+'</div><div class="t10-poster">'+(poster?'<img src="'+poster+'" alt="'+safe+'" loading="lazy">':'')+'</div><div class="t10-info"><div class="t10-name">'+title+'<span class="t10-badge">'+tl+'</span></div><div class="t10-meta">'+year+streamerHtml+'</div></div>'+(score?'<div class="t10-score">'+score+'</div>':'')+'</div>';
      }).join('');
    });
  });
}
function renderT10Tabs(){var c=document.getElementById('t10tabs');if(!c)return;c.innerHTML=['day','week'].map(function(p){return '<button class="t10-tab'+(top10Period===p?' active':'')+'" data-p="'+p+'">'+(p==='day'?'Vandaag':'Deze week')+'</button>';}).join('')+['all','movie','tv'].map(function(cat){return '<button class="t10-tab'+(top10Category===cat?' active':'')+'" data-c="'+cat+'">'+(cat==='all'?'Alles':cat==='movie'?'Films':'Series')+'</button>';}).join('');}
function openTop10Modal(tmdbId,mt,title){var existing=allItems.find(function(i){return String(i.tmdb_id)===String(tmdbId);});if(existing){openModal(existing.id);return;}var fi={id:'t10-'+tmdbId,title:title,img:null,_type:mt==='tv'?'tv':'movie',_date:'',_src:{name:'Streaming'},_style:{color:'#40e86a',text:'#fff'},_key:'streaming',_originType:'licensed',_source:'tmdb',tmdb_id:tmdbId,overview:'',user_rating:0};allItems.push(fi);openModal('t10-'+tmdbId);}

/* ── LIVE SPORT ── */
/* Only streaming platforms available as standalone apps in NL */
var STREAMING_ONLY = ['Viaplay','Netflix','Discovery+','Prime Video'];
var FD_KEY='a5121338cb264baaa294099596feaf92';var FD_BASE='https://api.football-data.org/v4';
/* NL streaming rights (2024/2025 season):
   - Eredivisie: ESPN (cable only, NOT streaming) -> EXCLUDED
   - Champions League: Viaplay
   - Premier League: Viaplay (all matches)
   - La Liga: Viaplay
   - Bundesliga: Ziggo Sport (cable only) -> EXCLUDED
   - Ligue 1: Canal+ (cable only in NL) -> EXCLUDED
*/
var FOOTBALL_COMPS=[
  {code:'CL',name:'Champions League',streamer:'Viaplay'},
  {code:'PL',name:'Premier League',streamer:'Viaplay'},
  {code:'PD',name:'La Liga',streamer:'Viaplay'}
];
var SPORT_STREAMERS={Viaplay:{bg:'rgba(123,79,227,0.85)'},'Discovery+':{bg:'rgba(0,54,160,0.85)'},Netflix:{bg:'rgba(229,9,20,0.85)'},'Prime Video':{bg:'rgba(0,168,224,0.85)'}};
var sportFilter='today',sportCache=null,sportFetchErrors=[];
var CORS_PROXIES=[function(u){return 'https://corsproxy.io/?url='+encodeURIComponent(u);},function(u){return 'https://api.allorigins.win/raw?url='+encodeURIComponent(u);}];
function fd(path,params){params=params||{};var url=new URL(FD_BASE+path);Object.keys(params).forEach(function(k){url.searchParams.set(k,params[k]);});var raw=url.toString(),ck='fd4_'+raw,c=scGet(ck);if(c)return Promise.resolve(c);var idx=0;function tryP(){if(idx>=CORS_PROXIES.length)return Promise.reject(new Error('niet bereikbaar'));var pUrl=CORS_PROXIES[idx++](raw);return fetch(pUrl,{headers:{'X-Auth-Token':FD_KEY,'Accept':'application/json'}}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.text();}).then(function(t){var d=JSON.parse(t);scSet(ck,d);return d;}).catch(function(){return tryP();});}return tryP();}

function getSportLogo(sport,subtitle){
  /* Try subtitle first (league name), then sport */
  var key=subtitle||sport||'';
  if(SPORT_LOGOS[key])return SPORT_LOGOS[key];
  /* Try partial match */
  var lk=key.toLowerCase();
  var keys=Object.keys(SPORT_LOGOS);
  for(var i=0;i<keys.length;i++){if(lk.indexOf(keys[i].toLowerCase())!==-1)return SPORT_LOGOS[keys[i]];}
  if(SPORT_LOGOS[sport])return SPORT_LOGOS[sport];
  return '';
}

function fetchSportEvents(){
  if(sportCache)return Promise.resolve(sportCache);
  var events=[],seenIds={},now=new Date();sportFetchErrors=[];
  var dateFrom=new Date(now.getTime()-86400000).toISOString().slice(0,10);var dateTo=new Date(now.getTime()+45*86400000).toISOString().slice(0,10);
  function add(ev){if(seenIds[ev.id])return;seenIds[ev.id]=true;events.push(ev);}
  function nextWd(day,h,m){var d=new Date();var diff=((day-d.getDay()+7)%7)||7;d.setDate(d.getDate()+diff);d.setHours(h||2,m||0,0,0);return new Date(d);}
  var ffs=FOOTBALL_COMPS.map(function(comp){return fd('/competitions/'+comp.code+'/matches',{dateFrom:dateFrom,dateTo:dateTo}).then(function(data){(data.matches||[]).forEach(function(m){if(!m.utcDate)return;if(['FINISHED','AWARDED','CANCELLED','POSTPONED','SUSPENDED'].indexOf(m.status)!==-1)return;var d=new Date(m.utcDate);if(isNaN(d.getTime()))return;var home=m.homeTeam&&(m.homeTeam.shortName||m.homeTeam.name)||'?';var away=m.awayTeam&&(m.awayTeam.shortName||m.awayTeam.name)||'?';var live=['IN_PLAY','PAUSED','LIVE'].indexOf(m.status)!==-1;add({id:'fd-'+m.id,title:home+' - '+away,subtitle:comp.name,sport:'Voetbal',streamer:comp.streamer,date:d,venue:'',isLive:live});});}).catch(function(e){sportFetchErrors.push(comp.name+': '+e.message);});});
  /* F1 on Viaplay NL */
  var f1F=function(){var ck='jolpica_f1_2025';var d=scGet(ck);var p=d?Promise.resolve(d):fetch('https://api.jolpi.ca/ergast/f1/2025/').then(function(r){if(r.ok)return r.json();throw 0;}).catch(function(){return fetch('https://ergast.com/api/f1/2025.json').then(function(r){return r.json();});}).then(function(data){scSet(ck,data);return data;}).catch(function(){return null;});return p.then(function(data){if(!data)return;(data.MRData&&data.MRData.RaceTable&&data.MRData.RaceTable.Races||[]).forEach(function(race){var rd=new Date(race.date+'T'+(race.time||'13:00:00'));if(rd<new Date(now.getTime()-3600000)||rd>new Date(now.getTime()+45*86400000))return;var loc=(race.Circuit&&race.Circuit.Location)?race.Circuit.Location.locality+', '+race.Circuit.Location.country:'';add({id:'f1-'+race.season+'-'+race.round,title:race.raceName,subtitle:'Formule 1',sport:'F1',streamer:'Viaplay',date:rd,venue:loc,isLive:false});});});};
  /* WWE on Netflix NL */
  add({id:'wwe-raw',title:'WWE Raw',subtitle:'WWE',sport:'Wrestling',streamer:'Netflix',date:nextWd(1,2,0),venue:'',isLive:false});
  add({id:'wwe-sd',title:'WWE SmackDown',subtitle:'WWE',sport:'Wrestling',streamer:'Netflix',date:nextWd(5,2,0),venue:'',isLive:false});
  /* UFC on Discovery+ NL */
  add({id:'ufc',title:'UFC Fight Night',subtitle:'UFC',sport:'MMA',streamer:'Discovery+',date:nextWd(6,5,0),venue:'',isLive:false});
  return Promise.all(ffs.concat([f1F()])).catch(function(){}).then(function(){events.sort(function(a,b){if(a.isLive&&!b.isLive)return -1;if(!a.isLive&&b.isLive)return 1;return a.date-b.date;});sportCache=events.slice(0,80);return sportCache;});
}
function formatSportDate(d){var now=new Date(),ts=now.toISOString().slice(0,10),es=d.toISOString().slice(0,10);var tm=d.toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'});if(es===ts)return 'Vandaag '+tm;var diff=Math.floor((d-now)/86400000);if(diff===1)return 'Morgen '+tm;if(diff>=0&&diff<7)return d.toLocaleDateString('nl-NL',{weekday:'long'})+' '+tm;return d.toLocaleDateString('nl-NL',{day:'numeric',month:'short'})+' '+tm;}
function renderLiveSport(){
  var main=document.getElementById('main');main.innerHTML='';var sec=document.createElement('section');sec.className='sport-section';
  sec.innerHTML='<div class="sport-hdr"><div class="sport-dot-live"></div><div class="sport-hdr-title">Live Sport</div></div><div class="sport-sub">Aankomende live sport op NL streaming</div><div class="sp-tabs" id="sptabs"></div><div id="splist" class="sp-list"><div class="t10-loading"><div class="ld-spinner" style="margin:0 auto 8px"></div>Laden...</div></div><div class="sp-disclaimer">Voetbal via football-data.org - F1 via Jolpica - WWE/UFC indicatief</div>';
  main.appendChild(sec);renderSpTabs();fetchSportEvents().then(function(evs){renderSportList(evs);});
}
/* No "Nu live" tab - only Alles, Vandaag, Deze week */
function renderSpTabs(){var c=document.getElementById('sptabs');if(!c)return;c.innerHTML=['all','today','week'].map(function(f){var labels={all:'Alles',today:'Vandaag',week:'Deze week'};return '<button class="sp-tab'+(sportFilter===f?' active':'')+'" data-sf="'+f+'">'+labels[f]+'</button>';}).join('');}
function renderSportList(evs){
  var el=document.getElementById('splist');if(!el)return;var now=new Date(),ts=now.toISOString().slice(0,10),we=new Date(now.getTime()+7*86400000);
  var filtered=evs;if(sportFilter==='today')filtered=evs.filter(function(e){return e.isLive||e.date.toISOString().slice(0,10)===ts;});if(sportFilter==='week')filtered=evs.filter(function(e){return e.isLive||(e.date>=now&&e.date<=we);});
  if(!filtered.length){el.innerHTML='<div class="sp-empty">Geen evenementen gevonden.</div>';return;}
  el.innerHTML=filtered.map(function(ev){
    var info=SPORT_STREAMERS[ev.streamer]||{bg:'rgba(100,100,100,0.85)'};var tm=ev.isLive?'':formatSportDate(ev.date);var right=ev.isLive?'<div class="sp-live-badge">LIVE</div>':'<div class="sp-time">'+tm+'</div>';
    var logo=getSportLogo(ev.sport,ev.subtitle);
    var iconHtml=logo?'<img src="'+logo+'" alt="" style="width:28px;height:28px;object-fit:contain" onerror="this.parentElement.textContent=\'\'">':'';
    return '<div class="sp-ev'+(ev.isLive?' live':'')+'"><div class="sp-icon">'+iconHtml+'</div><div class="sp-info"><div class="sp-title">'+ev.title+'</div><div class="sp-meta">'+ev.subtitle+(ev.venue?' - '+ev.venue:'')+'</div></div><div class="sp-right">'+right+'<div class="sp-streamer" style="background:'+info.bg+';color:#fff">'+ev.streamer+'</div></div></div>';
  }).join('');
}

/* ── SEARCH ── */
var searchTimeout=null;
function renderSearch(){
  var main=document.getElementById('main');main.innerHTML='';
  var sec=document.createElement('section');sec.className='search-section';
  sec.innerHTML='<div class="search-input-wrap"><svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input class="search-input" id="searchInput" type="text" placeholder="Zoek een film of serie..." autocomplete="off" autofocus></div><div id="searchResults" class="search-results"><div class="search-hint">Wil je weten of een film of serie te streamen is? Zoek nu!</div></div>';
  main.appendChild(sec);
  var inp=document.getElementById('searchInput');
  if(inp){
    inp.focus();
    inp.addEventListener('input',function(){
      clearTimeout(searchTimeout);
      var q=inp.value.trim();
      if(q.length<2){document.getElementById('searchResults').innerHTML='<div class="search-hint">Typ de naam van een film of serie om te zoeken.</div>';return;}
      searchTimeout=setTimeout(function(){doSearch(q);},350);
    });
  }
}
function doSearch(q){
  var el=document.getElementById('searchResults');if(!el)return;
  el.innerHTML='<div class="search-hint">Zoeken naar "'+q+'"...</div>';
  var ql=q.toLowerCase();
  /* Search local items first */
  var localHits=allItems.filter(function(i){return i.title&&i.title.toLowerCase().indexOf(ql)!==-1&&i._key!=='search';});
  var seen={};var deduped=[];
  localHits.forEach(function(i){var k=(i.title||'').toLowerCase()+'|'+i._type;if(seen[k])return;seen[k]=true;deduped.push(i);});
  /* Also search TMDB */
  Promise.all([
    tmdb('/search/movie',{query:q,language:'nl-NL',region:'NL'}).catch(function(){return{results:[]};}),
    tmdb('/search/tv',{query:q,language:'nl-NL',region:'NL'}).catch(function(){return{results:[]};})
  ]).then(function(res){
    var tmdbRaw=[];
    (res[0].results||[]).slice(0,10).forEach(function(m){
      var k=(m.title||m.name||'').toLowerCase()+'|movie';
      if(!seen[k]){seen[k]=true;tmdbRaw.push({raw:m,type:'movie'});}
    });
    (res[1].results||[]).slice(0,10).forEach(function(t){
      var k=(t.name||t.title||'').toLowerCase()+'|tv';
      if(!seen[k]){seen[k]=true;tmdbRaw.push({raw:t,type:'tv'});}
    });
    /* Look up NL streaming providers for TMDB results */
    return Promise.all(tmdbRaw.map(function(entry){
      return tmdb('/'+entry.type+'/'+entry.raw.id+'/watch/providers').then(function(pd){
        var nlFlat=pd&&pd.results&&pd.results.NL&&pd.results.NL.flatrate||[];
        var nlLink=pd&&pd.results&&pd.results.NL&&pd.results.NL.link||null;
        var streamer='';var sColor='#40e86a';
        for(var i=0;i<nlFlat.length;i++){var mp=matchProvider(nlFlat[i].provider_name);if(mp){streamer=mp.name;sColor=mp.color;break;}}
        if(!streamer&&nlFlat.length>0)streamer=nlFlat[0].provider_name||'';
        var m=entry.raw;var title=m.title||m.name||'';
        var item={id:'search-'+entry.type.charAt(0)+'-'+m.id,title:title,img:m.poster_path?TMDB_IMG+m.poster_path:null,_type:entry.type,_date:(entry.type==='movie'?m.release_date:m.first_air_date)||'',_src:{name:streamer||'Niet beschikbaar',logo_100px:nlFlat.length>0&&nlFlat[0].logo_path?'https://image.tmdb.org/t/p/original'+nlFlat[0].logo_path:null},_style:{color:sColor,text:'#fff'},_key:streamer?providerKey(streamer):'search',_originType:streamer?detectOrigin(streamer):'licensed',_source:'tmdb',tmdb_id:m.id,overview:m.overview||'',user_rating:m.vote_average||0,_nlWatchLink:nlLink};
        entry.item=item;
      }).catch(function(){
        var m=entry.raw;
        entry.item={id:'search-'+entry.type.charAt(0)+'-'+m.id,title:m.title||m.name||'',img:m.poster_path?TMDB_IMG+m.poster_path:null,_type:entry.type,_date:(entry.type==='movie'?m.release_date:m.first_air_date)||'',_src:{name:'Onbekend'},_style:{color:'#666',text:'#fff'},_key:'search',_originType:'licensed',_source:'tmdb',tmdb_id:m.id,overview:m.overview||'',user_rating:m.vote_average||0};
      });
    })).then(function(){return tmdbRaw;});
  }).then(function(tmdbRaw){
    var tmdbHits=tmdbRaw.map(function(e){return e.item;}).filter(Boolean);
    tmdbHits.forEach(function(h){if(!allItems.find(function(i){return i.id===h.id;}))allItems.push(h);});
    var combined=deduped.concat(tmdbHits);
    /* Filter out items without poster image */
    combined=combined.filter(function(item){return imgCache[item.id]||item.img;});
    /* Sort by popularity: items with higher user_rating first, local items first */
    combined.sort(function(a,b){
      /* Local (already in releases) first */
      var aLocal=a._source!=='tmdb'||a._key!=='search'?1:0;
      var bLocal=b._source!=='tmdb'||b._key!=='search'?1:0;
      if(aLocal!==bLocal)return bLocal-aLocal;
      /* Then by rating/popularity */
      var aScore=a.user_rating||0;var bScore=b.user_rating||0;
      return bScore-aScore;
    });
    combined=combined.slice(0,15);
    if(!combined.length){el.innerHTML='<div class="search-empty">Geen resultaten voor "'+q+'".</div>';return;}
    el.innerHTML=combined.map(function(item){
      var title=(item.title||'').replace(/'/g,"&#39;").replace(/"/g,'&quot;');
      var sid=String(item.id).replace(/['"\\]/g,'');
      var poster=imgCache[item.id]||item.img||'';
      var tl=item._type==='movie'?'Film':'Serie';
      var cls=item._type==='movie'?'film':'serie';
      var year=(item._date||'').slice(0,4);
      var sn=(item._src&&item._src.name||'').replace(/Netherlands/gi,'').trim();
      var isAvailable=sn&&sn!=='Zoekresultaat'&&sn!=='Niet beschikbaar'&&sn!=='Onbekend';
      var streamerBadge=isAvailable?'<span class="t10-streamer" style="font-size:10px">'+sn+'</span>':'<span class="t10-badge" style="font-size:10px;background:var(--brd2);color:var(--t3)">Niet op streaming</span>';
      var metaParts=[tl];if(year)metaParts.push(year);
      return '<div class="crow" data-id="'+sid+'"><div class="crow-poster">'+(poster?'<img src="'+poster+'" alt="'+title+'" loading="lazy">':'<div class="crow-fb">'+title+'</div>')+'</div><div class="crow-info"><div class="crow-title">'+title+'</div><div class="crow-meta">'+metaParts.join(' - ')+' '+streamerBadge+'</div></div><div class="crow-badge '+cls+'">'+tl+'</div></div>';
    }).join('');
  });
}

/* ── CONTENT FILTERS ── */
var activeFilter=null;
var activeGenre=null;
var GENRE_LIST=[
  {id:28,name:'Actie'},{id:12,name:'Avontuur'},{id:16,name:'Animatie'},
  {id:35,name:'Komedie'},{id:80,name:'Misdaad'},{id:99,name:'Documentaire'},
  {id:18,name:'Drama'},{id:10751,name:'Familie'},{id:14,name:'Fantasie'},
  {id:36,name:'Historisch'},{id:27,name:'Horror'},{id:10402,name:'Muziek'},
  {id:9648,name:'Mysterie'},{id:10749,name:'Romantiek'},{id:878,name:'Sci-Fi'},
  {id:53,name:'Thriller'},{id:10752,name:'Oorlog'},{id:37,name:'Western'}
];
function applyContentFilter(items){
  if(!activeFilter)return items;
  if(activeFilter==='episodes')return items.filter(function(i){return i._type==='tv'&&(i._epInfo&&i._epInfo.s||i._source==='googlesheet');});
  if(activeFilter==='seasons')return items.filter(function(i){return i._type==='tv'&&i._season;});
  if(activeFilter==='genre'&&activeGenre)return items.filter(function(i){return i._genres&&i._genres.indexOf(activeGenre)!==-1;});
  return items;
}
function buildGenreDropdown(){
  var dd=document.getElementById('genreDropdown');if(!dd)return;
  dd.innerHTML=GENRE_LIST.map(function(g){
    return '<button class="genre-opt'+(activeGenre===g.id?' active':'')+'" data-gid="'+g.id+'">'+g.name+'</button>';
  }).join('');
}
function toggleFilter(f){
  if(activeFilter===f){activeFilter=null;activeGenre=null;}
  else{activeFilter=f;}
  document.querySelectorAll('.filter-chip').forEach(function(c){c.classList.toggle('active',c.getAttribute('data-filter')===activeFilter);});
  var dd=document.getElementById('genreDropdown');
  if(dd){
    if(activeFilter==='genre'){
      /* Position dropdown under the genre button */
      var gb=document.getElementById('genreBtn');
      if(gb){var r=gb.getBoundingClientRect();dd.style.top=(r.bottom+4)+'px';dd.style.left=Math.max(8,r.left)+'px';}
      dd.classList.add('open');
    }else{dd.classList.remove('open');}
  }
  var gl=document.querySelector('.genre-label');
  if(gl&&!activeGenre)gl.textContent='Genre';
  renderMain();
}
/* Show/hide filter chips based on bottom-nav tab: Films -> only genre, Series/Alles -> all */
function updateFilterChips(f){
  var epChip=document.querySelector('[data-filter="episodes"]');
  var seaChip=document.querySelector('[data-filter="seasons"]');
  if(f==='movie'){
    if(epChip)epChip.style.display='none';
    if(seaChip)seaChip.style.display='none';
    /* If active filter is episodes/seasons, clear it */
    if(activeFilter==='episodes'||activeFilter==='seasons'){activeFilter=null;document.querySelectorAll('.filter-chip').forEach(function(c){c.classList.remove('active');});}
  }else{
    if(epChip)epChip.style.display='';
    if(seaChip)seaChip.style.display='';
  }
}

/* ── EVENT LISTENERS ── */
document.addEventListener('DOMContentLoaded',function(){
  console.log('[StreamGids] Init');
  document.getElementById('themeBtn').addEventListener('click',toggleTheme);
  document.querySelectorAll('.bnav').forEach(function(btn){btn.addEventListener('click',function(){setType(btn.getAttribute('data-f'));});});
  var shareBtn=document.getElementById('shareBtn');if(shareBtn)shareBtn.addEventListener('click',shareItem);
  var overlay=document.getElementById('overlay');overlay.addEventListener('click',function(e){if(e.target===overlay)closeModal();});
  var sheetClose=document.getElementById('sheetClose');if(sheetClose)sheetClose.addEventListener('click',closeModal);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal();});
  document.getElementById('dateTabs').addEventListener('click',function(e){var tab=e.target.closest('.dtab');if(tab)selectDate(tab.getAttribute('data-date'));});
  document.getElementById('svcBar').addEventListener('click',function(e){var chip=e.target.closest('.sc');if(!chip)return;svcFilter=chip.getAttribute('data-k');document.querySelectorAll('.sc').forEach(function(c){c.classList.toggle('active',c.getAttribute('data-k')===svcFilter);});renderMain();});
  /* Filter bar */
  var filterBar=document.getElementById('filterBar');
  if(filterBar){
    filterBar.addEventListener('click',function(e){
      var gopt=e.target.closest('.genre-opt');
      if(gopt){
        var gid=Number(gopt.getAttribute('data-gid'));
        if(activeGenre===gid){activeGenre=null;activeFilter=null;}
        else{activeGenre=gid;activeFilter='genre';}
        buildGenreDropdown();
        document.querySelectorAll('.filter-chip').forEach(function(c){c.classList.toggle('active',c.getAttribute('data-filter')===activeFilter);});
        var gl=document.querySelector('.genre-label');
        if(gl){var gName=GENRE_LIST.find(function(g){return g.id===activeGenre;});gl.textContent=gName?gName.name:'Genre';}
        var dd=document.getElementById('genreDropdown');if(dd)dd.classList.remove('open');
        renderMain();
        e.stopPropagation();
        return;
      }
      var chip=e.target.closest('.filter-chip');
      if(chip)toggleFilter(chip.getAttribute('data-filter'));
    });
    buildGenreDropdown();
  }
  /* Close genre dropdown when clicking outside */
  document.addEventListener('click',function(e){
    var dd=document.getElementById('genreDropdown');
    if(dd&&dd.classList.contains('open')&&!e.target.closest('#genreBtn'))dd.classList.remove('open');
  });
  document.getElementById('main').addEventListener('click',function(e){
    var hdr=e.target.closest('.svc-hdr');if(hdr){toggleSection(hdr.getAttribute('data-key'));return;}
    var row=e.target.closest('.crow');if(row){openModal(row.getAttribute('data-id'));return;}
    var t10=e.target.closest('.t10-item');if(t10){openTop10Modal(t10.getAttribute('data-tmdb'),t10.getAttribute('data-mt'),t10.getAttribute('data-title'));return;}
    var t10tab=e.target.closest('.t10-tab');if(t10tab){if(t10tab.getAttribute('data-p'))top10Period=t10tab.getAttribute('data-p');if(t10tab.getAttribute('data-c'))top10Category=t10tab.getAttribute('data-c');renderTop10();return;}
    var sptab=e.target.closest('.sp-tab');if(sptab){sportFilter=sptab.getAttribute('data-sf');renderSpTabs();if(sportCache)renderSportList(sportCache);}
  });
  /* Listen for system theme changes */
  if(window.matchMedia){window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(e){try{var saved=localStorage.getItem('streamgids_theme');if(!saved){document.documentElement.setAttribute('data-theme',e.matches?'dark':'light');}}catch(err){}});}
  init();
});

function init(){
  var lt=document.getElementById('loadText'),ls=document.getElementById('loadSub');
  if(lt)lt.textContent='Streamingdiensten ophalen...';if(ls)ls.textContent='Watchmode + TMDB Nederland';
  Promise.all([fetchWMSources(),fetchTMDBProviders().catch(function(){}),fetchGoogleSheet()]).then(function(setup){
    var gsItems=setup[2]||[];
    var tc=Object.keys(TMDB_NL_PROVIDERS).length;
    if(lt)lt.textContent='Releases laden...';
    if(ls)ls.textContent=wmSources.length+' WM + '+tc+' TMDB'+(gsItems.length?' + '+gsItems.length+' handmatig':'');
    return Promise.all([
      fetchWMReleases().catch(function(){return[];}),
      fetchTMDBReleases().catch(function(){return[];}),
      enrichSheetItems(gsItems)
    ]);
  }).then(function(res){
    if(ls)ls.textContent='';
    allItems=mergeItems(res[0],res[1],res[2]);
    console.log('[StreamGids] '+allItems.length+' items (incl. '+((res[2]||[]).length)+' handmatig)');
    if(!allItems.length)throw new Error('Geen releases gevonden.');
    buildSvcBar();buildDateTabs();renderMain();enrichMissingPosters();
  }).catch(function(e){
    console.error(e);
    document.getElementById('main').innerHTML='<div class="error-screen"><div class="error-title">Kon niet laden</div><div class="error-msg">'+(e.message||'Controleer je verbinding.')+'</div><button class="retry-btn" onclick="location.reload()">Opnieuw</button></div>';
  });
}
