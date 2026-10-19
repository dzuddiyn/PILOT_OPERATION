'use strict';const fs=require('fs'),vm=require('vm'),assert=require('assert');const s=fs.readFileSync(__dirname+'/TelegramQueueTest.js','utf8');const start=s.indexOf('function bseTelegramServiceMessage_('),end=s.indexOf('function bseTelegramPrivateCommandReply_(',start);const ctx={};vm.createContext(ctx);vm.runInContext(s.slice(start,end),ctx);let n=0;const check=(label,fn)=>{fn();n++;console.log('PASS '+label)};
check('new member service event ignored',()=>assert(ctx.bseTelegramServiceMessage_({new_chat_members:[{id:123}]})));
check('left member ignored',()=>assert(ctx.bseTelegramServiceMessage_({left_chat_member:{id:123}})));
check('pin/title topic changes ignored',()=>{for(const x of [{pinned_message:{}},{new_chat_title:'Group'},{forum_topic_created:{name:'Ops'}}])assert(ctx.bseTelegramServiceMessage_(x))});
check('real photo remains eligible for media handler',()=>assert(!ctx.bseTelegramServiceMessage_({photo:[{file_id:'FAKE'}],caption:'Pam rosak M2P2'})));
check('real text remains eligible for report handler',()=>assert(!ctx.bseTelegramServiceMessage_({text:'Pam rosak M2P2'})));
check('receiver skips only after advancing offset',()=>{assert(s.includes("if(bseTelegramServiceMessage_(m)){props.setProperty('BSE_TELEGRAM_OFFSET',String(update.update_id+1));continue;}"))});
console.log('SERVICE_EVENT_GUARD '+n+'/'+n+' PASS');