/**
 * PILOT_OPERATION Evidence file write-once contract.
 * Root binding is authority; only the existing Source_Evidence/Evidence_Files child
 * may receive media. A failed/uncertain create NEVER initiates another create.
 */
function bsePilotEvidenceExactChild_(parent,name){
  const it=parent.getFoldersByName(name);
  if(!it.hasNext())throw Error('EVIDENCE_FOLDER_MISSING_'+name);
  const child=it.next();
  if(it.hasNext())throw Error('EVIDENCE_FOLDER_AMBIGUOUS_'+name);
  return child;
}
function bsePilotEvidenceStorageFolder_(){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')throw Error('PILOT_EVIDENCE_WRONG_ENVIRONMENT');
  const root=DriveApp.getFolderById(bseRuntimeEvidenceFolderId_());
  return bsePilotEvidenceExactChild_(bsePilotEvidenceExactChild_(root,'01_Source_Evidence'),'Evidence_Files');
}
function bsePilotEvidenceStoredName_(row){
  const id=String(row[0]||''),unique=String(row[10]||'');
  if(!/^BSE-EV-[A-Za-z0-9_-]+$/.test(id)||!/^[A-Za-z0-9_-]{8,}$/.test(unique))
    throw Error('EVIDENCE_IDENTITY_INVALID');
  const original=String(row[12]||'evidence').replace(/[^A-Za-z0-9._-]/g,'_').slice(0,90);
  return id+'__'+unique+'__'+original;
}
function bsePilotEvidenceExactMatch_(folder,name,row){
  const it=folder.getFilesByName(name),found=[];
  while(it.hasNext()&&found.length<2)found.push(it.next());
  if(found.length>1)throw Error('EVIDENCE_MULTIPLE_FILES_SOURCE_MISMATCH');
  if(!found.length)return '';
  const f=found[0],expectedSize=Number(row[13]||0);
  if(expectedSize>0&&Number(f.getSize())!==expectedSize)throw Error('EVIDENCE_FILE_SIZE_MISMATCH');
  if(String(row[11]||'')&&String(f.getMimeType())!==String(row[11]))
    throw Error('EVIDENCE_FILE_MIME_MISMATCH');
  return f.getId();
}
function bsePilotEvidenceStoreOnce_(book,row,blob){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')throw Error('PILOT_EVIDENCE_WRONG_ENVIRONMENT');
  const sheet=bseTelegramEvidenceSheet_(book),rows=bseTelegramEvidenceRows_(sheet);
  const index=rows.findIndex(function(r){return String(r[0])===String(row[0]);});
  if(index<0)throw Error('EVIDENCE_SOURCE_ROW_MISSING');
  const canonical=rows[index];
  if(String(canonical[10])!==String(row[10])||String(canonical[9])!==String(row[9]))
    throw Error('EVIDENCE_SOURCE_IDENTITY_MISMATCH');
  const state=String(canonical[16]||'');
  if(!['OPEN','DRIVE_CREATE_PENDING','CONFIRMED_TEST'].includes(state))
    throw Error('EVIDENCE_REVIEW_STATE_INVALID_'+state);
  const folder=bsePilotEvidenceStorageFolder_(),name=bsePilotEvidenceStoredName_(canonical);
  const found=bsePilotEvidenceExactMatch_(folder,name,canonical);
  const recorded=String(canonical[19]||'');
  if(recorded){
    if(!found||found!==recorded)throw Error('EVIDENCE_RECORDED_FILE_SOURCE_MISMATCH');
    return recorded;
  }
  if(found){
    if(state!=='DRIVE_CREATE_PENDING')throw Error('EVIDENCE_UNEXPECTED_ORPHAN_FILE');
    sheet.getRange(index+2,20).setValue(found);
    SpreadsheetApp.flush();
    const read=sheet.getRange(index+2,20).getValue();
    if(String(read)!==found)throw Error('EVIDENCE_ID_READBACK_FAILED');
    return found;
  }
  // Once the uncertain boundary has been entered, absence of a visible Drive
  // file is not permission to create again (eventual consistency is possible).
  if(state==='DRIVE_CREATE_PENDING')throw Error('EVIDENCE_WRITE_OUTCOME_UNKNOWN_NO_RETRY');
  if(state!=='OPEN')throw Error('EVIDENCE_ALREADY_CONFIRMED_WITHOUT_FILE');
  sheet.getRange(index+2,17).setValue('DRIVE_CREATE_PENDING');
  SpreadsheetApp.flush();
  if(String(sheet.getRange(index+2,17).getValue())!=='DRIVE_CREATE_PENDING')
    throw Error('EVIDENCE_PENDING_READBACK_FAILED');
  // No more than one create attempt for this Evidence ID.
  const created=folder.createFile(blob.setName(name));
  const id=created.getId();
  if(!id)throw Error('EVIDENCE_CREATE_OUTCOME_UNKNOWN');
  sheet.getRange(index+2,20).setValue(id);
  SpreadsheetApp.flush();
  if(String(sheet.getRange(index+2,20).getValue())!==id)
    throw Error('EVIDENCE_ID_READBACK_FAILED');
  return id;
}
