Buku kecil ini terdiri dari sembilan bab, satu untuk tiap langkah di checklist, dengan urutan yang sama. Setiap bab dibuka dengan **Intinya**, dilanjutkan penjelasan lengkap, lalu ditutup rangkuman. Kalau sedang tanpa laptop, kerjakan blok **Telusuri kodenya** dan **Tebak dulu** langsung di layar: keduanya melatih cara membaca kode, keterampilan yang sama pentingnya dengan menulis. Saat di depan laptop, jalankan contohnya sendiri di terminal (`python`) atau notebook. Semua contoh berlaku untuk Python 3.10 ke atas.

## 1. Sintaks dasar, variabel, tipe data

::: intinya
Variabel di Python adalah **label** yang ditempelkan pada sebuah nilai. Setiap nilai punya **tipe** (`int`, `float`, `str`, `bool`, `None`), dan tipe itulah yang menentukan apa yang bisa dilakukan dengannya.
:::

### Variabel itu label, bukan kotak

Banyak buku menggambarkan variabel sebagai kotak berisi nilai. Untuk Python, gambaran yang lebih tepat adalah **label** atau stiker. Saat kamu menulis `nama = "Ayu"`, Python membuat teks `"Ayu"` lalu menempelkan label `nama` padanya. Menulis `nama = "Budi"` setelahnya tidak mengubah teks lama; label itu dicabut dan ditempel ke nilai baru.

Karena itu variabel tidak perlu dideklarasikan lebih dulu, dan satu label boleh berpindah ke nilai dengan tipe lain. Bebas, tapi juga sumber bug kalau tidak hati-hati.

```python
nama = "Ayu"
umur = 24
tinggi = 1.62
aktif = True
kosong = None

print(type(umur))                      # <class 'int'>
print(f"{nama} berumur {umur} tahun")  # f-string: Ayu berumur 24 tahun
```

Satu aturan sintaks yang paling khas dari Python: **indentasi adalah struktur**. Bahasa lain memakai kurung kurawal `{ }` untuk menandai blok kode; Python memakai 4 spasi. Baris yang menjorok ke dalam adalah milik baris di atasnya. Indentasi yang berantakan bukan sekadar jelek, tapi membuat program berbeda arti atau gagal jalan.

::: telusuri
```python
harga = 15000
jumlah = 3
total = harga * jumlah
harga = 20000
print(total)
```
1: Label `harga` ditempel ke angka 15000.
2: Label `jumlah` ditempel ke angka 3.
3: Python menghitung `15000 * 3` saat itu juga, lalu menempelkan label `total` ke hasilnya, 45000. `total` menempel ke **nilai**, bukan ke rumusnya.
4: Label `harga` dicabut dan ditempel ke 20000. Nilai 45000 milik `total` tidak ikut berubah.
5: Tercetak `45000`. Kalau kamu menebak 60000, itu pola pikir spreadsheet; Python tidak menghitung ulang.
:::

### Tipe data dasar

| Tipe | Contoh | Yang perlu diingat |
|---|---|---|
| `int` | `42` | Bilangan bulat, ukurannya tidak dibatasi |
| `float` | `3.14` | Bilangan pecahan; `0.1 + 0.2` bukan persis `0.3` karena disimpan dalam biner |
| `str` | `"halo"` | Teks; tidak bisa diubah (*immutable*), setiap "perubahan" membuat teks baru |
| `bool` | `True` | Benar atau salah; sebenarnya subtipe `int`, jadi `True + True == 2` |
| `NoneType` | `None` | Artinya "tidak ada nilai", misalnya hasil fungsi yang tidak mengembalikan apa pun |

Tipe penting karena menentukan operasi yang sah. `"5" + 5` gagal dengan `TypeError`, sebab Python tidak menebak apakah kamu ingin menggabung teks atau menjumlah angka. Kamu yang harus mengubahnya dengan jelas: `int("5") + 5` menghasilkan `10`, sedangkan `"5" + str(5)` menghasilkan `"55"`.

### Operator yang wajib hafal

| Operator | Arti | Contoh | Hasil |
|---|---|---|---|
| `/` | Bagi, **selalu** menghasilkan float | `7 / 2` | `3.5` |
| `//` | Bagi bulat (dibulatkan ke bawah) | `7 // 2` | `3` |
| `%` | Sisa bagi | `7 % 2` | `1` |
| `**` | Pangkat | `2 ** 10` | `1024` |

```python
print(7 // 2, 7 % 2, 2 ** 10, 7 / 2)  # 3 1 1024 3.5
print(0.1 + 0.2)                      # 0.30000000000000004
```

`%` lebih berguna dari kelihatannya: `n % 2 == 0` mengecek bilangan genap, dan `detik % 60` mengambil sisa detik dari total waktu.

> **Tip:** Untuk membandingkan float pakai `math.isclose(a, b)`, bukan `==`, karena angka pecahan hampir selalu punya selisih kecil di digit terakhir.

::: tebak
```python
print(7 // 2 + 7 % 2)
```
? Apa yang tercetak?
- 3.5
- [x] 4
- 4.0
`7 // 2` adalah `3` (int) dan `7 % 2` adalah `1` (int). Penjumlahan dua int tetap int, jadi hasilnya `4`, bukan `4.0`. Float baru muncul kalau ada operator `/` atau salah satu angkanya float.
:::

### Kesalahan yang sering terjadi

Fungsi `input()` **selalu** mengembalikan teks, bahkan kalau pengguna mengetik angka. `umur = input("Umur? ")` lalu `umur + 1` akan gagal. Ubah dulu: `umur = int(input("Umur? "))`.

::: rangkuman
- Variabel adalah label yang menempel ke nilai; memberi nilai baru memindahkan labelnya, bukan mengubah nilai lama.
- Tipe menentukan operasi yang sah. Ubah tipe secara eksplisit dengan `int()`, `float()`, `str()`.
- `/` selalu menghasilkan float, `//` bagi bulat, `%` sisa bagi; jangan bandingkan float dengan `==`.
:::

## 2. Kondisional dan loop

::: intinya
`if` memilih satu jalur berdasarkan kondisi, dan hanya kondisi **pertama** yang benar yang dijalankan. `for` mengulang untuk setiap item dalam kumpulan; `while` mengulang selama kondisinya masih benar.
:::

### Memilih jalur dengan if

Program yang selalu melakukan hal yang sama tidak terlalu berguna. `if` membuat program bisa memutuskan, seperti percabangan jalan: dicek dari atas, dan begitu satu cabang cocok, cabang lain dilewati.

::: telusuri
```python
nilai = 82
if nilai >= 90:
    huruf = "A"
elif nilai >= 75:
    huruf = "B"
else:
    huruf = "C"
print(huruf)
```
1: `nilai` berisi 82.
2: Apakah 82 >= 90? Tidak, jadi baris 3 dilewati.
4: Apakah 82 >= 75? Ya. Ini kondisi pertama yang benar.
5: `huruf` diisi `"B"`. Cabang `else` tidak akan dicek lagi.
8: Tercetak `B`. Urutan kondisi penting: kalau `nilai >= 75` ditulis paling atas, nilai 95 pun akan mendapat B.
:::

Python juga menganggap beberapa nilai sebagai salah (*falsy*): `0`, `0.0`, `""`, `[]`, `{}`, `set()`, `None`, dan `False`. Semua nilai lain dianggap benar. Karena itu `if daftar:` sudah cukup untuk mengecek apakah daftar tidak kosong, tanpa perlu `if len(daftar) > 0:`.

### Mengulang dengan for

`for` di Python membaca "untuk setiap item di dalam kumpulan ini, lakukan sesuatu". Kamu tidak mengurus penghitung sendiri.

```python
for i in range(3):          # 0, 1, 2 (angka 3 tidak ikut)
    print(i)

buah = ["apel", "jeruk", "mangga"]
for idx, nama in enumerate(buah, start=1):
    print(idx, nama)        # 1 apel, 2 jeruk, 3 mangga

for a, b in zip([1, 2, 3], ["x", "y", "z"]):
    print(a, b)             # berpasangan: 1 x, 2 y, 3 z
```

`range(awal, akhir)` berhenti **sebelum** `akhir`. `range(1, 5)` menghasilkan 1, 2, 3, 4. Aturan "tidak termasuk ujung" ini konsisten di seluruh Python, termasuk saat memotong list.

### Mengulang dengan while

`while` dipakai ketika kamu tidak tahu berapa kali harus mengulang, hanya tahu kapan harus berhenti.

```python
saldo = 100
bulan = 0
while saldo < 200:
    saldo *= 1.1            # tumbuh 10% per bulan
    bulan += 1
print(bulan)                # 8
```

Pastikan sesuatu di dalam `while` mengubah kondisinya. Kalau tidak, loop berjalan selamanya (tekan `Ctrl+C` untuk menghentikan).

### break, continue, dan else pada loop

`break` keluar dari loop seketika, `continue` melompati sisa langkah dan lanjut ke item berikutnya. Loop juga punya `else`, yang jalan **hanya jika loop selesai tanpa `break`**. Ini rapi untuk pencarian:

```python
for x in [3, 5, 8]:
    if x % 2 == 0:
        print("ketemu genap", x)
        break
else:
    print("tidak ada genap")
```

::: tebak
```python
total = 0
for i in range(1, 5):
    if i == 3:
        continue
    total += i
print(total)
```
? Apa yang tercetak?
- 10
- [x] 7
- 6
`range(1, 5)` menghasilkan 1, 2, 3, 4. Saat `i` bernilai 3, `continue` melompati baris penjumlahan. Jadi totalnya 1 + 2 + 4 = 7.
:::

::: rangkuman
- `if/elif/else` dicek dari atas; hanya kondisi benar pertama yang dijalankan, jadi urutan menentukan hasil.
- `for` untuk setiap item dalam kumpulan, `while` selama kondisi benar; `range(a, b)` tidak termasuk `b`.
- `break` keluar, `continue` lompat ke item berikutnya, `else` pada loop jalan kalau tidak ada `break`.
:::

## 3. Fungsi dan scope

::: intinya
Fungsi mengemas langkah yang berulang menjadi satu nama yang bisa dipanggil kapan saja, dengan **parameter** sebagai bahan masuk dan `return` sebagai hasil keluar. Variabel yang dibuat di dalam fungsi hanya hidup di dalam fungsi itu (*scope* lokal).
:::

### Fungsi itu resep yang diberi nama

Bayangkan kamu sering menghitung harga setelah diskon. Menulis rumus yang sama sepuluh kali itu melelahkan dan gampang salah, dan kalau rumusnya berubah kamu harus mengganti sepuluh tempat. Dengan fungsi, kamu menulis resepnya satu kali, memberinya nama, lalu memanggil nama itu setiap kali butuh.

Sebuah fungsi punya tiga bagian: **nama**, **bahan yang masuk** (parameter), dan **hasil yang keluar** (`return`).

::: telusuri
```python
def hitung_diskon(harga, persen):
    potongan = harga * persen / 100
    return harga - potongan

total = hitung_diskon(200_000, 15)
print(total)   # 170000.0
```
1: Python membaca `def` dan menyimpan fungsi dengan nama `hitung_diskon`. Isinya **belum** dijalankan.
5: Fungsi dipanggil dengan `harga` = 200000 dan `persen` = 15. Python melompat ke dalam fungsi.
2: `potongan` = 200000 × 15 ÷ 100 = 30000.0. Variabel ini lahir di sini dan hanya ada di dalam fungsi.
3: `return` mengirim 170000.0 keluar, lalu fungsi selesai. `potongan` ikut hilang.
6: `total` berisi 170000.0 dan `print` menampilkannya. Coba `print(potongan)` di sini: Python menjawab `NameError`.
:::

### Cara memanggil yang lebih fleksibel

Parameter boleh punya **nilai bawaan**, dan saat memanggil kamu boleh menyebut nama parameternya supaya urutan tidak penting dan kode lebih mudah dibaca.

```python
def luas_persegi_panjang(p, l=1):
    """Hitung luas. Teks ini (docstring) muncul di help()."""
    return p * l

print(luas_persegi_panjang(4, 5))      # 20
print(luas_persegi_panjang(l=3, p=2))  # 6, argumen bernama
print(luas_persegi_panjang(7))         # 7, l memakai nilai bawaan 1
```

Untuk jumlah argumen yang tidak tentu, `*args` menampung argumen posisi ekstra sebagai tuple, dan `**kwargs` menampung argumen bernama ekstra sebagai dict.

```python
def rata_rata(*angka):
    return sum(angka) / len(angka)

print(rata_rata(80, 90, 100))  # 90.0
```

Fungsi tanpa `return` tetap berjalan, tapi hasilnya `None`. Kalau hasil fungsimu tampak "kosong" saat dicetak, cek dulu apakah baris `return`-nya ada.

### Scope: siapa yang boleh melihat variabel

Variabel yang kamu buat di dalam fungsi hanya hidup selama fungsi itu berjalan. Begitu fungsi selesai, variabelnya hilang, dan dari luar Python tidak mengenalnya.

| | Lokal | Global |
|---|---|---|
| Dibuat | di dalam fungsi | di luar semua fungsi |
| Hidup sampai | fungsi selesai | program selesai |
| Terlihat dari | dalam fungsi itu saja | hampir di mana saja |

Saat mencari sebuah nama, Python memeriksa empat tempat secara berurutan, disingkat **LEGB**: *Local* (fungsi ini), *Enclosing* (fungsi pembungkusnya, kalau ada), *Global* (tingkat file), lalu *Built-in* (nama bawaan seperti `print`). Mengubah variabel luar dari dalam fungsi butuh kata kunci `global` atau `nonlocal`, tapi sebaiknya dihindari. Lebih rapi: kirim nilainya sebagai argumen, dan kembalikan hasilnya dengan `return`.

::: tebak
```python
x = 10
def ubah():
    x = 99
ubah()
print(x)
```
? Apa yang tercetak?
- 99
- [x] 10
- Error
`x = 99` di dalam `ubah()` membuat variabel **lokal** baru yang kebetulan juga bernama `x`. `x` di luar tidak tersentuh, jadi tetap 10. Variabel lokal itu hilang saat fungsi selesai.
:::

### Jebakan klasik: nilai bawaan yang bisa berubah

Nilai bawaan dibuat **satu kali**, saat fungsi didefinisikan, bukan setiap kali dipanggil. Kalau nilai bawaannya list atau dict, list yang sama dipakai bersama oleh semua panggilan.

```python
def tambah(x, daftar=[]):       # salah: satu list dipakai bersama
    daftar.append(x)
    return daftar

print(tambah(1))  # [1]
print(tambah(2))  # [1, 2]  <- mengejutkan

def tambah_benar(x, daftar=None):
    if daftar is None:
        daftar = []              # list baru setiap panggilan
    daftar.append(x)
    return daftar
```

::: rangkuman
- `def` membuat fungsi; isinya baru dijalankan saat fungsi dipanggil.
- `return` mengirim hasil keluar; tanpa `return`, hasilnya `None`.
- Variabel di dalam fungsi bersifat lokal dan hilang saat fungsi selesai; jangan pakai list atau dict sebagai nilai bawaan.
:::

## 4. List, Tuple, Dictionary, Set

::: intinya
Empat wadah bawaan Python untuk menyimpan banyak nilai: **list** (urut, bisa diubah), **tuple** (urut, tetap), **dict** (pasangan kunci dan nilai), dan **set** (kumpulan unik tanpa urutan). Memilih wadah yang tepat membuat kode lebih jelas dan lebih cepat.
:::

### Empat wadah, empat kegunaan

Bayangkan empat benda sehari-hari:

- **List** seperti antrean: urutannya penting, orang bisa masuk dan keluar, dan nama yang sama boleh muncul dua kali.
- **Tuple** seperti koordinat di peta, `(lintang, bujur)`: urut, dan tidak untuk diubah-ubah.
- **Dict** seperti buku telepon: kamu mencari berdasarkan nama (kunci) untuk mendapat nomornya (nilai).
- **Set** seperti daftar tamu undangan: setiap nama hanya tercatat sekali, dan urutannya tidak penting.

| Struktur | Urut | Bisa diubah | Isi unik | Contoh |
|---|---|---|---|---|
| `list` | ya | ya | tidak | `[1, 2, 2]` |
| `tuple` | ya | tidak | tidak | `(1, 2)` |
| `dict` | ya (urutan sisip) | ya | kunci unik | `{"a": 1}` |
| `set` | tidak | ya | ya | `{1, 2}` |

```python
angka = [3, 1, 2]
angka.append(4)
angka.sort()
print(angka[0], angka[-1], angka[1:3])  # 1 4 [2, 3]

titik = (2, 5)
x, y = titik                            # unpacking: x=2, y=5

umur = {"Ayu": 24, "Budi": 31}
umur["Citra"] = 28
print(umur.get("Dewi", 0))              # 0, tanpa error
for nama, u in umur.items():
    print(nama, u)

a, b = {1, 2, 3}, {3, 4}
print(a & b, a | b, a - b)              # {3} {1, 2, 3, 4} {1, 2}
```

Indeks dimulai dari 0, dan indeks negatif menghitung dari belakang: `angka[-1]` adalah item terakhir. Potongan `angka[1:3]` mengambil indeks 1 dan 2, tidak termasuk 3, aturan yang sama seperti `range`.

### Pola menghitung dengan dict

Salah satu pola yang paling sering dipakai di analisis data adalah menghitung kemunculan.

::: telusuri
```python
kata = ["apel", "jeruk", "apel"]
hitung = {}
for k in kata:
    hitung[k] = hitung.get(k, 0) + 1
print(hitung)
```
2: `hitung` dimulai sebagai dict kosong.
3: Putaran pertama: `k` = "apel".
4: `hitung.get("apel", 0)` memberi 0 karena belum ada, jadi `hitung["apel"]` = 1.
3: Putaran kedua: `k` = "jeruk".
4: Belum ada, jadi `hitung["jeruk"]` = 1.
3: Putaran ketiga: `k` = "apel" lagi.
4: Sekarang `get` memberi 1, jadi `hitung["apel"]` menjadi 2.
5: Tercetak `{'apel': 2, 'jeruk': 1}`. Pustaka standar punya `collections.Counter` yang melakukan ini dalam satu baris.
:::

### Kecepatan mencari

Mengecek `x in daftar` pada list memeriksa item satu per satu: semakin panjang list, semakin lama (disebut O(n)). Pada set atau dict, pengecekan memakai *hash* sehingga rata-rata secepat sekali lihat (O(1)), berapa pun ukurannya. Kalau kamu harus mengecek keanggotaan berkali-kali, ubah list menjadi set dulu.

### Menyalin tidak sama dengan memberi nama baru

Ingat Bab 1: variabel adalah label. `b = a` tidak menyalin list; ia menempelkan label kedua ke list yang **sama**.

::: tebak
```python
a = [1, 2]
b = a
b.append(3)
print(a)
```
? Apa yang tercetak?
- [1, 2]
- [x] [1, 2, 3]
- Error
`a` dan `b` adalah dua label untuk satu list yang sama, jadi menambah lewat `b` ikut terlihat dari `a`. Untuk salinan sungguhan pakai `a.copy()` atau `a[:]`, dan `copy.deepcopy(a)` kalau ada list di dalam list.
:::

::: rangkuman
- List untuk urutan yang berubah, tuple untuk data tetap, dict untuk mencari berdasarkan kunci, set untuk keunikan.
- Mengecek keanggotaan di set atau dict jauh lebih cepat daripada di list.
- `b = a` hanya menambah label; salin dengan `.copy()` atau `copy.deepcopy()`.
:::

## 5. List comprehension dan generator expressions

::: intinya
**Comprehension** adalah cara ringkas membuat list, dict, atau set dari kumpulan lain dalam satu baris. **Generator** menghasilkan nilai satu per satu saat diminta, sehingga hemat memori, tapi hanya bisa dibaca sekali.
:::

### Loop yang dipadatkan

Pola "buat list kosong, loop, tambahkan hasil" muncul terus-menerus. Comprehension memadatkannya. Bacalah dari kiri: **apa** yang dimasukkan, **dari mana** diambil, dan **syarat** penyaringnya.

::: telusuri
```python
hasil = []
for x in range(6):
    if x % 2 == 0:
        hasil.append(x * x)
print(hasil)
hasil2 = [x * x for x in range(6) if x % 2 == 0]
print(hasil2)
```
1: Cara panjang dimulai dengan list kosong.
2: Ambil `x` dari 0 sampai 5.
3: Saring: hanya `x` genap (0, 2, 4) yang lolos.
4: Masukkan `x * x`, jadi 0, 4, dan 16.
5: Tercetak `[0, 4, 16]`.
6: Comprehension yang sama dalam satu baris: **apa** (`x * x`), **dari mana** (`for x in range(6)`), **syarat** (`if x % 2 == 0`).
7: Tercetak `[0, 4, 16]`, hasilnya persis sama.
:::

Bentuk yang sama berlaku untuk dict dan set:

```python
kuadrat = [x * x for x in range(6)]            # [0, 1, 4, 9, 16, 25]
genap = [x for x in range(10) if x % 2 == 0]
peta = {nama: len(nama) for nama in ["Ayu", "Budi"]}  # {'Ayu': 3, 'Budi': 4}
unik = {x % 3 for x in range(10)}               # {0, 1, 2}
```

### Generator: hitung saat diminta

Ganti kurung siku `[ ]` dengan kurung biasa `( )` dan hasilnya **generator**. Generator tidak menyimpan semua nilai sekaligus; ia seperti keran yang mengalirkan air saat dibuka, bukan ember yang sudah penuh. Ini penting saat datanya besar.

```python
total = sum(x * x for x in range(1_000_000))  # tidak membuat list sejuta angka

def hitung_mundur(n):
    while n > 0:
        yield n        # serahkan satu nilai, lalu berhenti sejenak di sini
        n -= 1

print(list(hitung_mundur(3)))  # [3, 2, 1]
```

Fungsi dengan `yield` adalah generator: setiap kali diminta nilai berikutnya, ia melanjutkan dari titik terakhir berhenti.

::: tebak
```python
g = (x * 2 for x in range(3))
print(sum(g))
print(sum(g))
```
? Apa yang tercetak?
- 6 lalu 6
- [x] 6 lalu 0
- Error
`sum` pertama menghabiskan generator (0 + 2 + 4 = 6). Generator yang sudah habis tidak mengulang dari awal, jadi `sum` kedua menjumlahkan kumpulan kosong: 0. Kalau perlu dibaca berkali-kali, simpan sebagai list.
:::

Kalau comprehension mulai panjang atau bersarang dua tingkat, tulis kembali sebagai loop biasa. Kode yang ringkas tapi sulit dibaca bukan kemenangan.

::: rangkuman
- Comprehension dibaca: apa yang dimasukkan, dari mana, lalu syaratnya.
- Kurung `( )` membuat generator yang hemat memori; fungsi dengan `yield` juga generator.
- Generator hanya bisa dibaca sekali; utamakan keterbacaan di atas keringkasan.
:::

## 6. OOP: Class dan Object

::: intinya
**Class** adalah cetakan, **objek** adalah hasil cetakannya. Class mengikat data (atribut) dan perilaku (method) yang saling berkaitan, sehingga kode besar lebih mudah diatur.
:::

### Cetakan dan kuenya

Bayangkan cetakan kue: dari satu cetakan kamu bisa membuat banyak kue, masing-masing dengan isian sendiri. Class `Rekening` adalah cetakannya; rekening milik Ayu dan milik Budi adalah dua objek berbeda yang dibuat dari cetakan yang sama, dengan saldo masing-masing.

Kenapa repot memakai class? Karena data dan aturan yang mengurusnya tinggal di satu tempat. Aturan "setoran harus positif" tidak tersebar di sepuluh file; ia ada di method `setor`, dan setiap rekening otomatis mematuhinya.

```python
class Rekening:
    def __init__(self, pemilik, saldo=0):
        self.pemilik = pemilik
        self._saldo = saldo  # awalan _ berarti "internal", sebatas kesepakatan

    def setor(self, jumlah):
        if jumlah <= 0:
            raise ValueError("jumlah harus positif")
        self._saldo += jumlah

    @property
    def saldo(self):  # dibaca seperti atribut: r.saldo
        return self._saldo

    def __repr__(self):
        return f"Rekening({self.pemilik!r}, saldo={self._saldo})"
```

::: telusuri
```python
r = Rekening("Ayu", 100)
r.setor(50)
print(r.saldo)
print(r)
```
1: Python membuat objek baru dari cetakan `Rekening`, lalu menjalankan `__init__` dengan `pemilik` = "Ayu" dan `saldo` = 100. `self` adalah objek baru itu.
2: `r.setor(50)` sebenarnya berarti `Rekening.setor(r, 50)`: objek `r` dikirim sebagai `self`. Karena 50 positif, `_saldo` menjadi 150.
3: `saldo` adalah property, jadi dibaca tanpa kurung. Tercetak `150`.
4: `print` memakai `__repr__`, sehingga tercetak `Rekening('Ayu', saldo=150)`, jauh lebih berguna daripada alamat memori.
:::

Hal yang perlu dipahami: `self` adalah **objek yang sedang dipanggil**. Itulah cara method tahu saldo siapa yang harus diubah.

### Atribut objek dan atribut class

Atribut yang ditulis lewat `self.nama = ...` di `__init__` milik masing-masing objek. Atribut yang ditulis langsung di badan class dibagi bersama oleh **semua** objek.

::: tebak
```python
class Kotak:
    isi = []

a = Kotak()
b = Kotak()
a.isi.append(1)
print(b.isi)
```
? Apa yang tercetak?
- []
- [x] [1]
- Error
`isi` ditulis di badan class, jadi hanya ada satu list yang dipakai bersama oleh `a` dan `b`. Agar tiap objek punya list sendiri, buat di `__init__`: `self.isi = []`.
:::

### Dataclass untuk class yang isinya data

Banyak class hanya membawa data. `@dataclass` menuliskan `__init__`, `__repr__`, dan perbandingan `==` untukmu:

```python
from dataclasses import dataclass

@dataclass
class Titik:
    x: float
    y: float

print(Titik(1, 2))                 # Titik(x=1, y=2)
print(Titik(1, 2) == Titik(1, 2))  # True
```

::: rangkuman
- Class adalah cetakan, objek hasil cetakannya; `__init__` mengisi data awal setiap objek.
- `self` adalah objek yang sedang dipanggil; data per objek ditulis lewat `self.nama`.
- Atribut di badan class dibagi bersama; `@dataclass` menghemat kode untuk class berisi data.
:::

## 7. OOP: Inheritance dan Polymorphism

::: intinya
**Inheritance** membuat class baru (subclass) yang mewarisi atribut dan method class induk, lalu menambah atau menimpanya. **Polymorphism** berarti satu panggilan yang sama menghasilkan perilaku berbeda sesuai jenis objeknya.
:::

### Mewarisi dari induk

Kucing dan anjing sama-sama hewan: punya nama dan bisa bersuara. Daripada menulis ulang bagian yang sama, kita tulis sekali di class induk `Hewan`, lalu setiap subclass hanya menulis yang berbeda.

```python
class Hewan:
    def __init__(self, nama):
        self.nama = nama

    def bersuara(self):
        raise NotImplementedError

class Kucing(Hewan):
    def bersuara(self):
        return "meong"

class Anjing(Hewan):
    def __init__(self, nama, ras):
        super().__init__(nama)  # jalankan __init__ milik induk dulu
        self.ras = ras

    def bersuara(self):
        return "guk"

for h in [Kucing("Mimi"), Anjing("Rex", "Husky")]:
    print(h.nama, h.bersuara())  # satu panggilan, perilaku berbeda
```

`super()` memanggil versi induk dari sebuah method. Di `Anjing.__init__`, ia memastikan `self.nama` tetap diisi oleh logika milik `Hewan`, lalu `Anjing` menambah atribut `ras`.

### Polimorfisme dan duck typing

Perhatikan loop di atas: kode pemanggil tidak memeriksa apakah `h` kucing atau anjing. Ia cukup memanggil `h.bersuara()`, dan setiap objek menjawab dengan caranya sendiri. Inilah **polimorfisme**: kamu bisa menambah `Burung` besok tanpa mengubah loop itu.

Python bahkan tidak mewajibkan pewarisan untuk ini. Prinsipnya disebut *duck typing*: "kalau berjalan seperti bebek dan bersuara seperti bebek, anggap saja bebek". Objek apa pun yang punya method `bersuara` bisa masuk loop tadi.

Untuk memaksa setiap subclass mengimplementasikan method tertentu, pakai `abc.ABC` dan `@abstractmethod`. Python akan menolak membuat objek dari subclass yang lupa menulisnya.

::: tebak
```python
class A:
    def halo(self):
        return "A"

class B(A):
    pass

class C(B):
    def halo(self):
        return "C" + super().halo()

print(C().halo())
```
? Apa yang tercetak?
- C
- [x] CA
- Error
`C.halo` menghasilkan `"C"` lalu memanggil `super().halo()`. `B` tidak punya `halo` sendiri, jadi Python terus naik ke `A`, yang mengembalikan `"A"`. Hasilnya `"CA"`.
:::

### Kapan tidak memakai inheritance

Inheritance cocok untuk hubungan "**adalah**": kucing adalah hewan. Untuk hubungan "**punya**", pakai komposisi, yaitu objek yang berisi objek lain: mobil *punya* mesin, bukan mobil *adalah* mesin. Pewarisan yang terlalu dalam (lima tingkat) membuat kode sulit diikuti, karena untuk memahami satu method kamu harus membuka banyak class.

::: rangkuman
- Subclass mewarisi milik induk dan boleh menimpanya; `super()` memanggil versi induk.
- Polimorfisme: satu panggilan, perilaku berbeda per objek, sehingga kode pemanggil tidak perlu tahu tipenya.
- Pakai inheritance untuk "adalah", komposisi untuk "punya".
:::

## 8. Error dan exception handling

::: intinya
Saat terjadi masalah, Python melempar **exception**. Blok `try/except` menangkapnya supaya program bisa bereaksi dengan wajar, dan `finally` menjamin langkah penutup selalu dijalankan. Tangkap error yang spesifik, jangan semua.
:::

### Membaca pesan error

Sebelum menangani error, belajarlah membacanya. Pesan error Python (*traceback*) dibaca **dari bawah**: baris terakhir menyebut jenis dan alasannya, misalnya `ZeroDivisionError: division by zero`, dan baris-baris di atasnya menunjukkan jalur pemanggilan sampai ke baris yang bermasalah. Kebanyakan pemula berhenti di kata "Error" lalu panik; padahal jawabannya sering tertulis jelas di baris terakhir.

### Menangkap dengan try dan except

Bayangkan jaring pengaman di bawah pemain akrobat. `try` adalah aksinya, `except` adalah jaringnya: kalau jatuh dengan cara tertentu, tangkap dan tangani.

```python
def bagi(a, b):
    try:
        hasil = a / b
    except ZeroDivisionError:
        print("tidak bisa dibagi nol")
        return None
    except (TypeError, ValueError) as e:
        print("input salah:", e)
        return None
    else:
        return hasil   # jalan hanya jika tidak ada error
    finally:
        print("selesai")  # selalu jalan, error atau tidak
```

::: telusuri
```python
def bagi(a, b):
    try:
        hasil = a / b
    except ZeroDivisionError:
        return None
    finally:
        print("selesai")

print(bagi(10, 0))
```
9: `bagi` dipanggil dengan `a` = 10 dan `b` = 0.
3: `10 / 0` melempar `ZeroDivisionError`. Sisa blok `try` dilewati.
4: Jenis error cocok dengan `except ZeroDivisionError`, jadi blok ini yang jalan.
5: Fungsi bersiap mengembalikan `None`, tapi belum benar-benar keluar.
7: Sebelum keluar, `finally` selalu dijalankan: tercetak `selesai`.
9: Baru setelah itu `print` di luar menampilkan `None`.
:::

### Aturan praktis

- Tangkap exception **yang spesifik**. `except:` tanpa nama ikut menelan `KeyboardInterrupt` (saat kamu menekan Ctrl+C) dan menyembunyikan bug sungguhan.
- Jangan menelan error diam-diam. Minimal catat, atau lempar ulang dengan `raise`.
- Lempar error sendiri saat input tidak masuk akal: `raise ValueError("jumlah harus positif")`. Untuk kasus khas programmu, buat kelas sendiri: `class SaldoKurang(Exception): ...`.
- Untuk sumber daya yang harus ditutup (file, koneksi), pakai `with`. Ia menutup file otomatis, error atau tidak:

```python
with open("data.txt", encoding="utf-8") as f:
    isi = f.read()  # file otomatis tertutup saat keluar dari blok
```

::: tebak
```python
def f():
    try:
        return "try"
    finally:
        print("finally")

print(f())
```
? Apa yang tercetak, berurutan?
- try saja
- [x] finally, lalu try
- try, lalu finally
`return "try"` menyiapkan nilai kembalian, tapi `finally` tetap dijalankan sebelum fungsi benar-benar keluar, jadi `finally` tercetak lebih dulu. Baru kemudian `print(f())` menampilkan `try`.
:::

::: rangkuman
- Baca traceback dari bawah: baris terakhir menyebut jenis dan alasan error.
- `try/except` menangkap error spesifik, `else` jalan kalau aman, `finally` selalu jalan.
- Jangan menelan error diam-diam; pakai `with` untuk file dan koneksi.
:::

## 9. Modular code dengan pip

::: intinya
Satu file `.py` adalah **modul**, dan folder berisi modul adalah **package**. `import` memakai kode dari file lain, `pip` memasang package dari internet, dan **virtual environment** memberi setiap proyek rak package-nya sendiri supaya versi tidak bentrok.
:::

### Memecah kode menjadi modul

Program yang tumbuh besar dalam satu file sulit dicari dan sulit dipakai ulang. Seperti buku yang dibagi menjadi bab, kode dibagi menjadi modul: satu file untuk satu urusan.

```python
# utils.py
def sapa(nama):
    return f"Halo, {nama}"

if __name__ == "__main__":  # hanya jalan saat file dieksekusi langsung
    print(sapa("dunia"))
```

```python
# main.py
from utils import sapa     # ambil satu nama dari modul kita sendiri
import math                # modul bawaan Python
import numpy as np         # package dari luar, dipasang lewat pip
```

Baris `if __name__ == "__main__":` sering membingungkan. Setiap modul punya nama di variabel `__name__`. Saat file dijalankan langsung (`python utils.py`), namanya `"__main__"`. Saat file di-*import* dari file lain, namanya `"utils"`. Jadi blok itu adalah tempat kode uji coba yang tidak ikut jalan ketika modul dipakai orang lain.

::: tebak
```python
# utils.py
print("memuat utils")

def sapa(nama):
    return f"Halo, {nama}"

if __name__ == "__main__":
    print(sapa("dunia"))
```
? Saat `main.py` menjalankan `import utils`, apa yang tercetak?
- [x] memuat utils
- memuat utils, lalu Halo, dunia
- Tidak ada
Saat di-import, seluruh kode tingkat atas `utils.py` dijalankan sekali, jadi `print("memuat utils")` ikut jalan. Blok `if __name__ == "__main__"` dilewati karena nama modulnya sekarang `"utils"`, bukan `"__main__"`.
:::

### pip dan virtual environment

**PyPI** adalah perpustakaan raksasa berisi ratusan ribu package Python, dan `pip` adalah petugas yang mengambilkannya. Masalahnya, proyek A mungkin butuh pandas versi lama sementara proyek B butuh versi terbaru. **Virtual environment** menyelesaikannya: setiap proyek punya rak package sendiri.

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install numpy pandas
pip freeze > requirements.txt    # catat versi yang dipakai
pip install -r requirements.txt  # pasang ulang di komputer lain
```

Tambahkan `.venv/` ke `.gitignore`. Yang di-commit cukup `requirements.txt`, karena dari daftar itu siapa pun bisa membangun ulang lingkungan yang sama. Ini salah satu kebiasaan yang membedakan proyek yang bisa diulang orang lain dari proyek yang "hanya jalan di laptopku".

::: rangkuman
- Modul adalah satu file, package adalah folder modul; `import` memakai kode dari file lain.
- Kode di bawah `if __name__ == "__main__":` hanya jalan saat file dieksekusi langsung.
- Satu proyek, satu virtual environment; commit `requirements.txt`, bukan folder `.venv`.
:::

## Latihan

1. Tulis fungsi `frekuensi_kata(teks)` yang mengembalikan dict jumlah tiap kata (huruf kecil, tanpa tanda baca).
2. Ubah ke satu baris dengan comprehension: daftar kuadrat dari bilangan ganjil 1 sampai 20.
3. Buat class `Keranjang` dengan method `tambah(item, harga)` dan property `total`.
4. Tulis generator `fibonacci()` tak terhingga, lalu ambil 10 nilai pertama dengan `itertools.islice`.
5. Bungkus pembacaan sebuah file CSV dengan `try/except` yang menangani file tidak ada dan encoding salah.
6. Pisahkan jawaban nomor 1 sampai 5 ke modul sendiri dan impor dari `main.py`.

Kalau bisa mengerjakan semuanya tanpa melihat buku ini, langkah-langkah Python di checklist layak dicentang.
