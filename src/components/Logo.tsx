import { useId } from 'react';

/**
 * Tanda Conway, "Architectural Cadence": tiga batu pijakan datar yang melayang bertingkat dari
 * kiri bawah ke kanan atas. Pijakan bawah terisi (posisi sekarang), pijakan berikutnya berupa garis
 * luar, dan pijakan teratas garis luar redup sebagai horizon yang tetap terbuka.
 *
 * Grid 32×32: lempeng 14×7, jarak vertikal 2 (tetap terpisah di 16px), geser horizontal 7, sudut mikro 1px.
 * Garis luar 2,5, digambar ke dalam supaya ketiga lempeng berukuran luar sama persis.
 *
 * Warna Dreamy Haze langsung di atas kanvas terang #f5f5f7: bawah gradasi #7181c8 → #ababdc,
 * tengah garis luar #b7d3f4, atas garis luar #f1cfed 70%.
 * Bentuknya sama dengan public/favicon.svg dan apple-touch-icon.png; ubah ketiganya bersamaan.
 */
export const Logo = ({ size = 36 }: { size?: number }) => {
  const gid = `logo-base-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="2" y1="28.5" x2="16" y2="21.5">
          <stop offset="0" stopColor="#7181c8" />
          <stop offset="1" stopColor="#ababdc" />
        </linearGradient>
      </defs>
      <rect x="2" y="21.5" width="14" height="7" rx="1" fill={`url(#${gid})`} />
      <rect x="10.25" y="13.75" width="11.5" height="4.5" rx="0.25" fill="none" stroke="#b7d3f4" strokeWidth="2.5" />
      <rect x="17.25" y="4.75" width="11.5" height="4.5" rx="0.25" fill="none" stroke="#f1cfed" strokeWidth="2.5" opacity="0.7" />
    </svg>
  );
};
