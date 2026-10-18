'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const queue=fs.readFileSync(__dirname+'/TelegramQueueTest.js','utf8');
const worker=fs.readFileSync(__dirname+'/TelegramWorkerTest.js','utf8');
function extract(s,name){
 const start=s.indexOf('function '+name+'(');if(start<0)throw Error('MISSING '+name);
 let depth=0,quote='',esc=false;const brace=s.indexOf('{',start);
 for(let i=brace;i<s.length;i++){const c=s[i];
  if(quote){if(esc){esc=false;continue}if(c==='\\'){esc=true;continue}if(c===quote)quote='';continue}
  if(c==="'"||c==='"'||c===String.fromCharCode(96)){quote=c;continue}
  if(c==='{')depth++;else if(c==='}'&&--depth===0)return s.slice(start,i+1);
 }
 throw Error('UNCLOSED '+name)
}
let env='PILOT_OPERATION',notice='78',pass=0;
const ctx={
 bseRuntimeEnvironmentName_:()=>env,
 PropertiesService:{getScriptProperties:()=>({getProperty:key=>key==='BSE_PILOT_TRANSPLANT_NOTICE_772257174'?notice:''})},
 bseUnifiedAuditProvenance_:(original,answers)=>original+'\n'+answers.join('\n')
};
vm.createContext(ctx);
vm.runInContext(extract(queue,'bseTelegramPilotNoticeParent_'),ctx);
vm.runInContext(extract(worker,'bseTelegramReportContext_'),ctx);
function check(title,fn){fn();pass++;console.log('PASS '+title)}
const root=Array(18).fill('');
Object.assign(root,{0:'772257174',1:'913',2:'913',4:'Transplant\n- Timun\n- M5P12\n- 7/9/26',6:'WAITING_INFO',7:'SENT',15:'76',17:'2026-10-18T07:52:21.000Z'});
const reply=Array(18).fill('');
Object.assign(reply,{0:'772257180',1:'913',2:'913',4:'7/9/2026',6:'QUEUED',7:'SENT',13:'78',14:'772257174',17:'2026-10-18T09:25:00.000Z'});
check('supplement ID 78 identifies original waiting Transplant',()=>assert.strictEqual(ctx.bseTelegramPilotNoticeParent_([root],'913','913','78'),root));
check('reply 78 retains parent and source date',()=>{
 const x=ctx.bseTelegramReportContext_([root,reply],reply);
 assert(x.input.includes('7/9/2026'));assert(x.original===root[4]);
 assert(x.rootId==='772257174');assert(x.receivedAt===root[17]);
});
check('forged sender and wrong chat denied',()=>{
 assert.equal(ctx.bseTelegramPilotNoticeParent_([root],'913','999','78'),null);
 assert.equal(ctx.bseTelegramPilotNoticeParent_([root],'666','913','78'),null);
});
check('unrecognized notice ID cannot bind',()=>assert.equal(ctx.bseTelegramPilotNoticeParent_([root],'913','913','79'),null));
check('duplicated candidates fail closed',()=>assert.equal(ctx.bseTelegramPilotNoticeParent_([root,root],'913','913','78'),null));
check('no server-side receipt means no supplemental binding',()=>{
 notice='';assert.equal(ctx.bseTelegramPilotNoticeParent_([root],'913','913','78'),null);notice='78';
});
check('TEST and PILOT_TEST unchanged',()=>{
 env='TEST';assert.equal(ctx.bseTelegramPilotNoticeParent_([root],'913','913','78'),null);
 env='PILOT_TEST';assert.equal(ctx.bseTelegramPilotNoticeParent_([root],'913','913','78'),null);env='PILOT_OPERATION';
});
check('original question 76 still matches parent',()=>{
 reply[13]='76';assert.equal(ctx.bseTelegramReportContext_([root,reply],reply).rootId,'772257174');reply[13]='78';
});
check('forged parent linkage denied by context',()=>{
 reply[13]='79';assert.throws(()=>ctx.bseTelegramReportContext_([root,reply],reply),/Rujukan penjelasan/);reply[13]='78';
});
check('receiver also gates on pending status',()=>{
 assert(queue.includes('||bseTelegramPilotNoticeParent_(saved,sourceChat,reporter,replyId)'));
 assert(queue.includes("r[6]==='WAITING_INFO'"));
});
console.log('GATE_I_NOTICE_REPLY_BINDING '+pass+'/'+pass+' PASS');
