'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const root=__dirname, ctx=vm.createContext({console,Date,JSON,String,Number,Math,
 SpreadsheetApp:{flush:()=>{}},LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},
 BSE_TG_HISTORY_MAX_DISPLAY:10, bseTestOwnerForTelegramUser_:(_,id)=>({ok:true,private_chat_id:String(id),owner_id:'legacy',telegram_user_id:String(id)}),
 bseEnsureAdditiveHeaders_:()=>{}, bseTelegramApi_:()=>{throw Error('TEST_ONLY_NO_TRAFFIC')}
});
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
for(const name of ['PilotRoleContract.js','PilotRoleResolver.js','PilotRoleLegacyCallsiteAdapter.js','PilotRoleLegacyControllerBridge.js'])
 vm.runInContext(read(name),ctx,{filename:name});
const event={event_id:'evt-1',operation_id:'op-1',target:'200',actor:'100',action:'GRANT_ADMIN',revision:1,previous_hash:'',state:'COMMITTED'};
const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
event.digest=sha256(JSON.stringify([event.event_id,event.operation_id,event.target,event.actor,event.action,event.revision,event.previous_hash]));
let availability=true,readCount=0,auditRows=[],reportReads=0;
ctx.bseRoleTrustedAdaptersForBook_=()=>availability?{
 sourceAuthenticated:true,readBootstrapOwner:()=>({user_id:'100',verified:true}),
 readRegistration:id=>['200','300'].includes(String(id))?'REGISTERED_ACTIVE':'INACTIVE',
 readLedger:()=>{readCount++;return [event]},readBarriers:()=>[],sha256
}:null;
const msg=id=>({from:{id},chat:{id,type:'private'},text:'/report 2026-10'});
let n=0;function test(label,fn){fn();n++;console.log('PASS '+label);}
test('all four redefined ApprovalEnsureCard functions gated',()=>{
 const source=read('TelegramApprovalUiTest.js');
 const declarations=[...source.matchAll(/function bseTelegramApprovalEnsureCard_\(book,queueRow\)\{/g)];
 assert.equal(declarations.length,4);
 for(const m of declarations)assert(source.slice(m.index,m.index+420).includes("bseRoleControllerCapability_('TelegramApprovalUiTest.js:bseTelegramApprovalEnsureCard_'"));
});
test('real registration private access cannot elevate MEMBER via forged legacy owner.ok',()=>{
 vm.runInContext(read('TelegramRegistrationTest.js'),ctx,{filename:'TelegramRegistrationTest.js'});
 ctx.bseTelegramRegistrationSheet_=()=>({});
 ctx.bseTelegramRegistrationRows_=()=>[['300','300','REGISTERED_ACTIVE'],['200','200','REGISTERED_ACTIVE']];
 assert.equal(ctx.bseTelegramRegistrationPrivateAccess_({},msg('300')).status,'REGISTERED_ACTIVE');
 assert.equal(ctx.bseTelegramRegistrationPrivateAccess_({},msg('200')).status,'OWNER_ACTIVE');
 assert.equal(ctx.bseTelegramRegistrationPrivateAccess_({},msg('100')).status,'OWNER_ACTIVE');
});
test('registration auth fails closed on source outage, retains only member rights',()=>{
 availability=false;assert.equal(ctx.bseTelegramRegistrationPrivateAccess_({},msg('300')).status,'REGISTERED_ACTIVE');
 assert.equal(ctx.bseTelegramRegistrationPrivateAccess_({},msg('200')).status,'REGISTERED_ACTIVE');availability=true;
});
test('actual history access: OWNER and ADMIN elevated; MEMBER restricted',()=>{
 vm.runInContext(read('TelegramHistoryTest.js'),ctx,{filename:'TelegramHistoryTest.js'});
 assert.equal(ctx.bseTelegramHistoryAccess_({},msg('100')).is_owner,true);
 assert.equal(ctx.bseTelegramHistoryAccess_({},msg('200')).is_owner,true);
 assert.equal(ctx.bseTelegramHistoryAccess_({},msg('300')).is_owner,false);
});
test('real report controller allows OWNER and ADMIN but denies MEMBER even if legacy owner.ok',()=>{
 vm.runInContext(read('TelegramReportTest.js'),ctx,{filename:'TelegramReportTest.js'});
 ctx.bseTelegramReportCommand_=()=>({period:'2026-10'});
 ctx.bseTelegramReportAudit_=()=>({appendRow:r=>auditRows.push(r)});
 ctx.bseTelegramReportCanonicalEvents_=()=>{reportReads++;return []};
 ctx.bseTelegramReportGeminiCommentary_=()=>({ok:false,reason:'TEST_ONLY'});
 assert.equal(ctx.bseTelegramReportRetrieve_({},msg('100')).handled,true);
 assert.equal(ctx.bseTelegramReportRetrieve_({},msg('200')).handled,true);
 const before=reportReads,denied=ctx.bseTelegramReportRetrieve_({},msg('300'));
 assert(denied.text.includes('owner/admin'));assert.equal(reportReads,before);
});
test('report fails closed on unavailable canonical adapter',()=>{
 const before=reportReads;availability=false;
 assert(ctx.bseTelegramReportRetrieve_({},msg('200')).text.includes('owner/admin'));
 assert.equal(reportReads,before);availability=true;
});
test('no literal legacy-only owner bypass remains in modified report gate',()=>{
 const source=read('TelegramReportTest.js');
 assert(source.includes("bseRoleControllerCapability_('TelegramReportTest.js:bseTelegramReportRetrieve_'"));
 assert(!source.includes("||!owner.ok||String(owner.private_chat_id)!==chat"));
});
test('registration ADMIN cannot alter OWNER identity or assign ADMIN',()=>{
 const adapters=ctx.bseRoleTrustedAdaptersForBook_({});
 assert.equal(ctx.bseRoleResolve_('200','manage_admins',adapters).allowed,false);
 assert.equal(ctx.bseRoleResolve_('200','mutate_owner',adapters).allowed,false);
 assert.equal(ctx.bseRoleResolve_('200','registration_decision',adapters).allowed,true);
});
test('actual registration callback denies forged MEMBER even when legacy owner lookup says ok',()=>{
 const row=Array(8).fill('');row[0]='ABCD1234';row[3]='300';row[4]='300';row[5]='OPEN';
 ctx.boundTestBook_=()=>({});
 ctx.bseTelegramRegistrationCardSheet_=()=>({getLastRow:()=>2,getRange:()=>({getValues:()=>[row]})});
 const reply=ctx.bseTelegramRegistrationCallback_({data:'R1:ABCD1234:A',from:{id:'300'},message:{chat:{id:'300',type:'private'}}});
 assert.equal(reply.authorized,false);
});
test('actual ApprovalEnsureCard refuses MEMBER before any sheet read/write',()=>{
 vm.runInContext(read('TelegramApprovalUiTest.js'),ctx,{filename:'TelegramApprovalUiTest.js'});
 const queue=Array(17).fill('');queue[0]='test-only';queue[1]='-200';queue[2]='300';
 assert.equal(ctx.bseTelegramApprovalEnsureCard_({},queue).skipped,'CANONICAL_DENIED');
});
test('actual /delete controller refuses forged MEMBER despite owner.ok',()=>{
 ctx.bseTelegramDeleteCommand_=()=>({reference:'BSE-TG-TEST_ONLY',reason:'test'});
 const result=ctx.bseTelegramDeleteReceiveCommand_({}, {text:'/delete TEST_ONLY',from:{id:'300'},chat:{id:'300',type:'private'}});
 assert.equal(result.handled,true);assert(result.text.includes('owner/admin'));
});
console.log('RBAC_LEGACY_CONTROLLER_WIRING '+n+'/11 LOCAL PASS');
assert.equal(n,11);
