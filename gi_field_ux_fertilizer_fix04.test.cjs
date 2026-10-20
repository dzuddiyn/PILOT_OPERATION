'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'InventoryReviewTest.js'),'utf8');
let env='PILOT_OPERATION';
const ctx={bseRuntimeEnvironmentName_:()=>env,bseCanonicalPlotTokens_:t=>({ok:true,plots:[t]}),bseInventoryMalaysiaDate_:()=> '2026-10-21'};
vm.createContext(ctx);vm.runInContext(src,ctx);
const parse=(msg)=>ctx.bseInventoryParseMessage_(msg,'2026-10-21T00:00:00Z');
test('multiple fertilizer receipts preserve separate quantities and explicit date',()=>{
 const r=parse('Baja in\n15/10/2026\n2 set Baja F\n3 set Baja N');
 assert.equal(r.validation,'PASS');assert.equal(r.candidates.length,2);
 assert.deepEqual(JSON.parse(JSON.stringify(r.candidates.map(c=>[c.fields.item_name,c.fields.quantity,c.fields.unit,c.fields.event_date]))),[['Fruitka',2,'set','2026-10-15'],['Benegro N',3,'set','2026-10-15']]);
});
test('duplicate same fertilizer remains NEED_INFO, not silently combined',()=>{
 const r=parse('Baja in\n15/10/2026\n2 set Baja F\n3 set Baja F');assert.equal(r.validation,'NEED_INFO');
});
test('out with missing product fails closed even when 2 plots exist',()=>{
 const r=parse('Baja out\n20/10/2026\nM4P1 & M4P2');assert.equal(r.validation,'NEED_INFO');
});
test('scoped one-set does not apply in TEST',()=>{
 env='TEST';const r=parse('Baja out\n20/10/2026\nM4P1 & M4P2\nBaja F');assert.equal(r.validation,'NEED_INFO');env='PILOT_OPERATION';
});
test('one set per plot only when fertilizer item explicit',()=>{
 env='PILOT_OPERATION';
 const a=parse('Baja out\n20/10/2026\nM4P1 & M4P2\nBaja F');
 const b=parse('Baja out\nM4P1 & M4P2\nBaja F\n20/10/2026');
 for(const r of [a,b]){
   assert.equal(r.validation,'PASS');
   assert.equal(r.candidates.length,2);
   assert.deepEqual(JSON.parse(JSON.stringify(r.candidates.map(c=>[c.fields.destination,c.fields.item_name,c.fields.quantity,c.fields.unit,c.fields.event_date]))),[
     ['M4P1','Fruitka',1,'set','2026-10-20'],['M4P2','Fruitka',1,'set','2026-10-20']
   ]);
 }
});
test('legacy TEST never inherits one-set rule',()=>{
 env='TEST';const r=parse('Baja out\nM4P1 & M4P2\nBaja F\n20/10/2026');
 assert.equal(r.validation,'NEED_INFO');env='PILOT_OPERATION';
});