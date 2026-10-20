'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx={console,bsePlantCensusMalaysiaDate_:()=> '2026-10-21',bsePlotSingleLocation_:s=>({plot_id:s}),bsePlantCensusSource_:()=>null};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname+'/CensusReviewTest.js','utf8'),ctx);
let checks=0;const test=(name,fn)=>{fn();console.log('PASS '+name);checks++};
const aliases=['REKOD BANCI POKOK','pokok sakit','pokok mati','banci pokok','banci tanaman','kira pokok','kiraan pokok'];
for(const label of aliases){
 test('detect census tag '+label,()=>assert(ctx.bseCensusOperationalSignal_(label+'\n6/10/26')));
}
for(const [raw,expected] of [
 ['6/10/26','2026-10-06'],['06/10/2026','2026-10-06'],['6-10-2026','2026-10-06'],
 ['06.10.2026','2026-10-06'],['2026-10-06','2026-10-06'],
 ['Tarikh Banci: 6/10/26','2026-10-06'],['Date: 2026-10-06','2026-10-06'],
 ['6 Okt 2026','2026-10-06'],['6 Oktober 2026','2026-10-06'],['6 October 2026','2026-10-06']
]){
 test('dynamic date '+raw,()=>assert.equal(ctx.bseCensusOperationalDate_('BANCI TANAMAN\n'+raw,'2026-10-21T00:00:00Z',[]),expected));
}
test('bad explicit date fails closed, not receive date',()=>{
 for(const raw of ['31/02/2026','32/10/26','Tarikh: 0/10/2026','Tarikh: 6/13/2026']){
  assert.equal(ctx.bseCensusOperationalDate_('REKOD BANCI POKOK\n'+raw,'2026-10-21T00:00:00Z',[]),'',raw)
 }
});
test('latest clarification date overrides older report date',()=>{
 assert.equal(ctx.bseCensusOperationalDate_('6/10/26','2026-10-21T00:00:00Z',['7/10/26']),'2026-10-07')
});
test('actual screenshot census report retains explicit date and needs crop/batch reconciliation',()=>{
 const sample='REKOD BANCI POKOK\n6/10/26\nModul : M1 P2\nMati : 143\nSakit : 654';
 const result=ctx.bseTelegramCensusDeterministicResult_(sample,'2026-10-21T00:00:00Z');
 assert(result&&result.candidates.length===1&&result.candidates[0].target==='Plant_Census_Log');
 assert.equal(result.candidates[0].fields.event_date,'2026-10-06');
 assert.equal(result.candidates[0].fields.census_entries[0].plot_id,'M1P2');
 assert.equal(result.candidates[0].fields.census_entries[0].reported_dead_count,143);
 assert.equal(result.candidates[0].fields.census_entries[0].reported_sick_count,654);
 assert.equal(result.production_write,false);
});
test('no heading or unrelated chat bypass census',()=>{
 assert.equal(ctx.bseTelegramCensusDeterministicResult_('tak nampak pokok sakit di plot',null),null);
 assert.equal(ctx.bseTelegramCensusDeterministicResult_('Racun\n6/10/26',null),null);
});
console.log('GI_CENSUS_DYNAMIC '+checks+'/'+checks+' PASS');
