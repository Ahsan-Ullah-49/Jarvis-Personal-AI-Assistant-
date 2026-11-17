# JARVIS v4 — Local Live AI, Voice aur Deployment Readiness

## Local run (Windows)

Project folder mein PowerShell kholo aur chalayein:

```powershell
node -v
npm run check
npm run dev
```

Node.js 20+ required hai. App `http://localhost:3000` par run hoti hai. Koi npm dependency install karne ki zaroorat nahi.

## Real n8n connection

Real replies activate karne ke liye project folder mein yeh command chalayein:

```powershell
npm run connect
```

Wizard ke prompts mein sirf apne local terminal mein yeh values enter karein:

1. Published n8n **Production** webhook URL — URL `/webhook/research-agent` par end honi chahiye, `/webhook-test/` nahi.
2. n8n Header Auth ki private value — header name exactly `X-Assistant-Key`.
3. Alag, strong JARVIS owner passcode (12+ characters).

Wizard `.env.local` mein `JARVIS_SESSION_SECRET` khud generate karta hai. Yeh file `.gitignore` mein excluded hai. Is ki values chat, browser console, source code ya GitHub mein kabhi paste na karein.

n8n workflow ka contract:

```json
{ "question": "Hello JARVIS! Kya haal hai bro?", "sessionId": "unique-chat-id" }
```

Response mein yeh hona chahiye:

```json
{ "output": "Main bilkul theek hoon bro!" }
```

Connection ke baad dev server stop/start karein. Browser mein passcode se unlock kar ke real message send karein. Application fake reply nahi banati: configuration ya workflow fail ho to clear **AI service unavailable** message show hota hai.

## Real AI test checklist

Configuration ke baad manually test karein:

1. Roman Urdu casual question send karein.
2. Same conversation mein follow-up send karein; n8n Simple Memory ko same `sessionId` milta hai.
3. New conversation bana kar verify karein ke naya `sessionId` use ho raha hai.
4. Recent-news question send karein aur n8n **Executions** mein confirm karein ke Tavily node execute hua.
5. n8n temporarily unavailable ho to friendly error test karein; fake response nahi aani chahiye.

Browser history aur n8n memory alag hain. Chats/projects localStorage mein is browser/device par save hote hain; cross-device sync implemented nahi hai.

## Voice mode

Voice mode browser Web Speech APIs use karta hai:

- Chrome ya Edge latest version aur `http://localhost:3000`/HTTPS use karein.
- Mic button ya Voice session mein **Start listening** press karein, browser permission Allow karein.
- English recognition supported hai; Urdu availability installed browser/OS language support par depend karti hai. Roman Urdu accuracy guaranteed nahi.
- Browser voice aur speaking rate Settings mein change ho sakte hain. Stop speaking control overlap ko prevent karta hai.
- Ye turn-based flow hai: listen → transcript → n8n → response → speech. Ye uninterrupted duplex/phone-call voice service nahi.

Common errors: `NotAllowedError` means permission blocked; `NotFoundError` means no mic; `NotReadableError` means another app mic use kar rahi hai.

## Security design

- Owner passcode server par verify hota hai.
- Session cookie `HttpOnly`, `SameSite=Strict` hai; production mein `Secure` bhi hoti hai.
- n8n header secret sirf server-side `api/chat.js` use karta hai.
- `/api/chat` valid signed session aur same-origin request ke baghair n8n ko call nahi karta.
- Input length, session-ID format, attachments aur request timeout limited hain.
- Local server dotfiles, including `.env.local`, serve nahi karta.

## Attachments and research settings

`.txt`, `.md`, `.json`, `.csv` files ka extracted text n8n request ke question context mein server-side append hota hai. Images/PDFs abhi preview-only hain; actual multimodal processing n8n workflow mein add karni hogi. Research, web-search aur effort controls preferences ki tarah n8n ko bheje jate hain; strict enforcement workflow/system prompt mein configure karna hota hai.

## Manual Vercel preparation

Deploy aap khud karein. Vercel project mein same private environment variables set karein:

- `JARVIS_APP_PASSCODE`
- `JARVIS_SESSION_SECRET`
- `N8N_WEBHOOK_URL`
- `N8N_HEADER_AUTH_SECRET`

`NEXT_PUBLIC_` prefix use na karein. `vercel.json` static frontend aur `api/*.js` Node Functions ke liye configured hai. Deploy ke baad HTTPS par login aur actual n8n reply manually test karein.

## Future portable hosting

Static files kisi bhi static host par chal sakti hain, lekin `api/auth.js` aur `api/chat.js` ko Node.js serverless functions ya always-on Node server chahiye. Hostinger ke ordinary shared PHP plans is architecture ke liye enough nahi hote; Node.js-capable hosting/function support aur secure environment-variable management required hai. Migration par n8n URL env variable se update hoti hai—frontend code mein production domain hardcoded nahi.

## Current limitations

- Real end-to-end n8n test tabhi possible hai jab local wizard se private configuration ho.
- Browser speech recognition/voices browser and OS dependent hain.
- No cross-device chat sync, telephony, continuous duplex voice, image/PDF understanding, or persistent app database.
