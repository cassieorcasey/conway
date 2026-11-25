import { useId } from 'react';
import { motion } from 'motion/react';
import { ringDone } from '../lib/stats';

const SETTLE = { type: 'spring', stiffness: 220, damping: 30 } as const; // ζ ≈ 1, berhenti rapi

/**
 * Cincin progres: lintasan netral, isi bergradasi Twilight Horizon (indigo, ungu pastel, merah muda
 * pada 135°), ujung membulat. Sage solid saat selesai, supaya "tuntas" tetap terbaca beda dari "berjalan".
 */
export function Ring({ size, stroke, pct, className }: { size: number; stroke: number; pct: number; className?: string }) {
  const id = 'ring' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const done = ringDone(pct);
  return (
    <svg className={className} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {/* Cincin diputar -90° agar mulai dari atas; vektor gradasi ikut diputar balik (kiri atas ke kanan bawah di layar). */}
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={size} y1={0} x2={0} y2={size}>
          <stop offset="0" style={{ stopColor: 'var(--dh-indigo)' }} />
          <stop offset="0.52" style={{ stopColor: 'var(--dh-purple)' }} />
          <stop offset="1" style={{ stopColor: 'var(--dh-candy)' }} />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={done ? 'var(--status-done)' : `url(#${id})`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        initial={false}
        animate={{ strokeDashoffset: c * (1 - pct), opacity: pct > 0 ? 1 : 0 }}
        transition={SETTLE}
      />
    </svg>
  );
}
