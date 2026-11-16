import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyKeepNote, reviewKeepExport } from '../scripts/keep-review-gate.mjs';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const fixture = (textContent, rest = {}) => ({ title: '개인 글 초안', textContent, ...rest });

test('ordinary Keep note still requires human publication approval', () => {
  const r = classifyKeepNote(fixture('우리 동네 공간을 걷고 느낀 점'), 'some.json');
  assert.equal(r.status, 'HOLD_CREATOR_REVIEW');
  assert.equal(r.publicYn, 'N');
  assert.equal(r.approvalStatus, 'NOT_REQUESTED');
  assert.ok(r.reviewRequirements.includes('CREATOR_EXPLICIT_APPROVAL'));
});

test('Keep note ID remains stable across text revisions in the same source file', () => {
  const a = classifyKeepNote(fixture('오늘 주방을 생각했습니다.'), 'same-note.json');
  const b = classifyKeepNote(fixture('오늘 주방을 다시 생각했습니다.'), 'same-note.json');
  assert.equal(a.contentId, b.contentId);
  assert.notEqual(a.revisionHash, b.revisionHash);
});

test('API keys, passwords, and secret links never enter draft body', () => {
  const inputs = ['sk-proj-1234567890abcdefghij', 'OPENAI_API_KEY=example', '비밀번호 12345',
    'https://script.google.com/macros/s/ABCD/exec', 'client_secret: abc123'];
  for (const sample of inputs) {
    const r = classifyKeepNote(fixture(sample), sample.slice(0,2));
    assert.equal(r.status, 'HOLD_SENSITIVE_NO_DRAFT');
    assert.equal('rawText' in r, false);
    assert.equal('title' in r, false);
  }
});

test('personal contact, identifier, finance, and shared notes are blocked', () => {
  const inputs = ['user@example.com', '010-1234-5678', '주민등록번호', '계좌번호', '자택 주소 3동 105호'];
  for (const value of inputs) assert.equal(classifyKeepNote(fixture(value)).status, 'HOLD_SENSITIVE_NO_DRAFT');
  assert.equal(classifyKeepNote(fixture('메모', { collaborators: [{ email: 'example@example.com' }] })).status, 'HOLD_SENSITIVE_NO_DRAFT');
  assert.equal(classifyKeepNote(fixture('메모', { attachments: [{ name: 'private.png' }] })).status, 'HOLD_SENSITIVE_NO_DRAFT');
  assert.equal(classifyKeepNote(fixture('메모', { isTrashed: true })).status, 'HOLD_SENSITIVE_NO_DRAFT');
});

test('local batch only writes private review files and anonymized blocked metadata', async () => {
  const parent = await fs.mkdtemp(path.join(os.tmpdir(), 'goodway-keep-test-'));
  const input = path.join(parent, 'Keep');
  const output = path.join(parent, 'private-review');
  try {
    await fs.mkdir(input);
    await fs.writeFile(path.join(input, 'safe.json'), JSON.stringify(fixture('오늘 공간 디자인 이야기')));
    await fs.writeFile(path.join(input, 'blocked.json'), JSON.stringify(fixture('private@example.com and password', { attachments: [] })));
    const counts = await reviewKeepExport({ inputDir: input, outputDir: output });
    assert.deepEqual(counts, { reviewDrafts: 1, blockedOrUnparsed: 1 });
    const manifestText = await fs.readFile(path.join(output, 'manifest.json'), 'utf8');
    assert.equal(manifestText.includes('private@example.com'), false);
    assert.equal(manifestText.includes('password'), false);
    const names = await fs.readdir(output);
    assert.equal(names.length, 2);
    const draftText = await fs.readFile(path.join(output, names.find(x => x.endsWith('.review.json'))), 'utf8');
    assert.equal(draftText.includes('오늘 공간 디자인 이야기'), true);
    assert.equal(draftText.includes('private@example.com'), false);
    assert.equal(JSON.parse(draftText).publicYn, 'N');
  } finally { await fs.rm(parent, { recursive: true, force: true }); }
});
