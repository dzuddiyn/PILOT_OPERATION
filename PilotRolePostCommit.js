'use strict';
// Isolated post-commit transport. Authoritative role state is NOT this queue.
// Durable adapter contract: readOutbox(), appendOutbox(row), updateOutbox(row), flush().
function bseRolePostCommit_(request,api){
 const result={audit:'NOT_CONFIGURED',notification:'NOT_CONFIGURED'};
 const targets=[['audit','appendAudit','AUDIT_PENDING','RECORDED'],['notification','notify','NOTIFY_PENDING','SENT']];
 for(const [type,method,pending,complete] of targets){
   if(typeof api[method]!=='function')continue;
   if(['readOutbox','appendOutbox','updateOutbox','flush'].some(x=>typeof api[x]!=='function')){
     result[type]='OUTBOX_UNAVAILABLE';continue; // no unsafe direct send
   }
   const key=request.operationId+':'+type;
   try{
     let rows=api.readOutbox();
     if(!Array.isArray(rows))throw Error('OUTBOX_UNVERIFIED');
     let matching=rows.filter(x=>x&&x.key===key);
     if(matching.length>1)throw Error('OUTBOX_CONFLICT');
     let row=matching[0];
     if(row&&(row.operation_id!==request.operationId||row.action!==request.action||row.target!==request.target||row.type!==type||!['PENDING','DONE'].includes(row.state)))throw Error('OUTBOX_CONFLICT');
     if(!row){
       row={key,type,operation_id:request.operationId,target:request.target,action:request.action,state:'PENDING'};
       api.appendOutbox(row);api.flush();
       rows=api.readOutbox();matching=rows.filter(x=>x&&x.key===key);
       if(matching.length!==1||JSON.stringify(matching[0])!==JSON.stringify(row))throw Error('OUTBOX_READBACK_FAILED');
     }
     if(row.state==='DONE'){result[type]=complete;continue;}
     // Transport may succeed before DONE is durably written. A retry can duplicate
     // external delivery unless the adapter PROVIDES idempotency by key.
     api[method]({operation_id:request.operationId,target:request.target,action:request.action,idempotency_key:key});
     const done={...row,state:'DONE'};
     api.updateOutbox(done);api.flush();
     rows=api.readOutbox();
     if(rows.filter(x=>x&&x.key===key&&x.state==='DONE').length!==1)throw Error('DONE_READBACK_FAILED');
     result[type]=complete;
   }catch(_){result[type]=pending;}
 }
 return result;
}
