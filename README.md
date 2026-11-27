# Conway

> **In English:** My Lead Data Science learning roadmap as a sequential map, with study notes for each topic. Built as a web app, with progress stored in Supabase. The rest of this page is in Indonesian.

Roadmap Lead Data Science dalam bentuk peta berurutan. Sembilan fase berderet vertikal sebagai jalur utama. Ketuk satu fase untuk memunculkan tahap-tahapnya (topik) sebagai jalur vertikal, lalu ketuk tahap untuk membukanya di Laci Materi berisi langkah dan sumber belajar. Di laptop laci selalu terbuka di sisi kanan (split-view 42/58); di iPhone laci muncul sebagai bottom sheet.

Situs: https://cassieorcasey.github.io/conway/

## Mengubah isi roadmap

Semua fase, topik, langkah, dan sumber ada di `src/data/roadmap.ts`.

- Teks dan judul boleh diubah kapan saja.
- **Jangan mengganti id yang sudah ada.** Progres di Supabase tersimpan per id langkah.
- Langkah baru memakai id baru (misalnya `python-10`), meski disisipkan di tengah daftar.

## Materi per topik (pembaca buku)

Setiap topik punya catatan markdown di `src/content/<id-topik>.md` yang dibuka sebagai buku layar penuh lewat kartu **Baca materi** atau tombol buku di samping setiap langkah. Pembaca punya sampul dengan daftar isi, satu bab per langkah, mode Cepat/Lengkap, ukuran huruf, tema terang/sepia, dan mengingat posisi baca terakhir di perangkat itu.

Aturan menulis catatan:

- Teks sebelum `##` pertama adalah pengantar di sampul.
- `## 3. Judul` adalah Bab 3 dan terhubung ke langkah ke-3 topik itu. `## Mini-proyek ...` terhubung ke langkah yang diawali "Mini-proyek". Judul `##` lain (misalnya `## Latihan`) menjadi lampiran.
- Setiap bab membuka dengan blok Intinya dan ditutup rangkuman (tes `npm test` memeriksa keduanya ada):

```
::: intinya
Satu atau dua kalimat inti bab.
:::

... isi bab ...

::: rangkuman
- Poin satu.
- Poin dua.
:::
```

- Blok interaktif opsional di dalam bab: `::: telusuri` (blok kode lalu baris `3: penjelasan` per langkah eksekusi) dan `::: tebak` (blok kode opsional, `? pertanyaan`, pilihan `- ...` dengan `- [x] ...` untuk jawaban benar, lalu penjelasan).
- Catatan baru didaftarkan di `src/content/index.ts`.

Yang juga didukung: judul `###`, paragraf, daftar, blok kode berpagar dengan pewarnaan sintaks, tabel, kutipan `>`, serta `kode`, **tebal**, *miring*, dan tautan `https://`. HTML mentah dan gambar tidak didukung.

## Tes

`npm test` menjalankan tes pembagi bab, parser, pewarnaan kode, dan memastikan setiap langkah punya tepat satu bab lengkap dengan Intinya dan rangkuman.

## Struktur

| Bagian | Isi |
|---|---|
| `src/data/roadmap.ts` | Struktur roadmap: 9 fase, 34 topik, 171 langkah |
| `src/App.tsx` | Masuk (Supabase) atau mode contoh, lalu `Roadmap` |
| `src/components/Roadmap.tsx` | Halaman utama: state navigasi peta, laci, dan pembaca |
| `src/components/PhaseMap.tsx` | Jalur fase, cincin progres, jalur tahap (Living Ink Path, denyut tahap aktif) |
| `src/components/MaterialDrawer.tsx` | Laci Materi: kolom kanan 58% di laptop, bottom sheet 85vh (Vaul) di iPhone |
| `src/components/Reader.tsx` | Pembaca materi bergaya buku |
| `src/components/ReaderSheet.tsx` | Lembar daftar isi dan tampilan baca (Aa) di dalam pembaca |
| `src/lib/hooks.ts` | `useMedia` dan `useScrollProgress` (garis baca laci dan bilah progres pembaca) |
| `src/lib/book.ts` | Membagi catatan menjadi sampul dan bab |
| `src/content/` | Catatan materi per topik (markdown) dan daftarnya |
| `src/lib/markdown.ts` | Pembaca markdown kecil tanpa dependensi |
| `src/lib/progress.ts` | Baca dan simpan progres (Supabase atau localStorage) |
| `src/vendor/vaul/` | Salinan Vaul yang dipangkas untuk bottom sheet non-modal (lihat README di folder itu) |
| `schema.sql` | Tabel `waypoint_progress` dan RLS |

Dibangun dengan React, Vite, Motion, Vaul, dan supabase-js.
