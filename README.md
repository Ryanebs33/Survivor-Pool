# Survivor 51 Fantasy Pool

The pool website: rules, a spoiler-gated scoreboard with power rankings, castaway bios, everyone's picks, a Submit picks page, and a code-locked Commissioner page (picks for others, pick deadline, weekly recap and scoreboard image).

## What's in here

| Path | What it does |
|---|---|
| `index.html` | The whole website. Weekly results (`EPISODES`), eliminations, expert tiers (`EXPERT`) and pool settings (`POOL`) live near the top of the script. |
| `api/state.js` | Sends the pages everyone's picks and the pick deadline. |
| `api/submit.js` | Saves a member's own picks. Each member gets a private edit link, and the deadline is enforced here. |
| `api/admin.js` | Commissioner actions. The commissioner code is checked here, on the server, and locks out after 10 wrong tries in 15 minutes. |
| `api/_seed.js` | The 17 entries and pick deadline from the Claude version. They're loaded into the database automatically the first time the site runs, and only once. |
| `api/_lib.js` | Database connection, pick validation, and the `MERGED` / `PICKS_OPEN` switches. |

## Put it online

1. **GitHub:** create a new repository and upload everything in this folder.
2. **Vercel:** go to vercel.com/new, import that repository and click **Deploy**. No build settings needed.
3. **Database:** in the Vercel project, open **Storage**, choose **Upstash → Redis** (free plan), and connect it to this project. Vercel adds the connection settings automatically.
4. **Commissioner code:** in **Settings → Environment Variables**, add `COMMISH_CODE` with your code. If you skip this, the code is `1234`.
5. **Redeploy** (Deployments → ⋯ → Redeploy) so the database and code take effect.

## Weekly updates

Add each episode to `EPISODES` in `index.html` (points per castaway and who went out). When the tribes merge, set `merged: true` in `POOL` (index.html) **and** `MERGED = true` in `api/_lib.js`. Every change pushed to GitHub goes live on Vercel automatically.
