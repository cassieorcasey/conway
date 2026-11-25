import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PHASES } from '../src/data/roadmap';
import { ALL_TOPICS, currentTopicId, nextTopicId, topicNumber, isPreview } from '../src/lib/stats';

const first = PHASES[0].topics[0];
const second = PHASES[0].topics[1];
const lastOfPhase1 = PHASES[0].topics[PHASES[0].topics.length - 1];
const firstOfPhase2 = PHASES[1].topics[0];
const allSteps = (ids: string[]) => new Set(ids.flatMap(id => ALL_TOPICS.find(t => t.id === id)!.steps.map(s => s.id)));

test('ALL_TOPICS berisi 34 topik berurutan lintas fase', () => {
  assert.equal(ALL_TOPICS.length, 34);
  assert.equal(ALL_TOPICS[0].id, first.id);
  assert.equal(ALL_TOPICS[PHASES[0].topics.length].id, firstOfPhase2.id);
});

test('topicNumber memberi nomor global mulai 1', () => {
  assert.equal(topicNumber(first.id), 1);
  assert.equal(topicNumber(firstOfPhase2.id), PHASES[0].topics.length + 1);
  assert.equal(topicNumber('tidak-ada'), 0);
});

test('currentTopicId: topik pertama yang belum selesai', () => {
  assert.equal(currentTopicId(new Set()), first.id);
  assert.equal(currentTopicId(allSteps([first.id])), second.id);
  // langkah setengah jalan tetap dianggap aktif
  assert.equal(currentTopicId(new Set([second.steps[0].id])), first.id);
});

test('currentTopicId: null saat semua topik selesai', () => {
  assert.equal(currentTopicId(allSteps(ALL_TOPICS.map(t => t.id))), null);
});

test('nextTopicId melewati batas fase dan null di ujung', () => {
  assert.equal(nextTopicId(first.id), second.id);
  assert.equal(nextTopicId(lastOfPhase1.id), firstOfPhase2.id);
  assert.equal(nextTopicId(ALL_TOPICS[33].id), null);
});

test('isPreview: hanya topik setelah topik aktif yang belum selesai', () => {
  const done = allSteps([first.id]); // aktif = topik ke-2
  assert.equal(isPreview(second.id, done), false); // aktif
  assert.equal(isPreview(first.id, done), false); // selesai, ditinjau ulang
  assert.equal(isPreview(PHASES[0].topics[2].id, done), true);
  assert.equal(isPreview(firstOfPhase2.id, done), true);
});
