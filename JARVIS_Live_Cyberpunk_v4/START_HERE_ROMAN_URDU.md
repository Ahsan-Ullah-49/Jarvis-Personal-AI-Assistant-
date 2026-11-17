# JARVIS Live Cyberpunk v4 — Start Yahan Se

Bro, ye ACTUAL runnable frontend hai, concept picture nahi.

## 1. PC par chalana

1. `JARVIS_Live_Cyberpunk_v4.zip` ko extract karo.
2. Antigravity / VS Code mein **andar wala JARVIS_Live_Cyberpunk_v4 folder** open karo. Yahin `package.json` hona chahiye.
3. Terminal kholo. Check: `node -v` (Node.js 20+).
4. Run: `npm run dev`
5. Browser mein `http://localhost:3000` open karo.

**npm install ki zaroorat nahi.** Agar `Missing script: dev` aaye to tum galat folder mein ho: us folder ko open karo jahan `package.json` rakha hai.

### Instant preview
`JARVIS_Live_Cyberpunk_v4_Demo.html` browser mein open karne se design check kar sakte ho, lekin ye single-file **demo only** hai. Ismein real n8n integration enabled nahi hai. Android local file se microphone permission aksar block ho sakti hai. Proper local webserver/HTTPS par voice zyada reliable rehti hai.

## 2. Animation ko use karna

- Orb ko mouse ya finger se pakro aur ghumao. Release par inertia se spin continue hogi.
- `BOOST` se core ko tezi se spin karo; `RESET` initial angle restore karega.
- Core idle mein bhi move hota rehta hai. Chat khulne ke baad ek chhota animated core bhi nazar aata hai.
- JARVIS logo, particles, glowing rings, HUD scanning and background naturally animate.
- Settings se Core animation ON/OFF kar sakte ho.

## 3. Projects and chats

- Sidebar mein **Projects** upar hai, Chats neeche.
- Koi demo/dummy project nahi. Sirf `+` se apna project banao.
- Project create, rename aur delete ho sakta hai. Chats ko existing projects mein move kar sakte ho.
- Local chats aur projects usi browser ke localStorage mein saved rehte hain. Mobile/PC cloud sync abhi nahi hai.

## 4. Apne working n8n Production Webhook se connect karna

Ye wohi existing workflow use karega jo Postman mein 200 OK aur `{"output":"..."}` deta hai.

1. n8n workflow **Published** hona chahiye.
2. n8n Webhook **POST** ho aur **Respond = Using Respond to Webhook Node**.
3. n8n Webhook authentication **Header Auth** ho: header NAME `X-Assistant-Key`, secret VALUE private rakho.
4. Terminal mein `npm run connect` run karo. Guided wizard production URL (`.../webhook/research-agent`, NOT `/webhook-test/`), wohi Header Auth secret, owner passcode aur session secret mangega.
5. Ye secrets sirf PC ki `.env.local` file mein save honge. **GitHub par `.env.local` upload mat karna**.
6. `npm run dev` restart karo, passcode se login karo aur message bhejo.
7. Vercel par deploy karne ke liye `.env.example` wali same environment variables Vercel **Project Settings > Environment Variables** mein set karo. Vercel Free `*.vercel.app` domain mil sakta hai. Hobby personal non-commercial usage restrictions aur quotas apply karte hain.

**Important security:** Frontend ka public JavaScript n8n secret contain nahi karta. `api/chat.js` server-side Vercel Function ke through `X-Assistant-Key` forward karta hai. Owner passcode aur signed HttpOnly cookie use hoti hai. Ye personal owner prototype hai, public multi-user SaaS authentication nahi.

## 5. Kya real kaam karta hai?

- Frontend, animations, sidebar, projects, chat composer, search, settings: YES.
- Live n8n reply: ONLY after `.env.local` / Vercel environment variables configured and your n8n trial/cloud running.
- Real voice calling / telephone, continuous voice streaming, PDF/image AI understanding: NOT included.
- Mic dictation: browser compatibility aur permissions par depend.
- Sidebar chat history: local browser storage, cross-device synced nahi.

## 6. Troubleshooting

- `npm: command not found`: Node.js install karo.
- `Missing script: dev`: sahi project folder open karo.
- `Port 3000 in use`: doosra server band karo ya `PORT=3001` environment var use karo.
- `DEMO MODE`: private webhook environment variables missing hain.
- `401`: owner session expire ya passcode wrong.
- `502`: n8n workflow response, URL, credential ya quota check karo.
- Local n8n/cloud moving ke liye production URL update karna hoga; UI ko change nahi karna.
