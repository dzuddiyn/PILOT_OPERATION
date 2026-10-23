'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const approval=fs.readFileSync(__dirname+'/TelegramApprovalUiTest.js','utf8');
const treatment=fs.readFileSync(__dirname+'/TreatmentReviewTest.js','utf8');
const asrc=approval.slice(approval.indexOf('function bseApprovalSummary_('),approval.indexOf('function runBseTelegramPrivateOptInHarnessTests(',approval.indexOf('function bseApprovalSummary_(')));
const tstart=treatment.indexOf('function bseTreatmentFinalizeResult_(');
const tsrc=treatment.slice(tstart,treatment.indexOf('function runBseTreatmentD043AcceptanceHarnessTests(',tstart));
const report='Racun\n19/10/2026\n1. M1P1\nTEST_ONLY-20\n2. M2P1\nTEST_ONLY-30';
const fields=(module,qty)=>({original_note:report,event_date:'2026-10-19',plot_ids:[module+'P1'],
 treatment_description:'TEST_ONLY_MATERIAL - '+qty,crop:'',verification_status:'PROVISIONAL',pending_treatment_items:[]});
const raw={validation:'NEED_INFO',production_write:false,candidates:[
 {target:'Treatment_Event_Log',validation:'NEED_INFO',missing:['batch_match'],fields:fields('M1',20)},
 {target:'Treatment_Event_Log',validation:'NEED_INFO',missing:['batch_match'],fields:fields('M2',30)}
]};
const ctx={Date,JSON,Set,Map,String,Number,Error,bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',
 bseApprovalDisplayDate_:()=> '19/10/2026',
 bsePilotRacunSourceAssessment_:()=>({status:'SOURCE_COMPLETE_STORAGE_BLOCKED'}),
 bsePilotRacunAggregateEligibility_:()=>ctx.ready?{eligible:true}:{eligible:false,reason:'STORAGE_UNPROVISIONED'},
 ready:false};
vm.createContext(ctx);
vm.runInContext(asrc,ctx);vm.runInContext(tsrc,ctx);
test('full input is source-complete but never actionably PASS before proven runtime',()=>{
 const result=ctx.bseTreatmentFinalizeResult_({},raw,{});
 assert.equal(result.validation,'NEED_INFO');assert.equal(result.storage_blocked,true);
 assert.equal(result.candidates[0].missing[0],'storage_ready');
 assert.equal(raw.candidates[0].missing[0],'batch_match');
});
test('source-complete input transitions to PASS only when storage+callback readiness is proven',()=>{
 ctx.ready=true;const result=ctx.bseTreatmentFinalizeResult_({},raw,{});
 assert.equal(result.validation,'PASS');assert.equal(result.candidates.length,2);
 assert(result.candidates.every(c=>c.validation==='PASS'&&c.missing.length===0));
});
test('single aggregate card presents all groups and quantities, no fabricated crop or batch',()=>{
 const prepared=ctx.bseTreatmentFinalizeResult_({},raw,{});
 prepared.aggregate_type='PILOT_RACUN_ATOMIC';
 const card=ctx.bseApprovalSummary_('BSE-TG-999999',prepared);
 assert.match(card,/2 REKOD PILOT/);assert.match(card,/Tarikh: 19\/10\/2026/);
 assert.match(card,/1\. Plot: M1P1/);assert.match(card,/2\. Plot: M2P1/);
 assert.match(card,/TEST_ONLY_MATERIAL - 20/);assert.match(card,/TEST_ONLY_MATERIAL - 30/);
 assert.match(card,/Satu Benar/);assert.match(card,/PILOT unlinked/);
 assert.doesNotMatch(card,/Tanaman:/);assert.doesNotMatch(card,/batch_id:/);
});
test('oversize approval card fails before any Telegram send',()=>{
 const prepared=ctx.bseTreatmentFinalizeResult_({},raw,{});
 prepared.aggregate_type='PILOT_RACUN_ATOMIC';prepared.candidates[0].fields.treatment_description='X'.repeat(4500);
 assert.throws(()=>ctx.bseApprovalSummary_('BSE-TG-999999',prepared),/CARD_TOO_LONG/);
});
