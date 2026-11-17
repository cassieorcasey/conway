import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Drawer } from '../vendor/vaul';
import { motion } from 'motion/react';
import type { Phase, Topic } from '../data/roadmap';
import { topicCount } from '../lib/stats';
import { NOTES } from '../content';
import { splitBook } from '../lib/book';
import { loadPos } from '../lib/reader';
import { Ring } from './Ring';
import { chapterLabel } from './Reader';
import { ArrowUpRight, Book, Check, ChevronRight, Close, Globe, Play } from './icons';

interface Props {
  data: { topic: Topic; phase: Phase; phaseIndex: number } | null;
  done: Set<string>;
  isDesktop: boolean;
  onClose: () => void;
  onStep: (id: string, value: boolean) => void;
  /** Buka pembaca materi di bab tertentu (null = sampul). */
  onRead: (start: string | null, resume?: boolean) => void;
}

/**
 * Panel topik: slide-over kanan di laptop, bottom sheet di iPhone.
 * Non-modal, jadi peta di belakangnya tetap bisa diketuk dan ikut berubah saat langkah dicentang.
 */
export function TopicSheet({ data, done, isDesktop, onClose, onStep, onRead }: Props) {
  // Simpan isi terakhir supaya panel tidak kosong selama animasi menutup.
  const [shown, setShown] = useState(data);
  useEffect(() => { if (data) setShown(data); }, [data]);
  const view = data ?? shown;

  return (
    <Drawer.Root
      open={!!data}
      onOpenChange={o => { if (!o) onClose(); }}
      direction={isDesktop ? 'right' : 'bottom'}
      modal={false}
    >
      <Drawer.Portal>
        <Drawer.Content
          className={`sheet ${isDesktop ? 'sheet-right' : 'sheet-bottom'}`}
          style={isDesktop ? ({ '--initial-transform': 'calc(100% + 16px)' } as CSSProperties) : undefined}
          aria-describedby={undefined}
        >
          {!isDesktop && <div className="sheet-handle" aria-hidden="true" />}
          {view && <SheetBody key={view.topic.id} {...view} done={done} onStep={onStep} onRead={onRead} />}
          <Drawer.Close className="sheet-close" aria-label="Tutup panel"><Close /></Drawer.Close>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function SheetBody({ topic, phase, phaseIndex, done, onStep, onRead }: {
  topic: Topic; phase: Phase; phaseIndex: number; done: Set<string>; onStep: Props['onStep']; onRead: Props['onRead'];
}) {
  const c = topicCount(topic, done);
  const note = NOTES[topic.id];
  const book = useMemo(() => (note ? splitBook(note, topic.steps) : null), [note, topic]);
  const byStep = useMemo(() => new Map((book?.chapters ?? []).filter(ch => ch.stepId).map(ch => [ch.stepId!, ch])), [book]);
  const pos = loadPos(topic.id);
  const resumeAt = pos && book ? book.chapters.find(ch => ch.key === pos.key) : undefined;
  const numbered = book ? book.chapters.filter(ch => ch.n !== null).length : 0;

  return (
    <div className="sheet-scroll">
      <header className="sheet-head">
        <p className="sheet-eyebrow"><strong>Fase {phaseIndex + 1}</strong> · {phase.title}</p>
        <Drawer.Title className="sheet-title">{topic.title}</Drawer.Title>
        <div className="sheet-progress">
          <Ring size={28} stroke={4} pct={c.pct} />
          <span>{c.done === c.total ? 'Semua langkah selesai' : `${c.done} dari ${c.total} langkah selesai`}</span>
        </div>
      </header>

      {book && (
        <button type="button" className="book-card" onClick={() => (resumeAt ? onRead(resumeAt.key, true) : onRead(null))}>
          <span className="book-card-icon"><Book /></span>
          <span className="book-card-text">
            <strong>{resumeAt ? `Lanjutkan ${chapterLabel(resumeAt)}` : 'Baca materi'}</strong>
            <span>{resumeAt ? resumeAt.title : `${numbered} bab · ${book.minutes} menit baca`}</span>
          </span>
          <ChevronRight />
        </button>
      )}

      <section className="sheet-section">
        <h3>Langkah</h3>
        <ul className="steps">
          {topic.steps.map(s => {
            const on = done.has(s.id);
            const ch = byStep.get(s.id);
            return (
              <li key={s.id} className="step-row">
                <button type="button" role="checkbox" aria-checked={on} className={`step${on ? ' on' : ''}`} onClick={() => onStep(s.id, !on)}>
                  <motion.span
                    className="tick"
                    initial={false}
                    animate={{ scale: on ? [1, 1.24, 1] : 1 }}
                    transition={{ duration: 0.32, ease: [0.3, 1.4, 0.5, 1] }}
                  >
                    {on && <Check size={13} />}
                  </motion.span>
                  <span className="step-text">{s.text}</span>
                </button>
                {ch && (
                  <button type="button" className="step-read" onClick={() => onRead(ch.key)} aria-label={`Baca ${chapterLabel(ch)}: ${s.text}`}>
                    <Book size={17} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {topic.sources.length > 0 && (
        <section className="sheet-section">
          <h3>Sumber belajar</h3>
          <ul className="sources">
            {topic.sources.map(src => (
              <li key={src.url + src.title}>
                <a className="source" href={src.url} target="_blank" rel="noopener noreferrer">
                  <span className={`pill ${src.kind}`}>
                    {src.kind === 'youtube' ? <Play /> : <Globe />}
                    {src.kind === 'youtube' ? 'YouTube' : 'Web'}
                    <ArrowUpRight />
                  </span>
                  <span className="source-title">{src.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
