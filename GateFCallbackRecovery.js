// Gate F dedicated callback recovery. No GCP migration, no general automation.
// Persist-only phase deliberately does NOT invoke a domain writer.
function bseGateFSelectCallback_(updates,card,ownerId){
  if(!Array.isArray(updates))throw Error('GATE_F_UPDATES_INVALID');
  const token=String(card[10]||''),chatId=String(card[7]||''),messageId=String(card[9]||'');
  if(!/^[A-Za-z0-9]{8,16}$/.test(token)||!/^\d+$/.test(ownerId)||!/^\d+$/.test(chatId)||!/^\d+$/.test(messageId))throw Error('GATE_F_CARD_INVALID');
  const matches=updates.filter(u=>{
    const c=u&&u.callback_query||{},m=c.message||{};
    return Number.isSafeInteger(u.update_id)&&c.data==='B1:'+token+':A'&&
      String(c.from&&c.from.id)===ownerId&&String(m.chat&&m.chat.id)===chatId&&
      String(m.message_id)===messageId&&String(m.chat&&m.chat.type)==='private';
  });
  if(matches.length!==1)throw Error(matches.length?'GATE_F_CALLBACK_AMBIGUOUS':'GATE_F_CALLBACK_NOT_FOUND');
  return matches[0];
}
function gateFRecoverCallbackDurable(){
 const b=getBsePilotOperationRuntimeBindingStatus(),p=PropertiesService.getScriptProperties();
 if(b.environment!=='PILOT_OPERATION'||b.automation!=='OFF')throw Error('GATE_F_BOUNDARY');
 const book=boundTestBook_(),q=bseTelegramQueue_(book);
 if(q.getLastRow()!==2)throw Error('GATE_F_QUEUE_COUNT');
 const qr=q.getRange(2,1,1,BSE_TG_QUEUE_HEADERS.length).getValues()[0];
 if(String(qr[0])!=='772257142'||String(qr[6])!=='NEEDS_HUMAN_REVIEW'||String(qr[7])!=='SENT')throw Error('GATE_F_QUEUE_INVALID');
 const cards=bseApprovalRows_(bseTelegramApprovalSheet_(book)).filter(r=>String(r[0])==='BSE-TG-772257142');
 if(cards.length!==1||String(cards[0][17])!=='OPEN')throw Error('GATE_F_CARD_STATE');
 const ledger=bseTelegramApprovalCallbackSheet_(book);
 const existing=ledger.getLastRow()>1?ledger.getRange(2,1,ledger.getLastRow()-1,BSE_APPROVAL_CALLBACK_HEADERS.length).getValues():[];
 if(existing.length)throw Error('GATE_F_LEDGER_NONEMPTY_RECONCILE');
 const offset=Number(p.getProperty('BSE_TELEGRAM_OFFSET'));
 if(!Number.isSafeInteger(offset)||offset<772257143)throw Error('GATE_F_OFFSET_INVALID');
 if(bseTelegramApi_('getWebhookInfo',{}).url)throw Error('GATE_F_WEBHOOK_ACTIVE');
 const updates=bseTelegramApi_('getUpdates',{offset:offset,limit:100,timeout:0,allowed_updates:['message','edited_message','callback_query']});
 const chosen=bseGateFSelectCallback_(updates,cards[0],String(cards[0][3]));
 // Leave all earlier/other transport updates untouched; gaps are not acknowledged blindly.
 if(updates.some(u=>u.update_id<chosen.update_id))throw Error('GATE_F_OLDER_UPDATES_UNRESOLVED');
 const outcome=bseTelegramApprovalPersistCallback_(book,chosen);
 if(!outcome.persisted&&!outcome.duplicate)throw Error('GATE_F_LEDGER_WRITE_FAILED');
 const read=ledger.getLastRow()>1?ledger.getRange(2,1,ledger.getLastRow()-1,BSE_APPROVAL_CALLBACK_HEADERS.length).getValues():[];
 if(read.filter(r=>String(r[0])===String(chosen.update_id)&&String(r[5])==='PENDING').length!==1)throw Error('GATE_F_LEDGER_READBACK_FAILED');
 // Advance only to callback+1 after durable readback; any subsequent updates remain pending.
 p.setProperty('BSE_TELEGRAM_OFFSET',String(chosen.update_id+1));
 if(p.getProperty('BSE_TELEGRAM_OFFSET')!==String(chosen.update_id+1))throw Error('GATE_F_OFFSET_READBACK_FAILED');
 console.log('GATE_F_CALLBACK_DURABLE '+JSON.stringify({update_id:chosen.update_id,ledger:'PENDING',offset:String(chosen.update_id+1),approval:'OPEN',domain_write:false,automation:'OFF'}));
}
