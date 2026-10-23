'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const ctx={JSON,Set,Map,Error,bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',bseTreatmentListDate_:()=> '2026-10-19',bseCropBatchPlotCompare_:(a,b)=>a.localeCompare(b)};
vm.createContext(ctx);
const src=fs.readFileSync(__dirname+'/TreatmentReviewTest.js','utf8');
vm.runInContext(src.slice(src.indexOf('function bsePilotRacunNumberedSections_('),src.indexOf('function bseTreatmentListParseMessage_(')),ctx);
for(const f of ['PilotRacunSourceAssessment.js','PilotRacunAtomicPlan.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
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
6. M1 -P34 TIMUN (22 hst)
dynamec- 180
7. M2 - P34 PERIA (28 Hst)
Madell-500
Mancozeb-500
Top plus-140
cy787-300
8. M5 - P34 TIMUN (9 Hst)
dynamec-20
9. M5 - P12 TIMUN (12 Hst)
dynamec -20
10. M6 - P12 PERIA (13 Hst)
dynamec - 180
11. M2 - P12 PERIA (6 Hst)
dyna mec-20
axtraroots-60`;
test('verbatim source: 10 sections are source-complete but cannot approve without durable runtime',()=>{
 const parsed=ctx.bsePilotRacunNumberedSections_(report),assessed=ctx.bsePilotRacunSourceAssessment_(parsed);
 assert.equal(assessed.status,'SOURCE_COMPLETE_STORAGE_BLOCKED');
 assert.equal(assessed.record_count,10);assert.equal(assessed.actionable,false);
 const plan=ctx.bsePilotRacunAtomicPlan_(parsed,'BSE-TG-999000');
 assert.equal(plan.record_count,10);assert.equal(plan.records[1].plot_ids[0],'M7P3');
 assert.equal(new Set(plan.records.map(x=>x.source_key)).size,10);
 assert.equal(plan.records[0].treatment_description.split('\n').length,4);
});
test('missing dose remains incomplete and never actionable',()=>{
 const parsed=ctx.bsePilotRacunNumberedSections_(report.replace('axtraroots-60','axtraroots'));
 const assessed=ctx.bsePilotRacunSourceAssessment_(parsed);
 assert.equal(assessed.status,'SOURCE_INCOMPLETE');assert.equal(assessed.actionable,false);
});
