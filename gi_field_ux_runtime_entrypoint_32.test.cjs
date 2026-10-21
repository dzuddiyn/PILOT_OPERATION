'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const ctx={};vm.createContext(ctx);
for(const file of ['NondeleteSheetsAdapterTest.js','NondeleteRuntimeHarness30.js','NondeleteRuntimeEntrypoint32.js'])
 vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),ctx);
const cols={TEST_ONLY_NONDELETE_INTENT:6,TEST_ONLY_NONDELETE_LEDGER:4,TEST_ONLY_NONDELETE_EVIDENCE:7,TEST_ONLY_NONDELETE_RECEIPT:7};
function fixtures(){
 let released=0,opened=0;
 const book={getId:()=> '1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY',getSheetByName:n=>cols[n]&&{
  getLastRow:()=>1,getLastColumn:()=>cols[n],
  getRange:()=>({getValues:()=>[({TEST_ONLY_NONDELETE_INTENT:['approval_source_key','ledger_source_key','approval_hash','ledger_hash','event_id','status'],TEST_ONLY_NONDELETE_LEDGER:['source_key','payload_hash','event_id','status'],TEST_ONLY_NONDELETE_EVIDENCE:['approval_source_key','ledger_source_key','approval_hash','ledger_hash','event_id','verified','status'],TEST_ONLY_NONDELETE_RECEIPT:['receipt_id','approval_source_key','ledger_source_key','approval_hash','ledger_hash','event_id','status']})[n]]})
 }};
 const deps={spreadsheetApp:{openById:()=>{opened++;return book}},lockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{released++}})}};
 return {deps,get released(){return released},get opened(){return opened}};
}
test('entrypoint calls approved read-only harness with exact guards',()=>{const f=fixtures();const r=ctx.bseNondelete32Invoke_(f.deps);assert.equal(r.status,'READ_ONLY_READY');assert.equal(r.production_write,false);assert.equal(r.official_bse_write,false);assert.equal(f.opened,1);assert.equal(f.released,1)});
test('injected dependencies required',()=>assert.equal(ctx.bseNondelete32Invoke_({}).status,'DEPENDENCIES_MISSING'));
test('zero argument entrypoint passes globals only',()=>{const f=fixtures();ctx.SpreadsheetApp=f.deps.spreadsheetApp;ctx.LockService=f.deps.lockService;const r=ctx.bseNondelete32ReadOnlyProof();assert.equal(r.status,'READ_ONLY_READY');assert.equal(f.released,1)});
