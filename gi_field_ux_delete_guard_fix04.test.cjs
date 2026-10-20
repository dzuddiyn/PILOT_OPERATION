'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'TelegramApprovalUiTest.js'),'utf8');
const start=source.indexOf('function bseTelegramDeleteReceiveCommand_('),end=source.indexOf('function bseTelegramVoidInventoryRecord_(',start);
assert(start>=0&&end>start);
let writes=0;
const rows=[
 ['BSE-TG-772257418','BSE-TG-772257418|Inventory_Event_Log|C1'],
 ['BSE-TG-772257418','BSE-TG-772257418|Inventory_Event_Log|C2']
];
const ctx={bseTelegramDeleteCommand_:()=>({reference:'BSE-TG-772257418',reason:'salah rekod'}),bseTestOwnerForTelegramUser_:()=>({ok:true,private_chat_id:'77'}),bseTelegramApprovalSheet_:()=>({}),bseApprovalRows_:()=>rows,bseTelegramDeleteSheet_:()=>{writes++;throw Error('unexpected write path')}};
vm.createContext(ctx);vm.runInContext(source.slice(start,end),ctx);
test('ambiguous /delete reference fails closed before sheet writes or Telegram sends',()=>{
 const result=ctx.bseTelegramDeleteReceiveCommand_({}, {from:{id:77},chat:{id:77,type:'private'},text:'/delete BSE-TG-772257418'});
 assert.equal(result.handled,true);
 assert.match(result.text,/2 calon rekod/);
 assert.match(result.text,/tiada rekod diubah/);
 assert.equal(writes,0);
});
