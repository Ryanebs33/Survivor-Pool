// Flying logbook for the commissioner's Flying section.
// The logbook is read live from the Google Sheet (shared "anyone with the link can view"),
// cleaned up here, and cached in Redis so a slow or failed Google request still shows the last copy.
// Crew names are dropped before anything leaves the server.
import AIRPORTS from "./_airports.js";

const SHEET_ID = process.env.FLYING_SHEET_ID || "1ZCMmqQijCSVvGJfVPMVT07s7RzBqIfXUuU6d4ITcXS4";
const SHEET_GID = process.env.FLYING_SHEET_GID || "1915993928";
const FRESH_MS = 10 * 60 * 1000;     // re-read the sheet at most every 10 minutes
const CACHE_KEY = "flying:v1";
let mem = null;                      // per-instance copy

/* ---------- CSV ---------- */
export function parseCSV(text){
  const rows = []; let row = [], cell = "", q = false;
  for(let i = 0; i < text.length; i++){
    const ch = text[i];
    if(q){
      if(ch === '"'){ if(text[i+1] === '"'){ cell += '"'; i++; } else q = false; }
      else cell += ch;
    } else if(ch === '"') q = true;
    else if(ch === ",") { row.push(cell); cell = ""; }
    else if(ch === "\n" || ch === "\r"){ if(ch === "\r" && text[i+1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  if(cell !== "" || row.length){ row.push(cell); rows.push(row); }
  return rows;
}

/* ---------- airports ---------- */
const AP = AIRPORTS.a, IATA = AIRPORTS.i, LOCAL = AIRPORTS.l;
export function airportCode(tok){
  const t = String(tok || "").toUpperCase();
  if(AP[t]) return t;
  if(t.length === 3 && IATA[t]) return IATA[t];
  if(LOCAL[t]) return LOCAL[t];
  return null;
}
// "Cadets - CZBB > CYCW > CZBB", "CYYC >. CYXH", "TC11-CEN3 > CYQF" -> legs between known airports
export function routeStops(remark){
  const s = String(remark || "");
  if(!s.includes(">")) return [];
  return s.split(">").map(part => {
    const toks = part.toUpperCase().match(/[A-Z0-9]{3,4}/g) || [];
    for(let i = toks.length - 1; i >= 0; i--){ const c = airportCode(toks[i]); if(c) return c; }
    return null;                                  // e.g. "Divert": breaks the chain
  });
}

/* ---------- dates ---------- */
const MON = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
function monthDay(s){
  s = String(s || "").trim();
  let m = /(\d{1,2})[-\s/]([A-Za-z]{3})/.exec(s);                  // 02-Jan
  if(m && MON[m[2].toLowerCase()]) return [MON[m[2].toLowerCase()], +m[1]];
  m = /([A-Za-z]{3})[-\s/](\d{1,2})/.exec(s);                      // Jan-02
  if(m && MON[m[1].toLowerCase()]) return [MON[m[1].toLowerCase()], +m[2]];
  m = /(\d{1,2})[/-](\d{1,2})\s*$/.exec(s);                        // 8/21, 9-11
  if(m) return [+m[1], +m[2]];
  return null;
}

/* ---------- logbook rows ---------- */
// Columns (0-based): 1 date, 2 type, 3 registration, 6 remarks/route,
// single engine 9 day dual, 10 day PIC, 11 night dual, 12 night PIC,
// multi engine 13 day PIC, 14 day co-pilot, 15 day dual, 16 night PIC, 17 night co-pilot, 18 night dual,
// cross-country 19-22, take-offs & landings 23 day / 24 night, instrument 25 actual / 26 hood / 27 sim, 28 IFR approaches.
const num = v => { const n = parseFloat(String(v ?? "").replace(/,/g, "")); return isFinite(n) ? n : 0; };
const r1 = n => Math.round(n * 10) / 10;

export function parseLogbook(rows){
  const flights = []; const used = new Set();
  let year = null, lastMonth = 0, lastDay = 1;
  for(const raw of rows){
    const r = raw.map(c => String(c ?? "").trim());
    const yearCell = r.slice(0, 3).find(c => /^Year\s*-\s*\d{4}/i.test(c));
    if(yearCell){ year = +/\d{4}/.exec(yearCell)[0]; lastMonth = 0; continue; }
    if(/^totals?$/i.test(r[0] || "")) continue;
    const type = (r[2] || "").toUpperCase();
    if(!type || !/[A-Z]/.test(type) || year == null) continue;
    const md = monthDay(r[1]); if(!md) continue;
    let [mo, dy] = md;
    if(mo < 1 || mo > 12) continue;
    // each "Year - XXXX" section holds one year; a date that jumps far backwards is a typo, so reuse the previous date
    if(lastMonth && mo < lastMonth - 6){ mo = lastMonth; dy = lastDay; }
    const y = year;
    lastMonth = Math.max(lastMonth, mo); lastDay = dy;
    const c = i => num(r[i]);
    const dual = c(9) + c(11) + c(15) + c(18);
    const pic = c(10) + c(12) + c(13) + c(16);
    const sic = c(14) + c(17);
    const total = dual + pic + sic;
    const sim = c(27);
    if(total <= 0 && sim <= 0) continue;
    const stops = routeStops(r[6]);
    const legs = [];
    for(let i = 1; i < stops.length; i++){
      const a = stops[i-1], b = stops[i];
      if(a && b && a !== b) legs.push([a, b]);
    }
    stops.forEach(s => s && used.add(s));
    const h = { tot:r1(total), pic:r1(pic), sic:r1(sic), dual:r1(dual),
           night:r1(c(11)+c(12)+c(16)+c(17)+c(18)), xc:r1(c(19)+c(20)+c(21)+c(22)),
           act:r1(c(25)), hood:r1(c(26)), simT:r1(sim), ldD:c(23), ldN:c(24), app:c(28) };
    for(const k in h) if(!h[k]) delete h[k];            // keep the payload small; missing = 0
    const f = { d: `${y}-${String(mo).padStart(2,"0")}-${String(dy).padStart(2,"0")}`, t: type, h };
    const reg = (r[3] || "").toUpperCase(); if(reg) f.reg = reg;
    if(legs.length) f.legs = legs;
    flights.push(f);
  }
  const airports = {};
  used.forEach(code => { airports[code] = AP[code]; });
  return { flights, airports };
}

async function fetchSheet(){
  if(process.env.FLYING_CSV_FILE){                      // local testing
    const fs = await import("node:fs");
    return fs.readFileSync(process.env.FLYING_CSV_FILE, "utf8");
  }
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
  const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 9000);
  try{
    const res = await fetch(url, { redirect: "follow", signal: ctl.signal });
    if(!res.ok) throw new Error("Sheet returned " + res.status);
    const text = await res.text();
    if(/^\s*<!doctype html|<html/i.test(text)) throw new Error("Sheet isn't shared for viewing");
    return text;
  } finally { clearTimeout(timer); }
}

export async function getFlying(store, { force = false } = {}){
  const now = Date.now();
  if(!force && mem && now - mem.fetchedAt < FRESH_MS) return mem;
  let cached = null;
  try{ cached = await store.get(CACHE_KEY); if(typeof cached === "string") cached = JSON.parse(cached); }catch(e){ cached = null; }
  if(!force && cached && now - cached.fetchedAt < FRESH_MS){ mem = cached; return cached; }
  try{
    const parsed = parseLogbook(parseCSV(await fetchSheet()));
    if(!parsed.flights.length) throw new Error("No flights found in the sheet");
    const fresh = { fetchedAt: now, stale: false, ...parsed };
    mem = fresh;
    try{ await store.set(CACHE_KEY, JSON.stringify(fresh)); }catch(e){}
    return fresh;
  }catch(err){
    if(cached){ mem = { ...cached, stale: true }; return mem; }
    throw Object.assign(new Error("Couldn't read the logbook from Google Sheets. Check that it's shared so anyone with the link can view it."), { status: 502 });
  }
}
