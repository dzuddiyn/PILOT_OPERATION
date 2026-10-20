/** @OnlyCurrentDoc */
// Read-only, exact-event idempotency lookup for previous approved Transplant.
function bsePilotTransplantExistingExact_(book,input){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION'||!book)return null;
  const source=bseUnifiedSourceContext_(input),original=String(source.original||'');
  // Exact duplicate recognition only for the known three-line shorthand;
  // free-text crop or extra instructions must be reviewed rather than guessed.
  const lines=original.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  if(lines.length!==3||!/^Tarikh\s+Pindah\s+anak\s+pokok$/i.test(lines[0]))return null;
  const parsed=bseTransplantPlots_(original),date=bseTransplantExplicitDateContext_(source);
  if(!parsed.ok||!date.ok||!date.date||!Array.isArray(parsed.plots)||!parsed.plots.length)return null;
  const plots=parsed.plots.slice().sort(bseTransplantPlotCompare_),plotStr=plots.join('|');
  const events=bsePilotCycleEndRows_(book,'TEST_TRANSPLANT_EVENT',BSE_TRANSPLANT_EVENT_HEADERS),
        reviews=bsePilotCycleEndRows_(book,'TEST_TRANSPLANT_REVIEW',BSE_TRANSPLANT_REVIEW_HEADERS),
        statuses=bsePilotCycleEndRows_(book,'TEST_ALLOCATION_STATUS_EVENT',BSE_ALLOCATION_STATUS_EVENT_HEADERS);
  const confirmed=events.filter(e=>String(e[4])===date.date&&String(e[5])==='TRANSPLANT'&&
     String(e[8])===plotStr&&String(e[9])==='COMPLETED'&&String(e[10])==='VERIFIED_TEST'&&
     /^BSE-TG-\d+\|Transplant_Event_Log$/.test(String(e[0])));
  if(confirmed.length!==1)return null; // do not claim duplicate if ambiguous
  const e=confirmed[0],sourceKey=String(e[0]),eventId=String(e[2]),batchId=String(e[3]),hash=String(e[14]);
  if(!eventId||!batchId||!hash||!String(e[6]).trim())return null;
  const approvals=reviews.filter(r=>String(r[1])===sourceKey&&String(r[3])==='Transplant_Event_Log'&&
     String(r[4])===hash&&String(r[5])==='APPROVED'&&String(r[11])===eventId&&String(r[12])===batchId);
  if(approvals.length!==1)return null;
  const linked=statuses.filter(s=>String(s[0])===sourceKey&&String(s[3])===eventId&&String(s[4])===batchId&&
     String(s[7])==='PLANNED'&&String(s[8])==='ACTIVE'&&String(s[11])===hash);
  if(linked.length!==plots.length||linked.map(s=>String(s[6])).sort(bseTransplantPlotCompare_).join('|')!==plotStr)return null;
  const declared=typeof bseTransplantExplicitCropContext_==='function'?bseTransplantExplicitCropContext_(source):null;
  if(declared&&(declared.conflict||declared.crop&&
      bseTransplantNormalizeCrop_(declared.crop)!==bseTransplantNormalizeCrop_(String(e[6]))))return null;
  return {reference:sourceKey.split('|')[0],event_date:date.date,plots:plots,crop:String(e[6]),
    variety:String(e[7]||''),batch_id:batchId,transplant_event_id:eventId};
}
function bsePilotTransplantExistingExactText_(reference,record){
  if(!record||!/^BSE-TG-\d+$/.test(record.reference))throw Error('Transplant duplicate readback invalid.');
  return ['Semakan laporan '+String(reference)+':',
    'Pindah Tanam sudah direkodkan.',
    'Rujukan asal: '+record.reference,
    'Tarikh Pindah Tanam: '+String(record.event_date).split('-').reverse().join('/'),
    'Plot: '+record.plots.join(', '),
    'Tanaman: '+record.crop+(record.variety?' ('+record.variety+')':''),
    'Batch: '+record.batch_id,
    'Tiada rekod baharu dibuat. Tidak perlu balas atau tekan Benar.'
  ].join('\n');
}
