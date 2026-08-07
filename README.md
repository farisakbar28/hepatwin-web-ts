# HepaTwin — Web Frontend

Antarmuka web interaktif Sistem Pendukung Keputusan (Decision Support System / DSS) praklinis *in-silico* **HepaTwin** untuk menyimulasikan, memprediksi, dan memvisualisasikan risiko hepatotoksisitas obat (Drug-Induced Liver Injury / DILI) pada anatomi 3D hati berbasis 8 Segmen Couinaud (I–VIII).

Dikembangkan untuk **GEMASTIK XIX / 2026** (Kompetisi VIII: Pengembangan Perangkat Lunak) oleh Tim Universitas Pendidikan Nasional, Denpasar.

---

## 🌟 Fitur Utama (Frontend & Integrasi)

1. **Pencarian Autocomplete Senyawa Terkurasi (Zero-Mock):**
   - Mengambil data senyawa `is_simulatable = TRUE` dari 1.231 senyawa DILIrank 2.0 via backend (`GET /api/v1/compounds/search`).
   - Fitur pencarian dengan debouncing 300ms, keyboard navigation, dan fallback offline deterministik.

2. **Visualisasi Anatomi 3D Couinaud Interaktif:**
   - Render WebGL 3D Anatomi Hati 8 Segmen Couinaud (`.glb`) menggunakan **React Three Fiber** & **Three.js**.
   - Custom GLSL Heatmap Shader & Blinking Hotspot Overlay (Warna Hijau/Kuning/Merah & Kecepatan Kedip None/Slow/Fast) berdasarkan keputusan Lapisan Fusi backend.
   - Penandaan transparan `PEDAGOGICAL_HEURISTIC` (heuristik pedagogis makrovaskular, bukan lokalisasi histologis klinis).

3. **Dasbor Tiga Panel Terintegrasi:**
   - **Panel Kiri:** Form Input Senyawa (INN), Dosis Bolus Tunggal (mg), dan Kovariat Pasien (Usia, Jenis Kelamin L/P, Berat Badan, Tinggi Badan).
   - **Panel Kanan:** Kanvas 3D WebGL (OrbitControls, rotasi 360°, zoom, reset view).
   - **Panel Bawah:** Grafik Kurva Paparan Temporal $C_{\text{hati}}(t)$ vs $C_{\text{plasma}}(t)$ 24 jam & Visualisasi Explainability SHAP (*toxicophore highlighting*).

4. **Kepatuhan Medical Disclaimer & CoU (PRD v2.3 & FDA CM&S):**
   - Modal Disclaimer Checklist wajib 3 poin persetujuan sebelum simulasi dijalankan.
   - Footer note disclaimer permanen di bagian bawah dasbor.
   - Generasi Laporan Ringkasan Praklinis (PDF Download) setelah simulasi berhasil.

---

## 🛠️ Stack Teknologi

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide React
- **3D Engine:** React Three Fiber (`@react-three/fiber`), `@react-three/drei`, Three.js
- **State Management:** Zustand (`src/state/store.ts`)
- **Grafik & Visualisasi Data:** Recharts
- **HTTP Client & Error Handling:** Axios (terintegrasi dengan interceptor error & skema validasi Pydantic backend)

---

## ⚙️ Variabel Lingkungan (.env)

Buat file `.env` di root proyek (atau salin dari `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:8000
```

- Jika backend Railway/produksi di-deploy, ganti `VITE_API_BASE_URL` sesuai URL endpoint backend (misal `https://api.hepatwin.id`).

---

## 🚀 Panduan Memulai (Setup & Running)

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Jalankan Mode Pengembangan (Development)
```bash
npm run dev
```
Buka browser pada alamat `http://localhost:5173`.

### 3. Build & Type-Check Produksi
```bash
npm run build
```
Hasil build statis akan dibuat di folder `dist/`.

---

## 📋 Kontrak Endpoint API Backend yang Terintegrasi

Frontend terintegrasi penuh dengan backend FastAPI (`C:\My Project\hepatwin-backend-py`):

1. **`GET /api/v1/health`** — Pemeriksaan status kesehatan backend & engine AI/PBPK.
2. **`GET /api/v1/compounds/search?q={query}`** — Kueri autocomplete 1.231 senyawa simulatable DILIrank 2.0.
3. **`POST /api/v1/simulate`** — Mengirim payload dosis, senyawa, & 4 kovariat alometrik; menerima $P_{\text{DILI}}$, visual color/blinking, segmen Couinaud, curve time series 24j, dan SHAP.
4. **`GET /api/v1/pbpk/debug`** — Endpoint debug parameter alometrik PBPK ($V_L, Q_L, Cl, \%BF, K_{P,R}, \text{exposure\_index}$).

---

## 📄 Lisensi & Disclaimer

HepaTwin dikembangkan murni sebagai instrumen triase praklinis *in-silico* untuk kebutuhan riset dan pendidikan farmakologi/toksikologi. **Bukan perangkat diagnosis klinis pasien, bukan rekomendasi terapi, dan tidak menggantikan uji laboratorium basah (in-vitro/in-vivo).**
