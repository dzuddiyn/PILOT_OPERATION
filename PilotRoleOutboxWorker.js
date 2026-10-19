'use strict';
// Strictly isolated retry worker. Never trust outbox as role authority.
function bseRoleOutboxWorker_(api){
 const report={done:0,pending:0,skipped:0,conflicts:0,unverified:0};
 if(!api||['readOutbox','updateOutbox','flush','verifyCommitted','lock'].some(k=>typeof api[k]!=='function')){report.unverified++;return report;}
 const lock=api.lock();if(!lock||!lock.tryLock(1000)){report.skipped++;return report;}
 try{
  const snapshot=api.readOutbox();
  if(!Array.isArray(snapshot)){report.unverified++;return report;}
  const keys=new Set();
  for(const row of snapshot){
   if(!row||typeof row.key!=='string'||!row.key||keys.has(row.key)){report.conflicts++;return report;}
   keys.add(row.key);
  }
  for(const row of snapshot){
   if(!['PENDING','DONE'].includes(row.state)||!['audit','notification'].includes(row.type)||
       row.key!==row.operation_id+':'+row.type||!row.operation_id||!row.target||
       !['GRANT_ADMIN','REVOKE_ADMIN'].includes(row.action)){report.conflicts++;continue;}
   if(row.state==='DONE'){report.skipped++;continue;}
   try{
    if(api.verifyCommitted(row)!==true){report.unverified++;continue;}
    // Re-read under lock to prevent using stale outbox state.
    const latest=api.readOutbox().filter(x=>x&&x.key===row.key);
    if(latest.length!==1||JSON.stringify(latest[0])!==JSON.stringify(row)){report.conflicts++;continue;}
    const method=row.type==='audit'?'appendAudit':'notify';
    if(typeof api[method]!=='function'){report.pending++;continue;}
    api[method]({operation_id:row.operation_id,target:row.target,action:row.action,idempotency_key:row.key});
    api.updateOutbox({...row,state:'DONE'});api.flush();
    const after=api.readOutbox().filter(x=>x&&x.key===row.key);
    if(after.length!==1||after[0].state!=='DONE'){report.unverified++;continue;}
    report.done++;
   }catch(_){report.pending++;}
  }
 }catch(_){report.unverified++;}
 finally{lock.releaseLock();}
 return report;
}
