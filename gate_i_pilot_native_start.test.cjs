'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const envSource=fs.readFileSync(__dirname+'/EnvironmentTest.js','utf8');
const regSource=fs.readFileSync(__dirname+'/TelegramRegistrationTest.js','utf8');
let env='PILOT_OPERATION',n=0;
const ctx={console,PropertiesService:{getScriptProperties:()=>({getProperty:()=>''})}};
vm.createContext(ctx);vm.runInContext(envSource,ctx);
ctx.bseRuntimeEnvironmentName_=()=>env;
ctx.bseRuntimeBotUsername_=()=> 'bse_opsmate_bot';
ctx.bseRuntimeStartToken_=()=> env==='PILOT_OPERATION'?'OpsMate':'BSE_TEST';
function check(label,fn){fn();n++;console.log('PASS '+label)}
check('PILOT native Start from Telegram matches',()=>{env='PILOT_OPERATION';assert.equal(ctx.bseRuntimeStartCommandMatches_('/start'),true)});
check('PILOT mention-specific Start for exact bot matches',()=>assert.equal(ctx.bseRuntimeStartCommandMatches_('/start@bse_opsmate_bot'),true));
check('PILOT requires /start OpsMate',()=>{assert.equal(ctx.bseRuntimeStartCommandMatches_('/start OpsMate'),true);assert.equal(ctx.bseRuntimeStartCommandMatches_('/start BSE_PILOT'),false);assert(envSource.includes("startToken: 'OpsMate'"));});
check('wrong bot and arbitrary extra start argument denied',()=>{assert.equal(ctx.bseRuntimeStartCommandMatches_('/start@another_bot'),false);assert.equal(ctx.bseRuntimeStartCommandMatches_('/start bogus'),false)});
check('PILOT_TEST and TEST still require their own token',()=>{env='PILOT_TEST';assert.equal(ctx.bseRuntimeStartCommandMatches_('/start'),false);env='TEST';assert.equal(ctx.bseRuntimeStartCommandMatches_('/start'),false)});
check('registration remains human-owner gated',()=>{
 assert(regSource.includes("'REGISTRATION_PENDING'"));
 assert(regSource.includes("'REGISTERED_ACTIVE'"));
 assert(regSource.includes("bseTelegramRegistrationEnsureOwnerCards_"));
 assert(/match\[2\]==='A'/.test(regSource));
 const prod=regSource.slice(regSource.indexOf('function bseTelegramRegistrationHandleStart_('),regSource.indexOf('function runBseTelegramRegistrationHarnessTests()'));
 assert(!/addChatMember|inviteChatMember/.test(prod));
});
check('PILOT Start requires exact private Telegram sender/chat identity',()=>{
 const prod=regSource.slice(regSource.indexOf('function bseTelegramRegistrationIsPrivateMessage_('),regSource.indexOf('function bseTelegramRegistrationKnownPrivateChat_('));
 assert(prod.includes("message.chat.type==='private'"));
 assert(prod.includes('user.id===user.chatId'));
});
console.log('GATE_I_PILOT_NATIVE_START '+n+'/'+n+' PASS');
