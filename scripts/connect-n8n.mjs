/**
 * Private, local connection wizard. Does not make network requests.
 * Keep .env.local out of Git; the project .gitignore already ignores it.
 */
import { createInterface } from 'node:readline/promises';
import { randomBytes } from 'node:crypto';
import { writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'.env.local');
const rl=createInterface({input:process.stdin,output:process.stdout});
function clean(s){return String(s||'').trim()}
function validateValue(s,label){if(!s||/[\n\r]/.test(s))throw Error(`Invalid ${label}`);return s}
function validWebhook(s){try{const u=new URL(s);return u.protocol==='https:'&&u.pathname.startsWith('/webhook/')&&!u.pathname.startsWith('/webhook-test/')&&!!u.hostname}catch{return false}}
function print(text){process.stdout.write(text+'\n')}
try{
  print('\nJARVIS / CONNECT TO n8n CLOUD\n');
  print('BEFORE THIS: Publish the n8n workflow and set the Webhook to Header Auth.');
  print('Do not enter your OpenRouter or Tavily API keys here.');
  try{await access(file,constants.F_OK);let confirmation=clean(await rl.question('\n.env.local already exists. Replace it? type YES to continue: '));if(confirmation!=='YES'){print('Existing file kept.');process.exit(0)}}catch(e){if(e.code!=='ENOENT')throw e}
  const suggested='https://miang1.app.n8n.cloud/webhook/research-agent';
  let webhook=clean(await rl.question(`\nProduction Webhook URL [${suggested}]: `))||suggested;
  if(!validWebhook(webhook))throw Error('Webhook must be HTTPS and contain /webhook/, NOT /webhook-test/.');
  print('\nPaste the random value from n8n Webhook Header Auth credential (name X-Assistant-Key).');
  let headerSecret=validateValue(clean(await rl.question('Header Auth value: ')),'Header Auth secret');
  if(headerSecret.length<16)throw Error('For security, use a random header secret of at least 16 characters.');
  print('\nCreate a separate password for YOU to unlock the local frontend. Do not reuse your API key.');
  let passcode=validateValue(clean(await rl.question('Private JARVIS frontend passcode (at least 12 characters): ')),'passcode');
  if(passcode.length<12)throw Error('Choose a longer frontend passcode (12+ characters).');
  if(passcode===headerSecret)throw Error('The frontend passcode and n8n header secret must be different.');
  const sessionSecret=randomBytes(40).toString('hex');
  const body=`# Generated locally for private development. NEVER commit this file.\nJARVIS_APP_PASSCODE=${passcode}\nJARVIS_SESSION_SECRET=${sessionSecret}\nN8N_WEBHOOK_URL=${webhook}\nN8N_HEADER_AUTH_SECRET=${headerSecret}\n`;
  await writeFile(file,body,{mode:0o600});
  print('\nSUCCESS: .env.local created. No credentials were sent to this assistant.');
  print('Next: npm run dev  then  http://localhost:3000');
  print('If the local server is already open, stop/restart it after configuration.\n');
}catch(e){print('\nNot saved: '+e.message);process.exitCode=1}finally{rl.close()}
