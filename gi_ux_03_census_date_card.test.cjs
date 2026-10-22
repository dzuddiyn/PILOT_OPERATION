'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const census=fs.readFileSync(path.join(__dirname,'CensusReviewTest.js'),'utf8');
const ui=fs.readFileSync(path.join(__dirname,'TelegramApprovalUiTest.js'),'utf8');
const unified=fs.readFileSync(path.join(__dirname,'GeminiUnifiedTest.js'),'utf8');
function fn(src,name){
 const from=src.indexOf('function '+name+'(');assert(from>=0,name+' missing');
 const to=src.indexOf('\nfunction ',from+9);return src.slice(from,to<0?src.length:to);
}
const ctx={
 console,Date,JSON,Number,Set,
 bseUnifiedSourceContext_:s=>({original:s,clarifications:[],provenance:s}),
 bsePlantCensusSource_:s=>String(s).startsWith('BANCI POKOK')?{ok:true,crop:'Timun',entries:[{plot_id:'M2P1',living_plant_count:96}]}:{ok:false},
 bsePlotSingleLocation_:s=>({plot_id:s}),
 bsePlantCensusMalaysiaDate_:()=> '2026-10-22',
 bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',
 Utilities:{formatDate:()=> '2026-10-22'}
};
vm.createContext(ctx);
vm.runInContext(census.slice(census.indexOf('const BSE_CENSUS_ESTIMATE_METHOD'),census.indexOf('function bseCensusPlotCapacity_')),ctx);
ctx.bseCropBatchDate_=date=>/^2026-\d{2}-\d{2}$/.test(String(date||''));
ctx.bseCropBatchPlotCompare_=(a,b)=>String(a).localeCompare(String(b));
vm.runInContext(fn(census,'bseCensusProposal_'),ctx);
for(const name of ['bseCensusPlotCapacity_','bseCensusOperationalSignal_','bseCensusOperationalCount_','bseCensusOperationalPlot_','bseCensusOperationalCrop_','bseCensusOperationalDate_','bseTelegramCensusDeterministicResult_'])
 vm.runInContext(fn(census,name),ctx);
ctx.bseTransplantNormalizeCrop_=s=>String(s||'').toLowerCase();
vm.runInContext(fn(unified,'bseUnifiedGuardPlantCensus_'),ctx);
for(const name of ['bseApprovalDisplayDate_','bseApprovalCensusEntries_','bsePilotCensusReviewCard_','bseCensusConfirmedSummaryFromRows_'])
 vm.runInContext(fn(ui,name),ctx);
let n=0;const t=(name,cb)=>{cb();n++;console.log('PASS '+name)};
const input='REKOD BANCI POKOK\n6/10/2026\nModul: M6 P1\nTanaman: Peria Besar\nMati: 143\nSakit: 654';
const parse=s=>ctx.bseTelegramCensusDeterministicResult_(s,'2026-10-22T13:00:00Z');
t('explicit 6/10/2026 wins over Telegram received date',()=>{
 const r=parse(input),f=r.candidates[0].fields;
 assert.equal(r.validation,'PASS');assert.equal(f.event_date,'2026-10-06');
 assert.equal(f.census_entries[0].plot_id,'M6P1');
 assert.equal(f.crop,'Peria Besar');
});
t('living and healthy estimates are distinct',()=>{
 const e=parse(input).candidates[0].fields.census_entries[0];
 assert.equal(e.plot_capacity_polybag,2808);assert.equal(e.reported_dead_count,143);
 assert.equal(e.reported_sick_count,654);assert.equal(e.living_plant_count,2665);
 assert.equal(e.living_count_method,'ESTIMATED_CAPACITY_MINUS_DEAD');
});
t('PILOT complete card shows reference, date, crop, plot, dead, sick, living, healthy',()=>{
 const f=parse(input).candidates[0].fields;
 const card=ctx.bsePilotCensusReviewCard_('BSE-TG-772257599',f);
 for(const s of ['REKOD BANCI POKOK','BSE-TG-772257599','M6P1','Peria Besar','06/10/2026',
 'Mati : 143','Sakit : 654','Anggaran pokok hidup : 2665','Anggaran pokok sihat : 2011'])
 assert(card.includes(s),s);
});
t('invalid explicit date does not fallback to Telegram date',()=>{
 const r=parse(input.replace('6/10/2026','Tarikh Banci: 32/10/2026'));
 assert.equal(r.validation,'NEED_INFO');
 assert(r.candidates[0].missing.includes('event_date'));
 assert.equal(r.candidates[0].fields.event_date,'');
});
t('invalid named date does not fallback to Telegram date',()=>{
 const r=parse(input.replace('6/10/2026','Tarikh Banci: 10 Ogos 2026'));
 assert.equal(r.validation,'NEED_INFO');assert(r.candidates[0].missing.includes('event_date'));
});
t('canonical BANCI POKOK also honors valid explicit date',()=>{
 const r=parse('BANCI POKOK\n6/10/2026\nJenis Tanaman: Timun\nM2P1: 96 pokok');
 assert.equal(r.validation,'PASS');assert.equal(r.candidates[0].fields.event_date,'2026-10-06');
});
t('canonical invalid explicit date is not autoapproved',()=>{
 const r=parse('BANCI POKOK\nTarikh: 32/10/2026\nJenis Tanaman: Timun\nM2P1: 96 pokok');
 assert.equal(r.validation,'NEED_INFO');assert.equal(r.candidates[0].fields.event_date,'');
});
t('invalid dead + sick over capacity fails closed',()=>{
 const r=parse(input.replace('Mati: 143','Mati: 2500'));
 assert.equal(r.validation,'NEED_INFO');assert(r.candidates[0].missing.includes('census_counts_conflict'));
});
t('legacy methods remain visibly labelled as old healthy estimate',()=>{
 const f=parse(input).candidates[0].fields;
 const e=f.census_entries[0];e.living_plant_count=2011;e.living_count_method='ESTIMATED_CAPACITY_MINUS_DEAD_MINUS_SICK';
 const card=ctx.bsePilotCensusReviewCard_('BSE-TG-1',f);
 assert.match(card,/Anggaran pokok sihat : 2011 \(kaedah lama\)/);
 assert.doesNotMatch(card,/Anggaran pokok hidup : 2011/);
});
t('confirmed receipt shows distinct estimates without redefining old ones',()=>{
 const row=['key','1','cid','batch','allocation','M6P1','2026-10-06','Peria Besar',2665,'VERIFIED_TEST','','','','hash',143,654,2808,'ESTIMATED_CAPACITY_MINUS_DEAD'];
 const summary=ctx.bseCensusConfirmedSummaryFromRows_('BSE-TG-1',[row]);
 assert.match(summary,/Anggaran pokok hidup : 2665/);assert.match(summary,/Anggaran pokok sihat : 2011/);
 const old=[...row];old[8]=2011;old[17]='ESTIMATED_CAPACITY_MINUS_DEAD_MINUS_SICK';
 const legacy=ctx.bseCensusConfirmedSummaryFromRows_('BSE-TG-1',[old]);
 assert.match(legacy,/Anggaran pokok sihat : 2011 \(kaedah lama\)/);
 assert.doesNotMatch(legacy,/Anggaran pokok hidup/);
});
t('AI census guard respects explicit canonical source date',()=>{
 const note='BANCI POKOK\n6/10/2026\nJenis Tanaman: Timun\nM2P1: 96 pokok';
 const r={validation:'PASS',candidates:[{target:'Plant_Census_Log',validation:'PASS',missing:[],fields:{project_id:'BSE_SB',system_year:2026,event_date:'2026-10-22',record_type:'PLANT_CENSUS',verification_status:'PROVISIONAL',crop:'Timun',census_entries:[]}}]};
 ctx.bseUnifiedGuardPlantCensus_(r,note,'2026-10-22T13:00:00Z');
 assert.equal(r.validation,'PASS');assert.equal(r.candidates[0].fields.event_date,'2026-10-06');
});
t('AI census guard blocks malformed user date',()=>{
 const note='BANCI POKOK\nTarikh: 32/10/2026\nJenis Tanaman: Timun\nM2P1: 96 pokok';
 const r={validation:'PASS',candidates:[{target:'Plant_Census_Log',validation:'PASS',missing:[],fields:{project_id:'BSE_SB',system_year:2026,event_date:'2026-10-22',record_type:'PLANT_CENSUS',verification_status:'PROVISIONAL',crop:'Timun',census_entries:[]}}]};
 ctx.bseUnifiedGuardPlantCensus_(r,note,'2026-10-22T13:00:00Z');
 assert.equal(r.validation,'NEED_INFO');assert.equal(r.candidates[0].fields.event_date,'');assert(r.candidates[0].missing.includes('event_date'));
});
t('new census proposal contract rejects wrong living count',()=>{
 const r=parse(input),f=r.candidates[0].fields;
 const accepted=ctx.bseCensusProposal_(JSON.stringify(r),input);
 assert.equal(accepted.entries[0].living_plant_count,2665);
 const bad=JSON.parse(JSON.stringify(r));bad.candidates[0].fields.census_entries[0].living_plant_count=2011;
 assert.throws(()=>ctx.bseCensusProposal_(JSON.stringify(bad),input),/kontrak|Entry/i);
});
t('historical healthy method remains valid for existing records only as recorded',()=>{
 const old=parse(input);const e=old.candidates[0].fields.census_entries[0];e.living_plant_count=2011;e.living_count_method='ESTIMATED_CAPACITY_MINUS_DEAD_MINUS_SICK';
 const result=ctx.bseCensusProposal_(JSON.stringify(old),input);
 assert.equal(result.entries[0].living_plant_count,2011);
 assert.equal(result.entries[0].living_count_method,'ESTIMATED_CAPACITY_MINUS_DEAD_MINUS_SICK');
});
console.log('GI_UX_03 '+n+'/'+n+' PASS');
