'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/EcLeachateTest.js','utf8')+'\n'+fs.readFileSync(__dirname+'/PilotEcUnifiedIntake.js','utf8');
let env='PILOT_OPERATION';
const cx={bseRuntimeEnvironmentName_:()=>env,
 bsePlotSingleLocation_:id=>({ok:/^M[1-9]\d*P[1-9]\d*$/.test(id)}),
 bseApprovalDisplayDate_:d=>d?d.slice(8,10)+'/'+d.slice(5,7)+'/'+d.slice(0,4):'',console};
vm.createContext(cx);vm.runInContext(code,cx);
const khairul=[
'REKOD EC LEACHING','Date : 22/09/2026','Sesi: Pagi','__________',
'1. M1','M1P2 - x : x','M1P3 - x : x','M1P4 - x : x',
'2. M2','M2P1 - x : x','M2P2 - x : x','M2P3 - x : x','M2P4 - x : x',
'3. M3','M3P1 -  : 3.0','M3P2 -  : 3.0','M3P3 -  : 3.0','M3P4 -  : 3.0'
].join('\n');
const sapiq=['22/09/2026','M1P1-x','M1P2-x','M2P3- x','M2P4- x',
'M3P3- 3.0','M3P4- 3.0','M4P1- 3.5','M4P2- 3.5','M7- 3.0'].join('\n');
const check=(label,fn)=>{fn();console.log('PASS '+label)};
const a=cx.bseEcLeachateParseMessage_(khairul),b=cx.bseEcLeachateParseMessage_(sapiq);
check('Khairul one canonical record with date and session',()=>{
 assert.equal(a.validation,'PASS');assert.equal(a.candidates.length,1);
 assert.equal(a.candidates[0].target,'EC_Leachate_Log');
 assert.equal(a.candidates[0].fields.event_date,'2026-09-22');
 assert.equal(a.candidates[0].fields.session,'PAGI');
 assert.equal(a.candidates[0].fields.readings.length,11);
});
check('Khairul blank leachate is not fake zero',()=>{
 const x=a.candidates[0].fields.readings.find(r=>r.plot_id==='M3P1');
 assert.equal(x.ec_leachate_out,'');assert.equal(x.ec_in_next,3);assert.equal(x.input_status,'IN_ONLY');
});
check('Khairul x:x means not measured',()=>{
 const x=a.candidates[0].fields.readings.find(r=>r.plot_id==='M1P2');
 assert.equal(x.input_status,'NOT_MEASURED');assert.equal(x.ec_in_next,'');
});
check('Sapiq compact EC_IN without session',()=>{
 assert.equal(b.validation,'PASS');assert.equal(b.candidates.length,1);
 assert.equal(b.candidates[0].target,'EC_Leachate_Log');
 assert.equal(b.candidates[0].fields.event_date,'2026-09-22');
 assert.equal(b.candidates[0].fields.session,'');
 assert.equal(b.candidates[0].fields.readings.length,9);
});
check('Sapiq M7 remains module',()=>{
 const r=b.candidates[0].fields.readings.find(r=>r.module_id==='M7');
 assert.equal(r.scope_type,'MODULE');assert.equal(r.plot_id,'');assert.equal(r.ec_in_next,3);
 assert.equal(r.ec_leachate_out,'');assert.equal(r.input_status,'MODULE_IN_ONLY');
});
check('primary EC_IN and secondary leachate visible, session not inferred',()=>{
 const card=cx.bsePilotEcCardText_(b.candidates[0].fields);
 assert.match(card,/REKOD EC — EC_IN UTAMA/);assert.match(card,/Tarikh: 22\/09\/2026/);
 assert.match(card,/Sesi: Tidak dinyatakan/);assert.match(card,/M7 \(modul\) — EC_IN: 3/);
 assert.match(card,/M3P3 — EC_IN: 3 \| EC leachate: belum dilaporkan/);
});
check('paired numeric leachate and AK remain accurate',()=>{
 const s=cx.bseEcLeachateParseMessage_(['REKOD EC LEACHING','Date: 22/09/2026',
 'Sesi: Pagi','M3P1 - 2.03 : AK','M3P3 - 1.47 : 2.5'].join('\n'));
 assert.equal(s.validation,'PASS');const data=s.candidates[0].fields.readings;
 assert.equal(data[0].input_status,'AK_ZERO');assert.equal(data[0].ec_in_next,0);
 assert.equal(data[0].ec_leachate_out,2.03);
 assert.equal(data[1].ec_in_next,2.5);assert.equal(data[1].ec_leachate_out,1.47);
});
check('both normalized proposals accepted',()=>{
 assert.equal(cx.bseEcLeachateProposal_(JSON.stringify(a),khairul).canonical.readings.length,11);
 assert.equal(cx.bseEcLeachateProposal_(JSON.stringify(b),sapiq).canonical.readings.length,9);
});
check('leachate without EC_IN rejected',()=>{
 const r=cx.bseEcLeachateParseMessage_('REKOD EC LEACHING\nDate: 22/09/2026\nM3P3 - 2.0 :');
 assert.equal(r.validation,'NEED_INFO');assert(r.candidates[0].missing.includes('ec_in_missing'));
});
check('invalid date not replaced',()=>{
 const r=cx.bseEcLeachateParseMessage_('REKOD EC LEACHING\nDate: 31/02/2026\nM3P3 - 3.0');
 assert.equal(r.validation,'NEED_INFO');assert(r.candidates[0].missing.includes('event_date'));
});
check('duplicate plot rejected',()=>{
 const r=cx.bseEcLeachateParseMessage_('REKOD EC LEACHING\nDate: 22/09/2026\nM3P3 - 3.0\nM3P3 - 2.0');
 assert.equal(r.validation,'NEED_INFO');assert(r.candidates[0].missing.includes('duplicate_scope'));
});
check('ambiguous single no-title numeric not auto-classified',()=>assert.equal(cx.bseEcLeachateParseMessage_('22/09/2026\nM3P3 - 3.0'),null));
check('unrelated narrative not classified as EC',()=>assert.equal(cx.bseEcLeachateParseMessage_('Pemeriksaan serangga\n22/09/2026\nM1P1 - 1\nM1P2 - 2\nM1P3 - 3'),null));
check('TEST/PILOT_TEST legacy behavior unchanged',()=>{
 env='TEST';const old=cx.bseEcLeachateParseMessage_('REKOD EC LEACHING\nDate: 22/09/2026\nSesi: Pagi\nM3P1 - 2.03 : AK');
 assert.equal(old.validation,'PASS');assert.equal(cx.bseEcLeachateParseMessage_(sapiq),null);
 env='PILOT_TEST';assert.equal(cx.bseEcLeachateParseMessage_(sapiq),null);env='PILOT_OPERATION';
});
check('confirmed history prioritizes EC_IN',()=>{
 const r=b.candidates[0].fields.readings.find(v=>v.module_id==='M7');
 const row=['k','b','update','2026-09-22','',r.scope_type,r.module_id,r.plot_id,r.ec_leachate_out,r.ec_in_next,r.input_status,'REPORTER_CONFIRMED_TEST'];
 const item=cx.bsePilotEcHistoryReadingText_(row);
 assert.match(item,/M7 \(modul\) — EC_IN: 3/);assert.doesNotMatch(item,/EC leachate: 0/);
});
check('both reporting formats use ONE atomic EC confirmation card',()=>{
 const source=fs.readFileSync(__dirname+'/TelegramApprovalUiTest.js','utf8');
 const begin=source.indexOf('function bseApprovalEnvelopes_(result){');
 const end=source.indexOf('\nfunction bseApprovalCandidateIndexFromSourceKey_',begin);
 assert(begin>=0&&end>begin);
 const cardContext={bseApprovalCandidateEnvelope_:(result,i)=>({
   validation:result.candidates[i].validation,production_write:false,
   candidates:[result.candidates[i]]})};
 vm.createContext(cardContext);vm.runInContext(source.slice(begin,end),cardContext);
 const khairulCards=cardContext.bseApprovalEnvelopes_(a),sapiqCards=cardContext.bseApprovalEnvelopes_(b);
 assert.equal(khairulCards.length,1);assert.equal(sapiqCards.length,1);
 assert.equal(khairulCards[0].candidates[0].fields.readings.length,11);
 assert.equal(sapiqCards[0].candidates[0].fields.readings.length,9);
 assert.match(source,/bsePilotEcCardText_\(f\)/);
});
check('PILOT EC history help says confirmed-only',()=>{
 const source=fs.readFileSync(__dirname+'/TelegramEcHistoryTest.js','utf8');
 assert.match(source,/function bsePilotEcHistoryHelp_/);
 assert.match(source,/Laporan yang masih menunggu Benar belum dikira sebagai sejarah/);
});
console.log('PILOT_EC_TWO_FORMATS_UNIFIED 17/17 PASS');
