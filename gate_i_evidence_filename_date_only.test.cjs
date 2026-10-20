'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(__dirname+'/PilotEvidenceSafeStore.js','utf8');
const ctx={console};vm.createContext(ctx);vm.runInContext(src,ctx);
const row=()=>{const r=Array(23).fill('');r[0]='BSE-EV-448-AQADDRxr';r[3]='416';r[6]='2026-10-20T14:10:27.065Z';r[7]='M1P3 - circuit elektrik pam terbakar';r[8]='PHOTO';r[10]='FAKE_UNIQUE_ID';r[12]='picture_20261020_221027.jpg';return r};
let passed=0;const check=(n,fn)=>{fn();passed++;console.log('PASS '+n)};
check('friendly PILOT filename uses MYT date without clock time',()=>{
 const x=ctx.bsePilotEvidenceStoredName_(row());
 assert.equal(x,'2026-10-20_M1P3_circuit_elektrik_pam_terbakar_EV416.jpg');
 assert(!x.includes('221027')&&!x.includes('14_10_27')&&!x.includes('GMT'));
});
check('caption empty remains explicitly unnamed',()=>{
 const r=row();r[7]='';assert.equal(ctx.bsePilotEvidenceStoredName_(r),'2026-10-20_Foto_tanpa_keterangan_EV416.jpg');
});
check('timestamp close to midnight rolls over using MYT date',()=>{
 const r=row();r[6]='2026-10-20T17:45:00.000Z';
 assert(ctx.bsePilotEvidenceStoredName_(r).startsWith('2026-10-21_'));
});
check('unsafe / invalid source identity fails closed',()=>{
 const r=row();r[3]='arbitrary';assert.throws(()=>ctx.bsePilotEvidenceStoredName_(r),/SOURCE_MESSAGE_ID_INVALID/);
});
check('legacy naming still deterministic for existing Drive files',()=>{
 const r=row();assert(ctx.bsePilotEvidenceLegacyStoredName_(r).includes('BSE-EV-448-AQADDRxr'));
});
console.log('GI_EVIDENCE_DATE_ONLY '+passed+'/'+passed+' PASS');