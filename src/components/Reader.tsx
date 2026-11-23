import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { Phase, Topic } from '../data/roadmap';
import { NOTES } from '../content';
import { splitBook, type Chapter } from '../lib/book';
import { FS_MAX, FS_MIN, loadPos, loadSettings, savePos, saveSettings, type Mode, type ReaderSettings, type Tone } from '../lib/reader';
import { topicCount } from '../lib/stats';
import { Markdown } from './Markdown';
import { Bolt, Check, ChevronLeft, ChevronRight, Close, ListIcon } from './icons';

interface Props {
  topic: Topic;
  phase: Phase;
  phaseIndex: number;
  done: Set<string>;
  /** Kunci bab untuk dibuka langsung; null = sampul. */
  start: string | null;
  /** Kembalikan posisi gulir terakhir di bab itu. */
  resume?: boolean;
  onStep: (id: string, value: boolean) => void;
  onClose: () => void;
}

export const chapterLabel = (c: Chapter) => (c.n !== null ? `Bab ${c.n}` : c.stepId ? 'Mini-proyek' : 'Lampiran');

const TONES: { v: Tone; label: string; swatch?: string }[] = [
  { v: 'auto', label: 'Otomatis' },
  { v: 'light', label: 'Terang', swatch: '#f5f5f7' },
  { v: 'sepia', label: 'Sepia', swatch: '#f2e8d2' },
  { v: 'dark', label: 'Gelap', swatch: '#0b0b0d' },
];
const MODES: { v: Mode; label: string }[] = [{ v: 'lengkap', label: 'Lengkap' }, { v: 'cepat', label: 'Cepat' }];

/** Pembaca materi layar penuh, bergaya buku: sampul, daftar isi, lalu satu bab per langkah. */
export function Reader({ topic, phase, phaseIndex, done, start, resume, onStep, onClose }: Props) {
  const book = useMemo(() => splitBook(NOTES[topic.id] ?? '', topic.steps), [topic]);
  const numbered = book.chapters.filter(c => c.n !== null).length;

  const [settings, setSettings] = useState<ReaderSettings>(loadSettings);
  const update = (p: Partial<ReaderSettings>) => setSettings(s => { const n = { ...s, ...p }; saveSettings(n); return n; });

  const firstPage = useMemo(() => (start ? Math.max(-1, book.chapters.findIndex(c => c.key === start)) : -1), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [page, setPage] = useState(firstPage);
  const [sheet, setSheet] = useState<null | 'aa' | 'toc'>(null);

  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const pendingY = useRef<number>(resume && start ? loadPos(topic.id)?.y ?? 0 : 0);
  const saveTimer = useRef<number>(0);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const chapter = page >= 0 ? book.chapters[page] : null;
  const next = page + 1 < book.chapters.length ? book.chapters[page + 1] : null;
  const quick = settings.mode === 'cepat';

  // Tombol kembali di browser/iPhone menutup pembaca, bukan meninggalkan aplikasi.
  useEffect(() => {
    history.pushState({ waypointReader: true }, '');
    const onPop = () => closeRef.current();
    addEventListener('popstate', onPop);
    return () => removeEventListener('popstate', onPop);
  }, []);
  const close = () => { if (history.state?.waypointReader) history.back(); else onClose(); };

  // Kunci gulir halaman di belakang dan fokuskan pembaca.
  useEffect(() => {
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = 'hidden';
    // Isi di belakang pembaca tidak bisa dijangkau Tab atau pembaca layar selama pembaca terbuka.
    const behind = [...document.body.children].filter(c => c !== root.current && !c.hasAttribute('inert'));
    // visibility:hidden menjaga tata letak (posisi gulir peta tetap), tapi iOS berhenti menggambar lapisan blur di belakang.
    behind.forEach(c => { c.setAttribute('inert', ''); (c as HTMLElement).style.visibility = 'hidden'; });
    root.current?.focus();
    return () => {
      el.style.overflow = prev;
      behind.forEach(c => { c.removeAttribute('inert'); (c as HTMLElement).style.visibility = ''; });
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation(); // jangan sampai panel topik di belakang ikut tertutup
      if (sheet) setSheet(null); else close();
    };
    addEventListener('keydown', onKey, true);
    return () => removeEventListener('keydown', onKey, true);
  });

  // Setiap ganti halaman: gulir ke posisi yang diminta (atas, atau posisi terakhir saat melanjutkan).
  useLayoutEffect(() => {
    const s = scroller.current;
    if (!s) return;
    s.scrollTop = pendingY.current; // diisi oleh goTo (atau posisi tersimpan saat melanjutkan)
    measure();
    if (page >= 0) remember(page, s.scrollTop);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bilah progres: satu pembaruan per frame (rAF), tanpa transisi CSS, supaya mengikuti gulir tanpa tertinggal.
  const raf = useRef(0);
  function measure() {
    const s = scroller.current;
    if (!s) return;
    const h = s.scrollHeight - s.clientHeight;
    const p = h > 0 ? Math.min(1, Math.max(0, s.scrollTop / h)) : 0;
    if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
  }
  function schedule() {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => { raf.current = 0; measure(); });
  }

  // Tinggi isi berubah (font selesai dimuat, ukuran huruf, kuis dibuka, layar diputar): hitung ulang.
  useEffect(() => {
    const s = scroller.current;
    if (!s || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(schedule);
    ro.observe(s);
    if (s.lastElementChild) ro.observe(s.lastElementChild); // <main>: tingginya ikut isi bab
    document.fonts?.ready.then(schedule);
    return () => { ro.disconnect(); cancelAnimationFrame(raf.current); raf.current = 0; clearTimeout(saveTimer.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function remember(p: number, y: number) {
    const c = book.chapters[p];
    if (c) savePos(topic.id, { key: c.key, y: Math.round(y) });
  }

  function onScroll() {
    schedule();
    if (page < 0) return;
    clearTimeout(saveTimer.current);
    const y = scroller.current?.scrollTop ?? 0;
    saveTimer.current = window.setTimeout(() => remember(page, y), 350);
  }

  // Simpanan gulir yang tertunda jangan sampai menimpa posisi setelah pembaca ditutup.
  useEffect(() => () => clearTimeout(saveTimer.current), []);

  function goTo(p: number, y = 0) {
    clearTimeout(saveTimer.current); // simpanan tertunda dari bab lama tidak boleh menimpa bab baru
    pendingY.current = y;
    setSheet(null);
    setPage(p);
  }

  // Posisi terakhir dibaca langsung dari penyimpanan saat sampul tampil, supaya selalu terbaru.
  const saved = page < 0 ? loadPos(topic.id) : null;
  const savedIndex = saved ? book.chapters.findIndex(c => c.key === saved.key) : -1;
  const progress = topicCount(topic, done);
  const where = chapter
    ? `${chapterLabel(chapter)}${chapter.n !== null ? ` dari ${numbered}` : ''}`
    : 'Sampul';

  return createPortal(
    <div className="reader" ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`Materi ${topic.title}`}
      data-tone={settings.tone === 'auto' ? undefined : settings.tone}>
      <div className="r-scroll" ref={scroller} onScroll={onScroll}>
        <header className="r-bar">
          <div className="r-bar-in">
            <button type="button" className="r-back" onClick={close} aria-label={`Tutup materi ${topic.title}`}>
              <ChevronLeft /><span>{topic.title}</span>
            </button>
            <p className="r-where">{where}</p>
            <button type="button" className="r-icon" onClick={() => setSheet('toc')} aria-label="Daftar isi"><ListIcon /></button>
            <button type="button" className="r-icon r-aa" onClick={() => setSheet('aa')} aria-label="Tampilan baca: ukuran huruf, tema, mode">Aa</button>
          </div>
          <div className="r-progress" aria-hidden="true"><i ref={bar} /></div>
        </header>

        <main className="r-page" style={{ '--fs': `${settings.fs}px` } as CSSProperties}>
          {chapter ? (
            <article key={chapter.key}>
              <p className="r-kicker">{chapterLabel(chapter)} · {topic.title}</p>
              <h1 className="r-title">{chapter.title}</h1>
              <p className="r-meta">
                {quick && chapter.intinya ? 'Mode cepat · sekitar 1 menit' : `${chapter.minutes} menit baca${chapter.intinya ? ' · mode cepat 1 menit' : ''}`}
              </p>

              {chapter.intinya && (
                <section className="r-inti" aria-label="Intinya">
                  <p className="r-label"><Bolt /> Intinya</p>
                  <Markdown source={chapter.intinya} />
                </section>
              )}

              {quick && chapter.intinya
                ? <p className="r-quick">Mode cepat: penjelasan lengkap disembunyikan. Ganti ke Lengkap lewat tombol Aa.</p>
                : <div className="r-body"><Markdown source={chapter.body} /></div>}

              {chapter.rangkuman && (
                <section className="r-recap" aria-label="Ingat">
                  <p className="r-label">Ingat</p>
                  <Markdown source={chapter.rangkuman} />
                </section>
              )}

              <div className="r-end">
                {chapter.stepId && (() => {
                  const on = done.has(chapter.stepId);
                  return (
                    <button type="button" className={`r-btn wide${on ? ' is-done' : ' primary'}`} aria-pressed={on}
                      onClick={() => onStep(chapter.stepId!, !on)}>
                      {on ? <><Check /> Langkah selesai</> : 'Tandai langkah selesai'}
                    </button>
                  );
                })()}
                {next ? (
                  <button type="button" className="r-next" onClick={() => goTo(page + 1)}>
                    <span><small>Berikutnya · {chapterLabel(next)}</small><b>{next.title}</b></span><ChevronRight />
                  </button>
                ) : (
                  <button type="button" className="r-next" onClick={close}>
                    <span><small>Akhir materi</small><b>Kembali ke peta</b></span><ChevronRight />
                  </button>
                )}
              </div>
            </article>
          ) : (
            <article className="r-cover">
              <p className="r-kicker">Fase {phaseIndex + 1} · {phase.title}</p>
              <h1 className="r-title">{topic.title}</h1>
              <p className="r-meta">{numbered} bab · {book.minutes} menit baca · {progress.done} dari {progress.total} langkah selesai</p>
              {book.intro && <div className="r-body"><Markdown source={book.intro} /></div>}
              <button type="button" className="r-btn primary wide"
                onClick={() => (savedIndex >= 0 ? goTo(savedIndex, saved!.y) : goTo(0))}>
                {savedIndex >= 0 ? `Lanjutkan ${chapterLabel(book.chapters[savedIndex])}` : 'Mulai membaca'}
              </button>
              <h2 className="r-toc-h">Daftar isi</h2>
              <Toc chapters={book.chapters} page={page} done={done} onPick={i => goTo(i)} />
            </article>
          )}
        </main>
      </div>

      {sheet && (
        <>
          <div className="r-scrim" onClick={() => setSheet(null)} />
          <section className="r-sheet" role="dialog" aria-modal="true" aria-label={sheet === 'aa' ? 'Tampilan baca' : 'Daftar isi'}>
            <div className="r-sheet-in">
              <div className="r-grab" aria-hidden="true" />
              <div className="r-sheet-head">
                <h2>{sheet === 'aa' ? 'Tampilan baca' : topic.title}</h2>
                <button type="button" className="r-icon" onClick={() => setSheet(null)} aria-label="Tutup"><Close size={18} /></button>
              </div>
              {sheet === 'toc' ? (
                <>
                  <button type="button" className={`r-toc-cover${page < 0 ? ' now' : ''}`} onClick={() => goTo(-1)}>Sampul dan pengantar</button>
                  <Toc chapters={book.chapters} page={page} done={done} onPick={i => goTo(i)} />
                </>
              ) : (
                <div className="r-settings">
                  <div className="r-row">
                    <span className="r-row-l">Huruf</span>
                    <div className="r-seg" role="group" aria-label="Ukuran huruf">
                      <button type="button" onClick={() => update({ fs: Math.max(FS_MIN, settings.fs - 1) })} disabled={settings.fs <= FS_MIN} aria-label="Perkecil huruf">A−</button>
                      <span className="r-seg-val" aria-live="polite">{settings.fs}</span>
                      <button type="button" onClick={() => update({ fs: Math.min(FS_MAX, settings.fs + 1) })} disabled={settings.fs >= FS_MAX} aria-label="Perbesar huruf">A+</button>
                    </div>
                  </div>
                  <div className="r-row stack">
                    <span className="r-row-l">Tema</span>
                    <div className="r-seg" role="group" aria-label="Tema baca">
                      {TONES.map(t => (
                        <button key={t.v} type="button" aria-pressed={settings.tone === t.v} onClick={() => update({ tone: t.v })}>
                          {t.swatch && <span className="r-sw" style={{ background: t.swatch }} />}{t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="r-row stack">
                    <span className="r-row-l">Mode</span>
                    <div className="r-seg" role="group" aria-label="Mode baca">
                      {MODES.map(m => (
                        <button key={m.v} type="button" aria-pressed={settings.mode === m.v} onClick={() => { update({ mode: m.v }); setSheet(null); }}>{m.label}</button>
                      ))}
                    </div>
                  </div>
                  <p className="r-hint">Cepat hanya menampilkan Intinya dan rangkuman tiap bab, sekitar satu menit.</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>,
    document.body,
  );
}

function Toc({ chapters, page, done, onPick }: { chapters: Chapter[]; page: number; done: Set<string>; onPick: (i: number) => void }) {
  return (
    <ol className="r-toc">
      {chapters.map((c, i) => {
        const isDone = !!c.stepId && done.has(c.stepId);
        const now = i === page;
        return (
          <li key={c.key}>
            <button type="button" className={`${isDone ? 'done' : ''}${now ? ' now' : ''}`} onClick={() => onPick(i)} aria-current={now ? 'page' : undefined}>
              <span className="r-toc-no" aria-hidden="true">{isDone ? <Check size={12} /> : c.n ?? '·'}</span>
              <span className="r-toc-t">{c.n === null && !c.title.startsWith(chapterLabel(c)) && <small>{chapterLabel(c)}</small>}{c.title}</span>
              <span className="r-toc-tag">{now ? 'Sedang dibaca' : `${c.minutes} mnt`}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
