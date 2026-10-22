'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const worker=fs.readFileSync(path.join(__dirname,'TelegramWorkerTest.js'),'utf8');
const gemini=fs.readFileSync(path.join(__dirname,'GeminiUnifiedTest.js'),'utf8');
const qty=fs.readFileSync(path.join(__dirname,'PilotSeedQuantityTest.js'),'utf8');
const writer=fs.readFileSync(path.join(__dirname,'CropBatchReviewTest.js'),'utf8');
function extract(src,name){
 const start=src.indexOf('function '+name+'(');assert(start>=0,'MISSING '+name);
 let i=src.indexOf('{',start),depth=0,quote='',escaped=false;
 for(;i<src.length;i++){
  const c=src[i];if(quote){if(escaped){escaped=false;continue;}if(c==='\\'){escaped=true;continue;}if(c===quote)quote='';continue;}
  if(c==='"'||c==="'"){quote=c;continue;}
  if(c==='{')depth++;else if(c==='}'&&--depth===0)return src.slice(start,i+1);
 }throw Error('UNCLOSED '+name);
}
let env='PILOT_OPERATION';
const ctx={console,Date,JSON,Number,Set,bseRuntimeEnvironmentName_:()=>env};
vm.createContext(ctx);
for(const name of ['bseUnifiedSourceContext_','bseUnifiedAuditProvenance_',
 'bseCanonicalPlotTokens_','bseTransplantFlexibleDate_','bseSeedSowingModulePlots_','bseSeedSowingSourceFacts_'])
 vm.runInContext(extract(gemini,name),ctx);
for(const name of ['bsePilotCompactSowingResult_','bsePilotPlotFirstSowingResult_',
 'bseTelegramSeedSowingBoundaryResult_','bseTelegramSeedSowingDate_','bseTelegramSeedSowingDeterministicResult_'])
 vm.runInContext(extract(worker,name),ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'PilotSeedFlexibleTest.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'PilotSeedFreeOrderTest.js'),'utf8'),ctx);
vm.runInContext(qty,ctx);
vm.runInContext(writer,ctx);
const parse=s=>ctx.bsePilotSowingQuantityResult_(s),input='Semai\nTimun (7055 CCB)\nM3P2\n8-Aug-26\nBenih: 200 biji';
let num=0;function test(label,fn){fn();num++;console.log('PASS '+label);}
test('explicit positive count and literal unit preserved on event',()=>{
 const r=parse(input);assert.equal(r.validation,'PASS');assert.equal(r.candidates.length,3);
 const f=r.candidates.find(c=>c.target==='Planting_Event_Log').fields;
 assert.equal(f.seed_quantity,200);assert.equal(f.seed_unit,'biji');
 assert.equal(f.original_note,input);
 assert.equal(f.crop,'Timun');assert.equal(f.variety,'7055 CCB');
 assert.equal(f.event_date,'2026-08-08');
 assert.equal(r.production_write,false);
});
test('quantity and original unit are structured in canonical proposal and hash source',()=>{
 const r=parse(input);const p=ctx.bseCropBatchProposal_(JSON.stringify(r),input);
 assert.equal(p.event.fields.seed_quantity,200);
 assert.equal(p.canonical.event.seed_quantity,200);
 assert.equal(p.canonical.event.seed_unit,'biji');
 assert.equal(p.plots.join(','),'M3P2');
});
test('decimal count keeps original kilograms, no conversion to grams',()=>{
 const note=input.replace('200 biji','1,5 Kg');
 const r=parse(note);assert.equal(r.validation,'PASS');
 const f=r.candidates.find(c=>c.target==='Planting_Event_Log').fields;
 assert.equal(f.seed_quantity,1.5);assert.equal(f.seed_unit,'Kg');
 assert.equal(ctx.bseCropBatchProposal_(JSON.stringify(r),note).canonical.event.seed_unit,'Kg');
});
test('variety number never inferred as seed quantity',()=>{
 const note='Semai\nPeria Besar (936 Hua Li)\nM6P1\n31-Aug-26';
 const r=parse(note);assert.equal(r.validation,'NEED_INFO');
 assert(r.candidates.some(c=>c.missing.includes('seed_quantity')));
 assert.equal(r.candidates.find(c=>c.target==='Planting_Event_Log').fields.seed_quantity,undefined);
});
test('zero/negative/missing unit/ambiguous seeded reports fail closed',()=>{
 for(const raw of ['Benih: 0 biji','Benih: -20 biji','Benih: 200',
  'Benih: 1,2,3 biji','Benih: 200 biji\nBenih: 300 biji','Benih: 1e3 biji']){
  const note=input.replace('Benih: 200 biji',raw),r=parse(note);
  assert.equal(r.validation,'NEED_INFO',raw);
  assert(r.candidates.every(c=>c.validation==='NEED_INFO'),raw);
 }
});
test('plot-first genuine report accepts appended Benih',()=>{
 const note='M3P1\nSemai\nTimun (7055 CCB)\n8-Aug-26\nKuantiti Benih: 2 tray';
 const r=parse(note);assert.equal(r.validation,'PASS');
 assert.equal(r.candidates.find(c=>c.target==='Planting_Event_Log').fields.seed_unit,'tray');
});
test('structured KERJA SEMAIAN BENIH uses original date/plot and quantity',()=>{
 const note='KERJA SEMAIAN BENIH\nJenis Tanaman: Timun (7055 CCB)\nModul: M3P2\nTarikh Semai: 8/8/2026\nBenih: 50 paket';
 const r=parse(note);assert.equal(r.validation,'PASS');
 const proposal=ctx.bseCropBatchProposal_(JSON.stringify(r),note);
 assert.equal(proposal.event.fields.seed_quantity,50);assert.equal(proposal.event.fields.seed_unit,'paket');
});
test('missing quantity blocks callback proposal at validator boundary',()=>{
 const note=input.replace('\nBenih: 200 biji','');
 const r=parse(note);assert.equal(r.validation,'NEED_INFO');
 assert.throws(()=>ctx.bseCropBatchProposal_(JSON.stringify(r),note),/tidak sah/);
});
test('event-level quantities do not alter allocation status or plant lifecycle',()=>{
 const r=parse(input),p=ctx.bseCropBatchProposal_(JSON.stringify(r),input);
 assert.equal(p.batch.fields.batch_status,'PROPOSED');
 assert.equal(p.event.fields.event_status,'PROPOSED');
 assert.equal(p.allocations[0].fields.allocation_status,'PLANNED');
 assert.equal(p.allocations[0].fields.seed_quantity,undefined);
});
test('no extra event sheets or production writer added',()=>{
 assert(!/function\s+bsePilotSeedQuantityReviewCore_/.test(qty));
 assert(!/appendRow|setValues|SpreadsheetApp/.test(qty));
 assert(worker.includes('bsePilotSowingQuantityResult_(job.input)'));
 assert(writer.includes("'seed_quantity','seed_unit'"));
});
test('nonpilot parser wrapper declines and TEST remains unchanged',()=>{
 env='TEST';assert.equal(parse(input),null);env='PILOT_OPERATION';
});
test('new event schema has trailing additive seed fields',()=>{
 const h=Array.from(vm.runInContext('BSE_PLANTING_EVENT_HEADERS',ctx));
 assert.deepEqual(h.slice(-2),['seed_quantity','seed_unit']);
 assert.equal(h[13],'payload_hash');assert.equal(h.length,16);
});
test('flexible dates and plot shorthand are grounded per allocation',()=>{
 const cases=[
 ['M1P12','23/10/26',['M1P1','M1P2']],
 ['M1P1,2','23/10/2026',['M1P1','M1P2']],
 ['M1 P1,2','23 Okt 26',['M1P1','M1P2']],
 ['M1P1,P2','23 Oktober 2026',['M1P1','M1P2']],
 ['M1P1 & P2','2026-10-23',['M1P1','M1P2']],
 ['M1P1 dan M1P2','23.10.2026',['M1P1','M1P2']],
 ['M1P1, M2P3','23-10-26',['M1P1','M2P3']],
 ['M1 P1 P2','23/10',['M1P1','M1P2']],
 ['M1P10','23/10/26',['M1P10']]
 ];
 for(const [plot,date,expected] of cases){
   const note='Semai\nTimun (7055 CCB)\n'+plot+'\n'+date+'\nBenih: 200 biji';
   const r=parse(note);
   assert.equal(r.validation,'PASS',plot+' '+date+' -> '+JSON.stringify(r.candidates[0].missing));
   assert.equal(r.candidates[0].fields.event_date,'2026-10-23');
   assert.deepEqual(JSON.parse(JSON.stringify(r.candidates.filter(x=>x.target==='Plot_Allocation_Log').map(x=>x.fields.plot_id))),expected);
   assert.equal(ctx.bseCropBatchProposal_(JSON.stringify(r),note).canonical.event.seed_quantity,200);
 }
});
test('date before plot and plot-first variants preserve quantities',()=>{
 for(const note of [
   'Semai\nTimun (7055 CCB)\n23 Okt 26\nM1P12\nBenih: 12 paket',
   'M1P1,2\nSemai\nTimun (7055 CCB)\n23/10/2026\nBenih: 12 paket'
 ]){
   const r=parse(note);assert.equal(r.validation,'PASS',note);
   assert.equal(r.candidates.filter(x=>x.target==='Plot_Allocation_Log').length,2);
   assert.equal(r.candidates[1].fields.seed_quantity,12);
   assert.equal(r.candidates[1].fields.seed_unit,'paket');
 }
});
test('structured Semai accepts flexible plot and natural date',()=>{
 const note='KERJA SEMAIAN BENIH\nJenis Tanaman: Timun (7055 CCB)\nModul: M1P1,2\nTarikh Semai: 23 Oktober 2026\nBenih: 200 biji';
 const r=parse(note);assert.equal(r.validation,'PASS',JSON.stringify(r));
 assert.equal(r.candidates.filter(x=>x.target==='Plot_Allocation_Log').length,2);
 assert.equal(ctx.bseCropBatchProposal_(JSON.stringify(r),note).canonical.event.seed_unit,'biji');
});
test('invalid plot syntax, duplicate plots or invalid dates fail closed',()=>{
 for(const line of ['M1P123','M1P11','M1P1, M1P1','M1P1,2,3','M1P0']){
   const note='Semai\nTimun (7055 CCB)\n'+line+'\n23/10/26\nBenih: 200 biji';
   const r=parse(note);assert.equal(r.validation,'NEED_INFO',line);
 }
 for(const date of ['32/10/26','31/02/2026','23 Disember 2027','2026-13-22']){
   const note='Semai\nTimun (7055 CCB)\nM1P12\n'+date+'\nBenih: 200 biji';
   const r=parse(note);assert.equal(r.validation,'NEED_INFO',date);
 }
});
test('unit missing is explicitly flagged',()=>{
 const note=input.replace('Benih: 200 biji','Benih: 200');
 const r=parse(note);assert.equal(r.validation,'NEED_INFO');
 assert(r.candidates.some(c=>c.missing.includes('seed_unit')));
});
test('final gate restores mandatory missing quantity after generic schema reset',()=>{
 const note='Semai\nTimun (7055 CCB)\nM1P12\n23 Okt 26';
 const r=parse(note);
 r.validation='PASS';r.candidates.forEach(c=>{c.validation='PASS';c.missing=[];});
 const secured=ctx.bsePilotSeedFinalizeGate_(r,note);
 assert.equal(secured.validation,'NEED_INFO');
 assert(secured.candidates.every(c=>c.missing.includes('seed_quantity')&&c.missing.includes('seed_unit')));
});
test('final gate blocks changed plot/date even with quantity present',()=>{
 const r=parse(input);r.candidates.find(c=>c.target==='Plot_Allocation_Log').fields.plot_id='M8P8';
 assert.equal(ctx.bsePilotSeedFinalizeGate_(r,input).validation,'NEED_INFO');
});
test('final gate allows grounded plot pair, qty and unchanged raw unit',()=>{
 const note='Semai\nTimun (7055 CCB)\nM1P12\n23 Okt 26\nBenih: 200 biji';
 const r=ctx.bsePilotSeedFinalizeGate_(parse(note),note);
 assert.equal(r.validation,'PASS');
 assert.equal(r.candidates.filter(c=>c.target==='Plot_Allocation_Log').length,2);
 assert.equal(r.candidates.find(c=>c.target==='Planting_Event_Log').fields.seed_unit,'biji');
});
test('FIELD exact report A: date first, crop/plot/quantity combined',()=>{
 const note='Semai\n23/10/26\nTimun (7055 CCB) M1P1,2 65 tray';
 const r=parse(note);
 assert.equal(r.validation,'PASS',JSON.stringify(r.candidates.map(c=>c.missing)));
 const evt=r.candidates.find(c=>c.target==='Planting_Event_Log').fields;
 assert.equal(evt.event_date,'2026-10-23');
 assert.equal(evt.crop,'Timun');assert.equal(evt.variety,'7055 CCB');
 assert.equal(evt.seed_quantity,65);assert.equal(evt.seed_unit,'tray');
 assert.equal(evt.original_note,note);
 assert.deepEqual(JSON.parse(JSON.stringify(r.candidates.filter(c=>c.target==='Plot_Allocation_Log').map(c=>c.fields.plot_id))),['M1P1','M1P2']);
 assert.equal(ctx.bsePilotSeedFinalizeGate_(r,note).validation,'PASS');
 const canon=ctx.bseCropBatchProposal_(JSON.stringify(r),note).canonical.event;
 assert.equal(canon.seed_quantity,65);assert.equal(canon.seed_unit,'tray');
});
test('FIELD exact report B: crop/date together; amount then plot',()=>{
 const note='Semai\nTimun (7055 CCB) 23/10/26\n65 tray M1P1,2';
 const r=parse(note);assert.equal(r.validation,'PASS',JSON.stringify(r.candidates.map(c=>c.missing)));
 assert.equal(r.candidates.find(c=>c.target==='Planting_Event_Log').fields.seed_quantity,65);
 assert.equal(r.candidates.find(c=>c.target==='Planting_Event_Log').fields.seed_unit,'tray');
 assert.equal(r.candidates.filter(c=>c.target==='Plot_Allocation_Log').length,2);
 assert.equal(ctx.bsePilotSeedFinalizeGate_(r,note).validation,'PASS');
});
test('free order accepts single-line, date/plot permutations without a Benih label',()=>{
 const samples=[
 'Semai Timun (7055 CCB) 65 tray M1P12 23 Okt 26',
 'Semai\nM1 P1,2 65 tray Timun (7055 CCB) 23 Oktober 2026',
 'Semai\n65 tray M1P1,P2 2026-10-23 Timun (7055 CCB)',
 'Semai\nTimun (7055 CCB) M1P1 & P2 23-10-26 65 tray',
 'Semai\n23.10.2026 Timun (7055 CCB) 65 tray M1P12',
 'Semai\nM1P1, M1P2\nTimun (7055 CCB) 65 tray\n23/10/2026'
 ];
 for(const note of samples){
   const r=parse(note);assert.equal(r.validation,'PASS',note+' '+JSON.stringify(r.candidates.map(c=>c.missing)));
   const evt=r.candidates.find(c=>c.target==='Planting_Event_Log').fields;
   assert.equal(evt.event_date,'2026-10-23',note);
   assert.equal(evt.seed_quantity,65,note);assert.equal(evt.seed_unit,'tray',note);
   assert.equal(r.candidates.filter(c=>c.target==='Plot_Allocation_Log').length,2,note);
 }
});
test('free order missing date, plot, quantity, unit block Benar',()=>{
 const samples=[
 'Semai\nTimun (7055 CCB) M1P1,2 65 tray',
 'Semai\n23/10/26 Timun (7055 CCB) 65 tray',
 'Semai\n23/10/26 Timun (7055 CCB) M1P1,2',
 'Semai\n23/10/26 Timun (7055 CCB) M1P1,2 65'
 ];
 for(const note of samples){
   const r=parse(note);assert.equal(r.validation,'NEED_INFO',note);
   assert.equal(ctx.bsePilotSeedFinalizeGate_(r,note).validation,'NEED_INFO',note);
 }
});
test('free order rejects extra ambiguous tokens and duplicate dates/plots',()=>{
 const bad=[
 'Semai\n23/10/26 Timun (7055 CCB) M1P1,2 65 tray nonsense',
 'Semai 23/10/26 24/10/26 Timun (7055 CCB) M1P12 65 tray',
 'Semai\n23/10/26 Timun (7055 CCB) M1P12 M1P1 65 tray',
 'Semai\n23/10/26 Timun (7055 CCB) M1P123 65 tray',
 'Semai\n31/02/2026 Timun (7055 CCB) M1P12 65 tray',
 'Semai\n23/10/26 Timun (7055 CCB) M1P12 0 tray'
 ];
 for(const note of bad){assert.equal(parse(note).validation,'NEED_INFO',note);}
});
test('bare seed quantity is NEVER inferred from parenthesized variety',()=>{
 const note='Semai\nTimun (7055 CCB) M1P1,2 23/10/26';
 const r=parse(note);assert.equal(r.validation,'NEED_INFO');
 assert.equal(r.candidates.find(c=>c.target==='Planting_Event_Log').fields.seed_quantity,undefined);
 assert(r.candidates.some(c=>c.missing.includes('seed_quantity')));
});
test('no extra write path and original labelled reports still accepted',()=>{
 const note='Semai\nTimun (7055 CCB)\nM1P1,2\n23/10/26\nBenih: 200 biji';
 const r=parse(note);assert.equal(r.validation,'PASS');
 assert.equal(r.candidates.find(c=>c.target==='Planting_Event_Log').fields.seed_quantity,200);
 const free=fs.readFileSync(path.join(__dirname,'PilotSeedFreeOrderTest.js'),'utf8');
 assert(!/appendRow|insertSheet|setValues|SpreadsheetApp/.test(free));
});
console.log('GI_UX_05_SEED_QUANTITY '+num+'/'+num+' PASS');
