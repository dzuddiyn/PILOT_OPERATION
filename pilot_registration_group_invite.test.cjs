'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(__dirname+'/TelegramRegistrationTest.js','utf8');const begin=src.indexOf('function bsePilotRegistrationAcceptanceText_('),end=src.indexOf('function bseTelegramRegistrationCallback_(',begin);assert(begin>=0&&end>begin);
let env='PILOT_OPERATION',chat={id:-5371595602,type:'group',invite_link:'https://t.me/+ValidInviteExample_123'},count=0,requestId='';
const c={bseRuntimeEnvironmentName_:()=>env,bseTelegramTestApprovalGroupIds_:()=>['-5371595602'],bseTelegramApi_:(method,arg)=>{count++;assert.equal(method,'getChat');requestId=String(arg.chat_id);return chat},bseTelegramSafeErrorDescription_:x=>x,console:{log:()=>{}}};vm.createContext(c);vm.runInContext(src.slice(begin,end),c);
let n=0;function test(label,f){f();n++;console.log('PASS '+label)}
test('approved user gets exact Telegram group invite from getChat',()=>{const x=c.bsePilotRegistrationAcceptanceText_(true,'-5371595602');assert(x.includes('https://t.me/+ValidInviteExample_123'));assert.equal(requestId,'-5371595602')});
test('rejected user never queries or receives invite',()=>{count=0;const x=c.bsePilotRegistrationAcceptanceText_(false,'-5371595602');assert.equal(count,0);assert(!x.includes('t.me'))});
test('unapproved group ID never requested or leaked',()=>{count=0;const x=c.bsePilotRegistrationAcceptanceText_(true,'-999');assert.equal(count,0);assert(!x.includes('t.me'))});
test('mismatched group identity fails closed',()=>{chat={id:-12345,type:'group',invite_link:'https://t.me/+WrongGroup'};assert(!c.bsePilotRegistrationAcceptanceText_(true,'-5371595602').includes('WrongGroup'))});
test('invalid invite URL fails closed',()=>{chat={id:-5371595602,type:'group',invite_link:'https://example.org/hijack'};assert(!c.bsePilotRegistrationAcceptanceText_(true,'-5371595602').includes('example.org'))});
test('public group name accepted only from actual Telegram group',()=>{chat={id:-5371595602,type:'supergroup',username:'OpsMateGroup'};assert(c.bsePilotRegistrationAcceptanceText_(true,'-5371595602').includes('https://t.me/OpsMateGroup'))});
test('no invite available gives honest owner fallback',()=>{chat={id:-5371595602,type:'group'};assert(c.bsePilotRegistrationAcceptanceText_(true,'-5371595602').includes('hubungi owner/admin'))});
test('legacy TEST contract unchanged',()=>{env='TEST';assert(c.bsePilotRegistrationAcceptanceText_(true,'-5371595602').includes('Pendaftaran TEST'))});
console.log('REGISTRATION_GROUP_INVITE '+n+'/'+n+' PASS');
