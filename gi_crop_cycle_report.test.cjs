'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={console,Date};vm.createContext(ctx);vm.runInContext(fs.readFileSync('TelegramReportTest.js','utf8'),ctx);
test('same batch id joins sow/transplant with grounded facts',()=>{
const make=(ref,date,act,batch)=>({reference:ref,date,category:'FIELD_OPERATION',report_facts:{batch_ids:[batch],crops:['Timun'],plots:['M3P1'],activities:[act]}});
const a=ctx.bseTelegramReportCycles_([make('r1','2026-10-01','Crop_Batch','B-001'),make('r2','2026-10-09','Transplant','B-001')]);
assert.equal(a.linked.length,1);assert.equal(a.linked[0].records,2);assert.equal(a.linked[0].first_date,'2026-10-01');assert.equal(a.linked[0].last_date,'2026-10-09');assert.equal(a.unlinked_records,0);
});
test('different batches on same plot never joined; unlinked not guessed',()=>{
const make=(ref,batch)=>({reference:ref,date:'2026-10-09',category:'FIELD_OPERATION',report_facts:{batch_ids:batch?[batch]:[],crops:['Timun'],plots:['M3P1'],activities:['Crop_Batch']}});
const a=ctx.bseTelegramReportCycles_([make('a','B-001'),make('b','B-002'),make('c',null)]);
assert.equal(a.linked.length,2);assert.equal(a.unlinked_records,1);
});
test('duplicate report events do not inflate records',()=>{
const e={reference:'r1',date:'2026-10-01',category:'FIELD_OPERATION',report_facts:{batch_ids:['B-001'],activities:['Crop_Batch']}};
assert.equal(ctx.bseTelegramReportCycles_([e,e]).linked[0].records,1);
});