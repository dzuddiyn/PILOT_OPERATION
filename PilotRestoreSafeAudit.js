/** RESTORE-SAFE read-only runtime audit. Never log tokens, Telegram identities or secrets. */
function inspectBseRestoreSafeRuntime(){
 const p=PropertiesService.getScriptProperties();
 const binding=getBsePilotOperationRuntimeBindingStatus();
 const triggers=ScriptApp.getProjectTriggers().map(t=>({
   handler:String(t.getHandlerFunction()),type:String(t.getEventType()),source:String(t.getTriggerSource())
 }));
 const book=SpreadsheetApp.openById(BSE_PILOT_OPERATION_BINDING.spreadsheetId);
 const names=['PILOT_TELEGRAM_QUEUE','PILOT_TELEGRAM_APPROVAL_CALLBACK_PENDING',
 'PILOT_TELEGRAM_REGISTRATION_CALLBACK_PENDING','PILOT_CROP_BATCH','PILOT_PLOT_ALLOCATION',
 'PILOT_OPERATION_LOG','PILOT_OWNER_REGISTRY','PILOT_TELEGRAM_USER_REGISTRY','PILOT_KB_FACTS'];
 const rows={};
 names.forEach(n=>{const s=book.getSheetByName(n);rows[n]=s?Math.max(0,s.getLastRow()-1):-1;});
 const out={environment:binding.environment,spreadsheet_bound:binding.spreadsheet_bound,
 evidence_folder_bound:binding.evidence_folder_bound,automation:binding.automation,
 production_write:false,official_bse_write:false,
 script_properties:{telegram_offset_configured:/^\d+$/.test(String(p.getProperty('BSE_TELEGRAM_OFFSET')||'')),
 gate_h_trigger_marker:!!p.getProperty('BSE_PILOT_GATE_H_TRIGGER_ID'),
 daily_digest_enabled:String(p.getProperty('BSE_DAILY_DIGEST_ENABLED')||''),
 weekly_digest_enabled:String(p.getProperty('BSE_FRIDAY_WEEKLY_DIGEST_ENABLED')||''),
 daily_trigger_property_configured:!!p.getProperty('BSE_DAILY_DIGEST_TRIGGER_UID'),
 weekly_trigger_property_configured:!!p.getProperty('BSE_FRIDAY_WEEKLY_DIGEST_TRIGGER_UID')},
 trigger_count:triggers.length,triggers:triggers,rows:rows};
 console.log('BSE_RESTORE_SAFE_RUNTIME '+JSON.stringify(out));
 return out;
}
