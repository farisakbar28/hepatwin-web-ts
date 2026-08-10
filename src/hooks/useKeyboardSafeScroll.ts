import { useEffect } from 'react';

const EDITABLE_SELECTOR = 'input, select, textarea';

/**
 * Mencegah keyboard virtual mobile/tablet menutupi kolom input yang sedang
 * difokuskan (masalah umum: header sticky + viewport yang menyusut saat
 * keyboard muncul, sehingga input tertutup dan tidak bisa dilihat pengguna).
 *
 * Strategi:
 * 1. Lacak tinggi visual viewport TERTINGGI yang pernah teramati sebagai
 *    baseline — bekerja di iOS (innerHeight tidak berubah) maupun Android
 *    (innerHeight ikut menyusut saat keyboard muncul).
 * 2. Saat visual viewport menyusut > 100px (indikasi keyboard terbuka),
 *    selisih tingginya diekspos sebagai `--kb-offset` (dipakai body padding
 *    bawah agar halaman bisa di-scroll sehingga input naik di atas keyboard)
 *    lalu scroll input aktif ke tengah viewport yang tersisa.
 * 3. Saat fokus terjadi, input di-scroll minimal (`block: 'nearest'`) agar
 *    tidak ada lompatan scroll yang mengganggu di desktop.
 *
 * Hanya aktif di perangkat sentuh (maxTouchPoints > 0), sehingga resize
 * window desktop biasa tidak pernah disalahartikan sebagai keyboard.
 */
export function useKeyboardSafeScroll(): void {
  useEffect(() => {
    const isTouchDevice =
      typeof navigator !== 'undefined' &&
      (navigator.maxTouchPoints > 0 || 'ontouchstart' in window);
    if (!isTouchDevice) return;

    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    let baseline = visualViewport.height;

    const scrollActiveEditableIntoView = (block: ScrollLogicalPosition) => {
      const el = document.activeElement;
      if (!(el instanceof HTMLElement) || !el.matches(EDITABLE_SELECTOR)) return;
      // 'auto' menghindari tabrakan dengan animasi scroll bawaan browser.
      el.scrollIntoView({ block, behavior: 'auto' });
    };

    const applyOffset = (offsetPx: number) => {
      document.documentElement.style.setProperty(
        '--kb-offset',
        `${Math.max(0, Math.round(offsetPx))}px`,
      );
    };

    // Debounce singkat: event visualViewport berderas selama animasi keyboard,
    // menghindari scrollIntoView yang saling bertabrakan dengan scroll bawaan.
    let resizeTimer: number | undefined;
    const handleViewportChange = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        baseline = Math.max(baseline, visualViewport.height);
        const lostHeight = baseline - visualViewport.height;
        if (lostHeight > 100) {
          // Keyboard terbuka: sisakan ruang scroll + naikkan input ke tengah.
          applyOffset(lostHeight);
          scrollActiveEditableIntoView('center');
        } else {
          applyOffset(0);
        }
      }, 60);
    };

    let focusTimer: number | undefined;
    const handleFocusIn = () => {
      // Sedikit jeda agar scroll bawaan browser selesai lebih dulu.
      window.clearTimeout(focusTimer);
      focusTimer = window.setTimeout(() => scrollActiveEditableIntoView('nearest'), 0);
    };

    visualViewport.addEventListener('resize', handleViewportChange);
    visualViewport.addEventListener('scroll', handleViewportChange);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      visualViewport.removeEventListener('resize', handleViewportChange);
      visualViewport.removeEventListener('scroll', handleViewportChange);
      document.removeEventListener('focusin', handleFocusIn);
      window.clearTimeout(resizeTimer);
      window.clearTimeout(focusTimer);
      applyOffset(0);
    };
  }, []);
}
