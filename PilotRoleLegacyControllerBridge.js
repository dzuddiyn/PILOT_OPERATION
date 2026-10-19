'use strict';
// PILOT candidate only: no legacy OWNER fallback; trusted authority adapter not deployed.
function bseRoleControllerDecision_(site,book,actor,chat,chatType){
 const denied={allowed:false,role:'UNVERIFIED',reason:'AUTHORITY_UNAVAILABLE'};
 if(typeof bseRoleTrustedAdaptersForBook_!=='function'||typeof bseRoleLegacySiteAuthorize_!=='function')return denied;
 try{
   const adapters=bseRoleTrustedAdaptersForBook_(book);
   if(!adapters||adapters.sourceAuthenticated!==true)return denied;
   return bseRoleLegacySiteAuthorize_(site,String(actor||''),String(chat||''),chatType,adapters);
 }catch(_){return denied;}
}
function bseRoleControllerCapability_(site,book,actor,chat,chatType){
 return bseRoleControllerDecision_(site,book,actor,chat,chatType).allowed===true;
}
function bseRoleControllerElevated_(site,book,actor,chat,chatType){
 const decision=bseRoleControllerDecision_(site,book,actor,chat,chatType);
 return decision.allowed===true&&(decision.role==='OWNER'||decision.role==='ADMIN');
}
