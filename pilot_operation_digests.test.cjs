'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(__dirname+'/PilotOperationDigests.js','utf8');
const context={
  console,Date,Set,Error,Object,Array,String,RegExp,
  Utilities:{formatDate:(x,tz,pat)=>{
    assert.strictEqual(tz,'Asia/Kuala_Lumpur');
    return new Date(x.getTime()+8*3600000).toISOString().slice(0,10);
  }},
  BSE_TG_HISTORY_MAX_DISPLAY:8,
  bseDailyDigestYesterdayMyt_:now=>new Date(new Date(now).getTime()+8*3600000-86400000).toISOString().slice(0,10),
  bseTelegramHistoryLastCompleteWeek_:()=>({start:'2026-10-09',end:'2026-10-15'}),
  bseTelegramHistoryEventsFor_:()=>[{date:'2026-10-15',reference:'BSE-TG-1'}],
  bseTelegramReportCanonicalEvents_:()=>[{date:'2026-10-15',reference:'BSE-TG-1'}],
  bseTelegramReportGeminiCommentary_:()=>({ok:false,reason:'GEMINI_UNAVAILABLE'}),
  bseTelegramHistorySafeLine_:e=>'Reference: '+e.reference,
  BSE_PILOT_OPERATION_BINDING:{spreadsheetId:'PILOT_BOOK_ID'},
  bseRuntimeEnvironmentName_:()=>context._env,
  getBsePilotOperationRuntimeBindingStatus:()=>({environment:context._env,spreadsheet_bound:true,
    evidence_folder_bound:true,production_write:false,official_bse_write:false}),
  bseRuntimeSpreadsheetId_:()=> 'PILOT_BOOK_ID',
  bseRuntimeAssertWorkbookId_:id=>{if(id!=='PILOT_BOOK_ID')throw Error('CROSS_ENV');},
  SpreadsheetApp:{openById:()=>({getId:()=> 'PILOT_BOOK_ID'})},
  bseRuntimeBook_:book=>book,
  bseTestOwnerRows_:()=>[['owner-1','Owner','123','123','','TRUE','FALSE','']],
  bseTestOwnerFromRow_:r=>({owner_id:r[0],telegram_user_id:r[2],private_chat_id:r[3],is_active:true,is_admin:false}),
  _env:'PILOT_OPERATION'
};
vm.createContext(context);vm.runInContext(source,context);
let n=0;function check(name,fn){fn();n++;console.log('PASS '+name);}
check('both public install/stop/inspect functions exist',()=>['installBsePilotOperationDailyDigest',
  'installBsePilotOperationFridayDigest','stopBsePilotOperationDailyDigest',
  'stopBsePilotOperationFridayDigest','inspectBsePilotOperationDigestSchedulers'].forEach(x=>assert.equal(typeof context[x],'function')));
check('daily next time before 08:01 MYT',()=>assert.equal(context.bsePilotDigestNext_('DAILY',
  new Date('2026-10-18T00:00:00Z')).toISOString(),'2026-10-18T00:01:00.000Z'));
check('daily next time after 08:01 MYT',()=>assert.equal(context.bsePilotDigestNext_('DAILY',
  new Date('2026-10-18T00:02:00Z')).toISOString(),'2026-10-19T00:01:00.000Z'));
check('Friday next from Sunday',()=>assert.equal(context.bsePilotDigestNext_('FRIDAY',
  new Date('2026-10-18T01:00:00Z')).toISOString(),'2026-10-22T23:59:00.000Z'));
check('Friday next after slot',()=>assert.equal(context.bsePilotDigestNext_('FRIDAY',
  new Date('2026-10-23T00:00:00Z')).toISOString(),'2026-10-29T23:59:00.000Z'));
check('wrong environment fails closed',()=>{context._env='PILOT_TEST';
  assert.throws(()=>context.bsePilotDigestAssertEnvironment_(),/WRONG_ENVIRONMENT/);context._env='PILOT_OPERATION';});
check('owner-only recipients',()=>{const a=context.bsePilotDigestOwnerRecipients_({});
  assert.equal(a.length,1);assert.equal(a[0].telegram_user_id,'123');});
check('no duplicate for same daily date/chat SENDING and SENT and unknown',()=>{
  for(const status of ['SENDING','SENT','OUTCOME_UNKNOWN'])
    assert(context.bsePilotDigestExisting_([['2026-10-17','owner','123','123',status]],
      'DAILY','2026-10-17','','123'));
  assert(!context.bsePilotDigestExisting_([['2026-10-17','owner','123','123','FAILED']],
    'DAILY','2026-10-17','','123'));
});
check('weekly exact window and recipient duplicate',()=>{
 assert(context.bsePilotDigestExisting_([['2026-10-09','2026-10-15','123','123','OWNER','SENT']],
  'FRIDAY','2026-10-09','2026-10-15','123'));
 assert(!context.bsePilotDigestExisting_([['2026-10-02','2026-10-08','123','123','OWNER','SENT']],
  'FRIDAY','2026-10-09','2026-10-15','123'));
});
check('render pilot terminology and noncanonical fallback',()=>{
 const x=context.bsePilotDigestRender_({},'FRIDAY',{telegram_user_id:'123'},
 {start:'2026-10-09',end:'2026-10-15'});
 assert(x.text.includes('Fakta canonical PILOT_OPERATION'));
 assert(x.text.includes('NON_CANONICAL'));
 assert(x.text.includes('Komen Gemini tidak tersedia'));
 assert(!x.text.includes('Laporan TEST'));
});
check('Gemini TEST-mode label is normalized for PILOT display',()=>{
 const prev=context.bseTelegramReportGeminiCommentary_;
 context.bseTelegramReportGeminiCommentary_=()=>({ok:true,text:'Berikut komen operasi bagi mod TEST: tiada rekod.'});
 const x=context.bsePilotDigestRender_({},'FRIDAY',{telegram_user_id:'123'},
  {start:'2026-10-09',end:'2026-10-15'});
 assert(x.text.includes('mod PILOT_OPERATION'));
 assert(!x.text.includes('mod TEST'));
 context.bseTelegramReportGeminiCommentary_=prev;
});check('no production/official writer',()=>assert(!/\b(?:bseProduction|officialBse|production_write\s*:\s*true)\b/i.test(source)));
check('distinct trigger handlers and props',()=>{
  const x=vm.runInContext("BSE_PILOT_DIGEST_CONFIG",context);
  assert(x.DAILY.handler!==x.FRIDAY.handler);assert(x.DAILY.property!==x.FRIDAY.property);
});
console.log('PILOT_DIGEST_TARGETED '+n+'/'+n+' PASS');
