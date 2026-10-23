// Scoped read-only IRAC runtime diagnostic. Do not log credentials or entire PDF.
function diagnoseBseIracPdfAccessFinal(){
 const out={environment:bseRuntimeEnvironmentName_(),pdf_id:BSE_PILOT_IRAC_PDF_ID,production_write:false};
 try{const f=DriveApp.getFileById(BSE_PILOT_IRAC_PDF_ID);out.drive_read='PASS';out.name=f.getName();out.mime=f.getMimeType();out.bytes=f.getSize();}
 catch(e){out.drive_read='FAIL';out.drive_error=String(e&&e.message||e).slice(0,180);}
 const p=PropertiesService.getScriptProperties();
 out.gemini_key_configured=!!String(p.getProperty('GEMINI_API_KEY')||'').trim();
 out.model_configured=String(p.getProperty('GEMINI_AI_MODEL')||p.getProperty('GEMINI_MODEL')||'gemini-2.5-flash').trim();
 if(out.drive_read==='PASS'){
  const result=bsePilotIracFromPdf_('Apa kumpulan IRAC bagi abamectin?');
  out.gemini_pdf_available=!!(result&&result.available);
  out.gemini_pdf_reason=String(result&&result.reason||'');
  if(out.gemini_pdf_available){out.answer=String(result.text||'').slice(0,240);out.source=String(result.source_details&&result.source_details[0]&&result.source_details[0].url||'');}
 }
 console.log('BSE_IRAC_FINAL_DIAG '+JSON.stringify(out));
 return out;
}
