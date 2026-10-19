'use strict';const fs=require('fs'),vm=require('vm'),assert=require('assert');
const row=Array(23).fill('');row[0]='BSE-EV-126-AQADNxNr';row[4]='913757987';row[8]='PHOTO';row[9]='EXISTING_TELEGRAM_FILE_ID';row[15]='PRIVATE_SUBMISSION';row[16]='CONFIRMED';row[19]='1sxjzn4_CU8G93VAZ942RQvwl6a7QIsPV';
const audits=[],sends=[];let user='913757987',access='OWNER_ACTIVE';const sheet={appendRow:r=>audits.push(r),getLastRow:()=>audits.length+1};
const ctx={console,Date,SpreadsheetApp:{flush:()=>{}},bseRuntimeSheetName_:name=>name.replace(/^TEST_/,'PILOT_'),bseEnsureAdditiveHeaders_:()=>{},bseTelegramRegistrationPrivateAccess_:()=>({status:access}),bseTelegramEvidenceRows_:()=>[row],bseTelegramEvidenceSheet_:()=>({}),bseRuntimeEvidenceIsConfirmed_:s=>s==='CONFIRMED'||s==='CONFIRMED_TEST',bseTestOwnerForTelegramUser_:(_,id)=>({ok:id==='913757987'}),bseTelegramApi_:(method,payload)=>sends.push({method,payload})};vm.createContext(ctx);
ctx.bseRoleTrustedAdaptersForBook_=()=>({sourceAuthenticated:true,readBootstrapOwner:()=>({user_id:'913757987',verified:true}),readRegistration:()=> 'INACTIVE',readLedger:()=>[],readBarriers:()=>[],sha256:()=>''});
for(const f of ['PilotRoleContract.js','PilotRoleResolver.js','PilotRoleLegacyCallsiteAdapter.js','PilotRoleLegacyControllerBridge.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
vm.runInContext(fs.readFileSync(__dirname+'/TelegramRetrievalTest.js','utf8'),ctx);
const book={getSheetByName:name=>{assert.equal(name,'PILOT_TELEGRAM_RETRIEVAL_AUDIT');return sheet},insertSheet:()=>{throw Error('NO_SHEET_CREATION')}};
let n=0;function check(label,fn){fn();n++;console.log('PASS '+label)}
const msg=()=>({text:'/retrieve BSE-EV-126-AQADNxNr',from:{id:user},chat:{id:user,type:'private'}});
check('owner can retrieve existing confirmed photo (transport stub only)',()=>{const r=ctx.bseTelegramEvidenceRetrieve_(book,msg());assert(r.handled);assert.equal(sends.length,1);assert.equal(sends[0].method,'sendPhoto');assert.equal(audits[0][4],'SENT')});
check('unregistered user denied before record exposure',()=>{user='UNREGISTERED';access='UNREGISTERED';const r=ctx.bseTelegramEvidenceRetrieve_(book,msg());assert.equal(sends.length,1);assert.equal(audits.at(-1)[4],'DENIED');assert(r.text)});
check('registered non-reporter denied private evidence',()=>{user='OTHER';access='REGISTERED_ACTIVE';const r=ctx.bseTelegramEvidenceRetrieve_(book,msg());assert.equal(sends.length,1);assert.equal(audits.at(-1)[5],'VISIBILITY_DENIED');assert(r.text)});
check('wrong command cannot send or audit',()=>{const before=audits.length;const r=ctx.bseTelegramEvidenceRetrieve_(book,{...msg(),text:'/retrieve BSE-EV-126-AQADNxNr extra'});assert.equal(r.handled,false);assert.equal(audits.length,before)});
check('unconfirmed rows denied',()=>{row[16]='OPEN';user='913757987';access='OWNER_ACTIVE';ctx.bseTelegramEvidenceRetrieve_(book,msg());assert.equal(audits.at(-1)[5],'NOT_CONFIRMED');assert.equal(sends.length,1)});
console.log('PILOT_RETRIEVAL_READONLY '+n+'/'+n+' PASS; NO LIVE TELEGRAM SEND');
