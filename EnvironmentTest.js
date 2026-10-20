/**
 * Environment adapter for OpsMate TEST / PILOT_TEST / PILOT_OPERATION.
 *
 * TEST remains the default so existing regression/runtime behavior is unchanged.
 * PILOT_TEST and PILOT_OPERATION must be explicitly bound to separate
 * spreadsheet / Telegram configuration / Drive evidence resources.
 * PILOT_OPERATION may store real pilot data in its own resources, but no
 * environment may enable official BSE or production-system writes.
 */

const BSE_PILOT_TEST_BINDING = Object.freeze({
  spreadsheetId: '1wGty1mg-KwCD0RvfC7YkkyiVV8BOF1L0YUM_NnlKnEs',
  evidenceFolderId: '1G7fkLlXJyu35ZIV67LGVrduQ-8uHNnqG'
});

const BSE_PILOT_OPERATION_BINDING = Object.freeze({
  spreadsheetId: '1gbuxsuXMWaV7IKv8l5Hnr_VlVBNpWAQ4H4E9Pp4xqDs',
  evidenceFolderId: '1PhQ_BAtqk--z43UmtE7t8Aa7dM5J5NhG'
});

const BSE_RUNTIME_ENV_CONFIG = Object.freeze({
  TEST: Object.freeze({
    name: 'TEST',
    label: 'TEST',
    startToken: 'BSE_TEST',
    spreadsheetProperty: '',
    approvalGroupsProperty: 'BSE_TEST_APPROVAL_GROUP_CHAT_IDS',
    legacyChatProperty: 'TELEGRAM_TEST_CHAT_ID',
    legacyUserProperty: 'TELEGRAM_TEST_USER_ID',
    evidenceFolderProperty: 'BSE_TEST_EVIDENCE_DRIVE_FOLDER_ID',
    botUsernameDefault: 'bse_kerani_test_bot'
  }),
  PILOT_TEST: Object.freeze({
    name: 'PILOT_TEST',
    label: 'PILOT TEST',
    startToken: 'BSE_PILOT_TEST',
    spreadsheetProperty: 'BSE_PILOT_TEST_SPREADSHEET_ID',
    approvalGroupsProperty: 'BSE_PILOT_TEST_APPROVAL_GROUP_CHAT_IDS',
    legacyChatProperty: 'PILOT_TEST_TELEGRAM_CHAT_ID',
    legacyUserProperty: 'PILOT_TEST_TELEGRAM_USER_ID',
    evidenceFolderProperty: 'BSE_PILOT_TEST_EVIDENCE_DRIVE_FOLDER_ID',
    botUsernameDefault: ''
  }),
  PILOT_OPERATION: Object.freeze({
    name: 'PILOT_OPERATION',
    label: 'PILOT',
    startToken: 'OpsMate',
    spreadsheetProperty: 'BSE_PILOT_OPERATION_SPREADSHEET_ID',
    approvalGroupsProperty: 'BSE_PILOT_OPERATION_APPROVAL_GROUP_CHAT_IDS',
    legacyChatProperty: 'PILOT_OPERATION_TELEGRAM_CHAT_ID',
    legacyUserProperty: 'PILOT_OPERATION_TELEGRAM_USER_ID',
    evidenceFolderProperty: 'BSE_PILOT_OPERATION_EVIDENCE_DRIVE_FOLDER_ID',
    botUsernameDefault: ''
  })
});

function bseRuntimeEnvironmentName_() {
  const props = PropertiesService.getScriptProperties();
  const configured = String(props.getProperty('BSE_RUNTIME_ENV') || '').trim().toUpperCase();
  if (configured) {
    if (!Object.prototype.hasOwnProperty.call(BSE_RUNTIME_ENV_CONFIG, configured)) throw new Error('BSE_RUNTIME_ENV mesti TEST, PILOT_TEST atau PILOT_OPERATION.');
    return configured;
  }
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active && active.getId) {
      if (active.getId() === BSE_PILOT_OPERATION_BINDING.spreadsheetId) return 'PILOT_OPERATION';
      if (active.getId() === BSE_PILOT_TEST_BINDING.spreadsheetId) return 'PILOT_TEST';
    }
  } catch (_) { }
  return 'TEST';
}

function bseRuntimeEnvironmentConfig_() {
  return BSE_RUNTIME_ENV_CONFIG[bseRuntimeEnvironmentName_()];
}

function bseRuntimeIsPilotEnvironment_() {
  return ['PILOT_TEST','PILOT_OPERATION'].includes(bseRuntimeEnvironmentName_());
}

function bseRuntimeEnvironmentBinding_() {
  const env=bseRuntimeEnvironmentName_();
  if(env==='PILOT_TEST')return BSE_PILOT_TEST_BINDING;
  if(env==='PILOT_OPERATION')return BSE_PILOT_OPERATION_BINDING;
  return null;
}

function bseRuntimeEnvironmentLabel_() {
  return bseRuntimeEnvironmentConfig_().label;
}

function bseRuntimeSpreadsheetId_() {
  const cfg = bseRuntimeEnvironmentConfig_();
  if (cfg.name === 'TEST') return BSE_TEST.spreadsheetId;
  const binding=bseRuntimeEnvironmentBinding_();
  const configured = String(PropertiesService.getScriptProperties().getProperty(cfg.spreadsheetProperty) || '').trim();
  const id = configured || (binding ? binding.spreadsheetId : '');
  if (!/^[A-Za-z0-9_-]{20,}$/.test(id)) {
    throw new Error(cfg.spreadsheetProperty + ' belum disimpan atau tidak sah.');
  }
  if (!binding || id !== binding.spreadsheetId) {
    throw new Error('SOURCE_MISMATCH: ' + cfg.name + ' spreadsheet ID tidak sepadan dengan binding terkunci.');
  }
  return id;
}

function bseRuntimeAssertWorkbookId_(actualId) {
  const expected = bseRuntimeSpreadsheetId_();
  if (String(actualId || '') !== expected) {
    throw new Error('CROSS_ENVIRONMENT_WRITE_REJECTED: workbook runtime tidak sepadan dengan ' + bseRuntimeEnvironmentLabel_() + '.');
  }
  return true;
}

function bseRuntimeStartToken_() {
  return bseRuntimeEnvironmentConfig_().startToken;
}

function bseRuntimeRegexEscape_(value) {
  return String(value || '').replace(/[.*+?^\${}()|[\]\\]/g, '\\$&');
}

function bseRuntimeStartCommandMatches_(text, botUsernameOverride) {
  const username=String(botUsernameOverride || bseRuntimeBotUsername_()).replace(/^@/, '');
  const pattern=new RegExp('^/start(?:@'+bseRuntimeRegexEscape_(username)+')?\\s+'+bseRuntimeRegexEscape_(bseRuntimeStartToken_())+'\\s*$','i');
  if (bseRuntimeEnvironmentName_()==='PILOT_OPERATION' &&
      new RegExp('^/start(?:@'+bseRuntimeRegexEscape_(username)+')?\\s*$','i').test(String(text || '')))
    return true; // Native Telegram Start creates REGISTRATION_PENDING; only owner can approve.
  return pattern.test(String(text || ''));
}

function bseRuntimeBotUsername_() {
  const cfg = bseRuntimeEnvironmentConfig_();
  const configured = String(PropertiesService.getScriptProperties().getProperty('BSE_TELEGRAM_BOT_USERNAME') || '').trim().replace(/^@/, '');
  const username = configured || cfg.botUsernameDefault;
  if (!/^[A-Za-z0-9_]{5,32}$/.test(username)) {
    throw new Error('BSE_TELEGRAM_BOT_USERNAME belum disimpan atau tidak sah untuk ' + cfg.label + '.');
  }
  return username;
}

function bseRuntimeApprovalGroupsRaw_() {
  const cfg = bseRuntimeEnvironmentConfig_();
  return PropertiesService.getScriptProperties().getProperty(cfg.approvalGroupsProperty) || '';
}

function bseRuntimeLegacyChatId_() {
  const cfg = bseRuntimeEnvironmentConfig_();
  return String(PropertiesService.getScriptProperties().getProperty(cfg.legacyChatProperty) || '').trim();
}

function bseRuntimeLegacyUserId_() {
  const cfg = bseRuntimeEnvironmentConfig_();
  return String(PropertiesService.getScriptProperties().getProperty(cfg.legacyUserProperty) || '').trim();
}

function bseRuntimeEvidenceFolderId_() {
  const cfg = bseRuntimeEnvironmentConfig_();
  const configured = String(PropertiesService.getScriptProperties().getProperty(cfg.evidenceFolderProperty) || '').trim();
  if (cfg.name === 'TEST') return configured;
  const binding=bseRuntimeEnvironmentBinding_();
  const id = configured || (binding ? binding.evidenceFolderId : '');
  if (!binding || (id && id !== binding.evidenceFolderId)) {
    throw new Error('SOURCE_MISMATCH: ' + cfg.name + ' evidence folder ID tidak sepadan dengan binding terkunci.');
  }
  return id;
}

function bseRuntimeEvidenceConfirmedStatus_(){return bseRuntimeEnvironmentName_()==='PILOT_OPERATION'?'CONFIRMED':'CONFIRMED_TEST';}
function bseRuntimeEvidenceIsConfirmed_(status){const env=bseRuntimeEnvironmentName_(),value=String(status||'');return value===(env==='PILOT_OPERATION'?'CONFIRMED':'CONFIRMED_TEST')||(env==='PILOT_OPERATION'&&value==='CONFIRMED_TEST');}
function bseRuntimeEvidenceFolderProperty_() {
  return bseRuntimeEnvironmentConfig_().evidenceFolderProperty;
}

function bseRuntimeSheetName_(legacyName) {
  const name = String(legacyName || '');
  const env=bseRuntimeEnvironmentName_();
  if (env === 'TEST') return name;
  const prefix=env==='PILOT_OPERATION'?'PILOT':'PILOT_TEST';
  if (/^TEST_/.test(name)) return name.replace(/^TEST_/, prefix + '_');
  if (/^TELEGRAM_TEST_/.test(name)) return name.replace(/^TELEGRAM_TEST_/, prefix + '_TELEGRAM_');
  if (/^GOOGLE_TASKS_TEST_/.test(name)) return name.replace(/^GOOGLE_TASKS_TEST_/, prefix + '_GOOGLE_TASKS_');
  if (name === 'GEMINI_TEST_RESULTS') return prefix + '_GEMINI_RESULTS';
  if (name === 'SCRIPT_TEST_RESULTS') return prefix + '_SCRIPT_RESULTS';
  return name;
}

function bseRuntimeBook_(book) {
  if (!book) throw new Error('Workbook runtime tidak tersedia.');
  return {
    getId: function(){ return book.getId(); },
    getSheetByName: function(name){ return book.getSheetByName(bseRuntimeSheetName_(name)); },
    insertSheet: function(name){ return book.insertSheet(bseRuntimeSheetName_(name)); },
    getActiveRange: function(){ return book.getActiveRange(); },
    toast: function(){ return book.toast.apply(book, arguments); }
  };
}

// Translate inherited fixed TEST UI headings in PILOT_OPERATION outgoing presentation only.
// Keep source notes, TEST_ONLY markers, TEST and PILOT_TEST environments unchanged.
function bseRuntimePilotUiLabels_(text) {
  // User-facing PILOT messages show business facts, not environment/test bookkeeping.
  // Never change source notes, TEST_ONLY markers, or the TEST/PILOT_TEST transports.
  return String(text||'')
    .replace(/^\[PILOT\]\r?\n/,'')
    .replace(/^\[PILOT TEST\]\r?\n/gm,'')
    .replace(/<b>\[PILOT TEST\]<\/b>/g,'')
    .replace(/^Pendaftaran ahli TEST baharu\b/gm,'Permohonan pendaftaran ahli baharu')
    .replace(/^Pendaftaran TEST\b/gm,'Pendaftaran')
    .replace(/^Pendaftaran TEST anda\b/gm,'Pendaftaran anda')
    .replace(/^Permohonan pendaftaran TEST\b/gm,'Permohonan pendaftaran')
    .replace(/^Akses owner\/admin TEST aktif\.$/gm,'Akses owner/admin aktif.')
    .replace(/^OCR TEST\b/gm,'OCR')
    .replace(/^Hasil OCR TEST\b/gm,'Hasil OCR')
    .replace(/^Evidence TEST\b/gm,'Lampiran')
    .replace(/^History hanya boleh diminta melalui PM oleh owner\/admin atau user TEST yang aktif\.$/gm,'Sejarah hanya boleh diminta melalui PM oleh pengguna yang dibenarkan.')
    .replace(/\bRekod production\b/g,'rekod rasmi')
    .replace(/^Rujukan (BSE-TG-\d+):\r?\nTREATMENT_EVENT\r?\nStatus: PROVISIONAL[^\r\n]*\r?\nMod TEST[^\r\n]*/gm,
      'Laporan racun telah disediakan untuk semakan.\nRujukan: $1\nSila pilih Benar atau Batal pada kad semakan.')
    .replace(/^EC LEACHING TEST\b/gm,'EC Leaching')
    .replace(/^Tiada rekod EC Leaching TEST yang disahkan dalam sela masa ini\.$/gm,'Tiada rekod EC Leaching yang disahkan dalam tempoh ini.')
    .replace(/^Bot BSE TEST sedia menerima laporan teks\. Tiada rekod production akan ditulis\.$/gm,'Bot BSE OpsMate sedia menerima laporan teks.')
    .replace(/^Pemerhatian aset belum disokong dalam TEST\.$/gm,'Pemerhatian aset belum disokong buat masa ini.')
    .replace(/^Semakan TEST\b/gm,'Semakan laporan')
    .replace(/^Rekod TEST\b/gm,'Rekod')
    .replace(/^Resit TEST\b/gm,'Resit')
    .replace(/^Evidence TEST\b/gm,'Lampiran')
    .replace(/^Semakan Evidence TEST\b/gm,'Semakan lampiran')
    .replace(/^Resit Evidence TEST\b/gm,'Resit lampiran')
    .replace(/^Rujukan Evidence TEST\b/gm,'Rujukan lampiran')
    .replace(/^OCR CONFIRMED TEST\b/gm,'OCR disahkan')
    .replace(/^OCR hanya untuk Evidence yang sudah CONFIRMED_TEST\.$/gm,'OCR hanya untuk lampiran yang sudah disahkan.')
    .replace(/^Status: CONFIRMED_TEST$/gm,'Status: Disahkan')
    .replace(/(Semakan lampiran BSE-EV-[A-Za-z0-9_-]+\s+—\s+)CONFIRMED TEST\b/g,'$1DISAHKAN')
    .replace(/^Status: APPROVED_TEST$/gm,'Status: Disahkan dalam pilot')
    .replace(/^Kategori dicadang: FIELD_OPERATION$/gm,'Kategori dicadang: Operasi ladang / peralatan')
    .replace(/^Kategori dicadang: UNCLASSIFIED_TEST$/gm,'Kategori dicadang: Belum dikenal pasti')
    .replace(/^Kategori: FIELD_OPERATION$/gm,'Kategori: Operasi ladang / peralatan')
    .replace(/^Kategori: UNCLASSIFIED_TEST$/gm,'Kategori: Belum dikenal pasti')
    .replace(/^Status Plot TEST\b/gm,'Status Plot')
    .replace(/^Rumusan Plot TEST\b/gm,'Rumusan Plot')
    .replace(/^Makluman TEST\b/gm,'Makluman')
    .replace(/^Laporan diterima dan sudah disimpan untuk diproses\. Rujukan: (BSE-TG-\d+)\.(?: \(Mod TEST\))?$/gm,'Memproses Rekod / Laporan.\n<i>Rujukan: $1</i>')
    .replace(/^Laporan TEST\b/gm,'Laporan')
    .replace(/^TREATMENT_EVENT$/gm,'Rawatan / Racun')
    .replace(/^Treatment_Event_Log\s*\|/gm,'Rawatan / Racun |')
    .replace(/^Kategori: PRIVATE_SUBMISSION[^\r\n]*(?:\r?\n)?/gm,'')
    .replace(/^Status: REPORTER_CONFIRMED\b/gm,'Status: Disahkan oleh penghantar')
    .replace(/^Sejarah TEST\b/gm,'Sejarah operasi')
    .replace(/^Tiada rekod TEST yang boleh dipaparkan dalam sela masa ini\.$/gm,'Tiada rekod operasi dalam tempoh ini.')
    .replace(/ \| PRIVATE_SUBMISSION \| /g,' | ')
    .replace(/ \| Treatment_Event_Log \| /g,' | Rawatan / Racun | ')
    .replace(/^Tiada allocation ACTIVE TEST yang diluluskan\.$/gm,'Tiada rekod tanaman berstatus aktif untuk plot ini.')
    .replace(/allocation ACTIVE TEST/g,'rekod tanaman aktif')
    .replace(/^Status allocation:/gm,'Status tanaman:')
    .replace(/REPORTER_CONFIRMED oleh /g,'Disahkan oleh ')
    .replace(/DISCARDED_BY_REPORTER oleh /g,'Dibatalkan oleh ')
    .replace(/^Status: PROVISIONAL[^\r\n]*/gm,'Menunggu pengesahan laporan.')
    // Preserve this user-actionable unsupported-input notice BEFORE stripping
    // the legacy mode prefix; otherwise Telegram rejects the empty message.
    .replace(/^Mod TEST ini menerima laporan teks sahaja\. Sila hantar semula sebagai teks\.$/gm,
      'Mesej bukan teks tidak diproses. Sila hantar laporan dalam bentuk teks.')
    .replace(/^Mod (?:TEST|PILOT|PILOT_OPERATION)\b[^\r\n]*(?:\r?\n)?/gm,'')
    .replace(/^Tiada rekod production[^\r\n]*(?:\r?\n)?/gm,'')
    .replace(/^Shadow pilot sahaja[^\r\n]*(?:\r?\n)?/gm,'')
    .replace(/\n{3,}/g,'\n\n')
    .trim();
}
function bseRuntimeTelegramPayload_(method, payload) {
  const body = Object.assign({},payload || {});
  const env=bseRuntimeEnvironmentName_();
  if(env==='PILOT_OPERATION'){
    if(['sendMessage','editMessageText'].includes(method) && typeof body.text==='string')
    { body.text=bseRuntimePilotUiLabels_(body.text);
      if(/^Memproses Rekod \/ Laporan\.\n<i>Rujukan: BSE-TG-\d+<\/i>$/.test(body.text))body.parse_mode='HTML'; }
    if(['sendPhoto','sendDocument','sendVideo'].includes(method) && typeof body.caption==='string')
      body.caption=bseRuntimePilotUiLabels_(body.caption);
    return body;
  }
  if(env!=='PILOT_TEST')return body;
  const prefix='[PILOT TEST]';
  if(['sendMessage','editMessageText'].includes(method) && typeof body.text==='string' && !body.text.startsWith(prefix))
    body.text=prefix+'\n'+body.text;
  if(['sendPhoto','sendDocument','sendVideo'].includes(method) && typeof body.caption==='string' && !body.caption.startsWith(prefix))
    body.caption=prefix+'\n'+body.caption;
  return body;
}
function BSE_PILOT_RUNTIME_ISOLATION_PROBE() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active || !active.getId) return JSON.stringify({status:'FAILED',reason:'ACTIVE_WORKBOOK_UNAVAILABLE',production_write:false});
  const actual = active.getId();
  const environment = bseRuntimeEnvironmentName_();
  const binding=bseRuntimeEnvironmentBinding_();
  if (!binding) return JSON.stringify({status:'FAILED',reason:'NOT_PILOT_ENVIRONMENT',production_write:false});
  bseRuntimeAssertWorkbookId_(actual);
  let crossRejected = false;
  try { bseRuntimeAssertWorkbookId_(BSE_TEST.spreadsheetId); }
  catch (error) { crossRejected = /^CROSS_ENVIRONMENT_WRITE_REJECTED:/.test(String(error&&error.message||error)); }
  return JSON.stringify({
    status: crossRejected ? 'PASS' : 'FAILED',
    environment: environment,
    workbook_match: actual === binding.spreadsheetId,
    domain_sheet: bseRuntimeSheetName_('TEST_TREATMENT_EVENT'),
    queue_sheet: bseRuntimeSheetName_('TELEGRAM_TEST_QUEUE'),
    evidence_folder_match: bseRuntimeEvidenceFolderId_() === binding.evidenceFolderId,
    cross_environment_rejected: crossRejected,
    production_write: false,
    official_bse_write: false
  });
}

function BSE_PILOT_RUNTIME_REGRESSION_PROBE() {
  if (!bseRuntimeIsPilotEnvironment_()) return JSON.stringify({status:'FAILED',reason:'NOT_PILOT_ENVIRONMENT',production_write:false});
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active || !active.getId) return JSON.stringify({status:'FAILED',reason:'ACTIVE_WORKBOOK_UNAVAILABLE',production_write:false});
  bseRuntimeAssertWorkbookId_(active.getId());
  const result = runBseI011FullRegression();
  return JSON.stringify({
    status: result.failed === 0 ? 'PASS' : 'FAILED',
    environment: 'PILOT_TEST',
    total: result.total,
    passed: result.passed,
    failed: result.failed,
    production_write: false,
    official_bse_write: false
  });
}

function configureBsePilotTestRuntimeBinding() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('BSE_RUNTIME_ENV','PILOT_TEST');
  props.setProperty('BSE_PILOT_TEST_SPREADSHEET_ID',BSE_PILOT_TEST_BINDING.spreadsheetId);
  props.setProperty('BSE_PILOT_TEST_EVIDENCE_DRIVE_FOLDER_ID',BSE_PILOT_TEST_BINDING.evidenceFolderId);
  props.setProperty('BSE_TELEGRAM_AUTOMATION','OFF');
  return getBsePilotTestRuntimeBindingStatus();
}

function getBsePilotTestRuntimeBindingStatus() {
  const props = PropertiesService.getScriptProperties();
  const env = String(props.getProperty('BSE_RUNTIME_ENV') || '').trim().toUpperCase();
  const sheet = String(props.getProperty('BSE_PILOT_TEST_SPREADSHEET_ID') || '').trim();
  const evidence = String(props.getProperty('BSE_PILOT_TEST_EVIDENCE_DRIVE_FOLDER_ID') || '').trim();
  const automation = String(props.getProperty('BSE_TELEGRAM_AUTOMATION') || 'OFF').trim().toUpperCase();
  return {
    environment: env,
    spreadsheet_bound: sheet === BSE_PILOT_TEST_BINDING.spreadsheetId,
    evidence_folder_bound: evidence === BSE_PILOT_TEST_BINDING.evidenceFolderId,
    automation: automation,
    production_write: false,
    official_bse_write: false
  };
}

function configureBsePilotOperationRuntimeBinding() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('BSE_RUNTIME_ENV','PILOT_OPERATION');
  props.setProperty('BSE_PILOT_OPERATION_SPREADSHEET_ID',BSE_PILOT_OPERATION_BINDING.spreadsheetId);
  props.setProperty('BSE_PILOT_OPERATION_EVIDENCE_DRIVE_FOLDER_ID',BSE_PILOT_OPERATION_BINDING.evidenceFolderId);
  props.setProperty('BSE_TELEGRAM_AUTOMATION','OFF');
  return getBsePilotOperationRuntimeBindingStatus();
}

function getBsePilotOperationRuntimeBindingStatus() {
  const props = PropertiesService.getScriptProperties();
  const env = String(props.getProperty('BSE_RUNTIME_ENV') || '').trim().toUpperCase();
  const sheet = String(props.getProperty('BSE_PILOT_OPERATION_SPREADSHEET_ID') || '').trim();
  const evidence = String(props.getProperty('BSE_PILOT_OPERATION_EVIDENCE_DRIVE_FOLDER_ID') || '').trim();
  const automation = String(props.getProperty('BSE_TELEGRAM_AUTOMATION') || 'OFF').trim().toUpperCase();
  return {
    environment: env,
    spreadsheet_bound: sheet === BSE_PILOT_OPERATION_BINDING.spreadsheetId,
    evidence_folder_bound: evidence === BSE_PILOT_OPERATION_BINDING.evidenceFolderId,
    automation: automation,
    production_write: false,
    official_bse_write: false
  };
}

function runBsePilotTestIsolationWriteProof() {
  if (bseRuntimeEnvironmentName_() !== 'PILOT_TEST') throw new Error('PILOT_TEST runtime belum dipilih.');
  if (bseRuntimeSpreadsheetId_() !== BSE_PILOT_TEST_BINDING.spreadsheetId) throw new Error('PILOT_TEST spreadsheet binding tidak sepadan.');
  if (bseRuntimeEvidenceFolderId_() !== BSE_PILOT_TEST_BINDING.evidenceFolderId) throw new Error('PILOT_TEST evidence folder binding tidak sepadan.');

  const raw = SpreadsheetApp.openById(BSE_PILOT_TEST_BINDING.spreadsheetId);
  bseRuntimeAssertWorkbookId_(raw.getId());
  const book = bseRuntimeBook_(raw);
  const legacyName = 'TEST_ENVIRONMENT_ISOLATION_PROBE';
  const mappedName = bseRuntimeSheetName_(legacyName);
  if (mappedName !== 'PILOT_TEST_ENVIRONMENT_ISOLATION_PROBE') throw new Error('Probe sheet mapping tidak selamat.');
  if (raw.getSheetByName(legacyName)) throw new Error('SOURCE_MISMATCH: TEST probe sheet wujud dalam PILOT_TEST workbook.');

  let sheet = book.getSheetByName(legacyName);
  if (!sheet) sheet = book.insertSheet(legacyName);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1,1,1,6).setValues([['probe_id','environment','workbook_id','mapped_sheet','cross_environment_rejected','production_write']]);
  }
  const probeId = Utilities.getUuid();
  let crossRejected = false;
  try {
    bseRuntimeAssertWorkbookId_(BSE_TEST.spreadsheetId);
  } catch (error) {
    crossRejected = /^CROSS_ENVIRONMENT_WRITE_REJECTED:/.test(String(error && error.message || error));
  }
  if (!crossRejected) throw new Error('Cross-environment workbook guard tidak menolak TEST workbook.');

  sheet.appendRow([probeId,'PILOT_TEST',raw.getId(),mappedName,true,false]);
  SpreadsheetApp.flush();
  return {
    probe_id: probeId,
    environment: 'PILOT_TEST',
    workbook_id: raw.getId(),
    sheet: mappedName,
    cross_environment_rejected: true,
    production_write: false,
    official_bse_write: false
  };
}

function cleanupBsePilotTestIsolationWriteProof(probeId) {
  if (bseRuntimeEnvironmentName_() !== 'PILOT_TEST') throw new Error('PILOT_TEST runtime belum dipilih.');
  const raw = SpreadsheetApp.openById(BSE_PILOT_TEST_BINDING.spreadsheetId);
  bseRuntimeAssertWorkbookId_(raw.getId());
  const name = bseRuntimeSheetName_('TEST_ENVIRONMENT_ISOLATION_PROBE');
  const sheet = raw.getSheetByName(name);
  if (!sheet) return {removed:false,reason:'PROBE_SHEET_NOT_FOUND',production_write:false};
  const rows = sheet.getLastRow()>1 ? sheet.getRange(2,1,sheet.getLastRow()-1,6).getValues() : [];
  const index = rows.findIndex(function(row){return String(row[0])===String(probeId||'');});
  if (index < 0) return {removed:false,reason:'PROBE_ID_NOT_FOUND',production_write:false};
  sheet.deleteRow(index+2);
  if (sheet.getLastRow() <= 1) raw.deleteSheet(sheet);
  SpreadsheetApp.flush();
  return {removed:true,probe_id:String(probeId),production_write:false};
}

function runBseEnvironmentIsolationHarnessTests() {
  const props = PropertiesService.getScriptProperties();
  const oldEnv = props.getProperty('BSE_RUNTIME_ENV');
  const oldSheet = props.getProperty('BSE_PILOT_TEST_SPREADSHEET_ID');
  const oldUser = props.getProperty('BSE_TELEGRAM_BOT_USERNAME');
  const oldGroups = props.getProperty('BSE_PILOT_TEST_APPROVAL_GROUP_CHAT_IDS');
  const oldEvidence = props.getProperty('BSE_PILOT_TEST_EVIDENCE_DRIVE_FOLDER_ID');
  const oldOperationSheet = props.getProperty('BSE_PILOT_OPERATION_SPREADSHEET_ID');
  const oldOperationGroups = props.getProperty('BSE_PILOT_OPERATION_APPROVAL_GROUP_CHAT_IDS');
  const oldOperationEvidence = props.getProperty('BSE_PILOT_OPERATION_EVIDENCE_DRIVE_FOLDER_ID');
  const tests = [];
  const pass = function(id, fn) {
    try { fn(); tests.push({id:id,pass:true}); }
    catch (error) { tests.push({id:id,pass:false,error:String(error.message||error)}); }
  };
  try {
    props.setProperty('BSE_RUNTIME_ENV','PILOT_TEST');
    props.setProperty('BSE_PILOT_TEST_SPREADSHEET_ID','1wGty1mg-KwCD0RvfC7YkkyiVV8BOF1L0YUM_NnlKnEs');
    props.setProperty('BSE_TELEGRAM_BOT_USERNAME','pilot_test_bot');
    props.setProperty('BSE_PILOT_TEST_APPROVAL_GROUP_CHAT_IDS','-1001234567890');
    props.setProperty('BSE_PILOT_TEST_EVIDENCE_DRIVE_FOLDER_ID',BSE_PILOT_TEST_BINDING.evidenceFolderId);

    pass('PILOT_TEST maps domain sheets', function(){
      if (bseRuntimeSheetName_('TEST_TREATMENT_EVENT') !== 'PILOT_TEST_TREATMENT_EVENT') throw new Error('sheet mapping gagal');
    });
    pass('PILOT_TEST maps queue separately', function(){
      if (bseRuntimeSheetName_('TELEGRAM_TEST_QUEUE') !== 'PILOT_TEST_TELEGRAM_QUEUE') throw new Error('queue mapping gagal');
    });
    pass('PILOT_TEST maps result sheets', function(){
      if (bseRuntimeSheetName_('GEMINI_TEST_RESULTS') !== 'PILOT_TEST_GEMINI_RESULTS' || bseRuntimeSheetName_('SCRIPT_TEST_RESULTS') !== 'PILOT_TEST_SCRIPT_RESULTS') throw new Error('result mapping gagal');
    });
    pass('PILOT_TEST start token isolated', function(){
      if (bseRuntimeStartToken_() !== 'BSE_PILOT_TEST') throw new Error('start token salah');
    });
    pass('PILOT_TEST outgoing text labeled', function(){
      const body=bseRuntimeTelegramPayload_('sendMessage',{text:'Semakan',chat_id:'-1001'});
      if (body.text !== '[PILOT TEST]\nSemakan') throw new Error('label hilang');
    });
    pass('PILOT_TEST inherited TEST heading remains unchanged', function(){
      const body=bseRuntimeTelegramPayload_('sendMessage',{text:'Rekod TEST BSE-TG-1',chat_id:'-1001'});
      if (body.text !== '[PILOT TEST]\nRekod TEST BSE-TG-1') throw new Error('PILOT_TEST text changed');
    });
    pass('PILOT_TEST requires separate spreadsheet binding', function(){
      if (bseRuntimeSpreadsheetId_() !== '1wGty1mg-KwCD0RvfC7YkkyiVV8BOF1L0YUM_NnlKnEs') throw new Error('binding salah');
    });
    pass('PILOT_TEST group property isolated', function(){
      if (bseRuntimeApprovalGroupsRaw_() !== '-1001234567890') throw new Error('group property salah');
    });
    pass('PILOT_TEST evidence folder isolated', function(){
      if (bseRuntimeEvidenceFolderId_() !== BSE_PILOT_TEST_BINDING.evidenceFolderId) throw new Error('evidence folder binding salah');
    });
    pass('PILOT_TEST rejects TEST workbook id', function(){
      let rejected=false;
      try { bseRuntimeAssertWorkbookId_(BSE_TEST.spreadsheetId); }
      catch (error) { rejected=/^CROSS_ENVIRONMENT_WRITE_REJECTED:/.test(String(error&&error.message||error)); }
      if (!rejected) throw new Error('cross-environment guard gagal');
    });

    props.setProperty('BSE_RUNTIME_ENV','PILOT_OPERATION');
    props.setProperty('BSE_PILOT_OPERATION_SPREADSHEET_ID',BSE_PILOT_OPERATION_BINDING.spreadsheetId);
    props.setProperty('BSE_PILOT_OPERATION_APPROVAL_GROUP_CHAT_IDS','-1002234567890');
    props.setProperty('BSE_PILOT_OPERATION_EVIDENCE_DRIVE_FOLDER_ID',BSE_PILOT_OPERATION_BINDING.evidenceFolderId);

    pass('PILOT_OPERATION maps domain sheets to PILOT prefix', function(){
      if (bseRuntimeSheetName_('TEST_TREATMENT_EVENT') !== 'PILOT_TREATMENT_EVENT') throw new Error('PILOT domain mapping gagal');
    });
    pass('PILOT_OPERATION maps queue separately', function(){
      if (bseRuntimeSheetName_('TELEGRAM_TEST_QUEUE') !== 'PILOT_TELEGRAM_QUEUE') throw new Error('PILOT queue mapping gagal');
    });
    pass('PILOT_OPERATION maps result sheets', function(){
      if (bseRuntimeSheetName_('GEMINI_TEST_RESULTS') !== 'PILOT_GEMINI_RESULTS' || bseRuntimeSheetName_('SCRIPT_TEST_RESULTS') !== 'PILOT_SCRIPT_RESULTS') throw new Error('PILOT result mapping gagal');
    });
    pass('PILOT_OPERATION start token isolated', function(){
      if (bseRuntimeStartToken_() !== 'OpsMate') throw new Error('PILOT start token salah');
    });
    pass('PILOT_OPERATION outgoing text labeled', function(){
      const body=bseRuntimeTelegramPayload_('sendMessage',{text:'Semakan',chat_id:'-1002'});
      if (body.text !== 'Semakan') throw new Error('PILOT user display changed unexpectedly');
    });
    pass('PILOT_OPERATION inherited retrieval headings normalize to PILOT', function(){
      const body=bseRuntimeTelegramPayload_('sendMessage',{text:'Rekod TEST BSE-TG-1\nMod TEST - tiada production write.',chat_id:'-1002'});
      if (body.text !== 'Rekod BSE-TG-1') throw new Error('PILOT user text did not hide technical status');
      const photo=bseRuntimeTelegramPayload_('sendPhoto',{caption:'Evidence TEST BSE-EV-1',chat_id:'-1002'});
      if(photo.caption !== 'Lampiran BSE-EV-1')throw new Error('PILOT caption normalization failed');
    });
    pass('PILOT_OPERATION user report and TEST_ONLY marker unchanged', function(){
      const note='Nota asal: 16/10/2026 TEST_ONLY Gate H rawatan; Rekod TEST disebut di tengah ayat.';
      const body=bseRuntimeTelegramPayload_('sendMessage',{text:note,chat_id:'-1002'});
      if(body.text !== note)throw new Error('User content changed');
    });
    pass('PILOT_OPERATION binding locked to reserved workbook', function(){
      if (bseRuntimeSpreadsheetId_() !== BSE_PILOT_OPERATION_BINDING.spreadsheetId) throw new Error('PILOT binding salah');
    });
    pass('PILOT_OPERATION group property isolated', function(){
      if (bseRuntimeApprovalGroupsRaw_() !== '-1002234567890') throw new Error('PILOT group property salah');
    });
    pass('PILOT_OPERATION evidence folder isolated', function(){
      if (bseRuntimeEvidenceFolderId_() !== BSE_PILOT_OPERATION_BINDING.evidenceFolderId) throw new Error('PILOT evidence binding salah');
    });
    pass('PILOT_OPERATION rejects PILOT_TEST workbook id', function(){
      let rejected=false;
      try { bseRuntimeAssertWorkbookId_(BSE_PILOT_TEST_BINDING.spreadsheetId); }
      catch (error) { rejected=/^CROSS_ENVIRONMENT_WRITE_REJECTED:/.test(String(error&&error.message||error)); }
      if (!rejected) throw new Error('PILOT_OPERATION cross-environment guard gagal');
    });
    pass('production boundary remains false by design', function(){
      const source=[bseRuntimeEnvironmentName_,bseRuntimeSheetName_,bseRuntimeTelegramPayload_].map(function(fn){return fn.toString();}).join('\n');
      if (/production_write\s*:\s*true/.test(source)) throw new Error('production write ditemukan');
    });
  } finally {
    if (oldEnv == null) props.deleteProperty('BSE_RUNTIME_ENV'); else props.setProperty('BSE_RUNTIME_ENV',oldEnv);
    if (oldSheet == null) props.deleteProperty('BSE_PILOT_TEST_SPREADSHEET_ID'); else props.setProperty('BSE_PILOT_TEST_SPREADSHEET_ID',oldSheet);
    if (oldUser == null) props.deleteProperty('BSE_TELEGRAM_BOT_USERNAME'); else props.setProperty('BSE_TELEGRAM_BOT_USERNAME',oldUser);
    if (oldGroups == null) props.deleteProperty('BSE_PILOT_TEST_APPROVAL_GROUP_CHAT_IDS'); else props.setProperty('BSE_PILOT_TEST_APPROVAL_GROUP_CHAT_IDS',oldGroups);
    if (oldEvidence == null) props.deleteProperty('BSE_PILOT_TEST_EVIDENCE_DRIVE_FOLDER_ID'); else props.setProperty('BSE_PILOT_TEST_EVIDENCE_DRIVE_FOLDER_ID',oldEvidence);
    if (oldOperationSheet == null) props.deleteProperty('BSE_PILOT_OPERATION_SPREADSHEET_ID'); else props.setProperty('BSE_PILOT_OPERATION_SPREADSHEET_ID',oldOperationSheet);
    if (oldOperationGroups == null) props.deleteProperty('BSE_PILOT_OPERATION_APPROVAL_GROUP_CHAT_IDS'); else props.setProperty('BSE_PILOT_OPERATION_APPROVAL_GROUP_CHAT_IDS',oldOperationGroups);
    if (oldOperationEvidence == null) props.deleteProperty('BSE_PILOT_OPERATION_EVIDENCE_DRIVE_FOLDER_ID'); else props.setProperty('BSE_PILOT_OPERATION_EVIDENCE_DRIVE_FOLDER_ID',oldOperationEvidence);
  }
  const failures=tests.filter(function(t){return !t.pass;});
  if (failures.length) throw new Error('Environment isolation harness gagal: '+failures.map(function(t){return t.id;}).join(', '));
  return tests;
}
