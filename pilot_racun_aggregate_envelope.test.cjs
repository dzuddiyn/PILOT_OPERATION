'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const ctx={JSON,Error,bseRuntimeEnvironmentName_:()=>ctx.env,env:'PILOT_OPERATION'};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname+'/PilotRacunAggregateEnvelope.js','utf8'),ctx);
const source='Racun\n19/10/2026\n1. M7\nDynamec-20\n2. M3P1\nDynamec-30';
const candidate=()=>({target:'Treatment_Event_Log',fields:{original_note:source}});
test('Racun groups yield one review envelope with lineage intact',()=>{
 const result={production_write:false,validation:'PASS',candidates:[candidate(),candidate()]};
 const out=ctx.bsePilotRacunAggregateEnvelope_(result);
 assert.equal(out.aggregate_type,'PILOT_RACUN_ATOMIC');assert.equal(out.record_count,2);
 assert.equal(out.candidates.length,2);assert.equal(result.aggregate_type,undefined);
});
test('other treatment, mixed source, wrong environment fail closed',()=>{
 const input={production_write:false,validation:'PASS',candidates:[candidate(),candidate()]};
 input.candidates[1].fields.original_note='Racun\nwrong';
 assert.throws(()=>ctx.bsePilotRacunAggregateEnvelope_(input),/MIXED_SOURCE/);
 ctx.env='TEST';assert.equal(ctx.bsePilotRacunAggregateEnvelope_(input),null);
});
