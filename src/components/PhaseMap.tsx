import { AnimatePresence, motion } from 'motion/react';
import { PHASES, type Phase } from '../data/roadmap';
import { phaseCount, topicCount, topicNumber } from '../lib/stats';
import { Ring } from './Ring';
import { Check } from './icons';
import { useMedia } from '../lib/hooks';

// Pegas. ζ = damping / (2·√(stiffness·mass)).
const BLOOM = { type: 'spring', stiffness: 260, damping: 26 } as const; // ζ ≈ 0,8: mekar, sedikit membal
const CLOSE = { type: 'spring', stiffness: 380, damping: 39 } as const; // ζ ≈ 1: menutup tanpa membal
const SETTLE = { type: 'spring', stiffness: 300, damping: 35 } as const; // ζ ≈ 1: tinggi baris, redup
// Living Ink Path: tinta mengalir 650ms, mulai 150ms setelah tombol berubah jadi "Tersimpan".
const INK = { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.15 } as const;
const UNINK = { duration: 0.3, ease: [0.4, 0, 0.2, 1] } as const;

const ROW_H = 104;
const CY = ROW_H / 2; // pusat node fase di dalam baris
const NODE = 72;
const TNODE = 28; // node tahap (topik)
const LIST_TOP = CY + NODE / 2 + 14; // awal jalur tahap di bawah node fase

export const pad2 = (n: number) => String(n).padStart(2, '0');

interface Props {
  done: Set<string>;
  openPhase: string | null;
  /** Topik yang sedang ditampilkan di Laci Materi. */
  selected: string | null;
  /** Tahap aktif: topik pertama yang belum selesai. */
  current: string | null;
  isDesktop: boolean;
  onTogglePhase: (id: string) => void;
  onTopic: (id: string) => void;
}

export function PhaseMap({ done, openPhase, selected, current, isDesktop, onTogglePhase, onTopic }: Props) {
  const nodeX = isDesktop ? 48 : 40;
  // Tinggi satu tahap di jalur. Layar sempit memberi ruang judul dua baris (judul dibatasi 2 baris di CSS).
  const narrow = useMedia('(max-width: 419px)');
  const th = isDesktop ? 84 : narrow ? 88 : 78;
  const currentPhase = current ? PHASES.find(p => p.topics.some(t => t.id === current))?.id : null;

  return (
    <div className="map" role="list">
      {PHASES.map((p, i) => (
        <PhaseRow
          key={p.id} phase={p} index={i} done={done}
          prevComplete={i > 0 && phaseCount(PHASES[i - 1], done).pct >= 1}
          isLast={i === PHASES.length - 1}
          open={openPhase === p.id} dim={openPhase !== null && openPhase !== p.id}
          isCurrent={currentPhase === p.id}
          selected={selected} current={current} geo={{ nodeX, th }}
          onToggle={() => onTogglePhase(p.id)} onTopic={onTopic}
        />
      ))}
    </div>
  );
}

interface RowProps {
  phase: Phase; index: number; done: Set<string>; prevComplete: boolean; isLast: boolean;
  open: boolean; dim: boolean; isCurrent: boolean; selected: string | null; current: string | null;
  geo: { nodeX: number; th: number };
  onToggle: () => void; onTopic: (id: string) => void;
}

function PhaseRow({ phase, index, done, prevComplete, isLast, open, dim, isCurrent, selected, current, geo, onToggle, onTopic }: RowProps) {
  const { nodeX, th } = geo;
  const pc = phaseCount(phase, done);
  const complete = pc.pct >= 1;
  const n = phase.topics.length;
  const openH = LIST_TOP + n * th + 10;
  const height = open ? openH : ROW_H;
  const cy = (k: number) => LIST_TOP + k * th + th / 2; // pusat node tahap ke-k
  const curNum = current ? topicNumber(current) : Infinity;
  const tDone = phase.topics.map(t => topicCount(t, done).pct >= 1);

  // Ruas jalur di dalam fase yang terbuka: fase → tahap 1, antartahap, tahap terakhir → fase berikutnya.
  // Ruas di bawah tahap yang selesai terisi tinta; sisanya garis putus-putus halus.
  const segs = open
    ? [
        { key: 'in', top: CY + NODE / 2, bottom: cy(0) - TNODE / 2, lit: topicNumber(phase.topics[0].id) <= curNum },
        ...phase.topics.slice(1).map((t, k) => ({ key: t.id, top: cy(k) + TNODE / 2, bottom: cy(k + 1) - TNODE / 2, lit: tDone[k] })),
        ...(isLast ? [] : [{ key: 'out', top: cy(n - 1) + TNODE / 2, bottom: openH, lit: complete }]),
      ]
    : [];

  const headId = `fase-${phase.id}`;
  return (
    <motion.section
      role="listitem" aria-labelledby={headId} data-phase={phase.id}
      className={`row${open ? ' is-open' : ''}`}
      initial={false} animate={{ height }} transition={SETTLE}
    >
      {index > 0 && <span className={`seg${prevComplete ? ' lit' : ''}`} style={{ left: nodeX, top: 0, height: CY }} />}
      {!isLast && !open && <span className={`seg${complete ? ' lit' : ''}`} style={{ left: nodeX, top: CY, bottom: 0 }} />}

      <AnimatePresence>
        {segs.map(s => (
          <motion.span
            key={s.key} className={`seg trail${s.lit ? '' : ' dashed'}`}
            style={{ left: nodeX, top: s.top, height: Math.max(0, s.bottom - s.top) }}
            initial={{ opacity: 0 }} animate={{ opacity: 1, transition: BLOOM }} exit={{ opacity: 0, transition: CLOSE }}
          >
            <motion.i className="ink" initial={false} animate={{ scaleY: s.lit ? 1 : 0 }} transition={s.lit ? INK : UNINK} />
          </motion.span>
        ))}
      </AnimatePresence>

      <motion.button
        type="button" id={headId} className={`phase${complete ? ' complete' : ''}${isCurrent && !open ? ' current' : ''}`}
        aria-expanded={open}
        style={{ left: nodeX - NODE / 2, top: CY - NODE / 2, transformOrigin: `${NODE / 2}px ${NODE / 2}px` }}
        initial={false}
        animate={{ scale: dim ? 0.85 : 1, opacity: dim ? 0.4 : 1 }}
        transition={SETTLE}
        whileTap={{ scale: dim ? 0.82 : 0.96 }}
        onClick={onToggle}
      >
        <span className="phase-node">
          <Ring size={NODE} stroke={7} pct={pc.pct} />
          <span className="phase-num" style={complete ? { color: 'var(--status-done)' } : undefined}>
            {complete ? <Check size={22} /> : index + 1}
          </span>
        </span>
        <span className="phase-label">
          <strong>{phase.title}</strong>
          <span>Fase {index + 1} · {phase.topics.length} tahap · {pc.done}/{pc.total} langkah</span>
        </span>
      </motion.button>

      <AnimatePresence>
        {open && phase.topics.map((t, k) => {
          const c = topicCount(t, done);
          const num = topicNumber(t.id);
          const st = tDone[k] ? 'done' : t.id === current ? 'active' : 'next';
          const isSel = selected === t.id;
          const label = st === 'done' ? 'Selesai' : st === 'active' ? 'Sedang dipelajari' : c.done > 0 ? 'Dimulai' : 'Berikutnya';
          return (
            <motion.div
              key={t.id} data-topic={t.id} className={`stop ${st}`}
              style={{ top: cy(k) - th / 2, height: th, paddingLeft: nodeX + 30 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0, transition: { ...BLOOM, delay: 0.06 + k * 0.045 } }}
              exit={{ opacity: 0, y: -6, transition: CLOSE }}
            >
              <span className={`tnode ${st}`} aria-hidden="true" style={{ left: nodeX - TNODE / 2, top: th / 2 - TNODE / 2 }}>
                {st === 'done' ? <Check size={13} /> : st === 'active' ? <i className="tnode-core" /> : pad2(num)}
              </span>
              <motion.button
                type="button" className={`tcard${isSel ? ' sel' : ''}`}
                aria-pressed={isSel} aria-current={st === 'active' ? 'step' : undefined}
                aria-label={`${pad2(num)}. ${t.title}, ${label}, ${c.done} dari ${c.total} langkah`}
                whileHover={st === 'active' ? undefined : { x: 4 }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                onClick={() => onTopic(t.id)}
              >
                {isSel && <motion.span layoutId="tcard-sel" className="tcard-sel" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                <span className="tcard-title">{t.title}</span>
                <span className="tcard-meta"><b>{pad2(num)}</b> · {label} · {c.done}/{c.total}</span>
              </motion.button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.section>
  );
}
