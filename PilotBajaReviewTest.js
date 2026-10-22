/** @OnlyCurrentDoc */
// One human approval for an entire Baja group; TEST ledger only.
// Each item has a stable source key. Partial transport failures resume safely on callback retry.
function bsePilotBajaLineage_(reference,f,item){
  const sourceKey=String(reference)+'|'+String(f.record_type)+'|BAJA_'+String(item.baja_type)+'|'+(String(item.destination||'')||'NO_PLOT');
  const payload={source_key:sourceKey,domain:f.record_type,item_name:item.item_name,
    baja_type:item.baja_type,quantity:item.quantity,unit:item.unit,event_date:f.event_date,
    destination:f.destination||'',original_note:f.original_note||''};
  const hash=bseInventoryPayloadHash_(payload);
  return {sourceKey:sourceKey,hash:hash,id:'BSE-SB-INV-'+hash.slice(0,12),payload:payload};
}
function bsePilotBajaAuditRows_(rows,lineage){
  const matches=(rows||[]).filter(r=>String(r[0])===lineage.sourceKey);
  if(!matches.length)return 'NEW';
  if(matches.length!==1)throw Error('BAJA_SOURCE_KEY_DUPLICATE');
  const r=matches[0],p=lineage.payload;
  const ok=String(r[1])===lineage.id&&String(r[2])===p.domain&&
    String(r[3])===p.item_name&&Number(r[4])===p.quantity&&
    String(r[5])===p.unit&&String(r[6])===p.event_date&&
    String(r[10])==='APPROVED_TEST'&&r[12]===false&&
    String(r[13])===p.original_note&&String(r[17])===lineage.hash&&
    String(r[21]||'')===p.destination&&String(r[26]||'')===p.baja_type;
  if(!ok)throw Error('BAJA_SOURCE_KEY_CONFLICT');
  return 'RECOVER';
}
function bsePilotBajaReviewCore_(book,context){
  bseReviewContextValidate_(context);
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION'||context.action!=='APPROVED')
    throw Error('BAJA_PILOT_APPROVAL_ONLY');
  const result=context.proposalResult,validated=bsePilotBajaValidateResult_(result);
  if(validated.validation!=='PASS')throw Error('BAJA_INCOMPLETE_NO_WRITE '+validated.missing.join(','));
  const f=result.candidates[0].fields,reference=String(context.reference);
  if(!book||typeof book.getSheetByName!=='function')throw Error('BAJA_TEST_BOOK_NOT_AVAILABLE');
  const items=f.baja_items,lines=items.map(item=>bsePilotBajaLineage_(reference,f,item));
  const sheet=bseInventoryMigrateSheetHeaders_(book,'TEST_INVENTORY_EVENT',BSE_INVENTORY_EVENT_HEADERS);
  const prior=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,BSE_INVENTORY_EVENT_HEADERS.length).getValues():[];
  const plan=lines.map(x=>({line:x,decision:bsePilotBajaAuditRows_(prior,x)}));
  const review=bseInventoryEnsureSheet_(book,'TEST_INVENTORY_REVIEW',BSE_INVENTORY_REVIEW_HEADERS);
  const groupKey=reference+'|'+f.record_type+'|BAJA_GROUP';
  const groupHash=bseInventoryPayloadHash_({groupKey:groupKey,lines:lines.map(x=>x.hash)});
  const reviews=review.getLastRow()>1?review.getRange(2,1,review.getLastRow()-1,BSE_INVENTORY_REVIEW_HEADERS.length).getValues():[];
  const existing=reviews.filter(row=>String(row[1])===groupKey);
  if(existing.length>1||existing.length===1&&(String(existing[0][9])!==groupHash||
      String(existing[0][4])!=='APPROVED'))throw Error('BAJA_GROUP_REVIEW_CONFLICT');
  if(existing.length===1){
    if(plan.some(p=>p.decision!=='RECOVER'))throw Error('BAJA_GROUP_REVIEW_LEDGER_DRIFT');
    return {validation:'PASS',decision:'APPROVED',source_key:groupKey,
      payload_hash:groupHash,duplicate:true,production_write:false};
  }
  const stamp=new Date().toISOString();
  // Under the existing Telegram callback lock: preflight every item before append.
  for(const p of plan){
    if(p.decision==='RECOVER')continue;
    const x=p.line,datum=x.payload;
    sheet.appendRow([x.sourceKey,x.id,datum.domain,datum.item_name,datum.quantity,
      datum.unit,datum.event_date,context.owner_id||'',context.actor_id||'',
      context.actor_name,'APPROVED_TEST','VERIFIED_TEST',false,datum.original_note,
      stamp,stamp,context.actor_name,x.hash,
      String(f.responsible_name||context.reporter_name||context.actor_name||''),
      String(f.responsible_source||'REPORTER_DEFAULT'),
      String(f.responsible_telegram_user_id||context.reporter_telegram_user_id||''),
      datum.destination,'','',datum.domain==='INVENTORY_IN'?'IN':'OUT','HIGH',datum.baja_type]);
  }
  // Only after all rows have been verified or appended do we mark one group approval.
  review.appendRow([Utilities.getUuid(),groupKey,'',f.record_type,'APPROVED',
    context.actor_name,'',stamp,'NEEDS_HUMAN_REVIEW',groupHash,
    context.owner_id||'',context.actor_id||'',context.actor_name,
    f.original_note||'']);
  SpreadsheetApp.flush();
  return {validation:'PASS',decision:'APPROVED',source_key:groupKey,
    payload_hash:groupHash,record_count:items.length,production_write:false};
}
function bsePilotBajaConfirmedSummary_(book,reference,result){
  const check=bsePilotBajaValidateResult_(result);
  if(check.validation!=='PASS')return '';
  const f=result.candidates[0].fields,items=f.baja_items;
  const sheet=bseInventoryMigrateSheetHeaders_(book,'TEST_INVENTORY_EVENT',BSE_INVENTORY_EVENT_HEADERS);
  const rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,BSE_INVENTORY_EVENT_HEADERS.length).getValues():[];
  const expected=items.map(item=>bsePilotBajaLineage_(reference,f,item));
  if(expected.some(e=>bsePilotBajaAuditRows_(rows,e)!=='RECOVER'))return '';
  return ['REKOD '+(f.record_type==='INVENTORY_IN'?'BAJA MASUK':'BAJA KELUAR'),
    'Rujukan: '+reference,'Tarikh: '+f.event_date,
    ...(f.record_type==='INVENTORY_OUT'?['Plot: '+f.destination]:[]),
    ...items.map((item,i)=>(i+1)+'. Baja '+item.baja_type+' : '+item.quantity+' '+item.unit),
    'Status: REPORTER_CONFIRMED'].join('\n');
}
