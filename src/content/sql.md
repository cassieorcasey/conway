Buku kecil ini terdiri dari delapan bab, satu untuk tiap langkah di checklist, ditambah mini-proyek penutup Fase 1. Semua contoh memakai dua tabel kecil di bawah supaya hasil setiap query mudah dilacak dengan kepala, tanpa komputer. Sintaksnya standar SQL dan jalan di PostgreSQL maupun MySQL. SQLite (tanpa instalasi server) cukup untuk mencoba hampir semuanya; pengecualiannya `ALTER TABLE ... ADD CONSTRAINT` di Bab 7, dan `FULL JOIN` yang baru ada di SQLite 3.39 ke atas. Semua contoh dan hasilnya sudah dijalankan.

```sql
CREATE TABLE pelanggan (
    id     INTEGER PRIMARY KEY,
    nama   TEXT NOT NULL,
    kota   TEXT
);

CREATE TABLE pesanan (
    id            INTEGER PRIMARY KEY,
    pelanggan_id  INTEGER NOT NULL REFERENCES pelanggan(id),
    tanggal       DATE NOT NULL,
    total         NUMERIC(10, 2) NOT NULL
);

INSERT INTO pelanggan VALUES (1, 'Ayu', 'Jakarta'), (2, 'Budi', 'Bandung'),
                             (3, 'Citra', 'Jakarta'), (4, 'Dewi', NULL);
INSERT INTO pesanan VALUES (1, 1, '2026-01-05', 150000), (2, 1, '2026-02-10', 80000),
                           (3, 2, '2026-02-11', 220000), (4, 3, '2026-03-02', 50000);
```

## 1. Konsep RDBMS

::: intinya
Database relasional menyimpan data dalam **tabel** yang terdiri dari baris dan kolom bertipe. Tabel saling terhubung lewat **kunci**, sehingga setiap fakta cukup disimpan di satu tempat.
:::

### Dari spreadsheet ke database

Bayangkan mencatat semua pesanan di satu spreadsheet: setiap baris berisi nama pelanggan, kotanya, tanggal, dan total. Kelihatannya praktis, sampai Ayu pindah kota. Kamu harus mengubah kota Ayu di setiap baris pesanannya, dan kalau satu baris terlewat, datamu mulai saling bertentangan.

Database relasional menyelesaikan ini dengan memecah data ke beberapa tabel. Nama dan kota pelanggan disimpan **sekali** di tabel `pelanggan`. Tabel `pesanan` hanya mencatat `pelanggan_id`, nomor yang menunjuk ke baris pelanggan. Pindah kota? Ubah satu baris.

*Relational Database Management System* (RDBMS) adalah perangkat lunak yang mengelola tabel-tabel itu. Istilah dasarnya: **tabel** (kumpulan data sejenis), **baris** atau *row* (satu catatan), dan **kolom** atau *column* (satu atribut dengan tipe tertentu).

### Kenapa bukan sekadar file

| Kemampuan | Artinya |
|---|---|
| Skema bertipe | Kolom `total` hanya menerima angka, `NOT NULL` melarang kosong |
| Transaksi (ACID) | Beberapa perubahan berhasil semua atau batal semua; transfer uang tidak boleh berhenti di tengah |
| Bahasa deklaratif (SQL) | Kamu menulis *apa* yang dicari, mesin database memilih *bagaimana* mengerjakannya |
| Konkurensi | Banyak pengguna membaca dan menulis bersamaan tanpa merusak data |

Satu konsep yang perlu ditanam sejak awal: `NULL` berarti **"tidak diketahui"**. Ia bukan nol dan bukan teks kosong, dan punya aturan sendiri yang akan muncul berkali-kali di bab berikutnya. Di data contoh, kota Dewi adalah `NULL`.

::: tebak
? Dengan desain dua tabel di atas, Ayu pindah ke Bogor. Berapa baris yang harus diubah?
- [x] 1 baris
- 2 baris, sebanyak pesanan Ayu
- Semua baris di kedua tabel
Kota hanya tersimpan di tabel `pelanggan`, satu baris untuk Ayu. Pesanan Ayu menunjuk ke baris itu lewat `pelanggan_id`, jadi otomatis ikut "pindah".
:::

::: rangkuman
- Data disimpan dalam tabel; tabel terhubung lewat kunci sehingga fakta tidak diulang.
- RDBMS memberi skema bertipe, transaksi, SQL, dan akses bersamaan yang aman.
- `NULL` berarti "tidak diketahui", bukan nol dan bukan teks kosong.
:::

## 2. SELECT, WHERE, ORDER BY

::: intinya
`SELECT` memilih kolom, `FROM` menyebut tabelnya, `WHERE` menyaring baris, dan `ORDER BY` mengurutkan hasil. Database **tidak** mengerjakannya sesuai urutan penulisan: `FROM` dan `WHERE` dikerjakan lebih dulu, `SELECT` belakangan.
:::

### Bertanya kepada database

SQL dibaca hampir seperti kalimat: "pilih nama dan kota, dari tabel pelanggan, yang kotanya Jakarta, urutkan berdasarkan nama."

::: telusuri
```sql
SELECT nama, kota
FROM pelanggan
WHERE kota = 'Jakarta'
ORDER BY nama;
```
2: Database mulai dari `FROM`: ambil keempat baris tabel `pelanggan`.
3: `WHERE` menyaring baris. Ayu dan Citra lolos. Budi tidak. Dewi juga tidak, karena kotanya `NULL` dan perbandingan dengan `NULL` tidak pernah benar.
1: Baru sekarang `SELECT` memilih kolom `nama` dan `kota` dari baris yang tersisa.
4: `ORDER BY` mengurutkan berdasarkan nama: Ayu, lalu Citra. Hasilnya dua baris.
:::

Urutan pengerjaan lengkapnya:

1. `FROM` (dan `JOIN`), lalu `WHERE` (saring baris)
2. `GROUP BY` (kelompokkan), lalu `HAVING` (saring kelompok)
3. `SELECT` (hitung kolom dan alias), lalu `ORDER BY`, lalu `LIMIT`

Inilah sebabnya alias yang dibuat di `SELECT` tidak bisa dipakai di `WHERE` pada kebanyakan database: saat `WHERE` bekerja, alias itu belum ada.

### Menyaring dengan WHERE

```sql
WHERE total >= 100000 AND tanggal >= '2026-02-01'
WHERE kota IN ('Jakarta', 'Bandung')
WHERE total BETWEEN 50000 AND 150000   -- kedua batas ikut masuk
WHERE nama LIKE 'A%'                   -- diawali A; _ berarti satu karakter
WHERE kota IS NULL                     -- bukan "= NULL"
```

> **Jebakan NULL:** `kota = NULL` tidak pernah benar, dan `kota <> 'Jakarta'` juga **tidak** mengembalikan baris yang kotanya `NULL`. Untuk `NULL`, selalu pakai `IS NULL` atau `IS NOT NULL`.

::: tebak
```sql
SELECT COUNT(*) FROM pelanggan
WHERE kota <> 'Jakarta';
```
? Berapa hasilnya?
- 2
- [x] 1
- 0
Hanya Budi (Bandung). Dewi tidak terhitung, karena membandingkan `NULL` dengan apa pun menghasilkan "tidak diketahui", bukan "benar". Untuk ikut menghitung Dewi, tulis `WHERE kota <> 'Jakarta' OR kota IS NULL`.
:::

### Mengurutkan dan membatasi

`ORDER BY total DESC` mengurutkan dari yang terbesar. `LIMIT 3` membatasi jumlah baris (di SQL Server memakai `TOP 3`). `DISTINCT` membuang duplikat: `SELECT DISTINCT kota FROM pelanggan`.

::: rangkuman
- `SELECT` kolom, `FROM` tabel, `WHERE` saring baris, `ORDER BY` urutkan.
- Urutan pengerjaan: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT.
- Bandingkan `NULL` dengan `IS NULL`, bukan `=`; `<>` melewatkan baris `NULL`.
:::

## 3. GROUP BY dan HAVING

::: intinya
`GROUP BY` mengelompokkan baris yang nilainya sama, lalu fungsi agregat dihitung **per kelompok**. `WHERE` menyaring baris **sebelum** dikelompokkan; `HAVING` menyaring kelompok **sesudah** dihitung.
:::

### Dari baris ke ringkasan

Pertanyaan bisnis jarang tentang satu baris. Lebih sering: "berapa belanja **tiap** pelanggan?" atau "berapa pesanan **per** bulan?". Kata "tiap" dan "per" adalah tanda kamu butuh `GROUP BY`.

```sql
SELECT pelanggan_id, COUNT(*) AS jumlah_pesanan, SUM(total) AS belanja
FROM pesanan
GROUP BY pelanggan_id;
```

| pelanggan_id | jumlah_pesanan | belanja |
|---|---|---|
| 1 | 2 | 230000 |
| 2 | 1 | 220000 |
| 3 | 1 | 50000 |

Aturan emas: setiap kolom di `SELECT` harus berada di `GROUP BY` **atau** dibungkus fungsi agregat. Kalau kamu menulis `SELECT pelanggan_id, tanggal ... GROUP BY pelanggan_id`, database tidak tahu tanggal mana yang harus ditampilkan untuk Ayu yang punya dua pesanan.

### WHERE dan HAVING bekerja di saat berbeda

::: telusuri
```sql
SELECT pelanggan_id, SUM(total) AS belanja
FROM pesanan
WHERE tanggal >= '2026-02-01'
GROUP BY pelanggan_id
HAVING SUM(total) > 100000;
```
2: Mulai dari keempat pesanan.
3: `WHERE` membuang pesanan sebelum Februari, yaitu pesanan 1 milik Ayu (5 Januari). Tersisa pesanan 2, 3, dan 4.
4: Kelompokkan per pelanggan: Ayu 80.000, Budi 220.000, Citra 50.000.
5: `HAVING` menyaring kelompok: hanya Budi yang di atas 100.000.
1: Hasil akhirnya satu baris: pelanggan 2 dengan belanja 220.000. Perhatikan Ayu: total sepanjang masa 230.000, tapi tersaring karena `WHERE` sudah membuang pesanan Januarinya.
:::

Aturan praktis: kondisi yang bisa ditulis di `WHERE` sebaiknya di `WHERE`, karena menyaring lebih awal berarti lebih sedikit data yang dikelompokkan. `HAVING` hanya untuk kondisi yang menyangkut hasil agregat.

::: tebak
? Kamu ingin menampilkan pelanggan yang punya lebih dari satu pesanan. Bagian mana yang benar?
- `WHERE COUNT(*) > 1`
- [x] `GROUP BY pelanggan_id HAVING COUNT(*) > 1`
- `ORDER BY COUNT(*) > 1`
`COUNT(*)` baru ada nilainya setelah baris dikelompokkan, sedangkan `WHERE` bekerja sebelum itu. Kondisi pada hasil agregat selalu masuk `HAVING`.
:::

::: rangkuman
- "Tiap" atau "per" dalam pertanyaan adalah tanda butuh `GROUP BY`.
- Kolom di `SELECT` harus ada di `GROUP BY` atau dibungkus agregat.
- `WHERE` menyaring baris sebelum dikelompokkan, `HAVING` menyaring kelompok sesudahnya.
:::

## 4. Fungsi agregat

::: intinya
Fungsi agregat meringkas banyak baris menjadi satu angka: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`. Semuanya, kecuali `COUNT(*)`, **mengabaikan NULL**, dan itu bisa mengubah hasil tanpa kamu sadari.
:::

### Lima fungsi dasar

| Fungsi | Hasil |
|---|---|
| `COUNT(*)` | Jumlah baris |
| `COUNT(kolom)` | Jumlah baris yang kolomnya **tidak NULL** |
| `COUNT(DISTINCT kolom)` | Jumlah nilai unik |
| `SUM`, `AVG` | Jumlah dan rata-rata |
| `MIN`, `MAX` | Terkecil dan terbesar |

Tanpa `GROUP BY`, agregat meringkas seluruh tabel menjadi satu baris: `SELECT AVG(total) FROM pesanan;`.

::: telusuri
```sql
SELECT COUNT(*) AS semua,
       COUNT(kota) AS yang_punya_kota,
       COUNT(DISTINCT kota) AS kota_unik
FROM pelanggan;
```
4: Ambil keempat pelanggan.
1: `COUNT(*)` menghitung baris, apa pun isinya: 4.
2: `COUNT(kota)` hanya menghitung baris yang kotanya terisi: Ayu, Budi, Citra. Hasilnya 3.
3: `COUNT(DISTINCT kota)` menghitung nilai unik yang terisi: Jakarta dan Bandung. Hasilnya 2.
:::

### NULL diam-diam dilewati

Ketika menghitung rata-rata, baris dengan nilai `NULL` tidak dianggap nol; ia tidak dihitung sama sekali. Kadang itu yang kamu mau (nilai yang belum diisi memang tidak boleh menarik rata-rata turun), kadang tidak.

::: tebak
```sql
-- tabel skor berisi tiga baris: 80, 100, dan NULL
SELECT AVG(skor) FROM skor;
```
? Berapa hasilnya?
- 60
- [x] 90
- NULL
`AVG` mengabaikan `NULL`, jadi yang dirata-ratakan hanya 80 dan 100: (80 + 100) / 2 = 90. Kalau `NULL` memang harus dianggap nol, tulis `AVG(COALESCE(skor, 0))`, hasilnya 60.
:::

Kebiasaan analis yang baik: setiap kali melihat rata-rata, tanyakan "dari berapa baris?" Tampilkan `COUNT(kolom)` di samping `AVG(kolom)` supaya pembaca tahu seberapa banyak data yang sebenarnya dipakai.

::: rangkuman
- `COUNT(*)` menghitung baris, `COUNT(kolom)` hanya yang terisi, `COUNT(DISTINCT)` nilai unik.
- Agregat selain `COUNT(*)` melewati `NULL`; pakai `COALESCE` kalau `NULL` harus dianggap nol.
- Tampilkan jumlah data di samping rata-rata.
:::

## 5. JOIN

::: intinya
`JOIN` menggabungkan baris dari dua tabel berdasarkan kolom yang cocok. `INNER JOIN` hanya menyimpan baris yang punya pasangan; `LEFT JOIN` menyimpan semua baris tabel kiri dan mengisi `NULL` bila pasangannya tidak ada.
:::

### Menyambung kembali yang dipisah

Bab 1 memecah data ke beberapa tabel supaya tidak berulang. `JOIN` adalah cara menyambungnya kembali saat dibutuhkan, misalnya untuk melihat nama pelanggan di samping setiap pesanannya.

```sql
SELECT p.nama, o.tanggal, o.total
FROM pelanggan AS p
INNER JOIN pesanan AS o ON o.pelanggan_id = p.id
ORDER BY o.tanggal;
```

`ON o.pelanggan_id = p.id` adalah aturan pencocokannya: setiap pesanan dipasangkan dengan pelanggan yang `id`-nya sama dengan `pelanggan_id` pesanan itu.

| Jenis | Hasil |
|---|---|
| `INNER JOIN` | Hanya baris yang punya pasangan di kedua tabel |
| `LEFT JOIN` | Semua baris tabel kiri; kolom kanan `NULL` jika tidak ada pasangan |
| `RIGHT JOIN` | Kebalikan `LEFT` (jarang dipakai; tukar saja urutan tabel) |
| `FULL JOIN` | Semua baris dari kedua sisi (tidak ada di MySQL dan SQLite lama) |

### Mencari yang tidak punya pasangan

Pertanyaan yang sangat sering muncul: **pelanggan mana yang belum pernah memesan?**

::: telusuri
```sql
SELECT p.nama
FROM pelanggan AS p
LEFT JOIN pesanan AS o ON o.pelanggan_id = p.id
WHERE o.id IS NULL;
```
2: Mulai dari semua pelanggan di sisi kiri.
3: `LEFT JOIN` memasangkan setiap pelanggan dengan pesanannya. Ayu muncul dua kali (dua pesanan). Dewi tidak punya pesanan, tapi tetap muncul dengan semua kolom pesanan berisi `NULL`.
4: Saring baris yang kolom pesanannya `NULL`: hanya baris Dewi.
1: Tercetak `Dewi`. Pola "LEFT JOIN lalu IS NULL" ini disebut *anti-join*.
:::

### Jebakan baris berlipat

::: tebak
```sql
SELECT COUNT(*)
FROM pelanggan AS p
JOIN pesanan AS o ON o.pelanggan_id = p.id;
```
? Berapa baris hasil JOIN ini?
- 3
- [x] 4
- 16
Ada empat pesanan, dan setiap pesanan punya tepat satu pasangan pelanggan, jadi hasilnya empat baris. Ayu muncul dua kali dan Dewi hilang. Kalau setelah JOIN kamu menjumlah kolom milik pelanggan, nilai Ayu terhitung ganda.
:::

Tiga kebiasaan penting:

- Selalu tulis kondisi `ON`. Tanpa itu hasilnya bisa menjadi perkalian semua baris (*cross join*): 4 × 4 = 16.
- Beri alias tabel pendek (`p`, `o`) dan awali nama kolom dengan alias supaya tidak ambigu.
- Setelah JOIN, cek jumlah baris. Hubungan satu-ke-banyak menggandakan baris sisi "satu", dan itu diam-diam membuat `SUM` membengkak.

::: rangkuman
- `JOIN ... ON` menyambung tabel lewat kolom yang cocok.
- `INNER` hanya yang berpasangan, `LEFT` menyimpan semua baris kiri; `LEFT JOIN` + `IS NULL` mencari yang tidak punya pasangan.
- Setelah JOIN, periksa jumlah baris supaya tidak terjadi hitung ganda.
:::

## 6. Subquery

::: intinya
Subquery adalah `SELECT` di dalam `SELECT` lain: hasilnya dipakai sebagai satu nilai, daftar nilai, atau tabel sementara. Untuk query yang panjang, **CTE** (`WITH`) menulis langkah-langkah itu dengan nama sehingga lebih mudah dibaca.
:::

### Pertanyaan bertingkat

"Pesanan mana yang di atas rata-rata?" sebenarnya dua pertanyaan: berapa rata-ratanya, lalu pesanan mana yang di atas angka itu. Subquery menjawab yang pertama di dalam yang kedua.

::: telusuri
```sql
SELECT id, total
FROM pesanan
WHERE total > (SELECT AVG(total) FROM pesanan);
```
3: Database mengerjakan subquery di dalam kurung lebih dulu: rata-rata keempat total adalah (150.000 + 80.000 + 220.000 + 50.000) / 4 = 125.000.
2: Kembali ke query luar dan ambil semua pesanan.
3: Saring yang totalnya di atas 125.000: pesanan 1 (150.000) dan pesanan 3 (220.000).
1: Tercetak dua baris tersebut.
:::

Bentuk subquery lainnya:

```sql
-- Daftar nilai dengan IN
SELECT nama FROM pelanggan
WHERE id IN (SELECT pelanggan_id FROM pesanan WHERE total > 100000);

-- EXISTS: cukup cek ada atau tidak
SELECT nama FROM pelanggan AS p
WHERE EXISTS (SELECT 1 FROM pesanan o WHERE o.pelanggan_id = p.id);

-- Di FROM: hasil antara diperlakukan seperti tabel
SELECT kota, AVG(belanja) AS rata_belanja
FROM (
    SELECT p.kota, SUM(o.total) AS belanja
    FROM pelanggan p JOIN pesanan o ON o.pelanggan_id = p.id
    GROUP BY p.id, p.kota
) AS per_pelanggan
GROUP BY kota;
```

Subquery **berkorelasi** (contoh `EXISTS` di atas) merujuk kolom dari query luar (`p.id`), sehingga dievaluasi untuk setiap baris luar.

### CTE: memberi nama pada langkah

Subquery yang bersarang dua atau tiga tingkat cepat menjadi sulit dibaca. **CTE** menulis setiap langkah di atas dengan nama, lalu query utama memakainya seperti tabel biasa:

```sql
WITH per_pelanggan AS (
    SELECT pelanggan_id, SUM(total) AS belanja
    FROM pesanan
    GROUP BY pelanggan_id
)
SELECT p.nama, pp.belanja
FROM per_pelanggan AS pp
JOIN pelanggan AS p ON p.id = pp.pelanggan_id
WHERE pp.belanja > 100000;
```

### Jebakan NOT IN dan NULL

::: tebak
```sql
SELECT nama FROM pelanggan
WHERE kota NOT IN (SELECT kota FROM pelanggan WHERE id > 2);
```
? Subquery menghasilkan Jakarta (Citra) dan NULL (Dewi). Apa hasil query ini?
- Budi
- Budi dan Dewi
- [x] Tidak ada baris
`NOT IN` berarti "tidak sama dengan Jakarta **dan** tidak sama dengan NULL". Perbandingan dengan `NULL` selalu "tidak diketahui", jadi tidak ada baris yang lolos. Pakai `NOT EXISTS`, yang tidak terganggu oleh `NULL`.
:::

::: rangkuman
- Subquery bisa menghasilkan satu nilai, daftar (`IN`, `EXISTS`), atau tabel di `FROM`.
- CTE (`WITH`) memberi nama pada tiap langkah sehingga query panjang lebih terbaca.
- Hindari `NOT IN` bila subquery bisa berisi `NULL`; pakai `NOT EXISTS`.
:::

## 7. Primary key dan foreign key

::: intinya
**Primary key** mengenali satu baris secara unik. **Foreign key** adalah kolom yang menunjuk primary key tabel lain, dan database memakainya untuk menolak data yang menunjuk ke sesuatu yang tidak ada.
:::

### Primary key: kartu identitas baris

Setiap baris butuh satu nilai yang pasti membedakannya dari baris lain, seperti nomor induk. Syarat primary key (PK): tidak `NULL`, tidak duplikat, dan sebaiknya tidak pernah berubah. Pilihan umum adalah angka yang bertambah otomatis (`id`) atau UUID.

Hindari data bermakna seperti nama atau email sebagai PK. Nama bisa sama, email bisa berganti, dan kalau PK berubah, semua tabel yang menunjuknya ikut harus diubah.

### Foreign key: penunjuk yang dijaga

Kolom `pesanan.pelanggan_id` adalah **foreign key** (FK): ia menunjuk ke `pelanggan.id`. Dengan FK, database menjaga **integritas referensial**: tidak boleh ada pesanan untuk pelanggan yang tidak ada.

```sql
ALTER TABLE pesanan
ADD CONSTRAINT fk_pesanan_pelanggan
    FOREIGN KEY (pelanggan_id) REFERENCES pelanggan(id)
    ON DELETE RESTRICT;   -- tolak hapus pelanggan yang masih punya pesanan
```

::: tebak
```sql
PRAGMA foreign_keys = ON;   -- khusus SQLite: aktifkan pengecekan FK
INSERT INTO pesanan VALUES (5, 99, '2026-04-01', 10000);
```
? Tidak ada pelanggan dengan `id` 99. Apa yang terjadi?
- Pesanan tersimpan seperti biasa
- [x] Ditolak dengan error foreign key
- Tersimpan dengan `pelanggan_id` berisi NULL
FK `pelanggan_id` harus menunjuk ke `id` yang ada di tabel `pelanggan`. Database menolak dengan pesan seperti *FOREIGN KEY constraint failed*, sehingga data yatim tidak pernah masuk.
:::

Pilihan `ON DELETE` menentukan nasib baris anak saat induknya dihapus:

| Opsi | Efek saat baris induk dihapus |
|---|---|
| `RESTRICT` / `NO ACTION` | Ditolak jika masih ada anak |
| `CASCADE` | Baris anak ikut terhapus (hati-hati) |
| `SET NULL` | Kolom FK di anak menjadi `NULL` |

### Bentuk hubungan

- **Satu-ke-banyak** (satu pelanggan, banyak pesanan): FK ditaruh di sisi "banyak", yaitu `pesanan`.
- **Banyak-ke-banyak** (satu pesanan berisi banyak produk, satu produk ada di banyak pesanan): butuh tabel penghubung, misalnya `detail_pesanan`, dengan dua FK.

PK dan FK juga yang membuat JOIN di Bab 5 efisien. PK otomatis berindeks, tetapi kolom FK biasanya perlu kamu beri indeks sendiri: `CREATE INDEX idx_pesanan_pelanggan ON pesanan(pelanggan_id);`.

> **Catatan SQLite:** FK harus ditulis langsung di `CREATE TABLE` (seperti di sampul buku ini), dan pengecekannya baru aktif setelah `PRAGMA foreign_keys = ON;`.

::: rangkuman
- PK unik, tidak `NULL`, dan sebaiknya tidak berubah; hindari nama atau email sebagai PK.
- FK menunjuk PK tabel lain dan menolak data yatim; `ON DELETE` mengatur nasib baris anak.
- Satu-ke-banyak: FK di sisi banyak; banyak-ke-banyak: tabel penghubung dengan dua FK.
:::

## 8. Normalisasi

::: intinya
Normalisasi menata tabel supaya setiap fakta tersimpan di satu tempat saja, sehingga data tidak berulang dan tidak saling bertentangan saat diubah. Tiga bentuk normal pertama (1NF, 2NF, 3NF) sudah cukup untuk hampir semua desain.
:::

### Satu tabel besar dan masalahnya

Bayangkan semua informasi pesanan ditumpuk di satu tabel:

| pesanan_id | pelanggan | kota | produk | harga |
|---|---|---|---|---|
| 1 | Ayu | Jakarta | Buku, Pulpen | 50000, 5000 |

Masalahnya mirip spreadsheet di Bab 1: kota Ayu terulang di setiap pesanan, harga pulpen terulang di setiap pesanan yang membelinya, dan satu sel berisi dua produk sekaligus. Normalisasi membereskan ini selangkah demi selangkah.

### Tiga bentuk normal

- **1NF**: setiap sel berisi **satu nilai**, dan tidak ada kolom berulang. `Buku, Pulpen` dalam satu sel melanggar; pecah menjadi satu baris per produk.
- **2NF**: sudah 1NF, dan tidak ada kolom yang hanya bergantung pada **sebagian** kunci gabungan. Kalau kuncinya `(pesanan_id, produk)`, maka `harga` hanya bergantung pada `produk`, jadi pindahkan ke tabel `produk`.
- **3NF**: sudah 2NF, dan kolom non-kunci tidak bergantung pada kolom non-kunci lain. `kota` bergantung pada `pelanggan`, bukan pada pesanan, jadi pindahkan ke tabel `pelanggan`.

Cara mengingatnya: setiap kolom harus bergantung pada **kunci, seluruh kunci, dan hanya kunci**.

Hasil akhirnya adalah tabel seperti di sampul buku ini: `pelanggan` dan `pesanan`, ditambah `produk` dan `detail_pesanan`. Mengubah kota Ayu cukup di satu tempat, dan harga pulpen tersimpan sekali.

::: tebak
? Sel `Buku, Pulpen` pada tabel di atas melanggar bentuk normal yang mana?
- [x] 1NF
- 2NF
- 3NF
1NF mensyaratkan setiap sel berisi satu nilai. Dua produk dalam satu sel membuat pertanyaan sederhana seperti "berapa pulpen terjual?" sulit dijawab dengan SQL biasa.
:::

### Kapan sengaja tidak dinormalisasi

Normalisasi bukan dogma. Untuk analitik dan data warehouse, tabel sering sengaja **didenormalisasi** menjadi satu tabel lebar supaya query baca lebih cepat tanpa banyak JOIN. Aturan praktisnya: sistem transaksi (aplikasi kasir, pendaftaran) cenderung dinormalisasi; sistem laporan dan analitik cenderung didenormalisasi. Kamu akan bertemu lagi dengan ide ini di bab data warehouse pada Fase 6.

::: rangkuman
- Normalisasi: setiap fakta disimpan sekali, sehingga tidak ada anomali saat data diubah.
- 1NF satu nilai per sel; 2NF tidak bergantung sebagian kunci; 3NF tidak bergantung pada kolom non-kunci.
- Sistem transaksi dinormalisasi, sistem analitik sering sengaja didenormalisasi.
:::

## Mini-proyek Fase 1

::: intinya
Satukan Python, Git, dan SQL dalam satu repositori kecil yang bisa dijalankan orang lain tanpa bertanya. Ini bukti pertama di portofoliomu bahwa kamu bisa menyelesaikan sesuatu dari awal sampai rapi.
:::

Gabungkan tiga dasar Fase 1 dalam satu repositori kecil:

1. **Alat CLI Python** (misalnya pencatat pengeluaran atau pengubah format berkas), dengan logika yang dipisah dari bagian input dan output, penanganan error, dan tiga tes `pytest`.
2. **Repo Git yang rapi**: riwayat commit yang jelas, `.gitignore`, README berisi cara pasang dan cara pakai, serta satu pull request dari branch ke `main` yang kamu review sendiri.
3. **Database SQLite** berisi data contoh dan dua query yang menjawab pertanyaan bisnis nyata, satu dengan `JOIN` dan `GROUP BY`, satu dengan window function, masing-masing dengan penjelasan hasil dalam dua kalimat.

Tanda selesai: orang lain bisa mengunduh repomu, mengikuti README, dan menjalankannya tanpa bertanya.

::: rangkuman
- Satu repositori: alat CLI Python dengan tes, riwayat Git yang rapi, dan query SQL yang menjawab pertanyaan nyata.
- README yang bisa diikuti orang lain adalah syarat selesai.
- Review PR-mu sendiri seolah milik orang lain.
:::

## Latihan

1. Tampilkan tiga pesanan dengan total terbesar beserta nama pelanggannya.
2. Hitung total belanja per kota. Kota `NULL` harus tampil sebagai "Tidak diketahui" (`COALESCE`).
3. Cari pelanggan yang total belanjanya di atas rata-rata total belanja semua pelanggan.
4. Tampilkan jumlah pesanan per bulan, hanya bulan dengan minimal dua pesanan (`GROUP BY` + `HAVING`).
5. Gambar sendiri desain tiga tabel untuk toko buku (buku, penulis, penjualan), tentukan PK dan FK, dan jelaskan bentuk normal mana yang terpenuhi.
6. Sengaja tulis query yang salah dengan `NOT IN` dan data `NULL`, lalu perbaiki dengan `NOT EXISTS`.

Latihan paling efektif adalah menulis query tanpa menyalin, lalu memeriksa jumlah baris hasilnya dengan akal sehat: apakah angkanya masuk akal?
