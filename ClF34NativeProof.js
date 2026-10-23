/** CL-F3/F4 native in-memory lifecycle + pre-card refusal. Zero Sheet/Telegram writes. */
function runBseClF34NativeLifecycleProof(){
 const batch=['synthetic',0,'B1','A1','2026-10-23','M9P9','PLANNED'];
 const make=(rows)=>({getLastRow:()=>rows.length+1,getRange:()=>({getValues:()=>rows})});
 const allocations=[batch],statuses=[],logs=[];
 const book={getSheetByName:(n)=>n==='TEST_PLOT_ALLOCATION'?make(allocations):n==='TEST_ALLOCATION_STATUS_EVENT'?make(statuses):null};
 const result=()=>({validation:'PASS',production_write:false,candidates:[{target:'Planting_Event_Log',validation:'PASS',missing:[],fields:{event_type:'SEED_SOWING'}},{target:'Plot_Allocation_Log',validation:'PASS',missing:[],fields:{plot_id:'M9P9'}}]});
 const checks=[];
 const assert=(name,actual,want)=>{const pass=actual===want;checks.push({name,pass});if(!pass)throw Error('CL_F34_ASSERT_'+name);};
 assert('PLANNED_PRECARD_BLOCK',bsePilotSowingQueueGuard_(book,result()).validation,'NEED_INFO');
 assert('PLANNED_NO_CARD',bsePilotSowingQueueGuard_(book,result()).candidates.every(c=>c.validation==='NEED_INFO'),true);
 assert('TRANSPLANT_VALID',bsePilotLifecycleRequireUniqueActive_(allocations,statuses,['M9P9'],'B1','2026-10-24'),true);
 statuses.push(['synthetic',0,'evt','tr','B1','A1','M9P9','PLANNED','ACTIVE']);
 assert('ACTIVE_PRECARD_BLOCK',bsePilotSowingQueueGuard_(book,result()).validation,'NEED_INFO');
 assert('ACTIVE_TRANSPLANT_BLOCK',(()=>{try{bsePilotLifecycleRequireUniqueActive_(allocations,statuses,['M9P9'],'B1','2026-10-25');return false}catch(_){return true}})(),true);
 assert('ACTIVE_HARVEST_FIRST',bsePilotLifecycleRequireHarvestStart_(allocations,statuses,logs,'M9P9','2026-10-26','new'),true);
 logs.push(['old',0,0,'2026-10-26',0,'M9P9','HARVEST_START']);
 assert('ACTIVE_HARVEST_REPEAT_BLOCK',(()=>{try{bsePilotLifecycleRequireHarvestStart_(allocations,statuses,logs,'M9P9','2026-10-27','new');return false}catch(_){return true}})(),true);
 statuses.push(['synthetic',0,'end','tr','B1','A1','M9P9','ACTIVE','INACTIVE']);
 assert('INACTIVE_RESOW_PASS',bsePilotSowingQueueGuard_(book,result()).validation,'PASS');
 const out={gate:'CL-F3/F4',total:checks.length,passed:checks.length,failed:0,production_write:false,checks};
 console.log('BSE_CL_F34_NATIVE '+JSON.stringify(out));return out;
}
