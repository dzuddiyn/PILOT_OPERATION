'use strict';
// Safe composition entrypoint for isolated candidates only. No live wiring.
function bseRoleSecuredTransaction_(request,api){
 const verdict=bseRoleValidateOwnerIntent_(request,api);
 if(!verdict.ok)return {status:'DENIED',reason:verdict.reason};
 if(typeof bseRoleTransaction_!=='function')return {status:'UNVERIFIED'};
 return bseRoleTransaction_(request,api);
}
