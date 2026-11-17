# JARVIS Live Cyberpunk v4

Actual runnable single-page workspace and secure n8n frontend, built with dependency-free HTML, CSS, JS and native 2D Canvas perspective geometry.

**Start here:** [START_HERE_ROMAN_URDU.md](START_HERE_ROMAN_URDU.md) · Full local/voice/deployment notes: [PRODUCTION_READINESS_ROMAN_URDU.md](PRODUCTION_READINESS_ROMAN_URDU.md)

## What's new in v4

- BLUE primary, GREEN secondary, RED tertiary. Deep-black cyberpunk styling.
- Rebuilt live 3D-effect orb engine: pointer/touch drag, physical-feeling inertial spin, BOOST/RESET controls, independently moving orbital rings, glowing satellites, flowing trails, moving HUD and particle field.
- Animation continues automatically while idle; chat view includes a miniature animated core. Sidebar logo has rotating neon rings.
- Removed all three prepopulated demo projects; code migrates away only known `starter-*` project IDs from old browser storage. Actual user-created projects remain.
- Sidebar order: Projects first, Chats second; removed the old Workspace tile.
- Server-side n8n production webhook proxy, owner passcode, chat persistence, research controls and browser turn-based voice mode.
- Real-service-only chat behavior: backend failures render explicit errors and never switch to fake AI replies.

## Run

Requires Node.js 20+; no npm install needed.

```bash
npm run check
npm run dev
```

Open `http://localhost:3000`.

## Connect n8n

```bash
npm run connect
npm run dev
```

The interactive wizard writes `.env.local` locally. It requires your authenticated **production** webhook and header secret, not the temporary test URL. See `.env.example` and `START_HERE_ROMAN_URDU.md`. Never share or commit secrets.

## Deployment

The application files live at the repository root (`index.html`, `package.json`, `vercel.json`, `api/`), so Vercel can serve it with zero extra configuration:

- Framework Preset: **Other** (no build step, Output Directory = repository root).
- **Root Directory must stay empty** (repo root). Do not point it at a subfolder.
- Add `JARVIS_APP_PASSCODE`, `JARVIS_SESSION_SECRET`, `N8N_WEBHOOK_URL` and `N8N_HEADER_AUTH_SECRET` under Project Settings → Environment Variables, then redeploy.

Vercel supports plain static HTML/CSS/JS plus `/api/*.js` Node Functions. `vercel.json` includes the function configuration. Free Hobby use is limited to personal non-commercial projects and quotas.

## Actual scope & limits

This is real interactive browser animation, not a static image. It uses a **2D Canvas renderer with perspective-projected 3D geometry**, not WebGL or Three.js. Performance depends on your device; animation can be turned off in Settings. Browser voice features are turn-based and depend on browser/OS support. AI image/PDF understanding, phone calling and cross-device chat synchronization are not yet integrated. Live AI answers require reachable n8n + API providers; when unavailable, the app shows an error instead of a fake answer.

## Security notes

- The local server blocks dotfiles, including `.env.local`, from static delivery on Windows and other platforms.
- A live connection is only reported as configured when both the production webhook URL and the private `X-Assistant-Key` value are present.
- Keep the generated `.env.local` only on your machine; it is already excluded by `.gitignore`.

## Tests run

- `npm run check` (JS syntax)
- Automated OrbEngine mock-canvas test: initial draw, pointer rotation, inertia damping, boost/reset, thinking state
- Local API checks: demo response when unconfigured, and authenticated owner login → server-side header auth → mocked n8n output via private proxy

The browser in this environment blocked graphical local navigation, so automated **visual browser QA was not completed**. Open the instant demo and local server to review final appearance and interaction on your own device.
