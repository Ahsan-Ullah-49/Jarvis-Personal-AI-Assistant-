/* Dependency-free local preview server that supports both static assets and the API routes. */
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {existsSync,readFileSync} from 'node:fs';
import auth from './api/auth.js';
import chat from './api/chat.js';
const ROOT=path.dirname(fileURLToPath(import.meta.url));
if(existsSync(path.join(ROOT,'.env.local'))){for(const line of readFileSync(path.join(ROOT,'.env.local'),'utf8').split(/\r?\n/)){const m=line.match(/^([A-Z0-9_]+)=(.*)$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].trim()}}
const mime={'.html':'text/html;charset=utf-8','.css':'text/css;charset=utf-8','.js':'text/javascript;charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.ico':'image/x-icon','.json':'application/json'};
const port=Number(process.env.PORT||3000);
const server=createServer(async(req,res)=>{
 const u=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
 if(u.pathname==='/api/auth'||u.pathname==='/api/chat'){
  let raw='';if(req.method==='POST'){for await(const chunk of req){raw+=chunk.toString();if(raw.length>800000){res.writeHead(413);res.end('Payload too large');return}}try{req.body=JSON.parse(raw||'{}')}catch{res.writeHead(400);res.end('Invalid JSON');return}}
  try{await (u.pathname==='/api/auth'?auth:chat)(req,res)}catch(e){console.error(e);res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Unexpected local server error'}))}return;
 }
 let requested;
 try{requested=decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname)}catch{res.writeHead(400);res.end('Invalid path');return}
 const file=path.resolve(ROOT,'.'+requested),relative=path.relative(ROOT,file);
 // Do not serve hidden/private files (especially .env.local). path.relative keeps
 // this correct on Windows, where filesystem paths use backslashes.
 const privateFile=relative.split(path.sep).some(part=>part.startsWith('.'));
 if(!relative||relative.startsWith('..'+path.sep)||path.isAbsolute(relative)||relative.startsWith('api'+path.sep)||privateFile){res.writeHead(404);res.end('Not found');return}
 try{const s=await stat(file);if(!s.isFile())throw Error('Not a file');res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(await readFile(file))}catch{res.writeHead(404);res.end('Not found')}
});
server.listen(port,'0.0.0.0',()=>console.log(`JARVIS ready: http://localhost:${port}\nConfigure .env.local before live AI requests.`));
