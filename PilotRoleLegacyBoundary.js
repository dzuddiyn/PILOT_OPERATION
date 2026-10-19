'use strict';
// Deny-only compatibility boundary. Never infer authority from legacy owner.ok.
function bseRoleLegacyCapability_(actor,capability,legacy,api){
 const deny=reason=>({allowed:false,reason});
 if(!api||typeof api.resolveFresh!=='function'||!legacy||legacy.ok!==true)return deny('LEGACY_OR_AUTHORITY_MISSING');
 try {
   const fresh=api.resolveFresh(String(actor),capability);
   if(!fresh||fresh.allowed!==true)return deny('CANONICAL_DENIED');
   if(capability==='manage_admins'&&fresh.role!=='OWNER')return deny('OWNER_ONLY');
   if(api.privilegedAction&&api.reauthorizeImmediately!==true)return deny('RECHECK_MISSING');
   return {allowed:true,role:fresh.role};
 }catch(_){return deny('AUTHORITY_READ_FAILED');}
}
