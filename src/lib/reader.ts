// Pengaturan pembaca dan posisi baca terakhir. Disimpan per perangkat (localStorage),
// aman kalau penyimpanan diblokir: semuanya kembali ke nilai bawaan.
import { safeStorage } from './hooks';

export type Tone = 'auto' | 'light' | 'sepia' | 'dark';
export type Mode = 'lengkap' | 'cepat';
export interface ReaderSettings { fs: number; tone: Tone; mode: Mode }

export const FS_MIN = 15;
export const FS_MAX = 26;
const DEFAULTS: ReaderSettings = { fs: 18, tone: 'auto', mode: 'lengkap' };
const SKEY = 'waypoint-reader';
const PKEY = 'waypoint-reader-pos';

const parse = <T,>(raw: string | null, fallback: T): T => { try { return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } };

export function loadSettings(): ReaderSettings {
  const s = parse<Partial<ReaderSettings>>(safeStorage.get(SKEY), {});
  return {
    fs: typeof s.fs === 'number' ? Math.min(FS_MAX, Math.max(FS_MIN, Math.round(s.fs))) : DEFAULTS.fs,
    tone: s.tone === 'light' || s.tone === 'sepia' || s.tone === 'dark' ? s.tone : 'auto',
    mode: s.mode === 'cepat' ? 'cepat' : 'lengkap',
  };
}
export const saveSettings = (s: ReaderSettings) => safeStorage.set(SKEY, JSON.stringify(s));

export interface Pos { key: string; y: number }
export function loadPos(topicId: string): Pos | null {
  const all = parse<Record<string, Pos>>(safeStorage.get(PKEY), {});
  const p = all[topicId];
  return p && typeof p.key === 'string' && typeof p.y === 'number' ? p : null;
}
export function savePos(topicId: string, pos: Pos) {
  const all = parse<Record<string, Pos>>(safeStorage.get(PKEY), {});
  all[topicId] = pos;
  safeStorage.set(PKEY, JSON.stringify(all));
}
