'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/TelegramWorkerTest.js','utf8');
function extract(source,name){
 const start=source.indexOf('function '+name+'(');assert(start>=0,'function '+name+' missing');
 const brace=source.indexOf('{',start);let depth=0,quote='',esc=false;
 for(let i=brace;i<source.length;i++){
  const ch=source[i];if(quote){if(esc){esc=false;continue}if(ch==='\\'){esc=true;continue}if(ch===quote)quote='';continue}
  if(ch==="'"||ch==='"'||ch.charCodeAt(0)===96){quote=ch;continue}
  if(ch==='{')depth++;else if(ch==='}'&&--depth===0)return source.slice(start,i+1);
 }
 throw Error('UNCLOSED '+name);
}
let env='PILOT_OPERATION',passes=0;
const ctx={bseRuntimeEnvironmentName_:()=>env};
vm.createContext(ctx);vm.runInContext(extract(source,'bsePilotEcReviewCardOnly_'),ctx);
const candidate={target:'EC_Leachate_Log',validation:'PASS',missing:[],fields:{
 record_type:'EC_LEACHATE',event_date:'2026-10-15',session:'',
 readings:[
  {module_id:'M1',plot_id:'M1P1',ec_in_next:'',input_status:'NOT_MEASURED'},
  {module_id:'M1',plot_id:'M1P2',ec_in_next:'',input_status:'NOT_MEASURED'},
  {module_id:'M2',plot_id:'M2P3',ec_in_next:'',input_status:'NOT_MEASURED'},
  {module_id:'M2',plot_id:'M2P4',ec_in_next:'',input_status:'NOT_MEASURED'},
  {module_id:'M3',plot_id:'M3P3',ec_in_next:3,input_status:'IN_ONLY'},
  {module_id:'M3',plot_id:'M3P4',ec_in_next:3,input_status:'IN_ONLY'},
  {module_id:'M4',plot_id:'M4P1',ec_in_next:3.5,input_status:'IN_ONLY'},
  {module_id:'M4',plot_id:'M4P2',ec_in_next:3.5,input_status:'IN_ONLY'},
  {module_id:'M7',plot_id:'',ec_in_next:3,input_status:'MODULE_IN_ONLY'}
]}};
const good={validation:'PASS',production_write:false,candidates:[candidate]};
const chk=(label,f)=>{f();passes++;console.log('PASS '+label)};
chk('complete 9-scope PILOT EC report uses card-only',()=>assert.equal(ctx.bsePilotEcReviewCardOnly_(good,'NEEDS_HUMAN_REVIEW'),true));
chk('NEED_INFO EC still gets clarification',()=>{const c={...candidate,validation:'NEED_INFO',missing:['event_date']};assert.equal(ctx.bsePilotEcReviewCardOnly_({...good,validation:'NEED_INFO',candidates:[c]},'WAITING_INFO'),false)});
chk('unreviewable result never suppresses response',()=>{for(const state of ['WAITING_INFO','QUEUED','RETRY_NEEDED','RESULT_REPLY_PENDING'])assert.equal(ctx.bsePilotEcReviewCardOnly_(good,state),false)});
chk('TEST and PILOT_TEST remain unchanged',()=>{env='TEST';assert.equal(ctx.bsePilotEcReviewCardOnly_(good,'NEEDS_HUMAN_REVIEW'),false);env='PILOT_TEST';assert.equal(ctx.bsePilotEcReviewCardOnly_(good,'NEEDS_HUMAN_REVIEW'),false);env='PILOT_OPERATION'});
chk('not EC, mixed, or multiple candidates never suppressed',()=>{const other={...candidate,target:'Measurement_Log'};assert.equal(ctx.bsePilotEcReviewCardOnly_({...good,candidates:[other]},'NEEDS_HUMAN_REVIEW'),false);assert.equal(ctx.bsePilotEcReviewCardOnly_({...good,candidates:[candidate,other]},'NEEDS_HUMAN_REVIEW'),false);assert.equal(ctx.bsePilotEcReviewCardOnly_({...good,candidates:[]},'NEEDS_HUMAN_REVIEW'),false)});
chk('tampered or incomplete EC proposals do not suppress reply',()=>{
 const cases=[{...good,production_write:true},{...good,validation:'NEED_INFO'},
 {...good,candidates:[{...candidate,missing:['ec_in_missing']}]},
 {...good,candidates:[{...candidate,fields:{...candidate.fields,readings:[]}}]},
 {...good,candidates:[{...candidate,fields:{...candidate.fields,event_date:''}}]},
 {...good,candidates:[{...candidate,fields:{...candidate.fields,record_type:'MEASUREMENT'}}]}];
 for(const x of cases)assert.equal(ctx.bsePilotEcReviewCardOnly_(x,'NEEDS_HUMAN_REVIEW'),false);
});
chk('worker skips generic only and still invokes canonical approval card',()=>{
 const start=source.indexOf('function processBseTelegramTestQueue()');
 const flow=source.slice(start,source.indexOf('// Pure result path',start));
 const guard='!bsePilotEcReviewCardOnly_(result,reviewStatus)';
 const guardAt=flow.indexOf(guard);
 const interim=flow.indexOf("bseTelegramApi_('sendMessage',payload)",guardAt);
 const status=flow.indexOf("sheet.getRange(job.row,7).setValue(reviewStatus)",interim);
 const card=flow.indexOf('bseTelegramApprovalEnsureCard_(book,latest)',status);
 assert(guardAt>=0&&interim>guardAt&&status>interim&&card>status);
 assert(!/sendMessage|setValue|appendRow|deleteMessage/.test(extract(source,'bsePilotEcReviewCardOnly_')));
});
chk('existing EC record not replayed or altered by predicate',()=>{
 const fn=extract(source,'bsePilotEcReviewCardOnly_');
 assert(!fn.includes('772257370'));assert(!fn.includes('772257352'));
 assert(!/getUpdates|setWebhook|deleteWebhook|forceReply|remove_keyboard/.test(fn));
});
console.log('GATE_I_EC_CARD_ONLY '+passes+'/'+passes+' PASS');
