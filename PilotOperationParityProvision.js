/** PILOT_OPERATION parity — bounded empty schema provisioning.
 * No TEST data copying, Telegram sending, domain record changes or official writes.
 */
function inspectBsePilotOperationParitySchemaPlan(){
  bsePilotDigestAssertEnvironment_();
  const book=bsePilotOperationReadOnlyBook_();
  const states=bsePilotOperationAuditRegistry_().map(function(pair){
    return bsePilotAuditSheetSnapshot_(book,pair[0],pair[1]);
  });
  const mismatches=states.filter(function(s){return s.status==='STALE'||s.status==='SOURCE_MISMATCH';});
  const missing=states.filter(function(s){return s.status==='MISSING';});
  const result={environment:'PILOT_OPERATION',status:mismatches.length?'BLOCKED_MISMATCH':'READY',
    total:states.length,missing:missing.map(function(s){return s.sheet;}),
    conflicts:mismatches.map(function(s){return {sheet:s.sheet,status:s.status};}),
    production_write:false,official_bse_write:false};
  console.log('PILOT_PARITY_SCHEMA_PLAN '+JSON.stringify(result));
  return result;
}
function provisionBsePilotOperationMissingSchemas(){
  bsePilotDigestAssertEnvironment_();
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(1000))throw Error('PARITY_SCHEMA_LOCK_BUSY');
  const created=[];
  try{
    const book=bsePilotOperationReadOnlyBook_(), registry=bsePilotOperationAuditRegistry_();
    const plan=registry.map(function(pair){return {
      original:pair[0],sheet:bseRuntimeSheetName_(pair[0]),headers:pair[1],
      snapshot:bsePilotAuditSheetSnapshot_(book,pair[0],pair[1])
    };});
    if(plan.some(function(p){return p.snapshot.status==='STALE'||p.snapshot.status==='SOURCE_MISMATCH';}))
      throw Error('PARITY_SCHEMA_EXISTING_MISMATCH_STOP');
    const names=new Set();
    plan.forEach(function(p){
      if(!/^PILOT_/.test(p.sheet)||names.has(p.sheet)||!Array.isArray(p.headers)||!p.headers.length)
        throw Error('PARITY_SCHEMA_REGISTRY_INVALID');
      names.add(p.sheet);
    });
    plan.filter(function(p){return p.snapshot.status==='MISSING';}).forEach(function(p){
      if(book.getSheetByName(p.sheet))throw Error('PARITY_SCHEMA_RACE_CONFLICT_'+p.sheet);
      const tab=book.insertSheet(p.sheet);
      created.push(p.sheet);
      bseEnsureAdditiveHeaders_(tab,p.headers);
      SpreadsheetApp.flush();
      const read=bsePilotAuditSheetSnapshot_(book,p.original,p.headers);
      if(read.status!=='CURRENT'||read.row_count!==0)
        throw Error('PARITY_SCHEMA_READBACK_FAILED_'+p.sheet);
    });
    const after=plan.map(function(p){return bsePilotAuditSheetSnapshot_(book,p.original,p.headers);});
    const failures=after.filter(function(s){return s.status!=='CURRENT';});
    const outcome={status:failures.length?'PARTIAL_WRITE_DETECTED':'VERIFIED',created:created,
      registry_total:registry.length,current:after.length-failures.length,failures:failures.map(function(s){return s.sheet;}),
      production_write:false,official_bse_write:false};
    console.log('PILOT_PARITY_SCHEMA_PROVISION '+JSON.stringify(outcome));
    if(failures.length)throw Error('PARITY_SCHEMA_PARTIAL_WRITE_DETECTED');
    return outcome;
  } catch(error){
    console.log('PILOT_PARITY_SCHEMA_FAILED '+JSON.stringify({created:created,message:String(error.message||error)}));
    throw error;
  } finally {lock.releaseLock();}
}
