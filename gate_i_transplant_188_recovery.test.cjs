'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(__dirname+'/PilotGateITransplant188Recovery.js','utf8');
let total=0;
function fixture(modify){
 const note='Transplant\nTimun\n- M5P34\n- 9/10/26',token='TESTtoken01',sourceKey='BSE-TG-772257188|Transplant_Event_Log';
 const candidate={validation:'PASS',production_write:false,candidates:[{target:'Transplant_Event_Log'}],transplant_crop_conflict:{declared:' M5P34',canonical:'Timun'}};
 const q=Array(18).fill('');q[0]='772257188';q[1]='123456789';q[2]='123456789';q[4]=note;q[6]='NEEDS_HUMAN_REVIEW';q[9]=JSON.stringify(candidate);
 const c=Array(26).fill('');c[0]='BSE-TG-772257188';c[1]=sourceKey;c[2]='expected-hash';c[3]='123456789';c[7]='123456789';c[9]='111';c[10]=token;c[17]='OPEN';
 const cb=(id)=>{const a=Array(11).fill('');a[0]=id;a[2]=token;a[3]='A';a[5]='FAILED_CALLBACK_RETRY_LIMIT';a[6]=5;a[8]='2026-10-18T12:00:00Z';a[4]=JSON.stringify({from:{id:123456789},message:{message_id:111,chat:{id:123456789,type:'private'}},data:'B1:'+token+':A'});return a;};
 const callbacks=[cb('772257189'),cb('772257190')],domain={reviews:[],events:[],statuses:[]};
 let calls=0;
 const sheet=(rows)=>({rows,getRange:(r,col,count,width)=>({setValues:(v)=>{for(let j=0;j<v[0].length;j++)rows[r-2][col+j-1]=v[0][j]},getValues:()=>[rows[r-2].slice(col-1,col-1+width)]})});
 const qsheet=sheet([q]),csheet=sheet([c]),callbackSheet=sheet(callbacks);
 const ctx={JSON,Date,console,SpreadsheetApp:{flush:()=>{}},BSE_TG_QUEUE_HEADERS:Array(18),BSE_APPROVAL_CALLBACK_HEADERS:Array(11),
 BSE_TRANSPLANT_REVIEW_HEADERS:[],BSE_TRANSPLANT_EVENT_HEADERS:[],BSE_ALLOCATION_STATUS_EVENT_HEADERS:[],
 bseRuntimeEnvironmentName_:()=>ctx.env,boundTestBook_:()=>({}),env:'PILOT_OPERATION',
 bseTelegramQueue_:()=>qsheet,bseCropBatchRows_:(s)=>s.rows,
 bseTelegramApprovalSheet_:()=>csheet,bseApprovalRows_:(s)=>s.rows,
 bseApprovalEnvelopes_:()=>[{validation:'PASS',production_write:false,candidates:[{target:'Transplant_Event_Log'}]}],
 bseApprovalHash_:()=>ctx.hash,hash:'expected-hash',
 bseTransplantReviewEncodedCandidate_:v=>v,
 bseTransplantProposal_:()=>({fields:{event_date:'2026-10-09',crop:'Timun',variety:'282'},plots:['M5P3','M5P4']}),
 bseTransplantMatchForBook_:()=>({kind:'UNIQUE',batch_id:'BSE-SB-CB-20261006-001',allocations:[{plot_id:'M5P3'},{plot_id:'M5P4'}]}),
 bseTelegramApprovalCallbackSheet_:()=>callbackSheet,
 bseTransplantRowsByName_:(_b,name)=>name.includes('REVIEW')?domain.reviews:name.includes('STATUS')?domain.statuses:domain.events,
 bseTelegramApprovalCallback_:()=>{
   calls++;domain.reviews.push(['',sourceKey,'','','','APPROVED']);
   domain.events.push([sourceKey,'','','','','','','','M5P3|M5P4']);
   domain.statuses.push([sourceKey,'','','','','','M5P3','PLANNED','ACTIVE'],[sourceKey,'','','','','','M5P4','PLANNED','ACTIVE']);
   c[17]='REPORTER_CONFIRMED';q[6]='REPORTER_CONFIRMED';return {production_write:false}
 }};
 if(modify)modify({ctx,q,c,callbacks,domain});
 vm.createContext(ctx);vm.runInContext(source,ctx);
 return {run:()=>ctx.recoverBsePilotGateITransplant188Once(),calls:()=>calls,callbacks,domain};
}
function test(label,fn){fn();total++;console.log('PASS '+label)}
test('valid previously confirmed callback writes once and reads back',()=>{
 const t=fixture();const result=t.run();assert.strictEqual(result.transplant_events,1);assert.strictEqual(t.calls(),1);
 assert.strictEqual(t.callbacks[0][5],'PROCESSED');assert.strictEqual(t.callbacks[1][5],'FAILED_CALLBACK_RETRY_LIMIT');
 assert.throws(()=>t.run(),/GATE_I_188_QUEUE_NOT_OPEN/);assert.strictEqual(t.calls(),1);
});
test('forged callback actor fails without domain writer',()=>{const t=fixture(({callbacks})=>{const c=JSON.parse(callbacks[0][4]);c.from.id=987654321;callbacks[0][4]=JSON.stringify(c)});assert.throws(()=>t.run(),/AUTH_MISMATCH/);assert.strictEqual(t.calls(),0)});
test('prior domain write blocks recovery',()=>{const t=fixture(({domain})=>domain.events.push(['BSE-TG-772257188|Transplant_Event_Log']));assert.throws(()=>t.run(),/PARTIAL_OR_ALREADY_WRITTEN/);assert.strictEqual(t.calls(),0)});
test('bad card hash blocks recovery',()=>{const t=fixture(({ctx})=>ctx.hash='wrong');assert.throws(()=>t.run(),/HASH_MISMATCH/);assert.strictEqual(t.calls(),0)});
test('non PILOT blocks recovery',()=>{const t=fixture(({ctx})=>ctx.env='PILOT_TEST');assert.throws(()=>t.run(),/PILOT_ONLY/);assert.strictEqual(t.calls(),0)});
console.log('GATE_I_188_RECOVERY '+total+'/'+total+' PASS');
