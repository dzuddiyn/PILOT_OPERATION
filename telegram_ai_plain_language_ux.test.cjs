const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'TelegramAiTest.js'),'utf8');
test('AI banner uses ordinary-language safety without internal label',()=>{
 const from=source.indexOf('function bseTelegramAiRender_('), to=source.indexOf('function bseTelegramAiToHtml_(',from);
 const ctx={};vm.createContext(ctx);vm.runInContext(source.slice(from,to),ctx);
 const response=ctx.bseTelegramAiRender_({text:'Maklumat umum',sources:[]});
 assert.match(response,/Pembantu AI.*Panduan sahaja/);
 assert.doesNotMatch(response,/NON_CANONICAL|PILOT_TEST/);
 assert.match(response,/Bukan rekod, approval atau arahan operasi BSE/);
});
test('AI system prompt does not claim PILOT_TEST or obsolete /ask_ai',()=>{
 const from=source.indexOf('function bseTelegramAiSystemPrompt_('),to=source.indexOf('function bseAiExtractText_(',from);
 const ctx={};vm.createContext(ctx);vm.runInContext(source.slice(from,to),ctx);
 const prompt=ctx.bseTelegramAiSystemPrompt_(true);
 assert.doesNotMatch(prompt,/dalam mod PILOT_TEST|\/ask_ai/);
 assert.match(prompt,/NON_CANONICAL/);
 assert.match(prompt,/File Search/);
});
