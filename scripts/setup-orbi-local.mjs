import {readFile,writeFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
// Run only on the owner's workstation. No values are printed or sent anywhere.
const destination='.env.local';
try{await readFile(destination);console.log('Private local configuration already exists; left unchanged.');process.exit(0);}catch(e){if(e.code!=='ENOENT')throw e;}
const reference=process.argv[2];let bot={};
if(reference){bot=JSON.parse(await readFile(reference,'utf8'));if(!/^https:\/\/api2\.cursor\.sh\/automations\/webhook\/[a-zA-Z0-9-]+$/.test(bot.webhook_url||'')||!bot.webhook_key||/\s/.test(bot.webhook_key))throw new Error('Invalid private bot configuration');}
const lines={ORBI_ENABLED:'false',ORBI_LOCAL_ENABLED:'false',OPENAI_API_KEY:'',ORBI_SESSION_SECRET:randomBytes(48).toString('hex'),GROKBOT_WEBHOOK_URL:bot.webhook_url||'',GROKBOT_WEBHOOK_KEY:bot.webhook_key||'',GROKBOT_AUTHORIZATION_HEADER:bot.authorization_header||'',ORBI_MODEL:'gpt-6-luna'};
await writeFile(destination,'# Private configuration. Never commit, share, or place in public/.\n'+Object.entries(lines).map(([key,value])=>key+'='+JSON.stringify(value)).join('\n')+'\n',{flag:'wx',mode:0o600});
console.log('Private local configuration prepared. OpenAI key is empty; live connections remain disabled.');
