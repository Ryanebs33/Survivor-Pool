// POST /api/admin — commissioner tools. Every call must carry the commissioner code,
// which is checked here on the server (set COMMISH_CODE in Vercel's environment variables).
import { readEntry, writeEntry, deleteEntry, writeSettings, cleanEntry, newId, publicEntry, safeEqual, send, readBody, clientIp, getStore, ensureSeeded } from "./_lib.js";

const MAX_FAILS = 10, WINDOW_SECONDS = 15*60;

export default async function handler(req, res){
  if(req.method !== "POST") return send(res, 405, {error:"Use POST."});
  try{
    await ensureSeeded();
    const b = await readBody(req);
    const s = await getStore();
    const failKey = "fail:" + clientIp(req);
    const fails = Number(await s.get(failKey) || 0);
    if(fails >= MAX_FAILS) return send(res, 429, {error:"Too many wrong codes. Wait 15 minutes and try again."});
    const code = process.env.COMMISH_CODE || "1234";
    if(!b.code || !safeEqual(b.code, code)){
      const n = await s.incr(failKey); if(n === 1) await s.expire(failKey, WINDOW_SECONDS);
      return send(res, 401, {error:"That code isn't right. Try again."});
    }
    switch(b.action){
      case "verify": return send(res, 200, {ok:true});
      case "save": {
        const {entry, error} = cleanEntry(b.entry||{});
        if(error) return send(res, 400, {error});
        const existing = b.id ? await readEntry(String(b.id)) : null;
        const id = existing ? existing.id : newId();
        const saved = {...entry, tokenHash: existing?.tokenHash || null, createdAt: existing?.createdAt || new Date().toISOString(), updatedAt:new Date().toISOString(), enteredBy:"commissioner"};
        await writeEntry(id, saved);
        return send(res, existing?200:201, {entry: publicEntry({id, ...saved})});
      }
      case "delete": {
        if(!b.id) return send(res, 400, {error:"Choose an entry to remove."});
        await deleteEntry(String(b.id));
        return send(res, 200, {ok:true});
      }
      case "deadline": {
        const d = b.deadline;
        if(d !== null && (typeof d !== "string" || isNaN(Date.parse(d)))) return send(res, 400, {error:"That date and time isn't valid."});
        await writeSettings({deadline: d, updatedAt: new Date().toISOString()});
        return send(res, 200, {deadline: d});
      }
      default: return send(res, 400, {error:"Unknown action."});
    }
  }catch(e){ send(res, e.status||500, {error: e.status ? e.message : "That didn't save. Try again."}); }
}
