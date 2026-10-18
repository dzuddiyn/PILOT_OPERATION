'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(__dirname+'/TelegramQueueTest.js','utf8');
function extract(name){
 const at=source.indexOf('function '+name+'(');assert(at>=0,name);
 let pos=source.indexOf('{',at),depth=0,quote='',escape=false;
 for(let i=pos;i<source.length;i++){
  const ch=source[i];if(quote){if(escape){escape=false;continue}if(ch==='\\'){escape=true;continue}if(ch===quote)quote='';continue}
  if(ch==='"'||ch==="'"){quote=ch;continue}
  if(ch==='{')depth++;else if(ch==='}'&&--depth===0)return source.slice(at,i+1)
 }throw Error('NOT_CLOSED '+name);
}
const ctx={env:'PILOT_OPERATION',bseRuntimeEnvironmentName_:()=>ctx.env};
vm.createContext(ctx);
for(const f of ['bsePilotQueueClosedByOwner_','bseTelegramEditedWaitingInfoMatch_','bseTelegramFindActiveWaitingInfo_'])vm.runInContext(extract(f),ctx);
let passed=0;function check(name,fn){fn();passed++;console.log('PASS '+name)}
const row=(id,status,parent='')=>{const a=Array(18).fill('');a[0]=id;a[1]='913';a[2]='913';a[3]=id;a[6]=status;a[7]='SENT';a[14]=parent;a[15]='76';return a;};
check('owner closure recognises exactly PILOT terminal status',()=>{assert(ctx.bsePilotQueueClosedByOwner_(row('157','CLOSED_BY_OWNER')));assert(!ctx.bsePilotQueueClosedByOwner_(row('157','WAITING_INFO')))});
check('all three real closed ids rejected by clarification matching',()=>{for(const [id,p] of [['772257157',''],['772257174',''],['772257175','772257174']]){const r=row(id,'CLOSED_BY_OWNER',p);assert.strictEqual(ctx.bseTelegramEditedWaitingInfoMatch_([r],'913','913',id),null);assert.strictEqual(ctx.bseTelegramFindActiveWaitingInfo_([r],'913','913'),null)}});
check('waiting clarification still works normally',()=>{const r=row('200','WAITING_INFO','199');assert(ctx.bseTelegramEditedWaitingInfoMatch_([r],'913','913','200'));assert(ctx.bseTelegramFindActiveWaitingInfo_([r],'913','913'))});
check('mixed terminal and pending selects only pending',()=>{const a=row('157','CLOSED_BY_OWNER'),b=row('200','WAITING_INFO');assert.strictEqual(ctx.bseTelegramFindActiveWaitingInfo_([a,b],'913','913')[0],'200')});
check('parent and child terminal may coexist without reopening',()=>{const p=row('772257174','CLOSED_BY_OWNER'),c=row('772257175','CLOSED_BY_OWNER','772257174');assert.strictEqual(ctx.bseTelegramFindActiveWaitingInfo_([p,c],'913','913'),null)});
check('non pilot environments cannot confer owner closure classification',()=>{ctx.env='PILOT_TEST';assert(!ctx.bsePilotQueueClosedByOwner_(row('157','CLOSED_BY_OWNER')));ctx.env='PILOT_OPERATION'});
check('worker only selects queued retryable and correction waiting statuses',()=>{const worker=fs.readFileSync(__dirname+'/TelegramWorkerTest.js','utf8');assert(worker.includes("['QUEUED','RETRY_NEEDED','PROCESSING'].includes(r[6])"));assert(worker.includes("String(row[6])!=='WAITING_INFO'"));assert(!worker.includes("['QUEUED','RETRY_NEEDED','PROCESSING','CLOSED_BY_OWNER']"))});
check('no changed owner closure path writes domain records',()=>{assert(!extract('bsePilotQueueClosedByOwner_').includes('setValue('));assert(!extract('bsePilotQueueClosedByOwner_').includes('appendRow('))});
console.log('GATE_I_OWNER_CLOSURE '+passed+'/'+passed+' PASS');
