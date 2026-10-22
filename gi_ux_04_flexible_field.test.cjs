'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const ctx={console,Date,Number,JSON,Set,bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION'};
vm.createContext(ctx);
for(const file of ['InventoryReviewTest.js','PilotBajaTest.js','PilotBajaFlexibleTest.js'])
  vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),ctx,{filename:file});
let tests=0;const t=(name,cb)=>{cb();tests++;console.log('PASS '+name)};
const parse=(s)=>ctx.bsePilotBajaParse_(s,'2026-10-23T00:20:00Z');
const result=(input)=>{const p=parse(input),c=p&&p.candidates&&p.candidates[0];assert(p&&c);return {p,c,f:c.fields};};
const outgoing=[
 'Baja out\nTarikh: 23/10/2026\nPlot: M5P34\nN',
 'Baja out\nTarikh: 23/10/2026\nPlot: M5P34\nN',
 'Baja Keluar\n23/10/26\nM5P3 F',
 'Baja out 23/10/26 M5P3 F',
 'Baja out M5P3 F 23/10/26',
 'Baja out F 23/10/26 M5P3'
];
for(let i=0;i<outgoing.length;i++){
 t('FIELD '+(i+1)+' order-independent '+i,()=>{
  const {p,f}=result(outgoing[i]);
  assert.equal(p.validation,'PASS',outgoing[i]);
  assert.equal(f.event_date,'2026-10-23');
  assert.equal(f.record_type,'INVENTORY_OUT');
  assert.equal(f.baja_items.length,i<2?2:1);
  const x=f.baja_items[0];
  assert.equal(x.baja_type,i<2?'N':'F');
  assert.equal(x.destination,'M5P3');
  if(i<2){assert.equal(f.baja_items[1].destination,'M5P4');assert.equal(f.baja_items[1].quantity,1);}
  assert.equal(x.item_name,'Baja');assert.equal(x.quantity,1);assert.equal(x.unit,'set');
  assert.equal(f.original_note,outgoing[i]);
  assert.equal(ctx.bsePilotBajaValidateResult_(p).validation,'PASS');
 });
}
const dateCases=[
 ['23/10/26','2026-10-23'],['23/10/2026','2026-10-23'],
 ['23-10-26','2026-10-23'],['23.10.2026','2026-10-23'],
 ['2026-10-23','2026-10-23'],['23 Oct 2026','2026-10-23'],
 ['23 Oktober 2026','2026-10-23'],['23 Okt 26','2026-10-23'],
 ['23 October 2026','2026-10-23'],['23-Okt-26','2026-10-23'],
 ['10 Ogos 2026','2026-08-10'],['29/02/2028','2028-02-29'],
 ['23/10/2026','2026-10-23']
];
dateCases.forEach(([date,expected])=>t('Date '+date,()=>{
  const {p,f}=result('Baja keluar N '+date+' M5P3');
  assert.equal(p.validation,'PASS',date);
  assert.equal(f.event_date,expected);
}));
t('Previous documented multi-line Masuk with two types is preserved',()=>{
 const {p,f}=result('Baja Masuk\nTarikh: 23/10/2026\nF 2\nN 3');
 assert.equal(p.validation,'PASS');assert.equal(f.baja_items.length,2);
 assert.deepEqual(JSON.parse(JSON.stringify(f.baja_items.map(i=>[i.baja_type,i.quantity,i.unit]))),
  [['F',2,'set'],['N',3,'set']]);
});
t('Aliases in/out are recognized; inline multi-item quantity is preserved',()=>{
 const {p,f}=result('Baja in F 2 N 3 23/10/26');
 assert.equal(p.validation,'PASS');assert.equal(f.record_type,'INVENTORY_IN');
 assert.deepEqual(JSON.parse(JSON.stringify(f.baja_items.map(i=>[i.baja_type,i.quantity]))),[['F',2],['N',3]]);
});
t('Single card for two types and multiple plots across flexible orders',()=>{
 const {p,f}=result('Baja out N F 23/10/26 M5P3, M6P1');
 assert.equal(p.validation,'PASS');
 assert.equal(f.baja_items.length,4);
 assert.equal(new Set(f.baja_items.map(x=>x.baja_type+'|'+x.destination)).size,4);
 assert(f.baja_items.every(x=>x.quantity===1&&x.unit==='set'));
 assert.equal((ctx.bsePilotBajaCard_('BSE-TG-1',p).match(/Baja [FN]/g)||[]).length,4);
});
t('No silently invented date or type',()=>{
 for(const s of ['Baja out 23/10/26 M5P3','Baja out F M5P3',
  'Baja Masuk F 23/10/26','Baja out 23/10/26 F']){
  const {p}=result(s);assert.equal(p.validation,'NEED_INFO',s);
 }
});
t('Invalid or ambiguous date must produce incomplete card, not Telegram date fallback',()=>{
 for(const date of ['32/10/26','31/02/2026','29/02/2026','23/10','10 Ogos 20X6']){
  const {p}=result('Baja out '+date+' M5P3 F');
  assert.equal(p.validation,'NEED_INFO',date);
 }
 const {p}=result('Baja out M5P3 F 23/10/26 24/10/26');
 assert.equal(p.validation,'NEED_INFO');
});
t('Unexpected words or extra type quantities cannot be silently dropped',()=>{
 for(const s of ['Baja out M5P3 F 23/10/26 ???',
 'Baja keluar 23/10/26 M5P3 F 0',
 'Baja Masuk 23/10/26 F -2',
 'Baja out 23/10/26 M5P3 F F']){
  const {p}=result(s);
  assert.equal(p.validation,'NEED_INFO',s);
 }
});
t('Even unparseable recognized Baja out never falls through to old multi-candidate parser',()=>{
 const p=parse('Baja out nonsense!!!');
 assert(p);
 assert.equal(p.candidates.length,1);
 assert.equal(p.candidates[0].target,'Inventory_Event_Log');
 assert.equal(p.validation,'NEED_INFO');
 assert.equal(p.production_write,false);
});
t('Other messages are not hijacked by flexible Baja parser',()=>{
 for(const s of ['merapu','REKOD BANCI POKOK','tuntutan baja RM50',
  'Baja yang mana?', '/claim','Baja racun']){
  assert.equal(parse(s),null,s);
 }
});
console.log('GI_UX_04_FLEX_FIELD '+tests+'/'+tests+' PASS');
