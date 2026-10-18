'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const dir=__dirname;
const source=fs.readFileSync(dir+'/EnvironmentTest.js','utf8');
const noticeSource=fs.readFileSync(dir+'/TelegramApprovalUiTest.js','utf8');
let env='PILOT_OPERATION';
const ctx={PropertiesService:{getScriptProperties:()=>({getProperty:k=>k==='BSE_RUNTIME_ENV'?env:''})},console};
vm.createContext(ctx);vm.runInContext(source,ctx);
let n=0;
function check(name,fn){fn();n++;console.log('PASS '+name);}
function out(method,text){const k=method==='sendPhoto'?'caption':'text';
 return ctx.bseRuntimeTelegramPayload_(method,{[k]:text})[k];}
check('PILOT ordinary message has no technical environment prefix',()=>{
 env='PILOT_OPERATION';assert.equal(out('sendMessage','Semakan laporan'),'Semakan laporan');
});
check('PILOT ACK removes trailing Mod TEST suffix without changing reference',()=>{
 env='PILOT_OPERATION';
 const raw='Laporan diterima dan sudah disimpan untuk diproses. Rujukan: BSE-TG-772257188. (Mod TEST)';
 const expected='Memproses Rekod / Laporan.\n<i>Rujukan: BSE-TG-772257188</i>';
 assert.equal(out('sendMessage',raw),expected);
 assert.equal(out('editMessageText',raw),expected);
 assert.equal(out('sendMessage','Laporan diterima dan sudah disimpan untuk diproses. Rujukan: BSE-TG-772257188.'),expected);
 assert.equal(ctx.bseRuntimeTelegramPayload_('sendMessage',{text:raw}).parse_mode,'HTML');
 assert.equal(ctx.bseRuntimeTelegramPayload_('editMessageText',{text:raw}).parse_mode,'HTML');
 assert.equal(ctx.bseRuntimeTelegramPayload_('sendMessage',{text:'Semakan laporan'}).parse_mode,undefined);
});
check('PILOT does not rewrite unrelated reporter note containing Mod TEST',()=>{
 env='PILOT_OPERATION';const note='Nota pelapor: (Mod TEST) adalah tulisan asal.';
 assert.equal(out('sendMessage',note),note);
});
check('PILOT_TEST retains historical ACK label',()=>{
 env='PILOT_TEST';const raw='Laporan diterima dan sudah disimpan untuk diproses. Rujukan: BSE-TG-1. (Mod TEST)';
 assert(out('sendMessage',raw).includes('(Mod TEST)'));
});
check('PILOT old prefixed message becomes normal user message',()=>{
 env='PILOT_OPERATION';assert.equal(out('sendMessage','[PILOT]\nRekod TEST BSE-TG-772257142\nMod TEST - tiada rekod production ditulis.'),'Rekod BSE-TG-772257142');
});
check('PILOT evidence caption is plain-language',()=>{
 env='PILOT_OPERATION';assert.equal(out('sendPhoto','Evidence TEST BSE-EV-1'),'Lampiran BSE-EV-1');
});
check('PILOT report headings contain no TEST suffix',()=>{
 env='PILOT_OPERATION';for(const [before,after] of [
 ['Semakan TEST BSE-TG-1','Semakan laporan BSE-TG-1'],
 ['Status Plot TEST M5P1','Status Plot M5P1'],
 ['Laporan TEST - 2026-10-18','Laporan - 2026-10-18'],
 ['Makluman TEST BSE-TG-1 telah direkodkan oleh dzuddiyn.','Makluman BSE-TG-1 telah direkodkan oleh dzuddiyn.'],
 ['Resit TEST BSE-TG-1 - direkodkan.','Resit BSE-TG-1 - direkodkan.']
 ])assert.equal(out('sendMessage',before),after);
});
check('PILOT Treatment technical-only worker notice becomes action-oriented',()=>{
 env='PILOT_OPERATION';
 const result=out('sendMessage','Rujukan BSE-TG-772257163:\nTREATMENT_EVENT\nStatus: PROVISIONAL — menunggu semakan manusia.\nMod TEST — tiada rekod production ditulis.');
 assert(result.includes('Laporan racun'));
 assert(result.includes('BSE-TG-772257163'));
 assert(result.includes('Benar, Betulkan atau Batal'));
 assert(!/PROVISIONAL|TREATMENT_EVENT|production|Mod TEST|\[PILOT\]/i.test(result));
});
check('PILOT original user note TEST_ONLY and original middle sentence remain verbatim',()=>{
 env='PILOT_OPERATION';const txt='Nota asal: TEST_ONLY pada hari ini; Rekod TEST ada dalam nota asal.';
 assert.equal(out('sendMessage',txt),txt);
});
check('PILOT mixed message retains meaningful status but strips technical mode line',()=>{
 env='PILOT_OPERATION';const txt='Rujukan BSE-TG-22:\nRawatan / Racun\nStatus: PROVISIONAL — menunggu semakan manusia.\nMod PILOT - tiada rekod production ditulis.';
 const result=out('sendMessage',txt);assert(result.includes('Rujukan BSE-TG-22'));assert(result.includes('Menunggu pengesahan'));assert(!result.includes('Mod PILOT'));
});
check('PILOT_TEST unchanged including explicit prefix and old text',()=>{
 env='PILOT_TEST';assert.equal(out('sendMessage','Rekod TEST BSE-TG-1'),'[PILOT TEST]\nRekod TEST BSE-TG-1');
});
check('TEST unchanged including technical text',()=>{
 env='TEST';assert.equal(out('sendMessage','Mod TEST - tiada production write'),'Mod TEST - tiada production write');
});
check('original transport fields preserved and payload not mutated',()=>{
 env='PILOT_OPERATION';const before={text:'Rekod TEST BSE-TG-1',chat_id:123,parse_mode:'HTML'};
 const after=ctx.bseRuntimeTelegramPayload_('sendMessage',before);
 assert.equal(after.text,'Rekod BSE-TG-1');assert.equal(after.chat_id,123);assert.equal(after.parse_mode,'HTML');assert.equal(before.text,'Rekod TEST BSE-TG-1');
});
const helper=noticeSource.match(/function bseTelegramPilotConfirmedOwnerNotice_\([\s\S]*?\n\}/);
assert(helper,'PILOT notice helper missing');
ctx.bseTelegramReporterDisplayName_=()=> 'dzuddiyn';
vm.runInContext(helper[0],ctx);
check('owner notice includes real reporter name and reference',()=>{
 const row=['BSE-TG-772257163','','','913757987'];
 const v=ctx.bseTelegramPilotConfirmedOwnerNotice_({},row,null,'');
 assert(v.includes('BSE-TG-772257163'));assert(v.endsWith('oleh dzuddiyn.'));
 assert.equal(out('sendMessage',v),'Makluman BSE-TG-772257163 telah direkodkan oleh dzuddiyn.');
});
check('owner notice preserves meaningful category summary',()=>{
 const row=['BSE-TG-772257161','','','913757987'];
 const v=ctx.bseTelegramPilotConfirmedOwnerNotice_({},row,1,'Rawatan disahkan');
 assert(v.includes('Rawatan disahkan\n\nMakluman TEST BSE-TG-772257161 rekod 2'));
});
check('owner notice sanitizes control characters in name',()=>{
 ctx.bseTelegramReporterDisplayName_=()=> 'abc\nxyz<> ';
 const v=ctx.bseTelegramPilotConfirmedOwnerNotice_({},['BSE-TG-1','','','123'],null,'');
 assert(v.includes('oleh abc xyz.'));ctx.bseTelegramReporterDisplayName_=()=> 'dzuddiyn';
});
check('owner notice fails safe to Telegram identity if no display name',()=>{
 ctx.bseTelegramReporterDisplayName_=()=> '';
 const v=ctx.bseTelegramPilotConfirmedOwnerNotice_({},['BSE-TG-1','','','123'],null,'');
 assert(v.includes('oleh Telegram 123.'));
});
check('owner name branch is only enabled in PILOT_OPERATION',()=>{
 assert(/bseRuntimeEnvironmentName_\(\)==='PILOT_OPERATION'\s*\?\s*bseTelegramPilotConfirmedOwnerNotice_/.test(noticeSource));
});
check('PILOT card closure uses human-readable confirmation status',()=>{
 env='PILOT_OPERATION';
 const original='Semakan TEST BSE-TG-772257163 â€” REPORTER_CONFIRMED oleh dzuddiyn pada 18/10/2026';
 const expected='Semakan laporan BSE-TG-772257163 â€” Disahkan oleh dzuddiyn pada 18/10/2026';
 assert.equal(out('sendMessage',original),expected);
});
check('PILOT retrieval hides raw schema/category/status tokens',()=>{
 env='PILOT_OPERATION';
 const raw='Rekod TEST BSE-TG-772257163\nKategori: PRIVATE_SUBMISSION\nStatus: REPORTER_CONFIRMED\nTreatment_Event_Log | Timun 2026-10-13 M5P1,M5P2 Serenade - 80';
 const expected='Rekod BSE-TG-772257163\nStatus: Disahkan oleh penghantar\nRawatan / Racun | Timun 2026-10-13 M5P1,M5P2 Serenade - 80';
 assert.equal(out('sendMessage',raw),expected);
});
check('PILOT history references confirmation date and hides raw schema category',()=>{
 env='PILOT_OPERATION';
 const raw='Sejarah TEST - 2026-10-18\n2026-10-18 | BSE-TG-772257163 | PRIVATE_SUBMISSION | Treatment_Event_Log | Timun 2026-10-13 M5P1,M5P2\nMod TEST - tiada production write.';
 const shown=out('sendMessage',raw);
 assert.equal(shown,'Sejarah operasi - 2026-10-18\n2026-10-18 | BSE-TG-772257163 | Rawatan / Racun | Timun 2026-10-13 M5P1,M5P2');
});
check('PILOT empty history explicitly means no confirmation in requested period',()=>{
 env='PILOT_OPERATION';
 const shown=out('sendMessage','Sejarah TEST - 2026-10-13\nTiada rekod TEST yang boleh dipaparkan dalam sela masa ini.\nMod TEST - tiada production write.');
 assert.equal(shown,'Sejarah operasi - 2026-10-13\nTiada rekod operasi dalam tempoh ini.');
});
check('PILOT nonactive plot status uses plain language without inventing ACTIVE',()=>{
 env='PILOT_OPERATION';
 const shown=out('sendMessage','Status Plot TEST M5P1\nTiada allocation ACTIVE TEST yang diluluskan.\nMod TEST - tiada production write.');
 assert.equal(shown,'Status Plot M5P1\nTiada rekod tanaman berstatus aktif untuk plot ini.');
 assert(!shown.includes('PLANNED'));
});
check('PILOT unsupported group ACK remains nonempty and actionable',()=>{
 env='PILOT_OPERATION';
 const raw='Mod TEST ini menerima laporan teks sahaja. Sila hantar semula sebagai teks.';
 const text=out('sendMessage',raw);
 assert.equal(text,'Mesej bukan teks tidak diproses. Sila hantar laporan dalam bentuk teks.');
 assert(text.length>0&&!text.includes('Mod TEST'));
});
check('legacy TEST and PILOT_TEST unsupported notice remains unchanged',()=>{
 const raw='Mod TEST ini menerima laporan teks sahaja. Sila hantar semula sebagai teks.';
 env='TEST';assert.equal(out('sendMessage',raw),raw);
 env='PILOT_TEST';assert.equal(out('sendMessage',raw),'[PILOT TEST]\n'+raw);
});
console.log('GATE_I_PILOT_USER_UX '+n+'/'+n+' PASS');
