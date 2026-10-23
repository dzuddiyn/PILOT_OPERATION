// Direct-PDF IRAC fallback; PILOT_OPERATION only; source PDF stays in Drive.
const BSE_PILOT_IRAC_PDF_ID='1thWP1U5JoqAdNeiGMFH_QLUbCuJGX2MQ';
const BSE_PILOT_IRAC_PDF_URL='https://drive.google.com/file/d/1thWP1U5JoqAdNeiGMFH_QLUbCuJGX2MQ/view';
function bsePilotIracFromPdf_(question){
 if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION'||!/\b(?:IRAC|MoA|mode of action)\b/i.test(String(question||'')))return null;
 const unavailable=reason=>({available:false,reason:reason,production_write:false});
 try{
   const props=PropertiesService.getScriptProperties(),key=String(props.getProperty('GEMINI_API_KEY')||'').trim();
   if(!key)return unavailable('IRAC_PDF_GEMINI_NOT_CONFIGURED');
   const blob=DriveApp.getFileById(BSE_PILOT_IRAC_PDF_ID).getBlob(),raw=blob.getBytes();
   if(!raw.length||raw.length>5000000)return unavailable('IRAC_PDF_INVALID_SIZE');
   const pdf=Utilities.base64Encode(raw);
   const model=String(props.getProperty('GEMINI_AI_MODEL')||props.getProperty('GEMINI_MODEL')||'gemini-2.5-flash').trim();
   const url='https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent';
   const payload={contents:[{role:'user',parts:[
     {text:'Baca jadual IRAC dalam PDF yang dilampirkan. Jawab soalan berikut HANYA berdasarkan PDF. Berikan satu ayat ringkas dengan kod kumpulan IRAC dan nama mode of action dalam jadual. Jika bahan aktif tidak dinyatakan, tulis NOT_FOUND. Soalan: '+String(question||'').slice(0,350)},
     {inlineData:{mimeType:'application/pdf',data:pdf}}
   ]}],generationConfig:{temperature:0,maxOutputTokens:240}};
   const response=UrlFetchApp.fetch(url,{method:'post',contentType:'application/json',headers:{'x-goog-api-key':key},muteHttpExceptions:true,payload:JSON.stringify(payload)});
   if(response.getResponseCode()!==200)return unavailable('IRAC_PDF_HTTP_'+response.getResponseCode());
   const result=JSON.parse(response.getContentText()),answer=bseAiExtractText_(result);
   if(!answer||/^NOT_FOUND\b/i.test(answer)||!/(?:group|kumpulan)\s*\d+[a-z]?\b/i.test(answer)){
     const candidate=result&&result.candidates&&result.candidates[0]||{};
     console.log('BSE_IRAC_PDF_RESPONSE_DIAG '+JSON.stringify({model:model,http_status:200,finish_reason:String(candidate.finishReason||''),answer_excerpt:String(answer||'').replace(/[\r\n]+/g,' ').slice(0,280),answer_length:String(answer||'').length,usage_total_tokens:Number(result&&result.usageMetadata&&result.usageMetadata.totalTokenCount||0),production_write:false}));
     return unavailable('IRAC_PDF_NOT_VERIFIED');
   }
   return {available:true,text:answer,source_details:[{title:'IRAC.pdf',url:BSE_PILOT_IRAC_PDF_URL,authority:'IRAC MoA classification PDF supplied as inline source'}],sources:['IRAC.pdf'],production_write:false};
 }catch(error){
   console.log('BSE_IRAC_PDF_READ_FAILED: '+String(error&&error.message||error).slice(0,140));
   return unavailable('IRAC_PDF_READ_FAILED');
 }
}
