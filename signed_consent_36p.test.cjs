'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const m=require('./NondeleteSignedConsent36P.cjs');
const keys=crypto.generateKeyPairSync('ed25519');
const trust={key_id:'TEST_OWNER_KEY_36P',public_key_pem:keys.publicKey.export({format:'pem',type:'spki'}),
 pinned_fingerprint:crypto.createHash('sha256').update(keys.publicKey.export({format:'der',type:'spki'})).digest('hex')};
const env={BSE_36P_OWNER_PUBLIC_KEY_B64:Buffer.from(trust.public_key_pem).toString('base64'),
 BSE_36P_OWNER_KEY_FINGERPRINT:trust.pinned_fingerprint,BSE_36P_OWNER_KEY_ID:trust.key_id};
// Ephemeral test-only trust anchor; no key material is persisted or committed.
const originalEnv=Object.fromEntries(Object.keys(env).map(k=>[k,process.env[k]]));
Object.assign(process.env,env);
process.on('exit',()=>{for(const [k,v] of Object.entries(originalEnv)){if(v===undefined)delete process.env[k];else process.env[k]=v}});
const now=1800000000000;
const fresh=()=>({schema_version:1,environment:'TEST_ONLY',workbook_id:m.BOOK,
 event_id:'TEST_ONLY_36_P_SAMPLE',operation:'BAJA',approval_source_key:'SYNTH|Inventory_Event_Log|C1',
 ledger_source_key:'SYNTH|INVENTORY_IN|BAJA',approval_hash:'a'.repeat(64),ledger_hash:'b'.repeat(64),
 actor_id:m.OWNER,decision:'APPROVE',nonce:'SYNTHETIC_NONCE_36P_1234567',issued_ms:now-1000,expires_ms:now+60000});
function sign(payload=fresh(),key=keys.privateKey,keyId=trust.key_id){
 const signature=crypto.sign(null,m.signedContent(payload),key).toString('base64url');
 return {key_id:keyId,payload,signature};
}
const snap=()=>({approvals:[],audit:[],anchor_hash:m.ZERO});
test('36P real Ed25519 signature validates but NEVER issues approval',()=>{const x=m.verifyConfiguredConsent36P(sign(),now,env);assert.equal(x.status,'SIGNED_CONSENT_VERIFIED');assert.equal(x.signature_valid,true);assert.equal(x.write_allowed,false);assert.equal(x.approval_issued,false)});
test('36P absent provisioned authority fails closed',()=>{delete process.env.BSE_36P_OWNER_PUBLIC_KEY_B64;try{assert.equal(m.verifyConfiguredConsent36P(sign(),now).status,'OWNER_TRUST_ANCHOR_NOT_PROVISIONED')}finally{process.env.BSE_36P_OWNER_PUBLIC_KEY_B64=env.BSE_36P_OWNER_PUBLIC_KEY_B64}});
test('36P caller claimed owner flags do not replace valid signed envelope',()=>assert.equal(m.verifyConfiguredConsent36P({...sign(),owner_authorized:true},now,env).status,'ENVELOPE_INVALID'));
test('36P payload tampering is rejected cryptographically',()=>{const v=sign();v.payload.ledger_hash='c'.repeat(64);assert.equal(m.verifyConfiguredConsent36P(v,now,env).status,'SIGNATURE_INVALID')});
test('36P other owner signature rejected',()=>{const alternate=crypto.generateKeyPairSync('ed25519');assert.equal(m.verifyConfiguredConsent36P(sign(fresh(),alternate.privateKey),now,env).status,'SIGNATURE_INVALID')});
test('36P public key substitution rejected by pinned fingerprint',()=>{const alternate=crypto.generateKeyPairSync('ed25519');const tampered={...trust,public_key_pem:alternate.publicKey.export({format:'pem',type:'spki'})};assert.equal(m.verifyWithTrust36P(sign(),tampered,now).status,'TRUST_FINGERPRINT_MISMATCH')});
test('36P wrong workbook rejected even with valid signature',()=>{const p={...fresh(),workbook_id:'other'};assert.equal(m.verifyConfiguredConsent36P(sign(p),now,env).status,'SCOPE_OR_PAYLOAD_DENIED')});
test('36P invalid operation rejected',()=>{const p={...fresh(),operation:'DELETE'};assert.equal(m.verifyConfiguredConsent36P(sign(p),now,env).status,'SCOPE_OR_PAYLOAD_DENIED')});
test('36P unsigned future/expired/overlong approval denied',()=>{const p={...fresh(),expires_ms:now-1};assert.equal(m.verifyConfiguredConsent36P(sign(p),now,env).status,'EXPIRED_OR_CLOCK_INVALID');const q={...fresh(),issued_ms:now+1};assert.equal(m.verifyConfiguredConsent36P(sign(q),now,env).status,'EXPIRED_OR_CLOCK_INVALID');const z={...fresh(),expires_ms:now+4000000};assert.equal(m.verifyConfiguredConsent36P(sign(z),now,env).status,'EXPIRED_OR_CLOCK_INVALID')});
test('36P unknown fields fail-closed not signed',()=>{const p={...fresh(),caller_role:'OWNER'};assert.equal(m.verifyConfiguredConsent36P(sign(p),now,env).status,'PAYLOAD_INVALID')});
test('36P valid signed approval yields dry-run preview, never a write',()=>{const x=m.prepareIssuance36P(sign(),now,snap(),env);assert.equal(x.status,'SIGNED_PREVIEW_ONLY');assert.equal(x.approval_issued,false);assert.equal(x.write_allowed,false);assert.equal(x.approval_row.status,'PENDING');assert.equal(x.audit_row.previous_hash,m.ZERO);assert.match(x.audit_row.entry_hash,/^[a-f0-9]{64}$/)});
test('36P nonempty approvals are blocked pending independent anchored audit',()=>{const s=snap();s.approvals.push({approval_id:'old'});s.audit.push({approval_id:'old'});assert.equal(m.prepareIssuance36P(sign(),now,s,env).status,'AUDIT_ANCHOR_VERIFIER_MISSING')});
test('36P partial write mismatch detected',()=>{const s=snap();s.approvals.push({approval_id:'torn'});assert.equal(m.prepareIssuance36P(sign(),now,s,env).status,'AUDIT_APPROVAL_PARITY_FAILURE')});
test('36P no verified snapshot prevents approval preparation',()=>assert.equal(m.prepareIssuance36P(sign(),now,{},env).status,'AUTHORITY_SNAPSHOT_UNVERIFIED'));
test('36P malformed signature encoding denied',()=>{const e=sign();e.signature='AA!!';assert.equal(m.verifyConfiguredConsent36P(e,now,env).status,'SIGNATURE_ENCODING_INVALID')});
test('36P consent digest binds exact signature payload deterministically',()=>{const e=sign();assert.equal(m.verifyConfiguredConsent36P(e,now,env).consent_digest,m.verifyConfiguredConsent36P(e,now,env).consent_digest)});
test('36P caller cannot smuggle trust configuration through third argument',()=>{
 delete process.env.BSE_36P_OWNER_PUBLIC_KEY_B64;
 try{assert.equal(m.verifyConfiguredConsent36P(sign(),now,env).status,'OWNER_TRUST_ANCHOR_NOT_PROVISIONED')}
 finally{process.env.BSE_36P_OWNER_PUBLIC_KEY_B64=env.BSE_36P_OWNER_PUBLIC_KEY_B64}
});
