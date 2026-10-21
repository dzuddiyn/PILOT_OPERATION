'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const ctx={};vm.createContext(ctx);
for(const f of ['CommitProvenanceTest.js','ReceiptReconcileTest.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
const x={environment:'TEST_ONLY',production_write:false,official_bse_write:false,owner_authorized:true,approval_status:'REPORTER_CONFIRMED',
 approval_source_key:'BSE-TG-900024|Inventory_Event_Log|C1',ledger_source_key:'BSE-TG-900024|INVENTORY_IN|ITEM_F',
 approval_hash:'a'.repeat(64),ledger_hash:'b'.repeat(64),event_id:'TESTONLY24'};
function fixture(){const intents=new Map(),ledgers=new Map(),evidence=new Map(),receipts=new Map();const counts={intent:0,ledger:0,evidence:0,receipt:0};
 const approval={status:'REPORTER_CONFIRMED',payload_hash:x.approval_hash};
 const store={
 readIntent:k=>intents.get(k),writeIntent:v=>{counts.intent++;intents.set(v.approval_source_key,{...v})},
 readLedger:k=>ledgers.get(k),writeLedger:v=>{counts.ledger++;ledgers.set(v.source_key,{...v})},
 readCommitEvidence:k=>evidence.get(k),writeCommitEvidence:v=>{counts.evidence++;evidence.set(v.approval_source_key,{...v})},
 readApproval:()=>approval,readReceipt:k=>receipts.get(k),writeReceipt:v=>{counts.receipt++;receipts.set(v.receipt_id,{...v})}
 };
 return {store,counts,intents,ledgers,evidence,receipts,approval};
}
const commit=f=>ctx.bseNondelete24Commit_(f.store,x);
const reconcile=f=>ctx.bseNondeleteReceipt23Reconcile_(f.store,x);
test('commit-time provenance enables exact receipt reconciliation and idempotent replay',()=>{
 const f=fixture();assert.equal(commit(f).status,'COMMITTED_SYNTHETIC');assert.equal(reconcile(f).status,'RECONCILED_SYNTHETIC');
 assert.equal(commit(f).status,'COMMITTED_SYNTHETIC');assert.equal(reconcile(f).status,'ALREADY_RECONCILED');
 assert.equal(f.counts.ledger,1);assert.equal(f.counts.evidence,1);assert.equal(f.counts.receipt,1);
});
test('historical ledger without prepared intent rejected, no fabricated proof',()=>{
 const f=fixture();f.store.writeLedger({source_key:x.ledger_source_key,payload_hash:x.ledger_hash,event_id:x.event_id,status:'APPROVED_TEST'});
 assert.equal(commit(f).status,'PREEXISTING_UNVERIFIED');assert.equal(f.evidence.size,0);assert.equal(reconcile(f).status,'COMMIT_PROVENANCE_UNVERIFIED');
});
for(const stage of ['Intent','Ledger','CommitEvidence']){
 test('crash after '+stage+' write recovers only matching prepared identity',()=>{
  const f=fixture(),name='write'+stage,actual=f.store[name];let once=true;
  f.store[name]=v=>{actual(v);if(once){once=false;throw Error('TEST_ONLY_CRASH')}};
  assert.throws(()=>commit(f),/TEST_ONLY_CRASH/);
  assert.equal(commit(f).status,'COMMITTED_SYNTHETIC');assert.equal(reconcile(f).status,'RECONCILED_SYNTHETIC');
  assert.equal(f.counts.ledger,1);assert.equal(f.counts.evidence,1);
 });
}
test('conflicting ledger fails closed before provenance receipt',()=>{
 const f=fixture();const original=f.store.writeLedger;f.store.writeLedger=v=>original({...v,payload_hash:'c'.repeat(64)});
 assert.equal(commit(f).status,'LEDGER_READBACK_UNKNOWN');assert.equal(f.evidence.size,0);
});
test('approval required before first prepare',()=>{
 const f=fixture();assert.equal(ctx.bseNondelete24Commit_(f.store,{...x,owner_authorized:false}).status,'APPROVAL_REQUIRED');assert.equal(f.intents.size,0);
});
test('receipt remains blocked before verified commit evidence',()=>{
 const f=fixture();assert.equal(reconcile(f).status,'LEDGER_UNVERIFIED');assert.equal(f.receipts.size,0);
});
test('operational environment denied without writes',()=>{
 const f=fixture();assert.equal(ctx.bseNondelete24Commit_(f.store,{...x,environment:'PILOT_OPERATION'}).status,'ENVIRONMENT_DENIED');assert.equal(f.counts.ledger,0);
});
