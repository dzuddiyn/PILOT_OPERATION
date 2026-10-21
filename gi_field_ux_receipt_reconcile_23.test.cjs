'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/ReceiptReconcileTest.js','utf8'),ctx);
const x={environment:'TEST_ONLY',production_write:false,official_bse_write:false,approval_source_key:'BSE-TG-900023|Inventory_Event_Log|C1',ledger_source_key:'BSE-TG-900023|INVENTORY_IN|ITEM_F',approval_hash:'a'.repeat(64),ledger_hash:'b'.repeat(64),event_id:'TEST_ONLY_23'};
function fixture(){
 const receipts=new Map();let writes=0;
 const approval={status:'REPORTER_CONFIRMED',payload_hash:x.approval_hash};
 const ledger={status:'APPROVED_TEST',payload_hash:x.ledger_hash,event_id:x.event_id};
 const evidence={approval_source_key:x.approval_source_key,ledger_source_key:x.ledger_source_key,approval_hash:x.approval_hash,ledger_hash:x.ledger_hash,event_id:x.event_id,verified:true};
 const store={readApproval:()=>approval,readLedger:()=>ledger,readCommitEvidence:()=>evidence,readReceipt:k=>receipts.get(k),writeReceipt:r=>{writes++;receipts.set(r.receipt_id,{...r})}};
 return {store,approval,ledger,evidence,receipts,get writes(){return writes}};
}
test('verified receipt writes once and readbacks',()=>{const f=fixture();assert.equal(ctx.bseNondeleteReceipt23Reconcile_(f.store,x).status,'RECONCILED_SYNTHETIC');assert.equal(ctx.bseNondeleteReceipt23Reconcile_(f.store,x).status,'ALREADY_RECONCILED');assert.equal(f.writes,1)});
test('missing commit evidence prevents historical backfill',()=>{const f=fixture();f.store.readCommitEvidence=()=>null;assert.equal(ctx.bseNondeleteReceipt23Reconcile_(f.store,x).status,'COMMIT_PROVENANCE_UNVERIFIED');assert.equal(f.writes,0)});
test('unconfirmed approval cannot reconcile',()=>{const f=fixture();f.approval.status='OPEN';assert.equal(ctx.bseNondeleteReceipt23Reconcile_(f.store,x).status,'APPROVAL_UNVERIFIED')});
test('mismatched ledger cannot reconcile',()=>{const f=fixture();f.ledger.payload_hash='c'.repeat(64);assert.equal(ctx.bseNondeleteReceipt23Reconcile_(f.store,x).status,'LEDGER_UNVERIFIED')});
test('conflicting prior receipt is rejected',()=>{const f=fixture();f.receipts.set('TEST_ONLY_RECEIPT:'+x.approval_source_key,{receipt_id:'wrong'});assert.equal(ctx.bseNondeleteReceipt23Reconcile_(f.store,x).status,'RECEIPT_CONFLICT')});
test('crash after receipt write permits idempotent retry',()=>{const f=fixture(),write=f.store.writeReceipt;let once=true;f.store.writeReceipt=r=>{write(r);if(once){once=false;throw Error('TEST_ONLY_CRASH')}};assert.throws(()=>ctx.bseNondeleteReceipt23Reconcile_(f.store,x),/TEST_ONLY_CRASH/);assert.equal(ctx.bseNondeleteReceipt23Reconcile_(f.store,x).status,'ALREADY_RECONCILED');assert.equal(f.writes,1)});
test('readback unknown is not pass',()=>{const f=fixture();f.store.writeReceipt=()=>{};assert.equal(ctx.bseNondeleteReceipt23Reconcile_(f.store,x).status,'RECEIPT_WRITE_OUTCOME_UNKNOWN')});
test('runtime environment forbidden',()=>{const f=fixture();const o=ctx.bseNondeleteReceipt23Reconcile_(f.store,{...x,environment:'PILOT_OPERATION'});assert.equal(o.status,'ENVIRONMENT_DENIED');assert.equal(o.telegram_send,false);assert.equal(f.writes,0)});
test('evidence mismatch cannot be trusted',()=>{const f=fixture();f.evidence.event_id='OTHER';assert.equal(ctx.bseNondeleteReceipt23Reconcile_(f.store,x).status,'COMMIT_PROVENANCE_UNVERIFIED')});
