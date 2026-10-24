'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',bseTelegramHistoryInPeriod_:(date,period)=>date.startsWith(period)};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('TelegramCropLifecycleReportAdapter.js','utf8'),ctx);
function sheet(header,rows){return {getLastRow:()=>rows.length+1,getLastColumn:()=>header.length,getRange:()=>({getValues:()=>[header,...rows]})}}
function book(){const tables={
CROP_BATCH:sheet(['batch_id','event_date','crop','verification_status'],[['B-01','2026-08-08','Timun','PROVISIONAL'],['B-02','2026-08-08','Timun','PROVISIONAL']]),
PLANTING_EVENT:sheet(['batch_id','event_date','event_type','source_key'],[['B-01','2026-08-08','SEED_SOWING','sow1'],['B-02','2026-08-08','SEED_SOWING','sow2']]),
PLOT_ALLOCATION:sheet(['batch_id','allocation_id','plot_id'],[['B-01','A-01','M3P1'],['B-02','A-02','M3P1']]),
TRANSPLANT_EVENT:sheet(['batch_id','event_date','plot_ids','source_key'],[['B-01','2026-08-12','M3P1','tr1']]),
ALLOCATION_STATUS_EVENT:sheet(['batch_id','allocation_id','plot_id','source_key','to_status','changed_at'],[['B-01','A-01','M3P1','tr1','ACTIVE','2026-10-23T10:00:00Z'],['B-01','A-01','M3P1','operation1','INACTIVE','2026-10-23T11:00:00Z']]),
OPERATION_LOG:sheet(['source_key','event_date','plot_id','operation_type'],[['operation1','2026-10-06','M3P1','CYCLE_END'],['orphan','2026-10-06','M3P1','HARVEST_START']])
};return {getSheetByName:n=>tables[n.replace(/^PILOT_/,'')]||null}};
test('canonical batch links transplant and cycle end without plot inference',()=>{
const a=ctx.bseTelegramReportLedgerCycles_(book(),'2026-10');
assert.equal(a.linked.filter(x=>x.batch_id==='B-01').length,1);
assert.equal(a.linked.find(x=>x.batch_id==='B-01').stages.some(x=>x.type==='CYCLE_END'),true);
assert.equal(a.linked.some(x=>x.batch_id==='B-02'&&x.stages.some(y=>y.type==='CYCLE_END')),false);
assert.equal(a.unlinked_records,1);
});
test('missing PILOT runtime yields no data',()=>{
ctx.bseRuntimeEnvironmentName_=()=> 'TEST';
assert.equal(ctx.bseTelegramReportLedgerCycles_(book(),'2026-10').linked.length,0);
});