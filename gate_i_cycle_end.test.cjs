'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const s={console:{log(){}},SpreadsheetApp:{flush(){}},PropertiesService:{},UrlFetchApp:{},DriveApp:{},ScriptApp:{},Session:{}};
vm.createContext(s);
for(const f of fs.readdirSync(__dirname).filter(x=>x.endsWith('.js')).sort())
  vm.runInContext(fs.readFileSync(path.join(__dirname,f),'utf8'),s,{filename:f,timeout:3000});
s.bseRuntimeEnvironmentName_=()=> 'PILOT_OPERATION';
let passed=0;const check=(name,fn)=>{fn();passed++;console.log('PASS '+name)};
const aliases=['Tarikh habis harvest','Tarikh habis tuai','end of cycle','habis tuai','plot tamat','tanaman tamat','habis harvest'];
for(const alias of aliases)for(const fmt of ['M3P1,2','M3P12','M3P1'])for(const date of ['13-09-26','13/09/26']){
 check(alias+' '+fmt+' '+date,()=>{
  const r=s.bsePilotCycleEndResult_(alias+'\n'+fmt+'\n'+date);
  assert.equal(r.validation,'PASS');
  assert.equal(r.production_write,false);
  const expected=fmt==='M3P1'?['M3P1']:['M3P1','M3P2'];
  assert.deepEqual(Array.from(r.candidates,c=>c.fields.plot_id),expected);
  assert.ok(r.candidates.every(c=>c.target==='Operation_Log'&&c.fields.operation_type==='CYCLE_END'&&c.fields.event_date==='2026-09-13'));
  assert.ok(r.candidates.every(c=>c.fields.verification_status==='PROVISIONAL'));
  const cards=s.bseApprovalEnvelopes_(r);assert.equal(cards.length,expected.length);
  cards.forEach(card=>{const domain=s.bseApprovalDomain_(card);assert.equal(domain.target,'Operation_Log');assert.equal(domain.core,s.bsePilotCycleEndReviewCore_);assert.match(s.bseApprovalSummary_('BSE-TG-SYNTHETIC',card),/Tamat Kitaran/)});
 });
}
check('unknown phrase and other environment never interpreted',()=>{
 assert.equal(s.bsePilotCycleEndResult_('Racun\nM3P12\n13/09/26'),null);
 s.bseRuntimeEnvironmentName_=()=> 'TEST';
 assert.equal(s.bsePilotCycleEndResult_('plot tamat\nM3P1\n13/09/26'),null);
 s.bseRuntimeEnvironmentName_=()=> 'PILOT_OPERATION';
});
check('invalid calendar date and repeated plots fail closed',()=>{
 for(const value of ['31-02-26','01/13/26','nonsense']){
  const r=s.bsePilotCycleEndResult_('plot tamat\nM3P12\n'+value);
  assert.equal(r.validation,'NEED_INFO');
 }
 for(const value of ['M3P11','M3P1,1','M3P123']){
  const r=s.bsePilotCycleEndResult_('habis harvest\n'+value+'\n13/09/26');
  assert.notEqual(r.validation,'PASS');
 }
});
const batch='BSE-SB-CB-20260808-001',allocation=batch+'-PA-001',tr='BSE-SB-TR-20260812-001';
const batches=[['source',1,batch,'2026-08-08','Timun','7055']];
const allocations=[['source',1,batch,allocation,'2026-08-08','M3P1','PLANNED']];
const reviews=[['review','source',1,'Crop_Batch_Log','hash','APPROVED','','','','','',batch]];
const transplant=[['source',1,tr,batch,'2026-08-12','TRANSPLANT']];
const active=['transplant_key',1,'A1',tr,batch,allocation,'M3P1','PLANNED','ACTIVE','2026-08-12T03:00:00.000Z'];
const closed=['end_source',2,'A2',tr,batch,allocation,'M3P1','ACTIVE','INACTIVE','2026-10-20T10:00:00.000Z'];
const operation=['end_source',2,0,'2026-09-20','','M3P1','CYCLE_END'];
const store={'TEST_CROP_BATCH':batches,'TEST_PLOT_ALLOCATION':allocations,'TEST_CROP_BATCH_REVIEW':reviews,
 'TEST_ALLOCATION_STATUS_EVENT':[active],'TEST_TRANSPLANT_EVENT':transplant,'TEST_OPERATION_LOG':[]};
function bookOf(rows){
 return {getSheetByName(name){const r=rows[name];if(!r)return null;return {getLastRow(){return r.length+1},getRange(start,col,count,width){return {getValues(){return r.slice(start-2,start-2+count).map(x=>x.slice(col-1,col-1+width))}}}}}};
}
const fields={event_date:'2026-09-20',plot_id:'M3P1'};
check('current ACTIVE allocation is uniquely matched',()=>{
 let m=s.bsePilotCycleEndCurrentMatch_(bookOf(store),fields);
 assert.equal(m.kind,'UNIQUE');assert.equal(m.allocation_id,allocation);assert.equal(m.transplant_date,'2026-08-12');
});
check('no ACTIVE, ambiguous ACTIVE, or earlier than transplant fail closed',()=>{
 assert.notEqual(s.bsePilotCycleEndCurrentMatch_(bookOf({...store,'TEST_ALLOCATION_STATUS_EVENT':[]}),fields).kind,'UNIQUE');
 assert.notEqual(s.bsePilotCycleEndCurrentMatch_(bookOf(store),{...fields,event_date:'2026-08-01'}).kind,'UNIQUE');
 let other=[...active];other[5]='OTHER';other[9]='2026-08-13T03:00:00.000Z';
 const more={...store,TEST_PLOT_ALLOCATION:allocations.concat([['s',1,batch,'OTHER','2026-08-08','M3P1','PLANNED']]),TEST_ALLOCATION_STATUS_EVENT:[active,other]};
 assert.notEqual(s.bsePilotCycleEndCurrentMatch_(bookOf(more),fields).kind,'UNIQUE');
});
check('queue guard gates before any approval card, including partial two plot',()=>{
 const r=s.bsePilotCycleEndResult_('plot tamat\nM3P12\n20/09/26');
 const guarded=s.bsePilotCycleEndQueueGuard_(bookOf(store),r);
 assert.equal(guarded.validation,'NEED_INFO');
 assert.equal(guarded.candidates[1].missing.includes('active_allocation_match'),true);
});
check('historical ACTIVE before end and INACTIVE afterward',()=>{
 const early=s.bsePilotCycleStatusEventsAsOf_('2026-09-19',[active,closed],transplant,[operation]);
 const after=s.bsePilotCycleStatusEventsAsOf_('2026-09-20',[active,closed],transplant,[operation]);
 assert.equal(early.length,1);assert.equal(after.length,2);
 assert.equal(s.bseActiveAllocationEffectiveStatuses_(early)[allocation].status,'ACTIVE');
 assert.equal(s.bseActiveAllocationEffectiveStatuses_(after)[allocation].status,'INACTIVE');
 assert.equal(s.bseCensusStatusEventsAsOf_('2026-09-19',[active,closed],transplant,[operation]).length,1);
 assert.equal(s.bseTreatmentStatusEventsAsOf_('2026-09-20',[active,closed],transplant,[operation]).length,2);
});
check('once inactive, plot status no longer ACTIVE and duplicate candidate has no lifecycle write',()=>{
 const latest=s.bseActiveAllocationEffectiveStatuses_([active,closed]);
 assert.equal(latest[allocation].status,'INACTIVE');
 assert.equal(s.bsePilotCycleEndCurrentMatch_(bookOf({...store,TEST_ALLOCATION_STATUS_EVENT:[active,closed]}),fields).kind,'NONE');
 const source=s.bsePilotCycleEndReviewCore_.toString();
 assert.ok(source.includes('bseOperationReviewCore_')&&source.includes('bseCropBatchAppend_')&&source.includes('PARTIAL WRITE DETECTED'));
 assert.ok(source.indexOf('bseOperationReviewCore_')<source.indexOf('bseCropBatchAppend_'));
});
check('worker prioritizes cycle end over Treatment and Gemini',()=>{
 const f=s.processBseTelegramTestQueue.toString();
 assert.ok(f.includes('bsePilotCycleEndResult_(job.input)'));
 assert.ok(f.indexOf('bsePilotCycleEndResult_(job.input)')<f.indexOf('bseTreatmentListParseMessage_(job.input,job.receivedAt)'));
 assert.ok(f.indexOf('cycleEndResult||ecResult')>=0);
});
console.log('GI_CYCLE_END '+passed+'/'+passed+' PASS LOCAL VM ONLY');
