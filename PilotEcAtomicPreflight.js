/** @OnlyCurrentDoc */
// PILOT_OPERATION only. Pure preflight; never writes a Sheet or sends Telegram.
function bsePilotEcAtomicPreflight_(result, originalText){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return {ok:false,reason:'WRONG_ENVIRONMENT'};
  const text=String(originalText||'');
  const lines=text.split(/\r?\n/);
  const parsed=[];
  for(const line of lines){
    const m=String(line).trim().match(/^(M[1-9]\d*P[1-9]\d*|M[1-9]\d*)\s*-\s*(x|\d+(?:\.\d+)?|)$/i);
    if(m)parsed.push({plot:m[1].toUpperCase(),value:m[2].toLowerCase()});
  }
  const candidates=Array.isArray(result&&result.candidates)?result.candidates:[];
  if(result?.validation!=='PASS'||result?.production_write!==false||!parsed.length)return {ok:false,reason:'INVALID_OR_MISSING_SOURCE'};
  if(new Set(parsed.map(x=>x.plot)).size!==parsed.length)return {ok:false,reason:'DUPLICATE_SOURCE_PLOT'};
  if(candidates.some(c=>c.target!=='Measurement_Log'||c.validation!=='PASS'))return {ok:false,reason:'UNEXPECTED_CANDIDATE'};
  const numeric=parsed.filter(x=>x.value&&x.value!=='x');
  if(candidates.length!==numeric.length)return {ok:false,reason:'SOURCE_CANDIDATE_MISMATCH',source_count:parsed.length,candidate_count:candidates.length};
  for(const source of numeric){
    const hits=candidates.filter(c=>String(c.fields&&c.fields.plot_id||'').toUpperCase()===source.plot&&Number(c.fields.value)===Number(source.value));
    if(hits.length!==1)return {ok:false,reason:'SOURCE_CANDIDATE_MISMATCH'};
  }
  // Measurement_Log candidates cannot represent source blanks / x losslessly.
  if(parsed.some(x=>x.value===''||x.value==='x'))return {ok:false,reason:'UNREPRESENTED_SOURCE_LOCATIONS',source_count:parsed.length,candidate_count:candidates.length};
  return {ok:true,source_count:parsed.length,candidate_count:candidates.length};
}
