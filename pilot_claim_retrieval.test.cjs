'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
let env='PILOT_OPERATION';
const auditRows=[];
const context={console,Date,Utilities:{formatDate:(d,tz,fmt)=>{
  assert.equal(tz,'Asia/Kuala_Lumpur');const x=new Date(d);
  const v=new Date(x.getTime()+8*3600000).toISOString();
  return fmt==='yyyy-MM'?v.slice(0,7):v.slice(0,10);
}},bseRuntimeEnvironmentName_:()=>env,bseRuntimeBotUsername_:()=> 'opsmate_pilot_bot',bseRuntimeLegacyUserId_:()=> '100',bseEnsureAdditiveHeaders_:()=>{},SpreadsheetApp:{flush:()=>{}}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'PilotClaimRetrieval.js'),'utf8'),context);
let n=0;function test(name,fn){fn();n++;console.log('PASS '+name);}
const now=new Date('2026-10-22T09:00:00Z');
const parse=x=>context.bsePilotClaimPeriod_(x,now);
test('current MYT and permitted numeric month spellings',()=>{
 for(const s of ['/claim','/claim@opsmate_pilot_bot'])assert.equal(parse(s).key,'2026-10');
 for(const s of ['/claim 10/2026','/claim 10-2026','/claim 2026-10'])assert.equal(parse(s).key,'2026-10');
});
test('all Malay and English month aliases are exact and case-insensitive',()=>{
 const variants=[
 ['Januari','January','JAN'],['Februari','February','Feb'],['Mac','March','MAR'],['April','Apr'],
 ['Mei','May'],['Jun','June'],['Julai','July'],['Ogos','August','Aug'],
 ['September','Sept','Sep'],['Oktober','October','Oct','Okt'],['November','Nov'],['Disember','December','Dec','Dis']];
 variants.forEach((aliases,i)=>aliases.forEach(x=>{
  assert.equal(parse('/claim '+x.toUpperCase()+' 2026').month,i+1,x);
  assert.equal(parse('/claim '+x.toLowerCase()).year,2026,x);
 }));
});
test('invalid and ambiguous periods fail closed',()=>{
 for(const s of ['/claim 13/2026','/claim 2026-00','/claim Okt 2026 tambahan','/claim mar-2026','/claim Sept 2026 now','/claim September 1899','/claim 31/2026'])assert.equal(parse(s).ok,false,s);
 for(const s of ['/claims','/claiming','hello /claim','/claim@other_bot'])assert.equal(parse(s).matched,false,s);
});
const ownerHead=['owner_id','owner_name','telegram_user_id','private_chat_id','google_tasklist_id','is_active','is_admin','updated_at'];
const regHead=['telegram_user_id','private_chat_id','status','username','display_name','default_operational_group_chat_id','requested_at','decision_owner_id','decided_at','decision_reason'];
const claimHead=['source_key','claim_id','claimant','claimant_telegram_user_id','claimant_username','item_name','quantity','unit','amount_myr','reason','event_date','purchase_reference','evidence_reference','owner_id','owner_telegram_user_id','owner_name','status','production_write','original_note','created_at','approved_at','reviewer','payload_hash','responsible_name','responsible_source','responsible_telegram_user_id'];
function sheet(headers,records){
 const data=[headers,...records];return {getLastColumn:()=>headers.length,getLastRow:()=>data.length,
 getRange:(r,c,h,w)=>({getValues:()=>data.slice(r-1,r-1+h).map(x=>x.slice(c-1,c-1+w))})};
}
const row=(head,obj)=>head.map(key=>Object.prototype.hasOwnProperty.call(obj,key)?obj[key]:'');
const own=(id='100')=>row(ownerHead,{owner_id:'old-owner',telegram_user_id:id,private_chat_id:id,is_active:true,is_admin:false});
const user=(id)=>row(regHead,{telegram_user_id:id,private_chat_id:id,status:'REGISTERED_ACTIVE'});
const claim=(id,status,amount=25,day='2026-10-04')=>row(claimHead,{source_key:'BSE-TG-5|CLAIM_REQUEST',claim_id:'claim-5',claimant_telegram_user_id:id,item_name:'Petrol',amount_myr:amount,event_date:day,status:status,production_write:false});
function book({owners=[own()],users=[user('200'),user('300')],claims=[claim('200','APPROVED_TEST',25),claim('300','PENDING',30)]}={}){
 const tables={'TEST_OWNER_REGISTRY':sheet(ownerHead,owners),'TEST_TELEGRAM_USER_REGISTRY':sheet(regHead,users),'TEST_CLAIM_LOG':sheet(claimHead,claims),'TEST_TELEGRAM_CLAIM_RETRIEVAL_AUDIT':{appendRow:x=>auditRows.push(x)}};
 return {getSheetByName:(name)=>tables[name]||null,insertSheet:(name)=>{throw Error('UNEXPECTED_AUDIT_CREATE_'+name)}};
}
const message=(id='200',type='private',command='/claim Oct 2026')=>({text:command,chat:{type,id:type==='private'?id:'-100567'},from:{id,is_bot:false}});
test('ordinary active user sees own claim and not foreign claimant',()=>{
 const r=context.bsePilotClaimRetrieve_(book(),message(),now);
 assert(r.handled&&r.count===1&&r.total_myr===25);
 assert.match(r.text,/RM25.00/);assert.doesNotMatch(r.text,/RM30.00|300/);
 assert.match(r.text,/Direkodkan PILOT/);assert.match(r.text,/Jumlah dibayar: tidak dapat disahkan/);
});
test('current old owner can see all and no admin flag shortcut',()=>{
 const r=context.bsePilotClaimRetrieve_(book(),message('100'),now);
 assert.equal(r.count,2);assert.equal(r.total_myr,55);
 assert.match(r.text,/ID 200/);assert.match(r.text,/ID 300/);
});
test('new nominated staff has no elevated access and nonregistered actor denied',()=>{
 const b=book();
 assert.equal(context.bsePilotClaimRetrieve_(b,message('300'),now).count,1);
 assert.match(context.bsePilotClaimRetrieve_(b,message('400'),now).text,/pengguna aktif/);
});
test('group claims are silent even when actor is owner',()=>{
 const r=context.bsePilotClaimRetrieve_(book(),message('100','supergroup'),now);
 assert.equal(r.handled,true);assert.equal(r.text,'');
 const src=fs.readFileSync(path.join(__dirname,'TelegramQueueTest.js'),'utf8');
 assert.match(src,/bsePilotClaimRetrieve_\(book,m\)/);
 assert.match(src,/m\.chat\.type==='private'&&claim&&claim\.handled&&claim\.text/);
});
test('malformed input returns help to private active user, without data',()=>{
 const r=context.bsePilotClaimRetrieve_(book(),message('200','private','/claim Oktober now'),now);
 assert.match(r.text,/Gunakan \/claim/);assert.doesNotMatch(r.text,/RM25/);
});
test('unmatched month, invalid amounts and wrong production flag fail closed',()=>{
 const b=book({claims:[claim('200','APPROVED_TEST',25,'2026-09-12')]});
 assert.match(context.bsePilotClaimRetrieve_(b,message(),now).text,/Tiada rekod/);
 for(const val of ['abc',-10,0,'',' ','1,2,3','1,00','1,234.567','1e4'])assert.match(context.bsePilotClaimRetrieve_(book({claims:[claim('200','APPROVED_TEST',val)]}),message(),now).text,/ditahan/);
 const valid=context.bsePilotClaimRetrieve_(book({claims:[claim('200','APPROVED_TEST','1,234.50')]}),message(),now);
 assert.equal(valid.total_myr,1234.5); assert.match(valid.text,/RM1234\.50/);
 assert.match(context.bsePilotClaimRetrieve_(book({claims:[row(claimHead,{...Object.fromEntries(claimHead.map((h,i)=>[h,claim('200','APPROVED_TEST')[i]])),production_write:true})]}),message(),now).text,/ditahan/);
});
test('duplicate owner authority cannot expose other claims',()=>{
 const b=book({owners:[own('100'),own('500')],users:[user('100'),user('200')],claims:[claim('100','APPROVED_TEST'),claim('200','PENDING',90)]});
 const r=context.bsePilotClaimRetrieve_(b,message('100'),now);assert.match(r.text,/pengguna aktif/);assert.doesNotMatch(r.text,/RM90/);
});
test('bootstrap authority must match live runtime, owner registry alone is insufficient',()=>{
 context.bseRuntimeLegacyUserId_=()=> '999';
 try{
  const r=context.bsePilotClaimRetrieve_(book(),message('100'),now);
  assert.match(r.text,/pengguna aktif/);
  assert.doesNotMatch(r.text,/RM25|RM30/);
 }finally{context.bseRuntimeLegacyUserId_=()=> '100';}
});
test('claim audit records allowed, denied, invalid period and silent group without amounts',()=>{
 assert(auditRows.some(row=>row[5]==='RESULT_READY'&&row[7]==='OWN'));
 assert(auditRows.some(row=>row[5]==='DENIED'&&row[6]==='NOT_PRIVATE'));
 assert(auditRows.some(row=>row[5]==='DENIED'&&row[6]==='INVALID_PERIOD'));
 assert(auditRows.some(row=>row[5]==='BLOCKED'));
 assert(auditRows.every(row=>row.length===9&&!row.some(v=>String(v).includes('RM25.00'))));
});
test('claim ledger remains read-only and menu is scoped',()=>{
 const s=fs.readFileSync(path.join(__dirname,'PilotClaimRetrieval.js'),'utf8');
 assert.match(s,/TEST_TELEGRAM_CLAIM_RETRIEVAL_AUDIT/);
 assert.doesNotMatch(s,/insertSheet\('TEST_CLAIM_LOG'\)|\.setValues\(|\.setValue\(|\.deleteRow\(/);
 assert.doesNotMatch(context.bsePilotClaimRetrieve_.toString(),/\.appendRow\(/);
 const menuCtx={bseRuntimeEnvironmentName_:()=>env};
 vm.createContext(menuCtx);vm.runInContext(fs.readFileSync(path.join(__dirname,'TelegramCommandTest.js'),'utf8'),menuCtx);
 assert(menuCtx.bsePilotTelegramCommandMenu_().some(x=>x.command==='claim'));env='TEST';assert(!menuCtx.bsePilotTelegramCommandMenu_().some(x=>x.command==='claim'));
});
console.log('GI_UX_07_CLAIM '+n+'/'+n+' PASS');
