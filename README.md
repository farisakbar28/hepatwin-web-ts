# HepaTwin — Web Frontend

Antarmuka web interaktif Sistem Pendukung Keputusan (Decision Support System / DSS) praklinis *in-silico* **HepaTwin** untuk menyimulasikan, memprediksi, dan memvisualisasikan risiko hepatotoksisitas obat (Drug-Induced Liver Injury / DILI) pada anatomi 3D hati berbasis 8 Segmen Couinaud (I–VIII).

Dikembangkan untuk **GEMASTIK XIX / 2026** (Kompetisi VIII: Pengembangan Perangkat Lunak) oleh Tim Universitas Pendidikan Nasional, Denpasar.

---

## 🌟 Fitur Utama

1. **Pencarian Autocomplete Senyawa Terkurasi (Zero-Mock, live API):**
   - Data senyawa `is_simulatable = TRUE` dari kurasi DILIrank 2.0 via backend (`GET /api/v1/compounds/autocomplete?q={query}&limit={n}`).
   - Debouncing 300 ms, navigasi keyboard, cache TTL 1 jam, dan `AbortController` untuk pembatalan request.

2. **Guard Ukuran Molekul (preventif, sebelum request dikirim):**
   - Saat tombol **"Simulasikan Toksisitas"** ditekan, bobot molekul senyawa dicek via `GET /api/v1/compounds/{id}` (dengan cache in-memory + ETag backend).
   - Senyawa bermolekul sangat besar (peptida / obat biologik, > 1500 Da) **tidak dikirim** ke backend — pengguna mendapat pesan ramah dan backend live terlindungi dari beban yang tidak sanggup diproses.
   - Error server untuk senyawa besar dipetakan ke pesan ramah yang sama, konsisten di panel kontrol dan banner dashboard.

3. **Visualisasi Anatomi 3D Couinaud Interaktif:**
   - Render WebGL anatomi hati 8 Segmen Couinaud (`.glb`) menggunakan **React Three Fiber** & **Three.js**.
   - Blinking Hotspot overlay bola prosedural (warna hijau/kuning/merah, kecepatan none/slow/fast, intensitas high/low/dim) berdasarkan keputusan Lapisan Fusi backend.
   - Status "evidence unavailable" (hotspot redup) mengikuti sinyal eksplisit backend (`evidence_note` / `hotspot_intensity` / `hotspot_display_mode`), dengan heuristik lama sebagai fallback.
   - Label pemetaan segmen: *"Heuristik pedagogis (panduan visual, bukan lokasi klinis)"*.

4. **Dasbor Tiga Panel Terintegrasi:**
   - **Panel Kiri:** form input senyawa (INN), dosis bolus tunggal (mg), dan kovariat pasien (usia, jenis kelamin L/P, berat badan, tinggi badan) — rentang validasi sama dengan backend.
   - **Panel Kanan:** kanvas 3D WebGL (rotasi 360°, zoom, pan, reset view, tooltip segmen mengikuti kursor).
   - **Panel Bawah:** kartu hasil (probabilitas DILI, prioritas, kategori paparan, pola cedera), kurva PBPK 24 jam, dan panel explainability SHAP (*toxicophore*).

5. **Kepatuhan Medical Disclaimer & CoU (PRD v2.3 & FDA CM&S):**
   - Modal disclaimer checklist 3 poin wajib sebelum simulasi; persetujuan tersimpan per sesi (tidak muncul ulang).
   - Footer disclaimer permanen; laporan ringkasan praklinis dapat diunduh sebagai PDF (`window.print()`).

6. **Error Handling Terpusat & Indikator Koneksi:**
   - `toAppApiError()` memetakan error 400/422/404/503/5xx/timeout/network ke pesan Bahasa Indonesia yang ramah (selaras dengan bentuk error Pydantic backend).
   - Indikator status koneksi backend real-time ("Terhubung ke Backend AI/PBPK" / "Backend tidak tersedia") via `GET /health`.

7. **Penanganan Cold Start Backend (Scale-to-Zero):**
   - Backend FastAPI Cloud free tier menidurkan instance saat idle (cold start 30–60 dtk pada request pertama). Semua request data memakai timeout longgar (≥ 60 dtk) sehingga request pertama tidak diputus sepihak oleh frontend; endpoint simulasi diberi kelonggaran ekstra (120 dtk).
   - Jika request berjalan > 5 detik, UI menampilkan pesan ramah **"Server sedang dibangunkan, mohon tunggu sebentar..."** (indikator koneksi, tombol simulasi, autocomplete, dan banner dashboard) — bukan spinner yang diam saja.
   - Health check memakai probe sadar cold start (`probeHealthWithRetries`): kegagalan mirip cold start (timeout / 5xx saat warmup) dicoba ulang dengan jeda lebih lama; kegagalan cepat (server mati / CORS) menyerah lebih cepat supaya status "Backend tidak tersedia" tidak menunggu terlalu lama.
   - Setiap kegagalan akhir menyediakan fallback UI **"Coba Lagi"** (tombol simulasi & autocomplete) yang mengulang aksi terakhir, bukan layar blank atau pesan teknis.
   - **Keep-alive dua lapis:**
     - **Sisi browser** (`src/hooks/useKeepAlive.ts`): ping `GET /health` setiap 5 menit + segera saat tab kembali terlihat, agar instance tetap hangat selama aplikasi terbuka.
     - **Sisi server** (`api/keep-alive.ts` + `vercel.json`): Vercel Cron Jobs memanggil serverless function `/api/keep-alive` yang mengetuk `/health` backend walau tidak ada browser yang membuka aplikasi. Jadwal default **sekali per hari** (`0 3 * * *` ≈ 11:00 WITA) agar patuh batasan plan Hobby (gratis) — menjamin backend setidaknya dibangunkan sekali sehari, tidak mati sepanjang hari. Pengguna plan **Pro** bisa mempercepat ke `*/5 * * * *` (lihat bagian *Vercel Cron Keep-Alive*).

---

## 🛠️ Stack Teknologi

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide React
- **3D Engine:** React Three Fiber (`@react-three/fiber`), `@react-three/drei`, Three.js, GSAP (animasi kamera)
- **State Management:** Zustand (`src/state/store.ts`)
- **Grafik & Visualisasi Data:** Recharts
- **HTTP Client:** Axios dengan mapping error terpusat (`toAppApiError`), timeout sadar cold start, dan probe health dengan retry (`probeHealthWithRetries`)
- **Hooks Kustom:** `useSlowRequestDetector` (deteksi request > 5 dtk), `useKeepAlive` (ping berkala ke `/health`)
- **Kualitas:** `tsc -b` (type-check) + oxlint

---

## ⚙️ Variabel Lingkungan (.env)

Buat file `.env` di root proyek (atau salin dari `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:8000
```

- Backend live saat ini: `https://hepatwin-backend-py.fastapicloud.dev` (terverifikasi aktif dan tersinkronisasi penuh dengan frontend).
- File `.env` **tidak di-commit** (lihat `.gitignore`); setiap environment (dev/preview/production) wajib mengeset `VITE_API_BASE_URL`.

---

## 🚀 Panduan Memulai (Setup & Running)

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Jalankan Mode Pengembangan
```bash
npm run dev
```
Buka browser pada alamat `http://localhost:5173`.

### 3. Build & Type-Check Produksi
```bash
npm run build
```
Hasil build statis dibuat di folder `dist/`.

### 4. Lint
```bash
npm run lint
```

---

## ☁️ Deploy ke Vercel

1. **Build preset:** Vite (build command `npm run build`, output direktori `dist/`).
2. **Environment Variables** di Vercel (Production + Preview):
   ```
   VITE_API_BASE_URL=https://hepatwin-backend-py.fastapicloud.dev
   ```
3. Backend CORS sudah terbuka (`*`) — tidak diperlukan konfigurasi tambahan.
4. Aplikasi adalah SPA satu halaman tanpa router — tidak perlu konfigurasi rewrites/redirects.
5. **(Opsional) Cron keep-alive** — lihat bagian *Vercel Cron Keep-Alive* di bawah.

---

## ⏰ Vercel Cron Keep-Alive (Backend Tetap Terjaga)

Repositori ini menyertakan dua file untuk menjaga backend FastAPI Cloud (scale-to-zero) agar setidaknya tidak tidur sepanjang hari (24/7 penuh hanya dengan plan Pro):

- `vercel.json` — mendaftarkan cron job yang memanggil `/api/keep-alive` sekali per hari (`0 3 * * *`), jadwal maksimal yang diizinkan plan Hobby (gratis).
- `api/keep-alive.ts` — serverless function ringan (tanpa dependency) yang melakukan HTTP GET ke `<VITE_API_BASE_URL>/health`, lalu merespons 200. Semantiknya *fire-and-forget*: cukup memicu cold start, tidak menunggu respons backend 30–60 dtk, sehingga tidak melanggar durasi eksekusi function.

### ⚠️ Batasan Plan Vercel & Jadwal Default

- **Hobby (gratis):** cron job **maksimal sekali per hari** — ekspresi yang lebih sering (mis. `*/5 * * * *`) akan **gagal saat deployment** dengan pesan *"Hobby accounts are limited to daily cron jobs"*. `vercel.json` memakai jadwal harian `0 3 * * *` (UTC; ≈ 11:00 WITA karena presisi Hobby ±59 menit) agar patuh. Tujuannya: memastikan backend setidaknya dibangunkan sekali sehari, bukan mati sepanjang hari. Kehangatan selama sesi pemakaian tetap ditangani keep-alive sisi browser + fallback UX (timeout 60 dtk, pesan cold start, tombol "Coba Lagi").
- **Pro:** cron dapat berjalan tiap menit. Ganti `"schedule"` di `vercel.json` menjadi `"*/5 * * * *"` untuk ping tiap 5 menit (kehangatan 24/7).

### Setup di Vercel

1. Pastikan `VITE_API_BASE_URL` diset di environment variables Vercel (Production). Serverless function membaca `process.env.VITE_API_BASE_URL` (bukan `import.meta.env`) dan memakai `https://hepatwin-backend-py.fastapicloud.dev` sebagai fallback bila kosong.
2. **(Disarankan)** Set `CRON_SECRET` (nilai acak bebas) di environment variables. Saat diset, Vercel mengirim header `Authorization: Bearer <CRON_SECRET>` dan fungsi menolak panggilan tanpa token tersebut — mencegah endpoint dipanggil orang lain.
3. Deploy seperti biasa (`git push`). Cron aktif otomatis setelah deployment berhasil.

### Uji manual

```bash
# Panggil endpoint keep-alive (hasil terlihat di Vercel Function Logs):
curl https://<project>.vercel.app/api/keep-alive
# → {"ok":true,"backendReachable":true,"checkedAt":"..."}
```

Untuk menjalankan function secara lokal, gunakan `npx vercel dev` (bukan `npm run dev`, karena `api/` hanya dijalankan oleh runtime Vercel).

---

## 📋 Kontrak Endpoint API Backend yang Terintegrasi

Backend FastAPI live: `https://hepatwin-backend-py.fastapicloud.dev` (repo `C:\My Project\hepatwin-backend-py`).

| Endpoint | Dipakai frontend untuk |
|---|---|
| `GET /health` | Indikator koneksi backend |
| `GET /api/v1/compounds/autocomplete?q={query}&limit={n}` | Pencarian autocomplete senyawa simulatable |
| `GET /api/v1/compounds/{hepatwin_id}` | Detail senyawa (bobot molekul) untuk guard ukuran molekul |
| `POST /api/v1/simulate` | Simulasi DILI (dosis + 4 kovariat → probabilitas DILI, prioritas, segmen Couinaud, kurva PBPK 24 jam, SHAP) |
| `GET /api/v1/pbpk/debug` | Diagnostik parameter PBPK (tidak dipakai frontend) |

---

## 📄 Lisensi & Disclaimer

HepaTwin dikembangkan murni sebagai instrumen triase praklinis *in-silico* untuk kebutuhan riset dan pendidikan farmakologi/toksikologi. **Bukan perangkat diagnosis klinis pasien, bukan rekomendasi terapi, dan tidak menggantikan uji laboratorium basah (in-vitro/in-vivo).**
