import { chapterLabel, type Chapter } from '../lib/book';
import { FS_MAX, FS_MIN, type Mode, type ReaderSettings, type Tone } from '../lib/reader';
import { Check, Close } from './icons';

const TONES: { v: Tone; label: string; swatch: string }[] = [
  { v: 'light', label: 'Terang', swatch: '#f5f5f7' },
  { v: 'sepia', label: 'Sepia', swatch: '#f2e8d2' },
];
const MODES: { v: Mode; label: string }[] = [{ v: 'lengkap', label: 'Lengkap' }, { v: 'cepat', label: 'Cepat' }];

export type SheetKind = 'aa' | 'toc';

interface Props {
  kind: SheetKind;
  title: string;
  chapters: Chapter[];
  page: number;
  done: Set<string>;
  settings: ReaderSettings;
  onSettings: (patch: Partial<ReaderSettings>) => void;
  /** Pindah ke halaman (-1 = sampul). */
  onPick: (page: number) => void;
  onClose: () => void;
}

/** Lembar bawah di dalam pembaca: daftar isi atau pengaturan tampilan baca. */
export function ReaderSheet({ kind, title, chapters, page, done, settings, onSettings, onPick, onClose }: Props) {
  return (
    <>
      <div className="r-scrim" onClick={onClose} />
      <section className="r-sheet" role="dialog" aria-modal="true" aria-label={kind === 'aa' ? 'Tampilan baca' : 'Daftar isi'}>
        <div className="r-sheet-in">
          <div className="r-grab" aria-hidden="true" />
          <div className="r-sheet-head">
            <h2>{kind === 'aa' ? 'Tampilan baca' : title}</h2>
            <button type="button" className="r-icon" onClick={onClose} aria-label="Tutup"><Close size={18} /></button>
          </div>
          {kind === 'toc' ? (
            <>
              <button type="button" className={`r-toc-cover${page < 0 ? ' now' : ''}`} onClick={() => onPick(-1)}>Sampul dan pengantar</button>
              <Toc chapters={chapters} page={page} done={done} onPick={onPick} />
            </>
          ) : (
            <ReadingSettings settings={settings} onChange={onSettings} onModeChosen={onClose} />
          )}
        </div>
      </section>
    </>
  );
}

function ReadingSettings({ settings, onChange, onModeChosen }: {
  settings: ReaderSettings; onChange: (patch: Partial<ReaderSettings>) => void; onModeChosen: () => void;
}) {
  return (
    <div className="r-settings">
      <div className="r-row">
        <span className="r-row-l">Huruf</span>
        <div className="r-seg" role="group" aria-label="Ukuran huruf">
          <button type="button" onClick={() => onChange({ fs: Math.max(FS_MIN, settings.fs - 1) })} disabled={settings.fs <= FS_MIN} aria-label="Perkecil huruf">A−</button>
          <span className="r-seg-val" aria-live="polite">{settings.fs}</span>
          <button type="button" onClick={() => onChange({ fs: Math.min(FS_MAX, settings.fs + 1) })} disabled={settings.fs >= FS_MAX} aria-label="Perbesar huruf">A+</button>
        </div>
      </div>
      <div className="r-row stack">
        <span className="r-row-l">Tema</span>
        <div className="r-seg" role="group" aria-label="Tema baca">
          {TONES.map(t => (
            <button key={t.v} type="button" aria-pressed={settings.tone === t.v} onClick={() => onChange({ tone: t.v })}>
              <span className="r-sw" style={{ background: t.swatch }} />{t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="r-row stack">
        <span className="r-row-l">Mode</span>
        <div className="r-seg" role="group" aria-label="Mode baca">
          {MODES.map(m => (
            <button key={m.v} type="button" aria-pressed={settings.mode === m.v} onClick={() => { onChange({ mode: m.v }); onModeChosen(); }}>{m.label}</button>
          ))}
        </div>
      </div>
      <p className="r-hint">Cepat hanya menampilkan Intinya dan rangkuman tiap bab, sekitar satu menit.</p>
    </div>
  );
}

export function Toc({ chapters, page, done, onPick }: { chapters: Chapter[]; page: number; done: Set<string>; onPick: (i: number) => void }) {
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
