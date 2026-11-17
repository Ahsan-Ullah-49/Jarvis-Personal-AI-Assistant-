# JARVIS Frontend + n8n Cloud: Easy setup (Roman Urdu)

**Abhi workflow n8n Cloud par rahega.** Raat ko jab laptop par migrate karo ge, sirf `N8N_WEBHOOK_URL` update karna hoga, frontend same rahega.

## Step 1: n8n mein production webhook activate karo

- n8n JARVIS workflow khol kar Webhook node open karo.
- Method `POST`; path `research-agent`; Respond: `Using 'Respond to Webhook' Node`.
- Authentication `Header Auth` select karo. Credential Header Name: `X-Assistant-Key`, Value: **random 32+ characters**. Is secret ko safe save karo. API keys ko yahan mat lagana.
- Workflow **Save + Publish** karo.
- Webhook node se **Production URL** copy karo. Ye `/webhook/research-agent` par end hona chahiye, `/webhook-test/` par nahi.
- `Respond to Webhook` node ko `First Incoming Item` rehne do: AI Agent se `output` text return ho ga.

## Step 2: Local frontend connect karo

- Extract ki hui folder ko VS Code/Antigravity mein open karo. Terminal **isi folder** mein hona chahiye, jahan `package.json` hai.
- `node -v` run karo. Node 20 ya naya hona chahiye.
- `npm run connect` run karo: prompts mein production webhook URL, n8n Header Auth secret, aur **alag owner passcode** enter karo. Ye local `.env.local` banata hai; password ya key ChatGPT ko mat bhejna.
- `npm run dev` run karo.
- Browser mein `http://localhost:3000` kholo. Passcode enter karo aur JARVIS se simple sawal poochho.
- Frontend ki request n8n ke production Webhook ko jayegi. n8n ka AI response frontend chat mein aayega.

## Step 3: Debugging if needed

- `BACKEND_NOT_CONNECTED`: `.env.local` missing/invalid; dev server restart karo.
- `401`: frontend login expired; unlock again.
- `403` from n8n, shown as `n8n returned HTTP 403`: Header Auth secret / name mismatch.
- `404` from n8n: workflow publish nahi hua, URL mein `/webhook-test/` hai, ya path ghalat hai.
- `502`: n8n AI Agent failed or no `output` was returned. n8n **Executions** mein error dekho.
- `Timeout`: OpenRouter ya Tavily request zyada der le rahi hai.
- If you need to change `.env.local`, stop server (`Ctrl+C`) and restart it.

## Share aur privacy

- Is v2 mein **sirf owner** ka access hai. Doston ko live JARVIS show karna ho to screen share karo ya saath bitha kar dikhao. Apna private passcode share na karo, kyunke AI Agent ke system prompt mein tumhari personal profile hai.
- Chat history har browser ke localStorage mein save hoti hai. Abhi mobile aur laptop chats sync nahi hoti.
- Files: txt/md/csv/json data included ho sakta hai; image/PDF sirf preview hain. True multimodal reading abhi add nahi hui.
- Research/effort controls as preferences n8n tak jate hain; strict tool-disable logic implement karne ke liye n8n workflow mein extra rules chahiye.

## Later: Vercel deployment

- GitHub push se pehle `.gitignore` mein `.env.local` ignore ho raha hai, confirm karna.
- Vercel par GitHub repository import karo. Framework `Other`; project root; dependencies nahi chahiye.
- Vercel Project Settings > Environment Variables mein ye 4 values add karo: `JARVIS_APP_PASSCODE`, `JARVIS_SESSION_SECRET`, `N8N_WEBHOOK_URL`, `N8N_HEADER_AUTH_SECRET`.
- Values ko `NEXT_PUBLIC_` ya frontend JavaScript mein mat lagana. Deploy ke baad passcode unlock karke live chat test karo.
- Vercel Hobby personal/non-commercial use ke liye free quota deta hai, aur n8n Cloud trial ki expiry alag issue hai. Apna self-hosted n8n online rakhne ke liye Windows PC + HTTPS tunnel chahiye hoga.

## Official documentation

- https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/workflow-development/
- https://vercel.com/docs/environment-variables
- https://vercel.com/docs/functions
