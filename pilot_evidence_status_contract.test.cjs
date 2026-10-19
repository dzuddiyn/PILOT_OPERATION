'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
let env='PILOT_OPERATION';
const ctx={console,PropertiesService:{getScriptProperties:()=>({getProperty:()=>env})}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname+'/EnvironmentTest.js','utf8'),ctx,{filename:'EnvironmentTest.js'});
ctx.bseRuntimeEnvironmentName_=()=>env;
let n=0;function check(label,fn){fn();n++;console.log('PASS '+label)}
check('PILOT writes CONFIRMED',()=>assert.equal(ctx.bseRuntimeEvidenceConfirmedStatus_(),'CONFIRMED'));
check('PILOT accepts confirmed status and historical compatibility',()=>{assert(ctx.bseRuntimeEvidenceIsConfirmed_('CONFIRMED'));assert(ctx.bseRuntimeEvidenceIsConfirmed_('CONFIRMED_TEST'))});
check('PILOT excludes pending and discarded',()=>{assert(!ctx.bseRuntimeEvidenceIsConfirmed_('OPEN'));assert(!ctx.bseRuntimeEvidenceIsConfirmed_('DISCARDED_BY_REPORTER'))});
check('legacy TEST writes and reads legacy status only',()=>{env='TEST';assert.equal(ctx.bseRuntimeEvidenceConfirmedStatus_(),'CONFIRMED_TEST');assert(!ctx.bseRuntimeEvidenceIsConfirmed_('CONFIRMED'));assert(ctx.bseRuntimeEvidenceIsConfirmed_('CONFIRMED_TEST'))});
check('PILOT_TEST remains separate legacy contract',()=>{env='PILOT_TEST';assert.equal(ctx.bseRuntimeEvidenceConfirmedStatus_(),'CONFIRMED_TEST');assert(!ctx.bseRuntimeEvidenceIsConfirmed_('CONFIRMED'))});
check('PILOT outgoing status uses plain language without TEST marker',()=>{env='PILOT_OPERATION';const out=ctx.bseRuntimePilotUiLabels_('Status: CONFIRMED_TEST\nKategori dicadang: UNCLASSIFIED_TEST');assert(out.includes('Status: Disahkan'));assert(out.includes('Belum dikenal pasti'));assert(!out.includes('_TEST'))});
check('PILOT evidence receipt and retrieval do not expose TEST wording',()=>{env='PILOT_OPERATION';for(const input of ['Resit Evidence TEST BSE-EV-126','Rujukan Evidence TEST tidak ditemui atau belum disahkan.','OCR CONFIRMED TEST BSE-EV-126']){const out=ctx.bseRuntimePilotUiLabels_(input);assert(!out.includes('TEST'),out)}});
console.log('PILOT_EVIDENCE_STATUS '+n+'/'+n+' PASS');
