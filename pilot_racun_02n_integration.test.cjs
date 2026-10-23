'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),test=require('node:test');
const ctx={Date,JSON,Map,Set,Error,String,Number,bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',bseTreatmentListDate_:()=> '2026-10-19',bseCropBatchPlotCompare_:(a,b)=>a.localeCompare(b)};
vm.createContext(ctx);
const src=fs.readFileSync(__dirname+'/TreatmentReviewTest.js','utf8');
vm.runInContext(src.slice(src.indexOf('function bsePilotRacunNumberedSections_('),src.indexOf('function bseTreatmentListParseMessage_(')),ctx);
for(const f of ['PilotRacunSourceAssessment.js','PilotRacunAtomicPlan.js','PilotRacunJournal.js','PilotRacunApprovalReconcile.js','PilotRacunApprovalTransition.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
const report=`Racun
19/10/2026
Isnin
PETANG
1. M3 - P34 TIMUN (51 hst)
Dynamec-180
Mancozeb - 500
Top plus- 140
calcium- 300
2. M7 - Peria (48 hst)
Madell 500
Mancozeb 500
Top plus 140
cy787 300
4.M4P12 Peria (43 hst)
Madell 500
Mancozeb 500
Top plus 140
cy787 300
5. M1P1,2
dynamec -180
Mancozeb - 500
Top plus- 140
calcium- 300
6. M1 -P34 TIMUN (22 hst)
dynamec- 180
7. M2 - P34 PERIA (28 Hst)
Madell-500
Mancozeb-500
Top plus-140
cy787-300
8. M5 - P34 TIMUN (9 Hst)
dynamec-20
9. M5 - P12 TIMUN (12 Hst)
dynamec -20
10. M6 - P12 PERIA (13 Hst)
dynamec - 180
11. M2 - P12 PERIA (6 Hst)
dyna mec-20
axtraroots-60`;
test('ten groups: failed 5th write recovers; approval only after final read-back, replay idempotent',()=>{
 const result=ctx.bsePilotRacunNumberedSections_(report);
 assert.equal(ctx.bsePilotRacunSourceAssessment_(result).status,'SOURCE_COMPLETE_STORAGE_BLOCKED');
 const plan=ctx.bsePilotRacunAtomicPlan_(result,'BSE-TG-999001');
 const rows=[],journal=new Map();let count=0,fail=true;
 const adapter={lock:fn=>fn(),getJournal:k=>journal.get(k)||null,createJournal:(k,v)=>journal.set(k,{...v}),readRows:()=>rows.map(r=>({...r})),appendRow:r=>{rows.push({...r});if(++count===5&&fail)throw Error('INJECTED_5');},setJournal:(k,status)=>journal.get(k).status=status,flush:()=>{}};
 const approvalState={hash:'approved-hash',status:'OPEN'};const approval={get:()=>({...approvalState}),set:(_k,v)=>{approvalState.status=v;}};
 const proof={reference:plan.reference,authorized:true,hash_verified:true,approval_hash:'approved-hash'};
 assert.throws(()=>ctx.bsePilotRacunJournalCommit_(plan,adapter),/RECOVERY_REQUIRED/);
 assert.equal(ctx.bsePilotRacunFinalizeApproval_(plan,adapter,approval,proof).status,'RECOVERY_REQUIRED');
 assert.equal(approvalState.status,'OPEN');
 fail=false;
 assert.equal(ctx.bsePilotRacunJournalCommit_(plan,adapter).status,'COMMITTED');
 assert.equal(ctx.bsePilotRacunFinalizeApproval_(plan,adapter,approval,proof).status,'REPORTER_CONFIRMED');
 assert.equal(rows.length,10);assert.equal(new Set(rows.map(r=>r.source_key)).size,10);
 assert.equal(ctx.bsePilotRacunJournalCommit_(plan,adapter).status,'COMMITTED');
 assert.equal(ctx.bsePilotRacunFinalizeApproval_(plan,adapter,approval,proof).status,'ALREADY_CONFIRMED');
 assert.equal(rows.length,10);
});
