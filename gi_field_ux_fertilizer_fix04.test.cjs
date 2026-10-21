'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'InventoryReviewTest.js'),'utf8');
let env='PILOT_OPERATION';
const ctx={bseRuntimeEnvironmentName_:()=>env,bseCanonicalPlotTokens_:t=>({ok:true,plots:[t]}),Utilities:{formatDate:()=> '2026-10-21'},bseInventoryMalaysiaDate_:()=> '2026-10-21'};
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
test('mixed Baja In with unknown fertilizer is NEED_INFO and not partially PASS',()=>{
 env='PILOT_OPERATION';
 const r=parse('Baja In\n15/10/2026\n2 set Baja F\n3 set Baja X');
 assert.equal(r.validation,'NEED_INFO');
 assert(r.candidates.every(c=>c.validation!=='PASS'));
});
test('mixed Baja In with zero quantity is NEED_INFO and not partially PASS',()=>{
 const r=parse('Baja In\n15/10/2026\n2 set Baja F\n0 set Baja N');
 assert.equal(r.validation,'NEED_INFO');assert(r.candidates.every(c=>c.validation!=='PASS'));
});
test('mixed Baja In with unsupported unit is NEED_INFO and not partially PASS',()=>{
 const r=parse('Baja In\n15/10/2026\n2 set Baja F\n3 kg Baja N');
 assert.equal(r.validation,'NEED_INFO');assert(r.candidates.every(c=>c.validation!=='PASS'));
});
test('Baja In unknown line cannot be silently dropped',()=>{
 const r=parse('Baja In\n15/10/2026\n2 set Baja F\n3 set Product X');
 assert.equal(r.validation,'NEED_INFO');assert(r.candidates.every(c=>c.validation!=='PASS'));
});
test('Baja Out conflict F and N refuses mismatched product/quantity across plots',()=>{
 const r=parse('Baja Out\n20/10/2026\nM4P1 & M4P2\nBaja F\n3 set Baja N');
 assert.equal(r.validation,'NEED_INFO');assert(r.candidates.every(c=>c.validation!=='PASS'));
});
test('Baja Out conflict F and N refuses mismatched product/quantity on one plot',()=>{
 const r=parse('Baja Out\n20/10/2026\nM4P1\nBaja F\n3 set Baja N');
 assert.equal(r.validation,'NEED_INFO');assert(r.candidates.every(c=>c.validation!=='PASS'));
});
test('Baja Out unscoped global quantity for two plots cannot become quantity per plot',()=>{
 const r=parse('Baja Out\n20/10/2026\nM4P1 & M4P2\nBaja F\n2 set');
 assert.equal(r.validation,'NEED_INFO');assert(r.candidates.every(c=>c.validation!=='PASS'));
});
test('Baja In with Tarikh label plus responsible preserves supported multi-item grammar',()=>{
 const r=parse('Baja In\nTarikh: 15/10/2026\n2 set Baja F\n3 set Baja N\nPenanggungjawab: Ali');
 assert.equal(r.validation,'PASS');assert.equal(r.candidates.length,2);
});

test('Baja Out rejects zero quantity instead of silently defaulting to one set',()=>{
 const r=parse('Baja Out\n20/10/2026\nM4P1 & M4P2\n0 set Baja F');
 assert.equal(r.validation,'NEED_INFO');assert(r.candidates.every(c=>c.validation!=='PASS'));
});
test('Baja Out rejects unknown product despite another valid product line',()=>{
 const r=parse('Baja Out\n20/10/2026\nM4P1\nBaja F\n3 set Baja X');
 assert.equal(r.validation,'NEED_INFO');assert(r.candidates.every(c=>c.validation!=='PASS'));
});
test('Baja Out retains explicitly scoped distinct products for separate plots',()=>{
 const r=parse('Baja Out\n20/10/2026\nM4P1 Baja F\nM4P2 Baja N');
 assert.equal(r.validation,'PASS');assert.equal(r.candidates.length,2);
 assert.deepEqual(JSON.parse(JSON.stringify(r.candidates.map(c=>[c.fields.destination,c.fields.item_name,c.fields.quantity]))),[['M4P1','Fruitka',1],['M4P2','Benegro N',1]]);
});

test('invalid mixed Baja In produces a safe human follow-up, not a confirmed record',()=>{
 const r=parse('Baja In\n15/10/2026\n2 set Baja F\n3 set Baja X');
 assert.equal(r.production_write,false);
 const text=fs.readFileSync(path.join(__dirname,'TelegramWorkerTest.js'),'utf8');
 const a=text.indexOf('function bseTelegramQuestion_('),b=text.indexOf('/** Controlled PILOT-only edit',a);
 assert(a>=0&&b>a);
 const ui={bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION'};
 vm.createContext(ui);vm.runInContext(text.slice(a,b),ui);
 const question=ui.bseTelegramQuestion_(r);
 assert.match(question,/Maklumat Baja In belum lengkap/);
 assert.match(question,/Tiada rekod inventori ditulis/);
});

test('Baja Out shorthand quantity tagged N cannot be assigned to Baja F',()=>{
 const r=parse('Baja Out\n20/10/2026\nM4P1\nBaja F\n3 set N');
 assert.equal(r.validation,'NEED_INFO');assert(r.candidates.every(c=>c.validation!=='PASS'));
});
test('Baja Out single plot with matching tagged F quantity remains valid',()=>{
 const r=parse('Baja Out\n20/10/2026\nM4P1\nBaja F\n3 set F');
 assert.equal(r.validation,'PASS');assert.equal(r.candidates[0].fields.item_name,'Fruitka');assert.equal(r.candidates[0].fields.quantity,3);
});

test('native D-038 legacy compact Baja In 5 Set F remains PASS',()=>{
 const r=parse('Baja In 5 Set F');
 assert.equal(r.validation,'PASS');
 assert.equal(r.candidates.length,1);
 assert.equal(r.candidates[0].fields.item_name,'Fruitka');
 assert.equal(r.candidates[0].fields.quantity,5);
 assert.equal(r.candidates[0].fields.unit,'set');
 assert.equal(r.production_write,false);
});
test('native D-038 date-leading Baja Out AB retains exact item and quantity',()=>{
 const r=parse('02/01/2026 Baja Out 3 Set Baja AB');
 assert.equal(r.validation,'PASS');
 assert.equal(r.candidates.length,1);
 assert.equal(r.candidates[0].fields.item_name,'Baja AB');
 assert.equal(r.candidates[0].fields.quantity,3);
 assert.equal(r.candidates[0].fields.event_date,'2026-01-02');
});
test('inline compact F/N format must not re-enable unknown-item partial acceptance',()=>{
 const r=parse('Baja In 2 Set F\n3 Set X');
 assert.equal(r.validation,'NEED_INFO');
 assert.equal(r.candidates.some(c=>c.validation==='PASS'),false);
});
test('date-leading Baja Out with conflicting F/N must remain NEED_INFO',()=>{
 const r=parse('02/01/2026 Baja Out\nM4P1 & M4P2\nBaja F\n3 set Baja N');
 assert.equal(r.validation,'NEED_INFO');
 assert.equal(r.candidates.some(c=>c.validation==='PASS'),false);
});
