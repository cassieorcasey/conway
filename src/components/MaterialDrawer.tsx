import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ElementType } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Drawer } from '../vendor/vaul';
import { NOTES } from '../content';
import { chapterLabel, splitBook } from '../lib/book';
import { useScrollProgress } from '../lib/hooks';
import { loadPos } from '../lib/reader';
import { currentTopicId, isPreview, nextTopicId, pad2, topicCount, topicNumber, type TopicEntry } from '../lib/stats';
import { Ring } from './Ring';
import { ArrowUpRight, Book, Check, ChevronRight, Close, Globe, Play } from './icons';

interface BodyProps {
  data: TopicEntry;
  done: Set<string>;
  onStep: (id: string, value: boolean) => void;
  /** Buka pembaca materi di bab tertentu (null = sampul). */
  onRead: (start: string | null, resume?: boolean) => void;
  /** Tandai semua langkah tahap ini selesai, lalu lanjut ke tahap berikutnya. */
  onComplete: (topicId: string) => void;
  /** Pindah ke tahap lain (kembali ke tahap aktif). */
  onGo: (topicId: string) => void;
}

// Auto-glide & cross-slide: isi lama naik tipis sambil memudar, isi baru masuk dari bawah dalam 350ms.
const ENTER = { duration: 0.35, ease: [0.22, 1, 0.36, 1] } as const;
const LEAVE = { duration: 0.16, ease: [0.4, 0, 1, 1] } as const;

/** Laci Materi di laptop: kolom kanan 58% yang selalu terbuka di samping peta. */
export function MaterialDrawer(props: BodyProps) {
  return (
    <aside className="drawer sheet" aria-label="Laci materi">
      <DrawerBody {...props} Title="h2" />
    </aside>
  );
}

/** Laci Materi di iPhone dan tablet: bottom sheet 85vh, puncak peta tetap terlihat di atasnya. */
export function MaterialSheet({ data, onClose, ...rest }: Omit<BodyProps, 'data'> & { data: TopicEntry | null; onClose: () => void }) {
  // Simpan isi terakhir supaya laci tidak kosong selama animasi menutup.
  const [shown, setShown] = useState(data);
  useEffect(() => { if (data) setShown(data); }, [data]);
  const view = data ?? shown;

  return (
    <Drawer.Root open={!!data} onOpenChange={o => { if (!o) onClose(); }} direction="bottom" modal={false}>
      <Drawer.Portal>
        <Drawer.Content className="sheet sheet-bottom" aria-describedby={undefined}>
          <div className="sheet-handle" aria-hidden="true" />
          {view && <DrawerBody data={view} {...rest} Title={Drawer.Title} />}
          <Drawer.Close className="sheet-close" aria-label="Tutup laci"><Close /></Drawer.Close>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function DrawerBody({ data, Title, ...rest }: BodyProps & { Title: ElementType }) {
  const scroller = useRef<HTMLDivElement>(null);
  const hair = useRef<HTMLElement>(null);
  // Garis baca 2px di tepi atas laci: scaleX mengikuti persentase gulir.
  const { measure, schedule } = useScrollProgress(scroller, p => {
    if (hair.current) hair.current.style.transform = `scaleX(${p})`;
  });

  return (
    <div className="sheet-scroll d-scroll" ref={scroller} onScroll={schedule}>
      <div className="d-hair" aria-hidden="true"><i ref={hair} /></div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={data.topic.id} className="d-page"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: ENTER }} exit={{ opacity: 0, y: -8, transition: LEAVE }}
        >
          <DrawerPage data={data} Title={Title} onShown={() => { if (scroller.current) scroller.current.scrollTop = 0; measure(); }} {...rest} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DrawerPage({ data, done, Title, onShown, onStep, onRead, onComplete, onGo }: BodyProps & {
  Title: ElementType; onShown: () => void;
}) {
  const { topic, phase, phaseIndex } = data;
  const c = topicCount(topic, done);
  const isDone = c.pct >= 1;
  const num = topicNumber(topic.id);
  const cur = currentTopicId(done);
  const preview = isPreview(topic.id, done);
  const next = nextTopicId(topic.id);
  const note = NOTES[topic.id];
  const book = useMemo(() => (note ? splitBook(note, topic.steps) : null), [note, topic]);
  const byStep = useMemo(() => new Map((book?.chapters ?? []).filter(ch => ch.stepId).map(ch => [ch.stepId!, ch])), [book]);
  const pos = loadPos(topic.id);
  const resumeAt = pos && book ? book.chapters.find(ch => ch.key === pos.key) : undefined;
  const numbered = book ? book.chapters.filter(ch => ch.n !== null).length : 0;
  const [saved, setSaved] = useState(false);

  // Halaman baru selalu mulai dari atas, dan garis baca ikut kembali ke nol.
  useLayoutEffect(onShown, []);

  const status = isDone ? 'Selesai' : topic.id === cur ? 'Tahap aktif' : preview ? 'Pratinjau' : 'Dimulai';

  function complete() {
    if (saved) return;
    setSaved(true);
    onComplete(topic.id);
  }

  return (
    <>
      <header className="sheet-head">
        <p className="d-meta"><b>{pad2(num)}</b> · {status}{book ? ` · ~${book.minutes} menit` : ''}</p>
        {preview && cur && (
          <div className="d-preview">
            <span className="d-badge">Pratinjau Tahap {pad2(num)}</span>
            <button type="button" className="d-back" onClick={() => onGo(cur)}>
              Kembali ke Tahap Aktif ({pad2(topicNumber(cur))})
            </button>
          </div>
        )}
        <p className="sheet-eyebrow"><strong>Fase {phaseIndex + 1}</strong> · {phase.title}</p>
        <Title className="sheet-title">{topic.title}</Title>
        <div className="sheet-progress">
          <Ring size={28} stroke={4} pct={c.pct} />
          <span>{isDone ? 'Semua langkah selesai' : `${c.done} dari ${c.total} langkah selesai`}</span>
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

      <div className="d-action">
        {!isDone || saved ? (
          <motion.button
            type="button" className={`d-cta${saved ? ' saved' : ''}`} onClick={complete} aria-live="polite"
            whileTap={saved ? undefined : { scale: 0.98 }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={saved ? 'saved' : 'idle'} className="d-cta-label"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                {saved
                  ? <>Tersimpan <Check size={15} /></>
                  : <><Check size={15} /> {next ? `Tandai Selesai & Lanjut ke ${pad2(num + 1)}` : 'Tandai Selesai'}</>}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        ) : cur && cur !== topic.id ? (
          <button type="button" className="d-cta ghost" onClick={() => onGo(cur)}>
            Kembali ke Tahap Aktif ({pad2(topicNumber(cur))})
          </button>
        ) : (
          <p className="d-finish">Semua tahap selesai. Roadmap tuntas.</p>
        )}
      </div>
    </>
  );
}
