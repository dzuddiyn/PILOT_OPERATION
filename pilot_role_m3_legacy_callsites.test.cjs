'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const c=vm.createContext({});
for(const file of ['PilotRoleContract.js','PilotRoleResolver.js','PilotRoleLegacyCallsiteAdapter.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),c);
const policies=vm.runInContext('BSE_RBAC_LEGACY_SITES',c);
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const grant={event_id:'event-1',operation_id:'op-1',actor:'100',target:'200',action:'GRANT_ADMIN',revision:1,previous_hash:'',state:'COMMITTED'};
grant.digest=sha(JSON.stringify([grant.event_id,grant.operation_id,grant.target,grant.actor,grant.action,grant.revision,grant.previous_hash]));
function adapters(extra={}){return {sourceAuthenticated:true,readBootstrapOwner:()=>({user_id:'100',verified:true}),readRegistration:()=> 'REGISTERED_ACTIVE',readLedger:()=>[grant],readBarriers:()=>[],sha256:sha,...extra};}
function check(site,actor,api=adapters(),chatType='private',chat=actor){return c.bseRoleLegacySiteAuthorize_(site,actor,chat,chatType,api);}
let checks=0;function test(label,fn){fn();checks++;console.log('PASS '+label);}
test('explicit mapping covers ALL legacy auth lookup callers in actual source',()=>{
  const names=Object.keys(policies);assert.equal(names.length,19);const recorded=new Set();
  for(const file of fs.readdirSync(__dirname).filter(x=>x.endsWith('.js')&&!x.startsWith('PilotRole'))){
    if(file==='OwnerRegistryTest.js')continue; // authority reader itself, not a caller to be promoted
    const source=fs.readFileSync(path.join(__dirname,file),'utf8');
    const fn=[...source.matchAll(/function\s+([A-Za-z_]\w*)\s*\(/g)];
    for(const m of source.matchAll(/bseTestOwnerForTelegramUser_\s*\(|bseTelegramRegistrationPrivateAccess_\s*\(|bseRoleController(?:Capability|Elevated)_\s*\(/g)){
      let name=null;for(const f of fn){if(f.index<m.index)name=f[1];else break;}
      if(name&&/^runBse.*HarnessTests$/.test(name))continue;
      const key=file+':'+name;assert.ok(policies[key],'UNMAPPED: '+key);recorded.add(key);
    }
  }
  assert.equal(recorded.size,names.length,'Stale or unmapped function inventory');
  for(const name of names)assert.ok(recorded.has(name),'UNUSED_MAPPING: '+name);
});
test('ADMIN allowed for all mapped operational privileged paths',()=>{
 let n=0;for(const [key,policy] of Object.entries(policies)){
  const result=check(key,'200');
  if(policy.kind==='bootstrap_only'){assert.equal(result.allowed,false,key);continue;}
  assert.equal(result.allowed,true,key+' '+result.reason);assert.equal(result.role,'ADMIN');n++;
 }assert.ok(n>=18);
});
test('OWNER still allowed for privileged and bootstrap-only paths',()=>{
 for(const key of Object.keys(policies))assert.equal(check(key,'100').allowed,true,key);
});
test('REGISTERED_ACTIVE member permitted ordinary paths, denied elevated and mixed bypass',()=>{
 for(const [key,policy] of Object.entries(policies)){
  const result=check(key,'300');
  if(policy.kind==='ordinary')assert.equal(result.allowed,true,key);
  else assert.equal(result.allowed,false,key);
 }
});
test('ADMIN cannot manage ADMIN nor mutate OWNER',()=>{
 const a=adapters();assert.equal(c.bseRoleResolve_('200','manage_admins',a).allowed,false);
 assert.equal(c.bseRoleResolve_('200','mutate_owner',a).allowed,false);
 assert.equal(c.bseRoleResolve_('100','manage_admins',a).allowed,true);
});
test('legacy owner.ok/is_admin cannot override missing canonical authority',()=>{
 const a=adapters({readLedger:()=>{throw Error('NO_LEDGER')},legacyOwner:{ok:true,is_admin:true}});
 assert.equal(check('TelegramApprovalUiTest.js:bseTelegramDeleteReceiveCommand_','200',a).allowed,false);
});
test('revoke barrier blocks all ADMIN elevated capabilities',()=>{
 const a=adapters({readBarriers:()=>[{target:'200',active:true}]});
 assert.equal(check('TelegramApprovalUiTest.js:bseTelegramApprovalControllerCore_','200',a).allowed,false);
 assert.equal(check('TelegramRegistrationTest.js:bseTelegramRegistrationCallback_','200',a).allowed,false);
});
test('inactive registration blocks ADMIN and ordinary member',()=>{
 const a=adapters({readRegistration:()=> 'INACTIVE'});
 assert.equal(check('TelegramReportTest.js:bseTelegramReportRetrieve_','200',a).allowed,false);
 assert.equal(check('ImageActionTest.js:bseImageActionReceive_','300',a).allowed,false);
});
test('private-chat and source-authentication required for sensitive paths',()=>{
 const site='TelegramReportTest.js:bseTelegramReportRetrieve_';
 assert.equal(check(site,'200',adapters(),'group','500').allowed,false);
 assert.equal(check(site,'200',adapters(),'private','other').allowed,false);
 assert.equal(check(site,'200',adapters({sourceAuthenticated:false})).allowed,false);
});
test('fail-closed for unknown callsite and omitted adapters',()=>{
 assert.equal(check('unknown:file','200').allowed,false);
 assert.equal(check('TelegramReportTest.js:bseTelegramReportRetrieve_','200',null).allowed,false);
});
console.log('RBAC_LEGACY_CALLSITE '+checks+'/10 LOCAL PASS, '+Object.keys(policies).length+' mapped paths');
assert.equal(checks,10);
