/** Scoped lock ownership for PILOT Racun only. Never accept ownership from callback input. */
var BSE_PILOT_RACUN_LOCK_DEPTH=0;
function bsePilotRacunLockOwned_(){return BSE_PILOT_RACUN_LOCK_DEPTH===1;}
function bsePilotRacunWithLock_(fn){
  if(bseRuntimeEnvironmentName_()!=='PILOT_OPERATION')throw Error('RACUN_WRONG_ENVIRONMENT');
  if(BSE_PILOT_RACUN_LOCK_DEPTH!==0)throw Error('RACUN_NESTED_LOCK');
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(10000))throw Error('RACUN_LOCK_BUSY');
  BSE_PILOT_RACUN_LOCK_DEPTH=1;
  try{return fn(boundTestBook_());}
  finally{BSE_PILOT_RACUN_LOCK_DEPTH=0;lock.releaseLock();}
}
