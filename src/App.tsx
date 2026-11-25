import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Session } from '@supabase/supabase-js';
import { DEMO } from './config';
import { ROADMAP_TITLE, PHASES } from './data/roadmap';
import { sb } from './lib/supabase';
import { useProgress } from './lib/progress';
import { useMedia } from './lib/hooks';
import { currentPhaseId, findTopic, overallCount } from './lib/stats';
import { findLegacy, markLegacyHandled } from './lib/legacy';
import { PhaseMap } from './components/PhaseMap';
import { TopicSheet } from './components/TopicSheet';
import { Reader } from './components/Reader';
import { Ring } from './components/Ring';
import { Login } from './components/Login';
import { Logo } from './components/Logo';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!sb);

  useEffect(() => {
    if (!sb) return;
    sb.auth.getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(null))
      .finally(() => setAuthReady(true));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!authReady) return <div className="splash"><Logo size={48} /></div>;
  if (sb && !session) return <Login />;
  return <Roadmap userId={session?.user.id ?? null} />;
}

function Roadmap({ userId }: { userId: string | null }) {
  const isDesktop = useMedia('(min-width: 768px)');
  const { done, ready, error, clearError, setSteps } = useProgress(sb, userId);
  const [openPhase, setOpenPhase] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [legacy, setLegacy] = useState<string[]>([]);
  const [reading, setReading] = useState<{ topicId: string; start: string | null; resume: boolean } | null>(null);
  const booted = useRef(false);

  // Saat data siap (sekali saja): buka fase yang sedang dikerjakan, cek progres lama.
  useEffect(() => {
    if (!ready || booted.current) return;
    booted.current = true;
    setOpenPhase(currentPhaseId(done));
    const old = findLegacy().filter(id => !done.has(id));
    if (old.length) setLegacy(old); else markLegacyHandled();
  }, [ready, done]);

  useEffect(() => {
    // Galat muat awal tetap tampil (menggantikan peta); hanya toast setelah siap yang hilang sendiri.
    if (!error || !ready) return;
    const t = setTimeout(clearError, 4200);
    return () => clearTimeout(t);
  }, [error, ready, clearError]);

  const all = overallCount(done);
  const current = PHASES.findIndex(p => p.id === currentPhaseId(done));
  const sheet = useMemo(() => findTopic(activeTopic), [activeTopic]);
  const book = useMemo(() => (reading ? findTopic(reading.topicId) : null), [reading]);

  function togglePhase(id: string) {
    setActiveTopic(null);
    setOpenPhase(o => (o === id ? null : id));
  }

  function openTopic(id: string) {
    if (activeTopic === id) { setActiveTopic(null); return; }
    setActiveTopic(id);
    if (!isDesktop) {
      // Di iPhone, geser peta supaya gelembungnya tetap terlihat di atas bottom sheet.
      const el = document.querySelector<HTMLElement>(`[data-topic="${id}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        const target = innerHeight * 0.2;
        if (r.top + r.height / 2 > innerHeight * 0.34) scrollBy({ top: r.top + r.height / 2 - target, behavior: 'smooth' });
      }
    }
  }

  async function importLegacy() {
    // Kalau gagal tersimpan, banner tetap ada supaya bisa dicoba lagi.
    if (!(await setSteps(legacy, true))) return;
    setLegacy([]);
    markLegacyHandled();
  }

  const toggleStep = (id: string, value: boolean) => setSteps([id], value);
  const sheetOpen = isDesktop && !!sheet;

  return (
    <>
      <div className={`page${sheetOpen ? ' with-sheet' : ''}`}>
        <header className="topbar">
          <div className="brand"><span className="logo-badge"><Logo size={24} variant="dream" /></span><span>Conway</span></div>
          {DEMO
            ? <a className="chip" href="./">Mode contoh · Keluar</a>
            : <button type="button" className="chip" onClick={() => sb?.auth.signOut()}>Keluar</button>}
        </header>

        <section className="hero" aria-live="polite">
          <p className="eyebrow">{ROADMAP_TITLE}</p>
          <div className="summary">
            <Ring size={64} stroke={7} pct={all.pct} />
            <div>
              <strong className="pct">{Math.round(all.pct * 100)}%</strong>
              <span className="muted">
                {all.done} dari {all.total} langkah
                {ready && all.pct < 1 && ` · sekarang di Fase ${current + 1}`}
              </span>
            </div>
          </div>
        </section>

        <AnimatePresence>
          {legacy.length > 0 && (
            <motion.div className="banner" role="status"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <p>Ada <strong>{legacy.length} centang</strong> dari roadmap lama. Pindahkan ke Conway?</p>
              <div className="banner-actions">
                <button type="button" className="btn-primary" onClick={importLegacy}>Pindahkan</button>
                <button type="button" className="btn-ghost" onClick={() => { setLegacy([]); markLegacyHandled(); }}>Abaikan</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {ready
          ? <PhaseMap done={done} openPhase={openPhase} activeTopic={activeTopic} isDesktop={isDesktop}
              onTogglePhase={togglePhase} onTopic={openTopic} />
          : <p className="muted loading">{error ?? 'Memuat progres…'}</p>}

        <footer className="foot muted">
          {DEMO ? 'Mode contoh: progres hanya tersimpan di browser ini.' : 'Progres tersinkron lewat akun StudyO.'}
        </footer>
      </div>

      {/* Panel dilepas selama pembaca terbuka. Vaul 1.1.2 tidak meneruskan modal={false} ke Radix Dialog,
          sehingga panel yang terbuka memasang pengunci gulir (RemoveScroll) yang menelan gulir di pembaca.
          Topik aktif tetap disimpan, jadi panel muncul lagi saat pembaca ditutup. */}
      {!reading && (
        <TopicSheet data={sheet} done={done} isDesktop={isDesktop}
          onClose={() => setActiveTopic(null)} onStep={toggleStep}
          onRead={(start, resume) => sheet && setReading({ topicId: sheet.topic.id, start, resume: !!resume })} />
      )}

      {book && reading && (
        <Reader key={`${reading.topicId}:${reading.start}`} topic={book.topic} phase={book.phase} phaseIndex={book.phaseIndex}
          done={done} start={reading.start} resume={reading.resume}
          onStep={toggleStep} onClose={() => setReading(null)} />
      )}

      <AnimatePresence>
        {error && ready && (
          <motion.div className="toast" role="alert"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
