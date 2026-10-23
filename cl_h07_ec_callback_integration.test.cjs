const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const rows=[['reference','schema_version','canonical_json','state']],approval=[];
let failAfterWrite=false;let telegramEdits=0;
const sheet={getLastRow:()=>rows.length,getRange:(r,c,n)=>({getValues:()=>rows.slice(r-1,r-1+n),setValues:x=>rows.push(...x)}),appendRow:x=>{rows.push(x);if(failAfterWrite)throw Error('transport-timeout')}};
const approvalSheet={getRange:(r,c)=>({setValue:v=>approval.push({r,c,v})})};
const ctx={Set,bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',SpreadsheetApp:{flush:()=>{}},bseTelegramApprovalSheet_:()=>approvalSheet,bseApprovalRecomputeQueueStatus_:()=> 'REPORTER_CONFIRMED',bseTelegramApprovalCloseCard_:()=>{telegramEdits++;return {state:'ACKNOWLEDGED'}}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/PilotEcAtomicBatch.js','utf8'),ctx);
ctx.bsePilotEcCanonicalRows_=()=>sheet;
const batch=ctx.bsePilotEcCanonicalBatch_('BSE-TG-772258028','EC leaching\n14/10/2026\nM1P1-x\nM7-3.5','2026-10-14');
const args=[{}, {actor_name:'tester'}, {kind:'A'}, {row:['BSE-TG-772258028',...Array(16).fill(''),'OPEN'],card_row:5,proposal:{aggregate_type:'PILOT_EC_ATOMIC',ec_batch:batch}}];
const outcome=ctx.bsePilotEcTelegramAggregateCore_(...args);assert.equal(outcome.decision,'CONFIRMED');assert.equal(outcome.canonical_state,'COMMITTED');assert.equal(rows.length,2);assert.equal(telegramEdits,1);assert(approval.some(x=>x.c===18&&x.v==='REPORTER_CONFIRMED'));
assert.equal(ctx.bsePilotEcTelegramAggregateCore_(...args).canonical_state,'ALREADY_APPLIED'); // retry after uncertain approval state
const refreshed={...args[3],row:[...args[3].row]};refreshed.row[17]='REPORTER_CONFIRMED';assert.throws(()=>ctx.bsePilotEcTelegramAggregateCore_(args[0],args[1],args[2],refreshed),/NOT_OPEN/);
assert.equal(rows.length,2);
console.log('EC_CALLBACK_INTEGRATION 7/7 PASS');
