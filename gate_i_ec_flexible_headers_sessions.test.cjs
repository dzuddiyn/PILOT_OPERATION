'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ec=fs.readFileSync(__dirname+'/EcLeachateTest.js','utf8')+'\n'+fs.readFileSync(__dirname+'/PilotEcUnifiedIntake.js','utf8');
let env='PILOT_OPERATION',checks=0;
const ctx={bseRuntimeEnvironmentName_:()=>env,
 bsePlotSingleLocation_:plot=>({ok:/^M[1-9]\d*P[1-9]\d*$/.test(plot)}),
 bseApprovalDisplayDate_:date=>date.split('-').reverse().join('/')};
vm.createContext(ctx);vm.runInContext(ec,ctx);
function check(label,fn){fn();checks++;console.log('PASS '+label)}
const body=['M1P1-x','M1P2-x','','M2P3-','M2P4-3.0','','M3P3- 3.5','M3P4- 3.5','','M4P1- 3.0','M4P2- 3.0','','M7- 3.5'].join('\n');
const actual='EC \n14/10/2026\n\n'+body;
const parse=(input)=>ctx.bseEcLeachateParseMessage_(input);
check('exact screenshot EC + dynamic date + blank/x has a valid EC log candidate',()=>{
 const x=parse(actual);
 assert(x&&x.validation==='PASS',JSON.stringify(x));
 assert.equal(x.candidates.length,1);assert.equal(x.candidates[0].target,'EC_Leachate_Log');
 const f=x.candidates[0].fields;assert.equal(f.event_date,'2026-10-14');assert.equal(f.session,'');assert.equal(f.readings.length,9);
 for(const id of ['M1P1','M1P2','M2P3'])assert.equal(f.readings.find(r=>r.plot_id===id).input_status,'NOT_MEASURED');
 assert.equal(f.readings.find(r=>r.plot_id==='M2P4').ec_in_next,3);
 assert.equal(f.readings.find(r=>r.module_id==='M7').scope_type,'MODULE');
 assert.equal(f.readings.find(r=>r.module_id==='M7').ec_in_next,3.5);
 assert.equal(f.original_note,actual);
});
for(const alias of ['EC','Rekod EC','EC leeching','EC leaching','REKOD EC LEACHING','EC leachate']){
 check('title variant "'+alias+'" accepted',()=>{
  const x=parse(alias+'\n14/10/2026\n'+body);
  assert(x&&x.validation==='PASS',JSON.stringify(x&&x.candidates&&x.candidates[0]&&x.candidates[0].missing));
  assert.equal(x.candidates.length,1);
 });
}
for(const session of ['pg','pagi','ptg','petang','Sesi: pg','Sesi: pagi','Sesi: ptg','Sesi: petang']){
 for(const order of ['before-date','after-date']){
  check(session+' '+order+' accepted and normalized',()=>{
   const first=order==='before-date'?session:'14/10/2026',second=order==='before-date'?'14/10/2026':session;
   const x=parse('Rekod EC\n'+first+'\n'+second+'\n'+body);
   assert.equal(x.validation,'PASS',JSON.stringify(x.candidates[0].missing));
   assert.equal(x.candidates[0].fields.event_date,'2026-10-14');
   assert.equal(x.candidates[0].fields.session,/pg|pagi/i.test(session)?'PAGI':'PETANG');
   assert.equal(x.candidates[0].fields.readings.length,9);
  });
 }
}
check('dynamic date uses report date not receipt/current date',()=>{
 const x=parse('EC\n27/09/2026\n'+body);
 assert.equal(x.validation,'PASS');assert.equal(x.candidates[0].fields.event_date,'2026-09-27');
});
check('contradictory sessions fail closed',()=>{
 const x=parse('Rekod EC\npg\n14/10/2026\nptg\n'+body);
 assert.equal(x.validation,'NEED_INFO');assert(x.candidates[0].missing.includes('session_conflict'));
});
check('invalid date fails closed',()=>{
 const x=parse('EC leeching\n31/02/2026\npg\n'+body);
 assert.equal(x.validation,'NEED_INFO');assert(x.candidates[0].missing.includes('event_date'));
});
check('missing date does not infer system date',()=>{
 const x=parse('EC\npg\n'+body);
 assert.equal(x.validation,'NEED_INFO');assert(x.candidates[0].missing.includes('event_date'));
});
check('not an EC report when title absent and too few readings',()=>{
 assert.equal(parse('14/10/2026\nM1P1-3.0'),null);
});
check('unrelated narrative does not become EC just because letters EC appear',()=>{
 assert.equal(parse('EC pump fault\n14/10/2026\nM1P1-3.0\nM1P2-3.5\nM1P3-3'),null);
});
check('TEST/PILOT_TEST retain original parser',()=>{
 for(const e of ['TEST','PILOT_TEST']){env=e;assert.equal(parse(actual),null)}
 env='PILOT_OPERATION';
});
check('correct new report remains one card-only with Benar/Batal downstream',()=>{
 const x=parse(actual);
 const worker=fs.readFileSync(__dirname+'/TelegramWorkerTest.js','utf8');
 assert(worker.includes('bsePilotEcReviewCardOnly_(result,reviewStatus)'));
 assert(worker.includes('bseTelegramApprovalEnsureCard_(book,latest)'));
 assert.equal(x.candidates.length,1);
});
console.log('GATE_I_EC_FLEXIBLE_HEADERS_SESSIONS '+checks+'/'+checks+' PASS');