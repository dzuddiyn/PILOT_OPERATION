'use strict';const fs=require('fs'),vm=require('vm'),assert=require('assert');const ctx={console};vm.createContext(ctx);
for(const f of ['TelegramEvidenceTest.js','EnvironmentTest.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
let n=0;function test(name,f){f();n++;console.log('PASS '+name)}
test('pam rosak M2P2 is field operation',()=>assert.equal(ctx.bseTelegramEvidenceCategory_('Pam rosak M2P2'),'FIELD_OPERATION'));
test('maintenance, leak and damaged pump categorized',()=>{for(const c of ['Pump rosak M2P2','Motor bocor M2P2','Pembaikan hos M2P2'])assert.equal(ctx.bseTelegramEvidenceCategory_(c),'FIELD_OPERATION')});
test('existing inventory and admin categories unchanged',()=>{assert.equal(ctx.bseTelegramEvidenceCategory_('Resit stok'),'INVENTORY_CLAIM');assert.equal(ctx.bseTelegramEvidenceCategory_('Surat admin'),'ADMIN_DOCUMENT')});
test('unrelated caption not misrepresented',()=>assert.equal(ctx.bseTelegramEvidenceCategory_('Gambar'),'UNCLASSIFIED_TEST'));
test('PILOT card hides TEST and classifies meaningfully',()=>{const s=ctx.bseRuntimePilotUiLabels_('Semakan Evidence TEST BSE-EV-126-AQADNxNr\nKategori dicadang: FIELD_OPERATION');assert(s.includes('Semakan lampiran'));assert(s.includes('Operasi ladang / peralatan'));assert(!s.includes('TEST'))});
test('PILOT generic category uses plain language',()=>assert.equal(ctx.bseRuntimePilotUiLabels_('Kategori dicadang: UNCLASSIFIED_TEST'),'Kategori dicadang: Belum dikenal pasti'));
console.log('EVIDENCE_PUMP_CATEGORY_UI '+n+'/'+n+' PASS');