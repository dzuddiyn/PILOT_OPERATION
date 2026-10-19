'use strict';
// GI-FULL-PARITY-P3-LOCAL-REGRESSION-GAP-CLOSURE-01
// TEST_ONLY. No external calls, API, production Sheets, Drive or Telegram.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const report=[];let externalCalls=0;
function load(names){
 const ctx=vm.createContext({console,Date,Set,Map,JSON,Math,Utilities:{formatDate:()=>{externalCalls++;throw Error('DATE_DEPENDENCY_NOT_ALLOWED')}}});
 for(const f of names)vm.runInContext(fs.readFileSync(path.join(__dirname,f),'utf8'),ctx,{filename:f,timeout:2500});
 return ctx;
}
function t(group,name,fn){
 try{fn();report.push({group,name,status:'PASS'});console.log('PASS '+group+' '+name);}
 catch(e){report.push({group,name,status:'FAIL',error:e.message});console.error('FAIL '+group+' '+name+' '+e.stack);}
}
// Actual module functions, not a synthetic oracle.
const tr=load(['CropBatchReviewTest.js','CensusReviewTest.js','TransplantReviewTest.js']);
const row=(map,len=18)=>{const a=Array(len).fill('');for(const [k,v] of Object.entries(map))a[Number(k)]=v;return a};
const batch=id=>row({2:id,4:'TEST_ONLY Peria',5:'Synthetic Variety'});
const alloc=(id,bid,plot)=>row({2:bid,3:id,5:plot,6:'PLANNED'});
const review=bid=>row({3:'Crop_Batch_Log',5:'APPROVED',11:bid});
const status=(aid,state,plot,time)=>row({3:'TRANSPLANT_TEST_ONLY',4:'B1',5:aid,6:plot,8:state,9:time});
const find=(o={})=>tr.bseTransplantFindReallocation_(
 o.crop===undefined?'TEST_ONLY Peria':o.crop,
 o.dest===undefined?['M1P3']:o.dest,
 o.batches===undefined?[batch('B1')]:o.batches,
 o.allocations===undefined?[alloc('A1','B1','M1P1')]:o.allocations,
 o.reviews===undefined?[review('B1')]:o.reviews,
 o.states===undefined?[]:o.states,
 o.from===undefined?'':o.from
);
t('FP-01','reallocation selects single approved PLANNED source',()=>{
 const x=find();assert.equal(x.kind,'UNIQUE');assert.equal(x.from_plot_id,'M1P1');assert.equal(x.to_plot_id,'M1P3');assert.equal(x.allocation_id,'A1');
});
t('FP-01','unapproved batch cannot become reallocation source',()=>{
 assert.equal(find({reviews:[]}).kind,'NONE');
});
t('FP-01','multiple destination plots rejected without choosing arbitrary plot',()=>{
 const x=find({dest:['M1P3','M1P4']});assert.equal(x.kind,'NONE');assert.equal(x.reason,'DESTINATION_COUNT');
});
t('FP-01','planned destination occupied: no reallocation allowed',()=>{
 const x=find({allocations:[alloc('A1','B1','M1P1'),alloc('A2','B1','M1P3')]});
 assert.equal(x.kind,'NONE');assert.equal(x.reason,'DESTINATION_ALREADY_PLANNED');
});
t('FP-01','two eligible sources are ambiguous and must not be selected',()=>{
 const x=find({allocations:[alloc('A1','B1','M1P1'),alloc('A2','B1','M1P2')]});
 assert.equal(x.kind,'MULTIPLE');assert.equal(x.reason,'SOURCE_AMBIGUOUS');assert.equal(x.matches.length,2);
});
t('FP-01','explicit source-plot constraint resolves eligible source without inventing',()=>{
 const x=find({allocations:[alloc('A1','B1','M1P1'),alloc('A2','B1','M1P2')],from:'M1P2'});
 assert.equal(x.kind,'UNIQUE');assert.equal(x.from_plot_id,'M1P2');
});
t('FP-01','source allocation already ACTIVE cannot be reallocated as PLANNED',()=>{
 const x=find({states:[status('A1','ACTIVE','M1P1','2026-10-18T08:00:00Z')]});
 assert.equal(x.kind,'NONE');assert.equal(x.reason,'SOURCE_NOT_FOUND');
});
t('FP-01','missing crop identity must fail closed',()=>{
 const x=find({crop:''});assert.equal(x.kind,'NONE');assert.equal(x.reason,'CROP_REQUIRED');
});
t('FP-01','latest allocation state supersedes stale ACTIVE state',()=>{
 const states=[status('A1','ACTIVE','M1P1','2026-10-17T08:00:00Z'),status('A1','PLANNED','M1P1','2026-10-18T08:00:00Z')];
 const x=find({states});assert.equal(x.kind,'UNIQUE');
});
t('FP-01','reallocation recovery requires exact single event and all hashes/fields',()=>{
 const r={allocation_id:'A1',from_plot_id:'M1P1',to_plot_id:'M1P3'};
 const e=row({0:'SRC',3:'EV',4:'B1',5:'A1',7:'M1P1',8:'M1P3',10:'COMPLETED',11:'VERIFIED_TEST',15:'HASH'});
 assert.doesNotThrow(()=>tr.bseTransplantAssertReallocationRows_([e],'SRC','HASH',r,'EV','B1'));
 assert.throws(()=>tr.bseTransplantAssertReallocationRows_([e,e],'SRC','HASH',r,'EV','B1'),/Audit Reallocation/);
 const changed=e.slice();changed[15]='DIFFERENT';
 assert.throws(()=>tr.bseTransplantAssertReallocationRows_([changed],'SRC','HASH',r,'EV','B1'),/Audit Reallocation/);
 assert.throws(()=>tr.bseTransplantAssertReallocationRows_([],'SRC','HASH',r,'EV','B1'),/Audit Reallocation/);
});
t('FP-01','reallocation daily sequence rejects exhausted allocation',()=>{
 const e=row({2:'BSE-SB-RA-20261018-999'});
 assert.throws(()=>tr.bseTransplantReallocationNextId_([e],'2026-10-18'),/penuh/);
});
// Actual inherited domain validators.
const inv=load(['InventoryReviewTest.js','InputUsageReviewTest.js']);
const usage={production_write:false,validation:'PASS',candidates:[{target:'Input_Usage_Log',validation:'PASS',missing:[],fields:{record_type:'INPUT_USAGE',event_date:'2026-10-18',item_name:'TEST_ONLY fertilizer',unit:'kg',quantity:2,original_note:'TEST_ONLY',plot_id:'M1P1'}}]};
t('FP-02','input usage missing quantity denied before inventory mapping',()=>{
 const bad=structuredClone(usage);bad.candidates[0].fields.quantity=0;
 assert.throws(()=>inv.bseInputUsageCandidate_(bad),/quantity\/unit/);
});
t('FP-02','input usage duplicate candidates denied before side-effect',()=>{
 const bad=structuredClone(usage);bad.candidates.push(structuredClone(bad.candidates[0]));
 assert.throws(()=>inv.bseInputUsageCandidate_(bad),/tepat satu/);
});
t('FP-02','input usage valid derivation remains non-production with source lineage',()=>{
 const c=inv.bseInputUsageCandidate_(usage);
 const out=inv.bseInputUsageToInventoryOut_('TEST_ONLY-REF',c,'TEST_ONLY-REF|Input_Usage_Log|sha');
 assert.equal(out.domain,'INVENTORY_OUT');assert.equal(out.production_write,false);
 assert.equal(out.derivation_type,'USAGE_CONSUMPTION');assert.equal(out.usage_source_key,'TEST_ONLY-REF|Input_Usage_Log|sha');
});
const od=load(['OperationDecisionReviewTest.js']);
const decision={production_write:false,validation:'PASS',candidates:[{target:'Decision_Approval_Log',validation:'PASS',missing:[],fields:{
 record_type:'DECISION_APPROVAL',verification_status:'PROVISIONAL',event_date:'2026-10-18',decision_subject:'TEST_ONLY',approval_status:'PENDING',
 proposal_text:'TEST_ONLY',proposed_by:'tester',approved_by:'',approval_date:''}}]};
t('FP-02','pending decision rejects fabricated approver/date',()=>{
 const bad=structuredClone(decision);bad.candidates[0].fields.approved_by='Fake Manager';
 assert.throws(()=>od.bseOperationDecisionCandidate_(bad,'Decision_Approval_Log'),/approver\/date rekaan/);
});
t('FP-02','decision approval status outside enum denied',()=>{
 const bad=structuredClone(decision);bad.candidates[0].fields.approval_status='AUTO_APPROVED';
 assert.throws(()=>od.bseOperationDecisionCandidate_(bad,'Decision_Approval_Log'),/tidak sah/);
});
t('FP-02','multiple decision candidates denied',()=>{
 const bad=structuredClone(decision);bad.candidates.push(structuredClone(bad.candidates[0]));
 assert.throws(()=>od.bseOperationDecisionCandidate_(bad,'Decision_Approval_Log'),/tepat satu/);
});
const leave=load(['LeaveReviewTest.js']);
t('FP-02','leave missing employee and date stays NEED_INFO',()=>{
 const x=leave.bseLeaveValidateProposal_({record_type:'LEAVE_REQUEST',leave_type:'AL',production_write:false});
 assert.equal(x.ok,false);assert(x.missing.includes('employee_name'));assert(x.missing.includes('leave_date'));
});
t('FP-02','leave production write flag rejected',()=>{
 const x=leave.bseLeaveValidateProposal_({record_type:'LEAVE_REQUEST',employee_name:'TEST_ONLY',leave_date:'2026-10-18',leave_type:'AL',production_write:true});
 assert.equal(x.ok,false);assert(x.missing.includes('production_write'));
});
const pc=load(['PlantConditionReviewTest.js']);
t('FP-02','qualitative approximate percentage not coerced into exact dead count',()=>{
 assert.equal(pc.bsePlantConditionCount_('Serai kebanyakan (+-90%) telah mati.','Mati|Dead'),null);
});
t('FP-02','plant condition negative and fractional counts fail validation',()=>{
 const x=pc.bsePlantConditionValidateProposal_({record_type:'PLANT_CONDITION',plot_id:'M1P1',event_date:'2026-10-18',dead_count:-2,sick_count:1.25,production_write:false});
 assert.equal(x.ok,false);assert(x.missing.includes('condition_count'));
});
t('FP-02','plant condition without count cannot pass',()=>{
 const x=pc.bsePlantConditionValidateProposal_({record_type:'PLANT_CONDITION',plot_id:'M1P1',event_date:'2026-10-18',production_write:false});
 assert.equal(x.ok,false);assert(x.missing.includes('condition_count'));
});
const ob=load(['ObservationReviewTest.js']);
const obs={production_write:false,validation:'PASS',candidates:[{target:'Observation_Log',validation:'PASS',missing:[],fields:{
 record_type:'OBSERVATION',verification_status:'PROVISIONAL',original_note:'TEST_ONLY original',event_date:'2026-10-18',plot_id:'M1P1',
 observation_facts:'TEST_ONLY observation',suspected_cause:''}}]};
t('FP-02','observation candidate must match exact original provenance',()=>{
 const bad=structuredClone(obs);bad.candidates[0].fields.original_note='DIFFERENT SOURCE';
 assert.throws(()=>ob.bseObservationCandidate_(bad,'TEST_ONLY original'),/kontrak/);
});
t('FP-02','observation requires observation facts even if rest valid',()=>{
 const bad=structuredClone(obs);bad.candidates[0].fields.observation_facts='';
 assert.throws(()=>ob.bseObservationCandidate_(bad,'TEST_ONLY original'),/observation/);
});
// Canonical comparator evidence is DOCUMENTARY rather than a live safety adapter.
// Assert real source locks, never fabricate positive comparator or classify LEGACY_MISSING as BOUND.
const doc=fs.readFileSync(path.join(__dirname,'docs','PILOT_TEST_DEPENDENCY_COMPARATOR_EVIDENCE.md'),'utf8');
t('FP-COMP','missing leave and exact condition comparators remain explicitly LEGACY_MISSING',()=>{
 for(const marker of ['BIND-LEAVE-001 = LEGACY_MISSING','BIND-PCOND-002 = LEGACY_MISSING','BIND-ASSET-GAP-001 = LEGACY_MISSING'])
  assert(doc.includes(marker),'Missing locked comparator '+marker);
});
t('FP-COMP','bound asset source cannot be promoted to acquisition date or price',()=>{
 assert(doc.includes('BIND-ASSET-002'));assert(doc.includes('does not establish:'));
 for(const marker of ['exact purchase date','vendor','price'])assert(doc.includes(marker));
});
t('FP-COMP','legacy M1P1 crop stays WAITING_INFO rather than invented variety',()=>{
 assert(doc.includes('M1P1 remains `WAITING_INFO`'));assert(doc.includes('did not invent a variety'));
});
t('GLOBAL','P3 tests never accessed real external adapters',()=>assert.equal(externalCalls,0));
const failed=report.filter(x=>x.status==='FAIL');
const groups=[...new Set(report.map(x=>x.group))].map(g=>({group:g,passed:report.filter(x=>x.group===g&&x.status==='PASS').length,failed:report.filter(x=>x.group===g&&x.status==='FAIL').length}));
console.log('GI_FULL_PARITY_P3_SUMMARY '+JSON.stringify({total:report.length,passed:report.length-failed.length,failed:failed.length,groups,externalCalls}));
if(failed.length)process.exitCode=1;
