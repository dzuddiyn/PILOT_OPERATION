'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const env={console:{log(){}},SpreadsheetApp:{},PropertiesService:{},UrlFetchApp:{},DriveApp:{},ScriptApp:{},Session:{}};
vm.createContext(env);
for(const file of fs.readdirSync(__dirname).filter(x=>x.endsWith('.js')).sort())
  vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),env,{filename:file,timeout:4000});
let mode='PILOT_OPERATION',passed=0;
env.bseRuntimeEnvironmentName_=()=>mode;
function check(name,fn){fn();passed++;console.log('PASS '+name)}
function parse(t){return env.bsePilotHarvestStartResult_(t)}
for(const phrase of ['mula harvest','mula harverst','mula tuai','tarikh mula harvest','tarikh mula tuai']){
 for(const plot of ['M3P34','M3P3,4','M3P3']){
  const expected=plot==='M3P3'?['M3P3']:['M3P3','M3P4'];
  for(const order of [0,1]){
   check('HARVEST '+phrase+' '+plot+' order='+order,()=>{
    const input=phrase+'\n'+(order?'2/10/26':plot)+'\n'+(order?plot:'2/10/26');
    const r=parse(input);
    assert.equal(r.validation,'PASS');assert.equal(r.production_write,false);
    assert.deepEqual(Array.from(r.candidates,c=>c.fields.plot_id),expected);
    assert.ok(r.candidates.every(c=>c.fields.event_date==='2026-10-02'&&c.fields.operation_type==='HARVEST_START'&&c.missing.length===0));
    assert.equal(env.bseApprovalEnvelopes_(r).length,expected.length);
   });
  }
 }
}
for(const sample of ['mula harverst\n31/02/26\nM3P34','mula tuai\n2/10/26\nM3P11','mula tuai\n2/10/26\n2/10/26','mula tuai\nM3P3\nM3P4','mula tuai\nM3P34\n2/10/26\nextra']){
 check('reject malformed '+sample.replace(/\n/g,'/'),()=>assert.notEqual(parse(sample).validation,'PASS'));
}
check('does not fall through to treatment for incomplete harvest',()=>{
 assert.equal(parse('mula harverst\n2/10/26\nM3P11').validation,'NEED_INFO');
});
check('other environments stay isolated',()=>{
 mode='PILOT_TEST';assert.equal(parse('mula harverst\n2/10/26\nM3P34'),null);mode='PILOT_OPERATION';
});
const event=['BSE-TG-772257228|Transplant_Event_Log',772257228,'BSE-SB-TR-20260831-001','BSE-SB-CB-20260825-001','2026-08-31','TRANSPLANT','Cucumber','7055 (CCB)','M3P3|M3P4','COMPLETED','VERIFIED_TEST','note','stamp','owner','HASH'];
const review=['UUID',event[0],772257228,'Transplant_Event_Log','HASH','APPROVED','owner','','stamp','NEEDS_HUMAN_REVIEW','{}',event[2],event[3]];
const status=(plot,num)=>[event[0],772257228,'UUID'+num,event[2],event[3],event[3]+'-PA-00'+num,plot,'PLANNED','ACTIVE','stamp','owner','HASH'];
const fixture={
 TEST_TRANSPLANT_EVENT:[event],
 TEST_TRANSPLANT_REVIEW:[review],
 TEST_ALLOCATION_STATUS_EVENT:[status('M3P3',1),status('M3P4',2)]
};
let writes=0;
function bookWith(data){
 return {getSheetByName(name){
  if(!data[name])return null;
  return {getLastRow:()=>1+data[name].length,getRange:(r,c,h,w)=>({getValues:()=>data[name].slice(r-2,r-2+h).map(v=>v.slice(c-1,c-1+w)),
  setValues(){writes++;throw Error('READ_ONLY_REQUIRED')}})};
 }};
}
let input='Tarikh Pindah anak pokok\n31-Aug-26\nM3P3,4',book=bookWith(fixture);
check('existing exact event resolves to original report once',()=>{
 const record=env.bsePilotTransplantExistingExact_(book,input);
 assert.ok(record);assert.equal(record.reference,'BSE-TG-772257228');assert.equal(record.event_date,'2026-08-31');
 assert.deepEqual(Array.from(record.plots),['M3P3','M3P4']);assert.equal(record.crop,'Cucumber');
});
check('already-recorded answer is informational, never confirmation',()=>{
 const text=env.bsePilotTransplantExistingExactText_('BSE-TG-772257318',env.bsePilotTransplantExistingExact_(book,input));
 assert.match(text,/sudah direkodkan/);assert.match(text,/772257228/);assert.match(text,/31\/08\/2026/);
 assert.match(text,/tidak perlu/i);
});
check('read-only result is terminal and no force-reply question',()=>{
 const result={validation:'NEED_INFO',production_write:false,candidates:[{target:'Transplant_Event_Log',validation:'NEED_INFO',missing:['crop','batch_match'],fields:{}}]};
 const out=env.bseTelegramWorkerFinalizeResult_(book,result,{id:'772257318',rootId:'772257318',input,provenance:input,receivedAt:'2026-10-20T12:02:58.103Z'});
 assert.ok(out.transplant_already_recorded);assert.equal(env.bseTelegramQueueStatus_(out),'ALREADY_RECORDED');
 assert.equal(env.bseTelegramQuestion_(out),'');
});
for(const [description,change] of [
 ['date mismatch',v=>{v.TEST_TRANSPLANT_EVENT[0][4]='2026-09-01'}],
 ['missing approval',v=>{v.TEST_TRANSPLANT_REVIEW=[]}],
 ['different plot pair',v=>{v.TEST_TRANSPLANT_EVENT[0][8]='M3P3|M3P5'}],
 ['partial ACTIVE evidence',v=>{v.TEST_ALLOCATION_STATUS_EVENT.pop()}],
 ['rejected approval',v=>{v.TEST_TRANSPLANT_REVIEW[0][5]='REJECTED'}],
 ['unverified event',v=>{v.TEST_TRANSPLANT_EVENT[0][10]='PROVISIONAL'}]
]){
 check('fail closed '+description,()=>{
  const copy=JSON.parse(JSON.stringify(fixture));change(copy);
  assert.equal(env.bsePilotTransplantExistingExact_(bookWith(copy),input),null);
 });
}
check('different source text with conflicting crop cannot be deemed duplicate',()=>{
 assert.equal(env.bsePilotTransplantExistingExact_(bookWith(fixture),'Tarikh Pindah anak pokok Timun\n31-Aug-26\nM3P3,4'),null);
});
check('ordinary new planned transplant unchanged',()=>{
 const r=env.bseTelegramTransplantDeterministicResult_(bookWith({}),input);
 assert.ok(r&&r.validation==='NEED_INFO');
});
check('no synthetic domain writes or approval calls',()=>assert.equal(writes,0));
console.log('GI_HARVEST_ORDER_AND_TRANSPLANT_DUP '+passed+'/'+passed+' PASS');
