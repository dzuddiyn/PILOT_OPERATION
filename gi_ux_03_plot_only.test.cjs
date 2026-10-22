'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'CensusReviewTest.js'),'utf8');
const ui=fs.readFileSync(path.join(__dirname,'TelegramApprovalUiTest.js'),'utf8');
const chunk=(src,name)=>{
 const i=src.indexOf('function '+name+'(');assert(i>=0,name);
 const j=src.indexOf('\nfunction ',i+9);return src.slice(i,j<0?src.length:j);
};
let found={kind:'NONE'},environment='PILOT_OPERATION';
const ctx={console,Date,JSON,Number,Set,
 bseRuntimeEnvironmentName_:()=>environment,
 bseCensusStatusEventsAsOf_:()=>({}),
 bseActiveAllocationFindMatchesByPlots_:()=>found,
 bseTransplantNormalizeCrop_:s=>String(s||'').trim().toLowerCase(),
 bseCropBatchPlotCompare_:(a,b)=>String(a).localeCompare(String(b)),
 bseCropBatchDate_:v=>/^2026-\d{2}-\d{2}$/.test(String(v||'')),
 bsePlotSingleLocation_:v=>({plot_id:v}),
 bsePlantCensusMalaysiaDate_:()=> '2026-10-22',
 bseUnifiedSourceContext_:s=>({original:s,provenance:s,clarifications:[]}),
 bsePlantCensusSource_:()=>({ok:false})
};
vm.createContext(ctx);
vm.runInContext(source.slice(source.indexOf('const BSE_CENSUS_ESTIMATE_METHOD'),source.indexOf('function bseCensusPlotCapacity_')),ctx);
for(const n of ['bseCensusPlotCapacity_','bseCensusOperationalSignal_','bseCensusOperationalCount_','bseCensusOperationalPlot_','bseCensusOperationalCrop_','bseCensusOperationalDate_','bseTelegramCensusDeterministicResult_','bseCensusProposal_','bseCensusResolveOperationalContext_','bseCensusQueueGuard_','bseCensusApplyMatch_','bseCensusMarkNeedInfo_','bseCensusAssertApprovedRows_'])vm.runInContext(chunk(source,n),ctx);
for(const n of ['bseApprovalDisplayDate_','bsePilotCensusReviewCard_','bseCensusConfirmedSummaryFromRows_'])vm.runInContext(chunk(ui,n),ctx);
const raw='REKOD BANCI POKOK\n6/10/2026\nModul: M5P3\nSakit: 654';
const input=()=>ctx.bseTelegramCensusDeterministicResult_(raw,'2026-10-22T12:00:00Z');
const resolve=r=>ctx.bseCensusResolveOperationalContext_(r,[],[],[],[],[],[]);
let tests=0;const test=(name,fn)=>{fn();tests++;console.log('PASS '+name);};
test('sick only is a complete plot-first census without crop',()=>{
 const r=input();assert.equal(r.validation,'PASS');
 assert.equal(r.candidates[0].fields.event_date,'2026-10-06');
 assert.equal(r.candidates[0].fields.crop,'');
 const e=r.candidates[0].fields.census_entries[0];
 assert.equal(e.plot_id,'M5P3');assert.equal(e.reported_dead_count,0);assert.equal(e.reported_sick_count,654);
});
test('no ACTIVE crop match never invents a batch nor asks user for one',()=>{
 found={kind:'NONE'};const out=resolve(input());
 assert.equal(out.validation,'PASS');assert.equal(out.candidates[0].fields.crop,'');
 assert(!out.candidates[0].missing.includes('batch_match'));
});
test('PILOT proposal accepts crop optional but still validates schema',()=>{
 const out=resolve(input()),p=ctx.bseCensusProposal_(JSON.stringify(out),raw);
 assert.equal(p.fields.crop,'');assert.equal(p.entries.length,1);
 assert.equal(p.entries[0].living_plant_count,2808);
});
test('new PILOT queue guard does not require a user-provided batch',()=>{
 const out=resolve(input());
 const result=ctx.bseCensusQueueGuard_({},out);
 assert.equal(result.validation,'PASS');
});
test('unique ACTIVE crop is inferred from plot only',()=>{
 found={kind:'UNIQUE',crop:'Timun',batch_id:'internal',allocations:[{plot_id:'M5P3',allocation_id:'a1'}]};
 const out=resolve(input());assert.equal(out.validation,'PASS');
 assert.equal(out.candidates[0].fields.crop,'Timun');
});
test('explicit conflicting crop with ACTIVE plot fails closed',()=>{
 found={kind:'UNIQUE',crop:'Timun',batch_id:'internal'};
 const r=input();r.candidates[0].fields.crop='Peria Besar';
 const out=resolve(r);
 assert.equal(out.validation,'NEED_INFO');
 assert(out.candidates[0].missing.includes('crop_plot_conflict'));
});
test('historical crop absent remains empty and displayed accurately',()=>{
 found={kind:'NONE'};
 const out=resolve(input());
 const card=ctx.bsePilotCensusReviewCard_('BSE-TG-772257622',out.candidates[0].fields);
 assert.match(card,/Tanaman : Tidak direkodkan/);
 assert.match(card,/Tarikh : 06\/10\/2026/);
});
test('plot-only ledger can be read back idempotently without fake batch',()=>{
 const r=input();const p=ctx.bseCensusProposal_(JSON.stringify(r),raw);
 const entry=p.entries[0],row=['sk','123','cid','','',entry.plot_id,'2026-10-06','',entry.living_plant_count,'VERIFIED_TEST','','','','hash',0,654,2808,'ESTIMATED_CAPACITY_MINUS_DEAD'];
 ctx.bseCensusAssertApprovedRows_([row],'sk','hash',[entry],['cid'],'');
 const receipt=ctx.bseCensusConfirmedSummaryFromRows_('BSE-TG-772257622',[row]);
 assert.match(receipt,/Tanaman : Tidak direkodkan/);
 assert.match(receipt,/Sakit : 654/);
});
test('writer path uses optional association and never creates batch',()=>{
 const writer=chunk(source,'bsePlantCensusReviewCore_');
 assert.match(writer,/match\.kind==='UNIQUE'\?String\(match\.batch_id\):''/);
 assert.match(writer,/allocation\?allocation\.allocation_id:''/);
 assert.doesNotMatch(writer,/bseCropBatchReviewCore_|bseTransplantReviewCore_/);
});
test('nonpilot retains prior unique ACTIVE protection',()=>{
 environment='TEST';
 found={kind:'NONE'};const r=input();
 assert.throws(()=>ctx.bseCensusProposal_(JSON.stringify(r),raw),/kontrak|TEST tidak sah/);
 environment='PILOT_OPERATION';
});
console.log('GI_UX_03_PLOT_ONLY '+tests+'/'+tests+' PASS');
