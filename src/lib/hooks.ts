import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export function useMedia(query: string) {
  const [match, setMatch] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const m = matchMedia(query);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  return match;
}

/**
 * Progres gulir 0–1 sebuah kontainer, dikirim ke `paint` paling banyak sekali per frame.
 * Bilah dicat langsung di DOM tanpa transisi CSS supaya mengikuti jari tanpa tertinggal.
 * Diukur ulang saat tinggi isi berubah (font selesai dimuat, ukuran huruf, kuis dibuka, layar diputar).
 * `measure` untuk pengukuran segera, misalnya setelah posisi gulir diatur dari kode.
 */
export function useScrollProgress(scroller: RefObject<HTMLElement | null>, paint: (progress: number) => void) {
  const paintRef = useRef(paint);
  paintRef.current = paint;
  const raf = useRef(0);

  const measure = useCallback(() => {
    const s = scroller.current;
    if (!s) return;
    const range = s.scrollHeight - s.clientHeight;
    paintRef.current(range > 0 ? Math.min(1, Math.max(0, s.scrollTop / range)) : 0);
  }, [scroller]);

  const schedule = useCallback(() => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => { raf.current = 0; measure(); });
  }, [measure]);

  useEffect(() => {
    const s = scroller.current;
    if (!s || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(schedule);
    ro.observe(s);
    if (s.lastElementChild) ro.observe(s.lastElementChild);
    document.fonts?.ready.then(schedule);
    return () => { ro.disconnect(); cancelAnimationFrame(raf.current); raf.current = 0; };
  }, [scroller, schedule]);

  return { measure, schedule };
}
