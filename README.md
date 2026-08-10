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

---

## 🛠️ Stack Teknologi

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide React
- **3D Engine:** React Three Fiber (`@react-three/fiber`), `@react-three/drei`, Three.js, GSAP (animasi kamera)
- **State Management:** Zustand (`src/state/store.ts`)
- **Grafik & Visualisasi Data:** Recharts
- **HTTP Client:** Axios dengan mapping error terpusat (`toAppApiError`)
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
