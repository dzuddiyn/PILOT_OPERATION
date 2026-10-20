'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'TelegramEvidenceTest.js'),'utf8');
let env='PILOT_OPERATION',out=[];
const context={
 bseRuntimeEnvironmentName_:()=>env,
 bseTelegramReporterReceipt_:(_book,_user,text)=>{out.push({kind:'receipt',text});},
 bseTelegramOwnerNotice_:(_book,text)=>{out.push({kind:'owner',text});},
 bseTelegramTestApprovalGroupIds_:()=>['-10000001'],
 bseTelegramApi_:(_method,request)=>{out.push({kind:'group',text:request.text});},
 console
};
vm.createContext(context);
vm.runInContext(source,context);
const row=Array(23).fill('');
row[0]='BSE-EV-SYN-001';row[4]='123';row[5]='Fixture Sender';row[7]='';row[8]='PHOTO';row[14]='UNCLASSIFIED_TEST';
for(const targetEnv of ['PILOT_OPERATION','TEST','PILOT_TEST']){
  env=targetEnv;out=[];
  context.bseTelegramEvidenceConfirmedNotices_(null,row,'SYNTHETIC_FILE_ID');
  assert.equal(out.length,3);
  const receipt=out.find(x=>x.kind==='receipt').text;
  const owner=out.find(x=>x.kind==='owner').text;
  const group=out.find(x=>x.kind==='group').text;
  if(env==='PILOT_OPERATION'){
    assert.match(receipt,/Resit Evidence BSE-EV-SYN-001/);
    assert.match(owner,/Status: DISAHKAN/);
    assert.match(owner,/Kategori: Belum dikelaskan/);
    assert.match(group,/^Makluman: /);
    for(const msg of out)assert.doesNotMatch(msg.text,/\bTEST\b|CONFIRMED_TEST|UNCLASSIFIED_TEST/);
  } else {
    assert.match(receipt,/Resit Evidence TEST/);
    assert.match(owner,/Status: CONFIRMED_TEST/);
    assert.match(owner,/Kategori: UNCLASSIFIED_TEST/);
    assert.match(group,/Makluman TEST:/);
  }
  console.log('PASS '+env+' notices=3');
}
env='PILOT_OPERATION';
assert.equal(context.bseTelegramEvidenceUxLabel_('Semakan Evidence TEST ','Semakan Evidence '),'Semakan Evidence ');
assert.equal(context.bseTelegramEvidenceUxLabel_('CONFIRMED_TEST','DISAHKAN'),'DISAHKAN');
assert.equal(context.bseTelegramEvidenceUxCategory_('INVENTORY_CLAIM'),'INVENTORY_CLAIM');
assert.equal(context.bseTelegramEvidenceUxCategory_('UNCLASSIFIED_TEST'),'Belum dikelaskan');
env='TEST';assert.equal(context.bseTelegramEvidenceUxCategory_('UNCLASSIFIED_TEST'),'UNCLASSIFIED_TEST');
assert.match(source,/bseRuntimeEvidenceConfirmedStatus_\(\)/);
assert.match(source,/text:bseTelegramEvidenceUxLabel_\('Semakan Evidence TEST ','Semakan Evidence '\)/);
assert.match(source,/bseTelegramEvidenceUxLabel_\('CONFIRMED_TEST','DISAHKAN'\)/);
console.log('PILOT_EVIDENCE_HUMAN_LABELS PASS');
