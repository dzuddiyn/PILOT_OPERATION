'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const w=fs.readFileSync(__dirname+'/TelegramWorkerTest.js','utf8'),a=fs.readFileSync(__dirname+'/TelegramApprovalUiTest.js','utf8');
function extract(s,name){const at=s.indexOf('function '+name+'(');if(at<0)throw Error('MISSING '+name);let p=s.indexOf('{',at),dep=0,quote='',escape=false;for(let i=p;i<s.length;i++){const c=s[i];if(quote){if(escape){escape=false;continue}if(c==='\\'){escape=true;continue}if(c===quote)quote='';continue}if(c==='"'||c==="'"){quote=c;continue}if(c==='{')dep++;else if(c==='}'&&--dep===0)return s.slice(at,i+1)}throw Error('UNCLOSED '+name)}
const original='- Semai\nTimun (282)\n- M5P34\n- 6/10/26',old={validation:'PASS',production_write:false,candidates:[
 {target:'Crop_Batch_Log',validation:'PASS',missing:[],fields:{event_date:'2026-10-06'}},
 {target:'Planting_Event_Log',validation:'PASS',missing:[],fields:{event_date:'2026-10-06'}},
 {target:'Plot_Allocation_Log',validation:'PASS',missing:[],fields:{plot_id:'M5P34'}}
]};
let env='PILOT_OPERATION',state,failEdit=false,checks=0;
function newState(){const queue=Array(18).fill(''),approval=Array(26).fill(''),writes=[],sent=[];
 Object.assign(queue,{0:'772257184',1:'913757987',2:'913757987',3:'101',4:original,6:'NEEDS_HUMAN_REVIEW',7:'SENT',9:JSON.stringify(old)});
 Object.assign(approval,{0:'BSE-TG-772257184',1:'BSE-TG-772257184|Crop_Batch_Log',2:'OLDHASH',7:'913757987',8:'101',9:'104',10:'12345678abcd',17:'OPEN'});
 function sheet(row){return {getLastRow:()=>2,getRange:(r,col,count,ncol)=>({
 getValues:()=>r===2&&count===1?[row.slice()]:[],
 getValue:()=>row[col-1],setValue:v=>{row[col-1]=v;writes.push({which:row===approval?'approval':'queue',col,value:v})}
 })}}
 return {queue,approval,writes,sent,qsheet:sheet(queue),asheet:sheet(approval)}
}
state=newState();
const ctx={
 bseRuntimeEnvironmentName_:()=>env,
 bseUnifiedSourceContext_:s=>({original:String(s),clarifications:[]}),
 bseTelegramQueue_:()=>state.qsheet,
 bseTelegramApprovalSheet_:()=>state.asheet,
 bseApprovalRows_:()=>[state.approval.slice()],
 bseRuntimeLegacyChatId_:()=>'913757987',
 bseRuntimeLegacyUserId_:()=>'913757987',
 bseApprovalEnvelopes_:r=>[r],
 bseApprovalHash_:r=>r.candidates.length===3?'OLDHASH':'NEWHASH',
 bseApprovalSummary_:(reference,result)=>reference+' Plot: '+result.candidates.filter(c=>c.target==='Plot_Allocation_Log').map(c=>c.fields.plot_id).join(', '),
 bseApprovalMarkupForResult_:(token)=>({inline_keyboard:[[{text:'Benar',callback_data:token}]]}),
 BSE_TG_QUEUE_HEADERS:Array(18).fill('x'),
 LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},
 SpreadsheetApp:{flush:()=>{}},
 boundTestBook_:()=>({getSheetByName:name=>name==='PILOT_CROP_BATCH'?{getLastRow:()=>1}:null}),
 bseTelegramApi_:(method,payload)=>{assert.equal(method,'editMessageText');assert.equal(state.approval[17],'CARD_REPAIR_PENDING');if(failEdit)throw Error('TELEGRAM_EDIT_DENIED');state.sent.push(payload);return {message_id:payload.message_id}},
 console
};
vm.createContext(ctx);
vm.runInContext(extract(fs.readFileSync('GeminiUnifiedTest.js','utf8'),'bseCanonicalPlotTokens_'),ctx);
vm.runInContext(extract(fs.readFileSync('GeminiUnifiedTest.js','utf8'),'bseTransplantFlexibleDate_'),ctx);
for(const name of ['bsePilotCompactSowingResult_'])vm.runInContext(extract(w,name),ctx);
for(const name of ['bsePilotSowing184RepairContext_','inspectBsePilotSowing184CardCorrection','repairBsePilotSowing184OpenCard'])vm.runInContext(extract(a,name),ctx);
function check(name,fn){fn();checks++;console.log('PASS '+name)}
check('read-only preflight on real reference and old OPEN card produces M5P3/M5P4',()=>{const r=ctx.inspectBsePilotSowing184CardCorrection();assert.equal(r.read_only,true);assert.equal(r.status,'OPEN');assert.deepEqual([...r.corrected_plots],['M5P3','M5P4']);assert.equal(state.writes.length,0)});
check('safe repair disables callbacks before Telegram edit and opens only after hash readback',()=>{const r=ctx.repairBsePilotSowing184OpenCard();assert.equal(r.status,'CARD_EDITED_AND_REOPENED');assert.equal(state.approval[17],'OPEN');assert.equal(state.approval[2],'NEWHASH');assert.equal(JSON.parse(state.queue[9]).candidates.length,4);assert.equal(state.sent.length,1);assert.equal(state.sent[0].message_id,104);assert(state.sent[0].text.includes('M5P3, M5P4'));assert(!state.sent[0].text.includes('Plot: M5P34'));assert.equal(state.writes[0].col,18);assert.equal(state.writes.at(-1).value,'OPEN')});
check('idempotency: repeated repair refuses already-correct candidate',()=>{assert.throws(()=>ctx.repairBsePilotSowing184OpenCard(),/ORIGINAL_CANDIDATE_MISMATCH/);assert.equal(state.sent.length,1)});
check('failed Telegram edit leaves card BLOCKED; no queue candidate write',()=>{state=newState();failEdit=true;assert.throws(()=>ctx.repairBsePilotSowing184OpenCard(),/TELEGRAM_EDIT_DENIED/);assert.equal(state.approval[17],'CARD_REPAIR_PENDING');assert.equal(JSON.parse(state.queue[9]).candidates.length,3);assert.equal(state.sent.length,0);failEdit=false});
check('same guarded function can reconcile pending failed edit without duplicates',()=>{const r=ctx.repairBsePilotSowing184OpenCard();assert.equal(r.status,'CARD_EDITED_AND_REOPENED');assert.equal(state.sent.length,1);assert.equal(state.approval[17],'OPEN')});
check('already-confirmed user card never edited or overwritten',()=>{state=newState();state.approval[17]='REPORTER_CONFIRMED';assert.throws(()=>ctx.repairBsePilotSowing184OpenCard(),/CARD_NOT_ELIGIBLE/);assert.equal(state.sent.length,0);assert.equal(state.writes.length,0)});
check('wrong chat/user denies candidate rewrite',()=>{state=newState();state.queue[1]='999';assert.throws(()=>ctx.repairBsePilotSowing184OpenCard(),/QUEUE_NOT_ELIGIBLE/);assert.equal(state.sent.length,0)});
check('TEST and PILOT_TEST never support one-shot live recovery',()=>{state=newState();env='TEST';assert.throws(()=>ctx.inspectBsePilotSowing184CardCorrection(),/PILOT_ONLY/);env='PILOT_TEST';assert.throws(()=>ctx.repairBsePilotSowing184OpenCard(),/PILOT_ONLY/);env='PILOT_OPERATION'});
console.log('GATE_I_SOWING_184_SAFE_REPAIR '+checks+'/'+checks+' PASS');
