// Shared helpers for the pool API. Files starting with "_" are not exposed as routes on Vercel.
import crypto from "node:crypto";

/* ---- Pool settings the server enforces. Keep in sync with POOL in index.html. ---- */
export const MERGED = false;      // set to true once the tribes merge (allows merge picks)
export const PICKS_OPEN = true;   // set to false to close the draft regardless of the deadline

export const TRIBE = {
  aaliyah:"Toka", an:"Toka", jelly:"Toka", brady:"Toka", kilby:"Toka", devin:"Toka",
  jenna:"Toka", lewis:"Toka", maggie:"Toka", mike:"Toka", patt:"Toka",
  alexis:"Savu", ana:"Savu", carter:"Savu", cristian:"Savu", eric:"Savu",
  kristin:"Savu", linnea:"Savu", ori:"Savu", rob:"Savu", sharonda:"Savu"
};

/* ---- Storage: Upstash Redis (via Vercel Marketplace), or memory for local tests ---- */
let store;
export async function getStore(){
  if(store) return store;
  if(process.env.MEMORY_STORE === "1"){
    const kv = new Map(), hashes = new Map();
    store = {
      async get(k){ return kv.has(k) ? kv.get(k) : null; },
      async set(k,v){ kv.set(k,v); },
      async incr(k){ const n=(kv.get(k)||0)+1; kv.set(k,n); return n; },
      async expire(){},
      async hgetall(h){ const m=hashes.get(h); return m && m.size ? Object.fromEntries(m) : null; },
      async hget(h,f){ return hashes.get(h)?.get(f) ?? null; },
      async hset(h,obj){ if(!hashes.has(h)) hashes.set(h,new Map()); for(const [k,v] of Object.entries(obj)) hashes.get(h).set(k,v); },
      async hdel(h,f){ hashes.get(h)?.delete(f); }
    };
    return store;
  }
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if(!url || !token) throw Object.assign(new Error("Database is not connected. Add Upstash Redis to this Vercel project."), {status:503});
  const { Redis } = await import("@upstash/redis");
  store = new Redis({ url, token });
  return store;
}

const parse = v => typeof v === "string" ? JSON.parse(v) : v;

/* First run: bring over the picks entered on the Claude version. Runs once, ever. */
export async function ensureSeeded(){
  const s = await getStore();
  if(await s.get("seeded")) return;
  const { SEED_ENTRIES, SEED_DEADLINE } = await import("./_seed.js");
  const now = new Date().toISOString();
  const existing = await s.hgetall("entries") || {};
  const fields = {};
  for(const e of SEED_ENTRIES){
    if(existing[e.id]) continue;
    const {id, ...rest} = e;
    fields[id] = JSON.stringify({...rest, merge:null, tokenHash:null, createdAt:now, updatedAt:now, enteredBy:"commissioner"});
  }
  if(Object.keys(fields).length) await s.hset("entries", fields);
  if(!(await s.get("settings"))) await s.set("settings", JSON.stringify({deadline: SEED_DEADLINE, updatedAt: now}));
  await s.set("seeded", "1");
}

export async function readEntries(){
  const s = await getStore();
  const all = await s.hgetall("entries") || {};
  return Object.entries(all).map(([id,v])=>({id, ...parse(v)}));
}
export async function readEntry(id){
  const s = await getStore();
  const v = await s.hget("entries", id);
  return v ? {id, ...parse(v)} : null;
}
export async function writeEntry(id, entry){
  const s = await getStore();
  await s.hset("entries", {[id]: JSON.stringify(entry)});
}
export async function deleteEntry(id){ const s = await getStore(); await s.hdel("entries", id); }

export async function readSettings(){
  const s = await getStore();
  const v = await s.get("settings");
  return v ? parse(v) : {deadline:null};
}
export async function writeSettings(obj){ const s = await getStore(); await s.set("settings", JSON.stringify(obj)); }

export function picksLocked(settings){
  if(!PICKS_OPEN) return true;
  return !!(settings.deadline && Date.now() >= Date.parse(settings.deadline));
}

/* Public view of an entry: never expose the edit-token hash. */
export const publicEntry = e => ({id:e.id, name:e.name, toka:e.toka, savu:e.savu, mvp:e.mvp, merge:e.merge||null, updatedAt:e.updatedAt});

/* Validate a submitted Fantasy Tribe. Returns {entry} or {error}. */
export function cleanEntry(b){
  const name = typeof b.name === "string" ? b.name.trim().replace(/\s+/g," ").slice(0,40) : "";
  if(!name) return {error:"Enter a name."};
  const ids = (arr, tribe) => Array.isArray(arr) ? [...new Set(arr.filter(id => TRIBE[id] === tribe))] : [];
  const toka = ids(b.toka, "Toka"), savu = ids(b.savu, "Savu");
  if(toka.length !== 4) return {error:"Pick exactly four Toka castaways."};
  if(savu.length !== 4) return {error:"Pick exactly four Savu castaways."};
  const eight = [...toka, ...savu];
  if(!eight.includes(b.mvp)) return {error:"Choose your MVP from your eight castaways."};
  let merge = null;
  if(b.merge){
    if(!MERGED) return {error:"Merge picks open after the tribes merge."};
    if(!TRIBE[b.merge] || eight.includes(b.merge)) return {error:"Your merge pick must be a castaway who isn't already on your team."};
    merge = b.merge;
  }
  return {entry:{name, toka, savu, mvp:b.mvp, merge}};
}

export const newId = () => "e_" + crypto.randomBytes(9).toString("base64url");
export const newToken = () => crypto.randomBytes(18).toString("base64url");
export const hash = t => crypto.createHash("sha256").update(String(t)).digest("hex");
export function safeEqual(a, b){
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function send(res, status, body){
  res.setHeader("Content-Type","application/json");
  res.setHeader("Cache-Control","no-store");
  res.statusCode = status; res.end(JSON.stringify(body));
}
export async function readBody(req){
  if(req.body && typeof req.body === "object") return req.body;
  if(typeof req.body === "string"){ try{ return JSON.parse(req.body); }catch{ return {}; } }
  const chunks=[]; for await (const c of req) chunks.push(c);
  try{ return JSON.parse(Buffer.concat(chunks).toString("utf8")||"{}"); }catch{ return {}; }
}
export const clientIp = req => String(req.headers["x-forwarded-for"]||"").split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
