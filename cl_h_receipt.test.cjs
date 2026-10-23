'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path'),test=require('node:test');
const source=fs.readFileSync(path.join(__dirname,'TelegramApprovalUiTest.js'),'utf8');
const needle='function bseTelegramReporterConfirmationCore_(',i=source.lastIndexOf(needle),j=source.indexOf('\nfunction ',i+needle.length);
assert(i>=0);
let env='PILOT_OPERATION',domain='Transplant_Event_Log',reporter='dzuddiyn',calls=[];
const candidate={target:'Transplant_Event_Log',fields:{operation_type:'HARVEST_START'}},parsed={validation:'PASS',production_write:false,candidates:[candidate]};
const card=['BSE-TG-TEST','BSE-TG-TEST|Transplant_Event_Log','hash','1234','','','','-100111','900','901','TESTTOKEN'];
while(card.length<18)card.push('');card[17]='OPEN';
const q=Array(18).fill('');q[0]='TEST';q[9]=JSON.stringify(parsed);
const s={console,Date,JSON,Number,Set,BSE_TG_QUEUE_HEADERS:Array(18).fill(''),SpreadsheetApp:{flush(){}},
 bseRuntimeEnvironmentName_:()=>env,bseTelegramApprovalSheet_:()=>({getRange:()=>({setValues(){}})}),bseApprovalRows_:()=>[card],
 bseTelegramReporterCardAuthorized_:()=>true,bseTelegramQueue_:()=>({getLastRow:()=>2,getRange:()=>({getValues:()=>[q]})}),
 bseApprovalCandidateIndexFromSourceKey_:()=>null,bseApprovalEnvelopes_:()=>[parsed],bseApprovalHash_:()=> 'hash',
 bseApprovalDomain_:()=>({target:domain,core:()=>({production_write:false})}),bseApprovalRecomputeQueueStatus_:()=> 'REPORTER_CONFIRMED',
 bseTelegramPilotConfirmedTransplant_:()=> 'REKOD PINDAH ANAK POKOK DISAHKAN\nRujukan: BSE-TG-TEST\nPlot: M3P3, M3P4',
 bseOperationConfirmedSummary_:()=> 'REKOD OPERASI\nRujukan: BSE-TG-TEST\nPlot: M3P3\nJenis operasi: Mula Tuai',
 bseTelegramConfirmedPersistedSummary_:()=> 'TEST_ONLY',
 bseTelegramApprovalCloseCard_:(r,status,actor,text)=>calls.push({kind:'edit',text}),
 bseTelegramReporterReceipt_:()=>calls.push({kind:'receipt'}),bseTelegramOwnerNotice_:()=>calls.push({kind:'owner'}),
 bseTelegramReporterDisplayName_:()=>reporter,bseTelegramPilotConfirmedOwnerNotice_:()=> 'TEST_ONLY_OWNER_NOTICE'};
vm.createContext(s);vm.runInContext(source.slice(i,j<0?source.length:j),s);
function run(){calls=[];card[17]='OPEN';s.bseTelegramReporterConfirmationCore_({}, {actor_name:'fallback',actor_id:'1234'},{token:'TESTTOKEN',kind:'A',callback:{message:{chat:{id:-100111},message_id:901}}});return calls;}
test('PILOT transplant updates only original card, human readable and reporter',()=>{domain='Transplant_Event_Log';const x=run();assert.deepEqual(x.map(v=>v.kind),['edit']);assert.match(x[0].text,/REKOD PINDAH/);assert.match(x[0].text,/Pelapor: dzuddiyn/);});
test('PILOT mula tuai updates only original card and reporter',()=>{domain='Operation_Log';const x=run();assert.deepEqual(x.map(v=>v.kind),['edit']);assert.match(x[0].text,/Mula Tuai/);assert.match(x[0].text,/Pelapor: dzuddiyn/);});
test('PILOT reporter name sanitized',()=>{reporter='ali\n<user>';const x=run();assert.match(x[0].text,/Pelapor: ali user/);reporter='dzuddiyn';});
test('TEST environment retains existing separate notifications',()=>{env='TEST';domain='Operation_Log';assert.deepEqual(run().map(v=>v.kind),['edit','receipt','owner']);env='PILOT_OPERATION';});
