'use strict';
// 36P: real Ed25519 verification, source-only. NEVER an Apps Script executable
// issuer or a Google Sheets writer. Trust root must come from server config.
const crypto = require('node:crypto');

const BOOK='1vwmO6nE_hVfFgT0zkaNPzZklminYtZT24jrGL-ODBoY';
const OWNER='TEST_ONLY_OWNER_36P';
const ZERO='0'.repeat(64);
const KEYS=['schema_version','environment','workbook_id','event_id','operation','approval_source_key',
  'ledger_source_key','approval_hash','ledger_hash','actor_id','decision','nonce','issued_ms','expires_ms'];
const hex64=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const deny=status=>({status,signature_valid:false,write_allowed:false,approval_issued:false});
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const exact=(obj,keys)=>!!obj&&typeof obj==='object'&&!Array.isArray(obj)&&
  Object.keys(obj).sort().join('|')===keys.slice().sort().join('|');
const canonical=p=>JSON.stringify(KEYS.map(k=>p[k]));
const signedContent=p=>Buffer.from('BSE-36P-OWNER-CONSENT-V1\n'+canonical(p),'utf8');
function verifyWithTrust36P(envelope,trust,now){
  if(!exact(envelope,['key_id','payload','signature']))return deny('ENVELOPE_INVALID');
  const p=envelope.payload;
  if(!exact(p,KEYS))return deny('PAYLOAD_INVALID');
  if(!trust||typeof trust.public_key_pem!=='string'||!hex64(trust.pinned_fingerprint)||
     envelope.key_id!==trust.key_id||typeof now!=='number'||!Number.isSafeInteger(now))return deny('TRUST_UNBOUND');
  if(p.schema_version!==1||p.environment!=='TEST_ONLY'||p.workbook_id!==BOOK||
     p.actor_id!==OWNER||p.decision!=='APPROVE'||!/^TEST_ONLY_36_[A-Z0-9_]{1,80}$/.test(p.event_id)||
     !['BAJA','CENSUS'].includes(p.operation)||!hex64(p.approval_hash)||!hex64(p.ledger_hash)||
     typeof p.approval_source_key!=='string'||!p.approval_source_key||p.approval_source_key.length>200||
     typeof p.ledger_source_key!=='string'||!p.ledger_source_key||p.ledger_source_key.length>200||
     typeof p.nonce!=='string'||!/^[A-Za-z0-9_-]{24,128}$/.test(p.nonce))
     return deny('SCOPE_OR_PAYLOAD_DENIED');
  if(!Number.isSafeInteger(p.issued_ms)||!Number.isSafeInteger(p.expires_ms)||
     p.issued_ms>now||p.expires_ms<=now||p.expires_ms<=p.issued_ms||
     p.expires_ms-p.issued_ms>3600000||now-p.issued_ms>3600000)return deny('EXPIRED_OR_CLOCK_INVALID');
  if(typeof envelope.signature!=='string'||! /^[A-Za-z0-9_-]{86}$/.test(envelope.signature))
     return deny('SIGNATURE_ENCODING_INVALID');
  try {
    const key=crypto.createPublicKey(trust.public_key_pem);
    if(key.asymmetricKeyType!=='ed25519')return deny('KEY_TYPE_INVALID');
    const fingerprint=hash(key.export({type:'spki',format:'der'}));
    if(fingerprint!==trust.pinned_fingerprint)return deny('TRUST_FINGERPRINT_MISMATCH');
    const sig=Buffer.from(envelope.signature,'base64url');
    if(sig.length!==64 || sig.toString('base64url')!==envelope.signature ||
       !crypto.verify(null,signedContent(p),key,sig))return deny('SIGNATURE_INVALID');
    return {status:'SIGNED_CONSENT_VERIFIED',signature_valid:true,write_allowed:false,
      approval_issued:false,consent_digest:hash(signedContent(p))};
  }catch(e){return deny('SIGNATURE_OR_KEY_ERROR')}
}
function loadConfiguredTrust36P(env){
  if(!env||!env.BSE_36P_OWNER_PUBLIC_KEY_B64||!env.BSE_36P_OWNER_KEY_FINGERPRINT||
     !env.BSE_36P_OWNER_KEY_ID)return null;
  let public_key_pem;
  try {public_key_pem=Buffer.from(env.BSE_36P_OWNER_PUBLIC_KEY_B64,'base64').toString('utf8')}
  catch(e){return null}
  return {public_key_pem,pinned_fingerprint:env.BSE_36P_OWNER_KEY_FINGERPRINT,key_id:env.BSE_36P_OWNER_KEY_ID};
}
// The only runtime-facing verifier: no caller-supplied trust key can be accepted.
function verifyConfiguredConsent36P(envelope,now){
  const trust=loadConfiguredTrust36P(process.env);
  if(!trust)return deny('OWNER_TRUST_ANCHOR_NOT_PROVISIONED');
  return verifyWithTrust36P(envelope,trust,now);
}
// Read-only planning: never writes or marks APPROVED, and requires a fresh
// independent snapshot from a future server-controlled storage adapter.
function prepareIssuance36P(envelope,now,snapshot){
  const result=verifyConfiguredConsent36P(envelope,now);
  if(!result.signature_valid)return result;
  if(!snapshot||!Array.isArray(snapshot.approvals)||!Array.isArray(snapshot.audit)||
     typeof snapshot.anchor_hash!=='string'||!hex64(snapshot.anchor_hash))
     return deny('AUTHORITY_SNAPSHOT_UNVERIFIED');
  if(snapshot.approvals.length!==snapshot.audit.length)
     return deny('AUDIT_APPROVAL_PARITY_FAILURE');
  // No non-empty journal is accepted until an independent anchored audit
  // verifier is implemented. This prevents owner-editable Sheet as root trust.
  if(snapshot.approvals.length||snapshot.audit.length||snapshot.anchor_hash!==ZERO)
     return deny('AUDIT_ANCHOR_VERIFIER_MISSING');
  const p=envelope.payload;
  const approval_id='A36P_'+result.consent_digest.slice(0,36);
  const a={approval_id,event_id:p.event_id,approval_source_key:p.approval_source_key,
    ledger_source_key:p.ledger_source_key,approval_hash:p.approval_hash,
    ledger_hash:p.ledger_hash,actor_id:p.actor_id,status:'PENDING',
    revision:1,issued_ms:p.issued_ms,expires_ms:p.expires_ms,nonce:p.nonce};
  const audit={approval_id,revision:1,event_id:p.event_id,status:'PENDING',
    actor_id:p.actor_id,nonce:p.nonce,previous_hash:ZERO,
    entry_hash:hash(JSON.stringify([approval_id,1,p.event_id,'PENDING',
      p.actor_id,p.nonce,ZERO,result.consent_digest])),timestamp_ms:now};
  return {status:'SIGNED_PREVIEW_ONLY',signature_valid:true,write_allowed:false,
    approval_issued:false,consent_digest:result.consent_digest,approval_row:a,audit_row:audit};
}
module.exports={verifyWithTrust36P,verifyConfiguredConsent36P,prepareIssuance36P,canonical,signedContent,BOOK,OWNER,ZERO};
