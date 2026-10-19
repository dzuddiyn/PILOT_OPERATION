'use strict';
// Local-only boundary: audit is historical evidence, notification is transport.
function bseRolePostCommit_(request,api){
 const out={audit:'NOT_CONFIGURED',notification:'NOT_CONFIGURED'};
 if(typeof api.appendAudit==='function'){
   try{api.appendAudit({operation_id:request.operationId,target:request.target,action:request.action,outcome:'COMMITTED_RECONCILED'});out.audit='RECORDED';}
   catch(_){out.audit='AUDIT_PENDING';}
 }
 if(typeof api.notify==='function'){
   try{api.notify({operation_id:request.operationId,target:request.target,action:request.action});out.notification='SENT';}
   catch(_){out.notification='NOTIFY_PENDING';}
 }
 return out;
}
