'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const text=fs.readFileSync(path.join(__dirname,'TelegramWorkerTest.js'),'utf8');
const a=text.indexOf('function bseTelegramQuestion_('),b=text.indexOf('/** Controlled PILOT-only edit',a);
assert(a>=0&&b>a);
let env='PILOT_OPERATION';const ctx={bseRuntimeEnvironmentName_:()=>env};
vm.createContext(ctx);vm.runInContext(text.slice(a,b),ctx);
function question(target,missing,fields){return ctx.bseTelegramQuestion_({validation:'NEED_INFO',candidates:[{target,missing,fields}]});}
test('Baja Out missing fertilizer shows copyable template and no invented product',()=>{
 const q=question('Inventory_Event_Log',['item_name','quantity'],{record_type:'INVENTORY_OUT',event_date:'2026-10-20'});
 assert.match(q,/Baja Out\nTarikh: DD\/MM\/YYYY\nM4P1 & M4P2\nBaja F/);
 assert.match(q,/Tiada rekod inventori ditulis/);
});
test('Baja In incomplete provides quantity and date template',()=>{
 const q=question('Inventory_Event_Log',['quantity'],{record_type:'INVENTORY_IN'});
 assert.match(q,/2 set Baja F\n3 set Baja N/);
});
test('census missing unique historical batch does not claim confirmation',()=>{
 const q=question('Plant_Census_Log',['crop','batch_match'],{census_entries:[{plot_id:'M1P2',reported_dead_count:143,reported_sick_count:654}]});
 assert.match(q,/M1P2/);assert.match(q,/Mati\/Sakit yang telah diberi tidak perlu diulang/);
 assert.match(q,/Tiada rekod banci disahkan/);
});
test('TEST retains existing question guidance',()=>{
 env='TEST';const q=question('Inventory_Event_Log',['item_name'],{record_type:'INVENTORY_OUT'});
 assert.doesNotMatch(q,/Contoh format:/);env='PILOT_OPERATION';
});
