'use strict';
// Isolated PILOT-only capability adapter candidate. NOT bound to operational controllers.
// Each entry maps an existing function to the elevated capability path it must check.
// Mixed record visibility remains separately conditioned on reporter/classification.
const BSE_RBAC_LEGACY_SITES=Object.freeze({
 'EvidenceOcrTest.js:bseEvidenceOcrAccess_':{cap:'restricted_retrieval',kind:'mixed',privateOnly:true},
 'ImageActionTest.js:bseImageActionReceive_':{cap:'ordinary',kind:'ordinary',privateOnly:false},
 'ImageProcessingTest.js:bseImageProcessingReceive_':{cap:'ordinary',kind:'ordinary',privateOnly:false},
 'PilotOperationGateH.js:bsePilotGateHReadiness_':{cap:'ordinary',kind:'bootstrap_only',privateOnly:false},
 'TelegramAiTest.js:bseTelegramAiAccessAllowed_':{cap:'ordinary',kind:'ordinary',privateOnly:true},
 'TelegramApprovalUiTest.js:bseTelegramApprovalEnsureCard_':{cap:'approve',kind:'elevated',privateOnly:false},
 'TelegramApprovalUiTest.js:bseTelegramApprovalControllerCore_':{cap:'approve',kind:'elevated',privateOnly:true},
 'TelegramApprovalUiTest.js:bseTelegramDeleteReceiveCommand_':{cap:'delete',kind:'elevated',privateOnly:true},
 'TelegramEvidenceTest.js:bseTelegramEvidenceReceiveMessage_':{cap:'ordinary',kind:'ordinary',privateOnly:false},
 'TelegramEvidenceTest.js:bseTelegramEvidenceReceiveMessageCore_':{cap:'ordinary',kind:'ordinary',privateOnly:false},
 'TelegramHistoryTest.js:bseTelegramHistoryAccess_':{cap:'restricted_history',kind:'mixed',privateOnly:true},
 'TelegramPlotStatusTest.js:bseTelegramPlotStatusRetrieve_':{cap:'ordinary',kind:'ordinary',privateOnly:true},
 'TelegramQueueTest.js:receiveBseTelegramTest':{cap:'ordinary',kind:'ordinary',privateOnly:false},
 'TelegramRecordRetrievalTest.js:bseTelegramRecordRetrieve_':{cap:'restricted_retrieval',kind:'mixed',privateOnly:true},
 'TelegramRegistrationTest.js:bseTelegramRegistrationPrivateAccess_':{cap:'ordinary',kind:'ordinary',privateOnly:true},
 'TelegramRegistrationTest.js:bseTelegramRegistrationHandleStart_':{cap:'ordinary',kind:'ordinary',privateOnly:true},
 'TelegramRegistrationTest.js:bseTelegramRegistrationCallback_':{cap:'registration_decision',kind:'elevated',privateOnly:true},
 'TelegramReportTest.js:bseTelegramReportRetrieve_':{cap:'restricted_history',kind:'elevated',privateOnly:true},
 'TelegramRetrievalTest.js:bseTelegramEvidenceRetrieve_':{cap:'restricted_retrieval',kind:'mixed',privateOnly:true}
});
function bseRoleLegacySiteAuthorize_(site,actor,chat,chatType,adapters){
 const deny=reason=>({allowed:false,role:'UNVERIFIED',reason});
 const policy=BSE_RBAC_LEGACY_SITES[site];
 if(!policy||typeof bseRoleResolve_!=='function')return deny('SITE_OR_RESOLVER_UNKNOWN');
 if(!/^\d+$/.test(String(actor||''))||!adapters||adapters.sourceAuthenticated!==true)return deny('UNAUTHENTICATED_SOURCE');
 if(policy.privateOnly&&(chatType!=='private'||String(chat)!==String(actor)))return deny('NOT_PRIVATE');
 // Always read live canonical role for each use; legacy owner.ok/is_admin ignored.
 const resolved=bseRoleResolve_(String(actor),policy.cap,adapters);
 if(!resolved||resolved.allowed!==true)return deny(resolved?.reason||'CANONICAL_DENIED');
 if(policy.kind==='bootstrap_only'&&resolved.role!=='OWNER')return deny('BOOTSTRAP_ONLY');
 // Mixed callsites must additionally enforce record-specific MEMBER visibility.
 if(policy.kind==='mixed'&&resolved.role==='REGISTERED_ACTIVE')return deny('RECORD_VISIBILITY_REQUIRED');
 return {allowed:true,role:resolved.role,capability:policy.cap};
}
