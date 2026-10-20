/* Roster Snap — turns 360pairings screenshots into Google Calendar events and a month picture for the family.
   Commissioner-only. Loaded on demand from index.html; screenshots are read on the server by /api/admin (action "roster").
   Like Flying, deliberately not Survivor-themed. */
(function(){
"use strict";

/* ---------------- styles ---------------- */
const CSS = `
body.roster{--rs-bg:#F2F4F7;--rs-surface:#FFFFFF;--rs-ink:#15202B;--rs-muted:#5E6B78;--rs-faint:#8A96A3;--rs-line:#E2E7EC;
  --rs-navy:#1B3A5C;--rs-navy-ink:#FFFFFF;--rs-navy-soft:#E6EDF5;--rs-accent:#E8A317;--rs-accent-ink:#15202B;--rs-link:#1F5FA8;
  --rs-warn-bg:#FFF5DE;--rs-warn-ink:#6B4A00;--rs-err:#B42318;--rs-err-bg:#FDECEA;
  --rs-shadow:0 1px 2px rgba(21,32,43,.06),0 4px 16px rgba(21,32,43,.05);
  --rs-display:"Barlow Condensed","Arial Narrow",system-ui,sans-serif;--rs-body:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",sans-serif;--rs-mono:"IBM Plex Mono",ui-monospace,Menlo,monospace;
  background:var(--rs-bg)!important;color:var(--rs-ink)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) body.roster{--rs-bg:#0E141A;--rs-surface:#161F28;--rs-ink:#E7EDF2;--rs-muted:#9AA7B4;--rs-faint:#6F7C89;--rs-line:#26323E;
  --rs-navy:#2B4F78;--rs-navy-soft:#1C2B3B;--rs-accent:#F2B233;--rs-link:#8BBCF0;--rs-warn-bg:#352A10;--rs-warn-ink:#F3D488;--rs-err:#FF8A80;--rs-err-bg:#3A1C1A;--rs-shadow:0 1px 2px rgba(0,0,0,.3)}}
:root[data-theme="dark"] body.roster{--rs-bg:#0E141A;--rs-surface:#161F28;--rs-ink:#E7EDF2;--rs-muted:#9AA7B4;--rs-faint:#6F7C89;--rs-line:#26323E;
  --rs-navy:#2B4F78;--rs-navy-soft:#1C2B3B;--rs-accent:#F2B233;--rs-link:#8BBCF0;--rs-warn-bg:#352A10;--rs-warn-ink:#F3D488;--rs-err:#FF8A80;--rs-err-bg:#3A1C1A;--rs-shadow:0 1px 2px rgba(0,0,0,.3)}
body.roster .hero, body.roster #sampleNote, body.roster #viewNote{display:none!important}
body.roster nav.tabs{background:var(--rs-surface)!important;border-bottom:1px solid var(--rs-line)!important;box-shadow:none!important}
body.roster nav.tabs::before, body.roster nav.tabs::after{display:none!important}
body.roster nav.tabs a{color:var(--rs-muted)!important;font:500 13px/1 var(--rs-body)!important;letter-spacing:.02em!important;text-transform:none!important;text-shadow:none!important}
body.roster nav.tabs a[aria-current="page"]{color:var(--rs-ink)!important;border-bottom-color:var(--rs-ink)!important}

.rs{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:16px;font:400 15px/1.5 var(--rs-body);color:var(--rs-ink);-webkit-font-smoothing:antialiased}
.rs *{box-sizing:border-box}
.rs [hidden]{display:none!important}
.rs-top{display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap;padding:4px 4px 6px}
.rs-title{font:700 2.1rem/1 var(--rs-display);letter-spacing:.03em;text-transform:uppercase;margin:0;color:var(--rs-ink)}
.rs-title span{color:var(--rs-accent)}
.rs-top p{margin:6px 0 0;color:var(--rs-muted);max-width:56ch}
.rs-top > div{flex:1;min-width:0}
.rs-back{font:500 13px/1 var(--rs-body);color:var(--rs-muted);text-decoration:none;padding:8px 0}
.rs-back:hover{color:var(--rs-ink)}
.rs section{background:var(--rs-surface);border-radius:14px;box-shadow:var(--rs-shadow);padding:20px;display:flex;flex-direction:column;gap:16px}
.rs .sh{display:flex;align-items:center;gap:12px}
.rs .sh h3{font:600 1.1rem/1.3 var(--rs-body);margin:0;flex:1;min-width:0;color:var(--rs-ink);text-transform:none;letter-spacing:0}
.rs .sh .n{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font:600 .85rem var(--rs-body);background:var(--rs-navy-soft);color:var(--rs-ink)}
.rs .sh .count{color:var(--rs-muted);font-size:.9rem}
.rs .sub{color:var(--rs-muted);font-size:.9rem;margin:-8px 0 0}
.rs input,.rs textarea{font:inherit;color:var(--rs-ink);background:var(--rs-bg);border:1px solid var(--rs-line);border-radius:8px;padding:9px 11px;width:100%;min-width:0}
.rs textarea{resize:vertical}
.rs :focus-visible{outline:2px solid var(--rs-link);outline-offset:2px}
.rs .lbl{font-size:.8rem;font-weight:500;color:var(--rs-muted);display:block;margin-bottom:4px}
.rs .b{font:600 15px/1.2 var(--rs-body);border-radius:10px;padding:11px 16px;cursor:pointer;border:1px solid var(--rs-line);background:var(--rs-surface);color:var(--rs-ink);text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;text-transform:none;letter-spacing:0}
.rs .primary{background:var(--rs-accent);border-color:var(--rs-accent);color:var(--rs-accent-ink)}
.rs .wide{width:100%;padding:14px 16px;font-size:1rem}
.rs .b:disabled,.rs .b[aria-disabled=true]{opacity:.45;cursor:not-allowed;pointer-events:none}
.rs .tb{background:none;border:none;margin:0;padding:4px 0;color:var(--rs-link);font:500 .9rem var(--rs-body);cursor:pointer}
.rs .tb.danger{color:var(--rs-err)}
.rs .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.rs .status{font-size:.9rem;color:var(--rs-muted)}
.rs .status.err{color:var(--rs-err)}

.rs .imports{display:flex;flex-direction:column;border:1px solid var(--rs-line);border-radius:12px}
.rs .imp{padding:14px;display:flex;flex-direction:column;gap:10px}
.rs .imp+.imp{border-top:1px solid var(--rs-line)}
.rs .imp.over{background:var(--rs-navy-soft)}
.rs .imp-h{display:flex;align-items:center;gap:12px}
.rs .imp-h div{flex:1;min-width:0}
.rs .imp-h b{display:block;font-weight:600}
.rs .imp-h span{color:var(--rs-muted);font-size:.85rem}
.rs .addbtn{position:relative;padding:8px 14px;font-size:.9rem}
.rs .addbtn input{position:absolute;inset:0;opacity:0;width:100%;cursor:pointer;padding:0}
.rs .thumbs{display:flex;gap:8px;flex-wrap:wrap}
.rs .thumbs:empty{display:none}
.rs .thumbs figure{margin:0;position:relative}
.rs .thumbs img{width:58px;height:58px;object-fit:cover;border-radius:8px;border:1px solid var(--rs-line);display:block}
.rs .thumbs figcaption{position:absolute;left:4px;bottom:4px;background:var(--rs-navy);color:var(--rs-navy-ink);font:600 .68rem var(--rs-mono);padding:0 4px;border-radius:4px}
.rs .thumbs button{position:absolute;top:-7px;right:-7px;padding:0;width:22px;height:22px;border-radius:50%;font-size:.8rem;line-height:1;border:1px solid var(--rs-line);background:var(--rs-surface);color:var(--rs-ink);cursor:pointer}
.rs .prog{height:4px;border-radius:2px;background:var(--rs-line);overflow:hidden}
.rs .prog i{display:block;height:100%;width:0;background:var(--rs-accent);transition:width .3s}

.rs .banner{background:var(--rs-navy-soft);border-radius:10px;padding:10px 12px;font-size:.9rem}
.rs .note{background:var(--rs-warn-bg);color:var(--rs-warn-ink);border-radius:10px;padding:10px 12px;font-size:.9rem}
.rs .note ul{margin:4px 0 0;padding-left:18px}
.rs .list{display:flex;flex-direction:column;border:1px solid var(--rs-line);border-radius:12px;overflow:hidden}
.rs .list:empty{display:none}
.rs .pair+.pair{border-top:1px solid var(--rs-line)}
.rs .pair summary{list-style:none;display:flex;align-items:center;gap:14px;padding:12px 14px;cursor:pointer}
.rs .pair summary::-webkit-details-marker{display:none}
.rs .pair.off summary{opacity:.5}
.rs .dateblk{flex:none;width:54px;border-radius:10px;background:var(--rs-navy);color:var(--rs-navy-ink);text-align:center;padding:5px 0 6px;line-height:1}
.rs .dateblk .mo{font:600 .7rem var(--rs-body);letter-spacing:.08em;opacity:.8}
.rs .dateblk .dd{display:block;font:700 1.6rem var(--rs-display);margin:2px 0 1px}
.rs .dateblk .wd{font-size:.72rem;opacity:.8}
.rs .dateblk.none{background:var(--rs-err-bg);color:var(--rs-err)}
.rs .pinfo{flex:1;min-width:0}
.rs .pt{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.rs .pt b{font-weight:600;font-size:1rem}
.rs .tag{font-size:.72rem;font-weight:600;padding:2px 8px;border-radius:999px;background:var(--rs-navy-soft);color:var(--rs-ink)}
.rs .tag.bad{background:var(--rs-err-bg);color:var(--rs-err)}
.rs .tag.warn{background:var(--rs-warn-bg);color:var(--rs-warn-ink)}
.rs .pw{font-family:var(--rs-mono);font-size:.85rem;font-variant-numeric:tabular-nums;margin-top:2px}
.rs .pw.err{font-family:var(--rs-body);color:var(--rs-err)}
.rs .pr{font-size:.82rem;color:var(--rs-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rs .chev{flex:none;color:var(--rs-faint);font-size:1.3rem;transition:transform .2s}
.rs .pair[open] .chev{transform:rotate(90deg)}
.rs .editor{padding:4px 14px 16px;display:flex;flex-direction:column;gap:12px}
.rs .fields{display:grid;grid-template-columns:1fr 1.3fr 1fr;gap:10px}
@media (max-width:440px){.rs .fields{grid-template-columns:1fr 1fr}.rs .fields .code{grid-column:1/-1}}
.rs .fields input[type=time],.rs .fields input[type=date]{font-family:var(--rs-mono)}
.rs .flights{font-family:var(--rs-mono);font-size:.85rem;line-height:1.6;font-variant-numeric:tabular-nums}
.rs .ed-foot{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.rs .ed-foot .sp{flex:1}
.rs .toggle{display:inline-flex;align-items:center;gap:8px;font-size:.9rem;cursor:pointer}
.rs .toggle input{width:18px;height:18px;accent-color:var(--rs-navy);padding:0}
.rs .empty{color:var(--rs-muted);text-align:center;padding:20px;border:1px dashed var(--rs-line);border-radius:12px}

.rs .stepmeta{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:-6px}
.rs .dots{display:flex;gap:5px;flex-wrap:wrap}
.rs .dots i{width:8px;height:8px;border-radius:50%;background:var(--rs-line)}
.rs .dots i.done{background:var(--rs-navy)}
.rs .dots i.now{background:var(--rs-accent)}
.rs .or{display:flex;align-items:center;gap:12px;color:var(--rs-faint);font-size:.85rem}
.rs .or::before,.rs .or::after{content:"";flex:1;height:1px;background:var(--rs-line)}
.rs details.help{font-size:.9rem;color:var(--rs-muted)}
.rs details.help summary{cursor:pointer;color:var(--rs-link);font-weight:500}
.rs details.help ol{margin:8px 0 0;padding-left:20px;display:flex;flex-direction:column;gap:6px}
.rs details.help b{color:var(--rs-ink)}
.rs details.help a{color:var(--rs-link)}

.rs .seg{display:flex;gap:3px;background:var(--rs-bg);border:1px solid var(--rs-line);border-radius:10px;padding:3px}
.rs .seg button{flex:1;margin:0;border:0;background:none;padding:9px 10px;border-radius:8px;font:600 .9rem var(--rs-body);color:var(--rs-muted);cursor:pointer;text-transform:none;letter-spacing:0}
.rs .seg button[aria-pressed="true"]{background:var(--rs-surface);color:var(--rs-ink);box-shadow:0 1px 2px rgba(0,0,0,.12)}
.rs .share-f{display:grid;grid-template-columns:1.6fr 1fr;gap:10px}
@media (max-width:440px){.rs .share-f{grid-template-columns:1fr}}
.rs .shot{border-radius:10px;overflow:hidden;border:1px solid var(--rs-line);background:#fff;min-height:120px}
.rs .shot img{display:block;width:100%;height:auto}
@media (prefers-reduced-motion:reduce){.rs *{transition:none!important}}
`;

/* ---------------- helpers ---------------- */
const pad = n => String(n).padStart(2,"0");
const uid = () => Math.random().toString(36).slice(2,10);
const esc = s => String(s??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

/* Times on the pairing are local at each airport. Airport → time zone. */
const ZONES = {
 "America/Toronto":"YYZ YTZ YOW YUL YQB YXU YSB YQT YAM YTS YQG YKF YHM YGK YPQ YVO YUY YBG DCA IAD BWI PHL BOS LGA JFK EWR CLE CVG CMH DTW PIT BDL BUF ALB SYR ROC RDU CLT ATL MCO TPA FLL MIA PVD RIC BTV PWM MHT IND ORF GSO JAX RSW PBI SAV CHS GSP CAE MYR SRQ",
 "America/Halifax":"YHZ YQY YQM YFC YSJ YYG YQI YGP YBC",
 "America/Goose_Bay":"YYR",
 "America/St_Johns":"YYT YQX YDF YJT",
 "America/Winnipeg":"YWG YQK",
 "America/Chicago":"ORD MDW MSP STL MCI MKE MSY IAH HOU DFW DAL AUS SAT BNA MEM OMA",
 "America/Regina":"YQR YXE",
 "America/Edmonton":"YYC YEG YMM YQL YXH YQU YZF",
 "America/Denver":"DEN SLC",
 "America/Phoenix":"PHX",
 "America/Vancouver":"YVR YYJ YLW YXS YXX YKA YQQ YCD YPR YXC YXT YZP",
 "America/Whitehorse":"YXY",
 "America/Los_Angeles":"SEA SFO LAX PDX SAN LAS SJC OAK PSP SNA"
};
const TZOF = {}; for(const [z,c] of Object.entries(ZONES)) c.split(" ").forEach(a => TZOF[a] = z);
const tzFor = a => TZOF[a] || "America/Toronto";
function offsetMs(utc, tz){
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US",{timeZone:tz,hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}).formatToParts(new Date(utc)).map(x => [x.type,x.value]));
  return Date.UTC(+p.year,p.month-1,+p.day,+p.hour%24,+p.minute,+p.second) - utc;
}
function instant(ds, t, tz){                          // local wall time at an airport → UTC ms
  const [y,m,d] = ds.split("-").map(Number), [h,mi] = t.split(":").map(Number);
  const guess = Date.UTC(y,m-1,d,h,mi);
  let u = guess - offsetMs(guess,tz); u = guess - offsetMs(u,tz); return u;
}
const now = new Date();
const todayStr = now.getFullYear()+"-"+pad(now.getMonth()+1)+"-"+pad(now.getDate());
const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s||"");
function addDays(ds, n){ const [y,m,d] = ds.split("-").map(Number); const t = new Date(Date.UTC(y,m-1,d+n)); return t.getUTCFullYear()+"-"+pad(t.getUTCMonth()+1)+"-"+pad(t.getUTCDate()); }
const dayNum = ds => { const [y,m,d] = ds.split("-").map(Number); return Date.UTC(y,m-1,d)/864e5; };
const dow = ds => DOW[new Date(dayNum(ds)*864e5).getUTCDay()];
const header = ds => MON[+ds.slice(5,7)-1]+" "+(+ds.slice(8,10));
function normTime(t){
  if(t==null || t==="") return "";
  const m = String(t).trim().match(/^(\d{1,2})[:h.]?(\d{2})/);
  if(!m) return ""; const h = +m[1], mi = +m[2]; if(h>24 || mi>59) return "";
  return pad(h%24)+":"+pad(mi);
}
const short = t => t.replace(/^0(\d)/,"$1");           // 08:00 → 8:00
function normFlight(f){
  const s = String(f||"").trim().toUpperCase().replace(/^DH\s*/,"");
  const m = s.match(/^([A-Z]{2})[\s_-]*0*(\d+)$/);    // AC_00440 → AC440
  return m ? m[1]+m[2] : s;
}

/* flight text: "Nov 5" headers, then lines like "DH 8781 DCA-YYZ 6:59-8:32" */
const LEG = /^(DH\s+)?(\S+)\s+([A-Z]{3})\s*-\s*([A-Z]{3})\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/i;
const HEAD = /^([A-Za-z]{3,}\.?\s+\d{1,2}|day\s*\d+)$/i;
function parseFlights(text){
  const days = []; let cur = null;
  for(const raw of String(text||"").split("\n")){
    const line = raw.trim(); if(!line) continue;
    const m = line.match(LEG);
    if(m){ if(!cur){ cur = []; days.push(cur); } cur.push({dh:!!m[1],flight:normFlight(m[2]),from:m[3].toUpperCase(),to:m[4].toUpperCase(),dep:normTime(m[5]),arr:normTime(m[6])}); }
    else if(HEAD.test(line)){ cur = []; days.push(cur); }
  }
  return days;
}
const legLine = l => (l.dh?"DH ":"")+l.flight+" "+l.from+"-"+l.to+" "+short(l.dep)+"-"+short(l.arr);
const formatFlights = (days, start) => days.map((legs,i) => (isDate(start)?header(addDays(start,i)):"Day "+(i+1))+"\n"+legs.map(legLine).join("\n")).join("\n\n");

/* one pairing → one event */
function eventOf(p){
  if(!isDate(p.start)) return {err:"Set the Day 1 date"};
  if(!normTime(p.report)) return {err:"Set the report time"};
  const days = parseFlights(p.flights);
  let lastDay = -1, last = null;
  days.forEach((legs,i) => legs.forEach(l => { lastDay = i; last = l; }));
  if(!last) return {err:"Add at least one flight line"};
  const first = days.flat()[0];
  const fromA = first.from, toA = last.to;
  let endDate = addDays(p.start, lastDay);
  if(instant(endDate,last.arr,tzFor(toA)) <= instant(endDate,last.dep,tzFor(last.from))) endDate = addDays(endDate,1); // arrival after midnight
  const [h,mi] = last.arr.split(":").map(Number);
  let mins = Math.ceil((h*60+mi)/5)*5;                  // 13:57 → 14:00
  if(mins >= 1440){ mins -= 1440; endDate = addDays(endDate,1); }
  const startT = normTime(p.report), endT = pad(Math.floor(mins/60))+":"+pad(mins%60);
  return {start:p.start, startT, end:endDate, endT, fromA, toA,
          s:instant(p.start,startT,tzFor(fromA)), e:instant(endDate,endT,tzFor(toA)),
          unknown:[...new Set([fromA,toA].filter(a => !TZOF[a]))],
          title:"Work "+(p.code||"").trim(), desc:formatFlights(days,p.start)};
}
const zstamp = ms => new Date(ms).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
const gLink = ev => "https://calendar.google.com/calendar/render?"+new URLSearchParams({action:"TEMPLATE",text:ev.title,dates:zstamp(ev.s)+"/"+zstamp(ev.e),details:ev.desc}).toString();

/* ---------------- state (kept in this browser) ---------------- */
const STORE = "rosterSnap.v1";
function exampleState(){
  const p = {id:uid(), on:true, code:"Z7041", start:"2026-11-05", report:"07:00", flights:""};
  p.flights = formatFlights(parseFlights(`Day 1
8020 YYZ-YQY 08:00-11:30
8021 YQY-YYZ 12:10-13:57
8784 YYZ-DCA 16:40-18:18
Day 2
8781 DCA-YYZ 06:59-08:32
8398 YYZ-YQB 09:55-11:34
8399 YQB-YYZ 12:15-13:57`), p.start);
  return {pairings:[p], example:true, shareTitle:"Work schedule"};
}
function loadState(){ try{ const s = JSON.parse(localStorage.getItem(STORE)||"null"); if(s && Array.isArray(s.pairings)) return s; }catch(e){} return exampleState(); }
const S = { root:null, code:null, api:null, st:loadState(), open:new Set(), cal:null, det:[], ctl:null, stepIdx:0, monthPicked:false, kind:"month", imgBlob:null, imgURL:null, drawT:null };
function persist(){ try{ localStorage.setItem(STORE, JSON.stringify(S.st)); }catch(e){} }
const $ = sel => S.root.querySelector(sel);
const ready = () => S.st.pairings.filter(p => p.on).map(p => ({p, ev:eventOf(p)})).filter(x => !x.ev.err).sort((a,b) => a.ev.s - b.ev.s);

/* ---------------- page ---------------- */
function shell(){
  return `<div class="rs">
  <div class="rs-top">
    <div><div class="rs-title" role="heading" aria-level="2">Roster<span>/</span>Snap</div><p>Turn your 360pairings screenshots into Google Calendar events and a month picture for the family.</p></div>
    <a class="rs-back" href="#commissioner">← Commissioner</a>
  </div>

  <section aria-labelledby="rs1">
    <div class="sh"><span class="n">1</span><h3 id="rs1">Add your screenshots</h3></div>
    <div class="imports">
      <div class="imp" id="rsDropCal">
        <div class="imp-h"><div><b>Month calendar</b><span>Gives each pairing its date</span></div>
          <label class="b addbtn">Add<input type="file" id="rsFileCal" accept="image/*" aria-label="Add month calendar screenshot"></label></div>
        <div class="thumbs" id="rsThumbsCal"></div>
      </div>
      <div class="imp" id="rsDropDet">
        <div class="imp-h"><div><b>Pairing details</b><span>One per pairing, in calendar order</span></div>
          <label class="b addbtn">Add<input type="file" id="rsFileDet" accept="image/*" multiple aria-label="Add pairing screenshots"></label></div>
        <div class="thumbs" id="rsThumbsDet"></div>
      </div>
    </div>
    <button class="b primary wide" id="rsScan" type="button" disabled>Read screenshots</button>
    <div class="prog" id="rsProg" hidden><i id="rsProgBar"></i></div>
    <div class="row"><span class="status" id="rsStatus" role="status"></span><button class="tb" id="rsStop" type="button" hidden>Stop</button></div>
  </section>

  <section aria-labelledby="rs2">
    <div class="sh"><span class="n">2</span><h3 id="rs2">Check your pairings</h3><span class="count" id="rsCount"></span></div>
    <div class="banner" id="rsExample">This is an example. Read your screenshots and your pairings will replace it.</div>
    <div class="note" id="rsWarn" hidden></div>
    <div class="list" id="rsList"></div>
    <div class="empty" id="rsEmpty" hidden>No pairings yet. Read your screenshots or add one by hand.</div>
    <button class="tb" id="rsAdd" type="button" style="align-self:flex-start">+ Add a pairing by hand</button>
  </section>

  <section aria-labelledby="rs3">
    <div class="sh"><span class="n">3</span><h3 id="rs3">Add to Google Calendar</h3></div>
    <p class="sub">Tap the button, press Save in Google Calendar, come back and tap again for the next one.</p>
    <a class="b primary wide" id="rsStep" target="_blank" rel="noopener" href="#">Add to Google</a>
    <div class="stepmeta"><div class="dots" id="rsDots"></div><button class="tb" id="rsRestart" type="button" hidden>Start over</button></div>
    <div class="or">or</div>
    <button class="b wide" id="rsExport" type="button">Download all as one calendar file</button>
    <span class="status" id="rsExStatus" role="status"></span>
    <details class="help">
      <summary>How to import the file</summary>
      <ol>
        <li><b>iPhone or iPad:</b> open the downloaded file, tap Add All, and pick your Google calendar. Your Google account needs to be added under Settings → Calendar → Accounts.</li>
        <li><b>iPad Safari or a computer:</b> <a href="https://calendar.google.com/calendar/r/settings/export" target="_blank" rel="noopener">open Google Calendar's import page</a>, choose the file, then tap Import.</li>
      </ol>
    </details>
  </section>

  <section aria-labelledby="rs4">
    <div class="sh"><span class="n">4</span><h3 id="rs4">Share with family</h3></div>
    <div class="seg" role="group" aria-label="Picture style">
      <button type="button" data-kind="month" aria-pressed="true">Month view</button>
      <button type="button" data-kind="flights" aria-pressed="false">Every flight</button>
    </div>
    <p class="sub" id="rsShareSub" style="margin:0"></p>
    <div class="shot"><img id="rsImg" alt="Picture of your work schedule"></div>
    <div class="share-f">
      <div><label class="lbl" for="rsShareTitle">Heading</label><input id="rsShareTitle"></div>
      <div><label class="lbl" for="rsShareMonth">Month</label><input type="month" id="rsShareMonth"></div>
    </div>
    <button class="b primary wide" id="rsSaveImg" type="button">Share image</button>
    <span class="status" id="rsImgStatus" role="status"></span>
  </section>
</div>`;
}

/* ---------------- pairing list ---------------- */
function routeText(p){
  const legs = parseFlights(p.flights).flat(); if(!legs.length) return "";
  const base = legs[0].from, seen = [];
  legs.forEach(l => [l.from,l.to].forEach(a => { if(a!==base && !seen.includes(a)) seen.push(a); }));
  return seen.length ? "Via "+seen.join(" · ") : "";
}
function view(p){
  const ev = eventOf(p); let when, tag, tagCls = "";
  if(ev.err){ when = ev.err; tag = "Needs fixing"; tagCls = "bad"; }
  else{
    const nd = dayNum(ev.end)-dayNum(ev.start)+1;
    when = `Report ${ev.startT} · Done ${ev.end===ev.start?"":dow(ev.end)+" "}${ev.endT}`;
    tag = nd===1 ? "Day trip" : nd+" days";
    if(ev.unknown.length){ tag = "Check time zone"; tagCls = "warn"; when += ` · ${ev.unknown.join(", ")} unknown, using Toronto time`; }
  }
  if(!p.on){ tag = "Skipped"; tagCls = ""; }
  return {ev, when, tag, tagCls, title:"Work "+(p.code||"").trim(), route:routeText(p)};
}
const dateBlk = p => isDate(p.start)
  ? `<span class="mo">${MON[+p.start.slice(5,7)-1].toUpperCase()}</span><span class="dd">${+p.start.slice(8)}</span><span class="wd">${dow(p.start)}</span>`
  : `<span class="mo">DATE</span><span class="dd">?</span><span class="wd">set it</span>`;
function cardHTML(p){
  const v = view(p), f = k => `rs-${p.id}-${k}`;
  const rows = Math.max(4, String(p.flights).split("\n").length+1);
  return `<details class="pair${p.on?"":" off"}" data-id="${p.id}" ${S.open.has(p.id)?"open":""}>
    <summary>
      <div class="dateblk${isDate(p.start)?"":" none"}" data-date>${dateBlk(p)}</div>
      <div class="pinfo">
        <div class="pt"><b data-title>${esc(v.title)}</b><span class="tag ${v.tagCls}" data-tag>${esc(v.tag)}</span></div>
        <div class="pw${v.ev.err?" err":""}" data-when>${esc(v.when)}</div>
        <div class="pr" data-route>${esc(v.route)}</div>
      </div>
      <span class="chev" aria-hidden="true">›</span>
    </summary>
    <div class="editor">
      <div class="fields">
        <div class="code"><label class="lbl" for="${f("code")}">Pairing</label><input id="${f("code")}" data-f="code" value="${esc(p.code)}" autocapitalize="characters"></div>
        <div><label class="lbl" for="${f("start")}">Day 1 date</label><input type="date" id="${f("start")}" data-f="start" value="${esc(p.start)}"></div>
        <div><label class="lbl" for="${f("report")}">Report time</label><input type="time" id="${f("report")}" data-f="report" value="${esc(normTime(p.report))}"></div>
      </div>
      <div><label class="lbl" for="${f("flights")}">Flights, as they'll appear in the event</label>
        <textarea class="flights" id="${f("flights")}" data-f="flights" rows="${rows}" spellcheck="false">${esc(p.flights)}</textarea></div>
      <div class="ed-foot">
        <label class="toggle"><input type="checkbox" data-f="on" ${p.on?"checked":""}>Include</label>
        <span class="sp"></span>
        <button class="tb danger" type="button" data-del>Remove</button>
        <a class="b" data-link ${v.ev.err?'aria-disabled="true"':""} href="${v.ev.err?"#":esc(gLink(v.ev))}" target="_blank" rel="noopener">Add to Google</a>
      </div>
    </div>
  </details>`;
}
function renderList(){
  $("#rsList").innerHTML = S.st.pairings.map(cardHTML).join("");
  $("#rsEmpty").hidden = !!S.st.pairings.length;
  $("#rsExample").hidden = !S.st.example;
  summary();
}
function refreshCard(card, p){
  const v = view(p);
  card.querySelector("[data-title]").textContent = v.title;
  const t = card.querySelector("[data-tag]"); t.textContent = v.tag; t.className = "tag "+v.tagCls;
  const w = card.querySelector("[data-when]"); w.textContent = v.when; w.classList.toggle("err", !!v.ev.err);
  card.querySelector("[data-route]").textContent = v.route;
  const d = card.querySelector("[data-date]"); d.innerHTML = dateBlk(p); d.classList.toggle("none", !isDate(p.start));
  card.classList.toggle("off", !p.on);
  const a = card.querySelector("[data-link]");
  if(v.ev.err){ a.setAttribute("aria-disabled","true"); a.href = "#"; } else { a.removeAttribute("aria-disabled"); a.href = gLink(v.ev); }
}
function summary(){
  const n = ready().length, total = S.st.pairings.length;
  $("#rsCount").textContent = total ? (n===total ? `${n} ready` : `${n} of ${total} ready`) : "";
  $("#rsExport").disabled = !n;
  $("#rsExport").textContent = n>1 ? `Download all ${n} as one calendar file` : "Download as a calendar file";
  updateStep(); queueDraw(); persist();
}

/* ---------------- tap-through: one Google link at a time ---------------- */
function updateStep(){
  const list = ready(), a = $("#rsStep");
  $("#rsRestart").hidden = S.stepIdx===0;
  $("#rsDots").innerHTML = list.map((_,i) => `<i class="${i<S.stepIdx?"done":i===S.stepIdx?"now":""}"></i>`).join("");
  if(!list.length){ a.textContent = "No pairings ready yet"; a.setAttribute("aria-disabled","true"); a.href = "#"; return; }
  if(S.stepIdx >= list.length){ a.textContent = `All ${list.length} added`; a.setAttribute("aria-disabled","true"); a.href = "#"; return; }
  const {ev} = list[S.stepIdx];
  a.removeAttribute("aria-disabled"); a.href = gLink(ev);
  a.textContent = `Add ${ev.title} · ${dow(ev.start)} ${header(ev.start)}`;
}

/* ---------------- screenshots ---------------- */
function thumbs(el, list, onRemove, numbered){
  el.innerHTML = "";
  list.forEach((f,i) => {
    const fig = document.createElement("figure");
    const img = document.createElement("img"); img.src = URL.createObjectURL(f); img.alt = (numbered?"Pairing screenshot ":"Calendar screenshot ")+(i+1);
    fig.append(img);
    if(numbered){ const c = document.createElement("figcaption"); c.textContent = i+1; fig.append(c); }
    const b = document.createElement("button"); b.type = "button"; b.textContent = "×"; b.setAttribute("aria-label","Remove "+img.alt); b.onclick = () => onRemove(i);
    fig.append(b); el.append(fig);
  });
}
function showThumbs(){
  thumbs($("#rsThumbsCal"), S.cal?[S.cal]:[], () => { S.cal = null; showThumbs(); }, false);
  thumbs($("#rsThumbsDet"), S.det, i => { S.det.splice(i,1); showThumbs(); }, true);
  const n = S.det.length+(S.cal?1:0);
  $("#rsScan").disabled = !S.det.length || !!S.ctl;
  $("#rsScan").textContent = S.det.length ? `Read ${n} screenshot${n>1?"s":""}` : "Read screenshots";
}
const imgs = l => [...l].filter(f => f.type.startsWith("image/"));
function wireDrop(drop, input, add){
  input.addEventListener("change", e => { add(imgs(e.target.files)); e.target.value = ""; });
  ["dragover","dragenter"].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave","drop"].forEach(t => drop.addEventListener(t, () => drop.classList.remove("over")));
  drop.addEventListener("drop", e => { e.preventDefault(); add(imgs(e.dataTransfer.files)); });
}
function setStatus(t, err){ const s = $("#rsStatus"); s.textContent = t; s.classList.toggle("err", !!err); }

/* Shrink a screenshot before upload (keeps requests small and fast). */
async function shrink(file){
  let src, w, h;
  try{ src = await createImageBitmap(file); w = src.width; h = src.height; }
  catch(e){ src = new Image(); src.src = URL.createObjectURL(file); await src.decode(); w = src.naturalWidth; h = src.naturalHeight; }
  const k = Math.min(1, 1800/Math.max(w,h)), c = document.createElement("canvas");
  c.width = Math.round(w*k); c.height = Math.round(h*k);
  c.getContext("2d").drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.85);
}
async function pool(items, n, fn){
  const out = new Array(items.length); let i = 0;
  await Promise.all(Array.from({length:Math.min(n,items.length)}, async () => { while(i < items.length){ const k = i++; out[k] = await fn(items[k],k); } }));
  return out;
}
const lastCode = s => { const m = String(s||"").toUpperCase().match(/\b[A-Z]{3}\b/g); return m ? m[m.length-1] : ""; };

async function scan(){
  if(!S.det.length || S.ctl) return;
  const ctl = S.ctl = {stopped:false, fatal:null};
  $("#rsStop").hidden = false; $("#rsWarn").hidden = true; $("#rsProg").hidden = false; showThumbs();
  const total = S.det.length+(S.cal?1:0); let done = 0;
  const tick = () => { setStatus(`Reading screenshots… ${done} of ${total}`); $("#rsProgBar").style.width = Math.max(4, done/total*100)+"%"; }; tick();
  const ask = async (kind, file) => {
    if(ctl.stopped || ctl.fatal) return {__err:true};
    try{ const r = await S.api("/api/admin", {code:S.code, action:"roster", kind, image:await shrink(file), today:todayStr}); return r.result; }
    catch(e){ if([401,429,503].includes(e.status) && !ctl.fatal) ctl.fatal = e; return {__err:true}; }
    finally{ done++; if(S.root) tick(); }
  };
  const [cal, dets] = await Promise.all([S.cal ? ask("calendar", S.cal) : null, pool(S.det, 2, f => ask("details", f))]);
  S.ctl = null;
  if(!S.root) return;
  $("#rsStop").hidden = true; $("#rsProg").hidden = true; showThumbs();
  if(ctl.stopped){ setStatus("Stopped."); return; }
  if(ctl.fatal){ setStatus(ctl.fatal.userMsg || ctl.fatal.message || "Something went wrong.", true); return; }

  const warns = [];
  const slots = (cal && !cal.__err && Array.isArray(cal.pairings) ? cal.pairings : []).filter(o => isDate(o?.start)).sort((a,b) => a.start.localeCompare(b.start));
  if(S.cal && !slots.length) warns.push("Couldn't read dates from the month calendar. Set each Day 1 date by hand.");
  if(!S.cal) warns.push("No month calendar added, so set each Day 1 date by hand.");
  const used = new Set(), out = [];
  dets.forEach((d,i) => {
    if(!d || d.__err || !Array.isArray(d.days)){ warns.push(`Couldn't read pairing screenshot ${i+1}. Try a sharper screenshot.`); return; }
    const days = d.days.map(x => (Array.isArray(x?.legs)?x.legs:[]).map(l => ({dh:!!l.dh, flight:normFlight(l.flight), from:String(l.from||"").toUpperCase(), to:String(l.to||"").toUpperCase(), dep:normTime(l.dep), arr:normTime(l.arr)})).filter(l => l.dep && l.arr));
    const dur = +d.duration || days.length;
    let start = "";
    if(isDate(d.start_date)){ start = d.start_date; const k = slots.findIndex(o => o.start===start); if(k>=0) used.add(k); }
    else{
      const arrivals = new Set(days.flat().map(l => l.to)); let best = -1, bs = -1;
      slots.forEach((o,k) => { if(used.has(k)) return; let s = 0; const c = lastCode(o.label); if(c && arrivals.has(c)) s += 2; if(+o.days===dur) s += 1; if(s>bs){ bs = s; best = k; } });
      if(best>=0){ used.add(best); start = slots[best].start; }
    }
    const code = String(d.code||"").trim();
    if(!start) warns.push(`${code||"Pairing "+(i+1)}: no matching date on the calendar. Set Day 1 by hand.`);
    if(days.length!==dur) warns.push(`${code||"Pairing "+(i+1)}: shows ${dur} days but ${days.length} day blocks were read.`);
    out.push({id:uid(), on:true, code, start, report:normTime(d.report), flights:formatFlights(days,start)});
  });
  const unmatched = slots.filter((_,k) => !used.has(k));
  if(slots.length && unmatched.length) warns.push("No details screenshot for: "+unmatched.map(o => header(o.start)+" "+(o.label||"")).join(", ")+".");
  out.sort((a,b) => (a.start||"9999").localeCompare(b.start||"9999"));

  if(out.length){ S.st.pairings = out; S.st.example = false; S.open.clear(); S.stepIdx = 0; S.monthPicked = false; renderList(); }
  if(warns.length){ $("#rsWarn").innerHTML = "<b>Double-check:</b><ul>"+warns.map(x => "<li>"+esc(x)+"</li>").join("")+"</ul>"; $("#rsWarn").hidden = false; }
  setStatus(out.length ? `Read ${out.length} pairing${out.length>1?"s":""}. Check them below.` : "No pairings read. Try sharper screenshots.", !out.length);
  if(out.length) $("#rs2").scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
}

/* ---------------- files out ---------------- */
const icsEsc = s => String(s||"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n");
function fold(line){ const out = []; while(line.length>74){ out.push(line.slice(0,74)); line = " "+line.slice(74); } out.push(line); return out.join("\r\n"); }
function buildICS(){
  const stamp = zstamp(Date.now());
  const L = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Roster Snap//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH"];
  ready().forEach(({p,ev}) => L.push("BEGIN:VEVENT","UID:"+(p.code||p.id)+"-"+ev.start+"@rostersnap","DTSTAMP:"+stamp,
    "DTSTART:"+zstamp(ev.s),"DTEND:"+zstamp(ev.e),"SUMMARY:"+icsEsc(ev.title),"DESCRIPTION:"+icsEsc(ev.desc),"END:VEVENT"));
  L.push("END:VCALENDAR");
  return L.map(fold).join("\r\n")+"\r\n";
}
function download(blob, name){
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 20000);
}

/* ---------------- share image ---------------- */
function queueDraw(){ clearTimeout(S.drawT); S.drawT = setTimeout(drawMonth, 250); }
function defaultMonth(){
  const c = {}; ready().forEach(({ev}) => { const k = ev.start.slice(0,7); c[k] = (c[k]||0)+1; });
  const best = Object.entries(c).sort((a,b) => b[1]-a[1])[0];
  return best ? best[0] : todayStr.slice(0,7);
}
function fit(ctx, text, maxW, size, weight, family){
  let sz = size; do{ ctx.font = `${weight} ${sz}px ${family}`; if(ctx.measureText(text).width <= maxW) break; sz -= 1; }while(sz > 12);
  return sz;
}
function rrect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
async function drawMonth(){
  if(!S.root) return;
  const mi = $("#rsShareMonth");
  if(!S.monthPicked || !/^\d{4}-\d{2}$/.test(mi.value)) mi.value = defaultMonth();
  const [Y,M] = mi.value.split("-").map(Number);
  const DISP = '"Barlow Condensed","Arial Narrow",sans-serif', BODY = '"IBM Plex Sans",system-ui,sans-serif';
  try{ await Promise.all(['700 80px "Barlow Condensed"','600 30px "Barlow Condensed"','400 24px "IBM Plex Sans"'].map(f => document.fonts.load(f))); }catch(e){}
  if(!S.root) return;
  if(S.kind==="flights") return drawFlights(mi.value, DISP, BODY);

  const day = {};
  ready().forEach(({p,ev}) => {
    const byDay = parseFlights(p.flights), base = byDay.flat()[0]?.from;
    let d = ev.start, i = 0;
    while(d <= ev.end && i < 40){
      const legs = byDay[i]||[], lastLeg = legs[legs.length-1], first = d===ev.start, last = d===ev.end;
      let l1, l2 = "";
      if(first && last){ l1 = "Starts "+ev.startT; l2 = "Done "+ev.endT; }
      else if(first) l1 = "Starts "+ev.startT;
      else if(last) l1 = "Done "+ev.endT;
      else l1 = "Flying";
      if(!last && lastLeg && lastLeg.to!==base) l2 = "Night in "+lastLeg.to;
      else if(!last && !first) l2 = "Away";
      day[d] = {id:p.id, l1, l2, last};
      d = addDays(d,1); i++;
    }
  });

  const W = 1600, PAD = 56, HEAD = 200, WK = 54, CH = 170, FOOT = 80;
  const firstDs = `${Y}-${pad(M)}-01`, offset = (new Date(Date.UTC(Y,M-1,1)).getUTCDay()+6)%7;
  const dim = new Date(Date.UTC(Y,M,0)).getUTCDate(), rows = Math.ceil((offset+dim)/7);
  const H = HEAD+WK+rows*CH+FOOT;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  const NAVY = "#1B3A5C", INK = "#15202B", MUTE = "#6B7785", LINE = "#E2E7EC", OFF = "#F6F8FA", AMBER = "#E8A317", SOFT = "#C9D8EA";
  ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0,0,W,H);
  ctx.fillStyle = AMBER; ctx.fillRect(0,0,W,10);
  ctx.fillStyle = INK; ctx.font = `700 84px ${DISP}`; ctx.fillText((MONTHS[M-1]+" "+Y).toUpperCase(), PAD, 118);
  ctx.fillStyle = MUTE; ctx.font = `400 30px ${BODY}`; ctx.fillText(S.st.shareTitle.trim()||"Work schedule", PAD, 164);
  const inMonth = Object.keys(day).filter(d => d.slice(0,7)===mi.value), nights = inMonth.filter(d => !day[d].last).length;
  ctx.textAlign = "right"; ctx.fillStyle = INK; ctx.font = `600 32px ${DISP}`; ctx.fillText(`${inMonth.length} DAYS WORKING`, W-PAD, 118);
  ctx.fillStyle = MUTE; ctx.font = `400 24px ${BODY}`; ctx.fillText(`${nights} night${nights===1?"":"s"} away`, W-PAD, 156);
  ctx.textAlign = "left";
  const cw = (W-2*PAD)/7, gy = HEAD+WK;
  ["MON","TUE","WED","THU","FRI","SAT","SUN"].forEach((t,c) => { ctx.fillStyle = MUTE; ctx.font = `600 24px ${DISP}`; ctx.fillText(t, PAD+c*cw+14, HEAD+34); });
  for(let r = 0; r < rows; r++){
    for(let c = 0; c < 7; c++){
      const ds = addDays(firstDs, r*7+c-offset), x = PAD+c*cw, y = gy+r*CH, inM = ds.slice(0,7)===mi.value;
      ctx.fillStyle = inM ? "#FFFFFF" : OFF; ctx.fillRect(x,y,cw,CH);
      ctx.strokeStyle = LINE; ctx.lineWidth = 2; ctx.strokeRect(x+1,y+1,cw-2,CH-2);
      ctx.fillStyle = inM ? INK : "#AEB8C2"; ctx.font = `600 26px ${DISP}`; ctx.fillText(String(+ds.slice(8)), x+14, y+34);
      if(ds===todayStr){ ctx.fillStyle = AMBER; ctx.beginPath(); ctx.arc(x+cw-22,y+25,7,0,7); ctx.fill(); }
    }
    let c = 0;
    while(c < 7){
      const info = day[addDays(firstDs, r*7+c-offset)];
      if(!info){ c++; continue; }
      let e = c; while(e+1 < 7 && day[addDays(firstDs, r*7+e+1-offset)]?.id===info.id) e++;
      const x = PAD+c*cw+7, y = gy+r*CH+46, w = (e-c+1)*cw-14, h = CH-56;
      ctx.fillStyle = NAVY; rrect(ctx,x,y,w,h,14); ctx.fill();
      for(let k = c; k <= e; k++){
        const di = day[addDays(firstDs, r*7+k-offset)], tx = PAD+k*cw+22, mw = cw-36;
        ctx.fillStyle = "#FFFFFF"; const s1 = fit(ctx,di.l1,mw,30,"600",DISP); ctx.font = `600 ${s1}px ${DISP}`; ctx.fillText(di.l1, tx, y+44);
        if(di.l2){ ctx.fillStyle = SOFT; const s2 = fit(ctx,di.l2,mw,22,"400",BODY); ctx.font = `400 ${s2}px ${BODY}`; ctx.fillText(di.l2, tx, y+80); }
      }
      c = e+1;
    }
  }
  ctx.fillStyle = NAVY; rrect(ctx,PAD,H-FOOT+26,24,24,6); ctx.fill();
  ctx.fillStyle = MUTE; ctx.font = `400 22px ${BODY}`; ctx.fillText("Working", PAD+36, H-FOOT+45);
  ctx.textAlign = "right"; ctx.fillText("All times are local", W-PAD, H-FOOT+45); ctx.textAlign = "left";
  showCanvas(cv);
}
function showCanvas(cv){
  cv.toBlob(b => { if(!b || !S.root) return; S.imgBlob = b; if(S.imgURL) URL.revokeObjectURL(S.imgURL); S.imgURL = URL.createObjectURL(b); $("#rsImg").src = S.imgURL; }, "image/png");
}

/* Every flight in the month, pairing by pairing: a tall picture that reads well on a phone. */
async function drawFlights(ym, DISP, BODY){
  const MONO = '"IBM Plex Mono",ui-monospace,Menlo,monospace';
  try{ await Promise.all(['500 28px "IBM Plex Mono"','600 22px "IBM Plex Sans"'].map(f => document.fonts.load(f))); }catch(e){}
  if(!S.root) return;
  const [Y,M] = ym.split("-").map(Number);
  const list = ready().filter(({ev}) => ev.start.slice(0,7)===ym || ev.end.slice(0,7)===ym);
  const W = 1200, PAD = 56, CX = PAD, CW = W-2*PAD;
  const HEAD = 214, PH = 108, DAYH = 54, LEGH = 56, NIGHT = 52, GAP = 36, FOOT = 92;
  const blocks = list.map(({p,ev}) => {
    const days = parseFlights(p.flights);
    let h = PH + 14;
    days.forEach((legs,i) => { h += DAYH + legs.length*LEGH; if(i < days.length-1) h += NIGHT; });
    return {p, ev, days, h: h + 16};
  });
  const H = HEAD + (blocks.length ? blocks.reduce((a,b) => a+b.h, 0) + GAP*(blocks.length-1) : 160) + FOOT;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  const NAVY = "#1B3A5C", INK = "#15202B", MUTE = "#6B7785", LINE = "#E2E7EC", ZEBRA = "#F5F7F9", AMBER = "#E8A317", SOFT = "#C9D8EA";
  ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0,0,W,H);
  ctx.fillStyle = AMBER; ctx.fillRect(0,0,W,10);

  const nFlights = blocks.reduce((a,b) => a + b.days.flat().length, 0);
  ctx.fillStyle = INK; ctx.font = `700 76px ${DISP}`; ctx.fillText((MONTHS[M-1]+" "+Y).toUpperCase(), PAD, 112);
  ctx.fillStyle = MUTE; ctx.font = `400 28px ${BODY}`; ctx.fillText((S.st.shareTitle.trim()||"Work schedule")+" · every flight", PAD, 158);
  ctx.textAlign = "right"; ctx.fillStyle = INK; ctx.font = `600 32px ${DISP}`;
  ctx.fillText(`${blocks.length} PAIRING${blocks.length===1?"":"S"}`, W-PAD, 112);
  ctx.fillStyle = MUTE; ctx.font = `400 24px ${BODY}`; ctx.fillText(`${nFlights} flight${nFlights===1?"":"s"}`, W-PAD, 152);
  ctx.textAlign = "left";

  let y = HEAD;
  if(!blocks.length){ ctx.fillStyle = MUTE; ctx.font = `400 28px ${BODY}`; ctx.fillText("No pairings this month.", PAD, y+60); }
  const longDate = ds => (dow(ds)+" "+header(ds)).toUpperCase();
  blocks.forEach(({p,ev,days,h}) => {
    ctx.fillStyle = "#FFFFFF"; rrect(ctx,CX,y,CW,h,16); ctx.fill();
    ctx.strokeStyle = LINE; ctx.lineWidth = 2; rrect(ctx,CX+1,y+1,CW-2,h-2,16); ctx.stroke();
    ctx.fillStyle = NAVY; rrect(ctx,CX,y,CW,PH,16); ctx.fill(); ctx.fillRect(CX,y+PH-16,CW,16);
    ctx.fillStyle = "#FFFFFF"; ctx.font = `700 40px ${DISP}`; ctx.fillText(ev.title.toUpperCase(), CX+28, y+50);
    const span = ev.end===ev.start ? dow(ev.start)+" "+header(ev.start) : dow(ev.start)+" "+header(ev.start)+"  →  "+dow(ev.end)+" "+header(ev.end);
    ctx.fillStyle = SOFT; ctx.font = `400 24px ${BODY}`; ctx.fillText(span, CX+28, y+88);
    ctx.textAlign = "right";
    ctx.fillStyle = "#FFFFFF"; ctx.font = `500 30px ${MONO}`; ctx.fillText(`${ev.startT} → ${ev.endT}`, CX+CW-28, y+50);
    ctx.fillStyle = SOFT; ctx.font = `400 22px ${BODY}`;
    ctx.fillText(ev.end===ev.start ? "Report  ·  Done" : `Report ${dow(ev.start)}  ·  Done ${dow(ev.end)}`, CX+CW-28, y+88);
    ctx.textAlign = "left";

    let cy = y + PH + 14;
    const base = days.flat()[0]?.from;
    days.forEach((legs,i) => {
      const ds = addDays(ev.start, i);
      ctx.fillStyle = MUTE; ctx.font = `600 22px ${BODY}`; ctx.fillText(longDate(ds), CX+28, cy+36);
      cy += DAYH;
      legs.forEach((l,k) => {
        if(k%2===0){ ctx.fillStyle = ZEBRA; rrect(ctx,CX+14,cy+2,CW-28,LEGH-4,10); ctx.fill(); }
        const ty = cy + 37;
        if(l.dh){
          ctx.fillStyle = "#FFF1D6"; rrect(ctx,CX+28,cy+12,56,32,8); ctx.fill();
          ctx.fillStyle = "#8A5A00"; ctx.font = `600 20px ${BODY}`; ctx.textAlign = "center"; ctx.fillText("DH", CX+56, cy+35); ctx.textAlign = "left";
        }
        ctx.fillStyle = INK; ctx.font = `500 28px ${MONO}`; ctx.fillText(l.flight, CX+100, ty);
        ctx.font = `600 28px ${BODY}`; ctx.fillText(l.from, CX+310, ty);
        const ax = CX+310+ctx.measureText(l.from).width+16;
        ctx.fillStyle = MUTE; ctx.font = `400 26px ${BODY}`; ctx.fillText("→", ax, ty);
        const tx = ax+ctx.measureText("→").width+16;
        ctx.fillStyle = INK; ctx.font = `600 28px ${BODY}`; ctx.fillText(l.to, tx, ty);
        ctx.textAlign = "right"; ctx.font = `500 28px ${MONO}`;
        ctx.fillText(`${l.dep} – ${l.arr}${l.arr<l.dep?" +1":""}`, CX+CW-28, ty);
        ctx.textAlign = "left";
        cy += LEGH;
      });
      if(i < days.length-1){
        const stay = legs[legs.length-1]?.to;
        const txt = !stay ? "Day off" : stay===base ? "Home overnight" : "Overnight in "+stay;
        ctx.fillStyle = NAVY; ctx.beginPath(); ctx.arc(CX+36, cy+28, 6, 0, 7); ctx.fill();
        ctx.fillStyle = MUTE; ctx.font = `400 22px ${BODY}`; ctx.fillText(txt, CX+52, cy+36);
        cy += NIGHT;
      }
    });
    y += h + GAP;
  });
  ctx.fillStyle = MUTE; ctx.font = `400 22px ${BODY}`;
  ctx.fillText("All times are local to each airport.", PAD, H-FOOT+50);
  ctx.textAlign = "right"; ctx.fillStyle = "#8A5A00"; ctx.fillText("DH = deadhead", W-PAD, H-FOOT+50); ctx.textAlign = "left";
  showCanvas(cv);
}

/* ---------------- wiring ---------------- */
function wire(){
  const list = $("#rsList");
  list.addEventListener("toggle", e => { const d = e.target; if(d.matches?.(".pair")) d.open ? S.open.add(d.dataset.id) : S.open.delete(d.dataset.id); }, true);
  list.addEventListener("input", e => {
    const card = e.target.closest("[data-id]"); if(!card) return;
    const p = S.st.pairings.find(x => x.id===card.dataset.id), k = e.target.dataset.f; if(!p || !k) return;
    p[k] = e.target.type==="checkbox" ? e.target.checked : e.target.value;
    if(k==="start" && isDate(p.start)){ p.flights = formatFlights(parseFlights(p.flights), p.start); card.querySelector("[data-f=flights]").value = p.flights; }
    refreshCard(card,p); summary();
  });
  list.addEventListener("click", e => {
    if(e.target.closest("[data-link][aria-disabled]")){ e.preventDefault(); return; }
    if(!e.target.closest("[data-del]")) return;
    const id = e.target.closest("[data-id]").dataset.id; S.st.pairings = S.st.pairings.filter(x => x.id!==id); renderList();
  });
  $("#rsAdd").addEventListener("click", () => {
    const p = {id:uid(), on:true, code:"", start:"", report:"", flights:"Day 1\n"};
    if(S.st.example){ S.st.pairings = []; S.st.example = false; }
    S.st.pairings.push(p); S.open.add(p.id); renderList();
    $("#rsList").lastElementChild?.querySelector("[data-f=code]")?.focus();
  });

  wireDrop($("#rsDropCal"), $("#rsFileCal"), fs => { if(fs[0]){ S.cal = fs[0]; showThumbs(); } });
  wireDrop($("#rsDropDet"), $("#rsFileDet"), fs => { S.det.push(...fs); showThumbs(); });
  $("#rsScan").addEventListener("click", scan);
  $("#rsStop").addEventListener("click", () => { if(S.ctl){ S.ctl.stopped = true; setStatus("Stopping after the screenshots already sent…"); } });

  $("#rsStep").addEventListener("click", e => {
    if($("#rsStep").getAttribute("aria-disabled")==="true"){ e.preventDefault(); return; }
    setTimeout(() => { S.stepIdx++; if(S.root) updateStep(); }, 300);
  });
  $("#rsRestart").addEventListener("click", () => { S.stepIdx = 0; updateStep(); });
  $("#rsExport").addEventListener("click", () => {
    const first = ready()[0]?.ev.start || todayStr;
    download(new Blob([buildICS()], {type:"text/calendar"}), `pairings-${first.slice(0,7)}.ics`);
    $("#rsExStatus").textContent = 'Downloaded. See "How to import the file" below.';
  });

  const ti = $("#rsShareTitle"); ti.value = S.st.shareTitle || "Work schedule";
  ti.addEventListener("input", () => { S.st.shareTitle = ti.value; persist(); queueDraw(); });
  $("#rsShareMonth").addEventListener("input", () => { S.monthPicked = true; queueDraw(); });
  const setKind = k => {
    S.kind = k;
    S.root.querySelectorAll(".seg [data-kind]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.kind===k)));
    $("#rsShareSub").textContent = k==="flights"
      ? "Every flight in the month, pairing by pairing, with report and done times and where you're staying overnight."
      : "The month at a glance: when you start, when you finish and where you're staying overnight.";
    queueDraw();
  };
  S.root.querySelectorAll(".seg [data-kind]").forEach(b => b.addEventListener("click", () => setKind(b.dataset.kind)));
  setKind(S.kind);
  $("#rsSaveImg").addEventListener("click", async () => {
    const st = $("#rsImgStatus"); if(!S.imgBlob) return;
    const name = `${S.kind==="flights"?"flight":"work"}-schedule-${$("#rsShareMonth").value}.png`, file = new File([S.imgBlob], name, {type:"image/png"});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      try{ await navigator.share({files:[file]}); st.textContent = ""; return; }
      catch(e){ if(e.name==="AbortError") return; }
    }
    download(S.imgBlob, name); st.textContent = "Saved to your downloads.";
  });
}

window.RosterSnap = {
  mount(root, {code, api}){
    if(!document.getElementById("rsCSS")){
      const st = document.createElement("style"); st.id = "rsCSS"; st.textContent = CSS; document.head.appendChild(st);
      const ln = document.createElement("link"); ln.rel = "stylesheet"; ln.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap"; document.head.appendChild(ln);
    }
    S.root = root; S.code = code; S.api = api;
    root.innerHTML = shell();
    wire(); renderList(); showThumbs();
  },
  unmount(){ S.root = null; clearTimeout(S.drawT); if(S.ctl) S.ctl.stopped = true; }
};
})();
