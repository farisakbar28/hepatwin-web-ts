// HepaTwin — Label user-facing terpusat (lapisan presentasi SAJA).
//
// - TIDAK mengubah kontrak API/type: nama field backend (dili_score,
//   exposure_index, segment_mapping_type, ...) tetap dipakai apa adanya.
// - Semua nilai mentah dari backend dipetakan ke label Bahasa Indonesia /
//   internasional yang aman di sini (satu sumber kebenaran).
// - Rujukan utama: frasa user-facing PRD v2.3 yang sudah divalidasi tim
//   (termasuk pakar Farmasi) — §8.2, §8.3, §9.3, §11.2.A.

/**
 * Helper: tampilkan label bila nilai dikenal; fallback ke nilai mentah bila
 * backend mengirim nilai enum baru yang belum terpetakan (UI tidak pernah
 * blank / crash karena nilai tak dikenal).
 */
export function labelOrRaw(map: Record<string, string>, value: string | null | undefined): string {
  if (value == null) return '';
  return map[value] ?? value;
}

/** Prioritas AI — frasa PRD §8.3 (bukan "Aman/Berbahaya/Kritis", bukan "Risiko" polos). */
export const riskPriorityLabel: Record<string, string> = {
  low: 'Prioritas rendah in-silico',
  medium: 'Prioritas sedang in-silico',
  high: 'Prioritas tinggi untuk kajian lanjut',
};

/** Kategori paparan — keputusan final user (A9+A10): kualifikasi "in-silico"
 *  WAJIB agar tidak terdengar seperti paparan klinis (rule 2 plan). */
export const exposureCategoryLabel: Record<string, string> = {
  LOW_EXPOSURE: 'Paparan rendah (in-silico)',
  MODERATE_EXPOSURE: 'Paparan sedang (in-silico)',
  HIGH_EXPOSURE: 'Paparan tinggi (in-silico)',
};

/** Pemetaan segmen Couinaud (B1) — hedge PRD §8.3 WAJIB tampil utuh
 *  ("heuristik pedagogis ... bukan lokasi klinis"), bukan label polos. */
export const segmentMappingTypeLabel: Record<string, string> = {
  PEDAGOGICAL_HEURISTIC: 'Heuristik pedagogis (panduan visual, bukan lokasi klinis)',
};

/** Nama grup toxicophore SHAP — bilingual (keputusan final user, A18):
 *  "Nama Indonesia (nama SMARTS asli)". Nilai tak dikenal ditampilkan mentah. */
export const shapGroupLabel: Record<string, string> = {
  'Phenol group': 'Gugus fenol (Phenol group)',
  'Acetamide / Amide group': 'Gugus amida/asetamida (Acetamide / Amide group)',
  'Carboxylic acid group': 'Gugus asam karboksilat (Carboxylic acid group)',
  'Sulfonamide group': 'Gugus sulfonamida (Sulfonamide group)',
  'Beta-lactam ring': 'Cincin beta-laktam (Beta-lactam ring)',
  'Primary amine': 'Amina primer (Primary amine)',
  'Nitro group': 'Gugus nitro (Nitro group)',
  'Thiazole ring': 'Cincin tiazol (Thiazole ring)',
  Piperazine: 'Piperazin (Piperazine)',
};

/** Status model AI — keputusan final user (§5): kartu hanya tampil saat model
 *  TIDAK tersedia; label mentah "trained" tidak pernah dirender ke pengguna. */
export const MODEL_UNAVAILABLE_LABEL = 'Model AI tidak tersedia';

/** Pola cedera (injury_pattern) — label PRD §8.3: hepatoseluler / kolestatik /
 *  campuran / tanpa monograf. Nilai tak dikenal ditampilkan mentah. */
export const injuryPatternLabel: Record<string, string> = {
  Hepatocellular: 'Hepatoseluler (dominan hepatosit)',
  Cholestatic: 'Kolestatik (dominan empedu)',
  Mixed: 'Campuran (Mixed)',
  Fallback_Diffuse: 'Tidak tersedia (tanpa pola spesifik)',
};
