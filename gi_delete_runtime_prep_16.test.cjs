'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const ctx={};vm.createContext(ctx);
for(const file of ['DeletePersistenceTest.js','DeleteSheetsAdapterTest.js','DeleteRuntimePrepTest.js'])
 vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),ctx);
const hash='a'.repeat(64),approval='BSE-TG-1000|Inventory_Event_Log|C1',ledger='BSE-TG-1000|INVENTORY_OUT';
const bindingHeaders=['approval_source_key','ledger_source_key','payload_hash','revision','status'];
const journalHeaders=['transaction_id','status','approval_source_key','ledger_source_key','expected_hash','expected_revision'];
const ledgerHeaders=['source_key','status','payload_hash','revision'];
function sheet(rows){return {rows,getDataRange(){return {getValues:()=>this.rows.map(r=>r.slice())}},getRange(i){return {setValues:values=>{this.rows[i-1]=values[0].slice()}}},appendRow:r=>rows.push(r.slice())}}
function context(){
 const bs=sheet([bindingHeaders,[approval,ledger,hash,1,'VERIFIED']]),js=sheet([journalHeaders]),ls=sheet([ledgerHeaders,[ledger,'APPROVED_TEST',hash,1]]);
 const store=ctx.bseDelete08Store_(bs,js,ls,ledgerHeaders),lock={released:false,tryLock:()=>true,releaseLock(){this.released=true}};
 const plan={status:'READY_NO_WRITE',transaction_id:'D06-SYNTH0016',source_key:ledger,approval_source_key:approval,expected_hash:hash,expected_revision:1};
 return {bs,js,ls,store,lock,plan,input:{environment:'TEST_ONLY',production_write:false,official_bse_write:false,enable_delete:false,enable_commit:false,plan}};
}
test('TEST_ONLY prepares journal without operational ledger mutation',()=>{const f=context(),before=JSON.stringify(f.ls.rows);const out=ctx.bseDeleteRuntime16Prepare_(f,f.input);assert.equal(out.status,'PREPARED');assert.equal(f.js.rows.length,2);assert.equal(JSON.stringify(f.ls.rows),before);assert.equal(f.lock.released,true)});
test('forbidden PILOT_OPERATION refused with no journal mutation',()=>{const f=context();const out=ctx.bseDeleteRuntime16Prepare_(f,{...f.input,environment:'PILOT_OPERATION'});assert.equal(out.status,'ENVIRONMENT_DENIED');assert.equal(f.js.rows.length,1)});
test('runtime enable flags explicitly denied',()=>{const f=context();assert.equal(ctx.bseDeleteRuntime16Prepare_(f,{...f.input,enable_delete:true}).status,'RUNTIME_DISABLED');assert.equal(ctx.bseDeleteRuntime16Prepare_(f,{...f.input,enable_commit:true}).status,'RUNTIME_DISABLED');assert.equal(f.js.rows.length,1)});
test('missing deps fail closed',()=>{const f=context();assert.equal(ctx.bseDeleteRuntime16Prepare_({},f.input).status,'DEPENDENCIES_MISSING')});
test('idempotent preparation',()=>{const f=context();assert.equal(ctx.bseDeleteRuntime16Prepare_(f,f.input).status,'PREPARED');assert.equal(ctx.bseDeleteRuntime16Prepare_(f,f.input).status,'ALREADY_PREPARED');assert.equal(f.js.rows.length,2)});
test('schema drift fails without mutation',()=>{const f=context();f.bs.rows[0][1]='broken';assert.equal(ctx.bseDeleteRuntime16Prepare_(f,f.input).status,'PREPARATION_FAILED');assert.equal(f.js.rows.length,1)});
test('no live API or void instructions',()=>{const src=fs.readFileSync(__dirname+'/DeleteRuntimePrepTest.js','utf8');assert.doesNotMatch(src,/SpreadsheetApp|UrlFetchApp|bseTelegramApi_|VOIDED_TEST|setValue\(|appendRow\(/)});
