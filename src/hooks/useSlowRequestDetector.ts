import { useEffect, useRef, useState } from 'react';

/**
 * Mengembalikan `true` bila `active` sudah berlangsung lebih dari `thresholdMs`
 * (default 5 detik). Dipakai untuk mendeteksi request yang lebih lambat dari
 * biasanya — indikasi cold start backend scale-to-zero — agar UI bisa menampilkan
 * pesan informatif ("Server sedang dibangunkan...") alih-alih diam saja.
 */
export function useSlowRequestDetector(active: boolean, thresholdMs = 5000): boolean {
  const [isSlow, setIsSlow] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setIsSlow(false);
      return;
    }
    timerRef.current = window.setTimeout(() => setIsSlow(true), thresholdMs);
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [active, thresholdMs]);

  return isSlow;
}
