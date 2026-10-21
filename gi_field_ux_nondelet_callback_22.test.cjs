'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),crypto=require('node:crypto');
const inv=fs.readFileSync(__dirname+'/InventoryReviewTest.js','utf8'),ui=fs.readFileSync(__dirname+'/TelegramApprovalUiTest.js','utf8');
function part(begin,end){const a=ui.indexOf(begin),b=ui.indexOf(end,a+begin.length);assert(a>=0&&b>a);return ui.slice(a,b)}
const selected=[
 part('function bseApprovalCandidateEnvelope_(','function bseApprovalCandidateIndexFromSourceKey_('),
 part('function bseApprovalCandidateIndexFromSourceKey_(','function bseApprovalReferenceRows_('),
 part('function bseTelegramReporterConfirmationCore_(book,context,input){','function reconcileBseTelegramApprovalQueueStatusTest(')
].join('\n');
function fixture(){
 const result={validation:'PASS',production_write:false,candidates:[
 {target:'Inventory_Event_Log',validation:'PASS',missing:[],fields:{record_type:'INVENTORY_IN',event_type:'INVENTORY_IN',item_name:'Fruitka',quantity:2,unit:'set',event_date:'2026-10-15',original_note:'TEST_ONLY Baja In',multi_item_fertilizer:true}},
 {target:'Inventory_Event_Log',validation:'PASS',missing:[],fields:{record_type:'INVENTORY_IN',event_type:'INVENTORY_IN',item_name:'Benegro N',quantity:3,unit:'set',event_date:'2026-10-15',original_note:'TEST_ONLY Baja In',multi_item_fertilizer:true}}
 ]};
 const approval=result.candidates.map((_,i)=>{const r=Array(28).fill('');r[0]='BSE-TG-900022';r[1]='BSE-TG-900022|Inventory_Event_Log|C'+(i+1);r[3]='111';r[7]='222';r[10]='token'+i;r[17]='OPEN';return r});
 const queue=[Array(22).fill('')];queue[0][0]='900022';queue[0][9]=JSON.stringify(result);
 const ledger=[],review=[];const named={'APPROVAL':approval,'QUEUE':queue};
 const ctx={BSE_TG_QUEUE_HEADERS:Array(22).fill(''),bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',
 bseInventoryMalaysiaDate_:()=> '2026-10-21',bseReviewContextValidate_:x=>x,
 bseApprovalHash_:v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex'),
 bseInventoryPayloadHash_:p=>crypto.createHash('sha256').update(JSON.stringify(p)).digest('hex'),
 bseEvidenceRefs_:()=>[],Utilities:{getUuid:()=> 'TESTONLY',},SpreadsheetApp:{flush:()=>{}},
 bseTelegramApprovalSheet_:()=> 'APPROVAL',bseApprovalRows_:s=>named[s],
 bseTelegramQueue_:()=> 'QUEUE',
 bseTelegramReporterCardAuthorized_:(r,cb)=>String(r[3])===String(cb.from.id)&&String(r[7])===String(cb.message.chat.id),
 bseApprovalDomain_:r=>({target:'Inventory_Event_Log',core:(b,c)=>ctx.bseInventoryReviewCore_(b,c)}),
 bseApprovalRecomputeQueueStatus_:()=> 'PARTIAL',
 bseTelegramConfirmedPersistedSummary_:()=> 'TEST_ONLY_SUMMARY',
 bseTelegramApprovalCloseCard_:()=>{},bseTelegramReporterReceipt_:()=>{},bseTelegramPilotConfirmedOwnerNotice_:()=> 'TEST_ONLY_NOTICE',bseTelegramOwnerNotice_:()=>{},
 bseInventoryEnsureSheet_:(book,name)=>book.getSheetByName(name)||book.insertSheet(name),
 bseTelegramApi_:()=>{throw Error('LIVE_TELEGRAM_API_FORBIDDEN')}
 };
 vm.createContext(ctx);vm.runInContext(inv,ctx);vm.runInContext(selected,ctx);ctx.bseInventoryPayloadHash_=p=>crypto.createHash('sha256').update(JSON.stringify(p)).digest('hex');ctx.bseTelegramConfirmedPersistedSummary_=()=> 'TEST_ONLY_SUMMARY';
 approval.forEach((r,i)=>r[2]=ctx.bseApprovalHash_(ctx.bseApprovalCandidateEnvelope_(result,i)));
 const sheets=new Map();function sheet(name){const rows=name==='TEST_INVENTORY_EVENT'?ledger:name==='TEST_INVENTORY_REVIEW'?review:name==='QUEUE'?queue:name==='APPROVAL'?approval:[];return {
 rows,getLastRow:()=>name==='QUEUE'?queue.length+1:name==='APPROVAL'?approval.length+1:rows.length+1,appendRow:row=>rows.push([...row]),
 getRange:(row,col,n=1)=>({getValues:()=>rows.slice(row-2,row-2+n).map(r=>r.slice(col-1)),
 setValue:v=>{rows[row-2][col-1]=v;},setValues:values=>{if(name==='APPROVAL'){values[0].forEach((v,j)=>approval[row-2][col-1+j]=v);}else values[0].forEach((v,j)=>rows[row-2][col-1+j]=v);}})
 }};
 const book={getSheetByName:name=>name==='APPROVAL'?sheet('APPROVAL'):name==='QUEUE'?sheet('QUEUE'):sheets.get(name)||null,insertSheet:name=>{const x=sheet(name);sheets.set(name,x);return x}};
 // Each callback reads approval/queue rows via sheet interfaces.
 ctx.bseApprovalRows_=()=>approval;
 ctx.bseTelegramApprovalSheet_=()=>book.getSheetByName('APPROVAL');
 ctx.bseTelegramQueue_=()=>book.getSheetByName('QUEUE');
 const call=(i,from='111',chat='222')=>ctx.bseTelegramReporterConfirmationCore_(book,{actor_name:'TEST_ONLY_ACTOR'},{
 token:'token'+i,kind:'A',callback:{from:{id:from},message:{chat:{id:chat},message_id:500+i}}});
 return {call,approval,ledger,review,result,ctx};
}
test('two original approval callbacks append two distinct ledger rows',()=>{
 const f=fixture();f.call(0);f.call(1);
 assert.equal(f.ledger.length,2);assert.notEqual(f.ledger[0][0],f.ledger[1][0]);
 assert.equal(f.approval[0][17],'REPORTER_CONFIRMED');assert.equal(f.approval[1][17],'REPORTER_CONFIRMED');
});
test('wrong reporter or chat fails before write',()=>{const f=fixture();assert.equal(f.call(0,'BAD').authorized,false);assert.equal(f.call(1,'111','BAD').authorized,false);assert.equal(f.ledger.length,0)});
test('duplicate callback creates no second record',()=>{const f=fixture();f.call(0);assert.equal(f.call(0).duplicate,true);assert.equal(f.ledger.length,1)});
test('partial approval is visible, second callback completes without duplicating first',()=>{const f=fixture();f.call(0);assert.equal(f.ledger.length,1);assert.equal(f.approval[1][17],'OPEN');f.call(1);assert.equal(f.ledger.length,2);assert.equal(f.call(0).duplicate,true)});
test('candidate hash mismatch prevents ledger write',()=>{const f=fixture();f.approval[0][2]='bad';assert.throws(()=>f.call(0),/Hash/);assert.equal(f.ledger.length,0)});
test('failure after ledger write before receipt leaves status and ledger distinguishable',()=>{
 const f=fixture();const original=f.ctx.bseTelegramConfirmedPersistedSummary_;
 f.ctx.bseTelegramConfirmedPersistedSummary_=()=>{throw Error('TEST_ONLY_RECEIPT_FAILURE')};
 assert.throws(()=>f.call(0),/TEST_ONLY_RECEIPT_FAILURE/);
 assert.equal(f.ledger.length,1);
 assert.equal(f.approval[0][17],'REPORTER_CONFIRMED');
 f.ctx.bseTelegramConfirmedPersistedSummary_=original;
 assert.equal(f.call(0).duplicate,true);
 assert.equal(f.ledger.length,1);
});
