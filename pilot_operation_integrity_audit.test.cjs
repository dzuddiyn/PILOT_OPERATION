'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(__dirname+'/PilotOperationReadOnlyAudit.js','utf8');
const state={env:'PILOT_OPERATION',binding:true,issues:[],missing:new Set(['PILOT_OPTIONAL_UNUSED']),
  malformed:new Set(),bodyRows:[],writes:0};
const required=['PILOT_OWNER_REGISTRY','PILOT_TELEGRAM_QUEUE','PILOT_TELEGRAM_APPROVAL_UI',
  'PILOT_TELEGRAM_APPROVAL_CALLBACK_PENDING','PILOT_CROP_BATCH','PILOT_PLANTING_EVENT',
  'PILOT_PLOT_ALLOCATION','PILOT_FILE_EVIDENCE','PILOT_TELEGRAM_RETRIEVAL_AUDIT'];
const ctx={
  console:{log:()=>{}},Set,Map,Date,JSON,Object,Array,Error,
  BSE_PILOT_DAILY_HEADERS:['digest_date'],BSE_PILOT_FRIDAY_HEADERS:['week_start'],
  BSE_PILOT_DIGEST_CONFIG_HEADERS:['time_myt'],
  BSE_PILOT_OPERATION_BINDING:{spreadsheetId:'PILOT_AUTHORIZED_ID'},
  bseRuntimeEnvironmentName_:()=>state.env,
  getBsePilotOperationRuntimeBindingStatus:()=>({
    environment:state.env,spreadsheet_bound:state.binding,evidence_folder_bound:true,
    production_write:false,official_bse_write:false}),
  SpreadsheetApp:{openById:id=>({getId:()=>id})},
  bseRuntimeAssertWorkbookId_:id=>{if(id!=='PILOT_AUTHORIZED_ID')throw Error('BAD_WORKBOOK')},
  bsePilotAuditRegistry_:()=>required.concat('PILOT_OPTIONAL_UNUSED').map(s=>
    ['TEST_'+s.replace(/^PILOT_/,''),['source_key','status']]),
  bseRuntimeSheetName_:name=>name.replace(/^TEST_/,'PILOT_'),
  bsePilotAuditSheetSnapshot_:(book,name,headers)=>{
    const sheet=name.replace(/^TEST_/,'PILOT_'),status=state.missing.has(sheet)?'MISSING':
      state.malformed.has(sheet)?'STALE':'CURRENT';
    return {sheet,status,delta:{missing:[],extra:[],order_mismatch:false}};
  },
  bsePilotAuditRows_:(book,name,headers)=>({sheet:name.replace(/^TEST_/,'PILOT_'),
    headers,rows:state.bodyRows}),
  bsePilotAuditSourceEntries_:snapshot=>snapshot.rows.map((r,i)=>({
    sheet:snapshot.sheet,row:i+2,key:r[0],status:r[1],hash:''})),
  bsePilotAuditDuplicateIssues_:(entries,allowed)=>state.issues.slice(),
  bsePilotAuditIndex_:headers=>Object.fromEntries(headers.map((x,i)=>[x,i])),
  bsePilotAuditCell_:(r,index,key)=>index[key]===undefined?'':String(r[index[key]]||'')
};
vm.createContext(ctx);vm.runInContext(src,ctx);
let count=0;function check(name,fn){fn();count++;console.log('PASS '+name)}
function reset(){state.env='PILOT_OPERATION';state.binding=true;state.issues=[];
 state.missing=new Set(['PILOT_OPTIONAL_UNUSED']);state.malformed=new Set();state.bodyRows=[];state.writes=0;}
check('independent audit has no writer APIs',()=>assert(!/\b(?:insertSheet|appendRow|setValues?|deleteSheet|clear|createFile|sendMessage|setProperty)\s*\(/.test(src)));
check('rejects wrong PILOT_TEST environment',()=>{reset();state.env='PILOT_TEST';assert.throws(
 ()=>ctx.runBsePilotOperationReadOnlyIntegrityAudit(),/PILOT_AUDIT_WRONG_ENVIRONMENT/);});
check('rejects unbound PILOT_OPERATION workbook',()=>{reset();state.binding=false;assert.throws(
 ()=>ctx.runBsePilotOperationReadOnlyIntegrityAudit(),/PILOT_AUDIT_RUNTIME_BOUNDARY_FAILED/);});
check('required schemas current and missing optional distinguished',()=>{reset();
 const x=ctx.runBsePilotOperationReadOnlyIntegrityAudit();
 assert.equal(x.status,'OPTIONAL_TABS_ABSENT');assert.equal(x.required_total,11);
 assert.equal(x.required_current,11);assert.equal(x.schema_counts.MISSING,1);});
check('required header drift flags ANOMALIES',()=>{reset();state.malformed.add('PILOT_OWNER_REGISTRY');
 const x=ctx.runBsePilotOperationReadOnlyIntegrityAudit();
 assert.equal(x.status,'ANOMALIES');assert.equal(x.required_current,10);});
check('unsafe source hash conflict is fatal',()=>{reset();state.issues=[
 {type:'CONFLICTING_HASH',sheet:'PILOT_CROP_BATCH',row:2}];
 const x=ctx.runBsePilotOperationReadOnlyIntegrityAudit();
 assert.equal(x.status,'FAIL_SAFETY');assert.equal(x.source_issue_count,1);});
check('unknown Telegram offset handled as source row, not modified',()=>{reset();
 state.bodyRows=[['BSE-TG-3','APPROVED']];const x=ctx.runBsePilotOperationReadOnlyIntegrityAudit();
 assert.equal(x.read_only,true);assert.equal(x.production_write,false);});
console.log('GATE_I_PILOT_READONLY_AUDIT '+count+'/'+count+' PASS');
