# HepaTwin Web Frontend

Antarmuka web HepaTwin: dashboard interaktif dengan visualisasi 3D hati (React Three Fiber/Three.js) yang merespons real-time terhadap data simulasi PK/PD dan skor risiko AI dari backend. 
Aplikasi ini dikembangkan untuk kompetisi GEMASTIK XVIII 2026.

## Arsitektur Visual 3D
Frontend ini menonjolkan rendering model anatomi 3D hati secara interaktif yang memiliki fitur:
- **Custom Shader Heatmap**: Menghasilkan transisi warna radial pada permukaan 3D liver sesuai tingkat keparahan simulasi (Macro Generic).
- **Proyeksi Hotspot Murni**: Hotspot *Bullseye* (titik padat dan cincin animasi) dilukis secara langsung (Fragment Shader GLSL) ke dalam model 3D berdasarkan perhitungan *Raycaster* dinamis. Hal ini memastikan tampilan stiker peringatan UI terhampar organik mengikuti permukaan tanpa ada celah pelapisan (Z-fighting/Gap).
- **Smooth GSAP Camera**: Transisi kamera makro/mikro yang halus ketika berinteraksi dengan titik hotspot zonal spesifik seperti Zone 3 (Centrilobular) dan Portal.
- **State Management Terpusat**: Seluruh simulasi warna, keparahan (severity), dan pola letak tersinkronisasi erat via Zustand (`store.ts`).

## Tech Stack
- React 19 + TypeScript + Vite
- Tailwind CSS
- React Three Fiber (`@react-three/fiber`) & `@react-three/drei`
- GSAP & Three.js
- Axios & Zustand

## Setup & Running
```bash
npm install
npm run dev
```

## Build untuk Produksi
```bash
npm run build
```
