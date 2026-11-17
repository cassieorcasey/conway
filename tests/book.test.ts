import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitBook } from '../src/lib/book';
import { parseMarkdown } from '../src/lib/markdown';
import { PHASES } from '../src/data/roadmap';
import { NOTES } from '../src/content';

const steps = [
  { id: 'x-01', text: 'Satu' },
  { id: 'x-02', text: 'Dua' },
  { id: 'x-03', text: 'Mini-proyek Fase 1: sesuatu' },
];

const SRC = [
  'Pengantar topik.',
  '',
  '## 1. Bab satu',
  '',
  '::: intinya',
  'Inti bab satu.',
  ':::',
  '',
  'Isi bab satu.',
  '',
  '```python',
  '## bukan judul, ini komentar',
  '```',
  '',
  '::: rangkuman',
  '- poin a',
  '- poin b',
  ':::',
  '',
  '## 2. Bab dua',
  '',
  'Isi bab dua.',
  '',
  '## Mini-proyek Fase 1',
  '',
  'Kerjakan ini.',
  '',
  '## Latihan',
  '',
  '1. Soal.',
].join('\n');

test('splitBook memisahkan pengantar dan bab', () => {
  const b = splitBook(SRC, steps);
  assert.equal(b.intro.trim(), 'Pengantar topik.');
  assert.deepEqual(b.chapters.map(c => c.title), ['Bab satu', 'Bab dua', 'Mini-proyek Fase 1', 'Latihan']);
});

test('bab bernomor dipetakan ke langkah dengan urutan yang sama', () => {
  const b = splitBook(SRC, steps);
  assert.equal(b.chapters[0].stepId, 'x-01');
  assert.equal(b.chapters[1].stepId, 'x-02');
  assert.equal(b.chapters[0].n, 1);
});

test('bab Mini-proyek dipetakan ke langkah mini-proyek, Latihan jadi lampiran', () => {
  const b = splitBook(SRC, steps);
  assert.equal(b.chapters[2].stepId, 'x-03');
  assert.equal(b.chapters[3].stepId, null);
  assert.equal(b.chapters[3].n, null);
});

test('intinya dan rangkuman diambil keluar dari badan bab', () => {
  const c = splitBook(SRC, steps).chapters[0];
  assert.equal(c.intinya, 'Inti bab satu.');
  assert.equal(c.rangkuman, '- poin a\n- poin b');
  assert.ok(!c.body.includes(':::'));
  assert.ok(c.body.includes('Isi bab satu.'));
});

test('judul ## di dalam blok kode tidak memotong bab', () => {
  const c = splitBook(SRC, steps).chapters[0];
  assert.ok(c.body.includes('## bukan judul, ini komentar'));
});

test('bab tanpa intinya bernilai null', () => {
  assert.equal(splitBook(SRC, steps).chapters[1].intinya, null);
});

test('parseMarkdown: blok telusuri berisi kode dan langkah per baris', () => {
  const blocks = parseMarkdown([
    '::: telusuri',
    '```python',
    'a = 1',
    'print(a)',
    '```',
    '1: Membuat `a`.',
    '2: Mencetak a.',
    ':::',
  ].join('\n'));
  assert.equal(blocks.length, 1);
  const b = blocks[0];
  assert.equal(b.t, 'telusuri');
  if (b.t !== 'telusuri') return;
  assert.equal(b.lang, 'python');
  assert.equal(b.code, 'a = 1\nprint(a)');
  assert.deepEqual(b.steps, [{ line: 1, text: 'Membuat `a`.' }, { line: 2, text: 'Mencetak a.' }]);
});

test('parseMarkdown: blok tebak berisi pertanyaan, pilihan, jawaban benar, dan penjelasan', () => {
  const blocks = parseMarkdown([
    '::: tebak',
    '```python',
    'print(1 + 1)',
    '```',
    '? Apa hasilnya?',
    '- 11',
    '- [x] 2',
    '',
    'Penjumlahan angka, bukan teks.',
    ':::',
  ].join('\n'));
  const b = blocks[0];
  assert.equal(b.t, 'tebak');
  if (b.t !== 'tebak') return;
  assert.equal(b.question, 'Apa hasilnya?');
  assert.deepEqual(b.options, [{ text: '11', right: false }, { text: '2', right: true }]);
  assert.equal(b.explain, 'Penjumlahan angka, bukan teks.');
  assert.equal(b.code?.code, 'print(1 + 1)');
});

test('parseMarkdown: blok ::: tak dikenal dibaca sebagai markdown biasa', () => {
  const blocks = parseMarkdown('::: lain\nHalo **dunia**.\n:::');
  assert.deepEqual(blocks, [{ t: 'p', text: 'Halo **dunia**.' }]);
});

test('setiap langkah di roadmap punya tepat satu bab', () => {
  const missing: string[] = [];
  for (const p of PHASES) for (const t of p.topics) {
    const note = NOTES[t.id];
    if (!note) { missing.push(`${t.id}: tanpa catatan`); continue; }
    const ids = splitBook(note, t.steps).chapters.map(c => c.stepId).filter(Boolean);
    for (const s of t.steps) {
      const n = ids.filter(id => id === s.id).length;
      if (n !== 1) missing.push(`${s.id}: ${n} bab`);
    }
  }
  assert.deepEqual(missing, []);
});

test('setiap bab yang terhubung ke langkah punya Intinya dan rangkuman', () => {
  const missing: string[] = [];
  for (const p of PHASES) for (const t of p.topics) {
    const note = NOTES[t.id];
    if (!note) continue;
    for (const c of splitBook(note, t.steps).chapters) {
      if (!c.stepId) continue;
      if (!c.intinya) missing.push(`${c.stepId}: intinya`);
      if (!c.rangkuman) missing.push(`${c.stepId}: rangkuman`);
    }
  }
  assert.deepEqual(missing, []);
});
