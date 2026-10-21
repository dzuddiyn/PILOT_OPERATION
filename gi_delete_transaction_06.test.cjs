'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const code=fs.readFileSync(__dirname+'/DeleteTransactionTest.js','utf8'),ctx={};
vm.createContext(ctx);vm.runInContext(code,ctx);
const hash='a'.repeat(64);
const base={reference:'BSE-TG-772257418',approval_source_key:'BSE-TG-772257418|Inventory_Event_Log|C1',
 ledger_source_key:'BSE-TG-772257418|INVENTORY_OUT',binding_approval_key:'BSE-TG-772257418|Inventory_Event_Log|C1',
 binding_ledger_key:'BSE-TG-772257418|INVENTORY_OUT',binding_hash:hash,
 owner_status:'AUTHORIZED',approval_status:'REPORTER_CONFIRMED',expected_hash:hash,expected_revision:1,transaction_id:'D06-SYNTH0001',
 ledger_rows:[{source_key:'BSE-TG-772257418|INVENTORY_OUT',status:'APPROVED_TEST',payload_hash:hash,revision:1}]};
const plan=x=>ctx.bseDeleteTxPlan_(Object.assign({},base,x));
test('exact independently bound candidate yields READY_NO_WRITE',()=>{const x=plan();assert.equal(x.status,'READY_NO_WRITE');assert.equal(x.production_write,false)});
for(const [name,changes,expected] of [
 ['no binding',{binding_ledger_key:''},'UNVERIFIED_LEDGER_BINDING'],
 ['duplicate ledger',{ledger_rows:[...base.ledger_rows,...base.ledger_rows]},'LEDGER_NOT_UNIQUE'],
 ['stale revision',{expected_revision:2},'REVISION_CONFLICT'],
 ['stale hash',{expected_hash:'b'.repeat(64),binding_hash:'b'.repeat(64)},'REVISION_CONFLICT'],
 ['unconfirmed',{approval_status:'DISCARDED_BY_REPORTER'},'NOT_AUTHORIZED'],
 ['prefix collision',{ledger_source_key:'BSE-TG-772257418|INVENTORY_OUT|C1'},'SOURCE_MISMATCH']]){
 test(name,()=>assert.equal(plan(changes).status,expected));
}
test('journal and crash after ledger write needs reconciliation',()=>{
 const j={transaction_id:'D06-SYNTH0001',status:'PREPARED'};
 const a=ctx.bseDeleteTxTransition_(j,'BEGIN',{preconditions_match:true});assert.equal(a.status,'APPLYING');
 const crash=ctx.bseDeleteTxTransition_(a,'VERIFY',{ledger_void:true,approval_void:false,queue_consistent:false});
 assert.equal(crash.status,'NEEDS_RECONCILIATION');
 assert.equal(ctx.bseDeleteTxTransition_(crash,'RECOVER',{ledger_void:true,approval_void:false,queue_consistent:false}).status,'NEEDS_RECONCILIATION');
 const recovered=ctx.bseDeleteTxTransition_(crash,'RECOVER',{ledger_void:true,approval_void:true,queue_consistent:true});
 assert.equal(recovered.status,'COMMITTED');
 assert.equal(ctx.bseDeleteTxTransition_(recovered,'RECOVER',{}).status,'ALREADY_APPLIED');
});
test('no external writes or API in pure module',()=>{
 assert.doesNotMatch(code,/SpreadsheetApp|UrlFetchApp|setValue\(|setValues\(|appendRow\(|bseTelegramApi_\(/);
});
