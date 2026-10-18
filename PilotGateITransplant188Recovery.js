/** PILOT_OPERATION-only, one-time recovery of a recorded genuine reporter callback.
 * Do not create Telegram callbacks or synthetic farm reports. Fail closed on any partial state.
 * The existing domain review lock is acquired inside bseTelegramApprovalCallback_.
 */
function recoverBsePilotGateITransplant188Once(){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')throw Error('GATE_I_188_PILOT_ONLY');
  const book=boundTestBook_(),updateId='772257188',reference='BSE-TG-'+updateId,
        sourceKey=reference+'|Transplant_Event_Log',cardId='111';
  const queue=bseTelegramQueue_(book),qrows=bseCropBatchRows_(queue,BSE_TG_QUEUE_HEADERS.length);
  const qitems=qrows.filter(row=>String(row[0])===updateId);
  if(qitems.length!==1||String(qitems[0][6])!=='NEEDS_HUMAN_REVIEW')
    throw Error('GATE_I_188_QUEUE_NOT_OPEN');
  const q=qitems[0],note=String(q[4]||'');
  if(note!=='Transplant\nTimun\n- M5P34\n- 9/10/26')
    throw Error('GATE_I_188_SOURCE_MISMATCH');
  const approvalSheet=bseTelegramApprovalSheet_(book),cards=bseApprovalRows_(approvalSheet),
        cardMatches=cards.map((row,index)=>({row,index})).filter(o=>String(o.row[0])===reference);
  if(cardMatches.length!==1)throw Error('GATE_I_188_CARD_COUNT');
  const card=cardMatches[0].row;
  if(String(card[17])!=='OPEN'||String(card[9])!==cardId||
     String(card[1])!==sourceKey||String(card[7])!==String(q[1])||
     String(card[3])!==String(q[2]))throw Error('GATE_I_188_CARD_MISMATCH');
  const candidate=JSON.parse(String(q[9]||'')),envelopes=bseApprovalEnvelopes_(candidate);
  if(envelopes.length!==1||bseApprovalHash_(envelopes[0])!==String(card[2]))
    throw Error('GATE_I_188_HASH_MISMATCH');
  const proposal=bseTransplantProposal_(bseTransplantReviewEncodedCandidate_(String(q[9])),note);
  if(proposal.fields.event_date!=='2026-10-09'||proposal.fields.crop!=='Timun'||
     proposal.fields.variety!=='282'||proposal.plots.join('|')!=='M5P3|M5P4')
    throw Error('GATE_I_188_FACT_MISMATCH');
  const match=bseTransplantMatchForBook_(book,proposal);
  if(match.kind!=='UNIQUE'||match.batch_id!=='BSE-SB-CB-20261006-001'||
     match.allocations.length!==2||match.allocations.map(x=>x.plot_id).join('|')!=='M5P3|M5P4')
    throw Error('GATE_I_188_ALLOCATION_NOT_UNIQUE');
  const callbackSheet=bseTelegramApprovalCallbackSheet_(book),
        callbacks=bseCropBatchRows_(callbackSheet,BSE_APPROVAL_CALLBACK_HEADERS.length),
        relevant=callbacks.map((row,index)=>({row,index})).filter(item=>
          ['772257189','772257190'].includes(String(item.row[0])));
  if(relevant.length!==2||relevant.some(item=>
     String(item.row[5])!=='FAILED_CALLBACK_RETRY_LIMIT'||
     String(item.row[2])!==String(card[10])||String(item.row[3])!=='A'||
     Number(item.row[6])!==5))throw Error('GATE_I_188_CALLBACK_STATE_MISMATCH');
  const first=relevant.find(item=>String(item.row[0])==='772257189');
  const callback=JSON.parse(String(first.row[4]||'')),message=callback.message||{},actor=callback.from||{};
  if(String(actor.id)!==String(card[3])||
     String(message.message_id)!==cardId||
     String(message.chat&&message.chat.id)!==String(card[7])||
     String(message.chat&&message.chat.type)!=='private'||
     String(callback.data)!=='B1:'+String(card[10])+':A')
    throw Error('GATE_I_188_CALLBACK_AUTH_MISMATCH');
  function domainRows(){
    return {
      reviews:bseTransplantRowsByName_(book,'TEST_TRANSPLANT_REVIEW',BSE_TRANSPLANT_REVIEW_HEADERS)
        .filter(r=>String(r[1])===sourceKey),
      events:bseTransplantRowsByName_(book,'TEST_TRANSPLANT_EVENT',BSE_TRANSPLANT_EVENT_HEADERS)
        .filter(r=>String(r[0])===sourceKey),
      statuses:bseTransplantRowsByName_(book,'TEST_ALLOCATION_STATUS_EVENT',BSE_ALLOCATION_STATUS_EVENT_HEADERS)
        .filter(r=>String(r[0])===sourceKey)
    };
  }
  const before=domainRows();
  if(before.reviews.length||before.events.length||before.statuses.length)
    throw Error('GATE_I_188_PARTIAL_OR_ALREADY_WRITTEN_RECONCILE');
  const result=bseTelegramApprovalCallback_(callback);
  if(result&&result.authorized===false)throw Error('GATE_I_188_NOT_AUTHORIZED');
  const after=domainRows();
  const nowCard=bseApprovalRows_(approvalSheet).filter(r=>String(r[0])===reference),
        nowQueue=bseCropBatchRows_(queue,BSE_TG_QUEUE_HEADERS.length)
          .filter(r=>String(r[0])===updateId);
  if(after.reviews.length!==1||String(after.reviews[0][5])!=='APPROVED'||
     after.events.length!==1||String(after.events[0][8])!=='M5P3|M5P4'||
     after.statuses.length!==2||
     after.statuses.map(r=>String(r[6])).sort().join('|')!=='M5P3|M5P4'||
     after.statuses.some(r=>String(r[7])!=='PLANNED'||String(r[8])!=='ACTIVE')||
     nowCard.length!==1||String(nowCard[0][17])!=='REPORTER_CONFIRMED'||
     nowQueue.length!==1||String(nowQueue[0][6])!=='REPORTER_CONFIRMED')
    throw Error('GATE_I_188_PARTIAL_RECOVERY_READBACK_REQUIRED');
  callbackSheet.getRange(first.index+2,6,1,6).setValues([
    ['PROCESSED',Number(first.row[6]),'',String(first.row[8]),new Date().toISOString(),'']
  ]);
  SpreadsheetApp.flush();
  const read=callbackSheet.getRange(first.index+2,6,1,6).getValues()[0];
  if(String(read[0])!=='PROCESSED')throw Error('GATE_I_188_LEDGER_READBACK_FAILED');
  const summary={reference,callback_update_id:'772257189',card_id:cardId,
    transplant_events:1,allocation_status_events:2,other_callback:'FAILED_CALLBACK_RETRY_LIMIT',
    production_write:false,official_bse_write:false};
  console.log('GATE_I_188_RECOVERED_VERIFIED '+JSON.stringify(summary));
  return summary;
}
