'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),test=require('node:test');
const src=fs.readFileSync(__dirname+'/TreatmentReviewTest.js','utf8');
const start=src.indexOf('function bsePilotRacunNumberedSections_('),end=src.indexOf('function bseTreatmentListParseMessage_(',start);
const ctx={bseRuntimeEnvironmentName_:()=>ctx.env,bseTreatmentListDate_:()=> '2026-10-19',bseCropBatchPlotCompare_:(a,b)=>a.localeCompare(b),env:'PILOT_OPERATION'};
vm.createContext(ctx);vm.runInContext(src.slice(start,end),ctx);
const report=`Racun
19/10/2026
Isnin
PETANG
1. M3 - P34 TIMUN (51 hst)
Dynamec-180
Mancozeb - 500
Top plus- 140
calcium- 300
2. M7 - Peria (48 hst)
Madell 500
Mancozeb 500
Top plus 140
cy787 300
4.M4P12 Peria (43 hst)
Madell 500
Mancozeb 500
Top plus 140
cy787 300
5. M1P1,2
dynamec -180
Mancozeb - 500
Top plus- 140
calcium- 300
6. M1P34
dynamec- 180
7. M2 - P34 PERIA (28 Hst)
Madell-500
Mancozeb-500
Top plus-140
cy787-300
8. M5 - P34 TIMUN (9 Hst)
dynamec-20
9. M5 - P12 TIMUN (12 Hst)
dynamec - 20
10. M6 - P12 PERIA (13 Hst)
dynamec - 180
11.M2 - P12 PERIA (6 Hst)
dyna mec-20
axtraroots-60`;
test('all 10 independent source sections with expected scope, optional crop/HST removed and doses',()=>{
 const out=ctx.bsePilotRacunNumberedSections_(report);
 assert.equal(out.candidates.length,10);
 const scopes=[['M3P3','M3P4'],['M7P3'],['M4P1','M4P2'],['M1P1','M1P2'],['M1P3','M1P4'],['M2P3','M2P4'],['M5P3','M5P4'],['M5P1','M5P2'],['M6P1','M6P2'],['M2P1','M2P2']];
 out.candidates.forEach((c,i)=>{assert.deepEqual(Array.from(c.fields.plot_ids),scopes[i]);assert(!/HST/i.test(c.fields.crop));assert(c.missing.includes('batch_match'));assert.equal(c.fields.event_date,'2026-10-19');});
 assert.equal(out.candidates[0].fields.treatment_description.split('\n').length,4);
 assert(out.candidates[1].fields.treatment_description.includes('Madell - 500'));
 assert.equal(out.candidates[3].fields.crop,'');
 assert(out.candidates[9].fields.treatment_description.includes('dyna mec - 20'));
 assert.equal(out.validation,'NEED_INFO');
});
test('no default plot for other modules; no TEST cross-environment parsing',()=>{
 let x=ctx.bsePilotRacunNumberedSections_('Racun\n19/10/2026\n1. M8\nDynamec-30\n2. M7\nDynamec-10');
 assert(x.candidates[0].missing.includes('plot_ids'));
 ctx.env='TEST';assert.equal(ctx.bsePilotRacunNumberedSections_(report),null);
});
