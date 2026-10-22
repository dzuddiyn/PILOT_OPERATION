'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'TelegramApprovalUiTest.js'),'utf8');
const unrecognized=fs.readFileSync(path.join(__dirname,'PilotUnrecognizedTest.js'),'utf8');
const latest=(name)=>{const needle='function '+name+'(';const i=source.lastIndexOf(needle);assert(i>=0,'missing '+name);const j=source.indexOf('\nfunction ',i+needle.length);return source.slice(i,j<0?source.length:j);};
const calls=[],records=[];
let target='Plant_Census_Log',userDisplay='dzuddiyn',env='PILOT_OPERATION';
const parsed={validation:'PASS',production_write:false,candidates:[{target:'Plant_Census_Log',validation:'PASS',fields:{}}]};
const approval=['BSE-TG-772257625','BSE-TG-772257625|Plant_Census_Log','hash','1234','','','','-100333','900','901','abcdTOK123'];
while(approval.length<18)approval.push('');approval[17]='OPEN';
const q=Array(18).fill('');q[0]='772257625';q[9]=JSON.stringify(parsed);
const sheet={getRange:(r,c)=>({setValues(v){records.push({r,c,v});return this;}})};
const context={console,Date,JSON,Number,Set,BSE_TG_QUEUE_HEADERS:Array(18).fill(''),
 bseRuntimeEnvironmentName_:()=>env,
 bseTelegramApprovalSheet_:()=>sheet,bseApprovalRows_:()=>[approval],
 bseTelegramReporterCardAuthorized_:()=>true,bseTelegramQueue_:()=>({
   getLastRow:()=>2,getRange:()=>({getValues:()=>[q]})
 }),
 bseApprovalCandidateIndexFromSourceKey_:()=>null,
 bseApprovalEnvelopes_:()=>[parsed],
 bseApprovalHash_:()=> 'hash',
 bseApprovalDomain_:()=>({target,core:()=>({production_write:false})}),
 bseApprovalRecomputeQueueStatus_:()=> 'REPORTER_CONFIRMED',
 bseCensusConfirmedSummary_:()=> 'REKOD BANCI POKOK\nRujukan : BSE-TG-772257625\nModul : M5P3\nMati : 0\nSakit : 654\nStatus : REPORTER_CONFIRMED',
 bseClaimConfirmedSummary_:()=> 'REKOD CLAIM',
 bseTelegramConfirmedPersistedSummary_:()=> 'SAVED',
 bseTelegramApprovalCloseCard_:(row,status,actor,text)=>calls.push({kind:'edit',status,actor,text}),
 bseTelegramReporterReceipt_:(...args)=>calls.push({kind:'receipt',args}),
 bseTelegramOwnerNotice_:(...args)=>calls.push({kind:'owner',args}),
 bseTelegramReporterDisplayName_:()=>userDisplay,
 bseTelegramPilotConfirmedOwnerNotice_:()=> 'notice',
 SpreadsheetApp:{flush(){}}
};
vm.createContext(context);
vm.runInContext(latest('bseTelegramReporterConfirmationCore_'),context);
vm.runInContext(unrecognized,context);
let passed=0;const t=(name,fn)=>{fn();passed++;console.log('PASS '+name)};
const trigger=()=>{calls.length=0;records.length=0;approval[17]='OPEN';return context.bseTelegramReporterConfirmationCore_({}, {actor_name:'fallback_name',actor_id:'1234'}, {token:'abcdTOK123',kind:'A',callback:{message:{chat:{id:-100333},message_id:901}}});};
t('Banci confirmation updates one card only, with user reporter name',()=>{
 const r=trigger();assert.equal(r.production_write,false);
 assert.deepEqual(calls.map(x=>x.kind),['edit']);
 assert.match(calls[0].text,/Pelapor : dzuddiyn/);
 assert.match(calls[0].text,/Mati : 0/);
 assert.match(calls[0].text,/BSE-TG-772257625/);
});
t('reporter name is sanitized without extra Telegram messages',()=>{
 userDisplay='n\nother';trigger();
 assert.equal(calls[0].text.split('Pelapor : ')[1],'n other');
 userDisplay='dzuddiyn';
});
t('non-Census modules retain existing reporter and owner notices',()=>{
 target='Claim_Request_Log';trigger();
 assert.deepEqual(calls.map(x=>x.kind),['edit','receipt','owner']);
 target='Plant_Census_Log';
});
t('non-PILOT behavior retains notices',()=>{
 env='TEST';trigger();
 assert.deepEqual(calls.map(x=>x.kind),['edit','receipt','owner']);
 env='PILOT_OPERATION';
});
t('unrecognized punctuation phrase gets short fixed answer',()=>{
 assert(context.bsePilotUnrecognizedPlainText_('jshdgjsdgk,sdg isk'));
 assert(context.bsePilotUnrecognizedPlainText_('merapu'));
 assert.match(context.bsePilotUnrecognizedMessage_('BSE-TG-772257627'),/Mesej tidak dapat dikenal pasti/);
});
t('real reports/commands are not consumed as unrecognized garbage',()=>{
 for(const x of ['REKOD BANCI POKOK','Sakit: 654','claim racun','Semai Peria','status','/status','M5P3','beli baja','Mati 12','10/10/2026'])
  assert(!context.bsePilotUnrecognizedPlainText_(x),'Unexpected unknown '+x);
});
t('unrecognized is PILOT only and never invokes Gemini',()=>{
 env='TEST';assert(!context.bsePilotUnrecognizedPlainText_('jshdgjsdgk,sdg isk'));env='PILOT_OPERATION';
 assert(!/Gemini|sendMessage|appendRow|insertSheet/.test(unrecognized));
});
t('field update makes no new census domain writer or replay path',()=>{
 const span=latest('bseTelegramReporterConfirmationCore_');
 assert(span.includes('if(!censusSingle)'));
 assert(span.includes('bseTelegramApprovalCloseCard_'));
 assert(!span.includes('appendRow'));
});
console.log('GI_UX_03_FIELD_SINGLE_RECEIPT_UNKNOWN '+passed+'/'+passed+' PASS');
