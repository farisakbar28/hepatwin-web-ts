/**
 * Serverless Function (Vercel) — Keep-Alive Backend.
 *
 * Dipanggil oleh Vercel Cron Jobs (lihat vercel.json) untuk mengetuk GET /health
 * backend FastAPI Cloud agar instance scale-to-zero tidak tidur. Jadwal default
 * sekali per hari ("0 3 * * *") agar patuh batasan plan Hobby Vercel (cron
 * maksimal 1×/hari); pengguna plan Pro dapat mempercepat interval cron-nya
 * menjadi tiap 5 menit.
 * Ini melengkapi keep-alive sisi browser (src/hooks/useKeepAlive.ts) yang hanya
 * aktif selama tab aplikasi terbuka — cron ini menjamin backend setidaknya
 * dibangunkan sekali sehari walau tidak ada browser yang membuka aplikasi.
 *
 * CATATAN PENTING:
 * - Serverless function TIDAK bisa memakai import.meta.env (Vite). URL backend
 *   dibaca dari process.env.VITE_API_BASE_URL — environment variable yang sama
 *   dengan yang sudah diset di Vercel untuk sisi client (lihat README).
 * - Semantik fire-and-forget: ping hanya perlu MEMICU cold start backend,
 *   bukan menunggu respons 30–60 detik. Timeout fetch pendek (8 dtk) dan fungsi
 *   selalu merespons 200 supaya Vercel tidak menganggap cron gagal. Request yang
 *   sudah terkirim cukup untuk membuat instance backend mulai menyala.
 * - Keamanan: bila environment variable CRON_SECRET diset di Vercel, platform
 *   mengirim header Authorization dan fungsi ini memverifikasinya.
 */
export default async function handler(
  req: { headers: Record<string, string | string[] | undefined> },
  res: { status: (code: number) => { json: (body: unknown) => void } },
): Promise<void> {
  // 1) Verifikasi pemicu cron (hanya dijalankan bila CRON_SECRET dikonfigurasi).
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${cronSecret}`) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }
  }

  // 2) Tentukan URL backend — fallback ke backend live agar fungsi tetap
  //    berfungsi walau environment variable belum diset.
  const rawBaseUrl = process.env.VITE_API_BASE_URL || 'https://hepatwin-backend-py.fastapicloud.dev';
  const baseUrl = rawBaseUrl.replace(/\/+$/, '');
  const healthUrl = `${baseUrl}/health`;

  // 3) Kirim ping dengan timeout pendek. `backendReachable` hanya untuk
  //    observasi di log; kegagalan (mis. cold start masih berlangsung) tidak
  //    dianggap error karena request tadi sudah membangunkan instance.
  let backendReachable = false;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(healthUrl, { signal: controller.signal });
    backendReachable = response.ok;
  } catch {
    backendReachable = false;
  } finally {
    clearTimeout(timeout);
  }

  res.status(200).json({ ok: true, backendReachable, checkedAt: new Date().toISOString() });
}
