import { test } from 'node:test';
import assert from 'node:assert/strict';
import { highlightLine } from '../src/lib/highlight';

const kinds = (line: string, lang: string) => highlightLine(line, lang).filter(t => t.k !== 'x').map(t => `${t.k}:${t.v}`);

test('python: kata kunci, fungsi, angka, komentar', () => {
  assert.deepEqual(kinds('def hitung(a): return a * 2  # dua kali', 'python'),
    ['k:def', 'f:hitung', 'k:return', 'n:2', 'c:# dua kali']);
});

test('python: tanda # di dalam string bukan komentar', () => {
  assert.deepEqual(kinds('print("#bukan")', 'python'), ['f:print', 's:"#bukan"']);
});

test('python: f-string dihitung sebagai string', () => {
  assert.deepEqual(kinds('f"{x}"', 'python'), ['s:f"{x}"']);
});

test('sql: kata kunci tidak peka huruf besar-kecil dan komentar --', () => {
  assert.deepEqual(kinds("select nama FROM t -- catatan", 'sql'), ['k:select', 'k:FROM', 'c:-- catatan']);
});

test('gabungan token mengembalikan baris yang sama persis', () => {
  const line = "    x = {'a': 1.5, \"b\": None}  # ok";
  assert.equal(highlightLine(line, 'python').map(t => t.v).join(''), line);
});

test('bahasa tak dikenal tetap aman (hanya string, angka, komentar)', () => {
  assert.equal(highlightLine('foo 42', '').map(t => t.v).join(''), 'foo 42');
});
