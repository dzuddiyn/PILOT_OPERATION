'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
let env='PILOT_OPERATION';const ctx={console,PropertiesService:{getScriptProperties:()=>({getProperty:()=>''})},bseTelegramPrivateOptInCommand_:text=>/^\/start(?:@bse_opsmate_bot)?$/i.test(text),bseRuntimeEnvironmentName_:()=>env,bseRuntimeBotUsername_:()=> 'bse_opsmate_bot'};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/TelegramRegistrationTest.js','utf8'),ctx,{filename:'TelegramRegistrationTest.js'});
let n=0;function check(label,fn){fn();n++;console.log('PASS '+label)}
const msg=(text,type='supergroup')=>({text,chat:{type,id:'-100123'},from:{id:200,first_name:'Sample'}});
check('PILOT /start in group gives safe PM deep link',()=>{const r=ctx.bsePilotRegistrationGroupStartHint_(msg('/start'),'bse_opsmate_bot');assert(r.handled);assert.equal(r.reply_markup.inline_keyboard[0][0].url,'https://t.me/bse_opsmate_bot');assert(r.text.includes('TERIMA/TOLAK'))});
check('mention-specific group /start offers same path',()=>assert(ctx.bsePilotRegistrationGroupStartHint_(msg('/start@bse_opsmate_bot'),'bse_opsmate_bot').handled));
check('random group text does not prompt registration',()=>assert(!ctx.bsePilotRegistrationGroupStartHint_(msg('pam rosak'),'bse_opsmate_bot').handled));
check('group start does not issue authorization',()=>{const code=ctx.bsePilotRegistrationGroupStartHint_.toString();assert(!code.includes('appendRow'));assert(!code.includes('REGISTERED_ACTIVE'))});
check('PILOT_TEST and TEST unchanged',()=>{env='PILOT_TEST';assert(!ctx.bsePilotRegistrationGroupStartHint_(msg('/start'),'bse_opsmate_bot').handled);env='TEST';assert(!ctx.bsePilotRegistrationGroupStartHint_(msg('/start'),'bse_opsmate_bot').handled)});
check('bot-origin or private messages excluded from group shortcut',()=>{env='PILOT_OPERATION';assert(!ctx.bsePilotRegistrationGroupStartHint_({...msg('/start'),from:{id:200,is_bot:true}},'bse_opsmate_bot').handled);assert(!ctx.bsePilotRegistrationGroupStartHint_(msg('/start','private'),'bse_opsmate_bot').handled)});
check('receiver links group Start hint ahead of private registration',()=>{const q=fs.readFileSync(__dirname+'/TelegramQueueTest.js','utf8');assert(q.includes("if(m&&allowedGroup&&typeof bsePilotRegistrationGroupStartHint_"));assert(q.indexOf("if(m&&allowedGroup&&typeof bsePilotRegistrationGroupStartHint_")<q.indexOf('else if(privateStart)'))});
check('PILOT owner registration card heading does not show TEST',()=>{const e=fs.readFileSync(__dirname+'/EnvironmentTest.js','utf8');vm.runInContext(e,ctx);const s=ctx.bseRuntimePilotUiLabels_('Pendaftaran ahli TEST baharu\\nNama: Contoh');assert(!s.includes('TEST'));assert(s.includes('Permohonan pendaftaran'))});
console.log('PILOT_GROUP_ONBOARD '+n+'/'+n+' PASS (no transport)');
