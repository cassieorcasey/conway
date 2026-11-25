# Vaul (salinan)

Salinan kode sumber [Vaul](https://github.com/emilkowalski/vaul) dari commit `3e97aac` (lisensi MIT, lihat `LICENSE`).

Kenapa disalin, bukan dipasang dari npm: rilis terakhir di npm (1.1.2) tidak meneruskan `modal={false}` ke Radix Dialog.
Akibatnya panel non-modal tetap memasang `pointer-events: none` di `body`, sehingga peta di belakang panel tidak bisa
diklik dan lapisan lain (pembaca materi) tidak menerima event mouse. Perbaikannya sudah ada di `main` Vaul tapi tidak
pernah dirilis karena proyeknya dalam mode maintenance.

## Perubahan dari commit asal

Conway hanya memakai `Drawer.Root` (`direction="bottom"`, `modal={false}`), `Portal`, `Content`, `Title`, dan `Close`.
Bagian yang tidak terpakai dibuang:

- Komponen `Overlay`, `Handle`, `NestedRoot`, serta `Trigger` dan `Description` dari objek `Drawer`.
- Penanganan drawer bersarang (`onNested*`) dan `useScaleBackground` (`use-scale-background.ts`).
- Helper `isInView`, `assignStyle`, `chain`, tipe `AnyFunction`, konstanta `NESTED_DISPLACEMENT`.
- Aturan CSS overlay dan handle beserta keyframe `fadeIn`/`fadeOut`.
- Tipe ref disesuaikan dengan React 19 (`RefObject<HTMLDivElement | null>`).

Logika snap point dan `shouldScaleBackground` di `Root` tetap ada karena menyatu dengan perhitungan drag;
tanpa prop itu keduanya tidak melakukan apa-apa. Saat menyinkronkan dengan Vaul versi baru, ulangi daftar di atas.
