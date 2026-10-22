'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const code=source('TelegramApprovalUiTest.js');
const get=(name)=>{
 const all=code.split(/\r?\n/);
 const lines=all.filter(x=>x.startsWith('function '+name+'('));
 assert.equal(lines.length,1,name+' declaration count');
 return lines[0];
};
let env='PILOT_OPERATION',flushes=0,lockCalls=0,actions=[];
const mkSheet=(rows)=>({
 data:rows,
 getLastRow(){return this.data.length;},
 getRange(r,c,n=1,w=1){return {
  getValues:()=>rows.slice(r-1,r-1+n).map(row=>row.slice(c-1,c-1+w)),
  setValue(v){rows[r-1][c-1]=v;return this;},
  setValues(vals){vals.forEach((v,i)=>v.forEach((x,j)=>{rows[r-1+i][c-1+j]=x;}));return this;},
  setNumberFormat(){return this;}
 };},
 appendRow(row){rows.push(row);}
});
const candidate={validation:'NEED_INFO',production_write:false,candidates:[{target:'Plant_Census_Log',validation:'NEED_INFO',missing:['event_date'],fields:{crop:'Peria',census_entries:[{plot_id:'M6P2'}]}}]};
const queueRow=Array(18).fill('');queueRow[0]='772257581';queueRow[1]='-100333';queueRow[2]='1234';queueRow[6]='INCOMPLETE_CANCEL_ONLY';queueRow[9]=JSON.stringify(candidate);queueRow[15]='900';
const queue=mkSheet([Array(18).fill(''),queueRow]);
const callbacks=mkSheet([Array(11).fill('')]);
const book={};
const context={console,Date,JSON,Number,Set,SpreadsheetApp:{flush:()=>flushes++},
 bseRuntimeEnvironmentName_:()=>env,BSE_TG_QUEUE_HEADERS:Array(18).fill(''),
 BSE_APPROVAL_CALLBACK_HEADERS:Array(11).fill(''),
 bseTelegramQueue_:()=>queue,bseTelegramApprovalCallbackSheet_:()=>callbacks,boundTestBook_:()=>book,
 bseTelegramTestApprovalGroupIds_:()=>[],
 bseTelegramCallbackPendingDue_:(r,now)=>r[5]==='PENDING',
 bseTelegramCallbackFailureState_:(err,n)=>({status:'FAILED',last_error:String(err),next_attempt_at:''}),
 bseTelegramPrivateOptInNudge_:()=>{throw Error('unexpected nudge');},
 bseTelegramApprovalCallbackB1D1_:()=>{throw Error('Unexpected domain callback');},
 bseReviewWithLock_:(ctx,run)=>{assert.equal(ctx.production_write,false);lockCalls++;return run(book,ctx);},
 bseTelegramApi_:(name,payload)=>{actions.push(name);return {ok:true};}
};
vm.createContext(context);
vm.runInContext(source('PilotIncompleteBatalTest.js'),context);
for(const name of ['bseTelegramApprovalPersistCallback_','bseTelegramApprovalCallback_','processBseTelegramApprovalCallbacks'])vm.runInContext(get(name),context);
const cb=(id='1234',cid='callback-one',messageId=900)=>({id:cid, data:'C2:772257581:C',
 from:{id:Number(id)},message:{message_id:messageId,chat:{id:-100333,type:'supergroup'},text:'SEMAKAN LAPORAN BELUM LENGKAP\nRujukan : BSE-TG-772257581'}});
const update=(c,n)=>({update_id:n,callback_query:c});
let count=0;const t=(label,fn)=>{fn();count++;console.log('PASS '+label);};
t('persist callback through real callback pending queue without group nudge',()=>{
 assert(context.bseTelegramApprovalPersistCallback_(book,update(cb(),1001)).persisted);
 assert.equal(callbacks.data.length,2);
 assert.equal(callbacks.data[1][5],'PENDING');
 assert.equal(actions.length,0);
});
t('durable callback processed through actual dispatcher and marks queue only',()=>{
 context.processBseTelegramApprovalCallbacks();
 assert.equal(callbacks.data[1][5],'PROCESSED');assert.equal(queueRow[6],'INCOMPLETE_CANCELLED');
 assert.equal(lockCalls,1);assert.deepEqual(actions,['editMessageText','answerCallbackQuery']);
});
t('repeat Telegram update deduplicated without reprocessing',()=>{
 assert(context.bseTelegramApprovalPersistCallback_(book,update(cb(),1001)).duplicate);
 assert.equal(callbacks.data.length,2);
 assert.equal(queueRow[6],'INCOMPLETE_CANCELLED');
});
t('different callback ID against completed report cannot rewrite queue',()=>{
 assert(context.bseTelegramApprovalPersistCallback_(book,update(cb('1234','second-click'),1002)).persisted);
 context.processBseTelegramApprovalCallbacks();
 assert.equal(callbacks.data[2][5],'PROCESSED');assert.equal(queueRow[6],'INCOMPLETE_CANCELLED');
 assert.deepEqual(actions,['editMessageText','answerCallbackQuery','editMessageText','answerCallbackQuery']);
});
t('forged different author fails and does not mutate queue',()=>{
 queueRow[6]='INCOMPLETE_CANCEL_ONLY';
 assert(context.bseTelegramApprovalPersistCallback_(book,update(cb('7777','forged'),1003)).persisted);
 context.processBseTelegramApprovalCallbacks();
 assert.equal(queueRow[6],'INCOMPLETE_CANCEL_ONLY');
});
t('not PILOT, persistence rejects C2 action',()=>{
 env='TEST';
 assert.throws(()=>context.bseTelegramApprovalPersistCallback_(book,update(cb('1234','wrong-env'),1004)),/tidak sah/);
 env='PILOT_OPERATION';
});
console.log('GI_UX_02_CALLBACK_E2E '+count+'/'+count+' PASS');
