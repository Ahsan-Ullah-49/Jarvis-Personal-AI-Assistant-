import { getConfig, verifyToken, json, sameOrigin } from '../lib/security.js';
const allowedModes=new Set(['auto','quick','detailed','deep_research','fact_check','compare','explain']);
const allowedSearch=new Set(['auto','on','off']);
const allowedEffort=new Set(['balanced','high','maximum']);
function needsCurrentSources(question){return /\b(this\s+(week|month|year)|today|yesterday|latest|current|recent|breaking|news|happening now|as of)\b/i.test(question)}
function validHttpUrl(u){try{let p=new URL(u);return p.protocol==='https:'|| (process.env.NODE_ENV!=='production'&&p.protocol==='http:'&&['127.0.0.1','localhost'].includes(p.hostname))}catch{return false}}
export default async function handler(req,res){
 if(req.method!=='POST'){res.setHeader('Allow','POST');return json(res,405,{error:'Method not allowed'})}
 if(!sameOrigin(req))return json(res,403,{error:'Origin not allowed'});
 const c=getConfig();
 if(!c.configured)return json(res,503,{code:'BACKEND_NOT_CONNECTED',error:'Private workspace authentication is not configured. Configure JARVIS_APP_PASSCODE and JARVIS_SESSION_SECRET.'});
 if(!verifyToken(req))return json(res,401,{error:'Session expired. Please unlock the workspace.'});
 if(!c.live||!validHttpUrl(process.env.N8N_WEBHOOK_URL))return json(res,503,{code:'BACKEND_NOT_CONNECTED',error:'A valid n8n production webhook is not configured.'});
 let b=req.body||{},question=typeof b.question==='string'?b.question.trim():'',sessionId=typeof b.sessionId==='string'?b.sessionId:'';
 if(!question||question.length>25000)return json(res,400,{error:'Please enter a question under 25,000 characters.'});
 if(!/^[a-zA-Z0-9_-]{8,90}$/.test(sessionId))return json(res,400,{error:'Invalid session ID'});
 const mode=allowedModes.has(b.mode)?b.mode:'auto',webSearch=allowedSearch.has(b.webSearch)?b.webSearch:'auto',effort=allowedEffort.has(b.effort)?b.effort:'balanced';
 const files=Array.isArray(b.textFiles)?b.textFiles.slice(0,6).filter(f=>f&&typeof f.name==='string'&&typeof f.content==='string').map(f=>({name:f.name.slice(0,100),content:f.content.slice(0,100000)})):[];
 const requiresLiveSources=webSearch==='on'||(webSearch==='auto'&&needsCurrentSources(question));
 let preferences=`\n\n[JARVIS USER SETTINGS — follow these while answering]\nResearch mode: ${mode}\nWeb search preference: ${webSearch}.\n${webSearch==='off'?'Do not call search tools.':requiresLiveSources?'LIVE RESEARCH REQUIRED: call the connected web-search tool before answering. Give 2–5 direct, reliable source URLs. Do not say web access is unavailable unless the tool was actually called and returned an error.':'Use the connected web-search tool whenever it is needed to answer accurately.'}\nReasoning effort: ${effort}.\n[/JARVIS USER SETTINGS]`;
 let fileContext=files.length?'\n\n[USER TEXT ATTACHMENTS]\n'+files.map(f=>`Filename: ${f.name}\n${f.content}`).join('\n---\n')+'\n[/USER TEXT ATTACHMENTS]':'';
 // n8n currently reads body.question; append preferences and extracted text to that field without changing the workflow.
 const payload={question:question+preferences+fileContext,sessionId,mode,webSearch,effort,requiresLiveSources};
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),52000);
 try{
  const h={'Content-Type':'application/json','Accept':'application/json'};
  if(process.env.N8N_HEADER_AUTH_SECRET)h['X-Assistant-Key']=process.env.N8N_HEADER_AUTH_SECRET;
  const r=await fetch(process.env.N8N_WEBHOOK_URL,{method:'POST',headers:h,body:JSON.stringify(payload),signal:controller.signal,redirect:'error',cache:'no-store'});
  const raw=await r.text();if(!r.ok)return json(res,502,{error:`n8n returned HTTP ${r.status}. Check your workflow execution and model quota.`});
  if(!raw.trim())return json(res,502,{error:'n8n returned an empty response. Make sure AI Agent and Respond to Webhook execute successfully.'});
  let data;try{data=JSON.parse(raw)}catch{data={output:raw}}
  let output='';if(typeof data==='string')output=data;else if(typeof data?.output==='string')output=data.output;else if(typeof data?.answer==='string')output=data.answer;else if(typeof data?.response==='string')output=data.response;else if(typeof data?.message==='string')output=data.message;else if(Array.isArray(data)&&typeof data[0]?.output==='string')output=data[0].output;
  if(!output.trim())return json(res,502,{error:'n8n response has no output or answer text. Check the Respond to Webhook node.'});
  const rawSources=Array.isArray(data?.sources)?data.sources:Array.isArray(data?.[0]?.sources)?data[0].sources:[];
  let sources=rawSources.filter(s=>s&&typeof s.url==='string'&&/^https:\/\//.test(s.url)).slice(0,12).map(s=>({title:String(s.title||s.url).slice(0,200),url:s.url}));
  return json(res,200,{output:output.slice(0,150000),sources,sessionId,demo:false});
 }catch(e){return json(res,502,{error:e.name==='AbortError'?'The n8n workflow timed out after 52 seconds.':'The n8n connection failed. Check its published production URL and credentials.'})}finally{clearTimeout(timer)}
}
