/** @OnlyCurrentDoc */
// Local read-only approval-source contract. Never grants a transaction.
function bseNondelete35DSource_(deps,r){
 const deny=status=>({status,write_allowed:false});
 if(!r||r.environment!=='TEST_ONLY'||r.workbook_id!=='1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY')return deny('DENIED');
 if(!deps||typeof deps.readRecords!=='function'||typeof deps.now!=='function')return deny('SOURCE_UNAVAILABLE');
 let records;try{records=deps.readRecords(r.approval_source_key)}catch(e){return deny('READ_FAILED')}
 if(!Array.isArray(records)||records.length!==1)return deny('MISSING_OR_DUPLICATE');
 const p=records[0];
 if(!p||p.status!=='APPROVED'||p.actor_verified!==true||p.revision!==1||
 ['environment','workbook_id','event_id','approval_source_key','ledger_source_key','approval_hash','ledger_hash'].some(k=>p[k]!==r[k]))
 return deny('UNVERIFIED');
 const now=deps.now();
 if(!Number.isFinite(now)||!Number.isFinite(p.issued_ms)||!Number.isFinite(p.expires_ms)||
 p.issued_ms>now||p.expires_ms<=now||p.expires_ms-p.issued_ms>3600000)return deny('STALE');
 return deny('INSPECTED_HOLD');
}
