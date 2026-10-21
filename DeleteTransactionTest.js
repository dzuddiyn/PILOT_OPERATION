/** @OnlyCurrentDoc */
// GI-FIELD-UX-DELETE-TRANSACTION-06: deterministic pure proposal/recovery.
// NOT WIRED to Telegram callbacks or Sheets. NEVER performs live writes.
function bseDeleteTxPlan_(input){
  const p=input||{},ref=String(p.reference||''),approvalKey=String(p.approval_source_key||'');
  const ledgerKey=String(p.ledger_source_key||''),rows=p.ledger_rows||[];
  if(!/^BSE-TG-\d+$/.test(ref)||!approvalKey.startsWith(ref+'|')||
     !/^BSE-TG-\d+\|[A-Z_]+$/.test(ledgerKey)||!ledgerKey.startsWith(ref+'|'))
    return {status:'SOURCE_MISMATCH',production_write:false};
  if(String(p.owner_status)!=='AUTHORIZED'||String(p.approval_status)!=='REPORTER_CONFIRMED')
    return {status:'NOT_AUTHORIZED',production_write:false};
  if(!/^[a-f0-9]{64}$/i.test(String(p.expected_hash||''))||!Number.isInteger(p.expected_revision)||p.expected_revision<1)
    return {status:'MISSING_REVISION_PROOF',production_write:false};
  // Strong exact mapping is supplied from an independently verified ledger-binding record.
  // An identical-looking reference prefix is NOT sufficient.
  if(String(p.binding_approval_key||'')!==approvalKey||String(p.binding_ledger_key||'')!==ledgerKey||
     String(p.binding_hash||'')!==String(p.expected_hash))
    return {status:'UNVERIFIED_LEDGER_BINDING',production_write:false};
  const found=rows.filter(r=>String(r.source_key)===ledgerKey);
  if(found.length!==1)return {status:'LEDGER_NOT_UNIQUE',production_write:false};
  const row=found[0];
  if(row.status!=='APPROVED_TEST'||row.payload_hash!==p.expected_hash||row.revision!==p.expected_revision)
    return {status:'REVISION_CONFLICT',production_write:false};
  const token=String(p.transaction_id||'');
  if(!/^D06-[A-Za-z0-9_-]{8,40}$/.test(token))return {status:'INVALID_TX_ID',production_write:false};
  return {status:'READY_NO_WRITE',production_write:false,transaction_id:token,
    source_key:ledgerKey,approval_source_key:approvalKey,expected_hash:p.expected_hash,
    expected_revision:p.expected_revision};
}
function bseDeleteTxTransition_(journal,action,observation){
  const j=Object.assign({},journal||{}),state=String(j.status||'');
  if(!['PREPARED','APPLYING','COMMITTED','NEEDS_RECONCILIATION'].includes(state))return {status:'INVALID_JOURNAL'};
  if(state==='COMMITTED')return {status:'ALREADY_APPLIED',transaction_id:j.transaction_id};
  if(action==='BEGIN'&&state==='PREPARED'&&observation&&observation.preconditions_match===true)
    return Object.assign(j,{status:'APPLYING'});
  if(action==='VERIFY'&&state==='APPLYING'){
    if(observation&&observation.ledger_void===true&&observation.approval_void===true&&observation.queue_consistent===true)
      return Object.assign(j,{status:'COMMITTED'});
    return Object.assign(j,{status:'NEEDS_RECONCILIATION'});
  }
  if(action==='RECOVER'&&state==='NEEDS_RECONCILIATION'){
    if(observation&&observation.ledger_void===true&&observation.approval_void===true&&observation.queue_consistent===true)
      return Object.assign(j,{status:'COMMITTED'});
    return Object.assign(j,{status:'NEEDS_RECONCILIATION'});
  }
  return {status:'BLOCKED_TRANSITION',from:state,action:action};
}
