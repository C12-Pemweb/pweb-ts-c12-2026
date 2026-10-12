# MeloCare — Antrian Rumah Sakit

Website praktikum PWeb Modul 3, dibuat dengan HTML, CSS, dan TypeScript native tanpa framework.

## Cara menjalankan

1. `npm install`
2. `npm run build` (atau `npm run watch` untuk kompilasi otomatis)
3. Buka `login.html` menggunakan VS Code Live Server.

## Struktur proyek

- `login.html`: form login
- `index.html`: dashboard admin (auth/role guard, CRUD jenis antrian, reset antrian, tiket manual)
- `style.css`: desain pink native CSS
- `src/login.ts`: autentikasi TypeScript
- `src/index.ts`: logika dashboard admin (TypeScript)
- `dist/`: JavaScript hasil kompilasi (di-commit agar bisa dijalankan Live Server setelah clone)

## Kontrak sesi untuk kerja kelompok

Setelah login sukses, tersimpan di `localStorage`:

- `accessToken` — token dari DummyJSON
- `role` — `admin` / `moderator` / `user`
- `firstName` — nama depan dari API

Redirect `admin` dan `moderator` menuju `index.html`, `user` menuju `operator.html`.

Untuk logout di halaman lain: hapus **hanya** `accessToken`, `role`, `firstName` lalu redirect ke `login.html`. Jangan panggil `localStorage.clear()` karena data antrian juga disimpan di sana.

## Kontrak data antrian (Local Storage)

- `melo:jenis` — master jenis antrian, array of `{ kode, nama, aktif, nomorBerikutnya }`.
  `kode` tepat satu huruf kapital; `nomorBerikutnya` adalah counter tiket per jenis dan dipakai bersama oleh tiket manual (dashboard) maupun mandiri (ambil-antrian) agar nomor tidak pernah ganda.
- `melo:tiket` — daftar tiket, array of `{ id, jenisKode, nomor, label, prioritas, status, sumber, dibuatPada }`.
  `label` berformat `Kode-XXX` (mis. `A-001`), `prioritas`: `normal | lansia | disabilitas | vip`, `status`: `menunggu | dipanggil | selesai | dilewati`, `sumber`: `manual | mandiri`.

Catatan untuk halaman lain:

- Urutan prioritas memanggil tiket (operator): VIP → Disabilitas → Lansia → Normal.
- Jenis dengan `aktif: false` tidak boleh dipilih saat pengambilan tiket baru.
- Refresh otomatis: lakukan polling `melo:tiket` / `melo:jenis` setiap 2–3 detik (event `storage` hanya aktif antar-tab, tidak untuk perubahan di tab yang sama).
- Reset Antrian dari dashboard = mengosongkan `melo:tiket` dan mengembalikan semua `nomorBerikutnya` ke 0.

Halaman `operator.html`, `ambil-antrian.html`, dan `layar.html` akan dibuat oleh rekan kelompok.

Catatan: Local Storage + dummy API adalah mekanisme untuk tugas praktikum, **bukan** desain keamanan yang memadai untuk sistem rumah sakit sungguhan.
