'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=file=>fs.readFileSync(path.join(__dirname,file),'utf8');
const worker=source('TelegramWorkerTest.js'),ui=source('TelegramApprovalUiTest.js');
function functionSource(text,name){
 const start=text.lastIndexOf('function '+name+'(');
 assert(start>=0,'Missing '+name);
 const next=text.indexOf('\n}',start);
 assert(next>=0,'No function closing brace: '+name);
 return text.slice(start,next+2);
}
let env='PILOT_OPERATION',sent=[];
const context={
 console,JSON,Date,
 bseRuntimeEnvironmentName_:()=>env,
 bseApprovalSummary_:(ref)=>'Semakan TEST '+ref+'\nBanci Pokok | Timun M5P2\nTiada rekod production akan ditulis.',
 bseApprovalDomain_:()=>({target:'Plant_Census_Log',core:()=>{}}),
 bseApprovalEnvelopes_:result=>[result], bseApprovalRecomputeQueueStatus_:()=>{},
 bseApprovalHash_:()=> 'HASH',
 bseTelegramTestApprovalGroupIds_:()=>[],
 bseTestOwnerForTelegramUser_:()=>({ok:true,owner_id:'owner',telegram_user_id:'200',private_chat_id:'200'}),
 bseTelegramApprovalSheet_:()=>sheet,
 bseApprovalRows_:()=>[],
 bseApprovalToken_:()=> 'ABCDEFGH',
 bseTelegramApi_:(_method,payload)=>{sent.push(payload);return {message_id:99};},
 bseApprovalMarkupForResult_:()=>({inline_keyboard:[[{text:'Benar',callback_data:'x'},{text:'Batal',callback_data:'y'}]]}),
 SpreadsheetApp:{flush(){}}
};
const sheet={appendRow(){},getLastRow(){return 2;},getRange:()=>({setValue(){}})};
vm.createContext(context);
for(const [text,name] of [[worker,'bsePilotUnifiedReviewCardOnly_'],[ui,'bsePilotUnifiedApprovalCardText_'],[ui,'bseTelegramApprovalEnsureCard_']])
 vm.runInContext(functionSource(text,name),context);
let tests=0;
function test(label,fn){fn();tests++;console.log('PASS '+label);}
const complete={validation:'PASS',production_write:false,candidates:[{target:'Plant_Census_Log',validation:'PASS',missing:[],fields:{crop:'Timun',plot_id:'M5P2'}}]};
const queue=()=>{const row=Array(23).fill('');row[0]='772257555';row[1]='200';row[2]='200';row[3]='333';row[9]=JSON.stringify(complete);return row;};
test('complete eligible census uses one existing approval card',()=>{
 assert.equal(context.bsePilotUnifiedReviewCardOnly_(complete,'NEEDS_HUMAN_REVIEW'),true);
 assert.match(worker,/!bsePilotUnifiedReviewCardOnly_\(result,reviewStatus\)/);
});
test('incomplete, missing fields and unknown targets retain prior question flow',()=>{
 for(const [r,s] of [[{...complete,validation:'NEED_INFO'},'WAITING_INFO'],[{...complete,candidates:[{...complete.candidates[0],missing:['crop']}]},'NEEDS_HUMAN_REVIEW'],[{...complete,candidates:[{...complete.candidates[0],target:'Unknown_Log'}]},'NEEDS_HUMAN_REVIEW']])
  assert.equal(context.bsePilotUnifiedReviewCardOnly_(r,s),false);
});
test('cross-environment, production flag, unsupported multiple candidates fail closed',()=>{
 env='TEST';assert.equal(context.bsePilotUnifiedReviewCardOnly_(complete,'NEEDS_HUMAN_REVIEW'),false);
 env='PILOT_TEST';assert.equal(context.bsePilotUnifiedReviewCardOnly_(complete,'NEEDS_HUMAN_REVIEW'),false);
 env='PILOT_OPERATION';
 assert.equal(context.bsePilotUnifiedReviewCardOnly_({...complete,production_write:true},'NEEDS_HUMAN_REVIEW'),false);
 assert.equal(context.bsePilotUnifiedReviewCardOnly_({...complete,candidates:[...complete.candidates,...complete.candidates]},'NEEDS_HUMAN_REVIEW'),false);
});
test('PILOT summary has clear heading and source while TEST wording untouched',()=>{
 const result=context.bsePilotUnifiedApprovalCardText_('BSE-TG-772257555',complete);
 assert.match(result,/^Semakan Laporan BSE-TG-772257555/);
 assert.match(result,/Banci Pokok \| Timun M5P2/);
 assert.match(result,/Sila semak maklumat sebelum pilih Benar atau Batal/);
 env='TEST';
 assert.match(context.bsePilotUnifiedApprovalCardText_('BSE-TG-772257555',complete),/^Semakan TEST BSE-TG/);
 env='PILOT_OPERATION';
});
test('actual PILOT card sends plain bot message, not Telegram reply, retains Benar Batal',()=>{
 sent=[];const result=context.bseTelegramApprovalEnsureCard_({},queue());
 assert.equal(result.created,true);assert.equal(sent.length,1);
 assert.equal(sent[0].reply_parameters,undefined);
 assert.match(sent[0].text,/^Semakan Laporan BSE-TG-772257555/);
 assert.equal(sent[0].reply_markup.inline_keyboard[0].length,2);
});
test('actual TEST card preserves original reply parameters',()=>{
 env='TEST';sent=[];const result=context.bseTelegramApprovalEnsureCard_({},queue());
 assert.equal(result.created,true);assert.equal(sent.length,1);
 assert.equal(sent[0].reply_parameters.message_id,333);
 env='PILOT_OPERATION';
});
test('legacy incomplete reply workflow not modified by this feature',()=>{
 assert.match(worker,/payload\.reply_markup=\{force_reply:true/);
 assert.match(worker,/const question=bseTelegramQuestion_\(result\)/);
 assert.match(worker,/if\(question\)sheet\.getRange\(job\.row,16\)/);
});
test('no new draft, role or domain writer',()=>{
 const local=worker.match(/function bsePilotUnifiedReviewCardOnly_[\s\S]*?\n}/)[0]+ui.match(/function bsePilotUnifiedApprovalCardText_[\s\S]*?\n}/)[0];
 assert.doesNotMatch(local,/DRAFT_NONCANONICAL|GRANT_ADMIN|appendRow|setValue\(|bse[A-Za-z]+ReviewCore_\(/);
});
console.log('GI_UX_01_UNIFIED_NO_REPLY '+tests+'/'+tests+' PASS');
