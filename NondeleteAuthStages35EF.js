/** @OnlyCurrentDoc */
// 35E: bridge refuses to convert a inspected record into an authorization grant.
function bseNondelete35EBridge_(deps,r){
 const proof=bseNondelete35DSource_(deps,r);
 return {status:proof.status==='INSPECTED_HOLD'?'TRUSTED_ACTOR_BINDING_MISSING':proof.status,write_allowed:false};
}
// 35F: live-write readiness gate remains a deliberate HOLD.
function bseNondelete35FReadiness_(deps,r){
 const bridge=bseNondelete35EBridge_(deps,r);
 return {status:bridge.status==='TRUSTED_ACTOR_BINDING_MISSING'?'OWNER_APPROVAL_GATE':bridge.status,script_head_push:false,live_write:false};
}
