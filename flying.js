/* Flying — the commissioner's private logbook section.
   Loaded on demand from index.html; the logbook itself comes from /api/admin (commissioner code required).
   Deliberately not Survivor-themed: a clean, minimal flight-planning look. */
(function(){
"use strict";

/* ---------------- styles ---------------- */
const CSS = `
body.flying{--fp-bg:#f4f5f7;--fp-surface:#ffffff;--fp-ink:#0f1318;--fp-ink2:#3d4552;--fp-muted:#6b7380;--fp-line:#e2e5ea;--fp-line2:#eef0f3;
  --fp-accent:#2a78d6;--fp-accent-soft:#e6f0fb;--fp-s1:#2a78d6;--fp-s2:#1baf7a;--fp-s3:#eb6834;--fp-route:#2a78d6;
  --fp-sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;--fp-mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  background:var(--fp-bg)!important;color:var(--fp-ink)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) body.flying{--fp-bg:#0f1113;--fp-surface:#1a1a19;--fp-ink:#f0efec;--fp-ink2:#d4d3cd;--fp-muted:#9c9b94;--fp-line:#2c2c2a;--fp-line2:#232322;
  --fp-accent:#3987e5;--fp-accent-soft:#16263a;--fp-s1:#3987e5;--fp-s2:#199e70;--fp-s3:#d95926;--fp-route:#5598e7}}
:root[data-theme="dark"] body.flying{--fp-bg:#0f1113;--fp-surface:#1a1a19;--fp-ink:#f0efec;--fp-ink2:#d4d3cd;--fp-muted:#9c9b94;--fp-line:#2c2c2a;--fp-line2:#232322;
  --fp-accent:#3987e5;--fp-accent-soft:#16263a;--fp-s1:#3987e5;--fp-s2:#199e70;--fp-s3:#d95926;--fp-route:#5598e7}
body.flying .hero, body.flying #sampleNote, body.flying #viewNote{display:none!important}
body.flying .wrap{max-width:1180px;padding-block:20px 56px}
body.flying nav.tabs{background:var(--fp-surface)!important;border-bottom:1px solid var(--fp-line)!important;box-shadow:none!important}
body.flying nav.tabs::before, body.flying nav.tabs::after{display:none!important}
body.flying nav.tabs a{color:var(--fp-muted)!important;font:500 13px/1 var(--fp-sans)!important;letter-spacing:.02em!important;text-transform:none!important;text-shadow:none!important}
body.flying nav.tabs a[aria-current="page"]{color:var(--fp-ink)!important}
body.flying nav.tabs a[aria-current="page"]{border-bottom-color:var(--fp-ink)!important}
body.flying nav.tabs a:hover{color:var(--fp-ink)!important}

.fly{font:400 14px/1.5 var(--fp-sans);color:var(--fp-ink);-webkit-font-smoothing:antialiased}
.fly *{box-sizing:border-box}
.fly .mono{font-family:var(--fp-mono);font-variant-numeric:tabular-nums}
.fly-top{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:18px}
.fly-brand{display:flex;align-items:center;gap:10px;font:600 18px/1 var(--fp-sans);letter-spacing:-.01em;margin-right:auto}
.fly-brand svg{width:22px;height:22px;color:var(--fp-accent)}
.fly-back{font:500 13px/1 var(--fp-sans);color:var(--fp-muted);text-decoration:none;padding:8px 0}
.fly-back:hover{color:var(--fp-ink)}
.fly-tabs{display:flex;gap:2px;background:var(--fp-line2);border:1px solid var(--fp-line);border-radius:8px;padding:3px}
.fly-tabs a{font:500 13px/1 var(--fp-sans);color:var(--fp-muted);text-decoration:none;padding:8px 14px;border-radius:6px}
.fly-tabs a:hover{color:var(--fp-ink)}
.fly-tabs a[aria-current="page"]{background:var(--fp-surface);color:var(--fp-ink);box-shadow:0 1px 2px rgba(0,0,0,.08)}
.fly-bar{display:flex;flex-wrap:wrap;align-items:flex-end;gap:10px 12px;padding:12px 14px;background:var(--fp-surface);border:1px solid var(--fp-line);border-radius:10px;margin-bottom:16px}
.fly-field{display:grid;gap:4px}
.fly-field label{font:500 11px/1 var(--fp-sans);letter-spacing:.06em;text-transform:uppercase;color:var(--fp-muted)}
.fly-field select{font:500 14px/1.2 var(--fp-sans);color:var(--fp-ink);background:var(--fp-bg);border:1px solid var(--fp-line);border-radius:6px;padding:8px 30px 8px 10px;min-width:130px;
  appearance:none;-webkit-appearance:none;background-image:linear-gradient(45deg,transparent 50%,var(--fp-muted) 50%),linear-gradient(135deg,var(--fp-muted) 50%,transparent 50%);
  background-position:calc(100% - 15px) 52%,calc(100% - 10px) 52%;background-size:5px 5px;background-repeat:no-repeat}
.fly-field select:focus-visible,.fly-btn:focus-visible,.fly-tabs a:focus-visible{outline:2px solid var(--fp-accent);outline-offset:2px}
.fly-bar .fly-meta{margin-left:auto;font:400 12px/1.4 var(--fp-sans);color:var(--fp-muted);text-align:right}
.fly-btn{font:500 13px/1 var(--fp-sans);color:var(--fp-ink);background:var(--fp-surface);border:1px solid var(--fp-line);border-radius:6px;padding:9px 12px;cursor:pointer}
.fly-btn:hover{border-color:var(--fp-muted)}
.fly-btn.primary{background:var(--fp-ink);color:var(--fp-surface);border-color:var(--fp-ink)}
.fly-linkbtn{background:none;border:0;padding:0;font:inherit;color:var(--fp-accent);cursor:pointer;text-decoration:underline;text-underline-offset:2px}
.fly-card{background:var(--fp-surface);border:1px solid var(--fp-line);border-radius:10px;padding:18px 18px 16px;margin-bottom:16px}
.fly-card h3{font:600 15px/1.2 var(--fp-sans);margin:0 0 2px;letter-spacing:0;text-transform:none;color:var(--fp-ink)}
.fly-card .sub{font-size:12.5px;color:var(--fp-muted);margin:0 0 14px}
.fly-hero{display:grid;grid-template-columns:minmax(200px,1fr) 3fr;gap:16px;margin-bottom:16px}
.fly-total{background:var(--fp-surface);border:1px solid var(--fp-line);border-radius:10px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:10px}
.fly-k{font:500 11px/1.2 var(--fp-sans);letter-spacing:.06em;text-transform:uppercase;color:var(--fp-muted)}
.fly-total .v{font:500 44px/1 var(--fp-mono);letter-spacing:-.02em}
.fly-total .u{font-size:13px;color:var(--fp-muted)}
.fly-tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--fp-line);border:1px solid var(--fp-line);border-radius:10px;overflow:hidden}
.fly-tile{background:var(--fp-surface);padding:12px 14px;display:grid;gap:6px;align-content:start}
.fly-tile .v{font:500 20px/1.1 var(--fp-mono)}
.fly-tile .n{font-size:12px;color:var(--fp-muted)}
.fly-legend{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:12.5px;color:var(--fp-ink2);margin:0 0 12px}
.fly-legend i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px;vertical-align:-1px}
.fly-hbars{display:grid;gap:10px}
.fly-hrow{display:grid;grid-template-columns:150px 1fr 76px;align-items:center;gap:12px}
.fly-hrow .lab{font-size:13px;line-height:1.2}
.fly-hrow .lab small{display:block;color:var(--fp-muted);font:400 11.5px/1.3 var(--fp-mono)}
.fly-track{display:flex;gap:2px;height:16px;min-width:0}
.fly-seg{height:100%;min-width:2px;cursor:default}
.fly-seg:first-child{border-radius:4px 0 0 4px}
.fly-seg:last-child{border-radius:0 4px 4px 0}
.fly-seg:only-child{border-radius:4px}
.fly-hrow .val{font:500 13px/1 var(--fp-mono);text-align:right}
.fly-cols{position:relative;height:220px;display:flex;align-items:flex-end;gap:6px;padding:0 0 0 36px;border-bottom:1px solid var(--fp-line)}
.fly-grid{position:absolute;inset:0 0 0 36px;pointer-events:none}
.fly-grid div{position:absolute;left:0;right:0;border-top:1px dashed var(--fp-line2)}
.fly-grid span{position:absolute;left:-36px;width:30px;text-align:right;transform:translateY(-50%);font:400 11px/1 var(--fp-mono);color:var(--fp-muted)}
.fly-col{flex:1;display:flex;flex-direction:column-reverse;gap:2px;height:100%;justify-content:flex-start;position:relative;z-index:1;cursor:default}
.fly-col .fly-seg{width:100%;border-radius:0;min-height:0}
.fly-col .fly-seg:last-child{border-radius:4px 4px 0 0}
.fly-col:hover .fly-seg{filter:brightness(1.08)}
.fly-xl{display:flex;gap:6px;padding-left:36px;margin-top:6px}
.fly-xl span{flex:1;text-align:center;font:400 11px/1 var(--fp-mono);color:var(--fp-muted);white-space:nowrap;overflow:hidden}
.fly-table-wrap{overflow-x:auto;margin:0 -18px;padding:0 18px}
.fly-table{width:100%;border-collapse:collapse;font-size:13px;min-width:720px}
.fly-table th{font:500 11px/1.2 var(--fp-sans);letter-spacing:.05em;text-transform:uppercase;color:var(--fp-muted);text-align:right;padding:8px 10px;border-bottom:1px solid var(--fp-line)}
.fly-table th:first-child,.fly-table td:first-child{text-align:left;padding-left:0}
.fly-table td{padding:9px 10px;border-bottom:1px solid var(--fp-line2);text-align:right;font-family:var(--fp-mono);font-variant-numeric:tabular-nums}
.fly-table td:first-child{font-family:var(--fp-sans)}
.fly-table tfoot td{font-weight:600;border-bottom:0;border-top:1px solid var(--fp-line)}
.fly-two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.fly-tip{position:fixed;z-index:9999;pointer-events:none;background:var(--fp-ink);color:var(--fp-surface);font:400 12.5px/1.45 var(--fp-sans);padding:8px 10px;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.18);max-width:240px;opacity:0;transition:opacity .08s}
.fly-tip b{font-weight:600}
.fly-tip .mono{font-family:var(--fp-mono)}
.fly-empty{padding:40px 18px;text-align:center;color:var(--fp-muted)}
.fly-note{font-size:12.5px;color:var(--fp-muted);margin:10px 2px 0}
.fly-err{border-color:#e3494833;background:var(--fp-surface)}
.fly-map-wrap{position:relative;background:var(--fp-surface);border:1px solid var(--fp-line);border-radius:10px;overflow:hidden;margin-bottom:12px}
#flyMap{height:clamp(420px,68vh,760px);background:var(--fp-bg)}
.fly-mapstats{display:flex;flex-wrap:wrap;gap:1px;background:var(--fp-line);border:1px solid var(--fp-line);border-radius:10px;overflow:hidden}
.fly-mapstats div{flex:1 1 140px;background:var(--fp-surface);padding:10px 14px;display:grid;gap:4px}
.fly-mapstats .v{font:500 17px/1.1 var(--fp-mono)}
.fly .leaflet-container{font:400 13px/1.4 var(--fp-sans)}
.fly .leaflet-popup-content-wrapper{border-radius:8px;box-shadow:0 6px 24px rgba(0,0,0,.16);background:var(--fp-surface);color:var(--fp-ink)}
.fly .leaflet-popup-tip{background:var(--fp-surface)}
.fly .leaflet-popup-content{margin:12px 14px;min-width:200px}
.fly .leaflet-container a.leaflet-popup-close-button{color:var(--fp-muted)}
.fly-pop .rt{font:600 16px/1.2 var(--fp-mono);letter-spacing:.01em;margin-bottom:2px}
.fly-pop .nm{font-size:12px;color:var(--fp-muted);margin-bottom:10px}
.fly-pop dl{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;margin:0}
.fly-pop dt{color:var(--fp-muted);font-size:12px}
.fly-pop dd{margin:0;font:500 13px/1.35 var(--fp-mono);text-align:right}
.fly .leaflet-control-zoom a{background:var(--fp-surface);color:var(--fp-ink);border-color:var(--fp-line)}
.fly .leaflet-control-attribution{background:color-mix(in srgb,var(--fp-surface) 80%,transparent);color:var(--fp-muted);font-size:10.5px}
.fly .leaflet-control-attribution a{color:var(--fp-muted)}
.fly-career{display:grid;grid-template-columns:minmax(0,560px) 1fr;gap:20px;align-items:start}
.fly-career img{width:100%;height:auto;border-radius:10px;border:1px solid var(--fp-line);display:block;background:#fff}
.fly-career .acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.fly-facts{display:grid;gap:0;background:var(--fp-surface);border:1px solid var(--fp-line);border-radius:10px;padding:4px 18px}
.fly-facts div{display:flex;justify-content:space-between;gap:14px;padding:11px 0;border-bottom:1px solid var(--fp-line2);font-size:13.5px}
.fly-facts div:last-child{border-bottom:0}
.fly-facts span{color:var(--fp-muted)}
.fly-facts b{font:500 13.5px/1.35 var(--fp-mono);text-align:right}
@media (max-width:860px){
  .fly-hero{grid-template-columns:1fr}
  .fly-tiles{grid-template-columns:repeat(2,1fr)}
  .fly-two{grid-template-columns:1fr}
  .fly-career{grid-template-columns:1fr}
}
@media (max-width:560px){
  .fly-top{gap:10px}
  .fly-tabs{order:3;width:100%}
  .fly-tabs a{flex:1;text-align:center;padding:9px 6px}
  .fly-bar{padding:12px}
  .fly-field{flex:1 1 calc(33% - 10px);min-width:0}
  .fly-field select{min-width:0;width:100%;padding-right:24px;font-size:14px}
  .fly-bar .fly-meta{margin-left:0;text-align:left;flex-basis:100%}
  .fly-hrow{grid-template-columns:92px 1fr 58px;gap:8px}
  .fly-total .v{font-size:38px}
  .fly-tile .v{font-size:18px}
  .fly-cols{gap:3px;padding-left:30px;height:190px}
  .fly-grid{left:30px}.fly-grid span{left:-30px;width:26px}
  .fly-xl{gap:3px;padding-left:30px}
  .fly-xl span{font-size:9.5px}
  .fly-card{padding:16px 14px 14px}
  .fly-table-wrap{margin:0 -14px;padding:0 14px}
}
@media (prefers-reduced-motion:reduce){.fly-tip{transition:none}}
`;

/* ---------------- constants ---------------- */
const TORONTO = new Set(["CYYZ","CYTZ"]);           // home base: never a "destination"
const CALGARY_UNTIL = "2020-01-01";                  // also based in Calgary before 2020
const isHome = (code, d) => TORONTO.has(code) || (code === "CYYC" && d < CALGARY_UNTIL);
const homeNote = code => TORONTO.has(code) ? "Home base" : code === "CYYC" ? "Home base before 2020" : "";
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const TYPES = {
  CL65:{name:"CRJ900", sub:"CL65"}, BE02:{name:"BE02", sub:""}, C172:{name:"Cessna 172", sub:"C172"},
  C152:{name:"Cessna 152", sub:"C152"}, "PA-34":{name:"Piper Seneca", sub:"PA-34"}, "7GCBC":{name:"Citabria Explorer", sub:"7GCBC"},
  "7ECA":{name:"Citabria", sub:"7ECA"}, C180:{name:"Cessna 180", sub:"C180"}, FMX:{name:"Simulator", sub:"FMX"}
};
const ROLES = [["pic","PIC","--fp-s1"],["sic","SIC (co-pilot)","--fp-s2"],["dual","Dual received","--fp-s3"]];
const EARTH_NM = 21600;          // once around the equator
const MOON_NM = 207559;          // average Earth–Moon distance

const groupOf = t => /^C172/.test(t) ? "C172" : /^C180/.test(t) ? "C180" : t;
const typeName = g => (TYPES[g]?.name) || g;
const typeSub = g => TYPES[g] ? TYPES[g].sub : "";
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmtH = n => (Math.round(n*10)/10).toLocaleString("en-CA",{minimumFractionDigits:1,maximumFractionDigits:1});
const fmtN = n => Math.round(n).toLocaleString("en-CA");
const fmtMonth = d => { const [y,m] = d.split("-"); return `${MONTHS[+m-1]} ${y}`; };
const fmtDay = d => { const [y,m,dd] = d.split("-"); return `${+dd} ${MONTHS[+m-1]} ${y}`; };
const plural = (n, w, p) => `${fmtN(n)} ${n===1 ? w : (p || w+"s")}`;

/* ---------------- state ---------------- */
const S = { data:null, loading:false, err:null, filt:{type:"all", year:"all", month:"all"}, tab:"logbook", code:null, api:null, map:null, careerImg:null };

function airport(code){ const a = S.data.airports[code]; return a ? {code, lat:a[0], lon:a[1], name:a[2], city:a[3], country:a[4], region:a[5]} : null; }
function nm(a, b){
  const A = airport(a), B = airport(b); if(!A || !B) return 0;
  const R = 3440.065, toR = Math.PI/180;
  const dLat = (B.lat-A.lat)*toR, dLon = (B.lon-A.lon)*toR;
  const h = Math.sin(dLat/2)**2 + Math.cos(A.lat*toR)*Math.cos(B.lat*toR)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.min(1, Math.sqrt(h)));
}
const NM_CACHE = new Map();
function legNm(a, b){ const k = a < b ? a+"|"+b : b+"|"+a; if(!NM_CACHE.has(k)) NM_CACHE.set(k, nm(a, b)); return NM_CACHE.get(k); }
const shortName = a => a ? (a.city || a.name).replace(/\s*\(.*\)$/, "") : "";

function prep(data){
  const H = ["tot","pic","sic","dual","night","xc","act","hood","simT","ldD","ldN","app"];
  data.flights.forEach(f => { f.g = groupOf(f.t); f.y = +f.d.slice(0,4); f.m = +f.d.slice(5,7);
    f.h = f.h || {}; H.forEach(k => { f.h[k] = +f.h[k] || 0; }); f.legs = f.legs || []; f.reg = f.reg || ""; f.local = !f.legs.length; });
  return data;
}
function filtered(){
  const {type, year, month} = S.filt;
  return S.data.flights.filter(f => (type==="all" || f.g===type) && (year==="all" || f.y===+year) && (month==="all" || f.m===+month));
}
function sums(list){
  const t = {tot:0,pic:0,sic:0,dual:0,night:0,xc:0,act:0,hood:0,simT:0,ldD:0,ldN:0,app:0,flights:0,legs:0,nm:0};
  list.forEach(f => { for(const k in f.h) t[k] += f.h[k]; if(f.h.tot>0) t.flights++; t.legs += f.legs.length; f.legs.forEach(([a,b]) => t.nm += legNm(a,b)); });
  return t;
}
function byGroup(list){
  const m = new Map();
  list.forEach(f => { if(!m.has(f.g)) m.set(f.g, []); m.get(f.g).push(f); });
  return [...m.entries()].map(([g, fl]) => ({g, t:sums(fl)}));
}

/* ---------------- tooltip ---------------- */
let tipEl = null;
function tip(){ if(!tipEl){ tipEl = document.createElement("div"); tipEl.className = "fly-tip"; tipEl.setAttribute("role","tooltip"); document.body.appendChild(tipEl); } return tipEl; }
function showTip(html, x, y){
  const t = tip(); t.innerHTML = html; t.style.opacity = "1";
  const w = t.offsetWidth, h = t.offsetHeight, vw = document.documentElement.clientWidth;
  let left = x + 14, top = y - h - 12;
  if(left + w > vw - 8) left = x - w - 14;
  if(left < 8) left = 8;
  if(top < 8) top = y + 16;
  t.style.left = left + "px"; t.style.top = top + "px";
}
function hideTip(){ if(tipEl) tipEl.style.opacity = "0"; }
function wireTips(root){
  root.querySelectorAll("[data-tip]").forEach(el => {
    const show = ev => { const p = ev.touches ? ev.touches[0] : ev; showTip(el.dataset.tip, p.clientX, p.clientY); };
    el.addEventListener("pointermove", show);
    el.addEventListener("pointerdown", show);
    el.addEventListener("pointerleave", hideTip);
    el.addEventListener("focus", () => { const r = el.getBoundingClientRect(); showTip(el.dataset.tip, r.left + r.width/2, r.top); });
    el.addEventListener("blur", hideTip);
  });
}
addEventListener("scroll", hideTip, {passive:true});

/* ---------------- shell ---------------- */
const PLANE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.5 3.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V9l7.5 4.5V16l-7.5-2.3V19l2.2 1.6V22L12 21l-3.7 1v-1.4l2.2-1.6v-5.3L3 16v-2.5L10.5 9z"/></svg>`;
function shell(body){
  const tab = (id, label) => `<a href="#${id==="logbook"?"flying":"flying-"+id}" ${S.tab===id?'aria-current="page"':""}>${label}</a>`;
  return `<div class="fly">
    <div class="fly-top">
      <div class="fly-brand">${PLANE}<span>Flying</span></div>
      <nav class="fly-tabs" aria-label="Flying sections">${tab("logbook","Logbook")}${tab("map","Map")}${tab("career","Career")}</nav>
      <a class="fly-back" href="#commissioner">← Commissioner</a>
    </div>${body}</div>`;
}
function filterBar(showMeta){
  const fl = S.data.flights;
  const groups = byGroup(fl).sort((a,b) => b.t.tot - a.t.tot || b.t.simT - a.t.simT);
  const years = [...new Set(fl.map(f => f.y))].sort((a,b) => b - a);
  const opt = (v, label, cur) => `<option value="${esc(v)}" ${String(cur)===String(v)?"selected":""}>${esc(label)}</option>`;
  const ago = S.data.fetchedAt ? Math.max(0, Math.round((Date.now() - S.data.fetchedAt)/60000)) : null;
  const when = ago==null ? "" : ago < 1 ? "just now" : ago < 60 ? `${ago} min ago` : `${Math.round(ago/60)} h ago`;
  return `<div class="fly-bar" role="group" aria-label="Filter flights">
    <div class="fly-field"><label for="fType">Aircraft</label><select id="fType">${opt("all","All aircraft",S.filt.type)}${groups.map(g => opt(g.g, typeName(g.g), S.filt.type)).join("")}</select></div>
    <div class="fly-field"><label for="fYear">Year</label><select id="fYear">${opt("all","All years",S.filt.year)}${years.map(y => opt(y, y, S.filt.year)).join("")}</select></div>
    <div class="fly-field"><label for="fMonth">Month</label><select id="fMonth">${opt("all","All months",S.filt.month)}${MONTHS_LONG.map((m,i) => opt(i+1, m, S.filt.month)).join("")}</select></div>
    ${showMeta ? `<div class="fly-meta">${S.data.stale ? "Showing the last saved copy. Google Sheets didn't respond." : `From your Google Sheet · updated ${when}`}<br><button type="button" class="fly-linkbtn" id="fRefresh">Refresh now</button>${(S.filt.type!=="all"||S.filt.year!=="all"||S.filt.month!=="all")?` · <button type="button" class="fly-linkbtn" id="fClear">Clear filters</button>`:""}</div>` : ""}
  </div>`;
}
function filterLabel(){
  const p = [];
  if(S.filt.type!=="all") p.push(typeName(S.filt.type));
  if(S.filt.month!=="all") p.push(MONTHS_LONG[S.filt.month-1] + (S.filt.year!=="all" ? " " + S.filt.year : "s"));
  else if(S.filt.year!=="all") p.push(S.filt.year);
  return p.length ? p.join(" · ") : "All flying";
}

/* ---------------- Logbook tab ---------------- */
function segHTML(t, label, total){
  const parts = ROLES.filter(([k]) => t[k] > 0);
  return parts.map(([k, name, v]) => {
    const pct = total > 0 ? Math.round(t[k] / total * 100) : 0;
    return `<span class="fly-seg" style="flex:${t[k]} 1 0;background:var(${v})" tabindex="0" data-tip="<b>${esc(label)}</b><br>${esc(name)}: <span class=&quot;mono&quot;>${fmtH(t[k])} h</span> (${pct}%)"></span>`;
  }).join("");
}
function legend(){ return `<div class="fly-legend">${ROLES.map(([,n,v]) => `<span><i style="background:var(${v})"></i>${n}</span>`).join("")}</div>`; }

function logbookTab(){
  const list = filtered();
  if(!list.length) return shell(filterBar(true) + `<div class="fly-card fly-empty">No flights match ${esc(filterLabel())}.</div>`);
  const t = sums(list);
  const tile = (k, v, n) => `<div class="fly-tile"><span class="fly-k">${k}</span><span class="v">${v}</span>${n?`<span class="n">${n}</span>`:""}</div>`;
  const pct = k => t.tot > 0 ? Math.round(t[k] / t.tot * 100) + "% of total" : "";
  const hero = `<div class="fly-hero">
    <div class="fly-total"><span class="fly-k">Total flight time · ${esc(filterLabel())}</span><span class="v">${fmtH(t.tot)}</span><span class="u">hours across ${plural(t.flights,"logbook entry","logbook entries")}</span></div>
    <div class="fly-tiles">
      ${tile("Pilot in command", fmtH(t.pic), pct("pic"))}
      ${tile("Second in command", fmtH(t.sic), pct("sic"))}
      ${tile("Dual received", fmtH(t.dual), pct("dual"))}
      ${tile("Night", fmtH(t.night), pct("night"))}
      ${tile("Cross-country", fmtH(t.xc), pct("xc"))}
      ${tile("Actual instrument", fmtH(t.act), "")}
      ${tile("Simulated instrument", fmtH(t.hood), t.simT ? `+ ${fmtH(t.simT)} h in a simulator` : "")}
      ${tile("Take-offs & landings", fmtN(t.ldD + t.ldN), `${fmtN(t.ldD)} day · ${fmtN(t.ldN)} night logged`)}
    </div></div>`;

  // time by aircraft
  const groups = byGroup(list).filter(g => g.t.tot > 0).sort((a,b) => b.t.tot - a.t.tot);
  const max = Math.max(...groups.map(g => g.t.tot), 0.1);
  const hbars = `<div class="fly-card"><h3>Flight time by aircraft</h3><p class="sub">Hours in each type, split by role</p>${legend()}
    <div class="fly-hbars">${groups.map(g => `<div class="fly-hrow">
      <span class="lab">${esc(typeName(g.g))}${typeSub(g.g)&&typeSub(g.g)!==typeName(g.g)?`<small>${esc(typeSub(g.g))}</small>`:""}</span>
      <span class="fly-track"><span style="display:flex;gap:2px;width:${(g.t.tot/max*100).toFixed(2)}%;height:100%">${segHTML(g.t, typeName(g.g), g.t.tot)}</span></span>
      <span class="val">${fmtH(g.t.tot)}</span></div>`).join("")}</div></div>`;

  // hours over time: by year, or by month when one year is chosen
  let buckets, xl, title, sub;
  if(S.filt.year === "all"){
    const ys = [...new Set(S.data.flights.map(f => f.y))].sort((a,b) => a - b);
    const all = []; for(let y = ys[0]; y <= ys[ys.length-1]; y++) all.push(y);
    buckets = all.map(y => ({key:y, label:String(y), short:"'"+String(y).slice(2), t:sums(list.filter(f => f.y===y))}));
    title = "Flight time by year"; sub = S.filt.month==="all" ? "Hours flown each calendar year" : `Hours flown in ${MONTHS_LONG[S.filt.month-1]} of each year`;
  } else {
    buckets = MONTHS.map((m,i) => ({key:i+1, label:`${MONTHS_LONG[i]} ${S.filt.year}`, short:m.slice(0,1)+m.slice(1,3), t:sums(list.filter(f => f.m===i+1))}));
    title = `Flight time by month · ${S.filt.year}`; sub = "Hours flown each month";
  }
  const cmax = Math.max(...buckets.map(b => b.t.tot), 1);
  const step = niceStep(cmax / 3), top = Math.ceil(cmax / step) * step;
  const gl = []; for(let v = 0; v <= top + 1e-9; v += step) gl.push(v);
  const narrow = buckets.length > 10;
  const cols = `<div class="fly-card"><h3>${title}</h3><p class="sub">${sub}</p>${legend()}
    <div class="fly-cols" role="img" aria-label="${esc(title)}">
      <div class="fly-grid" aria-hidden="true">${gl.map(v => `<div style="bottom:${v/top*100}%"><span>${fmtN(v)}</span></div>`).join("")}</div>
      ${buckets.map(b => {
        const tipH = `<b>${esc(b.label)}</b> · <span class=&quot;mono&quot;>${fmtH(b.t.tot)} h</span>${ROLES.filter(([k]) => b.t[k]>0).map(([k,n]) => `<br>${esc(n)}: <span class=&quot;mono&quot;>${fmtH(b.t[k])}</span>`).join("")}`;
        return `<div class="fly-col" tabindex="0" data-tip="${tipH}">${ROLES.filter(([k]) => b.t[k]>0).map(([k,,v]) => `<span class="fly-seg" style="height:${(b.t[k]/top*100).toFixed(3)}%;background:var(${v})"></span>`).join("")}</div>`;
      }).join("")}
    </div>
    <div class="fly-xl" aria-hidden="true">${buckets.map(b => `<span>${narrow && innerWidth < 560 ? b.short : (S.filt.year==="all" ? b.label : b.short)}</span>`).join("")}</div></div>`;

  // table
  const row = (label, sub, x) => `<tr><td>${esc(label)}${sub?` <span style="color:var(--fp-muted);font:400 11.5px var(--fp-mono)">${esc(sub)}</span>`:""}</td><td>${fmtH(x.tot)}</td><td>${fmtH(x.pic)}</td><td>${fmtH(x.sic)}</td><td>${fmtH(x.dual)}</td><td>${fmtH(x.night)}</td><td>${fmtH(x.xc)}</td><td>${fmtH(x.act)}</td><td>${fmtH(x.hood)}</td><td>${fmtN(x.flights)}</td><td>${fmtN(x.nm)}</td></tr>`;
  const allG = byGroup(list).sort((a,b) => b.t.tot - a.t.tot || b.t.simT - a.t.simT);
  const table = `<div class="fly-card"><h3>Totals by aircraft</h3><p class="sub">Hours unless noted. Distance counts legs with a route in the remarks.</p>
    <div class="fly-table-wrap"><table class="fly-table"><thead><tr><th>Aircraft</th><th>Total</th><th>PIC</th><th>SIC</th><th>Dual</th><th>Night</th><th>X-C</th><th>Actual IMC</th><th>Hood</th><th>Entries</th><th>Dist (nm)</th></tr></thead>
    <tbody>${allG.filter(g => g.t.tot>0).map(g => row(typeName(g.g), typeSub(g.g)!==typeName(g.g)?typeSub(g.g):"", g.t)).join("")}</tbody>
    <tfoot>${row("Total", "", t)}</tfoot></table></div>
    ${t.simT ? `<p class="fly-note">Simulator time (${fmtH(t.simT)} h) is kept separate and isn't counted as flight time.</p>` : ""}</div>`;

  return shell(filterBar(true) + hero + `<div class="fly-two">${hbars}${cols}</div>` + table);
}
function niceStep(raw){ const p = Math.pow(10, Math.floor(Math.log10(raw || 1))), n = raw / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; }

/* ---------------- routes ---------------- */
function routePairs(list){
  const m = new Map();
  list.forEach(f => f.legs.forEach(([a,b]) => {
    const [x,y] = a < b ? [a,b] : [b,a], k = x+"|"+y;
    if(!m.has(k)) m.set(k, {a:x, b:y, n:0, ab:0, ba:0, types:new Map(), first:f.d, last:f.d, nm:legNm(x,y)});
    const p = m.get(k); p.n++; if(a===x) p.ab++; else p.ba++;
    p.types.set(f.g, (p.types.get(f.g)||0) + 1);
    if(f.d < p.first) p.first = f.d; if(f.d > p.last) p.last = f.d;
  }));
  return [...m.values()];
}
function airportVisits(list){
  const m = new Map();
  const get = c => { if(!m.has(c)) m.set(c, {code:c, arr:0, dep:0, dest:0}); return m.get(c); };
  list.forEach(f => f.legs.forEach(([a,b]) => { get(a).dep++; const v = get(b); v.arr++; if(!isHome(b, f.d)) v.dest++; }));
  return m;
}

/* ---------------- Map tab ---------------- */
function mapTab(){
  return shell(filterBar(true) + `<div class="fly-map-wrap"><div id="flyMap" role="application" aria-label="Map of routes flown. Select a line for its distance and how often it was flown."></div></div><div class="fly-mapstats" id="flyMapStats"></div><p class="fly-note" id="flyMapNote"></p>`);
}
function loadBase(){
  if(!loadBase.p) loadBase.p = fetch("map-base.json?v=1").then(r => r.ok ? r.json() : null).catch(() => { loadBase.p = null; return null; });
  return loadBase.p;
}
function loadLeaflet(){
  if(window.L) return Promise.resolve();
  if(loadLeaflet.p) return loadLeaflet.p;
  loadLeaflet.p = new Promise((res, rej) => {
    const css = document.createElement("link"); css.rel = "stylesheet";
    css.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"; document.head.appendChild(css);
    const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    s.onload = () => res(); s.onerror = () => { loadLeaflet.p = null; rej(new Error("Map library didn't load")); };
    document.head.appendChild(s);
  });
  return loadLeaflet.p;
}
const isDark = () => { const t = document.documentElement.dataset.theme; return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; };
function gcPoints(A, B, n){
  const toR = Math.PI/180, toD = 180/Math.PI;
  const p1 = [A.lat*toR, A.lon*toR], p2 = [B.lat*toR, B.lon*toR];
  const d = 2*Math.asin(Math.sqrt(Math.sin((p2[0]-p1[0])/2)**2 + Math.cos(p1[0])*Math.cos(p2[0])*Math.sin((p2[1]-p1[1])/2)**2));
  if(d < 1e-6) return [[A.lat,A.lon],[B.lat,B.lon]];
  const pts = [];
  for(let i = 0; i <= n; i++){
    const f = i/n, a = Math.sin((1-f)*d)/Math.sin(d), b = Math.sin(f*d)/Math.sin(d);
    const x = a*Math.cos(p1[0])*Math.cos(p1[1]) + b*Math.cos(p2[0])*Math.cos(p2[1]);
    const y = a*Math.cos(p1[0])*Math.sin(p1[1]) + b*Math.cos(p2[0])*Math.sin(p2[1]);
    const z = a*Math.sin(p1[0]) + b*Math.sin(p2[0]);
    pts.push([Math.atan2(z, Math.sqrt(x*x+y*y))*toD, Math.atan2(y, x)*toD]);
  }
  return pts;
}
function routePopup(p){
  const A = airport(p.a), B = airport(p.b);
  const types = [...p.types.entries()].sort((x,y) => y[1]-x[1]).map(([g,n]) => `${typeName(g)} ×${n}`).join(", ");
  return `<div class="fly-pop"><div class="rt">${esc(p.a)} ⇄ ${esc(p.b)}</div><div class="nm">${esc(shortName(A))} – ${esc(shortName(B))}</div>
    <dl><dt>Distance</dt><dd>${fmtN(p.nm)} nm · ${fmtN(p.nm*1.852)} km</dd>
    <dt>Times flown</dt><dd>${fmtN(p.n)}</dd>
    ${p.ab && p.ba ? `<dt>${esc(p.a)} → ${esc(p.b)}</dt><dd>${fmtN(p.ab)}</dd><dt>${esc(p.b)} → ${esc(p.a)}</dt><dd>${fmtN(p.ba)}</dd>` : `<dt>Direction</dt><dd>${p.ab ? esc(p.a)+" → "+esc(p.b) : esc(p.b)+" → "+esc(p.a)}</dd>`}
    <dt>${p.n>1?"First / last":"Date"}</dt><dd>${p.n>1 ? `${fmtMonth(p.first)} / ${fmtMonth(p.last)}` : fmtDay(p.first)}</dd>
    <dt>Aircraft</dt><dd style="font-family:var(--fp-sans);font-weight:500">${esc(types)}</dd></dl></div>`;
}
function airportPopup(v){
  const A = airport(v.code);
  return `<div class="fly-pop"><div class="rt">${esc(v.code)}</div><div class="nm">${esc(A.name)}${A.city && !A.name.includes(A.city) ? ", "+esc(A.city) : ""}${A.region ? " · "+esc(A.region) : ""}</div>
    <dl><dt>Arrivals</dt><dd>${fmtN(v.arr)}</dd><dt>Departures</dt><dd>${fmtN(v.dep)}</dd>${homeNote(v.code)?`<dt>Note</dt><dd style="font-family:var(--fp-sans)">${homeNote(v.code)}</dd>${v.dest&&v.dest!==v.arr?`<dt>As a destination</dt><dd>${fmtN(v.dest)}</dd>`:""}`:""}</dl></div>`;
}
async function mountMap(){
  const el = document.getElementById("flyMap"); if(!el) return;
  try{ await loadLeaflet(); }catch(e){ el.innerHTML = `<div class="fly-empty">The map couldn't load. Check your connection and refresh.</div>`; return; }
  if(!document.body.contains(el)) return;
  if(S.map){ try{ S.map.remove(); }catch(e){} S.map = null; }
  const L = window.L;
  const map = L.map(el, {zoomSnap:0.25, minZoom:1.5, maxZoom:9, preferCanvas:true, attributionControl:true, maxBounds:[[-85,-200],[85,200]]});
  map.attributionControl.setPrefix(false);
  S.map = map;
  const dark = isDark();
  const renderer = L.canvas({tolerance:8, padding:0.5});
  // Built-in outline map (Natural Earth, public domain): no map tiles to download.
  const base = await loadBase();
  if(!document.body.contains(el) || S.map !== map) return;
  const B = dark ? {water:"#14181d", land:"#202328", border:"#3b4048", prov:"#2c3036"} : {water:"#e8eef4", land:"#ffffff", border:"#c9d0d9", prov:"#e0e4ea"};
  el.style.background = B.water;
  if(base){
    const flip = r => r.map(([lo,la]) => [la,lo]);
    const baseR = L.canvas({padding:0.5});
    L.polygon(base.land.map(flip), {renderer:baseR, stroke:true, color:B.border, weight:0.8, fillColor:B.land, fillOpacity:1, interactive:false}).addTo(map);
    L.polygon(base.lakes.map(flip), {renderer:baseR, stroke:true, color:B.border, weight:0.6, fillColor:B.water, fillOpacity:1, interactive:false}).addTo(map);
    L.polyline(base.prov.map(flip), {renderer:baseR, color:B.prov, weight:0.8, interactive:false}).addTo(map);
    map.attributionControl.addAttribution("Map outlines: Natural Earth");
  }
  const list = filtered(), pairs = routePairs(list), visits = airportVisits(list);
  const routeColor = getComputedStyle(document.body).getPropertyValue("--fp-route").trim() || "#2a78d6";
  const maxN = Math.max(1, ...pairs.map(p => p.n));
  const pts = [];
  pairs.sort((a,b) => a.n - b.n).forEach(p => {
    const A = airport(p.a), B = airport(p.b); if(!A || !B) return;
    const w = 1.4 + 3.6*Math.sqrt(p.n/maxN);
    const line = L.polyline(gcPoints(A, B, 40), {renderer, color:routeColor, weight:w, opacity:0.55, lineCap:"round"}).addTo(map);
    line.bindPopup(() => routePopup(p), {maxWidth:280, autoPanPadding:[24,24]});
    line.on("mouseover", () => line.setStyle({opacity:1, weight:w+1.5}));
    line.on("mouseout", () => { if(!line.isPopupOpen()) line.setStyle({opacity:0.55, weight:w}); });
    line.on("popupopen", () => { line.setStyle({opacity:1, weight:w+1.5}); line.bringToFront(); });
    line.on("popupclose", () => line.setStyle({opacity:0.55, weight:w}));
  });
  const surf = getComputedStyle(document.body).getPropertyValue("--fp-surface").trim() || "#fff";
  const vmax = Math.max(1, ...[...visits.values()].map(v => v.arr + v.dep));
  [...visits.values()].sort((a,b) => (a.arr+a.dep) - (b.arr+b.dep)).forEach(v => {
    const A = airport(v.code); if(!A) return;
    pts.push([A.lat, A.lon]);
    const home = TORONTO.has(v.code);
    L.circleMarker([A.lat, A.lon], {renderer, radius: home ? 6 : 3 + 3*Math.sqrt((v.arr+v.dep)/vmax), color:routeColor, weight:home?2.5:1.5, fillColor:home?routeColor:surf, fillOpacity:1})
      .addTo(map).bindPopup(() => airportPopup(v), {maxWidth:260});
  });
  if(pts.length) map.fitBounds(L.latLngBounds(pts), {padding:[30,30], maxZoom:8});
  else map.setView([50,-95], 3);

  const t = sums(list);
  const dest = topDestinations(list)[0];
  const stats = document.getElementById("flyMapStats");
  if(stats) stats.innerHTML = [
    ["Routes", fmtN(pairs.length)], ["Legs flown", fmtN(t.legs)], ["Distance", `${fmtN(t.nm)} nm`],
    ["Airports", fmtN(visits.size)], ["Top destination", dest ? `${dest.code} ×${dest.dest}` : "–"]
  ].map(([k,v]) => `<div><span class="fly-k">${k}</span><span class="v">${v}</span></div>`).join("");
  const note = document.getElementById("flyMapNote");
  const local = list.filter(f => f.local && f.h.tot>0).length;
  if(note) note.textContent = `${filterLabel()}. Line thickness shows how often a route was flown; select a line or an airport for details.` + (local ? ` ${plural(local,"local or training flight")} with no route in the remarks ${local===1?"isn't":"aren't"} drawn.` : "");
}

/* ---------------- career ---------------- */
function topDestinations(list){
  return [...airportVisits(list).values()].filter(v => v.dest > 0).sort((a,b) => b.dest - a.dest || a.code.localeCompare(b.code));
}
function careerStats(){
  const fl = S.data.flights, flown = fl.filter(f => f.h.tot > 0);
  const t = sums(fl);
  const pairs = routePairs(fl).sort((a,b) => b.n - a.n || b.nm - a.nm);
  const longest = [...pairs].sort((a,b) => b.nm - a.nm)[0];
  const visits = airportVisits(fl);
  const dests = topDestinations(fl);
  const countries = new Set([...visits.keys()].map(c => airport(c)?.country).filter(Boolean));
  const byYear = new Map(); flown.forEach(f => byYear.set(f.y, (byYear.get(f.y)||0) + f.h.tot));
  const bestYear = [...byYear.entries()].sort((a,b) => b[1]-a[1])[0];
  const byMonth = new Map(); flown.forEach(f => { const k = f.d.slice(0,7); byMonth.set(k, (byMonth.get(k)||0) + f.h.tot); });
  const bestMonth = [...byMonth.entries()].sort((a,b) => b[1]-a[1])[0];
  const regs = new Map(); flown.forEach(f => { if(f.reg) regs.set(f.g+"|"+f.reg, (regs.get(f.g+"|"+f.reg)||0) + 1); });
  const topReg = [...regs.entries()].sort((a,b) => b[1]-a[1])[0];
  const groups = byGroup(flown).sort((a,b) => b.t.tot - a.t.tot);
  const dates = flown.map(f => f.d).sort();
  return {t, pairs, longest, visits, dests, countries, bestYear, bestMonth, topReg, groups, first:dates[0], last:dates[dates.length-1], topRoute:pairs[0], flights:flown.length};
}
function careerTab(){
  const c = careerStats();
  const fact = (k, v) => `<div><span>${esc(k)}</span><b>${v}</b></div>`;
  const d1 = c.dests[0], A1 = d1 && airport(d1.code);
  const facts = [
    fact("Total flight time", `${fmtH(c.t.tot)} h`),
    fact("Distance flown", `${fmtN(c.t.nm)} nm · ${fmtN(c.t.nm*1.852)} km`),
    fact("Around the Earth", `${(c.t.nm/EARTH_NM).toFixed(1)}×`),
    fact("Legs with a route", fmtN(c.t.legs)),
    fact("Most visited destination", d1 ? `${esc(d1.code)} · ${esc(shortName(A1))} · ${fmtN(d1.dest)}×` : "–"),
    fact("Next most visited", c.dests.slice(1,4).map(d => `${esc(d.code)} ${fmtN(d.dest)}×`).join(" · ") || "–"),
    fact("Most flown route", c.topRoute ? `${esc(c.topRoute.a)} ⇄ ${esc(c.topRoute.b)} · ${fmtN(c.topRoute.n)}×` : "–"),
    fact("Longest leg", c.longest ? `${esc(c.longest.a)} ⇄ ${esc(c.longest.b)} · ${fmtN(c.longest.nm)} nm` : "–"),
    fact("Airports visited", `${fmtN(c.visits.size)} in ${plural(c.countries.size,"country","countries")}`),
    fact("Aircraft types", fmtN(c.groups.length)),
    fact("Busiest year", c.bestYear ? `${c.bestYear[0]} · ${fmtH(c.bestYear[1])} h` : "–"),
    fact("Busiest month", c.bestMonth ? `${fmtMonth(c.bestMonth[0]+"-01")} · ${fmtH(c.bestMonth[1])} h` : "–"),
    fact("Most flown aircraft", c.topReg ? `C-${esc(c.topReg[0].split("|")[1])} · ${typeName(c.topReg[0].split("|")[0])} · ${fmtN(c.topReg[1])}×` : "–"),
    fact("First logged flight", c.first ? fmtDay(c.first) : "–"),
  ].join("");
  return shell(`<div class="fly-career">
    <div><img id="flyCareerImg" alt="Flying career infographic: ${fmtH(c.t.tot)} hours, ${fmtN(c.t.nm)} nautical miles, ${c.visits.size} airports${d1?`, most visited destination ${d1.code}`:""}." src="${S.careerImg||""}" ${S.careerImg?"":'style="aspect-ratio:4/5"'}>
      <div class="acts"><button type="button" class="fly-btn primary" id="flySave">Save image</button><button type="button" class="fly-btn" id="flyShare" hidden>Share</button></div>
      <p class="fly-note">All-time totals. Toronto (and Calgary before 2020) were home bases, so they're left out of destinations. Distance counts legs with a route in the remarks.</p></div>
    <div class="fly-facts">${facts}</div></div>`);
}
async function drawCareer(){
  const c = careerStats();
  try{ await Promise.all([document.fonts.load('500 40px "IBM Plex Mono"'), document.fonts.ready]); }catch(e){}
  const W = 1080, H = 1350, P = 72;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const x = cv.getContext("2d");
  const C = {bg:"#ffffff", ink:"#0f1318", ink2:"#3d4552", muted:"#6b7380", line:"#e2e5ea", faint:"#f1f3f6", accent:"#2a78d6", s:["#2a78d6","#1baf7a","#eb6834"]};
  const SANS = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif', MONO = '"IBM Plex Mono",ui-monospace,Menlo,monospace';
  const fit = (s, w, font) => { x.font = font; if(x.measureText(s).width <= w) return s; while(s.length > 1 && x.measureText(s+"…").width > w) s = s.slice(0,-1); return s+"…"; };
  x.fillStyle = C.bg; x.fillRect(0,0,W,H);
  // faint grid, like a chart
  x.strokeStyle = C.faint; x.lineWidth = 1;
  for(let gx = 0; gx <= W; gx += 54){ x.beginPath(); x.moveTo(gx+.5,0); x.lineTo(gx+.5,H); x.stroke(); }
  for(let gy = 0; gy <= H; gy += 54){ x.beginPath(); x.moveTo(0,gy+.5); x.lineTo(W,gy+.5); x.stroke(); }

  // header
  x.fillStyle = C.accent; x.font = `600 22px ${SANS}`; x.textBaseline = "alphabetic";
  x.fillText("PILOT LOGBOOK", P, 108);
  x.fillStyle = C.muted; x.font = `500 22px ${MONO}`; x.textAlign = "right";
  x.fillText(`${c.first?fmtMonth(c.first).toUpperCase():""} – ${c.last?fmtMonth(c.last).toUpperCase():""}`, W-P, 108);
  x.textAlign = "left";
  x.fillStyle = C.ink; x.font = `600 46px ${SANS}`; x.fillText("Career in the air", P, 166);
  // total
  x.font = `500 128px ${MONO}`; x.fillText(fmtH(c.t.tot), P-6, 310);
  const tw = x.measureText(fmtH(c.t.tot)).width;
  x.fillStyle = C.muted; x.font = `500 28px ${SANS}`; x.fillText("hours", P + tw + 12, 310);
  x.font = `400 24px ${SANS}`; x.fillStyle = C.ink2;
  x.fillText(`${fmtH(c.t.pic)} PIC  ·  ${fmtH(c.t.sic)} SIC  ·  ${fmtH(c.t.dual)} dual  ·  ${fmtH(c.t.night)} night`, P, 356);

  // route web
  const box = {x:P, y:392, w:W-2*P, h:330};
  x.fillStyle = "#f7f9fb"; x.strokeStyle = C.line; x.lineWidth = 1.5;
  roundRect(x, box.x, box.y, box.w, box.h, 14); x.fill(); x.stroke();
  const aps = [...c.visits.keys()].map(airport).filter(Boolean);
  if(aps.length){
    const proj = (lat, lon) => [lon, Math.log(Math.tan(Math.PI/4 + lat*Math.PI/360))];
    const pp = aps.map(a => proj(a.lat, a.lon));
    let x0 = Math.min(...pp.map(p=>p[0])), x1 = Math.max(...pp.map(p=>p[0])), y0 = Math.min(...pp.map(p=>p[1])), y1 = Math.max(...pp.map(p=>p[1]));
    const pad = 34, sx = (box.w-2*pad)/((x1-x0)||1), sy = (box.h-2*pad)/(((y1-y0)||1)*180/Math.PI), s = Math.min(sx, sy);
    const cx = box.x + box.w/2, cy = box.y + box.h/2, mx = (x0+x1)/2, my = (y0+y1)/2;
    const P2 = (lat, lon) => { const [u,v] = proj(lat, lon); return [cx + (u-mx)*s, cy - (v-my)*180/Math.PI*s]; };
    const maxN = Math.max(1, ...c.pairs.map(p => p.n));
    x.save(); roundRect(x, box.x, box.y, box.w, box.h, 14); x.clip();
    const base = await loadBase();
    if(base){
      const trace = rings => rings.forEach(r => { r.forEach(([lo,la],i) => { const [u,v] = P2(la, lo); i ? x.lineTo(u,v) : x.moveTo(u,v); }); x.closePath(); });
      x.beginPath(); trace(base.land); x.fillStyle = "#ffffff"; x.fill("evenodd"); x.strokeStyle = "#d5dbe3"; x.lineWidth = 1; x.stroke();
      x.beginPath(); trace(base.lakes); x.fillStyle = "#f7f9fb"; x.fill(); x.stroke();
    }
    x.lineCap = "round";
    [...c.pairs].sort((a,b) => a.n-b.n).forEach(p => {
      const A = airport(p.a), B = airport(p.b); if(!A||!B) return;
      const g = gcPoints(A, B, 24).map(([la,lo]) => P2(la, lo));
      x.strokeStyle = `rgba(42,120,214,${0.28 + 0.6*Math.sqrt(p.n/maxN)})`; x.lineWidth = 1.2 + 3.4*Math.sqrt(p.n/maxN);
      x.beginPath(); g.forEach(([u,v],i) => i ? x.lineTo(u,v) : x.moveTo(u,v)); x.stroke();
    });
    aps.forEach(a => { const [u,v] = P2(a.lat, a.lon), home = TORONTO.has(a.code);
      x.beginPath(); x.arc(u, v, home ? 7 : 3.5, 0, Math.PI*2); x.fillStyle = home ? C.accent : "#fff"; x.fill(); x.lineWidth = 2; x.strokeStyle = C.accent; x.stroke(); });
    x.restore();
  }
  x.fillStyle = C.muted; x.font = `500 18px ${SANS}`; x.fillText(`${fmtN(c.pairs.length)} routes · ${fmtN(c.visits.size)} airports · ${plural(c.countries.size,"country","countries")}`, box.x + 18, box.y + box.h - 18);

  // stat grid 3 x 2
  const d1 = c.dests[0], A1 = d1 && airport(d1.code);
  const cells = [
    ["DISTANCE FLOWN", `${fmtN(c.t.nm)} nm`, `${(c.t.nm/EARTH_NM).toFixed(1)}× around the Earth`],
    ["MOST VISITED", d1 ? d1.code : "–", d1 ? `${shortName(A1)} · ${d1.dest} arrivals` : ""],
    ["MOST FLOWN ROUTE", c.topRoute ? `${c.topRoute.a}–${c.topRoute.b}` : "–", c.topRoute ? `${c.topRoute.n} times · ${fmtN(c.topRoute.nm)} nm` : ""],
    ["LONGEST LEG", c.longest ? `${c.longest.a}–${c.longest.b}` : "–", c.longest ? `${fmtN(c.longest.nm)} nm` : ""],
    ["BUSIEST YEAR", c.bestYear ? String(c.bestYear[0]) : "–", c.bestYear ? `${fmtH(c.bestYear[1])} hours` : ""],
    ["LEGS FLOWN", fmtN(c.t.legs), `${fmtN(c.flights)} logbook entries`],
  ];
  const gy = 760, cw = (W-2*P)/3, ch = 150;
  x.strokeStyle = C.line; x.lineWidth = 1.5;
  x.beginPath(); x.moveTo(P, gy); x.lineTo(W-P, gy); x.moveTo(P, gy+ch); x.lineTo(W-P, gy+ch); x.moveTo(P, gy+2*ch); x.lineTo(W-P, gy+2*ch);
  x.moveTo(P+cw, gy); x.lineTo(P+cw, gy+2*ch); x.moveTo(P+2*cw, gy); x.lineTo(P+2*cw, gy+2*ch); x.stroke();
  cells.forEach(([k, v, n], i) => {
    const cx = P + (i%3)*cw + (i%3 ? 24 : 0), cy = gy + Math.floor(i/3)*ch, w = cw - (i%3 ? 36 : 12);
    x.fillStyle = C.muted; x.font = `600 17px ${SANS}`; x.fillText(k, cx, cy + 40);
    x.fillStyle = C.ink; x.font = `500 40px ${MONO}`; x.fillText(fit(v, w, `500 40px ${MONO}`), cx, cy + 92);
    x.fillStyle = C.ink2; x.font = `400 19px ${SANS}`; x.fillText(fit(n, w, `400 19px ${SANS}`), cx, cy + 124);
  });

  // hours by aircraft
  const hy = gy + 2*ch + 44;
  x.fillStyle = C.muted; x.font = `600 17px ${SANS}`; x.fillText("HOURS BY AIRCRAFT", P, hy);
  const top = c.groups.slice(0, 4), gmax = Math.max(...top.map(g => g.t.tot), 1);
  const barX = P + 230, barW = W - P - barX - 120;
  top.forEach((g, i) => {
    const y = hy + 26 + i*38;
    x.fillStyle = C.ink; x.font = `500 21px ${SANS}`; x.fillText(fit(typeName(g.g), 210, `500 21px ${SANS}`), P, y + 18);
    x.fillStyle = C.faint; roundRect(x, barX, y + 3, barW, 18, 4); x.fill();
    x.fillStyle = C.accent; roundRect(x, barX, y + 3, Math.max(6, barW * g.t.tot / gmax), 18, 4); x.fill();
    x.fillStyle = C.ink; x.font = `500 21px ${MONO}`; x.textAlign = "right"; x.fillText(fmtH(g.t.tot), W - P, y + 19); x.textAlign = "left";
  });
  return cv;
}
function roundRect(x, X, Y, w, h, r){ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+w,Y,X+w,Y+h,r); x.arcTo(X+w,Y+h,X,Y+h,r); x.arcTo(X,Y+h,X,Y,r); x.arcTo(X,Y,X+w,Y,r); x.closePath(); }
async function mountCareer(){
  const img = document.getElementById("flyCareerImg"); if(!img) return;
  const cv = await drawCareer();
  S.careerImg = cv.toDataURL("image/png");
  img.src = S.careerImg; img.removeAttribute("style");
  const blob = await new Promise(r => cv.toBlob(r, "image/png"));
  const file = new File([blob], "flying-career.png", {type:"image/png"});
  document.getElementById("flySave")?.addEventListener("click", () => {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "flying-career.png";
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  });
  const sh = document.getElementById("flyShare");
  if(sh && navigator.canShare && navigator.canShare({files:[file]})){
    sh.hidden = false;
    sh.addEventListener("click", () => navigator.share({files:[file], title:"Flying career"}).catch(() => {}));
  }
}

/* ---------------- data loading + mount ---------------- */
async function load(force){
  S.loading = true; S.err = null;
  try{ S.data = prep(await S.api("/api/admin", {code:S.code, action:"flying", refresh:!!force})); S.careerImg = null; NM_CACHE.clear(); }
  catch(e){ S.err = e.userMsg || e.message || "Couldn't load the logbook."; }
  S.loading = false;
}
function render(root){
  hideTip();
  if(S.map){ try{ S.map.remove(); }catch(e){} S.map = null; }
  if(S.err && !S.data){ root.innerHTML = shell(`<div class="fly-card fly-err"><h3>Couldn't load your logbook</h3><p class="sub" style="margin:6px 0 14px">${esc(S.err)}</p><button type="button" class="fly-btn" id="fRetry">Try again</button></div>`); wire(root); return; }
  if(!S.data){ root.innerHTML = shell(`<div class="fly-card fly-empty">Loading your logbook…</div>`); return; }
  root.innerHTML = S.tab === "map" ? mapTab() : S.tab === "career" ? careerTab() : logbookTab();
  wire(root);
  if(S.tab === "map") mountMap();
  if(S.tab === "career") mountCareer();
}
function wire(root){
  const on = (id, ev, fn) => { const el = root.querySelector("#"+id); if(el) el.addEventListener(ev, fn); };
  const setF = (k, v) => { S.filt[k] = v; render(root); };
  on("fType", "change", e => setF("type", e.target.value));
  on("fYear", "change", e => setF("year", e.target.value));
  on("fMonth", "change", e => setF("month", e.target.value));
  on("fClear", "click", () => { S.filt = {type:"all", year:"all", month:"all"}; render(root); });
  on("fRefresh", "click", async e => { e.target.textContent = "Refreshing…"; await load(true); render(root); });
  on("fRetry", "click", async () => { root.innerHTML = shell(`<div class="fly-card fly-empty">Loading your logbook…</div>`); await load(false); render(root); });
  wireTips(root);
}

window.Flying = {
  async mount(root, {tab, code, api}){
    if(!document.getElementById("flyCSS")){ const st = document.createElement("style"); st.id = "flyCSS"; st.textContent = CSS; document.head.appendChild(st); }
    S.tab = tab || "logbook"; S.api = api;
    if(S.code !== code){ S.code = code; S.data = null; }
    if(!S.data){ render(root); await load(false); if(!document.body.contains(root)) return; }
    render(root);
  },
  get map(){ return S.map; },
  unmount(){ hideTip(); if(S.map){ try{ S.map.remove(); }catch(e){} S.map = null; } }
};
})();
