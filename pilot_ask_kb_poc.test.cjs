'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const ctx={String,Set,Array,Math,JSON,PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'fileSearchStores/already-existing'})},bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',BSE_AI_FILE_SEARCH_STORE_PROPERTY:'BSE_AI_FILE_SEARCH_STORE'};vm.createContext(ctx);
for(const file of ['SiteBNotePocArchive.js','PilotAskKbPoC.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),ctx);
test('full uploaded DOCX extracted as immutable source snapshot',()=>{
 assert(ctx.BSE_SITE_B_NOTE_POC_TEXT.length>27000);
 assert.match(ctx.BSE_SITE_B_NOTE_POC_TEXT,/2,808 polybag/);
 assert.match(ctx.BSE_SITE_B_NOTE_POC_TEXT,/M5P3/);
});
test('specific Site B question injects grounded snippets not full 32k text',()=>{
 const x=ctx.bsePilotAskKbNoteContext_('berapa polybag satu plot standard?');
 assert.match(x,/Nota Induk BSE Site B/);assert.match(x,/2,808/);
 assert(x.length>60&&x.length<8000);
});
test('DOA and IRAC manifests are IDs not invented substantive pesticide facts',()=>{
 const a=ctx.bsePilotAskKbManifestContext_('kumpulan IRAC abamectin');
 assert.match(a,/1ED2v4Wu31DKBaeL5DoHkoVjgxG_TlVsB5VwMuWQPE2Y/);
 assert.doesNotMatch(a,/approved registered by SISMARP/i);
 const b=ctx.bsePilotAskKbManifestContext_('SISMARP peria');
 assert.match(b,/1PLNRvOWnSuzQlcC0L8_DvpGyzZdRzjVm7ZMOTS14gf0/);
 const status=ctx.bsePilotAskKbStatusTest();
 assert.equal(status.existing_file_search_configured,true);
 assert.equal(status.production_write,false);
});
test('existing /ask generic fallback preserved when no note keywords found',()=>{
 const x=ctx.bsePilotAskKbNoteContext_('xyzzy quux bizarre');
 assert.equal(x,'');
 const ai=fs.readFileSync(__dirname+'/TelegramAiTest.js','utf8');
 assert.match(ai,/bsePilotKbStructuredAnswer_\(book,question\)\|\|bsePilotSiteBFaq_\(book,question\)/);
 assert.match(ai,/bseAiGeminiAnswer_\(question,currentSismarp,iracGrounded\)/);
 assert.match(ai,/question\+currentContext\+iracContext\+sitePocContext\+archivePocContext/);
});
