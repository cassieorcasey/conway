import { useCallback, useEffect, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PHASES } from '../data/roadmap';
import { safeStorage } from './hooks';

const TABLE = 'waypoint_progress';
const DEMO_KEY = 'waypoint_demo_progress';
const VALID = new Set(PHASES.flatMap(p => p.topics.flatMap(t => t.steps.map(s => s.id))));

const readDemo = (): string[] => {
  try { return (JSON.parse(safeStorage.get(DEMO_KEY) || '[]') as string[]).filter(id => VALID.has(id)); }
  catch { return []; }
};

/**
 * Progres per langkah. Demo: localStorage. Live: tabel waypoint_progress (satu baris = satu langkah selesai).
 * Perubahan langsung tampil (optimistic) lalu dikembalikan kalau Supabase menolak.
 */
export function useProgress(client: SupabaseClient | null, userId: string | null) {
  const [done, setDone] = useState<Set<string>>(() => new Set(client ? [] : readDemo()));
  const [ready, setReady] = useState(!client);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(0);
  // Naik setiap kali ada perubahan lokal; hasil muat yang dimulai sebelum perubahan itu dibuang.
  const gen = useRef(0);

  const load = useCallback(async () => {
    if (!client || !userId || pending.current > 0) return;
    const startGen = gen.current;
    const { data, error } = await client.from(TABLE).select('step_id');
    // Ada simpanan yang sedang jalan, atau sudah selesai setelah muat ini dimulai: data ini basi.
    if (pending.current > 0 || gen.current !== startGen) return;
    if (error) { setError('Progres tidak bisa dimuat. Periksa koneksi lalu muat ulang.'); return; }
    setDone(new Set((data as { step_id: string }[]).map(r => r.step_id).filter(id => VALID.has(id))));
    setReady(true);
  }, [client, userId]);

  // Sinkron antarperangkat: muat ulang setiap kali tab kembali aktif.
  useEffect(() => {
    load();
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [load]);

  useEffect(() => { if (!client) safeStorage.set(DEMO_KEY, JSON.stringify([...done])); }, [client, done]);

  const apply = (ids: string[], value: boolean) =>
    setDone(prev => {
      const next = new Set(prev);
      for (const id of ids) value ? next.add(id) : next.delete(id);
      return next;
    });

  /** Mengembalikan true kalau perubahan tersimpan (atau tidak ada yang perlu disimpan). */
  const setSteps = useCallback(async (ids: string[], value: boolean): Promise<boolean> => {
    ids = ids.filter(id => VALID.has(id));
    if (!ids.length) return true;
    apply(ids, value);
    if (!client) return true;
    gen.current++;
    pending.current++;
    let failed = false;
    try {
      const res = value
        ? await client.from(TABLE).upsert(ids.map(step_id => ({ step_id })), { onConflict: 'user_id,step_id', ignoreDuplicates: true })
        : await client.from(TABLE).delete().in('step_id', ids);
      failed = !!res.error;
    } catch {
      failed = true;
    } finally {
      pending.current--;
    }
    if (failed) {
      apply(ids, !value);
      setError('Gagal menyimpan. Periksa koneksi lalu coba lagi.');
    }
    return !failed;
  }, [client]);

  const clearError = useCallback(() => setError(null), []);
  return { done, ready, error, clearError, setSteps };
}
