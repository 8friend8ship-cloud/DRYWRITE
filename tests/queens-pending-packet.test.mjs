import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const packetUrl = new URL('../queens/pending/QUEENS_WRITER_20260727_MIDLIFE_CAREER.json', import.meta.url);
const packet = JSON.parse(await readFile(packetUrl, 'utf8'));

const requiredTopLevel = [
  'PACKET_ID',
  'SCHEMA_VERSION',
  'CREATED_AT',
  'RETRIEVAL_TIME',
  'REGION',
  'LANGUAGE',
  'TARGET_PROJECT',
  'TARGET_PIPELINE',
  'TOPIC_KEY',
  'EVIDENCE_CLASS',
  'PRODUCTION_STATUS',
  'SOURCES',
  'HOLDOUT_RULE',
  'NEXT_REQUIRED_TRANSITION',
];

const requiredSourceFields = [
  'SOURCE_ID',
  'SOURCE_URL',
  'SOURCE_DATE',
  'PUBLISHER',
  'TITLE',
  'EXTRACTED_EVIDENCE',
  'SAFE_WRITER_ANGLES',
  'PROHIBITED_INFERENCES',
  'DEDUPE_KEY',
  'DOWNSTREAM_STATUS',
];

test('packet has the required lineage and evidence fields', () => {
  for (const field of requiredTopLevel) {
    assert.ok(packet[field] !== undefined && packet[field] !== null, `${field} is required`);
  }
  assert.equal(packet.TARGET_PROJECT, 'P02_WRITER');
  assert.equal(packet.PRODUCTION_STATUS, 'SOURCE_VERIFIED_PIPELINE_PENDING');
  assert.equal(packet.ABIDE_ID, null);
  assert.equal(packet.ABIDE_STATUS, 'REVIEW_REQUIRED');
});

test('every source is real, dated, deduplicated, and blocked before ABIDE mapping', () => {
  assert.ok(Array.isArray(packet.SOURCES));
  assert.ok(packet.SOURCES.length >= 5, 'at least five source records are required');

  const ids = new Set();
  const urls = new Set();
  const dedupeKeys = new Set();

  for (const source of packet.SOURCES) {
    for (const field of requiredSourceFields) {
      assert.ok(source[field] !== undefined && source[field] !== null, `${field} is required`);
    }
    assert.match(source.SOURCE_URL, /^https:\/\//);
    assert.match(source.SOURCE_DATE, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(source.EXTRACTED_EVIDENCE.length > 0);
    assert.ok(source.SAFE_WRITER_ANGLES.length > 0);
    assert.ok(source.PROHIBITED_INFERENCES.length > 0);
    assert.equal(source.DOWNSTREAM_STATUS, 'AWAITING_ABIDE_MAP');
    assert.ok(!ids.has(source.SOURCE_ID), `duplicate SOURCE_ID: ${source.SOURCE_ID}`);
    assert.ok(!urls.has(source.SOURCE_URL), `duplicate SOURCE_URL: ${source.SOURCE_URL}`);
    assert.ok(!dedupeKeys.has(source.DEDUPE_KEY), `duplicate DEDUPE_KEY: ${source.DEDUPE_KEY}`);
    ids.add(source.SOURCE_ID);
    urls.add(source.SOURCE_URL);
    dedupeKeys.add(source.DEDUPE_KEY);
  }
});

test('holdout uses multiple institutions and prevents premature promotion', () => {
  assert.equal(packet.HOLDOUT_RULE.OFFICIAL_TEMPLATE_ALLOWED, false);
  assert.equal(packet.HOLDOUT_RULE.FRONT_READY_ALLOWED, false);
  assert.ok(packet.HOLDOUT_RULE.CURRENT_SOURCE_COUNT >= 5);
  assert.ok(packet.HOLDOUT_RULE.CURRENT_INSTITUTION_COUNT >= 3);
  assert.ok(new Set(packet.SOURCES.map((source) => source.PUBLISHER)).size >= 3);
  assert.equal(packet.NEXT_REQUIRED_TRANSITION.STEP, 'ABIDE_Code_Map');
  assert.ok(packet.NEXT_REQUIRED_TRANSITION.REQUIREMENTS.includes('ABIDE_ID 확정'));
  assert.ok(packet.NEXT_REQUIRED_TRANSITION.REQUIREMENTS.some((item) => item.includes('중복')));
});

test('writer safety gates explicitly reject unsupported precision and clinical claims', () => {
  const combined = JSON.stringify(packet);
  assert.match(combined, /정밀수치|수치/);
  assert.match(combined, /임상|심리|뇌과학/);
  assert.match(combined, /마크다운/);
});
