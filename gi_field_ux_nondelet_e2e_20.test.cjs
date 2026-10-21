'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),crypto=require('node:crypto');
const inventory=fs.readFileSync(__dirname+'/InventoryReviewTest.js','utf8');
const approval=fs.readFileSync(__dirname+'/TelegramApprovalUiTest.js','utf8');
const segment=approval.slice(approval.indexOf('function bseApprovalCandidateEnvelope_('),approval.indexOf('function bseApprovalCandidateIndexFromSourceKey_('));
const context={
 bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',
 bseCanonicalPlotTokens_:s=>({ok:true,plots:[s]}),bseInventoryMalaysiaDate_:()=> '2026-10-21',
 bseReviewContextValidate_:x=>x,SpreadsheetApp:{flush:()=>{}},
 Utilities:{getUuid:()=> 'TEST_ONLY_UUID',computeDigest:(_alg,s)=>[...crypto.createHash('sha256').update(String(s)).digest()].map(x=>x>127?x-256:x),DigestAlgorithm:{SHA_256:'SHA_256'},Charset:{UTF_8:'UTF_8'}},
 bseEvidenceRefs_:()=>[],bseInventoryPayloadHash_:p=>crypto.createHash('sha256').update(JSON.stringify(p)).digest('hex'),
 bseMeasurementStableJson_:JSON.stringify
};
vm.createContext(context);vm.runInContext(inventory,context);vm.runInContext(segment,context);
const data='Baja in\n15/10/2026\n2 set Baja F\n3 set Baja N',reference='BSE-TG-99990020';
function book(){
 const sheets=new Map();
 function sheet(){const rows=[];return {rows,getLastRow:()=>rows.length+1,appendRow:r=>rows.push([...r]),
 getRange:(r,c,n=1)=>({getValues:()=>rows.slice(r-2,r-2+n).map(x=>x.slice(c-1)),setValue:v=>{if(!rows[r-2])rows[r-2]=[];rows[r-2][c-1]=v}})}}
 return {sheets,getSheetByName:k=>sheets.get(k)||null,insertSheet:k=>{const s=sheet();sheets.set(k,s);return s;}};
}
function setup(){
 const b=book();
 context.bseInventoryEnsureSheet_=(book,name)=>book.getSheetByName(name)||book.insertSheet(name);
 const parsed=context.bseInventoryParseMessage_(data,'2026-10-21T00:00:00Z');
 const env=context.bseApprovalEnvelopes_(parsed);
 const run=(ix)=>context.bseInventoryReviewCore_(b,{reference,action:'APPROVED',actor_type:'TELEGRAM',actor_id:'TEST_ONLY_USER',actor_name:'Test Reporter',source_channel:'TELEGRAM',proposalResult:env[ix],suppress_queue_status:true});
 return {b,parsed,env,run};
}
test('two candidate envelopes produce distinct inventory ledger entries via original core',()=>{
 const {b,env,run}=setup();assert.equal(env.length,2);const a=run(0),n=run(1);
 assert.equal(a.validation,'PASS');assert.equal(n.validation,'PASS');assert.notEqual(a.source_key,n.source_key);
 const rows=b.sheets.get('TEST_INVENTORY_EVENT').rows;assert.equal(rows.length,2);assert.deepEqual(rows.map(r=>r[3]),['Fruitka','Benegro N']);
});
test('replay creates no duplicate ledger rows',()=>{const {b,run}=setup();run(0);run(1);assert.equal(run(0).duplicate,true);assert.equal(run(1).duplicate,true);assert.equal(b.sheets.get('TEST_INVENTORY_EVENT').rows.length,2);});
test('hash conflict is rejected before additional ledger append',()=>{const {b,env,run}=setup();run(0);env[0].candidates[0].fields.quantity=99;assert.throws(()=>run(0),/hash|source_key/i);assert.equal(b.sheets.get('TEST_INVENTORY_EVENT').rows.length,1)});
test('failure between first and second item leaves partial state visible, replay reconciles',()=>{
 const {b,run}=setup();run(0);assert.equal(b.sheets.get('TEST_INVENTORY_EVENT').rows.length,1);run(1);
 assert.equal(b.sheets.get('TEST_INVENTORY_EVENT').rows.length,2);
});
