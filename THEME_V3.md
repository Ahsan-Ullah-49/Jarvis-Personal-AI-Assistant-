# JARVIS Cyberpunk Green v3

## What's changed
- Deep-forest green backgrounds, emerald neon, electric lime accent, green orbital canvas animation.
- Existing cinematic hero background rendered in the green palette using CSS filters (original image untouched).
- Cyberpunk green login, voice screen, settings, status indicators, message composer, chat bubbles, search and menus.
- Sidebar has two distinct areas: **Projects** and **Chat History**.
- Create / rename / delete projects; click a project to filter conversations; chats can be moved between projects from chat menu.
- Three starting folders: AI Engineering, Web Development, Research & Learning. You can rename or delete any of these.
- All conversations and projects stored in the browser's localStorage. Projects are local UI folders, not n8n-specific memory partitions.
- Export/import chat JSON includes project groupings in new exports; old exports are supported.

## Run
1. Open the extracted folder containing `package.json` in VS Code or Antigravity.
2. `npm run check`
3. `npm run dev`
4. Visit `http://localhost:3000`

### Connecting real JARVIS to n8n
Use `npm run connect` to configure the **production** n8n URL, `X-Assistant-Key` secret, and a separate owner login code. Never paste secrets into the browser code or GitHub. `QUICK_START_ROMAN_URDU.md` includes full instructions.

### Important
- Images/PDF file attachments in the UI are preview-only until n8n processes them.
- Voice mode uses browser speech APIs; availability and language accuracy depend on browser/device.
- This is a personal workspace: friends should not be given owner login credentials because system prompt may contain sensitive personal details.
- Vercel deploys frontend and proxy; n8n still needs its own online host.
