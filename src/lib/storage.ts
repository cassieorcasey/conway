/** localStorage yang tidak melempar galat saat penyimpanan diblokir (mode privat Safari, kuota penuh). */
export const safeStorage = {
  get(key: string) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key: string, v: string) { try { localStorage.setItem(key, v); } catch { /* diabaikan: progres tetap jalan di memori */ } },
};
