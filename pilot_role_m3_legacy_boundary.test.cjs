'use strict';const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(__dirname+'/PilotRoleLegacyBoundary.js','utf8'),ctx);
const run=(actor,capability,legacy,api)=>ctx.bseRoleLegacyCapability_(actor,capability,legacy,api);
let n=0;function t(name,fn){fn();n++;console.log('PASS '+name)}
t('F29 forged legacy owner.ok cannot manage role',()=>assert.equal(run('200','manage_admins',{ok:true},{resolveFresh:()=>({role:'ADMIN',allowed:false})}).allowed,false));
t('F29 admin with legacy owner.ok cannot manage role',()=>assert.equal(run('200','manage_admins',{ok:true},{resolveFresh:()=>({role:'ADMIN',allowed:true})}).allowed,false));
t('F15 legacy flag cannot override canonical denied',()=>assert.equal(run('200','ordinary',{ok:true,is_admin:true},{resolveFresh:()=>({role:'REGISTERED_ACTIVE',allowed:false})}).allowed,false));
t('missing authority cannot inherit owner.ok',()=>assert.equal(run('200','ordinary',{ok:true},{}).allowed,false));
t('stale cache denied on fresh revoke',()=>assert.equal(run('200','ordinary',{ok:true},{resolveFresh:()=>({role:'REGISTERED_ACTIVE',allowed:false})}).allowed,false));
t('OWNER role management accepted only with canonical fresh allow',()=>assert.equal(run('100','manage_admins',{ok:true},{resolveFresh:()=>({role:'OWNER',allowed:true})}).allowed,true));
t('ADMIN ordinary operation requires fresh recheck',()=>assert.equal(run('200','ordinary',{ok:true},{resolveFresh:()=>({role:'ADMIN',allowed:true}),privilegedAction:true}).allowed,false));
t('ADMIN allowed after fresh immediate recheck',()=>assert.equal(run('200','ordinary',{ok:true},{resolveFresh:()=>({role:'ADMIN',allowed:true}),privilegedAction:true,reauthorizeImmediately:true}).allowed,true));
console.log('RBAC_LEGACY_BOUNDARY '+n+'/8 LOCAL PASS');assert.equal(n,8);
