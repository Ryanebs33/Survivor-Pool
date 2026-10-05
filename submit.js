// POST /api/submit — a pool member creates or edits their own Fantasy Tribe.
// New entries get an id + secret edit token; edits must present that token.
import { readEntry, writeEntry, readSettings, cleanEntry, picksLocked, newId, newToken, hash, safeEqual, publicEntry, MERGED, TRIBE, send, readBody, ensureSeeded } from "./_lib.js";

export default async function handler(req, res){
  if(req.method !== "POST") return send(res, 405, {error:"Use POST."});
  try{
    await ensureSeeded();
    const b = await readBody(req);
    const settings = await readSettings();
    const locked = picksLocked(settings);
    let existing = null;
    if(b.id){
      existing = await readEntry(String(b.id));
      if(!existing || !b.token || !safeEqual(hash(b.token), existing.tokenHash||""))
        return send(res, 403, {error:"That edit link isn't valid. Ask the commissioner to update your picks."});
    }
    if(locked){
      if(!existing) return send(res, 409, {error:"Picks are locked. Ask the commissioner if you still need to join."});
      // After the lock only the merge pick can change.
      let merge = null;
      if(b.merge){
        const eight = [...existing.toka, ...existing.savu];
        if(!MERGED || !TRIBE[b.merge] || eight.includes(b.merge)) return send(res, 400, {error:"That merge pick isn't allowed."});
        merge = b.merge;
      }
      const updated = {...existing, merge, updatedAt:new Date().toISOString()}; delete updated.id;
      await writeEntry(existing.id, updated);
      return send(res, 200, {entry: publicEntry({id:existing.id, ...updated})});
    }
    const {entry, error} = cleanEntry(b);
    if(error) return send(res, 400, {error});
    if(existing){
      const updated = {...entry, tokenHash: existing.tokenHash, createdAt: existing.createdAt, updatedAt:new Date().toISOString()};
      await writeEntry(existing.id, updated);
      return send(res, 200, {entry: publicEntry({id:existing.id, ...updated})});
    }
    const id = newId(), token = newToken();
    const created = {...entry, tokenHash: hash(token), createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()};
    await writeEntry(id, created);
    send(res, 201, {entry: publicEntry({id, ...created}), id, token});
  }catch(e){ send(res, e.status||500, {error: e.status ? e.message : "Your picks didn't save. Try again."}); }
}
