import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { NOTES } from '../content';
import { chapterLabel, splitBook } from '../lib/book';
import { useScrollProgress } from '../lib/hooks';
import { loadPos, loadSettings, savePos, saveSettings, type ReaderSettings } from '../lib/reader';
import { topicCount, type TopicEntry } from '../lib/stats';
import { Markdown } from './Markdown';
import { ReaderSheet, Toc, type SheetKind } from './ReaderSheet';
import { Bolt, Check, ChevronLeft, ChevronRight, ListIcon } from './icons';

interface Props {
  data: TopicEntry;
  done: Set<string>;
  /** Kunci bab untuk dibuka langsung; null = sampul. */
  start: string | null;
  /** Kembalikan posisi gulir terakhir di bab itu. */
  resume?: boolean;
  onStep: (id: string, value: boolean) => void;
  onClose: () => void;
  /** Laptop: pembaca menempati kolom laci (58%), peta di kirinya tetap terlihat dan bisa dipakai. */
  docked?: boolean;
}

/** Pembaca materi bergaya buku: sampul, daftar isi, lalu satu bab per langkah. */
export function Reader({ data, done, start, resume, onStep, onClose, docked = false }: Props) {
  const { topic, phase, phaseIndex } = data;
  const book = useMemo(() => splitBook(NOTES[topic.id] ?? '', topic.steps), [topic]);
  const numbered = book.chapters.filter(c => c.n !== null).length;

  const [settings, setSettings] = useState<ReaderSettings>(loadSettings);
  const updateSettings = (patch: Partial<ReaderSettings>) =>
    setSettings(s => { const n = { ...s, ...patch }; saveSettings(n); return n; });

  const [page, setPage] = useState(() => (start ? Math.max(-1, book.chapters.findIndex(c => c.key === start)) : -1));
  const [sheet, setSheet] = useState<SheetKind | null>(null);

  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  // Posisi gulir untuk halaman berikutnya; diisi goTo, atau posisi tersimpan saat melanjutkan.
  const pendingY = useRef<number>(resume && start ? loadPos(topic.id)?.y ?? 0 : 0);
  const saveTimer = useRef(0);

  const close = useBackToClose(onClose);
  useIsolate(root, docked);
  useEscape(() => { if (sheet) setSheet(null); else close(); });

  const { measure, schedule } = useScrollProgress(scroller, p => {
    if (bar.current) bar.current.style.clipPath = `inset(0 ${((1 - p) * 100).toFixed(2)}% 0 0)`;
  });

  const chapter = page >= 0 ? book.chapters[page] : null;
  const next = page + 1 < book.chapters.length ? book.chapters[page + 1] : null;
  const quick = settings.mode === 'cepat';

  function remember(p: number, y: number) {
    const c = book.chapters[p];
    if (c) savePos(topic.id, { key: c.key, y: Math.round(y) });
  }

  useLayoutEffect(() => {
    const s = scroller.current;
    if (!s) return;
    s.scrollTop = pendingY.current;
    measure();
    if (page >= 0) remember(page, s.scrollTop);
  }, [page]);

  // Simpanan gulir yang tertunda jangan sampai menimpa posisi setelah pembaca ditutup.
  useEffect(() => () => clearTimeout(saveTimer.current), []);

  function onScroll() {
    schedule();
    if (page < 0) return;
    clearTimeout(saveTimer.current);
    const y = scroller.current?.scrollTop ?? 0;
    saveTimer.current = window.setTimeout(() => remember(page, y), 350);
  }

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
  const stepDone = !!chapter?.stepId && done.has(chapter.stepId);

  return createPortal(
    <div className={`reader${docked ? ' docked' : ''}`} ref={root} tabIndex={-1} role="dialog" aria-modal={docked ? undefined : 'true'} aria-label={`Materi ${topic.title}`}
      data-tone={settings.tone === 'light' ? undefined : settings.tone}>
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
                {chapter.stepId && (
                  <button type="button" className={`r-btn wide${stepDone ? ' is-done' : ' primary'}`} aria-pressed={stepDone}
                    onClick={() => onStep(chapter.stepId!, !stepDone)}>
                    {stepDone ? <><Check /> Langkah selesai</> : 'Tandai langkah selesai'}
                  </button>
                )}
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
        <ReaderSheet kind={sheet} title={topic.title} chapters={book.chapters} page={page} done={done}
          settings={settings} onSettings={updateSettings} onPick={i => goTo(i)} onClose={() => setSheet(null)} />
      )}
    </div>,
    document.body,
  );
}

/** Tombol Back browser/iPhone menutup pembaca, bukan meninggalkan aplikasi. Mengembalikan fungsi tutup yang setara. */
function useBackToClose(onClose: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    history.pushState({ waypointReader: true }, '');
    const onPop = () => closeRef.current();
    addEventListener('popstate', onPop);
    return () => removeEventListener('popstate', onPop);
  }, []);
  return () => { if (history.state?.waypointReader) history.back(); else closeRef.current(); };
}

/** Isi di belakang pembaca tidak bisa dijangkau Tab, pembaca layar, atau gulir selama pembaca terbuka. */
function useIsolate(root: RefObject<HTMLElement | null>, docked: boolean) {
  useEffect(() => {
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    // Mode laci (laptop): peta tetap bisa digulir dan diklik; hanya laci di bawah pembaca yang disembunyikan.
    if (!docked) html.style.overflow = 'hidden';
    const behind = docked
      ? [...document.querySelectorAll('.drawer')].filter(c => !c.hasAttribute('inert'))
      : [...document.body.children].filter(c => c !== root.current && !c.hasAttribute('inert'));
    // visibility:hidden menjaga tata letak (posisi gulir peta tetap), tapi iOS berhenti menggambar lapisan blur di belakang.
    behind.forEach(c => { c.setAttribute('inert', ''); (c as HTMLElement).style.visibility = 'hidden'; });
    root.current?.focus();
    return () => {
      html.style.overflow = prevOverflow;
      behind.forEach(c => { c.removeAttribute('inert'); (c as HTMLElement).style.visibility = ''; });
    };
  }, [root, docked]);
}

function useEscape(onEscape: () => void) {
  const ref = useRef(onEscape);
  ref.current = onEscape;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation(); // laci materi di belakang tidak ikut tertutup
      ref.current();
    };
    addEventListener('keydown', onKey, true);
    return () => removeEventListener('keydown', onKey, true);
  }, []);
}
