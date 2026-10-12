# MeloCare — Antrian Rumah Sakit

Website praktikum PWeb Modul 3, dibuat dengan HTML, CSS, dan TypeScript native tanpa framework.

## Cara menjalankan

1. `npm install`
2. `npm run build` (atau `npm run watch` untuk kompilasi otomatis)
3. Buka `login.html` menggunakan VS Code Live Server.

## Struktur awal

- `login.html`: form login
- `style.css`: desain pink native CSS
- `src/login.ts`: autentikasi TypeScript
- `dist/login.js`: JavaScript hasil kompilasi (commit agar bisa dijalankan Live Server setelah clone)

## Kontrak sesi untuk kerja kelompok

Setelah login sukses, tersimpan di `localStorage`:

- `accessToken` — token dari DummyJSON
- `role` — `admin` / `moderator` / `user`
- `firstName` — nama depan dari API

Redirect `admin` dan `moderator` menuju `index.html`, `user` menuju `operator.html`.

Untuk logout di halaman lain: hapus **hanya** `accessToken`, `role`, `firstName` lalu redirect ke `login.html`. Jangan panggil `localStorage.clear()` karena data antrian juga disimpan di sana.

Halaman `index.html`, `operator.html`, `ambil-antrian.html`, dan `layar.html` akan dibuat oleh rekan kelompok.

Catatan: Local Storage + dummy API adalah mekanisme untuk tugas praktikum, **bukan** desain keamanan yang memadai untuk sistem rumah sakit sungguhan.
