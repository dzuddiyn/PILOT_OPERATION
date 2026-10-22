'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const ctx={console,Date,Number,JSON,Set,bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION'};vm.createContext(ctx);
for(const file of ['InventoryReviewTest.js','PilotBajaTest.js','PilotBajaFlexibleTest.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),ctx,{filename:file});
let n=0;
function check(label,input,expected){
 const r=ctx.bsePilotBajaParse_(input,'2026-10-23T00:40:00Z');
 assert(r,label+' missing parser');assert.equal(r.validation,'PASS',label);
 assert.equal(ctx.bsePilotBajaValidateResult_(r).validation,'PASS',label);
 const f=r.candidates[0].fields;
 assert.equal(f.event_date,'2026-10-23',label);
 const actual=f.baja_items.map(x=>x.baja_type+':'+x.destination+':'+x.quantity+':'+x.unit);
 assert.deepEqual(JSON.parse(JSON.stringify(actual)),expected,label);
 assert.equal(r.production_write,false,label);
 assert.equal(r.candidates.length,1,label);
 const card=ctx.bsePilotBajaCard_('BSE-TG-SYNTH',r);
 for(const v of expected)assert(card.includes(v.split(':')[1]),label+' card missing plot '+v);
 n++;console.log('PASS '+label+' -> '+actual.join(' | '));
}
const n1=['N:M1P1:1:set','N:M1P2:1:set'];
for(const [label,s] of [
 ['exact user newline shorthand','Baja out\n23/10/26\nN\nM1P12'],
 ['inline shorthand different order','Baja out F 23 Okt 26 M5P34'],
 ['MxP1,2 separated','Baja out 23/10/26 M1P1,2 N'],
 ['M x P with spaces','Baja out 23 Oktober 2026 M1 P1,2 N'],
 ['M1P1,P2','Baja out 23/10/26 M1P1,P2 N'],
 ['MxP1 & P2','Baja out N 23/10/26 M1P1 & P2'],
 ['full names comma','Baja out N 23/10/26 M1P1, M1P2'],
 ['full names dan','Baja out 23/10/26 M1P1 dan M1P2 N'],
 ['plot list after name','Baja keluar 23/10/26 Plot: M1P1,2 N']
]){
 const expected=s.includes('M5P34')?['F:M5P3:1:set','F:M5P4:1:set']:n1;
 check(label,s,expected);
}
check('two types expanded across two plots','Baja out 23/10/26 M1P12 F N',
 ['F:M1P1:1:set','F:M1P2:1:set','N:M1P1:1:set','N:M1P2:1:set']);
check('multiple modules','Baja out 23/10/26 N M1P12 M2P34',
 ['N:M1P1:1:set','N:M1P2:1:set','N:M2P3:1:set','N:M2P4:1:set']);
check('genuine P10 remains literal','Baja out N 23/10/26 M1P10',
 ['N:M1P10:1:set']);
for(const [label,input] of [
 ['duplicate shorthand plots','Baja out 23/10/26 N M1P11'],
 ['duplicate full+shorthand','Baja out N 23/10/26 M1P12, M1P2'],
 ['3 digit shorthand ambiguous','Baja out 23/10/26 N M1P123'],
 ['no plot','Baja out 23/10/26 N'],
 ['missing date','Baja out N M1P12'],
 ['old missing date input','Baja in 2 F 3 N'],
 ['bad date','Baja out 32/10/26 N M1P12']
]){
 const r=ctx.bsePilotBajaParse_(input,'2026-10-23T00:40:00Z');
 assert(r);assert.equal(r.validation,'NEED_INFO',label);assert.equal(r.candidates.length,1);
 n++;console.log('PASS fails closed '+label);
}
const ready=ctx.bsePilotBajaParse_('Baja in\n23/10/2026 2 F 3 N','2026-10-23T00:40:00Z');
assert.equal(ready.validation,'PASS');assert.equal(ready.candidates[0].fields.baja_items.length,2);
n++;console.log('PASS Baja Masuk unchanged');
console.log('GI_UX_04_PLOT_SHORTHAND '+n+'/'+n+' PASS');
