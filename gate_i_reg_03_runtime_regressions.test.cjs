'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const sandbox={
  console:{log(){}},
  SpreadsheetApp:{},PropertiesService:{},UrlFetchApp:{},DriveApp:{},ScriptApp:{},Session:{},
  Utilities:{formatDate:(date,tz,pattern)=>{
    assert.equal(tz,'Asia/Kuala_Lumpur');
    assert.equal(pattern,'yyyy-MM-dd');
    const parts=new Intl.DateTimeFormat('en-GB',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(date));
    const take=n=>parts.find(x=>x.type===n).value;
    return take('year')+'-'+take('month')+'-'+take('day');
  }}
};
vm.createContext(sandbox);
for(const name of fs.readdirSync(__dirname).filter(n=>n.endsWith('.js')).sort()){
  vm.runInContext(fs.readFileSync(path.join(__dirname,name),'utf8'),sandbox,{filename:name,timeout:3000});
}
sandbox.bseRuntimeEnvironmentName_=()=> 'PILOT_OPERATION';
let count=0;
function check(name,fn){try{fn();console.log('PASS '+name);count++;}catch(e){console.error('FAIL '+name+': '+(e.stack||e));process.exitCode=1;}}
check('D043 actual Apps Script harness',()=>sandbox.runBseTreatmentD043AcceptanceHarnessTests());
check('Transplant actual Apps Script harness',()=>sandbox.runBseTelegramTransplantReallocationDeterministicHarnessTests());
check('Census actual Apps Script harness',()=>sandbox.runBseCensusConfirmationSummaryHarnessTests());
check('Treatment M3 P1 P2 expands exactly',()=>assert.equal(JSON.stringify(sandbox.bseTreatmentListPlots_('M3 P1 P2')),'["M3P1","M3P2"]'));
check('Treatment canonical one plot stays one',()=>assert.equal(JSON.stringify(sandbox.bseTreatmentListPlots_('M2P1')),'["M2P1"]'));
check('Treatment M3P34 remains two plots',()=>assert.equal(JSON.stringify(sandbox.bseTreatmentListPlots_('M3P34')),'["M3P3","M3P4"]'));
check('Treatment M3 P1 P2 P3 not silently truncated',()=>assert.equal(sandbox.bseTreatmentListPlots_('M3 P1 P2 P3').length,0));
check('Transplant inline date not parsed as plot',()=>{
 const x='Pindah anak pokok Timun ke M1P4, 15/10/2026',v=sandbox.bseTransplantPlots_(x);
 assert.equal(JSON.stringify(v.plots),'["M1P4"]');assert.equal(sandbox.bseTransplantExplicitDateContext_({original:x,clarifications:[]}).date,'2026-10-15');
});
check('Transplant comma plot pair supported',()=>assert.equal(JSON.stringify(sandbox.bseTransplantPlots_('Pindah anak pokok M1P1, 2').plots),'["M1P1","M1P2"]'));
check('Transplant labeled source ignored',()=>assert.equal(JSON.stringify(sandbox.bseTransplantPlots_('Pindah anak pokok\nPlot asal: M3P1\nM3P2').plots),'["M3P2"]'));
check('Treatment parser remains proposal-only',()=>{
 const parsed=sandbox.bseTreatmentListParseMessage_('CADANGAN MERACUN\nJenis Tanaman: Timun\nM3 P1 P2\nAcerio - 30','2026-10-04T07:00:00.000Z');
 assert.equal(parsed.production_write,false);
 assert.equal(parsed.candidates.length,1);
 assert.equal(parsed.candidates[0].target,'Treatment_Event_Log');
 assert.equal(JSON.stringify(parsed.candidates[0].fields.plot_ids),'["M3P1","M3P2"]');
});
console.log('GI_REG_03 '+count+'/11 PASS'+(process.exitCode?' (FAILURES ABOVE)':''));