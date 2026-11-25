import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Session } from '@supabase/supabase-js';
import { DEMO } from './config';
import { ROADMAP_TITLE, PHASES } from './data/roadmap';
import { sb } from './lib/supabase';
import { useProgress } from './lib/progress';
import { useMedia } from './lib/hooks';
import { ALL_TOPICS, currentPhaseId, currentTopicId, findTopic, nextTopicId, overallCount, topicCount } from './lib/stats';
import { findLegacy, markLegacyHandled } from './lib/legacy';
import { PhaseMap, pad2 } from './components/PhaseMap';
import { MaterialDrawer, MaterialSheet } from './components/MaterialDrawer';
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

const GLIDE_DESKTOP = 0.35; // node tahap berhenti di ~35% tinggi layar
const GLIDE_SHEET = 0.075; // di iPhone: di puncak peta yang masih terlihat di atas laci 85vh
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function Roadmap({ userId }: { userId: string | null }) {
  const isDesktop = useMedia('(min-width: 1024px)');
  const { done, ready, error, clearError, setSteps } = useProgress(sb, userId);
  const [openPhase, setOpenPhase] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [legacy, setLegacy] = useState<string[]>([]);
  const [reading, setReading] = useState<{ topicId: string; start: string | null; resume: boolean } | null>(null);
  const booted = useRef(false);
  const openRef = useRef(openPhase);
  openRef.current = openPhase;
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const current = currentTopicId(done);
  // Di laptop laci selalu terbuka: tanpa pilihan, laci menampilkan tahap aktif.
  const shownTopic = activeTopic ?? (isDesktop ? current ?? ALL_TOPICS[ALL_TOPICS.length - 1].id : null);

  /** Gulir peta sehalus mungkin sampai node tahap berada di posisi nyaman. */
  function glideTo(id: string, frac: number) {
    const el = document.querySelector<HTMLElement>(`[data-topic="${id}"] .tnode`);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const top = Math.max(0, scrollY + r.top + r.height / 2 - innerHeight * frac);
    scrollTo({ top, behavior: reduceMotion() ? 'auto' : 'smooth' });
  }

  /** Tampilkan tahap di laci, buka fasenya bila perlu, lalu luncurkan peta ke node-nya. */
  function selectTopic(id: string, frac: number) {
    const f = findTopic(id);
    if (!f) return;
    setActiveTopic(id);
    const phaseChanged = openRef.current !== f.phase.id;
    if (phaseChanged) setOpenPhase(f.phase.id);
    // Tunggu pegas tinggi baris selesai supaya posisi akhir node sudah tetap.
    later(() => glideTo(id, frac), phaseChanged ? 480 : 40);
  }

  // Saat data siap (sekali saja): buka fase tahap aktif, pusatkan peta ke node aktif, cek progres lama.
  useEffect(() => {
    if (!ready || booted.current) return;
    booted.current = true;
    const cur = currentTopicId(done);
    setOpenPhase(currentPhaseId(done));
    if (cur && isDesktop) setActiveTopic(cur);
    if (cur) later(() => glideTo(cur, GLIDE_DESKTOP), 520);
    const old = findLegacy().filter(id => !done.has(id));
    if (old.length) setLegacy(old); else markLegacyHandled();
  }, [ready, done]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Galat muat awal tetap tampil (menggantikan peta); hanya toast setelah siap yang hilang sendiri.
    if (!error || !ready) return;
    const t = setTimeout(clearError, 4200);
    return () => clearTimeout(t);
  }, [error, ready, clearError]);

  const all = overallCount(done);
  const topicsDone = ALL_TOPICS.filter(t => topicCount(t, done).pct >= 1).length;
  const curPhase = PHASES.findIndex(p => p.id === currentPhaseId(done));
  const drawer = useMemo(() => findTopic(shownTopic), [shownTopic]);
  const book = useMemo(() => (reading ? findTopic(reading.topicId) : null), [reading]);

  function togglePhase(id: string) {
    if (!isDesktop) setActiveTopic(null);
    const opening = openPhase !== id;
    setOpenPhase(opening ? id : null);
    if (!opening) return;
    // Fase yang dibuka digulir ke atas layar bila kepalanya di luar jangkauan pandang.
    requestAnimationFrame(() => {
      const row = document.querySelector<HTMLElement>(`[data-phase="${id}"]`);
      if (!row) return;
      const top = row.getBoundingClientRect().top;
      if (top < 0 || top > innerHeight * 0.45) row.scrollIntoView({ block: 'start', behavior: reduceMotion() ? 'auto' : 'smooth' });
    });
  }

  function openTopic(id: string) {
    if (isDesktop) {
      // Pembaca di kolom laci menampilkan tahap lain: tutup lewat riwayat (sama dengan tombol kembali).
      if (reading && reading.topicId !== id) {
        if (history.state?.waypointReader) history.back(); else setReading(null);
      }
      setActiveTopic(id);
      return;
    }
    if (activeTopic === id) { setActiveTopic(null); return; }
    setActiveTopic(id);
    // Di iPhone, geser peta supaya node-nya tetap terlihat di atas laci 85vh.
    const el = document.querySelector<HTMLElement>(`[data-topic="${id}"] .tnode`);
    const r = el?.getBoundingClientRect();
    if (r && (r.top < 0 || r.top > innerHeight * 0.15)) glideTo(id, GLIDE_SHEET);
  }

  /** Tandai Selesai & Lanjut: tombol jadi "Tersimpan" (0–200ms), tinta mengalir (150–750ms),
   *  lalu peta meluncur ke tahap berikutnya dan isi laci berganti (550–900ms). */
  function completeTopic(id: string) {
    const f = findTopic(id);
    if (!f) return;
    const ids = f.topic.steps.map(s => s.id).filter(s => !done.has(s));
    if (ids.length) void setSteps(ids, true);
    const next = nextTopicId(id);
    if (next) later(() => selectTopic(next, isDesktop ? GLIDE_DESKTOP : GLIDE_SHEET), 550);
  }

  async function importLegacy() {
    // Kalau gagal tersimpan, banner tetap ada supaya bisa dicoba lagi.
    if (!(await setSteps(legacy, true))) return;
    setLegacy([]);
    markLegacyHandled();
  }

  const toggleStep = (id: string, value: boolean) => setSteps([id], value);
  const drawerProps = {
    done, onStep: toggleStep, onComplete: completeTopic,
    onGo: (id: string) => selectTopic(id, isDesktop ? GLIDE_DESKTOP : GLIDE_SHEET),
    onRead: (start: string | null, resume?: boolean) => drawer && setReading({ topicId: drawer.topic.id, start, resume: !!resume }),
  };

  return (
    <>
      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <Logo size={30} /><span>Conway</span>
            <em className="brand-sub">Lead Data Science Roadmap</em>
          </div>
          <div className="topbar-end">
            {ready && <span className="topbar-progress">Progres: <b>{pad2(topicsDone)}</b> / {ALL_TOPICS.length} Tahap</span>}
            {DEMO
              ? <a className="chip" href="./">Mode contoh · Keluar</a>
              : <button type="button" className="chip" onClick={() => sb?.auth.signOut()}>Keluar</button>}
          </div>
        </header>

        <main className="page">
          <section className="hero" aria-live="polite">
            <p className="eyebrow">{ROADMAP_TITLE}</p>
            <div className="summary">
              <Ring size={64} stroke={7} pct={all.pct} />
              <div>
                <strong className="pct">{Math.round(all.pct * 100)}%</strong>
                <span className="muted">
                  {all.done} dari {all.total} langkah
                  {ready && all.pct < 1 && ` · sekarang di Fase ${curPhase + 1}`}
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
            ? <PhaseMap done={done} openPhase={openPhase} selected={drawer ? drawer.topic.id : null} current={current}
                isDesktop={isDesktop} onTogglePhase={togglePhase} onTopic={openTopic} />
            : <p className="muted loading">{error ?? 'Memuat progres…'}</p>}

          <footer className="foot muted">
            {DEMO ? 'Mode contoh: progres hanya tersimpan di browser ini.' : 'Progres tersinkron lewat akun StudyO.'}
          </footer>
        </main>

        {isDesktop && ready && drawer && <MaterialDrawer data={drawer} {...drawerProps} />}
      </div>

      {/* Laci iPhone dilepas selama pembaca terbuka. Vaul 1.1.2 tidak meneruskan modal={false} ke Radix Dialog,
          sehingga laci yang terbuka memasang pengunci gulir (RemoveScroll) yang menelan gulir di pembaca.
          Topik aktif tetap disimpan, jadi laci muncul lagi saat pembaca ditutup. */}
      {!isDesktop && !reading && (
        <MaterialSheet data={drawer} onClose={() => setActiveTopic(null)} {...drawerProps} />
      )}

      {book && reading && (
        <Reader key={`${reading.topicId}:${reading.start}`} topic={book.topic} phase={book.phase} phaseIndex={book.phaseIndex}
          done={done} start={reading.start} resume={reading.resume} docked={isDesktop}
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
