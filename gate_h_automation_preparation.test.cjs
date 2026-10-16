const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const root=__dirname+require('node:path').sep;
let pass=0;
const test=(label,fn)=>{try{fn();pass++;}catch(e){throw Error(label+': '+e.message);}};
const state={props:{BSE_TELEGRAM_AUTOMATION:'OFF',BSE_TELEGRAM_OFFSET:'772257149'},env:'PILOT_OPERATION',bound:true,triggers:[],updates:[],webhook:'',f:true,g:true,callbackPending:false,openCard:false,bookId:'pilot-sheet',calls:[]};
function reset(){state.props={BSE_TELEGRAM_AUTOMATION:'OFF',BSE_TELEGRAM_OFFSET:'772257149'};state.env='PILOT_OPERATION';state.bound=true;state.triggers=[];state.updates=[];state.webhook='';state.f=true;state.g=true;state.callbackPending=false;state.openCard=false;state.calls=[];state.domainBad=false;state.hashBad=false;state.queueBad=false;}
const makeArray=(length,fields)=>{const a=Array(length).fill('');for(const [k,v] of Object.entries(fields))a[Number(k)]=v;return a;};
const ctx=vm.createContext({
 console:{log:()=>{}},
 PropertiesService:{getScriptProperties:()=>({getProperty:(k)=>state.props[k]||null,setProperty:(k,v)=>{state.props[k]=v;},deleteProperty:(k)=>{delete state.props[k];}})},
 getBsePilotOperationRuntimeBindingStatus:()=>({environment:state.env,spreadsheet_bound:state.bound,evidence_folder_bound:state.bound,production_write:false,official_bse_write:false,automation:state.props.BSE_TELEGRAM_AUTOMATION}),
 bseRuntimeLegacyUserId_:()=> '913757987',
 bseTestOwnerForTelegramUser_:()=>({ok:true,private_chat_id:'913757987'}),
 bseRuntimeBook_:x=>x,SpreadsheetApp:{openById:()=>({})},
 BSE_PILOT_OPERATION_BINDING:{spreadsheetId:'pilot-sheet'},
 BSE_TG_QUEUE_HEADERS:Array(18),BSE_APPROVAL_UI_HEADERS:Array(26),
 BSE_APPROVAL_CALLBACK_HEADERS:Array(11),BSE_TG_RECORD_RETRIEVAL_AUDIT_HEADERS:Array(6),
 BSE_TG_EVIDENCE_HEADERS:Array(23),BSE_TG_RETRIEVAL_AUDIT_HEADERS:Array(6),
 BSE_TG_EVIDENCE_CALLBACK_HEADERS:Array(9),
 BSE_CROP_BATCH_HEADERS:Array(13),BSE_PLANTING_EVENT_HEADERS:Array(14),BSE_PLOT_ALLOCATION_HEADERS:Array(12),
 bseApprovalHash_:()=> 'hash',
 bseTelegramRecordReadRows_:(book,name)=>{
   if(name==='TEST_TELEGRAM_APPROVAL_UI')return [makeArray(26,{0:'BSE-TG-772257142',2:state.hashBad?'bad':'hash',17:state.openCard?'OPEN':'REPORTER_CONFIRMED'})];
   if(name==='TELEGRAM_TEST_QUEUE')return [makeArray(18,{0:'772257142',6:state.queueBad?'RETRY_NEEDED':'REPORTER_CONFIRMED',9:JSON.stringify({validation:'PASS',production_write:false,candidates:[]})})];
   if(name==='TEST_TELEGRAM_APPROVAL_CALLBACK_PENDING')return [makeArray(11,{5:state.callbackPending?'PENDING':'PROCESSED'})];
   if(name==='TEST_TELEGRAM_RECORD_RETRIEVAL_AUDIT')return state.f?[makeArray(6,{1:'913757987',3:'BSE-TG-772257142',4:'SENT'})]:[];
   if(name==='TEST_CROP_BATCH')return [makeArray(13,{2:state.domainBad?'wrong':'BSE-SB-CB-20261002-001'})];
   if(name==='TEST_PLANTING_EVENT')return [makeArray(14,{2:'BSE-SB-CB-20261002-001'})];
   if(name==='TEST_PLOT_ALLOCATION')return [makeArray(12,{2:'BSE-SB-CB-20261002-001',5:'M5P1'}),makeArray(12,{2:'BSE-SB-CB-20261002-001',5:'M5P2'})];
   if(name==='TEST_FILE_EVIDENCE')return state.g?[makeArray(23,{0:'BSE-EV-AB123456',16:'CONFIRMED_TEST',19:'drive-test-only'})]:[];
   if(name==='TEST_TELEGRAM_RETRIEVAL_AUDIT')return state.g?[makeArray(6,{1:'913757987',3:'BSE-EV-AB123456',4:'SENT'})]:[];
   if(name==='TEST_FILE_EVIDENCE_CALLBACK_PENDING')return [makeArray(9,{3:'PROCESSED'})];
   throw Error('UNKNOWN_SHEET_'+name);
 },
 bseTelegramApi_:(method)=>method==='getMe'?{username:'pilotbot'}:method==='getWebhookInfo'?{url:state.webhook}:method==='getUpdates'?state.updates:[],
 bseRuntimeBotUsername_:()=> 'pilotbot',
 ScriptApp:{
   getProjectTriggers:()=>state.triggers.slice(),
   newTrigger:handler=>({timeBased:()=>({everyMinutes:minutes=>({create:()=>{const t={getHandlerFunction:()=>handler,getUniqueId:()=>String(state.triggers.length+1)};state.triggers.push(t);return t;}})})}),
   deleteTrigger:t=>{state.triggers=state.triggers.filter(v=>v!==t);}
 },
 LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},
 bseRuntimeEnvironmentName_:()=>state.env,
 bseTelegramAutomationBook_:()=>state.calls.push('book'),
 receiveBseTelegramTest:()=>state.calls.push('receive'),
 processBseTelegramApprovalCallbacks:()=>state.calls.push('approval'),
 processBseTelegramTestQueue:()=>state.calls.push('worker')
});
vm.runInContext(fs.readFileSync(root+'PilotOperationGateH.js','utf8'),ctx);
vm.runInContext(fs.readFileSync(root+'TelegramAutomationTest.js','utf8'),ctx);
ctx.bseTelegramAutomationBook_=()=>state.calls.push('book');
test('ready valid F/G',()=>{reset();assert.equal(ctx.bsePilotGateHReadiness_().ready,true);});
test('preflight no mutation',()=>{reset();ctx.inspectBsePilotOperationGateH();assert.equal(state.triggers.length,0);assert.equal(state.props.BSE_TELEGRAM_AUTOMATION,'OFF');});
test('invalid F hash blocks',()=>{reset();state.hashBad=true;assert.throws(()=>ctx.bsePilotGateHReadiness_(),/F_APPROVAL_HASH_INVALID/);});
test('invalid domain batch blocks',()=>{reset();state.domainBad=true;assert.throws(()=>ctx.bsePilotGateHReadiness_(),/F_DOMAIN_READBACK_INVALID/);});
test('missing F blocks',()=>{reset();state.f=false;assert.throws(()=>ctx.bsePilotGateHReadiness_(),/F_RETRIEVAL_PROOF_MISSING/);});
test('missing G blocks',()=>{reset();state.g=false;assert.throws(()=>ctx.bsePilotGateHReadiness_(),/G_EVIDENCE_RETRIEVAL_PROOF_MISSING/);});
test('pending callback blocks',()=>{reset();state.callbackPending=true;assert.throws(()=>ctx.bsePilotGateHReadiness_(),/F_CALLBACK_NOT_SETTLED/);});
test('unsettled queue blocks',()=>{reset();state.queueBad=true;assert.throws(()=>ctx.bsePilotGateHReadiness_(),/F_CALLBACK_NOT_SETTLED/);});
test('open card blocks',()=>{reset();state.openCard=true;assert.throws(()=>ctx.bsePilotGateHReadiness_(),/F_CALLBACK_NOT_SETTLED/);});
test('pending backlog blocks',()=>{reset();state.updates=[{update_id:772257150}];assert.throws(()=>ctx.bsePilotGateHReadiness_(),/UNRECONCILED_TELEGRAM_BACKLOG/);});
test('webhook blocks',()=>{reset();state.webhook='https://example.invalid';assert.throws(()=>ctx.bsePilotGateHReadiness_(),/BOT_BOUNDARY/);});
test('stale tick blocks',()=>{reset();state.triggers=[{getHandlerFunction:()=> 'bseTelegramTick',getUniqueId:()=> 'old'}];assert.throws(()=>ctx.bsePilotGateHReadiness_(),/STALE_TRIGGER_RECONCILE/);});
test('wrong environment blocks',()=>{reset();state.env='PILOT_TEST';assert.throws(()=>ctx.bsePilotGateHReadiness_(),/RUNTIME_NOT_OFF_AND_BOUND/);});
test('wrong binding blocks',()=>{reset();state.bound=false;assert.throws(()=>ctx.bsePilotGateHReadiness_(),/RUNTIME_NOT_OFF_AND_BOUND/);});
test('installer successful',()=>{reset();const res=ctx.installBsePilotOperationGateH();assert.equal(res.status,'AUTOMATION_ON');assert.equal(state.triggers.length,1);assert.equal(state.props.BSE_TELEGRAM_AUTOMATION,'ON');});
test('unrelated scheduler protected',()=>{reset();state.triggers=[{getHandlerFunction:()=> 'dailyDigest',getUniqueId:()=> 'unrelated'}];ctx.installBsePilotOperationGateH();assert.equal(state.triggers.length,2);});
test('repeat installer doesnt delete existing trigger',()=>{reset();ctx.installBsePilotOperationGateH();assert.throws(()=>ctx.installBsePilotOperationGateH(),/RUNTIME_NOT_OFF_AND_BOUND/);assert.equal(state.triggers.length,1);assert.equal(state.props.BSE_TELEGRAM_AUTOMATION,'ON');});
test('preflight denied doesnt mutate triggers',()=>{reset();state.f=false;state.triggers=[{getHandlerFunction:()=> 'dailyDigest',getUniqueId:()=> 'other'}];assert.throws(()=>ctx.installBsePilotOperationGateH(),/F_RETRIEVAL_PROOF_MISSING/);assert.equal(state.triggers.length,1);assert.equal(state.props.BSE_TELEGRAM_AUTOMATION,'OFF');});
test('stop clears only own triggers',()=>{reset();const dig={getHandlerFunction:()=> 'dailyDigest',getUniqueId:()=> 'unrelated'};state.triggers=[dig];ctx.installBsePilotOperationGateH();const res=ctx.stopBsePilotOperationGateH();assert.equal(res.status,'OFF');assert.deepEqual(state.triggers,[dig]);assert.equal(state.props.BSE_PILOT_GATE_H_TRIGGER_ID,undefined);});
test('stop wrong env fails',()=>{reset();state.env='PILOT_TEST';assert.throws(()=>ctx.stopBsePilotOperationGateH(),/WRONG_ENVIRONMENT/);});
test('pilot tick OFF inert',()=>{reset();ctx.bseTelegramTick();assert.deepEqual(state.calls,[]);});
test('pilot tick ON pipelines',()=>{reset();ctx.installBsePilotOperationGateH();ctx.bseTelegramTick();assert.deepEqual(state.calls,['book','receive','approval','worker']);});
test('property ON alone cannot bypass installer',()=>{reset();state.props.BSE_TELEGRAM_AUTOMATION='ON';assert.throws(()=>ctx.bseTelegramTick(),/TRIGGER_AUTHORITY_MISSING/);assert.deepEqual(state.calls,[]);});
test('forged trigger marker fails closed',()=>{reset();ctx.installBsePilotOperationGateH();state.props.BSE_PILOT_GATE_H_TRIGGER_ID='forged';assert.throws(()=>ctx.bseTelegramTick(),/TRIGGER_AUTHORITY_MISSING/);assert.deepEqual(state.calls,[]);});
test('stale marker blocks readiness',()=>{reset();state.props.BSE_PILOT_GATE_H_TRIGGER_ID='stale';assert.throws(()=>ctx.bsePilotGateHReadiness_(),/STALE_AUTHORITY_MARKER/);});
test('pilot tick bad binding fail closed',()=>{reset();state.bound=false;state.props.BSE_TELEGRAM_AUTOMATION='ON';assert.throws(()=>ctx.bseTelegramTick(),/RUNTIME_BOUNDARY_FAILED/);assert.deepEqual(state.calls,[]);});
test('TEST tick original pipeline',()=>{reset();state.env='TEST';state.props.BSE_TELEGRAM_AUTOMATION='ON';ctx.bseTelegramTick();assert.deepEqual(state.calls,['book','receive','worker']);});
test('PILOT_TEST tick inert',()=>{reset();state.env='PILOT_TEST';state.props.BSE_TELEGRAM_AUTOMATION='ON';ctx.bseTelegramTick();assert.deepEqual(state.calls,[]);});
console.log('GATE_H_AUTOMATION_PREPARATION '+pass+'/28 PASS');
