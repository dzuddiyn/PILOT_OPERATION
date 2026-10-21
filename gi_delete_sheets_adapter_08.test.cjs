'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname+'/DeletePersistenceTest.js','utf8'),ctx);
vm.runInContext(fs.readFileSync(__dirname+'/DeleteSheetsAdapterTest.js','utf8'),ctx);
const hash='a'.repeat(64),key='BSE-TG-1|Inventory_Event_Log|C1',ledger='BSE-TG-1|INVENTORY_OUT';
const bh=['approval_source_key','ledger_source_key','payload_hash','revision','status'],jh=['transaction_id','status','approval_source_key','ledger_source_key','expected_hash','expected_revision'],lh=['source_key','status','payload_hash','revision'];
function sheet(rows){return {rows,getDataRange(){return {getValues:()=>this.rows.map(r=>r.slice())}},getRange(n,_c,_count,_width){return {setValues:values=>{this.rows[n-1]=values[0].slice()}}},appendRow(r){this.rows.push(r.slice())}}}
function fixture(){const binding=sheet([bh.slice(),[key,ledger,hash,1,'VERIFIED']]),journal=sheet([jh.slice()]),events=sheet([lh.slice(),[ledger,'APPROVED_TEST',hash,1]]);const store=ctx.bseDelete08Store_(binding,journal,events,lh);return {binding,journal,events,store}}
const plan={status:'READY_NO_WRITE',transaction_id:'D06-SYNTH0008',source_key:ledger,approval_source_key:key,expected_hash:hash,expected_revision:1};
function lock(){return {held:false,released:false,tryLock(){this.held=true;return true},releaseLock(){this.released=true}}}
test('Sheets-shaped adapter write/readback with lock',()=>{const f=fixture(),l=lock();assert.equal(ctx.bseDelete08LockedPrepare_(l,f.store,plan).status,'PREPARED');assert.equal(f.journal.rows.length,2);assert.equal(l.released,true);assert.equal(f.store.readJournal(plan.transaction_id).source_key,ledger)});
test('restart builds new adapter over persisted sheet rows',()=>{const f=fixture();ctx.bseDelete08LockedPrepare_(lock(),f.store,plan);const again=ctx.bseDelete08Store_(f.binding,f.journal,f.events,lh);assert.equal(ctx.bseDelete08LockedPrepare_(lock(),again,plan).status,'ALREADY_PREPARED')});
test('duplicate binding fails closed',()=>{const f=fixture();f.binding.rows.push(f.binding.rows[1].slice());assert.throws(()=>ctx.bseDelete08LockedPrepare_(lock(),f.store,plan),/DUPLICATE_KEY/)});
test('missing revision field in ledger is refused',()=>{const f=fixture();const bad=ctx.bseDelete08Store_(f.binding,f.journal,f.events,['source_key','status','payload_hash']);assert.throws(()=>bad.readLedger(ledger),/SCHEMA_MISMATCH|LEDGER_SCHEMA_MISMATCH/)});
test('schema drift refused before writes',()=>{const f=fixture();f.binding.rows[0][1]='wrong';assert.throws(()=>ctx.bseDelete08LockedPrepare_(lock(),f.store,plan),/SCHEMA_MISMATCH/);assert.equal(f.journal.rows.length,1)});
test('lock unavailable prevents journal write',()=>{const f=fixture();assert.equal(ctx.bseDelete08LockedPrepare_({tryLock:()=>false},f.store,plan).status,'LOCK_BUSY');assert.equal(f.journal.rows.length,1)});
test('simulated crash on readback is not a claimed success',()=>{const f=fixture(),write=f.journal.appendRow;f.journal.appendRow=function(row){write.call(this,row);this.getDataRange=()=>({getValues:()=>[jh]})};assert.equal(ctx.bseDelete08LockedPrepare_(lock(),f.store,plan).status,'WRITE_OUTCOME_UNKNOWN')});
test('adapter never invokes operational void or Telegram API',()=>{const src=fs.readFileSync(__dirname+'/DeleteSheetsAdapterTest.js','utf8');assert.doesNotMatch(src,/VOIDED_TEST|bseTelegramApi_|setMyCommands|processBseTelegram/);});
