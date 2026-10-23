const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const ctx={bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',Set};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/PilotEcAtomicBatch.js','utf8'),ctx);
const b=ctx.bsePilotEcCanonicalBatch_('BSE-TG-772258028','14/10/2026\nM1P1-x\nM2P3-\nM7-3.5','2026-10-14');
const all=JSON.parse(JSON.stringify(ctx.bsePilotEcDerivedIndex_(b)));const first=[all[0]];let r=ctx.bsePilotEcRebuildIndex_(b,first);assert.equal(r.canonical_unchanged,true);assert.equal(r.expected_count,3);assert.equal(r.missing.length,2);assert.equal(ctx.bsePilotEcRebuildIndex_(b,all).missing.length,0);assert.throws(()=>ctx.bsePilotEcRebuildIndex_(b,[all[0],all[0]]),/DUPLICATE/);assert.throws(()=>ctx.bsePilotEcRebuildIndex_(b,[{...all[0],value:44}]),/CONFLICT/);console.log('EC_DERIVED_INDEX_RECOVERY 6/6 PASS');
const parsedDate=new Date('2026-10-13T16:00:00.000Z');
ctx.Utilities={formatDate:(value,tz,pattern)=>{assert.equal(tz,'Asia/Kuala_Lumpur');assert.equal(pattern,'yyyy-MM-dd');return '2026-10-14';}};
const formatted=[{...all[0],date:parsedDate,value:''}];
assert.equal(ctx.bsePilotEcRebuildIndex_(b,formatted).missing.length,2);
assert.throws(()=>ctx.bsePilotEcRebuildIndex_(b,[{...all[0],date:parsedDate,plot_id:'M9P9',value:''}]),/CONFLICT/);
console.log('EC_DERIVED_SHEETS_ROUNDTRIP 2/2 PASS');
