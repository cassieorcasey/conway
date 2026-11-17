Buku kecil ini terdiri dari enam bab, satu untuk tiap langkah di checklist. Kuncinya satu: Git itu soal **snapshot**. Setiap commit adalah foto seluruh proyekmu pada satu momen, dan kamu bisa kembali ke foto mana pun. Kalau bingung di tengah jalan, jalankan `git status`; perintah itu selalu memberi tahu posisimu dan langkah berikutnya. Contoh perintah di sini bisa ditelusuri tanpa laptop, lalu dicoba sungguhan di terminal saat kamu sempat.

## 1. Init, add, commit

::: intinya
Git menyimpan riwayat proyek sebagai rangkaian **snapshot** yang disebut commit. Setiap perubahan melewati tiga area: diedit di *working directory*, dipilih dengan `git add` ke *staging area*, lalu disimpan permanen dengan `git commit`.
:::

### Kenapa butuh Git

Tanpa Git, riwayat proyek biasanya berupa file `analisis_final.py`, `analisis_final2.py`, dan `analisis_final_BENAR.py`. Git menggantikan kekacauan itu dengan satu folder yang ingat **setiap** versi, siapa yang mengubah, kapan, dan kenapa. Kamu bisa bereksperimen dengan berani, karena selalu ada jalan pulang ke versi yang terakhir berfungsi.

### Tiga area

Bayangkan menyusun album foto. Kamu mengambil banyak foto (mengedit file), memilih beberapa yang layak masuk album (staging), lalu menempelkannya ke halaman baru dengan keterangan (commit).

| Area | Artinya | Perintah untuk pindah ke sini |
|---|---|---|
| Working directory | File yang sedang kamu edit | (mengedit file) |
| Staging area | Perubahan yang dipilih untuk commit berikutnya | `git add` |
| Repository | Riwayat commit yang sudah tersimpan | `git commit` |

Staging terasa seperti langkah tambahan, tapi gunanya besar: kamu bisa mengedit lima file lalu menyimpannya sebagai dua commit terpisah yang masing-masing punya satu tujuan jelas.

::: telusuri
```bash
git init -b main
git status
git add analisis.py
git commit -m "Tambah analisis awal"
git log --oneline
```
1: Folder ini menjadi repositori Git dengan branch awal bernama `main`. Git membuat folder tersembunyi `.git` yang menyimpan seluruh riwayat.
2: `status` melaporkan `analisis.py` sebagai *untracked*: Git melihat file itu, tapi belum mengawasinya.
3: `analisis.py` masuk staging. Git memotret isinya **saat ini**.
4: Isi staging disimpan sebagai commit dengan pesan yang menjelaskan perubahannya. Staging kembali kosong.
5: Tercetak satu baris: kode pendek commit (misalnya `3f2a1c9`) dan pesannya. Itulah foto pertama di album.
:::

Beberapa perintah yang akan kamu pakai setiap hari:

```bash
git config --global user.name "Nama Kamu"      # sekali saja per komputer
git config --global user.email "kamu@email.com"

git add .              # masukkan semua perubahan ke staging
git diff               # perubahan yang BELUM di-stage
git diff --staged      # perubahan yang SUDAH di-stage
```

### Pesan commit yang baik

Pesan commit adalah catatan untuk dirimu enam bulan lagi. Tulis singkat (di bawah 70 karakter), dalam bentuk perintah, dan sebut **apa** yang berubah: "Perbaiki hitung rata-rata saat data kosong", bukan "update" atau "fix bug".

### Yang tidak boleh di-commit

Data besar, kunci rahasia, `.venv/`, dan `__pycache__/` tidak masuk riwayat. Daftarkan di file `.gitignore`, satu pola per baris:

```text
.venv/
__pycache__/
.env
*.csv
.ipynb_checkpoints/
```

> **Penting:** kalau password, token, atau API key terlanjur ter-commit, menghapusnya di commit berikutnya tidak cukup karena kunci itu masih ada di riwayat. Anggap kunci itu bocor dan ganti segera.

::: tebak
```bash
# analisis.py diubah (versi A), lalu:
git add analisis.py
# analisis.py diubah LAGI (versi B), lalu:
git commit -m "Simpan perubahan"
```
? Versi mana yang masuk ke commit?
- Versi B, yang terakhir
- [x] Versi A, saat `git add`
- Gabungan versi A dan B
`git add` memotret isi file pada saat itu. Perubahan setelahnya (versi B) masih tinggal di working directory, dan `git status` akan menampilkan file yang sama di dua area sekaligus. Jalankan `git add` lagi kalau versi B juga ingin masuk.
:::

::: rangkuman
- Commit adalah snapshot seluruh proyek; perubahan berjalan dari working directory ke staging (`add`) lalu ke repository (`commit`).
- Pesan commit singkat dan menjelaskan apa yang berubah.
- Rahasia dan file besar masuk `.gitignore`; kunci yang terlanjur ter-commit harus diganti.
:::

## 2. Branch dan checkout

::: intinya
Branch adalah **jalur kerja terpisah**: kamu bisa bereksperimen tanpa mengganggu `main`. Secara teknis, branch hanyalah label yang menunjuk ke satu commit dan ikut maju setiap kali kamu commit.
:::

### Jalur kerja paralel

Misalkan analisismu di `main` sudah berjalan, lalu kamu ingin mencoba cara baru membuang outlier. Kalau langsung mengubah `main` dan ternyata gagal, kamu harus membereskan kekacauan. Dengan branch, percobaan itu berlangsung di jalur sendiri. Berhasil? Gabungkan. Gagal? Tinggalkan, dan `main` tidak pernah tahu.

Ingat konsep label dari buku Python: branch bekerja persis begitu. `main` dan `fitur/hapus-outlier` hanyalah dua label yang menunjuk ke commit tertentu. Membuat branch berarti membuat label baru, makanya branch di Git sangat murah dan cepat.

```bash
git branch                          # daftar branch, tanda * = yang aktif
git switch -c fitur/hapus-outlier   # buat branch baru lalu pindah ke sana
# ... edit, add, commit ...
git switch main                     # kembali ke main
```

`git switch` adalah perintah modern untuk pindah branch. Banyak tutorial masih memakai `git checkout`, dan keduanya bekerja:

```bash
git checkout main             # sama dengan git switch main
git checkout -b fitur/baru    # sama dengan git switch -c fitur/baru
```

### Apa yang terjadi saat pindah branch

Saat kamu pindah branch, Git mengganti isi folder kerjamu dengan snapshot dari branch tujuan. File yang ada di satu branch bisa "hilang" di branch lain, padahal sebenarnya aman tersimpan di commit branch asalnya.

Hati-hati dengan perubahan yang **belum** di-commit. Git membawanya ikut pindah, atau menolak pindah kalau perubahan itu akan tertimpa. Kebiasaan aman: commit dulu (atau `git stash` untuk menyimpan sementara) sebelum berganti branch.

::: tebak
```bash
git switch -c fitur/grafik
# menambah grafik.py, lalu:
git add grafik.py
git commit -m "Tambah grafik"
git switch main
```
? Setelah baris terakhir, ada di mana `grafik.py`?
- Tetap ada di folder kerja
- [x] Tidak terlihat di folder kerja, tapi aman di branch `fitur/grafik`
- Terhapus selamanya
Commit `grafik.py` hanya ada di jalur `fitur/grafik`. Saat pindah ke `main`, Git menampilkan snapshot `main`, yang belum punya file itu. Kembali dengan `git switch fitur/grafik` dan file itu muncul lagi.
:::

Kebiasaan yang baik: satu branch untuk satu tujuan, dengan nama yang menjelaskan isinya, misalnya `fitur/...` dan `perbaikan/...`.

::: rangkuman
- Branch adalah label yang menunjuk ke commit; membuatnya murah, jadi pakai untuk setiap percobaan.
- `git switch -c nama` membuat dan pindah ke branch baru, `git switch nama` pindah ke branch yang ada.
- Pindah branch mengganti isi folder kerja; commit atau stash dulu sebelum pindah.
:::

## 3. Merge

::: intinya
Merge menggabungkan hasil kerja satu branch ke branch lain. Kalau tujuan tidak berubah sejak branch dibuat, Git cukup menggeser penunjuknya (*fast-forward*). Kalau keduanya berubah di **baris yang sama**, terjadi *conflict* yang harus kamu putuskan sendiri.
:::

### Menggabungkan pekerjaan

Merge selalu dilakukan dari branch **tujuan**. Pindah dulu ke sana, lalu tarik branch lain ke dalamnya:

```bash
git switch main
git merge fitur/hapus-outlier
```

Ada dua kemungkinan hasil:

- **Fast-forward**: `main` tidak punya commit baru sejak branch dibuat. Git cukup menggeser label `main` maju ke commit terakhir branch fitur. Tidak ada commit baru.
- **Merge commit**: kedua branch sama-sama punya commit baru. Git membuat satu commit tambahan yang menyatukan keduanya.

::: tebak
? Kamu membuat `fitur/eda` dari `main`, commit tiga kali di sana, dan selama itu tidak ada yang commit ke `main`. Apa yang terjadi saat `main` me-merge `fitur/eda`?
- Merge commit baru dibuat
- [x] Fast-forward: label `main` cukup digeser maju
- Conflict
`main` tidak berubah sejak cabang dibuat, jadi riwayatnya adalah garis lurus. Git cukup memindahkan label `main` ke commit terakhir `fitur/eda`, tanpa commit penggabung.
:::

### Saat terjadi conflict

Git pandai menggabungkan perubahan di bagian berbeda dari sebuah file. Tapi kalau dua branch mengubah **baris yang sama** dengan cara berbeda, Git tidak tahu mana yang benar. Git berhenti dan menandai file itu:

::: telusuri
```text
<<<<<<< HEAD
rata_rata = sum(x) / len(x)
=======
rata_rata = statistics.mean(x)
>>>>>>> fitur/hapus-outlier
```
1: Awal wilayah conflict. `HEAD` berarti branch yang sedang aktif, yaitu tujuan merge (`main`).
2: Versi baris ini menurut `main`.
3: Pembatas antara dua versi.
4: Versi baris yang sama menurut `fitur/hapus-outlier`.
5: Akhir wilayah conflict. Tugasmu: putuskan isi akhirnya, lalu hapus **ketiga** baris penanda.
:::

Langkah menyelesaikannya:

1. Buka file, putuskan isi akhirnya (salah satu versi, gabungan keduanya, atau tulisan baru), lalu hapus baris `<<<<<<<`, `=======`, dan `>>>>>>>`.
2. `git add nama-file` untuk menandai conflict sudah selesai.
3. `git commit` untuk menyelesaikan merge.

Conflict bukan tanda kamu berbuat salah; itu bagian normal dari kerja tim. Tersesat di tengah jalan? `git merge --abort` mengembalikan semuanya seperti sebelum merge. Setelah merge selesai, branch yang sudah tidak dipakai boleh dihapus dengan `git branch -d fitur/hapus-outlier`.

::: rangkuman
- Merge dijalankan dari branch tujuan: `git switch main` lalu `git merge fitur`.
- Fast-forward kalau tujuan tidak berubah; merge commit kalau keduanya berubah.
- Conflict: pilih isi akhir, hapus tiga baris penanda, lalu `add` dan `commit`; `git merge --abort` untuk batal.
:::

## 4. Clone, pull, push

::: intinya
**Remote** adalah salinan repositori di server seperti GitHub, biasanya bernama `origin`. `clone` menyalinnya ke komputermu, `push` mengirim commit lokal ke sana, dan `pull` mengambil commit baru dari sana lalu menggabungkannya.
:::

### Repositori di dua tempat

Sejauh ini semua riwayat tinggal di laptopmu. Remote menambah satu salinan di server, yang berfungsi sebagai cadangan sekaligus titik temu kerja tim. Setiap orang punya salinan lengkap di komputernya, dan remote adalah tempat semua salinan itu disinkronkan.

```bash
git clone https://github.com/pengguna/proyek.git   # salin repositori + seluruh riwayatnya
cd proyek

git push -u origin main   # kirim commit lokal; -u cukup sekali per branch
git push                  # selanjutnya cukup begini

git fetch                 # ambil info terbaru tanpa mengubah file-mu
git pull                  # fetch + merge ke branch aktif
```

`fetch` hanya melihat-lihat: ia mengunduh commit baru tapi tidak menyentuh file kerjamu. `pull` melakukan `fetch` lalu langsung me-merge. Kalau ragu apa yang akan masuk, `fetch` dulu lalu periksa dengan `git log`.

::: telusuri
```bash
git pull
git switch -c perbaikan/rata-rata
git add statistik.py
git commit -m "Tangani data kosong di rata_rata"
git push -u origin perbaikan/rata-rata
```
1: Mulai hari dengan mengambil pekerjaan terbaru tim, supaya kamu bekerja di atas versi terkini dan conflict tidak menumpuk.
2: Buat branch untuk satu perbaikan.
3: Setelah mengedit, pilih perubahannya ke staging.
4: Simpan sebagai commit dengan pesan yang jelas.
5: Kirim branch ke remote. `-u` menghubungkan branch lokal dengan pasangannya di `origin`, jadi lain kali cukup `git push`.
:::

::: tebak
? `git push` ditolak dengan pesan *rejected... fetch first*. Langkah yang aman?
- `git push --force`
- [x] `git pull`, selesaikan conflict kalau ada, lalu push lagi
- Hapus folder lalu clone ulang
Pesan itu berarti remote punya commit yang belum ada di laptopmu, misalnya dari teman. `git pull` menggabungkannya dulu. `--force` justru menimpa riwayat remote dan bisa menghapus pekerjaan orang lain.
:::

> **Hindari `git push --force`** pada branch yang dipakai bersama. Perintah `git reset --hard` juga membuang perubahan yang belum di-commit tanpa bisa dikembalikan.

Untuk push dari komputer sendiri ke GitHub, kamu butuh autentikasi: **personal access token** (pengganti password pada HTTPS) atau **SSH key**. Alur paling mudah bagi pemula adalah GitHub CLI: `gh auth login`.

::: rangkuman
- `clone` menyalin repositori, `push` mengirim commit, `pull` mengambil dan menggabungkan.
- Biasakan `git pull` sebelum mulai bekerja.
- Push ditolak? Pull dulu; jangan `--force` di branch bersama.
:::

## 5. Repositori GitHub dan Pull Request

::: intinya
GitHub adalah tempat repositori Git dihosting, ditambah alat kolaborasi. **Pull Request** (PR) adalah permintaan resmi agar perubahan di sebuah branch digabungkan ke branch lain, lengkap dengan diskusi dan review sebelum masuk.
:::

### Kenapa tidak langsung push ke main

Di tim, `main` adalah versi yang dipercaya semua orang. Kalau setiap orang bebas push ke sana, satu kesalahan langsung dirasakan semua. Pull Request memberi jeda: perubahan dipamerkan dulu, dibaca orang lain, diuji otomatis, baru digabung. Bagi portofolio pribadi pun, PR adalah bukti bahwa kamu terbiasa bekerja seperti tim profesional.

### Alur kerja standar

1. Buat repositori di GitHub (**New repository**), lalu hubungkan: `git remote add origin <url>`, atau mulai dengan `git clone`.
2. Buat branch dari `main`, kerjakan, commit.
3. `git push -u origin nama-branch`.
4. Di GitHub, klik **Compare & pull request**. Tulis judul yang jelas, jelaskan *apa* yang berubah dan *kenapa*.
5. Reviewer memberi komentar. Perbaiki di branch yang sama; commit baru otomatis masuk ke PR.
6. Setelah disetujui, **Merge pull request**, lalu hapus branch-nya.

Untuk repositori milik orang lain, tambah satu langkah di awal: **Fork** (salinan repositori ke akunmu). Kerjakan di fork, lalu buka PR ke repositori asli. Begitulah cara orang berkontribusi ke proyek open source.

### Deskripsi PR yang baik

- Ringkasan perubahan dalam satu atau dua kalimat.
- Alasan atau masalah yang diselesaikan (tautkan issue dengan `Closes #12`, yang akan otomatis menutupnya saat PR di-merge).
- Cara mengujinya.
- Tangkapan layar atau hasil angka bila relevan, misalnya metrik model sebelum dan sesudah.

::: tebak
? PR-mu sudah dibuka, lalu reviewer meminta satu perbaikan. Bagaimana mengirimnya?
- Tutup PR lalu buka PR baru
- [x] Commit perbaikan di branch yang sama lalu push
- Commit langsung ke `main`
PR mengikuti branch-nya. Setiap commit baru yang di-push ke branch itu otomatis muncul di PR yang sama, lengkap dengan riwayat diskusinya. Reviewer tinggal melihat perubahan tambahannya.
:::

::: rangkuman
- PR memberi kesempatan review dan pengujian sebelum perubahan masuk ke `main`.
- Alur: branch, commit, push, buka PR, perbaiki di branch yang sama, merge, hapus branch.
- Fork untuk berkontribusi ke repositori orang lain; deskripsi PR menjelaskan apa, kenapa, dan cara menguji.
:::

## 6. Dasar code review

::: intinya
Code review adalah membaca perubahan kode orang lain sebelum digabung, untuk menangkap bug dan menjaga kode tetap mudah dirawat. Reviewer yang baik memeriksa kebenaran dulu, baru keterbacaan, dan menulis komentar yang spesifik serta menyebut alasan.
:::

### Kenapa review penting

Mata kedua menangkap hal yang terlewat oleh penulis, karena penulis membaca apa yang ia *maksud*, bukan apa yang ia *tulis*. Review juga menyebarkan pengetahuan: setelah me-review, setidaknya dua orang paham bagian kode itu. Untuk jalurmu menuju Lead, review adalah alat mengajar utama, seperti dibahas lagi di Fase 9.

### Sebagai pembuat PR

- Buat PR kecil, idealnya di bawah 400 baris yang berubah dan satu tujuan. PR besar jarang dibaca dengan teliti.
- Review dirimu sendiri dulu di tab *Files changed* sebelum meminta orang lain.
- Pastikan kode berjalan dan tes lulus sebelum meminta review.
- Anggap komentar sebagai masukan untuk kode, bukan penilaian atas dirimu. Kalau tidak setuju, jelaskan alasanmu dengan sopan.

### Sebagai reviewer, periksa berurutan

1. **Benar?** Apakah kode melakukan yang dijanjikan, termasuk kasus tepi seperti data kosong, nilai `None`, dan pembagian nol?
2. **Mudah dibaca?** Nama jelas, fungsi tidak terlalu panjang, tidak ada duplikasi besar.
3. **Aman?** Tidak ada kunci atau data pribadi yang ikut ter-commit; input dari luar divalidasi.
4. **Teruji?** Ada tes untuk perilaku baru. Untuk kode data science: apakah hasil bisa diulang (seed acak dan versi package dicatat)?

### Menulis komentar yang bisa dipakai

- Spesifik dan menyebut alasan.
- Bedakan wajib dan saran: awali dengan `Nit:` untuk hal kecil yang boleh diabaikan.
- Bertanya lebih baik daripada memerintah: "Kenapa memakai `apply` di sini?" membuka diskusi.
- Sebutkan juga hal yang bagus. Review bukan hanya mencari kesalahan.

::: tebak
? Komentar review mana yang paling berguna?
- "Ini salah."
- "Kenapa tidak pakai cara lain saja?"
- [x] "Baris 42: `len(x)` bisa nol saat data kosong, jadi pembagiannya error. Bagaimana kalau dicek dulu?"
Komentar ketiga menunjuk lokasi, menjelaskan masalah dan akibatnya, lalu menawarkan arah perbaikan dalam bentuk pertanyaan. Penulis PR langsung tahu apa yang harus dilakukan, tanpa merasa diserang.
:::

::: rangkuman
- PR kecil dengan satu tujuan; review dirimu sendiri dulu.
- Urutan memeriksa: benar, mudah dibaca, aman, teruji.
- Komentar spesifik dengan alasan; tandai hal kecil dengan `Nit:`, dan sebutkan juga yang bagus.
:::

## Latihan

1. Buat repositori lokal, commit tiga kali dengan pesan yang jelas, lalu lihat hasilnya dengan `git log --oneline`.
2. Buat branch, ubah satu file, kembali ke `main`, ubah **baris yang sama** di file itu, lalu merge. Selesaikan conflict-nya sampai bersih.
3. Buat repositori di GitHub, push, lalu clone ke folder lain dan pastikan isinya sama.
4. Fork repositori publik latihan, ubah satu baris README, dan buka PR dengan deskripsi lengkap.
5. Minta teman (atau review sendiri keesokan harinya) memberi tiga komentar pada PR-mu dan perbaiki semuanya.

Perintah yang paling sering kamu pakai sehari-hari hanya sembilan: `status`, `add`, `commit`, `switch`, `merge`, `pull`, `push`, `log`, `diff`. Hafalkan itu dulu.
