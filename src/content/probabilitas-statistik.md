Catatan ini mengikuti tujuh langkah di checklist, ditambah mini-proyek penutup fase. Statistik adalah cara menarik kesimpulan dari data yang tidak lengkap dan berisik. Bagi data scientist, ini yang membedakan "angkanya naik" dari "angkanya naik dan itu bukan kebetulan".

```python
import numpy as np
from scipy import stats
```

## 1. Statistik deskriptif: mean, median, mode

::: intinya
Mean, median, dan mode adalah tiga cara meringkas "nilai tipikal". Untuk data miring seperti gaji, median lebih jujur karena tidak tertarik oleh nilai ekstrem.
:::

| Ukuran | Arti | Kapan dipakai |
|---|---|---|
| Mean | Rata-rata | Data simetris tanpa outlier ekstrem |
| Median | Nilai tengah setelah diurutkan | Data miring (*skewed*), misalnya gaji dan harga rumah |
| Mode | Nilai paling sering muncul | Data kategorikal |

```python
import statistics

gaji = [5, 6, 6, 7, 8, 9, 60]       # juta rupiah; satu orang direktur
print(statistics.mean(gaji))        # 14.428...  tertarik ke atas oleh 60
print(statistics.median(gaji))      # 7          lebih mewakili "orang biasa"
print(statistics.mode(gaji))        # 6
```

Kalau mean jauh lebih besar dari median, data miring ke kanan: ada nilai besar yang menarik rata-rata. Selalu laporkan keduanya untuk data seperti pendapatan atau waktu respons.

::: rangkuman
- Mean untuk data simetris, median untuk data miring, mode untuk kategori.
- Mean jauh di atas median berarti data miring ke kanan.
- Laporkan keduanya untuk pendapatan atau waktu respons.
:::

## 2. Varians dan standar deviasi

::: intinya
Varians dan standar deviasi mengukur seberapa tersebar data dari rata-ratanya. Untuk sampel, bagi dengan `n - 1`.
:::

Varians mengukur seberapa jauh data tersebar dari mean: rata-rata kuadrat selisih terhadap mean. Standar deviasi adalah akar varians, satuannya sama dengan data asli.

```python
x = np.array([2, 4, 4, 4, 5, 5, 7, 9])
print(x.var(), x.std())               # 4.0 2.0       populasi (bagi n)
print(x.var(ddof=1), x.std(ddof=1))   # 4.571... 2.138...   sampel (bagi n - 1)
```

Pakai `ddof=1` saat data adalah **sampel** dari populasi yang lebih besar (hampir selalu, di dunia nyata). Pembagi `n - 1` (koreksi Bessel) membuat estimasinya tidak bias. Hati-hati: NumPy default `ddof=0`, sedangkan pandas default `ddof=1`.

Untuk distribusi normal, aturan 68–95–99,7: sekitar 68% data berada dalam 1 standar deviasi dari mean, 95% dalam 2, dan 99,7% dalam 3. Jarak suatu nilai dari mean dalam satuan standar deviasi disebut **z-score**: `z = (x - mean) / std`.

::: rangkuman
- Standar deviasi = akar varians, satuannya sama dengan data.
- Sampel memakai `ddof=1`; NumPy default 0, pandas default 1.
- Aturan 68–95–99,7 dan z-score untuk distribusi normal.
:::

## 3. Distribusi probabilitas

::: intinya
Distribusi probabilitas menggambarkan peluang setiap kemungkinan hasil. Central Limit Theorem menjamin rata-rata banyak sampel mendekati normal, apa pun bentuk data aslinya.
:::

Distribusi menggambarkan peluang tiap kemungkinan hasil.

| Distribusi | Jenis | Contoh |
|---|---|---|
| Bernoulli | Diskret | Satu klik iklan: ya/tidak dengan peluang p |
| Binomial | Diskret | Jumlah klik dari n tayangan |
| Poisson | Diskret | Jumlah pesanan per jam |
| Uniform | Kontinu | Angka acak 0–1 |
| Normal | Kontinu | Tinggi badan, error pengukuran |
| Eksponensial | Kontinu | Waktu tunggu sampai kejadian berikutnya |

```python
print(stats.binom.pmf(3, n=10, p=0.2))      # P(tepat 3 sukses dari 10) ≈ 0.201
print(stats.norm.cdf(1.96))                  # P(Z ≤ 1.96) ≈ 0.975
print(stats.poisson.pmf(0, mu=4))           # P(0 pesanan | rata-rata 4) ≈ 0.018
```

**Central Limit Theorem (CLT)**: rata-rata dari banyak sampel acak akan terdistribusi mendekati normal, **apa pun** bentuk distribusi aslinya, selama sampelnya cukup besar. Inilah alasan uji z dan uji t bisa dipakai secara luas.

::: rangkuman
- Diskret: Bernoulli, Binomial, Poisson. Kontinu: Uniform, Normal, Eksponensial.
- Pilih distribusi sesuai proses yang menghasilkan data.
- CLT adalah alasan uji z dan uji t bisa dipakai luas.
:::

## 4. Teorema Bayes

::: intinya
Teorema Bayes memperbarui keyakinan setelah melihat bukti. Pelajaran terpentingnya: **base rate** sangat menentukan, sehingga tes yang akurat pun bisa sering salah untuk kejadian langka.
:::

```text
P(A | B) = P(B | A) · P(A) / P(B)
```

Teorema ini membalik arah peluang bersyarat: dari "peluang bukti jika hipotesis benar" ke "peluang hipotesis benar setelah melihat bukti".

Contoh klasik: penyakit diderita 1% populasi. Tesnya mendeteksi 99% orang sakit (sensitivitas), tapi memberi hasil positif palsu pada 5% orang sehat. Kalau hasil tesmu positif, berapa peluang kamu benar-benar sakit?

```python
p_sakit = 0.01
p_pos_jika_sakit = 0.99
p_pos_jika_sehat = 0.05

p_pos = p_pos_jika_sakit * p_sakit + p_pos_jika_sehat * (1 - p_sakit)
print(round(p_pos_jika_sakit * p_sakit / p_pos, 3))   # 0.167
```

Hanya sekitar 17%, karena orang sehat jauh lebih banyak sehingga positif palsunya mendominasi. Pelajaran untuk ML: **base rate** penting. Model deteksi penipuan dengan akurasi tinggi tetap bisa menghasilkan lebih banyak alarm palsu daripada penipuan sungguhan kalau penipuannya langka. Naive Bayes dan seluruh statistik Bayesian dibangun di atas rumus ini.

::: rangkuman
- `P(A|B) = P(B|A) · P(A) / P(B)`.
- Tes 99% akurat untuk penyakit 1% hanya memberi peluang sekitar 17% saat positif.
- Kejadian langka membuat alarm palsu mendominasi.
:::

## 5. Inferensi statistik

::: intinya
Inferensi menarik kesimpulan tentang populasi dari sampel, selalu dengan ketidakpastian. Standard error dan confidence interval mengukur seberapa presisi estimasimu.
:::

Inferensi adalah menarik kesimpulan tentang **populasi** dari **sampel**. Karena setiap sampel sedikit berbeda, estimasi selalu disertai ketidakpastian.

**Standard error** (SE) dari mean adalah `s / √n`: makin besar sampel, makin presisi estimasinya. Untuk menggandakan presisi, sampel harus empat kali lebih besar.

**Confidence interval (CI)** 95%: rentang yang, kalau prosedur pengambilan sampel diulang berkali-kali, akan memuat nilai sebenarnya pada 95% pengulangan.

```python
rng = np.random.default_rng(42)
sampel = rng.normal(loc=170, scale=8, size=50)   # tinggi badan 50 orang
mean, se = sampel.mean(), stats.sem(sampel)
lo, hi = stats.t.interval(0.95, df=len(sampel) - 1, loc=mean, scale=se)
print(f"{mean:.1f} cm, CI 95% [{lo:.1f}, {hi:.1f}]")
```

Yang **bukan** arti CI 95%: "ada peluang 95% nilai sebenarnya di rentang ini." Nilai sebenarnya tetap; yang acak adalah rentangnya.

::: rangkuman
- Standard error = `s / √n`; presisi dua kali lipat butuh sampel empat kali.
- CI 95%: prosedur yang memuat nilai sebenarnya pada 95% pengulangan.
- Nilai sebenarnya tetap; yang acak adalah rentangnya.
:::

## 6. Hypothesis testing: p-value, z-test, t-test

::: intinya
Uji hipotesis memeriksa apakah sebuah efek kemungkinan nyata atau kebetulan. P-value adalah peluang hasil seekstrem ini **jika tidak ada efek**, bukan peluang hipotesisnya benar.
:::

Langkah uji hipotesis:

1. Tetapkan **H0** (hipotesis nol, "tidak ada efek") dan **H1** (alternatif).
2. Pilih tingkat signifikansi **α**, biasanya 0,05, **sebelum** melihat data.
3. Hitung statistik uji dan **p-value**.
4. Jika p-value < α, tolak H0.

**P-value** adalah peluang mendapat hasil seekstrem ini (atau lebih) **jika H0 benar**. P-value bukan peluang H0 benar, dan bukan ukuran besar efek. Efek kecil yang tidak berarti secara bisnis bisa signifikan kalau sampelnya sangat besar.

| Uji | Kapan |
|---|---|
| z-test | Simpangan baku populasi diketahui atau sampel besar; uji proporsi |
| t-test satu sampel | Membandingkan rata-rata dengan nilai tertentu |
| t-test dua sampel (Welch) | Membandingkan rata-rata dua kelompok independen |
| t-test berpasangan | Pengukuran sebelum dan sesudah pada subjek yang sama |

```python
rng = np.random.default_rng(1)
lama = rng.normal(30, 5, 40)        # waktu proses (detik) dengan sistem lama
baru = rng.normal(27, 5, 40)        # sistem baru
t, p = stats.ttest_ind(baru, lama, equal_var=False)   # Welch, lebih aman
print(f"t = {t:.2f}, p = {p:.4f}")
```

Dua jenis kesalahan: **Tipe I** (positif palsu, menolak H0 yang benar; peluangnya α) dan **Tipe II** (negatif palsu, gagal mendeteksi efek nyata). **Power** = 1 − peluang Tipe II, biasanya ditargetkan 80%.

::: rangkuman
- Tetapkan H0, H1, dan α sebelum melihat data.
- z-test, t-test satu sampel, Welch, dan berpasangan untuk situasi berbeda.
- Signifikan tidak sama dengan penting; perhatikan Tipe I, Tipe II, dan power.
:::

## 7. A/B testing

::: intinya
A/B testing membandingkan dua versi pada pengguna yang dibagi acak, sehingga perbedaan yang signifikan bisa diatribusikan ke perubahan itu. Rancangan ditetapkan sebelum eksperimen dimulai.
:::

A/B testing adalah eksperimen terkontrol: pengguna dibagi **acak** ke versi A (kontrol) dan B (perlakuan), lalu metriknya dibandingkan. Karena pembagiannya acak, perbedaan yang signifikan bisa diatribusikan ke perubahan itu sendiri.

Rancang **sebelum** mulai:

- **Metrik utama** (satu saja, misalnya konversi) dan *guardrail* (metrik yang tidak boleh turun, misalnya pembatalan).
- **Minimum detectable effect (MDE)**: efek terkecil yang layak dideteksi.
- **Ukuran sampel** dan durasi, dari MDE, α, dan power.

```python
from scipy.stats import norm

def n_per_grup(p1, p2, alpha=0.05, power=0.8):
    z_a, z_b = norm.ppf(1 - alpha / 2), norm.ppf(power)
    return (z_a + z_b) ** 2 * (p1 * (1 - p1) + p2 * (1 - p2)) / (p2 - p1) ** 2

print(round(n_per_grup(0.05, 0.06)))     # ≈ 8155 pengguna per grup
```

Analisis hasil konversi dengan uji z dua proporsi:

```python
conv_a, n_a = 200, 4000      # 5,00%
conv_b, n_b = 250, 4000      # 6,25%
p_a, p_b = conv_a / n_a, conv_b / n_b
p_pool = (conv_a + conv_b) / (n_a + n_b)
se = np.sqrt(p_pool * (1 - p_pool) * (1 / n_a + 1 / n_b))
z = (p_b - p_a) / se
p_value = 2 * (1 - norm.cdf(abs(z)))
print(f"z = {z:.2f}, p = {p_value:.4f}")    # z ≈ 2.43, p ≈ 0.015
```

Kesalahan umum yang harus dihindari:

- **Mengintip lalu berhenti** saat p-value pertama kali di bawah 0,05. Ini menaikkan positif palsu jauh di atas 5%. Tentukan durasi di awal.
- **Banyak metrik sekaligus** tanpa koreksi: satu dari dua puluh metrik akan "signifikan" secara kebetulan.
- **Durasi terlalu pendek**: minimal satu siklus mingguan penuh, karena perilaku hari kerja dan akhir pekan berbeda.
- **Efek kebaruan**: pengguna mencoba fitur baru karena baru, lalu kembali ke kebiasaan lama.

::: rangkuman
- Satu metrik utama, guardrail, MDE, dan ukuran sampel ditentukan di awal.
- Analisis konversi dengan uji z dua proporsi.
- Jangan mengintip lalu berhenti; jalankan minimal satu siklus mingguan.
:::

## Mini-proyek Fase 2

::: intinya
Bangun regresi linear dari nol dengan dua cara, solusi tertutup dan gradient descent, supaya aljabar linear, kalkulus, dan statistik terasa menyatu dalam satu masalah.
:::

Implementasikan regresi linear tanpa pustaka ML, supaya aljabar linear, kalkulus, dan statistik terasa menyatu:

1. Buat data sintetis `y = 3x + 5 + derau` dengan NumPy.
2. Selesaikan dengan **solusi tertutup** (persamaan normal) dan dengan **gradient descent** buatanmu sendiri. Bandingkan koefisiennya, lalu plot kurva loss per iterasi.
3. Hitung **interval kepercayaan** untuk koefisien (rumus atau bootstrap) dan jelaskan artinya.
4. Tulis satu paragraf untuk orang non teknis: apa yang dipelajari model, dan seberapa yakin kamu.

Kerangka awalnya:

```python
import numpy as np

rng = np.random.default_rng(0)
x = rng.uniform(0, 10, 200)
y = 3 * x + 5 + rng.normal(0, 2, 200)
X = np.column_stack([np.ones_like(x), x])                 # kolom 1 untuk intersep

beta_tertutup = np.linalg.solve(X.T @ X, X.T @ y)          # persamaan normal

beta = np.zeros(2)
for _ in range(5000):
    gradien = 2 / len(y) * X.T @ (X @ beta - y)            # turunan MSE terhadap beta
    beta -= 0.01 * gradien
print(beta_tertutup.round(2), beta.round(2))               # keduanya mendekati [5, 3]
```

Tanda selesai: kamu bisa menjelaskan mengapa kedua cara memberi jawaban yang sama, dan apa yang terjadi jika laju belajar dibuat terlalu besar.

::: rangkuman
- Data sintetis `y = 3x + 5 + derau`.
- Bandingkan persamaan normal dengan gradient descent, plus interval kepercayaan.
- Jelaskan hasilnya kepada orang non teknis.
:::

## Latihan

1. Buat data gaji yang sangat miring, hitung mean dan median, lalu jelaskan mana yang kamu laporkan ke manajer dan kenapa.
2. Simulasikan CLT: ambil 1.000 kali rata-rata dari 30 angka distribusi eksponensial dan buat histogramnya.
3. Ubah contoh Bayes dengan prevalensi 10%. Bagaimana peluang sakit jika positif berubah?
4. Simulasikan 1.000 A/B test di mana A dan B sebenarnya sama. Berapa persen yang "signifikan" pada α = 0,05? Ulangi dengan mengintip setiap 100 pengguna.
5. Hitung ukuran sampel untuk mendeteksi kenaikan konversi dari 10% ke 11%.

Untuk intuisi, gunakan Seeing Theory dan playlist StatQuest di bagian sumber belajar.
