'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
let env='PILOT_OPERATION';
const cx={
 bseRuntimeEnvironmentName_:()=>env,
 bsePlotSingleLocation_:s=>({ok:/^M[1-9]\d*P[1-9]\d*$/.test(s)}),
 bseApprovalDisplayDate_:s=>s.slice(8,10)+'/'+s.slice(5,7)+'/'+s.slice(0,4),
 Utilities:{formatDate:(value,zone,pattern)=>{
  const d=value instanceof Date?value:new Date(value);
  if(pattern==='yyyy-MM-dd')return d.toISOString().slice(0,10);
  return d.toISOString().slice(0,10);
 }},console
};
vm.createContext(cx);
for(const name of ['TelegramHistoryTest.js','EcLeachateTest.js','PilotEcUnifiedIntake.js','TelegramEcHistoryTest.js']){
 vm.runInContext(fs.readFileSync(__dirname+'/'+name,'utf8'),cx);
}
for(const e of ['PILOT_OPERATION','TEST']){
 env=e;
 const diag=cx.bseTelegramEcHistoryCommand_('/ec_history week 2 2026-10');console.log('DATE_DIAG '+e+' '+JSON.stringify(diag));
 const tests=cx.runBseTelegramEcHistoryHarnessTests();
 assert(tests.every(x=>x.pass));
 console.log('PASS '+e+' EC history harness '+tests.length+'/'+tests.length);
}
console.log('PILOT_EC_HISTORY_HARNESS_PARITY PASS');
