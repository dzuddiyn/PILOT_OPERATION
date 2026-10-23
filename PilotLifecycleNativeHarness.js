// CL-07 read-only native Apps Script harness. NO Spreadsheet/Telegram writes.
function runBsePilotLifecycleNativeGuardTests(){
 const results=[];
 const alloc=(batch,id,plot,date)=>['src','1',batch,id,date||'2026-10-01',plot,'PLANNED'];
 const status=(id,from,to,plot)=>['src','1','sid','TR','batch',id,plot||'M1P1',from,to];
 function check(name,fn,expectReject){let rejected=false,error='';try{fn();}catch(e){rejected=true;error=String(e&&e.message||e);}
   const pass=expectReject?rejected&&/CROP_LIFECYCLE_/.test(error):!rejected;
   results.push({name:name,pass:pass,error:pass?'':error});}
 check('FREE_NEW_PLOT',()=>bsePilotLifecycleRequireFreePlots_([],[],['M1P1']),false);
 check('DUPLICATE_SOW_BLOCK',()=>bsePilotLifecycleRequireFreePlots_([alloc('B1','A1','M1P1')],[],['M1P1']),true);
 check('CROSS_BATCH_TRANSPLANT_BLOCK',()=>bsePilotLifecycleRequireUniqueActive_([alloc('B1','A1','M1P1'),alloc('B2','A2','M1P1')],[],['M1P1'],'B1','2026-10-05'),true);
 check('BACKDATED_TRANSPLANT_BLOCK',()=>bsePilotLifecycleRequireUniqueActive_([alloc('B1','A1','M1P1')],[],['M1P1'],'B1','2026-09-01'),true);
 check('ACTIVE_HARVEST_ALLOWED',()=>bsePilotLifecycleRequireHarvestStart_([alloc('B1','A1','M1P1')],[status('A1','PLANNED','ACTIVE')],[],'M1P1','2026-10-06','new'),false);
 check('DUPLICATE_HARVEST_BLOCK',()=>bsePilotLifecycleRequireHarvestStart_([alloc('B1','A1','M1P1')],[status('A1','PLANNED','ACTIVE')],[['old',0,0,0,0,'M1P1','HARVEST_START']],'M1P1','2026-10-06','new'),true);
 check('CYCLE_END_FREES_PLOT',()=>bsePilotLifecycleRequireFreePlots_([alloc('B1','A1','M1P1')],[status('A1','PLANNED','ACTIVE'),status('A1','ACTIVE','INACTIVE')],['M1P1']),false);
 const failed=results.filter(r=>!r.pass);
 const report={gate:'CL-07',total:results.length,pass:results.length-failed.length,fail:failed.length,production_write:false,tests:results};
 console.log('BSE_CL07_NATIVE '+JSON.stringify(report));
 if(failed.length)throw new Error('CL07_NATIVE_FAIL '+JSON.stringify(failed));
 return report;
}
