import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GOODWAY_VOICE_CONTRACT_VERSION,
  normalizeSpeechLocale,
  sameSpeechLanguage,
  speechChunks,
  makeGlobalVoiceRequest,
} from '../services/globalVoiceContract.mjs';

const approved = {
  contentId:'PUBLIC_ARTICLE_1',sourceRevision:'2026-11-16T12:00:00Z',
  source:'PUBLIC_SERVER_READ',language:'ko-KR',requestedLanguage:'ko-KR',
  provider:'BROWSER_WEBSPEECH',voiceName:'Example Korean Voice',
};

test('valid international language tags survive without claiming voice availability',()=>{
  assert.equal(normalizeSpeechLocale('ko'), 'ko-KR');
  assert.equal(normalizeSpeechLocale('en-US'), 'en-US');
  assert.equal(normalizeSpeechLocale('sw-KE'), 'sw-KE');
  assert.equal(normalizeSpeechLocale('xx-XX'), 'xx-XX');
  assert.equal(normalizeSpeechLocale('not a locale!'), 'und');
  assert.equal(sameSpeechLanguage('en-GB','en-US'),true);
  assert.equal(sameSpeechLanguage('ko-KR','en-US'),false);
});

test('split long multilingual article into bounded TTS text chunks without deletion',()=>{
  const txt = Array.from({length: 100},(_,i)=>'호흡이 필요한 한국어 문장 '+i+'.').join(' ');
  const parts=speechChunks(txt,190);
  assert.ok(parts.length>1);
  assert.ok(parts.every(part=>part.length<=190));
  assert.equal(parts.join(' ').replace(/\s+/g,' '),txt.replace(/\s+/g,' '));
});

test('unapproved or sample/cache source cannot mint voice bridge job request',()=>{
  const r=makeGlobalVoiceRequest({...approved,source:'SAMPLE_OR_CACHE'});
  assert.equal(r.status,'HOLD_APPROVED_PUBLIC_SOURCE_REQUIRED');
  assert.equal(r.publishedAudio,false);
  assert.equal(r.mcpAdapterStatus,'NOT_WIRED');
  assert.equal('text' in r,false);
});

test('cannot pretend a Korean original has been translated into arbitrary language',()=>{
  const r=makeGlobalVoiceRequest({...approved,requestedLanguage:'es-ES'});
  assert.equal(r.status,'HOLD_TRANSLATED_ARTICLE_REQUIRED');
});

test('Gemini Live and Sion voices never auto-call unverified providers',()=>{
  const a=makeGlobalVoiceRequest({...approved,provider:'GEMINI_LIVE'});
  const b=makeGlobalVoiceRequest({...approved,provider:'SION_LOCAL_VOICE'});
  assert.equal(a.status,'HOLD_GEMINI_LIVE_AUTH_TIER_AND_EPHEMERAL_TOKEN');
  assert.equal(b.status,'HOLD_SION_LOCAL_LICENSED_SERVICE_AND_CONSENT');
  assert.equal(a.attachedAudioBytes,0);
  assert.equal(b.transmittedArticleText,false);
});

test('public selected browser voice produces only a non-publishable metadata receipt',()=>{
  const r=makeGlobalVoiceRequest(approved);
  assert.equal(r.schemaVersion,GOODWAY_VOICE_CONTRACT_VERSION);
  assert.equal(r.status,'PREVIEW_ONLY_NOT_A_JOB');
  assert.equal(r.publicationAction,undefined);
  assert.equal(r.uploadAllowed,undefined);
  assert.equal(r.creatorVoiceRights,'NOT_INFERRED');
  assert.equal(r.translationPerformed,false);
  assert.equal(r.publishApproval,'NOT_REQUESTED');
  assert.equal(r.transmittedArticleText,false);
  assert.equal(r.mcpAdapterStatus,'NOT_WIRED');
  assert.ok(!JSON.stringify(r).includes('rawText'));
});
