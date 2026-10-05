// GET /api/state — everything the public pages need: entries (no secrets) and the pick deadline.
import { readEntries, readSettings, publicEntry, picksLocked, MERGED, send, ensureSeeded } from "./_lib.js";

export default async function handler(req, res){
  if(req.method !== "GET") return send(res, 405, {error:"Use GET."});
  try{
    await ensureSeeded();
    const [entries, settings] = await Promise.all([readEntries(), readSettings()]);
    send(res, 200, {entries: entries.map(publicEntry), deadline: settings.deadline||null, locked: picksLocked(settings), merged: MERGED});
  }catch(e){ send(res, e.status||500, {error: e.status ? e.message : "The pool database couldn't be read."}); }
}
