/**
 * Tanda Waypoint, "Architectural Cadence": tiga batu pijakan datar yang melayang bertingkat dari
 * kiri bawah ke kanan atas. Pijakan bawah terisi (posisi sekarang), pijakan berikutnya berupa garis
 * luar, dan pijakan teratas garis luar 45% sebagai horizon yang tetap terbuka.
 *
 * Grid 32×32: lempeng 14×7, jarak vertikal 2 (tetap terpisah di 16px), geser horizontal 7, sudut mikro 1px.
 * Garis luar 2,5, digambar ke dalam supaya ketiga lempeng berukuran luar sama persis.
 * Satu warna (currentColor): #0b0b0d di mode terang, #f5f5f7 di mode gelap, lewat --logo-ink.
 * Bentuknya sama dengan public/favicon.svg dan apple-touch-icon.png; ubah ketiganya bersamaan.
 */
export const Logo = ({ size = 36 }: { size?: number }) => (
  <svg className="logo" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <rect x="2" y="21.5" width="14" height="7" rx="1" fill="currentColor" />
    <rect x="10.25" y="13.75" width="11.5" height="4.5" rx="0.25" fill="none" stroke="currentColor" strokeWidth="2.5" />
    <rect x="17.25" y="4.75" width="11.5" height="4.5" rx="0.25" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.45" />
  </svg>
);
