'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const ctx={bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',bseCanonicalPlotTokens_:t=>({ok:true,plots:[t]}),bseInventoryMalaysiaDate_:()=> '2026-10-21'};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/InventoryReviewTest.js','utf8'),ctx);
const ref='BSE-TG-TESTONLY19',sample='Baja in\n15/10/2026\n2 set Baja F\n3 set Baja N';
const parse=()=>ctx.bseInventoryParseMessage_(sample,'2026-10-21T00:00:00Z');
test('two candidate identities are deterministic, unique and independently idempotent',()=>{
 const a=parse(),b=parse();assert.equal(a.candidates.length,2);
 const keys=a.candidates.map(c=>ctx.bseInventoryMultiItemSourceKey_(ref,c.fields.record_type,c.fields));
 const replay=b.candidates.map(c=>ctx.bseInventoryMultiItemSourceKey_(ref,c.fields.record_type,c.fields));
 assert.deepEqual(keys,replay);assert.equal(new Set(keys).size,2);
 const rows=[{source_key:keys[0],payload_hash:'a'.repeat(64),decision:'APPROVED'}];
 assert.equal(ctx.bseInventoryDecisionFromPrior_(rows,keys[1],'b'.repeat(64),'APPROVED').state,'NEW');
 assert.equal(ctx.bseInventoryDecisionFromPrior_(rows,keys[0],'a'.repeat(64),'APPROVED').state,'IDEMPOTENT');
 assert.equal(ctx.bseInventoryDecisionFromPrior_(rows,keys[0],'b'.repeat(64),'APPROVED').state,'CONFLICT');
});
test('legacy single item key remains unchanged',()=>{
 assert.equal(ctx.bseInventoryMultiItemSourceKey_(ref,'INVENTORY_IN',{item_name:'Fruitka'}),ref+'|INVENTORY_IN');
});
test('unknown marked fertilizer is rejected rather than guessed',()=>{
 assert.throws(()=>ctx.bseInventoryMultiItemSourceKey_(ref,'INVENTORY_IN',{item_name:'Other',multi_item_fertilizer:true}),/UNVERIFIED_MULTI_ITEM_FERTILIZER/);
});
test('candidate order does not change identity',()=>{
 const cs=parse().candidates.map(x=>x.fields);
 assert.equal(ctx.bseInventoryMultiItemSourceKey_(ref,'INVENTORY_IN',cs[0]),ctx.bseInventoryMultiItemSourceKey_(ref,'INVENTORY_IN',[...cs].reverse()[1]));
});
