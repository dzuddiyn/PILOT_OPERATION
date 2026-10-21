'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const src=fs.readFileSync(__dirname+'/DeleteRecoveryTest.js','utf8');const env={};vm.createContext(env);vm.runInContext(src,env);
const input={transaction_id:'R13-TEST0001',approval_source_key:'BSE-TG-9911|Inventory_Event_Log|C1',ledger_source_key:'BSE-TG-9911|INVENTORY_OUT',ledger_hash:'a'.repeat(64),approval_hash:'b'.repeat(64),event_id:'TEST_ONLY_EVENT',authorized:true,approval_status:'REPORTER_CONFIRMED'};
function store(){const journal=new Map(),ledger=new Map(),receipt=new Map();const count={journal:0,ledger:0,receipt:0};return {journal,ledger,receipt,count,
 readJournal:k=>journal.get(k),readLedger:k=>ledger.get(k),readReceipt:k=>receipt.get(k),
 writeJournal:v=>{count.journal++;journal.set(v.transaction_id,{...v})},
 writeLedger:v=>{count.ledger++;ledger.set(v.source_key,{...v})},
 writeReceipt:v=>{count.receipt++;receipt.set(v.transaction_id,{...v})}}}
const run=s=>env.bseDeleteRecovery13Run_(s,input);
test('PREPARED journal precedes ledger write',()=>{const s=store(),events=[];const j=s.writeJournal,l=s.writeLedger;s.writeJournal=v=>{events.push('J:'+v.status);j(v)};s.writeLedger=v=>{events.push('L');l(v)};assert.equal(run(s).status,'COMMITTED_SYNTHETIC');assert(events.indexOf('J:PREPARED')<events.indexOf('L'))});
test('full replay idempotent',()=>{const s=store();assert.equal(run(s).status,'COMMITTED_SYNTHETIC');assert.equal(run(s).status,'ALREADY_APPLIED');assert.equal(s.count.ledger,1);assert.equal(s.count.receipt,1)});
for(const stage of ['journal','ledger','receipt']){
 test('crash at '+stage+' write, restart and reconcile',()=>{
  const s=store(),actual=s['write'+stage[0].toUpperCase()+stage.slice(1)];let once=true;
  s['write'+stage[0].toUpperCase()+stage.slice(1)]=v=>{actual(v);if(once){once=false;throw Error('TEST_ONLY_CRASH')}};
  assert.throws(()=>run(s),/TEST_ONLY_CRASH/);
  assert.equal(run(s).status,'COMMITTED_SYNTHETIC');
  assert.equal(run(s).status,'ALREADY_APPLIED');
  assert.equal(s.count.ledger,1);assert.equal(s.count.receipt,1);
 });
}
test('existing ledger without journal cannot be retroactively minted',()=>{const s=store();s.writeLedger({source_key:input.ledger_source_key});assert.equal(run(s).status,'PREEXISTING_DATA_UNVERIFIED');assert.equal(s.receipt.size,0)});
test('stale approval cannot write any journal',()=>{const s=store();assert.equal(env.bseDeleteRecovery13Run_(s,{...input,approval_status:'OPEN'}).status,'APPROVAL_REQUIRED');assert.equal(s.journal.size,0)});
test('journal identity mismatch fails closed',()=>{const s=store();run(s);const alt={...input,ledger_hash:'c'.repeat(64)};assert.equal(env.bseDeleteRecovery13Run_(s,alt).status,'JOURNAL_CONFLICT')});
test('no actual Sheets or Telegram write integration',()=>assert.doesNotMatch(src,/SpreadsheetApp|UrlFetchApp|LockService|bseTelegramApi_|appendRow\(|setValue\(/));
