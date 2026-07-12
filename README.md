# Automata Toolkit — Capstone Project TBO

Aplikasi web terintegrasi untuk mata kuliah **Teori Bahasa dan Otomata**, mencakup 4 modul wajib: Finite State Automata, Regular Expression, Pushdown Automata & CFG, serta Hierarki Chomsky & Chomsky Normal Form.

- **Live demo:** https://[isi-domain-anda].my.id 
- **Video demo (YouTube):** [isi-link-video] 

## Fitur per Modul

### 1. Finite State Automata (`/fsa`)
- Definisikan mesin bebas: DFA, NFA, Moore Machine, atau Mealy Machine (states, alfabet, δ, q0, F/output ditentukan pengguna).
- Simulasi string dengan trace transisi step-by-step.
- Konversi NFA → DFA (subset construction), lengkap dengan pemetaan subset state.
- Visualisasi diagram transisi (SVG, otomatis).

### 2. Regular Expression (`/regex`)
- Input regex bebas: union `|`, kleene star `*`, one-or-more `+`, optional `?`, grouping `()`.
- Konversi ke NFA menggunakan Thompson's Construction.
- Uji kecocokan string terhadap pola.
- Menampilkan grammar reguler (Tipe 3, right-linear) yang setara dengan NFA hasil konversi.

### 3. Pushdown Automata & CFG (`/cfg`)
- Definisikan CFG bebas (mendukung grammar rekursif-kiri, ambigu, dan produksi-ε).
- Pengenalan string menggunakan algoritma Earley (setara kemampuan PDA non-deterministik untuk CFG umum).
- Menampilkan derivasi leftmost step-by-step.
- Visualisasi pohon penurunan (parse tree) secara grafis (SVG).

### 4. Hierarki Chomsky & CNF (`/chomsky`)
- Klasifikasi grammar ke dalam hierarki Chomsky (Tipe 2 / Tipe 3) berdasarkan bentuk produksi.
- Konversi CFG ke Chomsky Normal Form melalui 5 tahap standar: **START → DEL (eliminasi ε) → UNIT (eliminasi produksi unit) → TERM (isolasi terminal) → BIN (biner-kan produksi panjang)**, dengan log grammar pada setiap tahap.
- Visualisasi posisi grammar dalam hierarki Tipe 0–3.

## Tech Stack
Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · JavaScript (algoritma automata ditulis manual tanpa library eksternal, lihat folder `lib/`)

## Struktur Folder
```
app/            → halaman & komponen UI (Next.js App Router)
  fsa/          → Modul 1
  regex/        → Modul 2
  cfg/          → Modul 3
  chomsky/      → Modul 4
  components/   → komponen bersama (Nav, StateDiagram, TreeDiagram)
lib/            → engine/algoritma inti tiap modul (murni JS, dapat diuji terpisah)
docs/           → proposal & dokumen pendukung laporan
tests/          → automated test (node --test)
```

## Cara Instalasi Lokal
```bash
npm install
npm run dev
# buka http://localhost:3000
```

Menjalankan test:
```bash
node --test tests/engine.test.mjs
```

Build produksi:
```bash
npm run build && npm start
```

## Deploy ke Domain `.my.id`
1. Push repo ini ke GitHub (publik).
2. Import ke [Vercel](https://vercel.com) → Deploy (framework terdeteksi otomatis: Next.js).
3. Daftarkan domain gratis di [is.my.id](https://is.my.id) atau registrar `.my.id` lainnya.
4. Di dashboard Vercel → Project → Settings → Domains, tambahkan domain `.my.id` Anda dan ikuti instruksi DNS (biasanya CNAME ke `cname.vercel-dns.com`).
5. Tunggu propagasi DNS, HTTPS akan aktif otomatis via Vercel.

## Penggunaan AI Generatif
_(Lengkapi bagian ini sesuai aturan integritas akademik: tools yang dipakai, bagian mana yang dibantu AI, dan bagaimana Anda memahami/memodifikasi hasilnya.)_

## Lisensi
Tugas akademik — Capstone Project Individu, Teori Bahasa dan Otomata, Semester Genap 2025/2026.
