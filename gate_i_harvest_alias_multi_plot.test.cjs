'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const sandbox={console:{log(){}},SpreadsheetApp:{},PropertiesService:{},UrlFetchApp:{},DriveApp:{},ScriptApp:{},Session:{}};
vm.createContext(sandbox);
for(const file of fs.readdirSync(__dirname).filter(f=>f.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),sandbox,{filename:file,timeout:3000});
let env='PILOT_OPERATION',passed=0;
sandbox.bseRuntimeEnvironmentName_=()=>env;
function check(name,fn){fn();passed++;console.log('PASS '+name)}
const heads=['tarikh mula harvest','tarikh mula tuai','mula harvest','mula tuai','mula Harverst'];
for(const h of heads)for(const plot of ['M3P1,2','M3P12']){
 check(h+' '+plot,()=>{
  const result=sandbox.bsePilotHarvestStartResult_(h+'\n'+plot+'\n13-Sep-26');
  assert.equal(result.validation,'PASS');assert.equal(result.production_write,false);
  assert.deepEqual(Array.from(result.candidates,c=>c.fields.plot_id),['M3P1','M3P2']);
  assert.ok(result.candidates.every(c=>c.target==='Operation_Log'&&c.validation==='PASS'&&c.fields.event_date==='2026-09-13'&&c.fields.operation_type==='HARVEST_START'&&c.missing.length===0));
  assert.equal(sandbox.bsePilotOperationReviewCardOnly_(result,'NEEDS_HUMAN_REVIEW'),true);
  const cards=sandbox.bseApprovalEnvelopes_(result);assert.equal(cards.length,2);
  cards.forEach((card,i)=>{assert.equal(card.candidates.length,1);assert.equal(card.candidates[0].fields.plot_id,['M3P1','M3P2'][i]);assert.equal(sandbox.bseApprovalDomain_(card).target,'Operation_Log')});
 });
}
check('generic module shorthand M12P34 expands correctly',()=>{
 const r=sandbox.bsePilotHarvestStartResult_('mula tuai\nM12P34\n13-Sep-26');
 assert.deepEqual(Array.from(r.candidates,c=>c.fields.plot_id),['M12P3','M12P4']);
});
check('prior single plot M7P3 accepted',()=>{
 const r=sandbox.bsePilotHarvestStartResult_('Tarikh mula tuai\nM7P3\n14-Oct-26');
 assert.equal(r.validation,'PASS');assert.equal(r.candidates.length,1);
});
for(const plot of ['M3P11','M3P1,1','M3P123']){
 check('reject ambiguous duplicate '+plot,()=>{
  const r=sandbox.bsePilotHarvestStartResult_('mula harvest\n'+plot+'\n13-Sep-26');
  assert.ok(r&&r.validation!=='PASS');
 });
}
check('invalid date cannot be filled from message received timestamp',()=>{
 const r=sandbox.bsePilotHarvestStartResult_('mula tuai\nM3P12\n31-Sep-26');
 assert.equal(r.validation,'NEED_INFO');assert.ok(r.candidates.every(c=>c.missing.includes('event_date')));
});
check('unrelated treatment untouched',()=>assert.equal(sandbox.bsePilotHarvestStartResult_('Racun\nM3P12\n13-Sep-26'),null));
check('other environments untouched',()=>{env='PILOT_TEST';assert.equal(sandbox.bsePilotHarvestStartResult_('mula harvest\nM3P12\n13-Sep-26'),null);env='TEST';assert.equal(sandbox.bsePilotHarvestStartResult_('mula harvest\nM3P12\n13-Sep-26'),null);env='PILOT_OPERATION'});
check('worker harvest priority precedes treatment fallback',()=>{
 const s=sandbox.processBseTelegramTestQueue.toString();
 assert.ok(s.indexOf('bsePilotHarvestStartResult_(job.input)')<s.indexOf('bseTreatmentListParseMessage_(job.input,job.receivedAt)'));
});
check('unified guard admits two Operation candidates without production write',()=>{
 const raw=sandbox.bsePilotHarvestStartResult_('mula Harverst\nM3P12\n13-Sep-26');
 const result=sandbox.bseUnifiedGuard_(raw,{received_at:'2026-10-20T09:22:36.717Z',source_input:'mula Harverst\nM3P12\n13-Sep-26'});
 assert.equal(result.validation,'PASS');assert.equal(result.production_write,false);
 assert.deepEqual(Array.from(result.candidates,c=>c.fields.plot_id),['M3P1','M3P2']);
 assert.equal(result.candidates.every(c=>c.validation==='PASS'&&c.missing.length===0),true);
});
check('each Operation card displays correct plot and date',()=>{
 const raw=sandbox.bsePilotHarvestStartResult_('mula tuai\nM3P12\n13-Sep-26');
 const envelopes=sandbox.bseApprovalEnvelopes_(raw);
 for(let i=0;i<2;i++){
  const summary=sandbox.bseApprovalSummary_('BSE-TG-FIXTURE',envelopes[i]);
  assert.match(summary,/Mula Tuai/);assert.match(summary,/13\/09\/2026/);
  assert.ok(summary.includes(['M3P1','M3P2'][i]));
 }
});
console.log('GI_HARVEST '+passed+'/'+passed+' PASS LOCAL ONLY');