/** @NotOnlyCurrentDoc */
// Opens only the fixed BSE TEST spreadsheet for unattended triggers.
// Install manually after reviewing the TEST receiver and worker.
function bseTelegramAutomationBook_() {
  const id=bseRuntimeSpreadsheetId_();
  const book=SpreadsheetApp.openById(id);
  SpreadsheetApp.setActiveSpreadsheet(book);
  boundTestBook_();
}
function installBseTelegramTestAutomation() {
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(1000))throw new Error('Barisan sibuk; cuba pemasangan kemudian.');
  try {
    if(bseRuntimeEnvironmentName_()!=='TEST')throw new Error(bseRuntimeEnvironmentLabel_()+' general automation kekal OFF; hanya TEST installer dibenarkan. PILOT_OPERATION menunggu Gate H.');
    bseTelegramAutomationBook_();
    const props=PropertiesService.getScriptProperties();
    const chat=props.getProperty('TELEGRAM_TEST_CHAT_ID'),user=props.getProperty('TELEGRAM_TEST_USER_ID');
    if(!chat||chat!==user||!props.getProperty('GEMINI_API_KEY')||props.getProperty('GEMINI_MODEL')!=='gemini-3.1-flash-lite')throw new Error('Konfigurasi TEST belum lengkap.');
    const connection=testBseTelegramConnection();
    if(connection.webhook_active)throw new Error('Webhook aktif; automasi polling tidak dipasang.');
    const handler='bseTelegramTick',legacy=['bseTelegramReceiveTick','bseTelegramWorkerTick'];
    // Disable until the single TEST trigger exists. Unrelated project triggers are untouched.
    props.setProperty('BSE_TELEGRAM_AUTOMATION','OFF');
    const triggers=ScriptApp.getProjectTriggers();
    triggers.filter(t=>legacy.includes(t.getHandlerFunction())).forEach(t=>ScriptApp.deleteTrigger(t));
    const matches=triggers.filter(t=>t.getHandlerFunction()===handler);
    if(!matches.length)ScriptApp.newTrigger(handler).timeBased().everyMinutes(1).create();
    matches.slice(1).forEach(t=>ScriptApp.deleteTrigger(t));
    props.setProperty('BSE_TELEGRAM_AUTOMATION','ON');
    console.log('TELEGRAM_AUTOMATION_ON: receiver kemudian worker dalam satu tick kira-kira setiap minit; TEST sahaja.');
  } finally {lock.releaseLock();}
}
function stopBseTelegramTestAutomation() {
  PropertiesService.getScriptProperties().setProperty('BSE_TELEGRAM_AUTOMATION','OFF');
  ScriptApp.getProjectTriggers().filter(t=>['bseTelegramTick','bseTelegramReceiveTick','bseTelegramWorkerTick'].includes(t.getHandlerFunction())).forEach(t=>ScriptApp.deleteTrigger(t));
  console.log('TELEGRAM_AUTOMATION_OFF: trigger dihentikan; run yang sudah berjalan mungkin akan selesai. Data dikekalkan.');
}
function bseTelegramTick() {
  const env=bseRuntimeEnvironmentName_(),props=PropertiesService.getScriptProperties();
  if(props.getProperty('BSE_TELEGRAM_AUTOMATION')!=='ON')return;
  if(env==='PILOT_OPERATION'){
    // Installer is Gate H only. A stale trigger cannot bypass the runtime binding.
    const state=getBsePilotOperationRuntimeBindingStatus();
    if(!state.spreadsheet_bound||!state.evidence_folder_bound||
       state.production_write!==false||state.official_bse_write!==false)
      throw Error('GATE_H_RUNTIME_BOUNDARY_FAILED');
    const authorizedId=String(props.getProperty('BSE_PILOT_GATE_H_TRIGGER_ID')||'');
    if(!authorizedId||!ScriptApp.getProjectTriggers().some(t=>
       t.getHandlerFunction()==='bseTelegramTick'&&t.getUniqueId()===authorizedId))
      throw Error('GATE_H_TRIGGER_AUTHORITY_MISSING');
    bseTelegramAutomationBook_();
    try {
      receiveBseTelegramTest(); // Durable receive + approval/evidence/registration callbacks.
    } catch (error) {
      // Another authorized receive may own ScriptLock (e.g. a pilot digest trigger).
      // The next minute tick resumes from the unchanged durable Telegram offset.
      if (String(error && error.message || error) === 'Penerimaan lain sedang berjalan.') {
        console.log('GATE_H_RECEIVER_BUSY_DEFERRED '+JSON.stringify({
          status:'RETRY_NEXT_TICK',production_write:false,official_bse_write:false
        }));
        return {status:'RETRY_NEXT_TICK',production_write:false,official_bse_write:false};
      }
      throw error; // Never mask actual Telegram/network/API or authority failures.
    }
    processBseTelegramApprovalCallbacks(); // Drains one additional durable callback.
    processBseTelegramTestQueue();
    return;
  }
  // Preserve legacy TEST behavior; PILOT_TEST automation remains unsupported.
  if(env!=='TEST')return;
  bseTelegramAutomationBook_();
  receiveBseTelegramTest();
  processBseTelegramTestQueue();
}
function bseTelegramReceiveTick() {
  if(bseRuntimeEnvironmentName_()==='PILOT_OPERATION')return;
  if(PropertiesService.getScriptProperties().getProperty('BSE_TELEGRAM_AUTOMATION')!=='ON')return;
  bseTelegramAutomationBook_();receiveBseTelegramTest();
}
function bseTelegramWorkerTick() {
  if(bseRuntimeEnvironmentName_()==='PILOT_OPERATION')return;
  if(PropertiesService.getScriptProperties().getProperty('BSE_TELEGRAM_AUTOMATION')!=='ON')return;
  bseTelegramAutomationBook_();processBseTelegramTestQueue();
}

