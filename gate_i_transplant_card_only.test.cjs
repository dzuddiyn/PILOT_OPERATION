'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const worker=fs.readFileSync(__dirname+'/TelegramWorkerTest.js','utf8');
const approval=fs.readFileSync(__dirname+'/TelegramApprovalUiTest.js','utf8');
function extract(source,name){
 const at=source.indexOf('function '+name+'(');if(at<0)throw Error('MISSING '+name);
 let pos=source.indexOf('{',at),depth=0,quote='',esc=false;
 for(let i=pos;i<source.length;i++){
  const c=source[i];
  if(quote){if(esc){esc=false;continue}if(c==='\\'){esc=true;continue}if(c===quote)quote='';continue}
  if(c==='"'||c==="'"){quote=c;continue}
  if(c==='{')depth++;else if(c==='}'&&--depth===0)return source.slice(at,i+1);
 }
 throw Error('UNCLOSED '+name);
}
let env='PILOT_OPERATION',passed=0;
const ctx={bseRuntimeEnvironmentName_:()=>env};
vm.createContext(ctx);
vm.runInContext(extract(worker,'bsePilotTransplantReviewCardOnly_'),ctx);
const good={validation:'PASS',production_write:false,candidates:[{target:'Transplant_Event_Log',validation:'PASS',missing:[],fields:{event_date:'2026-10-07',crop:'Timun',plot_ids:['M5P1','M5P2']}}]};
const check=(name,fn)=>{fn();passed++;console.log('PASS '+name)};
check('normal PILOT Transplant PASS suppresses redundant interim response',()=>{
 assert.strictEqual(ctx.bsePilotTransplantReviewCardOnly_(good,'NEEDS_HUMAN_REVIEW'),true);
});
check('NEED_INFO retains human question/ForceReply',()=>{
 assert.strictEqual(ctx.bsePilotTransplantReviewCardOnly_({...good,validation:'NEED_INFO'},'WAITING_INFO'),false);
});
check('all non-Transplant domains retain their existing result messages',()=>{
 assert.strictEqual(ctx.bsePilotTransplantReviewCardOnly_({...good,candidates:[{...good.candidates[0],target:'Treatment_Event_Log'}]},'NEEDS_HUMAN_REVIEW'),false);
});
check('invalid, duplicate and unconfirmed payloads never suppress a needed message',()=>{
 assert.strictEqual(ctx.bsePilotTransplantReviewCardOnly_({...good,production_write:true},'NEEDS_HUMAN_REVIEW'),false);
 assert.strictEqual(ctx.bsePilotTransplantReviewCardOnly_({...good,candidates:[]},'NEEDS_HUMAN_REVIEW'),false);
 assert.strictEqual(ctx.bsePilotTransplantReviewCardOnly_({...good,candidates:[good.candidates[0],good.candidates[0]]},'NEEDS_HUMAN_REVIEW'),false);
 assert.strictEqual(ctx.bsePilotTransplantReviewCardOnly_({...good,candidates:[{...good.candidates[0],missing:['event_date']}]},'NEEDS_HUMAN_REVIEW'),false);
 assert.strictEqual(ctx.bsePilotTransplantReviewCardOnly_(good,'WAITING_INFO'),false);
});
check('TEST and PILOT_TEST retain original worker result messages',()=>{
 env='TEST';assert.strictEqual(ctx.bsePilotTransplantReviewCardOnly_(good,'NEEDS_HUMAN_REVIEW'),false);
 env='PILOT_TEST';assert.strictEqual(ctx.bsePilotTransplantReviewCardOnly_(good,'NEEDS_HUMAN_REVIEW'),false);
 env='PILOT_OPERATION';
});
check('one send result branch is skipped but approval card still runs',()=>{
 const s=extract(worker,'processBseTelegramTestQueue');
 const guard=s.indexOf('if(!bsePilotTransplantReviewCardOnly_(result,reviewStatus)&&!bsePilotSowingReviewCardOnly_(result,reviewStatus))');
 const send=s.indexOf("bseTelegramApi_('sendMessage',payload)",guard);
 const finalize=s.indexOf("sheet.getRange(job.row,7).setValue(reviewStatus)",send);
 const card=s.indexOf('bseTelegramApprovalEnsureCard_(book,latest)',finalize);
 assert(guard>0&&send>guard&&finalize>send&&card>finalize);
 assert(s.includes("if(question||claimMissingText)payload.reply_markup={force_reply:true"));
 assert(s.includes('const reviewStatus=bseTelegramQueueStatus_(result)'));
});
check('original controller Batal path has no unbound UI variables',()=>{
 const start=approval.indexOf('function bseTelegramApprovalControllerCore_(');
 const end=approval.indexOf('function bseTelegramApprovalReminderText_(',start);
 assert(start>=0&&end>start);
 const s=approval.slice(start,end);
 assert(!s.includes('if(transplant&&bseRuntimeEnvironmentName_()'));
 assert(s.includes("if(input.kind==='R')"));
 assert(s.includes('reallocation&&reallocation.required===true'));
 assert(s.includes('Batal oleh penghantar pada kad perubahan plot.'));
 assert(s.includes('PENDING_REJECT_REASON'));
});
check('user-facing PILOT Transplant card summary remains after controller repair',()=>{
 const s=extract(approval,'bseApprovalSummary_');
 assert(s.includes("if(transplant&&bseRuntimeEnvironmentName_()==='PILOT_OPERATION')"));
 assert(s.includes('Tarikh kerja:'));
 assert(s.includes('Plot:'));
 assert(s.includes('Tekan Benar hanya jika'));
});
check('Transplant one-card callback hashes the same stripped envelope as card creation',()=>{
 const confirmation=approval.slice(approval.lastIndexOf('function bseTelegramReporterConfirmationCore_('));
 assert(confirmation.includes('const envelopes=bseApprovalEnvelopes_(aggregate);'));
 assert(confirmation.includes('const parsed=candidateIndex==null?envelopes[0]:bseApprovalCandidateEnvelope_(aggregate,candidateIndex);'));
 assert(confirmation.includes("if(bseApprovalHash_(parsed)!==String(row[2]))throw new Error('Hash pengesahan bercanggah.')"));
 vm.runInContext(extract(approval,'bseApprovalCandidateEnvelope_'),ctx);
 vm.runInContext(extract(approval,'bseApprovalEnvelopes_'),ctx);
 const aggregate={...good,transplant_crop_conflict:{declared:' M5P34',canonical:'Timun'}};
 const card=ctx.bseApprovalEnvelopes_(aggregate);
 assert.strictEqual(card.length,1);
 assert.strictEqual(JSON.stringify(card[0]),JSON.stringify(ctx.bseApprovalCandidateEnvelope_(aggregate,0)));
 assert.notStrictEqual(JSON.stringify(card[0]),JSON.stringify(aggregate));
});
console.log('GATE_I_TRANSPLANT_CARD_ONLY '+passed+'/'+passed+' PASS');
