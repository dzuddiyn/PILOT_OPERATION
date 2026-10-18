/** @NotOnlyCurrentDoc
 * Gate I independent PILOT_OPERATION schema/source-key audit.
 * Read-only; never seeds, formats, repairs, sends or modifies live records.
 * Reuses canonical TEST schema definitions, with PILOT_OPERATION runtime mapping.
 */
const BSE_PILOT_OP_AUDIT_REQUIRED=[
  'PILOT_OWNER_REGISTRY',
  'PILOT_TELEGRAM_QUEUE',
  'PILOT_TELEGRAM_APPROVAL_UI',
  'PILOT_TELEGRAM_APPROVAL_CALLBACK_PENDING',
  'PILOT_CROP_BATCH',
  'PILOT_PLANTING_EVENT',
  'PILOT_PLOT_ALLOCATION',
  'PILOT_FILE_EVIDENCE',
  'PILOT_TELEGRAM_RETRIEVAL_AUDIT',
  'PILOT_DAILY_DIGEST_AUDIT',
  'PILOT_FRIDAY_WEEKLY_DIGEST_AUDIT'
];
const BSE_PILOT_OP_DUPLICATE_ALLOWED=[
  'PILOT_PLOT_ALLOCATION',
  'PILOT_PLANT_CENSUS',
  'PILOT_TREATMENT_ALLOCATION_LINK',
  'PILOT_ALLOCATION_STATUS_EVENT'
];
function bsePilotOperationReadOnlyBook_(){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')
    throw Error('PILOT_AUDIT_WRONG_ENVIRONMENT');
  const b=getBsePilotOperationRuntimeBindingStatus();
  if(b.environment!=='PILOT_OPERATION'||!b.spreadsheet_bound||!b.evidence_folder_bound||
    b.production_write!==false||b.official_bse_write!==false)
    throw Error('PILOT_AUDIT_RUNTIME_BOUNDARY_FAILED');
  const book=SpreadsheetApp.openById(BSE_PILOT_OPERATION_BINDING.spreadsheetId);
  bseRuntimeAssertWorkbookId_(book.getId());
  return book;
}
function bsePilotOperationAuditRegistry_(){
  const all=bsePilotAuditRegistry_().slice();
  all.push(['TEST_DAILY_DIGEST_AUDIT',BSE_PILOT_DAILY_HEADERS]);
  all.push(['TEST_DAILY_DIGEST_CONFIG_AUDIT',BSE_PILOT_DIGEST_CONFIG_HEADERS]);
  all.push(['TEST_FRIDAY_WEEKLY_DIGEST_AUDIT',BSE_PILOT_FRIDAY_HEADERS]);
  all.push(['TEST_FRIDAY_WEEKLY_DIGEST_CONFIG_AUDIT',BSE_PILOT_DIGEST_CONFIG_HEADERS]);
  return all;
}
function bsePilotOperationSourceIssues_(snapshots){
  const entries=snapshots.flatMap(bsePilotAuditSourceEntries_);
  // Append-only audit history may repeat a reference for distinct user requests.
  const uniqueRows=entries.filter(e=>!/_AUDIT$/i.test(e.sheet));
  const issues=bsePilotAuditDuplicateIssues_(uniqueRows,new Set(BSE_PILOT_OP_DUPLICATE_ALLOWED));
  entries.forEach(e=>{
    if(/^(true|yes|1)$/i.test(e.production))
      issues.push({type:'PRODUCTION_WRITE_TRUE',sheet:e.sheet,row:e.row});
    if(/^(true|yes|1)$/i.test(e.official))
      issues.push({type:'OFFICIAL_BSE_WRITE_TRUE',sheet:e.sheet,row:e.row});
  });
  const queue=snapshots.find(s=>s.sheet==='PILOT_TELEGRAM_QUEUE');
  const qi=queue?bsePilotAuditIndex_(queue.headers):{};
  // Clarification replaces the queue update while its source key preserves parent update identity.
  const ids=new Set(queue?queue.rows.flatMap(r=>[bsePilotAuditCell_(r,qi,'update_id'),
    bsePilotAuditCell_(r,qi,'parent_update_id')]).filter(Boolean):[]);
  entries.filter(e=>e.sheet!=='PILOT_TELEGRAM_QUEUE'&&!/_AUDIT$/i.test(e.sheet)&&/^BSE-TG-\d+/.test(e.key))
    .forEach(e=>{
      const m=e.key.match(/^BSE-TG-(\d+)/);
      if(m&&!ids.has(m[1]))issues.push({type:'ORPHAN_SOURCE_KEY',sheet:e.sheet,row:e.row});
    });
  const approvals=snapshots.find(s=>s.sheet==='PILOT_TELEGRAM_APPROVAL_UI');
  if(approvals){
    const i=bsePilotAuditIndex_(approvals.headers);
    approvals.rows.forEach((r,n)=>{
      const v=bsePilotAuditCell_(r,i,'decision_status');
      if(['OPEN','CARD_SEND_PENDING','CARD_SEND_UNCERTAIN'].includes(v))
        issues.push({type:'UNRESOLVED_APPROVAL',sheet:approvals.sheet,row:n+2});
    });
  }
  const callbacks=snapshots.find(s=>s.sheet==='PILOT_TELEGRAM_APPROVAL_CALLBACK_PENDING');
  if(callbacks){
    const i=bsePilotAuditIndex_(callbacks.headers);
    callbacks.rows.forEach((r,n)=>{
      const v=bsePilotAuditCell_(r,i,'status');
      if(['PENDING','FAILED','OUTCOME_UNKNOWN'].includes(v))
        issues.push({type:'UNRESOLVED_CALLBACK',sheet:callbacks.sheet,row:n+2});
    });
  }
  return {entries:entries,issues:issues};
}
function runBsePilotOperationReadOnlyIntegrityAudit(){
  const book=bsePilotOperationReadOnlyBook_(),registry=bsePilotOperationAuditRegistry_();
  const sheets=registry.map(r=>bsePilotAuditSheetSnapshot_(book,r[0],r[1]));
  const counts={CURRENT:0,MISSING:0,STALE:0,SOURCE_MISMATCH:0};
  sheets.forEach(s=>{counts[s.status]=(counts[s.status]||0)+1;});
  const requiredFailures=sheets.filter(s=>BSE_PILOT_OP_AUDIT_REQUIRED.includes(s.sheet)&&s.status!=='CURRENT');
  const sourceSnapshots=registry.filter(r=>sheets.find(s=>s.sheet===bseRuntimeSheetName_(r[0])&&s.status==='CURRENT'))
    .map(r=>bsePilotAuditRows_(book,r[0],r[1]));
  const integrity=bsePilotOperationSourceIssues_(sourceSnapshots);
  const fatal=integrity.issues.some(x=>
    ['CONFLICTING_HASH','PRODUCTION_WRITE_TRUE','OFFICIAL_BSE_WRITE_TRUE'].includes(x.type));
  const mismatched=sheets.filter(s=>['STALE','SOURCE_MISMATCH'].includes(s.status));
  const status=fatal?'FAIL_SAFETY':requiredFailures.length||mismatched.length||integrity.issues.length?'ANOMALIES':
    counts.MISSING?'OPTIONAL_TABS_ABSENT':'CURRENT';
  const result={
    environment:'PILOT_OPERATION',status:status,production_write:false,official_bse_write:false,
    registry_total:registry.length,schema_counts:counts,
    required_total:BSE_PILOT_OP_AUDIT_REQUIRED.length,
    required_current:BSE_PILOT_OP_AUDIT_REQUIRED.length-requiredFailures.length,
    required_failures:requiredFailures.map(s=>({sheet:s.sheet,status:s.status})),
    mismatched_sheets:mismatched.map(s=>({sheet:s.sheet,status:s.status,
      missing:s.delta.missing,extra:s.delta.extra,order_mismatch:s.delta.order_mismatch})),
    optional_missing:sheets.filter(s=>s.status==='MISSING').map(s=>s.sheet),
    source_key_entry_count:integrity.entries.length,
    source_issue_count:integrity.issues.length,
    source_issues:integrity.issues.map(x=>({type:x.type,sheet:x.sheet,row:x.row})),
    read_only:true
  };
  console.log('PILOT_OP_INTEGRITY_AUDIT '+JSON.stringify(result));
  return result;
}
