'use strict';const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c=vm.createContext({});vm.runInContext(fs.readFileSync(__dirname+'/PilotRoleRecovery.js','utf8'),c);
const req={operationId:'op',target:'200',actor:'100',action:'GRANT_ADMIN'},event={operation_id:'op',target:'200',actor:'100',action:'GRANT_ADMIN',state:'PREPARED'};
const api=(ledger=[],barriers=[])=>({readLedger:()=>ledger,readBarriers:()=>barriers,validateLedger:()=>true});
let n=0;function run(name,fn){fn();n++;console.log('PASS '+name);}
run('absence classified not applied',()=>assert.equal(c.bseRoleReconcile_(req,api()).status,'NOT_APPLIED'));
run('persisted prepared requires manual hold',()=>assert.equal(c.bseRoleReconcile_(req,api([event])).status,'WRITE_OUTCOME_UNKNOWN'));
run('committed event reconciled read-only',()=>assert.equal(c.bseRoleReconcile_(req,api([{...event,state:'COMMITTED'}])).status,'ALREADY_APPLIED'));
run('duplicate event blocks',()=>assert.equal(c.bseRoleReconcile_(req,api([event,event])).status,'SOURCE_MISMATCH'));
run('divergent actor blocks',()=>assert.equal(c.bseRoleReconcile_(req,api([{...event,actor:'300'}])).status,'REVISION_CONFLICT'));
run('ledger validation failure blocks',()=>{const a=api([{...event,state:'COMMITTED'}]);a.validateLedger=()=>false;assert.equal(c.bseRoleReconcile_(req,a).status,'UNVERIFIED');});
run('committed revoke with barrier never declares completion',()=>{const r={...req,action:'REVOKE_ADMIN'},e={...event,action:'REVOKE_ADMIN',state:'COMMITTED'};assert.equal(c.bseRoleReconcile_(r,api([e],[{target:'200',active:true}])).status,'WRITE_OUTCOME_UNKNOWN');});
run('read outage fails closed',()=>{const a=api();a.readLedger=()=>{throw Error('outage')};assert.equal(c.bseRoleReconcile_(req,a).status,'UNVERIFIED');});
console.log('RBAC_READONLY_RECONCILE '+n+'/8 LOCAL PASS');
