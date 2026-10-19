'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const {FakeSheets}=require('./test_support/rbac/fake_sheets.cjs');
const {inspectRaw}=require('./test_support/rbac/independent_oracle.cjs');
const ctx=vm.createContext({});
for(const file of ['PilotRoleContract.js','PilotRoleResolver.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),ctx);
const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
function fixture(){const db=new FakeSheets();db.seed('ledger',[]);db.seed('barriers',[]);return {db,owner:{user_id:'100',verified:true},registered:'REGISTERED_ACTIVE',readBootstrapOwner(){return this.owner;},readRegistration(){return this.registered;},readLedger(){return this.db.read('ledger');},readBarriers(){return this.db.read('barriers');},sha256};}
function grant(f,op='g',action='GRANT_ADMIN',revision=1,previous_hash=''){const e={event_id:'ev-'+op,operation_id:op,target:'200',actor:'100',action,revision,previous_hash,state:'COMMITTED'};e.digest=sha256(JSON.stringify([e.event_id,e.operation_id,e.target,e.actor,e.action,e.revision,e.previous_hash]));f.db.append('ledger',e);return e;}
let n=0;function check(name,fn){fn();n++;console.log('PASS '+name)}
function auth(f,user='200',cap='restricted_history'){return ctx.bseRoleResolve_(user,cap,f);}
check('missing adapter fail closed',()=>assert.equal(auth(null).allowed,false));
check('invalid actor fail closed',()=>assert.equal(auth(fixture(),'bad').allowed,false));
check('unverified bootstrap deny',()=>{const f=fixture();f.owner.verified=false;assert.equal(auth(f).allowed,false);});
check('bootstrap owner can manage',()=>assert.equal(auth(fixture(),'100','manage_admins').allowed,true));
check('member ordinary only',()=>{const f=fixture();assert.equal(auth(f,'200','ordinary').allowed,true);assert.equal(auth(f).allowed,false);});
check('committed grant actual resolver + independent raw oracle',()=>{const f=fixture(),g=grant(f);assert.equal(auth(f).allowed,true);assert.equal(inspectRaw({ledger:f.db.read('ledger'),target:'200'}).elevated,true);assert.equal(auth(f,'200','manage_admins').allowed,false);});
check('admin cannot mutate OWNER',()=>{const f=fixture();grant(f);assert.equal(auth(f,'200','mutate_owner').allowed,false);});
check('committed revoke denies',()=>{const f=fixture(),g=grant(f);grant(f,'r','REVOKE_ADMIN',2,g.digest);assert.equal(auth(f).allowed,false);});
check('pending grant deny',()=>{const f=fixture();grant(f);const a=f.db.read('ledger');a[0].state='PREPARED';f.db.seed('ledger',a);assert.equal(auth(f).allowed,false);});
check('corrupt ledger deny',()=>{const f=fixture();grant(f);f.db.seed('ledger',[{partial:true}]);assert.equal(auth(f).allowed,false);});
check('duplicate revision deny',()=>{const f=fixture();grant(f);grant(f,'r','REVOKE_ADMIN',1,'');assert.equal(auth(f).allowed,false);});
check('revoke barrier deny',()=>{const f=fixture();grant(f);f.db.append('barriers',{target:'200',active:true});assert.equal(auth(f).allowed,false);});
check('malformed barrier deny',()=>{const f=fixture();grant(f);f.db.append('barriers',{target:'200'});assert.equal(auth(f).allowed,false);});
check('registration inactive deny',()=>{const f=fixture();grant(f);f.registered='REJECTED';assert.equal(auth(f).allowed,false);});
check('read outage deny',()=>{const f=fixture();grant(f);f.readLedger=()=>{throw Error('OUTAGE')};assert.equal(auth(f).allowed,false);});
check('unknown capability deny',()=>{const f=fixture();grant(f);assert.equal(auth(f,'200','invalid_capability').allowed,false);});
check('no legacy is_admin fallback',()=>{const f=fixture();f.is_admin=true;assert.equal(auth(f).allowed,false);});
console.log('RBAC_M1_M2_ACTUAL_MODULE '+n+'/17 LOCAL_PASS; no runtime binding');assert.equal(n,17);
