'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/DeleteCommitReceiptTest.js','utf8'),ctx={};vm.createContext(ctx);vm.runInContext(source,ctx);
const input={approval_source_key:'BSE-TG-900001|Inventory_Event_Log|C1',ledger_source_key:'BSE-TG-900001|INVENTORY_OUT',
  approval_hash:'a'.repeat(64),ledger_hash:'b'.repeat(64),event_id:'INV-TEST_ONLY',owner_authorized:true,approval_status:'REPORTER_CONFIRMED'};
function store(){const ledgers=new Map(),receipts=new Map();return {ledgers,receipts,
 readLedger:k=>ledgers.get(k),readReceipt:k=>receipts.get(k),appendLedger:r=>ledgers.set(r.source_key,{...r}),appendReceipt:r=>receipts.set(r.receipt_id,{...r})};}
const commit=(s,x=input)=>ctx.bseDeleteReceipt12Commit_(s,x);
test('synthetic commit and exact readback',()=>{const s=store();assert.equal(commit(s).status,'COMMITTED_SYNTHETIC');assert.equal(s.ledgers.size,1);assert.equal(s.receipts.size,1)});
test('idempotent retry does not append again',()=>{const s=store();commit(s);assert.equal(commit(s).status,'ALREADY_APPLIED');assert.equal(s.ledgers.size,1);assert.equal(s.receipts.size,1)});
test('crash after ledger append before receipt fails closed',()=>{const s=store();s.appendReceipt=()=>{throw Error('TEST_ONLY_CRASH')};assert.throws(()=>commit(s),/TEST_ONLY_CRASH/);assert.equal(s.ledgers.size,1);assert.equal(s.receipts.size,0);assert.equal(commit(s).status,'PARTIAL_WRITE_NEEDS_RECONCILIATION')});
test('stale approval prevents any append',()=>{const s=store();assert.equal(commit(s,{...input,approval_status:'OPEN'}).status,'APPROVAL_REQUIRED');assert.equal(s.ledgers.size,0)});
test('receipt collision rejects contradictory hash',()=>{const s=store();commit(s);assert.equal(commit(s,{...input,approval_hash:'c'.repeat(64)}).status,'RECEIPT_CONFLICT')});
test('ledger row without receipt is not retroactively bound',()=>{const s=store();s.appendLedger({source_key:input.ledger_source_key,event_id:input.event_id,payload_hash:input.ledger_hash,status:'APPROVED_TEST'});assert.equal(commit(s).status,'PARTIAL_WRITE_NEEDS_RECONCILIATION')});
test('mismatched reference or absent hash fails',()=>{const s=store();assert.equal(commit(s,{...input,ledger_source_key:'BSE-TG-900002|INVENTORY_OUT'}).status,'INVALID_SOURCE_KEYS');assert.equal(commit(s,{...input,ledger_hash:''}).status,'INVALID_HASH_OR_EVENT')});
test('no Apps Script or Telegram APIs wired',()=>assert.doesNotMatch(source,/SpreadsheetApp|LockService|UrlFetchApp|bseTelegramApi_|setValue\(|appendRow\(/));
