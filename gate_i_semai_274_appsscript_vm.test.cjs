'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const scope={console:{log(){}},SpreadsheetApp:{},PropertiesService:{},UrlFetchApp:{},DriveApp:{},ScriptApp:{},Session:{},
 Utilities:{formatDate:(date,tz,pattern)=>{
  assert.equal(tz,'Asia/Kuala_Lumpur');assert.equal(pattern,'yyyy-MM-dd');
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(date));
  return ['year','month','day'].map(k=>parts.find(x=>x.type===k).value).join('-');
 }}};
vm.createContext(scope);
for(const file of fs.readdirSync(__dirname).filter(x=>x.endsWith('.js')).sort()){
 vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),scope,{filename:file,timeout:3000});
}
scope.bseRuntimeEnvironmentName_=()=> 'PILOT_OPERATION';
const harness=scope.runBseTelegramSeedSowingBoundaryRegressionTests();
assert.ok(harness.every(x=>x.pass));
assert.ok(harness.some(x=>x.id.includes('GI-SEMAI-274')));
assert.ok(harness.some(x=>x.id.includes('GI-SEMAI-276')));
const input='Semai\nTimun (7055 CCB)\n8-Aug-26\nM3P2';
const raw=scope.bsePilotCompactSowingResult_(input);
const guarded=scope.bseUnifiedGuard_(raw,{received_at:'2026-10-20T08:41:25.166Z',queue_reference:'BSE-TG-772257274',root_reference:'BSE-TG-772257274',source_input:input});
assert.equal(guarded.validation,'PASS');assert.equal(guarded.production_write,false);
assert.equal(guarded.candidates.map(c=>c.target).join('|'),'Crop_Batch_Log|Planting_Event_Log|Plot_Allocation_Log');
assert.ok(guarded.candidates.every(c=>c.validation==='PASS'&&Array.isArray(c.missing)&&!c.missing.length));
assert.equal(guarded.candidates[2].fields.plot_id,'M3P2');
assert.equal(guarded.candidates[0].fields.event_date,'2026-08-08');
console.log('PASS GI-SEMAI Apps Script harness '+harness.length+' cases and unified guard — LOCAL VM ONLY');