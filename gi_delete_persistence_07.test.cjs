'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const src=fs.readFileSync(__dirname+'/DeletePersistenceTest.js','utf8'),ctx={};vm.createContext(ctx);vm.runInContext(src,ctx);
const hash='a'.repeat(64),approval='BSE-TG-772257418|Inventory_Event_Log|C1',ledger='BSE-TG-772257418|INVENTORY_OUT';
const plan={status:'READY_NO_WRITE',transaction_id:'D06-SYNTH0001',source_key:ledger,approval_source_key:approval,expected_hash:hash,expected_revision:1};
function store(){const journals=new Map(),bindings=new Map([[approval,{ledger_key:ledger,hash,revision:1}]]),records=new Map([[ledger,{source_key:ledger,payload_hash:hash,revision:1,status:'APPROVED_TEST'}]]);return {journals,bindings,records,
 readJournal:k=>journals.get(k),writeJournal:(k,v)=>journals.set(k,JSON.parse(JSON.stringify(v))),
 readBinding:k=>bindings.get(k),readLedger:k=>records.get(k)}}
test('journal persists and read-back verified',()=>{const s=store();assert.equal(ctx.bseDeletePersistCreate_(s,plan).status,'PREPARED');assert.equal(s.journals.size,1);assert.equal(ctx.bseDeletePersistObserve_(s,plan.transaction_id).status,'PREPARED')});
test('restart with new runner reuses exact persisted journal',()=>{const s=store();ctx.bseDeletePersistCreate_(s,plan);const restarted={};vm.createContext(restarted);vm.runInContext(src,restarted);assert.equal(restarted.bseDeletePersistCreate_(s,plan).status,'ALREADY_PREPARED')});
test('tampered binding fails closed',()=>{const s=store();s.bindings.set(approval,{ledger_key:'wrong',hash,revision:1});assert.equal(ctx.bseDeletePersistCreate_(s,plan).status,'BINDING_MISMATCH');assert.equal(s.journals.size,0)});
test('changed plan and same tx id is revision conflict',()=>{const s=store();ctx.bseDeletePersistCreate_(s,plan);assert.equal(ctx.bseDeletePersistCreate_(s,{...plan,expected_revision:2}).status,'REVISION_CONFLICT')});
test('journal write failure is unknown, never success',()=>{const s=store();s.writeJournal=()=>{};assert.equal(ctx.bseDeletePersistCreate_(s,plan).status,'WRITE_OUTCOME_UNKNOWN')});
test('partial crash reconciles only when all observed states verified',()=>{const s=store();ctx.bseDeletePersistCreate_(s,plan);s.journals.get(plan.transaction_id).status='APPLYING';assert.equal(ctx.bseDeletePersistReconcile_(s,plan.transaction_id,{ledger_void:true,approval_void:false,queue_consistent:false}).status,'NEEDS_RECONCILIATION');assert.equal(ctx.bseDeletePersistReconcile_(s,plan.transaction_id,{ledger_void:true,approval_void:true,queue_consistent:true}).status,'COMMITTED');assert.equal(ctx.bseDeletePersistReconcile_(s,plan.transaction_id,{}).status,'ALREADY_APPLIED')});
test('stale ledger hash fails read-back preflight',()=>{const s=store();ctx.bseDeletePersistCreate_(s,plan);s.records.get(ledger).payload_hash='b'.repeat(64);assert.equal(ctx.bseDeletePersistObserve_(s,plan.transaction_id).status,'REVISION_CONFLICT')});
test('no live APIs in injected-store protocol',()=>assert.doesNotMatch(src,/SpreadsheetApp|UrlFetchApp|setValue\(|appendRow\(|bseTelegramApi_\(/));
