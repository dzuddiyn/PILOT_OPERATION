'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const ctx={};vm.createContext(ctx);for(const name of ['NondeleteSheetsAdapterTest.js','CommitProvenanceTest.js','ReceiptReconcileTest.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+name,'utf8'),ctx);
const x={environment:'TEST_ONLY',production_write:false,official_bse_write:false,owner_authorized:true,approval_status:'REPORTER_CONFIRMED',approval_source_key:'BSE-TG-900026|Inventory_Event_Log|C1',ledger_source_key:'BSE-TG-900026|INVENTORY_IN|ITEM_F',approval_hash:'a'.repeat(64),ledger_hash:'b'.repeat(64),event_id:'TEST_ONLY_E26'};
function fixture(options={}){
 const names={intent:'TEST_ONLY_NONDELETE_INTENT',ledger:'TEST_ONLY_NONDELETE_LEDGER',evidence:'TEST_ONLY_NONDELETE_EVIDENCE',receipt:'TEST_ONLY_NONDELETE_RECEIPT'};
 const specs={intent:['approval_source_key','ledger_source_key','approval_hash','ledger_hash','event_id','status'],ledger:['source_key','payload_hash','event_id','status'],evidence:['approval_source_key','ledger_source_key','approval_hash','ledger_hash','event_id','verified','status'],receipt:['receipt_id','approval_source_key','ledger_source_key','approval_hash','ledger_hash','event_id','status']};
 const map={};let unlocked=0,locked=false;
 for(const k of Object.keys(specs)){const rows=[specs[k].slice()];map[names[k]]={rows,getLastColumn:()=>rows[0].length,getLastRow:()=>rows.length,appendRow:r=>rows.push([...r]),getRange:(r,c,n=1,width=specs[k].length)=>({getValues:()=>rows.slice(r-1,r-1+n).map(row=>row.slice(c-1,c-1+width)),setValues:values=>{values.forEach((v,j)=>rows[r-1+j].splice(c-1,v.length,...v))}})};}
 const lock={tryLock:()=>{if(options.busy)return false;locked=true;return true},releaseLock:()=>{locked=false;unlocked++}};
 const book={getSheetByName:n=>map[n]||null};
 const adapter=ctx.bseNondelete26SheetsAdapter_({book,lock,environment:'TEST_ONLY',production_write:false,official_bse_write:false});
 return {map,names,specs,adapter,lock,get unlocked(){return unlocked},get locked(){return locked}};
}
test('exact headers accepted and wrong schema fails closed',()=>{const f=fixture();assert.equal(f.adapter.status,'READY_TEST_ONLY');f.map[f.names.ledger].rows[0][0]='changed';assert.equal(ctx.bseNondelete26SheetsAdapter_({book:{getSheetByName:n=>f.map[n]},lock:f.lock,environment:'TEST_ONLY',production_write:false,official_bse_write:false}).status,'SCHEMA_MISMATCH')});
test('real commit protocol through sheet-shaped adapter journal, ledger, evidence and receipt',()=>{const f=fixture();const r=ctx.bseNondelete26WithLock_(f.adapter,store=>{const o=ctx.bseNondelete24Commit_(store,x);const receipt=ctx.bseNondelete23ReceiptRetry_?ctx.bseNondelete23ReceiptRetry_(store,x):null;return {o,receipt};});assert.equal(r.o.status,'COMMITTED_SYNTHETIC');assert.equal(f.map[f.names.intent].rows[1][5],'COMMITTED');assert.equal(f.map[f.names.ledger].rows.length,2);assert.equal(f.map[f.names.evidence].rows.length,2);assert.equal(f.unlocked,1);});
test('lock busy prevents callback',()=>{const f=fixture({busy:true});let ran=false;const r=ctx.bseNondelete26WithLock_(f.adapter,()=>{ran=true});assert.equal(r.status,'LOCK_BUSY');assert.equal(ran,false)});
test('lock releases after injected failure',()=>{const f=fixture();assert.throws(()=>ctx.bseNondelete26WithLock_(f.adapter,()=>{throw Error('CRASH')}),/CRASH/);assert.equal(f.unlocked,1);assert.equal(f.locked,false)});
test('receipt write and independent readback after commit',()=>{const f=fixture();ctx.bseNondelete26WithLock_(f.adapter,s=>ctx.bseNondelete24Commit_(s,x));const s=f.adapter.store;s.readApproval=()=>({status:'REPORTER_CONFIRMED',payload_hash:x.approval_hash});assert.equal(ctx.bseNondeleteReceipt23Reconcile_(s,x).status,'RECONCILED_SYNTHETIC');assert.equal(ctx.bseNondeleteReceipt23Reconcile_(s,x).status,'ALREADY_RECONCILED');assert.equal(f.map[f.names.receipt].rows.length,2)});
test('operational adapter forbidden',()=>{const f=fixture();assert.equal(ctx.bseNondelete26SheetsAdapter_({book:{getSheetByName:n=>f.map[n]},lock:f.lock,environment:'PILOT_OPERATION',production_write:false,official_bse_write:false}).status,'ENVIRONMENT_OR_DEPENDENCIES_DENIED')});
test('crash after ledger append reconciles exact prepared journal without duplicate',()=>{
 const f=fixture(),s=f.adapter.store,write=s.writeLedger;let once=true;
 s.writeLedger=v=>{write(v);if(once){once=false;throw Error('TEST_ONLY_AFTER_LEDGER_APPEND')}};
 assert.throws(()=>ctx.bseNondelete26WithLock_(f.adapter,store=>ctx.bseNondelete24Commit_(store,x)),/TEST_ONLY_AFTER_LEDGER_APPEND/);
 assert.equal(f.map[f.names.intent].rows[1][5],'PREPARED');
 assert.equal(f.map[f.names.ledger].rows.length,2);
 assert.equal(ctx.bseNondelete26WithLock_(f.adapter,store=>ctx.bseNondelete24Commit_(store,x)).status,'COMMITTED_SYNTHETIC');
 assert.equal(f.map[f.names.ledger].rows.length,2);
 assert.equal(f.map[f.names.intent].rows[1][5],'COMMITTED');
});
test('preexisting ledger without journal refuses retroactive provenance',()=>{
 const f=fixture();f.adapter.store.writeLedger({source_key:x.ledger_source_key,payload_hash:x.ledger_hash,event_id:x.event_id,status:'APPROVED_TEST'});
 assert.equal(ctx.bseNondelete26WithLock_(f.adapter,s=>ctx.bseNondelete24Commit_(s,x)).status,'PREEXISTING_UNVERIFIED');
 assert.equal(f.map[f.names.evidence].rows.length,1);
});
