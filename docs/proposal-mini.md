# Proposal Mini — Capstone Project TBO

> Isi/lengkapi dokumen ini sesuai identitas Anda sebelum dikumpulkan (maks. 5 halaman jika dikonversi ke PDF).

## 1. Identitas
- Nama:
- NIM:
- Domain rencana: `https://[nim-atau-nama].my.id`

## 2. Rancangan Sistem
Aplikasi web terintegrasi (Next.js + React + Tailwind CSS) dengan 4 modul yang dapat diakses melalui navigasi tab:

1. **Finite State Automata** — simulator DFA/NFA generik (definisi mesin bebas oleh pengguna), konversi NFA→DFA (subset construction), simulasi Moore & Mealy Machine.
2. **Regular Expression** — parser regex (`| * + ? ()`), konversi ke NFA via Thompson's Construction, pengujian pencocokan string, dan tampilan grammar reguler (Tipe 3) yang setara.
3. **Pushdown Automata & CFG** — penerimaan CFG bebas dari pengguna, pengenalan string menggunakan algoritma Earley (setara PDA non-deterministik, mendukung grammar rekursif-kiri), derivasi leftmost, dan visualisasi pohon penurunan.
4. **Hierarki Chomsky & CNF** — klasifikasi grammar ke dalam Tipe 0–3, serta konversi CFG ke Chomsky Normal Form melalui 5 tahap standar (START, DEL, UNIT, TERM, BIN) dengan log setiap langkah.

## 3. Diagram State / Grammar (contoh)
Lihat halaman masing-masing modul untuk visualisasi otomatis (SVG) dari mesin/grammar yang didefinisikan pengguna.

## 4. Tech Stack
- Frontend & backend: Next.js 16 (App Router), React 19
- Styling: Tailwind CSS 4
- Algoritma inti: JavaScript murni (lib/fsa.js, lib/regexEngine.js, lib/cfgEngine.js, lib/chomskyEngine.js) — tanpa dependensi eksternal untuk logika automata, agar mudah diverifikasi/diuji.
- Testing: Node.js built-in test runner (`node --test`)
- Deploy: Vercel + custom domain `.my.id`

## 5. Rencana Deploy
1. Push repositori ke GitHub (publik).
2. Import project ke Vercel, deploy otomatis dari branch `main`.
3. Daftarkan domain `.my.id` (mis. via is.my.id), arahkan DNS (CNAME/A record) ke Vercel, aktifkan HTTPS otomatis.
4. Verifikasi seluruh modul dapat diakses publik tanpa login.
