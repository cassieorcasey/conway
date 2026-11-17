// Membagi satu catatan markdown menjadi "buku": pengantar + bab.
//
// Aturan penulisan catatan:
// - Teks sebelum judul ## pertama adalah pengantar (tampil di sampul).
// - "## 3. Judul" adalah bab 3 dan dipetakan ke langkah ke-3 topik itu.
// - "## Mini-proyek ..." dipetakan ke langkah yang teksnya diawali "Mini-proyek".
// - Judul ## lain (misalnya "## Latihan") menjadi lampiran tanpa langkah.
// - Di dalam bab, blok "::: intinya" dan "::: rangkuman" diambil keluar dan ditampilkan terpisah.

import { readingMinutes } from './markdown';

export interface Chapter {
  key: string;
  n: number | null;
  title: string;
  stepId: string | null;
  intinya: string | null;
  rangkuman: string | null;
  body: string;
  minutes: number;
}

export interface Book { intro: string; chapters: Chapter[]; minutes: number }

const FENCE_RE = /^\s*```/;
const H2_RE = /^##\s+(.+?)\s*$/;
const OPEN_RE = (name: string) => new RegExp(`^:::\\s*${name}\\s*$`);
const CLOSE_RE = /^:::\s*$/;

const slug = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

/** Ambil isi blok "::: name" pertama (di luar blok kode) dan buang blok itu dari baris. */
function extract(lines: string[], name: string): [string | null, string[]] {
  const open = OPEN_RE(name);
  let fence = false;
  for (let i = 0; i < lines.length; i++) {
    if (FENCE_RE.test(lines[i])) { fence = !fence; continue; }
    if (fence || !open.test(lines[i])) continue;
    let inner = false;
    for (let j = i + 1; j < lines.length; j++) {
      if (FENCE_RE.test(lines[j])) inner = !inner;
      else if (!inner && CLOSE_RE.test(lines[j])) {
        const body = lines.slice(i + 1, j).join('\n').trim();
        return [body || null, [...lines.slice(0, i), ...lines.slice(j + 1)]];
      }
    }
    return [null, lines]; // blok tidak ditutup: biarkan apa adanya
  }
  return [null, lines];
}

export function splitBook(src: string, steps: { id: string; text: string }[]): Book {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const intro: string[] = [];
  const sections: { title: string; lines: string[] }[] = [];
  let cur = intro;
  let fence = false;
  for (const line of lines) {
    if (FENCE_RE.test(line)) fence = !fence;
    const h = !fence ? H2_RE.exec(line) : null;
    if (h) { const s = { title: h[1], lines: [] as string[] }; sections.push(s); cur = s.lines; continue; }
    cur.push(line);
  }

  const miniStep = steps.find(s => /^Mini-proyek/i.test(s.text));
  const chapters = sections.map((s): Chapter => {
    const num = /^(\d+)\.\s+(.*)$/.exec(s.title);
    const n = num ? parseInt(num[1], 10) : null;
    const title = num ? num[2] : s.title;
    const stepId = n !== null ? steps[n - 1]?.id ?? null : /^Mini-proyek/i.test(title) ? miniStep?.id ?? null : null;
    const [intinya, withoutInti] = extract(s.lines, 'intinya');
    const [rangkuman, rest] = extract(withoutInti, 'rangkuman');
    const body = rest.join('\n').trim();
    return {
      key: stepId ?? `lampiran-${slug(title)}`,
      n, title, stepId, intinya, rangkuman, body,
      minutes: readingMinutes([intinya, body, rangkuman].filter(Boolean).join(' ')),
    };
  });

  return { intro: intro.join('\n').trim(), chapters, minutes: readingMinutes(src) };
}
