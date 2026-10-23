'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const ctx={env:'PILOT_OPERATION',bseRuntimeEnvironmentName_:()=>ctx.env};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname+'/PilotRacunAtomicPlan.js','utf8'),ctx);
const item=(plot,quantity='Dynamec - 180')=>({target:'Treatment_Event_Log',fields:{event_date:'2026-10-19',plot_ids:[plot],treatment_description:quantity,verification_status:'PROVISIONAL',pending_treatment_items:[],crop:''}});
const plan=x=>ctx.bsePilotRacunAtomicPlan_(x,'BSE-TG-772257756');
test('two independent unlinked records are not written and have distinct source keys',()=>{
 const p=plan({production_write:false,candidates:[item('M7P3'),item('M3P1')]});
 assert.equal(p.record_count,2);assert.equal(p.storage_mode,'UNLINKED_PILOT');assert.equal(p.requires_atomic_commit,true);
 assert.notEqual(p.records[0].source_key,p.records[1].source_key);
 assert.equal(p.records[0].batch_id,'');assert.equal(p.official_bse_write,false);
});
test('reject duplicate plots, missing quantities, invalid dates and wrong environment',()=>{
 assert.throws(()=>plan({production_write:false,candidates:[item('M7P3'),item('M7P3')]}),/DUPLICATE/);
 assert.throws(()=>plan({production_write:false,candidates:[item('M7P3','Dynamec')]}),/QUANTITY/);
 const bad=item('M7P3');bad.fields.event_date='2026-02-31';
 assert.throws(()=>plan({production_write:false,candidates:[bad]}),/DATE/);
 ctx.env='TEST';assert.throws(()=>plan({production_write:false,candidates:[item('M7P3')]}),/ENVIRONMENT/);
});
