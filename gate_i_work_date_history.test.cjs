'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(__dirname+'/TelegramHistoryTest.js','utf8');
let env='PILOT_OPERATION',n=0;
const queue=[],approvals=[],audit=[];
function row(width,fields){const a=Array(width).fill('');for(const [k,v] of Object.entries(fields))a[+k]=v;return a}
for(const [id,date] of [['772257161','2026-10-15'],['772257163','2026-10-13']]){
  const result={validation:'PASS',production_write:false,candidates:[{target:'Treatment_Event_Log',fields:{event_date:date,crop:'Timun',plot_ids:['M5P1','M5P2']}}]};
  queue.push(row(18,{0:id,2:'913',5:'2026-10-18T07:00:00Z',6:'REPORTER_CONFIRMED',
    9:JSON.stringify(result),16:'{"source_chat_type":"private"}',17:'2026-10-18T06:00:00Z'}));
  approvals.push(row(26,{0:'BSE-TG-'+id,1:'BSE-TG-'+id+'|Treatment_Event_Log',
    2:'HASH',15:'2026-10-18T06:20:00Z',17:'REPORTER_CONFIRMED'}));
}
const ctx={
  console,Date,Set,Utilities:{formatDate:(v,tz,fmt)=>new Date(v.getTime()+8*3600000).toISOString().slice(0,10)},
  bseRuntimeEnvironmentName_:()=>env,
  BSE_TG_QUEUE_HEADERS:Array(18).fill(''),BSE_APPROVAL_UI_HEADERS:Array(26).fill(''),
  bseTelegramRecordReadRows_:(_,name)=>name==='TELEGRAM_TEST_QUEUE'?queue:approvals,
  bseApprovalHash_:v=>v&&v.transplant_crop_conflict?'SIDE_CAR_HASH_INVALID':'HASH',
  bseApprovalCandidateIndexFromSourceKey_:()=>null,
  bseApprovalEnvelopes_:v=>v.candidates.length===1?
    [{validation:v.validation,production_write:false,candidates:v.candidates}]:
    v.candidates.map(c=>({validation:c.validation,production_write:false,candidates:[c]})),
  bseApprovalCandidateEnvelope_:(v,i)=>({validation:v.candidates[i].validation,production_write:false,candidates:[v.candidates[i]]}),
  bseTelegramRecordCandidateCategory_:()=> 'PRIVATE_SUBMISSION',
  bseTelegramRecordSafeCandidateLine_:c=>c.target+' '+c.fields.event_date,
  SpreadsheetApp:{flush:()=>{}}
};
vm.createContext(ctx);vm.runInContext(src,ctx);
ctx.bseTelegramHistoryAccess_=()=>({ok:true,is_owner:true,reason:'OWNER_ACTIVE'});
ctx.bseTelegramHistoryEvidenceEvents_=()=>[];
ctx.bseTelegramHistoryAudit_=()=>({appendRow:r=>audit.push(r)});
function check(label,fn){fn();n++;console.log('PASS '+label)}
check('PILOT 13 October finds real 13 Oct treatment only',()=>{
  env='PILOT_OPERATION';const x=ctx.bseTelegramHistoryEventsFor_({},ctx.bseTelegramHistoryCommand_('/history 2026-10-13'),'913',true);
  assert.equal(x.length,1);assert.equal(x[0].reference,'BSE-TG-772257163');assert.equal(x[0].date,'2026-10-13');
});
check('PILOT 15 October finds other real treatment only',()=>{
  const x=ctx.bseTelegramHistoryEventsFor_({},ctx.bseTelegramHistoryCommand_('/history 2026-10-15'),'913',true);
  assert.equal(x.length,1);assert.equal(x[0].reference,'BSE-TG-772257161');
});
check('PILOT confirmation date 18 Oct does not falsely contain 13/15 Oct work',()=>{
  assert.equal(ctx.bseTelegramHistoryEventsFor_({},ctx.bseTelegramHistoryCommand_('/history 2026-10-18'),'913',true).length,0);
});
check('PILOT completed Monday-Sunday window includes 13/15 Oct operations',()=>{
  const q=ctx.bseTelegramHistoryCommand_('/history week 2 (Oct 2026)');
  assert.equal(ctx.bseTelegramHistoryEventsFor_({},q,'913',true).length,2);
});
check('PILOT day response omits report approval timestamp and keeps work date in heading',()=>{
  const q=ctx.bseTelegramHistoryRetrieve_({}, {text:'/history 2026-10-13',from:{id:913},chat:{id:913,type:'private'}});
  assert(q.text.startsWith('Sejarah operasi'));assert(q.text.includes('2026-10-13'));
  assert(q.text.includes('772257163'));assert(!q.text.includes('772257161'));
  assert(!q.text.includes('2026-10-18'));assert(!q.text.includes('Tarikh kerja:'));
});
check('PILOT weekly summary date is explicitly WORK date, never approval date',()=>{
 const x=ctx.bseTelegramHistoryEventsFor_({},ctx.bseTelegramHistoryCommand_('/history week 2 (Oct 2026)'),'913',true);
 assert(ctx.bseTelegramHistorySafeLine_(x[0]).includes('Tarikh kerja: 2026-10-13'));
 assert(!ctx.bseTelegramHistorySafeLine_(x[0]).includes('2026-10-18'));
});
check('visibility unchanged: nonreporter cannot see private operation',()=>{
 const x=ctx.bseTelegramHistoryEventsFor_({},ctx.bseTelegramHistoryCommand_('/history 2026-10-13'),'999',false);
 assert.equal(x.length,0);
});
check('TEST legacy still indexes confirmation date for strict isolation',()=>{
 env='TEST';const x=ctx.bseTelegramHistoryEventsFor_({},ctx.bseTelegramHistoryCommand_('/history 2026-10-18'),'913',true);
 assert.equal(x.length,2);assert(ctx.bseTelegramHistorySafeLine_(x[0]).startsWith('2026-10-18'));
});
check('PILOT candidate without work date cannot be invented from received_at',()=>{
 env='PILOT_OPERATION';const copy=JSON.parse(queue[0][9]);delete copy.candidates[0].fields.event_date;
 const old=queue[0][9];queue[0][9]=JSON.stringify(copy);
 const all=ctx.bseTelegramHistoryRecordEvents_({});
 assert.equal(all.length,1);assert.equal(all[0].reference,'BSE-TG-772257163');queue[0][9]=old;
});
check('PILOT source 772257188 with worker sidecar is shown on true 9 Oct work date',()=>{
 env='PILOT_OPERATION';
 const result={validation:'PASS',production_write:false,candidates:[{target:'Transplant_Event_Log',validation:'PASS',fields:{event_date:'2026-10-09',crop:'Timun',plot_ids:['M5P3','M5P4']}}],transplant_crop_conflict:{declared:' M5P34',canonical:'Timun'}};
 queue.push(row(18,{0:'772257188',2:'913',5:'2026-10-18T12:52:00Z',6:'REPORTER_CONFIRMED',9:JSON.stringify(result),16:'{"source_chat_type":"private"}'}));
 approvals.push(row(26,{0:'BSE-TG-772257188',1:'BSE-TG-772257188|Transplant_Event_Log',2:'HASH',15:'2026-10-18T12:52:44Z',17:'REPORTER_CONFIRMED'}));
 const work=ctx.bseTelegramHistoryEventsFor_({},ctx.bseTelegramHistoryCommand_('/history 2026-10-09'),'913',true);
 assert.equal(work.length,1);assert.equal(work[0].reference,'BSE-TG-772257188');
 assert.equal(work[0].date,'2026-10-09');
 assert(work[0].summary.startsWith('Pindah tanam '));
 assert(!work[0].summary.includes('Transplant_Event_Log'));
 assert.equal(ctx.bseTelegramHistoryEventsFor_({},ctx.bseTelegramHistoryCommand_('/history 2026-10-18'),'913',true).length,0);
 assert.equal(ctx.bseTelegramHistoryEventsFor_({},ctx.bseTelegramHistoryCommand_('/history 2026-10-09'),'999',false).length,0);
 approvals.pop();queue.pop();
});
check('PILOT bare-key history rejects ambiguous multi-candidate source',()=>{
 const multi={validation:'PASS',production_write:false,candidates:[{target:'Treatment_Event_Log',validation:'PASS',fields:{event_date:'2026-10-09'}},{target:'Treatment_Event_Log',validation:'PASS',fields:{event_date:'2026-10-10'}}]};
 assert.equal(ctx.bseTelegramHistoryApprovalResult_(multi,'BSE-TG-123|Treatment_Event_Log','HASH'),null);
});
check('TEST legacy remains unchanged for matched full aggregate',()=>{
 env='TEST';const result={validation:'PASS',production_write:false,candidates:[{target:'Transplant_Event_Log',fields:{event_date:'2026-10-09'}}],transplant_crop_conflict:{}};
 assert(ctx.bseTelegramHistoryApprovalResult_(result,'BSE-TG-123|Transplant_Event_Log','SIDE_CAR_HASH_INVALID'));
 env='PILOT_OPERATION';
});
check('PILOT seed history labels are readable without raw domain names',()=>{
 env='PILOT_OPERATION';
 for(const [target,label] of [['Crop_Batch_Log','Semaian'],['Planting_Event_Log','Semai benih'],['Plot_Allocation_Log','Plot tanaman'],['Transplant_Event_Log','Pindah tanam']]){
   const line=ctx.bseTelegramHistoryUserCandidateLine_({target,fields:{event_date:'2026-10-06'}});
   assert(line.startsWith(label+' '));assert(!line.includes(target));
 }
});
check('TEST history retains legacy domain labels unchanged',()=>{
 env='TEST';
 const line=ctx.bseTelegramHistoryUserCandidateLine_({target:'Transplant_Event_Log',fields:{event_date:'2026-10-09'}});
 assert(line.startsWith('Transplant_Event_Log '));
 env='PILOT_OPERATION';
});
check('PILOT structured sowing is one readable report with both plots',()=>{
 env='PILOT_OPERATION';
 const candidates=[{target:'Crop_Batch_Log',fields:{crop:'Timun',variety:'282',event_date:'2026-10-06'}},{target:'Plot_Allocation_Log',fields:{plot_id:'M5P3',event_date:'2026-10-06'}},{target:'Plot_Allocation_Log',fields:{plot_id:'M5P4',event_date:'2026-10-06'}}];
 const s=ctx.bseTelegramHistoryPilotSummary_(candidates);
 assert(s.includes('Semaian'));assert(s.includes('Tanaman: Timun'));assert(s.includes('Varieti: 282'));assert(s.includes('Plot: M5P3, M5P4'));
 assert(!s.includes('_Log'));assert(ctx.bseTelegramHistorySafeLine_({pilot_summary:s,reference:'BSE-TG-772257186',date:'2026-10-06'}).includes('Rujukan: BSE-TG-772257186'));
});
check('PILOT transplant summary uses work date and both plot ids',()=>{
 const s=ctx.bseTelegramHistoryPilotSummary_([{target:'Transplant_Event_Log',fields:{crop:'Timun',variety:'282',event_date:'2026-10-09',plot_ids:['M5P3','M5P4']}}]);
 assert(s.includes('Pindah tanam'));assert(s.includes('Tarikh kerja: 2026-10-09'));assert(s.includes('Plot: M5P3, M5P4'));
});
console.log('GATE_I_WORK_DATE_HISTORY '+n+'/'+n+' PASS');
