/** Pure aggregate classification. Never treat ordinary treatments as Racun bundle. */
function bsePilotRacunAggregateEnvelope_(result){
  if(typeof bseRuntimeEnvironmentName_!=='function'||bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')return null;
  if(!result||result.production_write!==false||!Array.isArray(result.candidates)||result.candidates.length<2)return null;
  if(!result.candidates.every(c=>c&&c.target==='Treatment_Event_Log'&&c.fields&&
      /^Racun\s*$/im.test(String(c.fields.original_note||''))))return null;
  const source=result.candidates[0].fields.original_note;
  if(result.candidates.some(c=>c.fields.original_note!==source))throw Error('RACUN_MIXED_SOURCE');
  return {validation:result.validation,production_write:false,candidates:JSON.parse(JSON.stringify(result.candidates)),
    aggregate_type:'PILOT_RACUN_ATOMIC',record_count:result.candidates.length};
}
