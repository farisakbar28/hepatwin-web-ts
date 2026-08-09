import type { HotspotIntensity, SimulationResponse, VisualColor, BlinkingSpeed } from '../../types';

// Nilai segmen Couinaud yang valid sesuai response backend (schemas.py + simulation_orchestrator.py).
export const ALL_SEGMENTS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'] as const;

/** Warna hotspot dari field `visual_color` backend. */
export const VISUAL_COLORS: Record<VisualColor, string> = {
  green: '#5DCAA5',
  yellow: '#EF9F27',
  red: '#E24B4A',
};

/** Periode kedip per siklus dari field `blinking_speed` backend. null = tanpa animasi ("none"). */
export const BLINK_PERIOD_MS: Record<BlinkingSpeed, number | null> = {
  none: null,
  slow: 4000,
  fast: 1000,
};

/**
 * Pola cedera "Fallback_Diffuse" adalah nilai yang DIKIRIM backend saat tidak ada
 * monograf/pola spesifik (simulation_orchestrator.py:
 * `injury_pattern = compound.injury_pattern or "Fallback_Diffuse"`, schemas.py).
 * Pembeda jelas -> visual "evidence unavailable" redup.
 */
const FALLBACK_DIFFUSE_PATTERN = 'Fallback_Diffuse';

export interface SimulationVisualState {
  affectedSegments: string[];
  visualColor: VisualColor;
  blinkingSpeed: BlinkingSpeed;
  injuryPattern: string;
  /** Intensitas bukti lokalisasi dari backend (hotspot_intensity), dinormalisasi ke 'high'|'low'|'dim'. */
  hotspotIntensity: HotspotIntensity;
  /** Catatan netral backend saat pola cedera spesifik tak tersedia; null bila ada monograf. */
  evidenceNote: string | null;
  /** Semua 8 segmen masuk affected_segments (baik Mixed asli maupun fallback no-evidence). */
  isDiffuse: boolean;
  /** Sinyal backend lemah (evidence_note terisi / hotspot_intensity 'dim') -> redup + label. */
  isFallbackNoEvidence: boolean;
}

/**
 * Menurunkan state visual murni dari SimulationResponse (tanpa mock, tanpa tebakan).
 * Dipakai bersama oleh CouinaudLiverModel (hotspot) dan Canvas3DViewer (legend/label).
 *
 * Sumber kebenaran untuk status redup/difus adalah field eksplisit `evidence_note` /
 * `hotspot_intensity` / `hotspot_display_mode` dari Fusion Layer backend. Heuristik lama
 * (8 segmen + Fallback_Diffuse) hanya dipakai bila backend lama tidak mengirim field
 * tersebut sama sekali (backward-compatible).
 */
export function deriveSimulationVisual(simulationResult: SimulationResponse | null): SimulationVisualState {
  if (!simulationResult) {
    return {
      affectedSegments: [],
      visualColor: 'green',
      blinkingSpeed: 'none',
      injuryPattern: '',
      hotspotIntensity: 'high',
      evidenceNote: null,
      isDiffuse: false,
      isFallbackNoEvidence: false,
    };
  }

  const affectedSegments = simulationResult.affected_segments ?? [];
  const injuryPattern = simulationResult.injury_pattern ?? '';
  // Sinyal eksplisit dari lookup DB backend master (simulation_orchestrator).
  const evidenceNote = simulationResult.evidence_note ?? null;
  const rawIntensity = simulationResult.hotspot_intensity;
  const displayMode = simulationResult.hotspot_display_mode;

  const hasAllEightSegments = affectedSegments.length === ALL_SEGMENTS.length;

  // Normalisasi: nilai tak dikenal (backend lama / enum baru) -> 'high' (tidak redup).
  const hotspotIntensity: HotspotIntensity =
    rawIntensity === 'high' || rawIntensity === 'low' || rawIntensity === 'dim'
      ? rawIntensity
      : 'high';

  // Sumber kebenaran = sinyal backend. Heuristik hanya untuk backend tanpa field F4.
  const f4SignalsPresent = evidenceNote !== null || rawIntensity !== undefined || displayMode !== undefined;
  const isFallbackNoEvidence =
    evidenceNote !== null ||
    hotspotIntensity === 'dim' ||
    (!f4SignalsPresent && hasAllEightSegments && injuryPattern === FALLBACK_DIFFUSE_PATTERN);

  // "diffuse" (backend) = seluruh 8 segmen menyala; fallback ke heuristik bila field absen.
  const isDiffuse = displayMode === 'diffuse' || (displayMode === undefined && hasAllEightSegments);

  return {
    affectedSegments,
    visualColor: simulationResult.visual_color,
    blinkingSpeed: simulationResult.blinking_speed,
    injuryPattern,
    hotspotIntensity,
    evidenceNote,
    isDiffuse,
    isFallbackNoEvidence,
  };
}
