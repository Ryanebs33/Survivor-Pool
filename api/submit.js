// POST /api/submit — a pool member creates or edits their own Fantasy Tribe.
// New entries get an id + secret edit token; edits must present that token.
import { readEntry, readEntries, writeEntry, readSettings, cleanEntry, picksLocked, newId, newToken, hash, safeEqual, publicEntry, findByName, mergeChoice, send, readBody, ensureSeeded } from "./_lib.js";

export default async function handler(req, res){
  if(req.method !== "POST") return send(res, 405, {error:"Use POST."});
  try{
    await ensureSeeded();
    const b = await readBody(req);
    // Merge bonus pick by first name: allowed once per team, then locked.
    if(b.action === "merge"){
      const matches = findByName(await readEntries(), b.name);
      if(!matches.length) return send(res, 404, {error:"No team found under that name. Use the name shown on the Picks page."});
      if(matches.length > 1) return send(res, 409, {error:"More than one team matches that name. Type your full name as it appears on the Picks page."});
      const entry = matches[0], r = mergeChoice(entry, b);
      if(r.error) return send(res, r.status||400, {error:r.error});
      const updated = {...entry, ...r.set, mergeSetAt:new Date().toISOString(), updatedAt:new Date().toISOString()}; delete updated.id;
      await writeEntry(entry.id, updated);
      return send(res, 200, {entry: publicEntry({id:entry.id, ...updated})});
    }
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
      // After the lock, picks can't change here; the merge pick has its own one-time section.
      return send(res, 409, {error:"Picks are locked. Use the merge bonus pick section, or ask the commissioner."});
    }
    const {entry, error} = cleanEntry(b);
    if(error) return send(res, 400, {error});
    if(existing){
      const updated = {...entry, merge: existing.merge||null, swap: existing.swap||null, tokenHash: existing.tokenHash, createdAt: existing.createdAt, updatedAt:new Date().toISOString()};
      await writeEntry(existing.id, updated);
      return send(res, 200, {entry: publicEntry({id:existing.id, ...updated})});
    }
    const id = newId(), token = newToken();
    const created = {...entry, tokenHash: hash(token), createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()};
    await writeEntry(id, created);
    send(res, 201, {entry: publicEntry({id, ...created}), id, token});
  }catch(e){ send(res, e.status||500, {error: e.status ? e.message : "Your picks didn't save. Try again."}); }
}
