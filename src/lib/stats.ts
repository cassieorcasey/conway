import { PHASES, type Phase, type Topic } from '../data/roadmap';

export type Status = 'todo' | 'doing' | 'done';

export interface Count { done: number; total: number; pct: number }

const count = (done: number, total: number): Count => ({ done, total, pct: total ? done / total : 0 });

export const statusOf = (c: Count): Status => (c.done === 0 ? 'todo' : c.done === c.total ? 'done' : 'doing');

export const topicCount = (t: Topic, done: Set<string>) =>
  count(t.steps.filter(s => done.has(s.id)).length, t.steps.length);

export const phaseCount = (p: Phase, done: Set<string>) => {
  let d = 0, n = 0;
  for (const t of p.topics) for (const s of t.steps) { n++; if (done.has(s.id)) d++; }
  return count(d, n);
};

export const overallCount = (done: Set<string>) => {
  let d = 0, n = 0;
  for (const p of PHASES) { const c = phaseCount(p, done); d += c.done; n += c.total; }
  return count(d, n);
};

/** Fase yang sedang dikerjakan: fase pertama yang belum selesai. */
export const currentPhaseId = (done: Set<string>) =>
  PHASES.find(p => phaseCount(p, done).pct < 1)?.id ?? PHASES[PHASES.length - 1].id;

export const findTopic = (id: string | null) => {
  if (!id) return null;
  for (const [i, p] of PHASES.entries()) {
    const t = p.topics.find(x => x.id === id);
    if (t) return { topic: t, phase: p, phaseIndex: i };
  }
  return null;
};

/** Cincin: gradasi Twilight Horizon selama berjalan, sage solid saat selesai. */
export const ringDone = (pct: number) => pct >= 1;

/** Semua topik dalam urutan belajar, lintas fase (01–34). */
export const ALL_TOPICS: Topic[] = PHASES.flatMap(p => p.topics);

/** Nomor urut global topik, mulai 1; 0 bila tidak dikenal. */
export const topicNumber = (id: string) => ALL_TOPICS.findIndex(t => t.id === id) + 1;

const topicDone = (t: Topic, done: Set<string>) => t.steps.every(s => done.has(s.id));

/** Tahap aktif: topik pertama yang belum selesai; null bila semua selesai. */
export const currentTopicId = (done: Set<string>) => ALL_TOPICS.find(t => !topicDone(t, done))?.id ?? null;

/** Topik berikutnya dalam urutan; null di ujung roadmap. */
export const nextTopicId = (id: string) => {
  const n = topicNumber(id);
  return n > 0 && n < ALL_TOPICS.length ? ALL_TOPICS[n].id : null;
};

/** Pratinjau: topik setelah tahap aktif yang belum selesai (mengintip materi mendatang). */
export const isPreview = (id: string, done: Set<string>) => {
  const cur = currentTopicId(done);
  if (!cur) return false;
  const t = ALL_TOPICS.find(x => x.id === id);
  return !!t && !topicDone(t, done) && topicNumber(id) > topicNumber(cur);
};
