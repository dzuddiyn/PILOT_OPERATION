'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
let logs=[],sent=[],queueWrites=0,offset='';
const ctx={
 console:{log:v=>logs.push(String(v))},
 SpreadsheetApp:{flush(){}},
 PropertiesService:{getScriptProperties:()=>({getProperty:n=>n==='BSE_TELEGRAM_OFFSET'?'0':'',setProperty:(n,v)=>{if(n==='BSE_TELEGRAM_OFFSET')offset=v}})},
 LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})},
 UrlFetchApp:{},DriveApp:{},ScriptApp:{},Session:{}
};
vm.createContext(ctx);
for(const file of fs.readdirSync(__dirname).filter(f=>f.endsWith('.js')).sort())
 vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),ctx,{filename:file,timeout:4000});
ctx.boundTestBook_=()=>({});
ctx.bseRuntimeEnvironmentName_=()=> 'PILOT_OPERATION';
ctx.bseRuntimeLegacyChatId_=()=> '12345';
ctx.bseRuntimeLegacyUserId_=()=> '12345';
ctx.bseRuntimeBotUsername_=()=> 'PilotBotTest';
ctx.bseRuntimeEnvironmentLabel_=()=> 'PILOT_OPERATION';
ctx.bseTelegramTestApprovalGroupIds_=()=>[];
ctx.bseTelegramQueue_=()=>({getLastRow:()=>1,getRange:()=>{queueWrites++;throw Error('GENERIC_COMMAND_QUEUE_FALLBACK')}});
ctx.bseTelegramServiceMessage_=()=>false;
ctx.bseTelegramPrivateOptInCommand_=()=>false;
ctx.bseTelegramApprovalRejectPromptMatch_=()=>null;
ctx.bseInventoryFindClarificationPrompt_=()=>null;
ctx.bseInventoryFindActiveClarificationPrompt_=()=>null;
ctx.bseTelegramCorrectionSessionMatch_=()=>({match:null,ambiguous:false});
ctx.bseTelegramRegistrationPrivateAccess_=(b,m)=>({status:m.from.id===12345?'OWNER_ACTIVE':'NOT_REGISTERED_ACTIVE'});
ctx.bseTelegramPlotStatusSummary_=()=>({kind:'UNIQUE',crop:'Cucumber',batch_id:'B',allocation_status:'ACTIVE',census:null,treatment:null});
const audit=[];
ctx.bseTelegramPlotStatusAudit_=()=>({appendRow:r=>audit.push(r)});
for(const f of ['processBseTelegramApprovalCallbacks','processBseTelegramRegistrationCallbacks','processBseImageActionCallbacksTest','processBseImageProcessingCallbacksTest','processBseTelegramEvidenceCallbacks','processBseTelegramInventoryClarificationReplies'])ctx[f]=()=>null;
let nextText='',who=12345;
ctx.bseTelegramApi_=(method,args)=>{
 if(method==='getMe')return {username:'PilotBotTest'};
 if(method==='getWebhookInfo')return {url:''};
 if(method==='getUpdates')return [{update_id:910001,message:{message_id:71,date:1792511100,text:nextText,chat:{id:who,type:'private'},from:{id:who,is_bot:false}}}];
 if(method==='sendMessage'){sent.push(args);return {message_id:72};}
 throw Error('UNEXPECTED_TELEGRAM_CALL '+method);
};
let passed=0;
function check(name,text,expected,actor=12345){
 sent=[];logs=[];queueWrites=0;offset='';who=actor;nextText=text;
 ctx.receiveBseTelegramTest();
 assert.equal(sent.length,1,'must send exactly one PM reply');
 assert.equal(String(sent[0].chat_id),String(actor));
 assert.equal(sent[0].reply_parameters.message_id,71);
 assert.ok(sent[0].text.includes(expected),sent[0].text);
 assert.equal(queueWrites,0,'must never enter COMMAND queue');
 assert.equal(offset,'910002');
 assert.ok(logs.some(v=>v.includes('PILOT_SUMMARY_ROUTED')),'observed runtime route event');
 assert.ok(!sent[0].text.includes('sedia menerima laporan teks'));
 console.log('PASS '+name);passed++;
}
check('LIVE regression bare /summary shows usage instead of generic','/summary','Cara guna /summary');
check('LIVE regression /summary M3P34 shows 2-plot rumusan','/summary M3P34','RUMUSAN PLOT');
check('short comma pair shows rumusan','/summary M3P3,4','RUMUSAN PLOT');
check('invalid plot shows usage','/summary M3P33','Cara guna /summary');
check('unauthorized PM cannot read plot','/summary M3P34','ahli aktif',9876);
assert.equal(audit.filter(a=>a[4]==='SENT').length,2,'only two valid authorized summaries audited');
console.log('GI_SUMMARY_RECEIVER_INTEGRATION '+passed+'/'+passed+' PASS FULL_RECEIVER_SIMULATED_UPDATES');
