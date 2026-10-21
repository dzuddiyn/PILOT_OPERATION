'use strict';
const t=require('node:test');
const a=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const c=JSON.parse(fs.readFileSync(path.join(__dirname,'authority_mode_36p.lock.json'),'utf8'));
t('36P mode locked to Google authenticated UI',()=>{
 a.equal(c.status,'LOCKED_DESIGN_ONLY');
 a.equal(c.approved_mode,'GOOGLE_AUTHENTICATED_APPROVAL_UI');
 a.equal(c.ui_type,'APPS_SCRIPT_HTML_SERVICE_WEB_APP_CANDIDATE');
 a.equal(c.ed25519,'OPTIONAL_DEFENSE_IN_DEPTH_NOT_REQUIRED_FOR_GOOGLE_UI');
});
t('36P web app must execute as authenticated accessing user with owner allowlist',()=>{
 a.equal(c.deployment_run_as,'USER_ACCESSING_WEB_APP');
 a.equal(c.deployment_access,'OWNER_ONLY');
 a.equal(c.permitted_owner,'dzuddiyn01@gmail.com');
 a.equal(c.consent_requirements.authoritative_identity_from_server_session,true);
 a.equal(c.consent_requirements.reject_blank_or_mismatched_active_email,true);
});
t('36P exact TEST_ONLY scope and defer DELETE',()=>{
 a.equal(c.environment,'TEST_ONLY');
 a.equal(c.workbook_id,'1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY');
 a.deepEqual(c.operations,['BAJA','CENSUS']);
 a.deepEqual(c.forbidden_operations,['DELETE']);
 a.equal(c.guardrails.delete_deferred,true);
});
t('36P requires independent specific explicit human review',()=>{
 a.equal(c.consent_requirements.explicit_per_transaction_approve_or_reject,true);
 a.equal(c.consent_requirements.review_server_canonical_transaction,true);
 a.equal(c.consent_requirements.exact_operation_workbook_event_hash_binding,true);
 a.equal(c.consent_requirements.authenticated_client_action_is_not_by_itself_proof_of_physical_human_click,true);
 a.equal(c.consent_requirements.never_auto_approve,true);
});
t('36P challenge lifetime and one-time nonce are locked',()=>{
 a.equal(c.consent_requirements.challenge_nonce_minted_and_stored_server_side,true);
 a.equal(c.consent_requirements.nonce_valid_once,true);
 a.ok(c.consent_requirements.nonce_ttl_ms<=600000);
 a.ok(c.consent_requirements.approval_validity_ceiling_ms<=3600000);
});
t('36P audit may not be trusted from owner-editable sheet alone',()=>{
 a.equal(c.persistence.append_only_audit_with_independent_anchor_required,true);
 a.equal(c.persistence.real_script_lock_required,true);
 a.equal(c.persistence.no_client_sheet_approval_write,true);
 a.equal(c.persistence.atomic_or_reconciled_transition_required,true);
 a.equal(c.persistence.unverified_or_partial_write_fails_closed,true);
});
t('36P lock never authorizes write, OAuth, script head, deployment or PR merge',()=>{
 for(const [k,v] of Object.entries(c.guardrails)) {
  if(k==='delete_deferred') continue;
  a.equal(v,false,k+' must be false');
 }
 a.equal(c.acceptance_state,'DESIGN_LOCK_ONLY_NOT_IMPLEMENTED');
});
