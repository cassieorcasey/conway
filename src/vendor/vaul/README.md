# Vaul (salinan)

Salinan kode sumber [Vaul](https://github.com/emilkowalski/vaul) dari commit `3e97aac` (lisensi MIT, lihat `LICENSE`).

Kenapa disalin, bukan dipasang dari npm: rilis terakhir di npm (1.1.2) tidak meneruskan `modal={false}` ke Radix Dialog.
Akibatnya panel non-modal tetap memasang `pointer-events: none` di `body`, sehingga peta di belakang panel tidak bisa
diklik dan lapisan lain (pembaca materi) tidak menerima event mouse. Perbaikannya sudah ada di `main` Vaul tapi tidak
pernah dirilis karena proyeknya dalam mode maintenance. Kode di folder ini tidak diubah dari commit tersebut.
