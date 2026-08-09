import type { SimulationResponse, VisualColor, BlinkingSpeed } from '../../types';

// Nilai segmen Couinaud yang valid sesuai response backend (schemas.py + simulation_orchestrator.py).
export const ALL_SEGMENTS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'] as const;

/**
 * Koreksi #2 (KONFIRMASI USER, tanpa verifikasi ulang):
 * Warna hotspot dari field `visual_color` backend.
 */
export const VISUAL_COLORS: Record<VisualColor, string> = {
  green: '#5DCAA5',
  yellow: '#EF9F27',
  red: '#E24B4A',
};

/**
 * Koreksi #2 (KONFIRMASI USER, tanpa verifikasi ulang):
 * Periode kedip per siklus dari field `blinking_speed` backend.
 * null = tidak ada animasi ("none").
 */
export const BLINK_PERIOD_MS: Record<BlinkingSpeed, number | null> = {
  none: null,
  slow: 4000,
  fast: 1000,
};

/**
 * Koreksi #1: pola cedera "Fallback_Diffuse" adalah nilai yang DIKIRIM backend
 * saat tidak ada monograf/pola spesifik (simulation_orchestrator.py:
 * `injury_pattern = compound.injury_pattern or "Fallback_Diffuse"`, schemas.py).
 * Pembedanya JELAS dan tidak ambigu -> visual "evidence unavailable" redup.
 */
export const FALLBACK_DIFFUSE_PATTERN = 'Fallback_Diffuse';

export interface SimulationVisualState {
  affectedSegments: string[];
  visualColor: VisualColor;
  blinkingSpeed: BlinkingSpeed;
  injuryPattern: string;
  /** Semua 8 segmen masuk affected_segments (baik Mixed asli maupun fallback no-evidence). */
  isDiffuse: boolean;
  /** 8 segmen + injury_pattern === Fallback_Diffuse -> redup + label "evidence unavailable". */
  isFallbackNoEvidence: boolean;
}

/**
 * Menurunkan state visual murni dari SimulationResponse (tanpa mock, tanpa tebakan).
 * Dipakai bersama oleh CouinaudLiverModel (hotspot) dan Canvas3DViewer (legend/label).
 */
export function deriveSimulationVisual(simulationResult: SimulationResponse | null): SimulationVisualState {
  if (!simulationResult) {
    return {
      affectedSegments: [],
      visualColor: 'green',
      blinkingSpeed: 'none',
      injuryPattern: '',
      isDiffuse: false,
      isFallbackNoEvidence: false,
    };
  }

  const affectedSegments = simulationResult.affected_segments ?? [];
  const injuryPattern = simulationResult.injury_pattern ?? '';
  // R-07: logika lama yang mengecek string 'ALL_DIFFUSE' (backend TIDAK pernah kirim) DIHAPUS TOTAL.
  // Backend kirim 8 segmen hanya pada 2 skenario: pola Mixed asli (segment_list lengkap) atau
  // fallback no-monograf (segment_list kosong -> backend kirim semua 8 segmen).
  const hasAllEightSegments = affectedSegments.length === ALL_SEGMENTS.length;

  return {
    affectedSegments,
    visualColor: simulationResult.visual_color,
    blinkingSpeed: simulationResult.blinking_speed,
    injuryPattern,
    isDiffuse: hasAllEightSegments,
    isFallbackNoEvidence: hasAllEightSegments && injuryPattern === FALLBACK_DIFFUSE_PATTERN,
  };
}
