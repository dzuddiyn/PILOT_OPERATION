'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const src=fs.readFileSync(path.join(__dirname,'TelegramApprovalUiTest.js'),'utf8');
const slice=(start,end)=>{const i=src.indexOf('function '+start+'('),j=src.indexOf('function '+end+'(',i+1);assert(i>=0&&j>i,'missing '+start);return src.slice(i,j);};
const latest=(name)=>{const needle='function '+name+'(';const i=src.lastIndexOf(needle);assert(i>=0);const j=src.indexOf('\nfunction ',i+needle.length);return src.slice(i,j<0?src.length:j);};
const ref='BSE-TG-772257715',key=ref+'|Crop_Batch_Log',batchId='BSE-SB-CB-20261023-001',hash='VALID_HASH';
const batchHeaders=['source_key','queue_update_id','batch_id','event_date','crop','variety','batch_action','batch_status','verification_status','original_note','approved_at','reviewer','payload_hash'];
const eventHeaders=['source_key','queue_update_id','batch_id','planting_event_id','event_date','event_type','crop','variety','event_status','verification_status','original_note','approved_at','reviewer','payload_hash','seed_quantity','seed_unit'];
const plotHeaders=['source_key','queue_update_id','batch_id','allocation_id','event_date','plot_id','allocation_status','verification_status','original_note','approved_at','reviewer','payload_hash'];
const data={
 PILOT_CROP_BATCH:{headers:batchHeaders,rows:[[key,'772257715',batchId,'2026-10-23','Timun','7055 CCB','BATCH_START','PROPOSED','PROVISIONAL','','','dzuddiyn',hash]]},
 PILOT_PLANTING_EVENT:{headers:eventHeaders,rows:[[key,'772257715',batchId,'event1','2026-10-23','SEED_SOWING','Timun','7055 CCB','PROPOSED','PROVISIONAL','','','dzuddiyn',hash,'200','g']]},
 PILOT_PLOT_ALLOCATION:{headers:plotHeaders,rows:[[key,'772257715',batchId,'plot1','2026-10-23','M3P1','PLANNED','PROVISIONAL','','','dzuddiyn',hash],[key,'772257715',batchId,'plot2','2026-10-23','M3P2','PLANNED','PROVISIONAL','','','dzuddiyn',hash]]}
};
const calls=[];
let env='PILOT_OPERATION';
const book={
 getSheetByName:(name)=>{
  const src=data[name.replace(/^TEST_/,'PILOT_')];if(!src)return null;
  return {getLastRow:()=>src.rows.length+1,getLastColumn:()=>src.headers.length,
   getRange:()=>({getValues:()=>[src.headers].concat(src.rows)})};
 }
};
const testCtx={console,Date,JSON,Number,Set,SpreadsheetApp:{flush(){}},BSE_TG_QUEUE_HEADERS:Array(18).fill(''),
 bseRuntimeEnvironmentName_:()=>env, bseTelegramReporterDisplayName_:()=> 'dzuddiyn',
 bseTelegramApprovalSheet_:()=>({getRange:()=>({setValues:()=>{}})}),
 bseApprovalRows_:()=>approval,
 bseTelegramReporterCardAuthorized_:()=>true,
 bseTelegramQueue_:()=>({getLastRow:()=>2,getRange:()=>({getValues:()=>[queue]})}),
 bseApprovalCandidateIndexFromSourceKey_:()=>null,
 bseApprovalEnvelopes_:()=>[parsed],
 bseApprovalHash_:()=> 'EXPECTED_HASH',
 bseApprovalDomain_:()=>({target:'Crop_Batch_Log',core:()=>({source_key:key,production_write:false})}),
 bseApprovalRecomputeQueueStatus_:()=> 'REPORTER_CONFIRMED',
 bseTelegramConfirmedPersistedSummary_:null,
 bseTelegramApprovalCloseCard_:(row,status,actor,text)=>calls.push({kind:'edit',status,text}),
 bseTelegramReporterReceipt_:()=>calls.push({kind:'reporter_receipt'}),
 bseTelegramOwnerNotice_:()=>calls.push({kind:'owner_notice'}),
 bseTelegramPilotConfirmedOwnerNotice_:()=> 'GENERIC OWNER NOTICE',
 bseTelegramSafeErrorDescription_:()=> '', Utilities:{formatDate:()=> ''}
};
const parsed={validation:'PASS',production_write:false,candidates:[
 {target:'Crop_Batch_Log'},{target:'Planting_Event_Log'},{target:'Plot_Allocation_Log'},{target:'Plot_Allocation_Log'}]};
const approval=[[ref,key,'EXPECTED_HASH','1234','','','','-1234','900','901','TOKEN-1','','','','','','','OPEN']];
const queue=Array(18).fill('');queue[0]='772257715';queue[9]=JSON.stringify(parsed);
vm.createContext(testCtx);
vm.runInContext(slice('bseTelegramConfirmedPersistedSummary_','bseTelegramReporterConfirmationCore_'),testCtx);
vm.runInContext(latest('bseTelegramReporterConfirmationCore_'),testCtx);
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('PASS '+name);};
test('realistic PILOT sowing ledger creates verified receipt with recorded seed quantity',()=>{
 const out=testCtx.bseTelegramConfirmedPersistedSummary_(book,ref,'Crop_Batch_Log',{source_key:key});
 for(const s of ['REKOD SEMAIAN DISIMPAN','BSE-TG-772257715','23/10/2026','Timun (7055 CCB)','M3P1, M3P2','200 g','2 plot'])assert(out.includes(s),s);
 assert(!out.includes('65 tray'));assert(!out.includes('batch_id'));
});
test('Benar updates precisely one ORIGINAL card with reporter identity',()=>{
 calls.length=0;
 const out=testCtx.bseTelegramReporterConfirmationCore_(book,{actor_name:'fallback',actor_id:'1234'},
  {token:'TOKEN-1',kind:'A',callback:{message:{chat:{id:-1234},message_id:901}}});
 assert.equal(out.production_write,false);
 assert.deepEqual(calls.map(x=>x.kind),['edit']);
 const text=calls[0].text;
 for(const s of ['REKOD SEMAIAN DISIMPAN','Timun (7055 CCB)','M3P1, M3P2','Kuantiti benih: 200 g','Pelapor : dzuddiyn'])assert(text.includes(s),s);
});
test('amount/unit must come from LEDGER, not hypothetical request',()=>{
 data.PILOT_PLANTING_EVENT.rows[0][14]='300';data.PILOT_PLANTING_EVENT.rows[0][15]='tray';
 const msg=testCtx.bseTelegramConfirmedPersistedSummary_(book,ref,'Crop_Batch_Log',{source_key:key});
 assert(msg.includes('300 tray'));assert(!msg.includes('200 g'));
 data.PILOT_PLANTING_EVENT.rows[0][14]='200';data.PILOT_PLANTING_EVENT.rows[0][15]='g';
});
test('one missing seed unit produces no unverifiable detailed summary',()=>{
 data.PILOT_PLANTING_EVENT.rows[0][15]='';
 assert.equal(testCtx.bseTelegramConfirmedPersistedSummary_(book,ref,'Crop_Batch_Log',{source_key:key}),'');
 data.PILOT_PLANTING_EVENT.rows[0][15]='g';
});
test('missing/mismatched plot rows fails closed',()=>{
 const saved=data.PILOT_PLOT_ALLOCATION.rows[1];
 data.PILOT_PLOT_ALLOCATION.rows[1]=[...saved];data.PILOT_PLOT_ALLOCATION.rows[1][5]='M3P1';
 assert.equal(testCtx.bseTelegramConfirmedPersistedSummary_(book,ref,'Crop_Batch_Log',{source_key:key}),'');
 data.PILOT_PLOT_ALLOCATION.rows[1]=saved;
});
test('other module still sends existing notices; no side effects in summary renderer',()=>{
 const fn=latest('bseTelegramReporterConfirmationCore_');
 assert(fn.includes("domain.target==='Crop_Batch_Log'"));
 assert(fn.includes('if(!censusSingle)'));
 assert(!/appendRow|insertSheet|deleteRow/.test(fn));
 const summary=slice('bseTelegramConfirmedPersistedSummary_','bseTelegramReporterConfirmationCore_');
 assert(!/appendRow|insertSheet|deleteRow|setValues/.test(summary));
});
test('pilot-only scope, non-PILOT still follows previous message flow',()=>{
 env='TEST';calls.length=0;
 testCtx.bseTelegramReporterConfirmationCore_(book,{actor_name:'fallback',actor_id:'1234'},
  {token:'TOKEN-1',kind:'A',callback:{message:{chat:{id:-1234},message_id:901}}});
 assert.deepEqual(calls.map(x=>x.kind),['edit','reporter_receipt','owner_notice']);
 env='PILOT_OPERATION';
});
console.log('GI_UX_05_RECEIPT '+passed+'/'+passed+' PASS');
