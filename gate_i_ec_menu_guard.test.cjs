'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/TelegramEcMenuGuardTest.js','utf8');
let env='PILOT_OPERATION',expectedUsername='BSE_test_bot',username='BSE_test_bot',is_bot=true,writeCount=0,reads=[],menu=[],writeResult=true,tamperReadback=false,menuReadCount=0,preWriteTamper=false;
const calls=[];
const seed=()=>[
 {command:'start',description:'Daftar akses'},{command:'status',description:'Status plot'},
 {command:'ec_history',description:'Bacaan EC Leaching ikut hari/bulan/minggu'},
 {command:'delete',description:'Owner delete'}];
const setup=()=>{env='PILOT_OPERATION';expectedUsername='BSE_test_bot';username='BSE_test_bot';is_bot=true;writeCount=0;reads=[];calls.length=0;menu=seed();writeResult=true;tamperReadback=false;menuReadCount=0;preWriteTamper=false;};
const ctx={
 bseRuntimeEnvironmentName_:()=>env,bseRuntimeBotUsername_:()=>expectedUsername,
 bseTelegramApi_:(method,payload)=>{
  calls.push(method);
  if(method==='getMe')return {username,is_bot};
  if(method==='getMyCommands'){menuReadCount++;return (tamperReadback&&writeCount>0)||(preWriteTamper&&menuReadCount===2)?[{command:'wrong',description:'drift'}]:menu.map(x=>({...x}));}
  if(method==='setMyCommands'){
   writeCount++;
   if(writeResult===true)menu=payload.commands.map(x=>({...x}));
   return writeResult;
  }
  throw Error('UNEXPECTED_API '+method);
 },
 console:{log:(s)=>reads.push(s)}
};
vm.createContext(ctx);vm.runInContext(source,ctx);
const check=(name,fn)=>{setup();fn();process.stdout.write('PASS '+name+'\n');};
check('READ-ONLY inspect gets real menu without writes',()=>{
 const x=ctx.inspectBsePilotEcMenu();
 assert.equal(x.command_count,4);assert.equal(x.bot_username,'BSE_test_bot');
 assert.equal(x.commands[2].command,'ec_history');
 assert.equal(writeCount,0);assert.deepEqual(calls,['getMe','getMyCommands']);
 assert.match(reads[0],/^GI_EC_MENU_PREWRITE_READ_ONLY /);
});
check('PILOT guard rejects TEST before contacting bot',()=>{
 env='TEST';assert.throws(()=>ctx.inspectBsePilotEcMenu(),/ENVIRONMENT_MISMATCH/);
 assert.deepEqual(calls,[]);
});
check('identity mismatch fails closed before menu read',()=>{
 username='other_bot';assert.throws(()=>ctx.inspectBsePilotEcMenu(),/BOT_IDENTITY_MISMATCH/);
 assert.deepEqual(calls,['getMe']);
});
check('not a bot fails closed',()=>{
 is_bot=false;assert.throws(()=>ctx.inspectBsePilotEcMenu(),/BOT_IDENTITY_MISMATCH/);
 assert.equal(writeCount,0);
});
check('duplicate menu command fails closed',()=>{
 menu=[seed()[0],seed()[0]];assert.throws(()=>ctx.inspectBsePilotEcMenu(),/INVALID_OR_DUPLICATE/);
 assert.equal(writeCount,0);
});
check('invalid command or empty description fails closed',()=>{
 menu=[{command:'bad command',description:'x'}];assert.throws(()=>ctx.inspectBsePilotEcMenu(),/INVALID_OR_DUPLICATE/);
 menu=[{command:'ec_history',description:'  '}];assert.throws(()=>ctx.inspectBsePilotEcMenu(),/INVALID_OR_DUPLICATE/);
 assert.equal(writeCount,0);
});
check('rename changes ONLY old command name, keeps every other entry and description',()=>{
 const before=JSON.parse(JSON.stringify(menu));
 const result=ctx.updateBsePilotEcMenu();
 assert.equal(result.status,'VERIFIED');assert.equal(result.writes,1);
 assert.equal(writeCount,1);assert.equal(menu[2].command,'ec');
 assert.equal(menu[2].description,before[2].description);
 for(const idx of [0,1,3])assert.deepEqual(menu[idx],before[idx]);
 assert.deepEqual(calls,['getMe','getMyCommands','getMyCommands','setMyCommands','getMyCommands']);
 assert.match(reads[0],/^GI_EC_MENU_PREWRITE_SNAPSHOT /);
 assert.match(reads[1],/^GI_EC_MENU_UPDATED_AND_VERIFIED /);
});
check('repeat operation idempotent after rename, no second write',()=>{
 ctx.updateBsePilotEcMenu();
 const prior=writeCount;const result=ctx.updateBsePilotEcMenu();
 assert.equal(result.status,'ALREADY_APPLIED');assert.equal(writeCount,prior);
});
check('already applied initially makes no write',()=>{
 menu=seed().map(x=>({...x,command:x.command==='ec_history'?'ec':x.command}));
 const x=ctx.updateBsePilotEcMenu();assert.equal(x.status,'ALREADY_APPLIED');
 assert.equal(writeCount,0);
});
check('empty menu no silent replacement',()=>{
 menu=[];assert.throws(()=>ctx.updateBsePilotEcMenu(),/RENAME_PRECONDITION_FAILED/);
 assert.equal(writeCount,0);
});
check('both /ec and /ec_history cause hard stop before write',()=>{
 menu=[...seed(),{command:'ec',description:'Another'}];
 assert.throws(()=>ctx.updateBsePilotEcMenu(),/RENAME_PRECONDITION_FAILED/);
 assert.equal(writeCount,0);
});
check('pre-write remote menu drift stops before any Telegram WRITE',()=>{
 preWriteTamper=true;assert.throws(()=>ctx.updateBsePilotEcMenu(),/PREWRITE_REVISION_CONFLICT/);
 assert.equal(writeCount,0);assert.deepEqual(calls,['getMe','getMyCommands','getMyCommands']);
});
check('Telegram write rejected yields unknown/reconcile without blind retry',()=>{
 writeResult=false;assert.throws(()=>ctx.updateBsePilotEcMenu(),/OUTCOME_UNKNOWN/);
 assert.equal(writeCount,1);assert.equal(calls.filter(x=>x==='setMyCommands').length,1);
});
check('readback drift after accepted write requires reconciliation, no retry',()=>{
 tamperReadback=true;assert.throws(()=>ctx.updateBsePilotEcMenu(),/POSTWRITE_MISMATCH/);
 assert.equal(writeCount,1);assert.equal(calls.filter(x=>x==='setMyCommands').length,1);
});
check('does not send, delete, or mutate Telegram messages',()=>{
 ctx.updateBsePilotEcMenu();
 for(const cmd of calls)assert(['getMe','getMyCommands','setMyCommands'].includes(cmd));
 assert(!/getUpdates|sendMessage|deleteMessage|answerCallbackQuery|processBseTelegramTestQueue/.test(source));
});
console.log('GI_EC_MENU_GUARD 15/15 PASS');
