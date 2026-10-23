'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(__dirname+'/TelegramEcHistoryTest.js','utf8');
const start=src.indexOf('function bsePilotEcCanonicalHistory_(');
assert(start>=0);
const ctx={bsePilotEcCanonicalValidate_:b=>b&&b.schema_version==='EC_BATCH_V1'&&Array.isArray(b.readings)&&b.readings.length===9,
 bseTelegramHistoryInCommandPeriod_:(date,cmd)=>date.startsWith(cmd.period),bseTelegramHistoryPeriodLabel_:c=>c.period};
vm.createContext(ctx);vm.runInContext(src.slice(start),ctx);
const make=(ref,date)=>({schema_version:'EC_BATCH_V1',reference:ref,event_date:date,readings:[
{plot_id:'M1P1',value:null,input_status:'NOT_MEASURED'},...['M1P2','M2P3','M2P4'].map(x=>({plot_id:x,value:null,input_status:'NOT_MEASURED'})),
...['M3P3','M3P4','M4P1','M4P2','M7P3'].map(x=>({plot_id:x,value:3,input_status:'NUMERIC'}))]});
const book={getSheetByName:()=>({getLastRow:()=>3,getRange:()=>({getValues:()=>[
['BSE-TG-772258043','EC_BATCH_V1',JSON.stringify(make('BSE-TG-772258043','2026-10-15')),'COMMITTED'],
['BSE-TG-772258047','EC_BATCH_V1',JSON.stringify(make('BSE-TG-772258047','2026-10-13')),'COMMITTED']]})})};
const r=ctx.bsePilotEcCanonicalHistory_(book,{period:'2026-10'},3900);
assert.equal(r.matched_batches,2);assert.equal(r.matched_rows,18);assert.equal(r.displayed_rows,18);
assert.match(r.text,/BSE-TG-772258043/);assert.match(r.text,/BSE-TG-772258047/);
assert.match(r.text,/M7P3: 3/);assert.match(r.text,/M1P1: x/);assert.doesNotMatch(r.text,/EC_IN utama/);
assert(r.text.indexOf('2026-10-13')<r.text.indexOf('2026-10-15'));
assert.equal(ctx.bsePilotEcCanonicalHistory_(book,{period:'2026-09'},3900).matched_batches,0);
const corrupt={getSheetByName:()=>({getLastRow:()=>2,getRange:()=>({getValues:()=>[['BSE-TG-X','EC_BATCH_V1','{bad','COMMITTED']]})})};
assert.throws(()=>ctx.bsePilotEcCanonicalHistory_(corrupt,{period:'2026-10'},3900),/CORRUPT/);
console.log('CL_H07_CANONICAL_EC_HISTORY 10/10 PASS');
