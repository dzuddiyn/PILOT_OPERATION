'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'TelegramAiTest.js'),'utf8');
let env='PILOT_OPERATION',count=0;
const ctx={bseRuntimeEnvironmentName_:()=>env};
vm.createContext(ctx);
vm.runInContext(source,ctx,{filename:'TelegramAiTest.js'});
const check=(name,test)=>{test();count++;console.log('PASS '+name);};
check('PILOT /ask is native harness expectation, /ask_ai rejected',()=>{
  assert.equal(ctx.bseTelegramAiHarnessCommandParity_(),true);
  assert.equal(ctx.bseTelegramAiCommand_('/ask pelan banci?'),true);
  assert.equal(ctx.bseTelegramAiCommand_('/ask_ai pelan banci?'),false);
});
check('TEST /ask_ai retained without /ask',()=>{
  env='TEST';assert.equal(ctx.bseTelegramAiHarnessCommandParity_(),true);
  assert.equal(ctx.bseTelegramAiCommand_('/ask_ai how to?'),true);
  assert.equal(ctx.bseTelegramAiCommand_('/ask how to?'),false);
});
check('PILOT_TEST /ask_ai retained without /ask',()=>{
  env='PILOT_TEST';assert.equal(ctx.bseTelegramAiHarnessCommandParity_(),true);
  assert.equal(ctx.bseTelegramAiCommand_('/ask_ai how to?'),true);
  assert.equal(ctx.bseTelegramAiCommand_('/ask how to?'),false);
});
check('real native harness delegates to the tested environment guard',()=>{
  const fn=ctx.runBseTelegramAiHarnessTests.toString();
  assert(fn.includes("environment-specific AI command parser accepts free-form question"));
  assert(fn.includes('pass:bseTelegramAiHarnessCommandParity_()'));
  assert(!fn.includes("pass:bseTelegramAiCommand_('/ask_ai"));
});
check('question extraction is strict and environment-matched',()=>{
  env='PILOT_OPERATION';
  assert.equal(ctx.bseTelegramAiQuestion_('/ask kumpulan IRAC?'),'kumpulan IRAC?');
  env='TEST';assert.equal(ctx.bseTelegramAiQuestion_('/ask_ai kumpulan IRAC?'),'kumpulan IRAC?');
});
check('the change has no telegram, Sheet, property, or production writes',()=>{
  const guard=ctx.bseTelegramAiHarnessCommandParity_.toString();
  assert(!/bseTelegramApi_|sendMessage|appendRow|setValue|setValues|deleteMessage|ScriptApp|production_write/.test(guard));
});
console.log('GI_PR151_AI_HARNESS_ENV_PARITY '+count+'/'+count+' PASS');
