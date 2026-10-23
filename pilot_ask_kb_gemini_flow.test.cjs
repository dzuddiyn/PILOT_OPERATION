'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const ctx={Date,JSON,String,Set,Math,Number,Array,encodeURIComponent,Error,bseRuntimeEnvironmentName_:()=> 'PILOT_OPERATION',
 BSE_AI_FILE_SEARCH_STORE_PROPERTY:'BSE_AI_FILE_SEARCH_STORE',
 PropertiesService:{getScriptProperties:()=>({getProperty:key=>({
  GEMINI_API_KEY:'synthetic-test-token',GEMINI_AI_MODEL:'gemini-model-fixture',
  BSE_AI_FILE_SEARCH_STORE:'fileSearchStores/existing-test-store'}[key]||'')})},
 bseAiIracQuestion_:()=>false,bseAiExtractText_:()=> 'Jawapan diuji',
 bseAiGroundingDetails_:()=>[],bseTelegramAiSystemPrompt_:x=>'Prompt '+x,
 UrlFetchApp:{fetch:(url,options)=>{ctx.lastPayload=JSON.parse(options.payload);return {getResponseCode:()=>200,getContentText:()=>JSON.stringify({candidates:[{content:{parts:[{text:'Jawapan diuji'}]}}]})};}},
 Utilities:{sleep:()=>{}}};
vm.createContext(ctx);
for(const file of ['SiteBNotePocArchive.js','PilotAskKbPoC.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),ctx);
const text=fs.readFileSync(__dirname+'/TelegramAiTest.js','utf8'),start=text.indexOf('function bseAiGeminiAnswer_('),end=text.indexOf('function bseTelegramAiRender_(',start);
vm.runInContext(text.slice(start,end),ctx);
test('actual answer function sends grounded note excerpts and uses existing FileSearch',()=>{
 const result=ctx.bseAiGeminiAnswer_('berapa polybag plot standard?',null,null);
 const prompt=ctx.lastPayload.contents[0].parts[0].text;
 assert.match(prompt,/KB_SITE_B_EXTRACT/);assert.match(prompt,/2,808/);
 assert.equal(ctx.lastPayload.tools[0].fileSearch.fileSearchStoreNames[0],'fileSearchStores/existing-test-store');
 assert(result.sources.includes('Nota Induk BSE Site B (10/09/2026)'));
 assert.equal(result.kb_used,true);
});
test('unrelated question does not inject irrelevant Site B archive and preserves general answer',()=>{
 const result=ctx.bseAiGeminiAnswer_('xyzzy quux bizarre',null,null);
 assert.doesNotMatch(ctx.lastPayload.contents[0].parts[0].text,/KB_SITE_B_EXTRACT/);
 assert.equal(result.text,'Jawapan diuji');
});
