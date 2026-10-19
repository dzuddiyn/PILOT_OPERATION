'use strict';
// Deny-only helper; storage changes live behind injected functions.
function bseRoleRevokeBarrierActive_(target,api){
  try{const barriers=api.readBarriers();if(!Array.isArray(barriers))return true;
    for(const row of barriers){if(!row||typeof row.active!=='boolean'||!row.target)return true;if(row.target===target&&row.active)return true;}
    return false;
  }catch(_){return true;}
}
