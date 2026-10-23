/** @OnlyCurrentDoc */
function runClH07EcNativeSyntheticRegression(){
  const previous=bseRuntimeEnvironmentName_;
  // Pure parser checks; no live Sheets, API, properties or Telegram.
  const note=['EC leaching','14/10/2026','M1P1-x','M1P2-x','M2P3-','M2P4-3.0','M3P3-3.5','M3P4-3.5','M4P1-3.0','M4P2-3.0','M7-3.5'].join('\n');
  const batch=bsePilotEcCanonicalBatch_('BSE-TG-772258028',note,'2026-10-14');
  const failures=[];
  const check=(name,good)=>{if(!good)failures.push(name);};
  check('nine-locations',batch.readings.length===9);
  check('M7-alias',batch.readings.some(x=>x.plot_id==='M7P3'&&x.value===3.5));
  check('two-x',batch.readings.filter(x=>x.input_status==='NOT_MEASURED').length===2);
  check('one-blank',batch.readings.filter(x=>x.input_status==='BLANK').length===1);
  check('six-numeric',batch.readings.filter(x=>x.input_status==='NUMERIC').length===6);
  check('canonical-valid',bsePilotEcCanonicalValidate_(batch));
  const projection=bsePilotEcDerivedIndex_(batch);
  check('derived-nine',projection.length===9);
  check('rebuild-all',bsePilotEcRebuildIndex_(batch,[]).missing.length===9);
  check('source-reference',batch.reference==='BSE-TG-772258028');
  check('write-guard',batch.production_write===false);
  const verdict={total:10,passed:10-failures.length,failed:failures.length,failures:failures,production_write:false};
  console.log('CL_H07_EC_NATIVE_SYNTHETIC '+JSON.stringify(verdict));
  if(failures.length)throw Error('EC_NATIVE_SYNTHETIC_FAIL');
  return verdict;
}
