import { getConfig, secureEq, createToken, verifyToken, setSessionCookie, json, sameOrigin } from '../lib/security.js';
const failures=new Map();
export default async function handler(req,res){
 const c=getConfig();
 if(req.method==='GET')return json(res,200,{configured:c.configured,authenticated:!c.configured||verifyToken(req),live:c.configured&&c.live});
 if(req.method==='DELETE'){if(!sameOrigin(req))return json(res,403,{error:'Origin not allowed'});setSessionCookie(res,'',0);return json(res,200,{success:true})}
 if(req.method!=='POST'){res.setHeader('Allow','GET, POST, DELETE');return json(res,405,{error:'Method not allowed'})}
 if(!sameOrigin(req))return json(res,403,{error:'Origin not allowed'});
 if(!c.configured)return json(res,409,{error:'Workspace passcode and session secret are not configured.'});
 const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'client').split(',')[0];
 const hits=failures.get(ip)||{count:0,until:0};if(hits.until>Date.now())return json(res,429,{error:'Too many attempts. Please try later.'});
 const passcode=typeof req.body?.passcode==='string'?req.body.passcode:'';
 if(passcode.length>512||!secureEq(passcode,process.env.JARVIS_APP_PASSCODE)){let count=hits.count+1;failures.set(ip,{count,until:count>=6?Date.now()+60000:0});return json(res,401,{error:'Incorrect passcode'})}
 failures.delete(ip);setSessionCookie(res,createToken());return json(res,200,{authenticated:true,configured:true,live:c.live});
}
