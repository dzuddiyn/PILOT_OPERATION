'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let env='PILOT_OPERATION',menuWrites=0;
const context={
 bseRuntimeEnvironmentName_:()=>env,
 bseRuntimeBotUsername_:()=> 'synthetic_bot',
 bseRuntimeEnvironmentLabel_:()=>env,
 bseTelegramApi_:(command,args)=>{
  if(command==='getMe')return {username:'synthetic_bot'};
  if(command==='setMyCommands'){menuWrites++;context.published=args.commands;return true}
  if(command==='getMyCommands')return context.published;
  throw Error('UNEXPECTED_TELEGRAM_CALL_'+command);
 },
 PropertiesService:{getScriptProperties:()=>({getProperty:()=>env})},
 Utilities:{formatDate:(date,tz,format)=>date.toISOString().slice(0,10)},
 console
};
vm.createContext(context);
for(const file of ['TelegramHistoryTest.js','TelegramEcHistoryTest.js','TelegramCommandTest.js']){
 vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),context,{filename:file});
}
let passes=0;const ok=(name,fn)=>{fn();console.log('PASS '+name);passes++};
const parse=v=>context.bseTelegramEcHistoryCommand_(v,new Date('2026-10-21T12:00:00Z'));
ok('PILOT /ec day and month reuse original read-only period parser',()=>{
 assert.equal(parse('/ec 2026-10-15').kind,'DAY');
 assert.equal(parse('/ec 2026-10-15').period,'2026-10-15');
 assert.equal(parse('/ec 2026-10').kind,'MONTH');
 assert.equal(parse('/EC 2026-10').period,'2026-10');
});
ok('PILOT /ec week and invalid dates preserve existing validation',()=>{
 assert.equal(parse('/ec week 2 2026-10').kind,'WEEK');
 assert.equal(parse('/ec week last').kind,'WEEK');
 assert.equal(parse('/ec 2026-02-30').reason,'DATE');
 assert.equal(parse('/ec bogus').reason,'FORMAT');
});
ok('PILOT /ec with no arguments reaches existing help path',()=>{
 assert.equal(parse('/ec').invalid,true);
 assert.equal(parse('/ec').reason,'FORMAT');
 const help=context.bsePilotEcHistoryHelp_();
 assert.match(help,/\/ec 2026-10-15/);
 assert.match(help,/\/ec 2026-10/);
 assert.match(help,/\/ec week last/);
 assert.doesNotMatch(help,/\/ec_history/);
});
ok('PILOT old command and lookalike commands are not routed',()=>{
 for(const x of ['/ec_history 2026-10','/ecology','/ec2 2026-10','/history 2026-10','abc /ec 2026-10']){
  assert.equal(parse(x),null,x);
 }
});
ok('PILOT command menu contains /ec and not /ec_history',()=>{
 const menu=context.bsePilotTelegramCommandMenu_();
 assert.equal(menu.length,11);
 assert.equal(menu.filter(x=>x.command==='ec').length,1);
 assert(!menu.some(x=>x.command==='ec_history'));
 assert.match(menu.find(x=>x.command==='ec').description,/EC_IN/);
});
ok('PILOT command menu installer uses verified Telegram getMe and readback',()=>{
 const result=context.configureBseTelegramTestCommands();
 assert.equal(menuWrites,1);
 assert.deepEqual(Array.from(result.commands,x=>x.command),Array.from(context.bsePilotTelegramCommandMenu_(),x=>x.command));
});
ok('TEST retains /ec_history parser and original menu command',()=>{
 env='TEST';
 assert.equal(parse('/ec_history 2026-10').kind,'MONTH');
 assert.equal(parse('/ec 2026-10'),null);
 assert(context.bsePilotTelegramCommandMenu_().some(x=>x.command==='ec_history'));
 assert(!context.bsePilotTelegramCommandMenu_().some(x=>x.command==='ec'));
});
ok('PILOT_TEST retains /ec_history parser and original menu command',()=>{
 env='PILOT_TEST';
 assert.equal(parse('/ec_history 2026-10-15').kind,'DAY');
 assert.equal(parse('/ec 2026-10-15'),null);
 assert(context.bsePilotTelegramCommandMenu_().some(x=>x.command==='ec_history'));
});
ok('the queue keeps the guarded EC history route and existing access checks',()=>{
 const queue=fs.readFileSync(__dirname+'/TelegramQueueTest.js','utf8');
 const ec=fs.readFileSync(__dirname+'/TelegramEcHistoryTest.js','utf8');
 assert(queue.includes('bseTelegramEcHistoryCommand_(m&&m.text)'));
 assert(ec.includes('bseTelegramHistoryAccess_(book,m)'));
 assert(ec.includes('production_write:false'));
});
ok('no Telegram menu write happened except explicit synthetic test invocation',()=>{
 assert.equal(menuWrites,1);
});
console.log('GATE_I_EC_COMMAND_RENAME '+passes+'/'+passes+' PASS');
