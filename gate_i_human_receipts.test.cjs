'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const src=fs.readFileSync('TelegramApprovalUiTest.js','utf8');
const start=src.indexOf('function bseTelegramConfirmedPersistedSummary_(');
const end=src.indexOf('function bseTelegramReporterConfirmationCore_(',start);
assert(start>=0&&end>start);
const ctx=vm.createContext({bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION'});
vm.runInContext(src.slice(start,end),ctx);
const ref='BSE-TG-772257249',key=ref+'|Crop_Batch_Log';
function book(data){return{getSheetByName:name=>data[name]?{getLastRow:()=>data[name].rows.length+1,getLastColumn:()=>data[name].headers.length,getRange:()=>({getValues:()=>[data[name].headers,...data[name].rows]})}:null};}
const sow={
TEST_CROP_BATCH:{headers:['source_key','batch_id','event_date','crop','variety','verification_status'],rows:[[key,'BSE-SB-CB-20261005-001','2026-10-05','Cucumber 6656','282 CP','PROVISIONAL']]},
TEST_PLANTING_EVENT:{headers:['source_key','event_type'],rows:[[key,'SEED_SOWING']]},
TEST_PLOT_ALLOCATION:{headers:['source_key','plot_id','allocation_status'],rows:[[key,'M5P3','PLANNED'],[key,'M5P4','PLANNED']]}
};
let count=0;function test(label,fn){fn();count++;console.log('PASS '+label);}
const sum=ctx.bseTelegramConfirmedPersistedSummary_(book(sow),ref,'Crop_Batch_Log',{source_key:key});
test('snapshot sowing receipt contains date, crop and both plots',()=>{for(const x of ['REKOD SEMAIAN DISIMPAN','05/10/2026','Cucumber 6656 (282 CP)','M5P3, M5P4','2 plot'])assert(sum.includes(x),x);});
test('no internal identifiers or English column dumps',()=>{for(const x of ['BSE-SB-CB-20261005-001','PLOT ALLOCATION','PLANTING EVENT','batch_id','plot id','verification status','PROVISIONAL'])assert(!sum.includes(x),x);});
test('provisional review stays internal; receipt states reporter confirmation only',()=>{assert(sum.includes('Pengesahan: Disahkan pelapor'));assert(!sum.includes('Status verifikasi: Disahkan dalam pilot'));assert.equal(sow.TEST_CROP_BATCH.rows[0][5],'PROVISIONAL');});
test('missing one of three tables fails closed',()=>{const x={...sow};delete x.TEST_PLANTING_EVENT;assert.equal(ctx.bseTelegramConfirmedPersistedSummary_(book(x),ref,'Crop_Batch_Log',{source_key:key}),'');});
test('duplicate plot rows fail closed',()=>{const x={...sow,TEST_PLOT_ALLOCATION:{...sow.TEST_PLOT_ALLOCATION,rows:[[key,'M5P3','PLANNED'],[key,'M5P3','PLANNED']]}};assert.equal(ctx.bseTelegramConfirmedPersistedSummary_(book(x),ref,'Crop_Batch_Log',{source_key:key}),'');});
test('missing plot fails closed',()=>{const x={...sow,TEST_PLOT_ALLOCATION:{...sow.TEST_PLOT_ALLOCATION,rows:[[key,'','PLANNED']]}};assert.equal(ctx.bseTelegramConfirmedPersistedSummary_(book(x),ref,'Crop_Batch_Log',{source_key:key}),'');});
test('mixed plot statuses fail closed',()=>{const x={...sow,TEST_PLOT_ALLOCATION:{...sow.TEST_PLOT_ALLOCATION,rows:[[key,'M5P3','PLANNED'],[key,'M5P4','ACTIVE']]}};assert.equal(ctx.bseTelegramConfirmedPersistedSummary_(book(x),ref,'Crop_Batch_Log',{source_key:key}),'');});
test('conflicting batch linkage fails closed',()=>{const x={...sow,TEST_PLANTING_EVENT:{headers:['source_key','event_type','batch_id'],rows:[[key,'SEED_SOWING','OTHER-BATCH']]}};assert.equal(ctx.bseTelegramConfirmedPersistedSummary_(book(x),ref,'Crop_Batch_Log',{source_key:key}),'');});
test('wrong activity type fails closed',()=>{const x={...sow,TEST_PLANTING_EVENT:{headers:['source_key','event_type'],rows:[[key,'TRANSPLANT']]}};assert.equal(ctx.bseTelegramConfirmedPersistedSummary_(book(x),ref,'Crop_Batch_Log',{source_key:key}),'');});
test('cross-ref lookup never returns another report',()=>assert.equal(ctx.bseTelegramConfirmedPersistedSummary_(book(sow),'BSE-TG-1','Crop_Batch_Log',{source_key:key}),''));
const invkey='BSE-TG-55|Inventory_Event_Log',inv=book({TEST_INVENTORY_EVENT:{headers:['source_key','event_date','item_name','quantity','unit'],rows:[[invkey,'2026-10-20','Fruitka',2,'kg']]}});
const msg=ctx.bseTelegramConfirmedPersistedSummary_(inv,'BSE-TG-55','Inventory_Event_Log',{source_key:invkey});
test('other module fallback humanized and saved values',()=>assert(msg.includes('REKOD STOK DISIMPAN')&&msg.includes('Barang: Fruitka')&&msg.includes('Kuantiti: 2')&&msg.includes('Unit: kg')&&!msg.includes('item_name')));
const tkey='BSE-TG-56|Treatment_Event_Log',tx=book({TEST_TREATMENT_EVENT:{headers:['source_key','event_date','crop','plot_ids','treatment_description'],rows:[[tkey,'2026-10-22','Peria','M3P3|M3P4','Amirstartop - 200, Calcium - 300']]}});
test('generic treatment keeps dose details and plots',()=>{const t=ctx.bseTelegramConfirmedPersistedSummary_(tx,'BSE-TG-56','Treatment_Event_Log',{source_key:tkey});assert(t.includes('Rawatan: Amirstartop - 200, Calcium - 300')&&t.includes('M3P3|M3P4'));});
test('non-pilot unchanged',()=>{ctx.bseRuntimeEnvironmentName_=()=> 'PILOT_TEST';assert.equal(ctx.bseTelegramConfirmedPersistedSummary_(book(sow),ref,'Crop_Batch_Log',{source_key:key}),'');});
console.log('HUMAN_RECEIPTS '+count+'/'+count+' PASS');
