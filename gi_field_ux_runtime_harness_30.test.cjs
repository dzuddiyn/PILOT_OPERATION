'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const c={};vm.createContext(c);
for(const f of ['NondeleteSheetsAdapterTest.js','NondeleteRuntimeHarness30.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),c);
const id='1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY';
const base={environment:'TEST_ONLY',production_write:false,official_bse_write:false,confirmed_fixture:true,workbook_id:id,fixture_id:'TEST_ONLY_30_A'};
function setup(){
 let locks=0,releases=0,reads=0,writes=0;
 const columns={TEST_ONLY_NONDELETE_INTENT:['approval_source_key','ledger_source_key','approval_hash','ledger_hash','event_id','status'],
 TEST_ONLY_NONDELETE_LEDGER:['source_key','payload_hash','event_id','status'],
 TEST_ONLY_NONDELETE_EVIDENCE:['approval_source_key','ledger_source_key','approval_hash','ledger_hash','event_id','verified','status'],
 TEST_ONLY_NONDELETE_RECEIPT:['receipt_id','approval_source_key','ledger_source_key','approval_hash','ledger_hash','event_id','status']};
 const book={getId:()=>id,getSheetByName:n=>columns[n]?{getLastRow:()=>1,getLastColumn:()=>columns[n].length,getRange:()=>({getValues:()=>{reads++;return [columns[n]]}}),appendRow:()=>{writes++}}:null};
 const lock={tryLock:()=>{locks++;return true},releaseLock:()=>{releases++}};
 const deps={spreadsheetApp:{openById:()=>book},lockService:{getScriptLock:()=>lock}};
 return {deps,book,lock,get locks(){return locks},get releases(){return releases},get reads(){return reads},get writes(){return writes}};
}
test('strict ID and TEST_ONLY guards reject before opening book',()=>{const f=setup();for(const x of [{workbook_id:'OTHER'},{environment:'PILOT_OPERATION'},{fixture_id:'REAL'},{production_write:true}])assert.equal(c.bseNondelete30Runtime_(f.deps,{...base,...x}).status,'DENIED');assert.equal(f.locks,0)});
test('correct bound book and exact four headers passes read-only',()=>{const f=setup();const r=c.bseNondelete30Runtime_(f.deps,base);assert.equal(r.status,'READ_ONLY_READY');assert.equal(f.locks,1);assert.equal(f.releases,1);assert.equal(f.writes,0);assert.equal(Object.keys(r.row_counts).length,4)});
test('fault injection fails closed and releases lock',()=>{const f=setup();assert.equal(c.bseNondelete30Runtime_(f.deps,{...base,fault:'AFTER_SCHEMA_CHECK'}).status,'FAIL_CLOSED');assert.equal(f.releases,1)});
test('busy lock returns without sheet operation',()=>{const f=setup();f.deps.lockService.getScriptLock=()=>({tryLock:()=>false,releaseLock:()=>{throw Error('NOT_ALLOWED')}});assert.equal(c.bseNondelete30Runtime_(f.deps,base).status,'LOCK_BUSY');assert.equal(f.reads,0)});
test('wrong opened workbook fails closed and releases lock',()=>{const f=setup();f.book.getId=()=> 'OTHER';assert.equal(c.bseNondelete30Runtime_(f.deps,base).status,'BOOK_ID_MISMATCH');assert.equal(f.releases,1)});
test('missing dependencies deny execution',()=>{assert.equal(c.bseNondelete30Runtime_({},base).status,'DEPENDENCIES_MISSING')});
