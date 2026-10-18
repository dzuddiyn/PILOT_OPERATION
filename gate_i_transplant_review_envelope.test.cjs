'use strict';
const assert=require('assert'),fs=require('fs'),vm=require('vm');
const source=fs.readFileSync(__dirname+'/TransplantReviewTest.js','utf8');
const start=source.indexOf('function bseTransplantReviewEncodedCandidate_(');
const stop=source.indexOf('function bseTransplantProposal_(',start);
assert(start>=0&&stop>start);
const ctx={environment:'PILOT_OPERATION',bseRuntimeEnvironmentName_:()=>ctx.environment};
vm.createContext(ctx);vm.runInContext(source.slice(start,stop),ctx);
const base={validation:'PASS',production_write:false,candidates:[{target:'Transplant_Event_Log',validation:'PASS',missing:[],fields:{crop:'Timun'}}]};
const input=JSON.stringify({...base,transplant_crop_conflict:{declared:' M5P34',canonical:'Timun'}});
const normal=JSON.parse(ctx.bseTransplantReviewEncodedCandidate_(input));
assert.deepStrictEqual(normal,base); 
assert.strictEqual(ctx.bseTransplantReviewEncodedCandidate_(JSON.stringify(base)),JSON.stringify(base));
for(const extra of [{unexpected:true},{validation:'NEED_INFO'},{production_write:true},{candidates:[]}]){
 const raw=JSON.stringify({...base,...extra,transplant_crop_conflict:{}});
 assert.strictEqual(ctx.bseTransplantReviewEncodedCandidate_(raw),raw);
}
ctx.environment='PILOT_TEST';
assert.strictEqual(ctx.bseTransplantReviewEncodedCandidate_(input),input);
console.log('Gate I Transplant normalization 7/7 PASS');

