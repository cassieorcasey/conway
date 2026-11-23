# Conway

Roadmap Lead Data Science dalam bentuk peta berurutan. Sembilan fase berderet vertikal sebagai jalur utama. Ketuk satu fase untuk memunculkan topik-topiknya sebagai gelembung, lalu ketuk topik untuk membuka panel berisi langkah dan sumber belajar.

Situs: https://cassieorcasey.github.io/waypoint/

## Setup sekali

Tabel menumpang di project Supabase **StudyO**, sama dengan Synthesis. Awalan `waypoint_` membuatnya tidak bentrok dengan tabel lain.

1. **Supabase → SQL Editor**: tempel isi `schema.sql`, lalu Run. Aman dijalankan ulang.
2. **Supabase → Authentication → URL Configuration → Redirect URLs**: tambahkan `https://cassieorcasey.github.io/waypoint/`.
3. **GitHub → repo → Settings → Pages → Source**: pilih **GitHub Actions**.

Setiap push ke `main` otomatis di-build dan di-deploy oleh `.github/workflows/deploy.yml`.

Login memakai akun StudyO (magic link). Synthesis dan Conway ada di domain yang sama, jadi kalau sudah masuk di salah satunya, yang lain ikut masuk.

## Mode contoh

Tambahkan `?demo` di URL untuk mencoba tanpa login. Progres mode ini hanya tersimpan di browser.

## Mengubah isi roadmap

Semua fase, topik, langkah, dan sumber ada di `src/data/roadmap.ts`.

- Teks dan judul boleh diubah kapan saja.
- **Jangan mengganti id yang sudah ada.** Progres di Supabase tersimpan per id langkah.
- Langkah baru memakai id baru (misalnya `python-10`), meski disisipkan di tengah daftar.
- **`LEGACY_ORDER` jangan diubah.** Daftar itu dibekukan pada 124 langkah asli supaya nomor checkbox lama tetap cocok saat impor. Langkah baru tidak punya nomor lama.

## Materi per topik (pembaca buku)

Setiap topik punya catatan markdown di `src/content/<id-topik>.md` yang dibuka sebagai buku layar penuh lewat kartu **Baca materi** atau tombol buku di samping setiap langkah. Pembaca punya sampul dengan daftar isi, satu bab per langkah, mode Cepat/Lengkap, ukuran huruf, tema otomatis/terang/sepia/gelap, dan mengingat posisi baca terakhir di perangkat itu.

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

## Progres dari roadmap lama

Kalau roadmap HTML lama pernah dibuka di `cassieorcasey.github.io`, centangnya terdeteksi otomatis dan Conway menawarkan untuk memindahkannya. Dari tempat lain, buka `https://cassieorcasey.github.io/waypoint/#impor=1.2.7` dengan nomor checkbox lama (c1, c2, c7, ...).

## Struktur

| Bagian | Isi |
|---|---|
| `src/data/roadmap.ts` | Struktur roadmap: 9 fase, 34 topik, 171 langkah |
| `src/components/PhaseMap.tsx` | Jalur fase, cincin progres, gelembung topik |
| `src/components/TopicSheet.tsx` | Panel langkah dan sumber (Vaul) |
| `src/components/Reader.tsx` | Pembaca materi bergaya buku |
| `src/lib/book.ts` | Membagi catatan menjadi sampul dan bab |
| `src/content/` | Catatan materi per topik (markdown) dan daftarnya |
| `src/lib/markdown.ts` | Pembaca markdown kecil tanpa dependensi |
| `src/lib/progress.ts` | Baca dan simpan progres (Supabase atau localStorage) |
| `schema.sql` | Tabel `waypoint_progress` dan RLS |

Dibangun dengan React, Vite, Motion, Vaul, dan supabase-js.
