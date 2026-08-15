import { useEffect } from 'react';
import { useAppStore } from '../state/store';

/**
 * Jeda antar ping keep-alive (ms) ke endpoint /health agar instance backend
 * FastAPI Cloud (free tier, scale-to-zero) tidak tidur selama aplikasi terbuka.
 *
 * CATATAN:
 * - Ping ini hanya hidup selama tab/browser terbuka. Bila semua pengguna
 *   menutup tab, server tetap akan tidur dan pengunjung berikutnya tetap
 *   menanggung cold start. Pelengkap sisi server: Vercel Cron
 *   (api/keep-alive.ts + vercel.json) yang mengetuk /health — sekali per hari
 *   pada plan Hobby, atau tiap beberapa menit pada plan Pro.
 * - Bila idle timeout platform lebih pendek dari interval ini, turunkan nilai
 *   konstanta (mis. 4 * 60 * 1000) agar aman.
 */
export const KEEP_ALIVE_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Menjaga backend tetap hangat selama aplikasi terbuka:
 * - ping berkala setiap KEEP_ALIVE_INTERVAL_MS;
 * - ping segera saat tab kembali terlihat (server dibangunkan sebelum user
 *   berinteraksi, mis. setelah tab dibiarkan lama di background);
 * - probe memakai retry sadar cold start dari store dalam mode silent — tidak
 *   mem-flash status "Memeriksa koneksi..." di UI.
 */
export function useKeepAlive(): void {
  useEffect(() => {
    let inFlight = false;

    const ping = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        await useAppStore.getState().checkConnection({ silent: true });
      } finally {
        inFlight = false;
      }
    };

    const timer = window.setInterval(() => {
      void ping();
    }, KEEP_ALIVE_INTERVAL_MS);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void ping();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
}
