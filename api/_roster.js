// Roster Snap: reads one 360pairings screenshot with Claude and returns the JSON the page needs.
// Called only from /api/admin (commissioner code required). Needs ANTHROPIC_API_KEY in Vercel's environment variables.

const PROMPTS = {
  calendar: today => `This image is a monthly airline crew calendar from 360pairings. Each dark blue bar or circle is one pairing: a circle is a one-day pairing, a bar spans the days the pairing covers. Today is ${today}.
Reply with only JSON: {"pairings":[{"start":"YYYY-MM-DD","days":1,"label":"DCA"}]}
- start: the date of the day where the bar or circle begins, using the month and year in the header.
- days: how many calendar days the bar covers, counting a partly covered last day.
- label: the text on the bar or circle, e.g. "DCA" or "410 → YOW".
List them in date order.`,
  details: () => `This image shows the details panel for one airline pairing from 360pairings. Read it exactly.
Reply with only JSON: {"code":"Z7041","duration":2,"report":"07:00","start_date":null,"days":[{"legs":[{"dh":false,"flight":"8020","from":"YYZ","to":"YQY","dep":"08:00","arr":"11:30"}]}]}
- code: the pairing number at the top of the panel, like Z7041.
- duration: the Pairing Duration number.
- report: the Reporting Time, 24-hour HH:MM.
- start_date: only if the panel itself shows a calendar date for Day 1, as YYYY-MM-DD; otherwise null. Do not use the calendar in the background.
- days: one entry per "Day N" block, in order, with legs in the order listed.
- flight: the flight number exactly as shown, e.g. "8020" or "AC_00440", without any DH marker.
- dh: true if that flight line is marked DH (deadhead).
- dep and arr: the times exactly as shown, 24-hour HH:MM.`
};

const fail = (status, message) => Object.assign(new Error(message), { status });

function parseJSON(text){
  const t = String(text || "").trim();
  try { return JSON.parse(t); } catch {}
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if(fence){ try { return JSON.parse(fence[1]); } catch {} }
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if(a >= 0 && b > a){ try { return JSON.parse(t.slice(a, b + 1)); } catch {} }
  return null;
}

export async function readRoster(b){
  const key = process.env.ANTHROPIC_API_KEY;
  if(!key) throw fail(503, "Screenshot reading isn't set up yet. Add ANTHROPIC_API_KEY in Vercel's environment variables, then redeploy.");
  const prompt = PROMPTS[b.kind];
  if(!prompt) throw fail(400, "Unknown screenshot type.");
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(b.image || ""));
  if(!m) throw fail(400, "That file isn't a JPEG, PNG or WebP image.");
  if(m[2].length > 4_000_000) throw fail(413, "That screenshot is too large. Try a smaller one.");
  const today = /^\d{4}-\d{2}-\d{2}$/.test(b.today || "") ? b.today : new Date().toISOString().slice(0, 10);

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.ROSTER_MODEL || "claude-sonnet-5-5",
      max_tokens: 4000,
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: m[1], data: m[2] } },
        { type: "text", text: prompt(today) }
      ]}]
    })
  });
  const data = await r.json().catch(() => ({}));
  if(!r.ok){
    if(r.status === 401) throw fail(502, "The Anthropic API key was rejected. Check ANTHROPIC_API_KEY in Vercel.");
    if(r.status === 429) throw fail(429, "Too many screenshots at once. Wait a minute and try again.");
    throw fail(502, "Claude couldn't read that screenshot. Try again.");
  }
  const text = (data.content || []).filter(c => c.type === "text").map(c => c.text).join("");
  const result = parseJSON(text);
  if(!result) throw fail(502, "Claude's answer for that screenshot was unreadable. Try again.");
  return { result };
}
