/** @OnlyCurrentDoc */
// Gate 36B LOCAL CONTRACT only; never a live approval issuer or writer.
function bseAuthority36BValidate_(record,actor,now){
 const deny=s=>({status:s,can_issue:false,can_consume:false});
 const id='1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY';
 if(!record||record.environment!=='TEST_ONLY'||record.workbook_id!==id||
 !/^TEST_ONLY_36_[A-Z0-9_]+$/.test(String(record.event_id||'')))return deny('SCOPE_DENIED');
 if(!actor||actor.verified_by!=='TRUSTED_AUTHORITY'||actor.actor_id!=='TEST_ONLY_OWNER_36B')
 return deny('ACTOR_UNVERIFIED');
 if(!/^[a-f0-9]{64}$/i.test(String(record.approval_hash||''))||
 !/^[a-f0-9]{64}$/i.test(String(record.ledger_hash||''))||
 !/^[A-Za-z0-9_-]{16,128}$/.test(String(record.nonce||''))||
 !/^[A-Za-z0-9_-]{8,100}$/.test(String(record.approval_id||'')))return deny('IDENTITY_INVALID');
 if(!Number.isSafeInteger(record.revision)||record.revision!==1||
 !Number.isFinite(now)||!Number.isFinite(record.issued_ms)||!Number.isFinite(record.expires_ms)||
 record.issued_ms>now||record.expires_ms<=now||record.expires_ms-record.issued_ms>3600000)return deny('REVISION_OR_FRESHNESS');
 if(!['PENDING','APPROVED','CONSUMED','REJECTED','REVOKED','EXPIRED'].includes(record.status))
 return deny('LIFECYCLE_INVALID');
 // Validation cannot mint trust: injected actor proof is synthetically modeled.
 return deny('CONTRACT_VALID_HOLD');
}
function bseAuthority36BTransition_(current,next){
 const deny=s=>({status:s,write_allowed:false});
 if(!current||!next||next.revision!==current.revision+1||next.approval_id!==current.approval_id||
 next.nonce!==current.nonce)return deny('REVISION_OR_IDENTITY_CONFLICT');
 const edges={PENDING:['APPROVED','REJECTED','REVOKED','EXPIRED'],APPROVED:['CONSUMED','REVOKED','EXPIRED']};
 if(!(edges[current.status]||[]).includes(next.status))return deny('INVALID_TRANSITION');
 return deny('VALID_TRANSITION_HOLD');
}
