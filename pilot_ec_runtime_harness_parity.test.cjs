'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
let env='PILOT_OPERATION';
const ctx={
 bseRuntimeEnvironmentName_:()=>env,
 bsePlotSingleLocation_:v=>({ok:/^M[1-9]\d*P[1-9]\d*$/.test(v)}),
 bseApprovalDisplayDate_:v=>v.slice(8,10)+'/'+v.slice(5,7)+'/'+v.slice(0,4),
 bseTelegramReporterConfirmationCore_:function(){const recordSummary=bseEcLeachateConfirmedSummary_();return recordSummary;},
 console
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname+'/EcLeachateTest.js','utf8')+'\n'+fs.readFileSync(__dirname+'/PilotEcUnifiedIntake.js','utf8'),ctx);
for(const e of ['PILOT_OPERATION','TEST']){
 env=e;
 const a=ctx.runBseEcLeachateHarnessTests();
 const b=ctx.runBseEcLeachateConfirmationSummaryHarnessTests();
 assert(a.every(v=>v.pass)&&b.every(v=>v.pass));
 console.log('PASS '+e+' parser runtime harness '+a.length+' and confirmation runtime harness '+b.length);
}
console.log('PILOT_EC_RUNTIME_HARNESS_PARITY PASS');
