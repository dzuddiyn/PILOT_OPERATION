'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
let env='PILOT_OPERATION';
const audits=[];
const context={console,Date,Utilities:{formatDate:(date,tz,fmt)=>{
 assert.equal(tz,'Asia/Kuala_Lumpur');
 const local=new Date(new Date(date).getTime()+8*3600000).toISOString();
 return fmt==='yyyy-MM'?local.slice(0,7):local.slice(0,10);
}},bseRuntimeEnvironmentName_:()=>env,bseRuntimeBotUsername_:()=> 'opsmate_pilot_bot',bseRuntimeLegacyUserId_:()=> '100',bseRuntimeEvidenceIsConfirmed_:s=>s==='CONFIRMED'||s==='CONFIRMED_TEST',bseEnsureAdditiveHeaders_:()=>{},SpreadsheetApp:{flush:()=>{}}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'PilotClaimRetrieval.js'),'utf8'),context);
let count=0;function test(label,fn){fn();count++;console.log('PASS '+label);}
const now=new Date('2026-10-22T09:00:00Z'),parse=s=>context.bsePilotClaimPeriod_(s,now);
test('current month and date formats',()=>{
 assert.equal(parse('/claim').key,'2026-10');
 assert.equal(parse('/claim 10/2026').key,'2026-10');
 assert.equal(parse('/claim 10-2026').key,'2026-10');
 assert.equal(parse('/claim 2026-10').key,'2026-10');
});
test('Malay and English month aliases',()=>{
 const variants=[['Januari','January','Jan'],['Februari','February','Feb'],['Mac','March','Mar'],['April','Apr'],['Mei','May'],['Jun','June'],['Julai','July'],['Ogos','August','Aug'],['September','Sept','Sep'],['Oktober','October','Oct','Okt'],['November','Nov'],['Disember','December','Dec']];
 variants.forEach((x,i)=>x.forEach(alias=>assert.equal(parse('/claim '+alias+' 2026').month,i+1)));
});
test('malformed periods and other bot commands denied',()=>{
 for(const s of ['/claim 13/2026','/claim 2026-00','/claim Okt 2026 tambahan','/claim March-2026'])assert.equal(parse(s).ok,false);
 for(const s of ['/claims','hello /claim','/claim@another_bot'])assert.equal(parse(s).matched,false);
});
const ownerKeys=['owner_id','owner_name','telegram_user_id','private_chat_id','google_tasklist_id','is_active','is_admin','updated_at'];
const memberKeys=['telegram_user_id','private_chat_id','status','username','display_name'];
const evKeys=['evidence_id','source_chat_id','source_chat_type','source_message_id','reporter_telegram_user_id','reporter_name','received_at','caption','attachment_type','telegram_file_id','telegram_file_unique_id','mime_type','file_name','file_size','category','visibility','status','token','card_message_id','drive_file_id','confirmed_at','discarded_at','last_error'];
function sheet(keys,rows){const data=[keys,...rows];return {getLastColumn:()=>keys.length,getLastRow:()=>data.length,getRange:(r,c,h,w)=>({getValues:()=>data.slice(r-1,r-1+h).map(x=>x.slice(c-1,c-1+w))})};}
const row=(keys,obj)=>keys.map(k=>Object.hasOwn(obj,k)?obj[k]:'');
const owner=id=>row(ownerKeys,{owner_id:'bootstrap',telegram_user_id:id,private_chat_id:id,is_active:true,is_admin:false});
const member=id=>row(memberKeys,{telegram_user_id:id,private_chat_id:id,status:'REGISTERED_ACTIVE'});
const evidence=(id='200',caption='claim racun RM 159',extras={})=>row(evKeys,{evidence_id:'BSE-EV-528-AAA',reporter_telegram_user_id:id,received_at:'2026-10-22T00:04:00.000Z',caption,attachment_type:'PHOTO',mime_type:'image/jpeg',file_name:'photo_example.jpg',category:'INVENTORY_CLAIM',visibility:'RESTRICTED',status:'CONFIRMED',drive_file_id:'1EXAMPLE_CLAIM_FILE_1234567890',...extras});
function book({owners=[owner('100')],members=[member('200'),member('300')],evidences=[evidence('200'),evidence('300','claim lain RM 30',{file_name:'photo_other.jpg'})],includeEvidence=true}={}){
 const map={'TEST_OWNER_REGISTRY':sheet(ownerKeys,owners),'TEST_TELEGRAM_USER_REGISTRY':sheet(memberKeys,members),'TEST_TELEGRAM_CLAIM_RETRIEVAL_AUDIT':{appendRow:x=>audits.push(x)}};
 if(includeEvidence)map.TEST_FILE_EVIDENCE=sheet(evKeys,evidences);
 return {getSheetByName:name=>map[name]||null,insertSheet:()=>{throw Error('UNEXPECTED_SHEET_WRITE')}};
}
const m=(id='200',type='private',text='/claim')=>({text,chat:{type,id:type==='private'?id:'-100999'},from:{id,is_bot:false},message_id:55});
test('ordinary member sees original text, file name, link only',()=>{
 const x=context.bsePilotClaimRetrieve_(book(),m(),now);
 assert.equal(x.count,1);
 assert.match(x.text,/claim racun RM 159/);
 assert.match(x.text,/photo_example.jpg/);
 assert.match(x.text,/https:\/\/drive.google.com\/file\/d\/1EXAMPLE_CLAIM_FILE_1234567890\/view/);
 assert.doesNotMatch(x.text,/Kategori:|Status:|Jenis:|Drive file ID:|Jumlah |Penghantar:|Tarikh:/);
 assert.doesNotMatch(x.text,/claim lain|photo_other|ID 200|ID 300/);
});
test('owner sees confirmed inventory claims from multiple reporters without admin flag',()=>{
 const x=context.bsePilotClaimRetrieve_(book(),m('100'),now);
 assert.equal(x.count,2);assert.match(x.text,/claim racun/);assert.match(x.text,/claim lain/);
});
test('private registration and bootstrap authority fail closed',()=>{
 assert.match(context.bsePilotClaimRetrieve_(book(),m('400'),now).text,/pengguna aktif/);
 context.bseRuntimeLegacyUserId_=()=> '999';
 try{assert.match(context.bsePilotClaimRetrieve_(book(),m('100'),now).text,/pengguna aktif/);}
 finally{context.bseRuntimeLegacyUserId_=()=> '100';}
});
test('group claim produces no message',()=>{
 const x=context.bsePilotClaimRetrieve_(book(),m('100','supergroup'),now);
 assert.equal(x.text,'');assert.equal(x.handled,true);
});
test('unconfirmed and unrelated evidence are excluded',()=>{
 const x=context.bsePilotClaimRetrieve_(book({evidences:[evidence('200','pending',{status:'OPEN'}),evidence('200','rawatan',{category:'FIELD_OPERATION'}),evidence('200','October last year',{received_at:'2025-10-21T00:00:00.000Z'})]}),m(),now);
 assert.equal(x.count,0);assert.match(x.text,/Tiada rekod/);
});
test('MYT month rollover uses received_at, not claim event_date',()=>{
 const x=context.bsePilotClaimRetrieve_(book({evidences:[evidence('200','awal Oktober',{received_at:'2026-09-30T16:04:00.000Z'})]}),m(),now);
 assert.equal(x.count,1);assert.match(x.text,/awal Oktober/);
});
test('image absent outputs only original message',()=>{
 const x=context.bsePilotClaimRetrieve_(book({evidences:[evidence('200','claim memo',{attachment_type:'DOCUMENT',mime_type:'application/pdf',file_name:'invoice.pdf'})]}),m(),now);
 assert.equal(x.count,1);assert.match(x.text,/claim memo/);assert.doesNotMatch(x.text,/Pautan:|Fail:|invoice.pdf/);
});
test('missing evidence sheet does not read older generic claim ledger',()=>{
 const x=context.bsePilotClaimRetrieve_(book({includeEvidence:false}),m(),now);
 assert.match(x.text,/belum tersedia/);
});
test('invalid confirmed source, date and drive id fail closed',()=>{
 for(const changes of [{caption:''},{visibility:'GROUP_STANDARD'},{received_at:'not-a-date'},{drive_file_id:'javascript://bad'}, {reporter_telegram_user_id:'unknown'}]){
  const x=context.bsePilotClaimRetrieve_(book({evidences:[evidence('200','claim racun RM 159',changes)]}),m('100'),now);
  assert.match(x.text,/ditahan/);assert.doesNotMatch(x.text,/Pautan:/);
 }
});
test('audit contains metadata, never captions/Drive IDs',()=>{
 assert(audits.some(r=>r[5]==='RESULT_READY'));
 assert(audits.some(r=>r[6]==='NOT_PRIVATE'));
 assert(audits.some(r=>r[5]==='BLOCKED'));
 assert(audits.every(r=>r.length===9&&!r.some(v=>String(v).includes('claim racun')||String(v).includes('1EXAMPLE_CLAIM_FILE'))));
});
test('read-only evidence, menu scoped to pilot',()=>{
 const code=fs.readFileSync(path.join(__dirname,'PilotClaimRetrieval.js'),'utf8');
 assert.match(code,/TEST_FILE_EVIDENCE/);
 assert.doesNotMatch(code,/insertSheet\('TEST_FILE_EVIDENCE'\)|\.setValues\(|\.setValue\(|\.deleteRow\(/);
 const menu={bseRuntimeEnvironmentName_:()=>env};vm.createContext(menu);vm.runInContext(fs.readFileSync(path.join(__dirname,'TelegramCommandTest.js'),'utf8'),menu);
 assert(menu.bsePilotTelegramCommandMenu_().some(x=>x.command==='claim'));env='TEST';assert(!menu.bsePilotTelegramCommandMenu_().some(x=>x.command==='claim'));
});
console.log('GI_UX_08_CLAIM_EVIDENCE '+count+'/'+count+' PASS');
