import type { AppApiError } from '../types';
import { fetchCompoundDetail } from './api';

/** Ambang bobot molekul (Dalton). Senyawa di atasnya (peptida/obat biologik)
 *  berisiko tidak dapat diproses mesin simulasi backend (keterbatasan
 *  resource runtime, lihat temuan QA). ~1500 Da memisahkan obat konvensional
 *  dari peptida (mis. Abaloparatide 3961 Da, Teriparatide 4196 Da). */
export const TOO_LARGE_MOLECULAR_WEIGHT_DALTON = 1500;

/** Pesan preventif: senyawa besar diblokir SEBELUM request simulasi dikirim. */
export const LARGE_MOLECULE_PREVENTED_MESSAGE =
  'Senyawa yang dipilih memiliki ukuran molekul sangat besar (misalnya peptida atau obat biologik), sehingga belum dapat disimulasikan oleh HepaTwin pada tahap ini. Silakan pilih senyawa lain, misalnya obat konvensional bermolekul kecil.';

/** Pesan fallback: backend mengirim error server untuk senyawa berukuran besar. */
const LARGE_MOLECULE_BACKEND_ERROR_MESSAGE =
  'Simulasi tidak dapat diselesaikan: senyawa ini berukuran molekul sangat besar sehingga berada di luar kemampuan mesin simulasi saat ini. Silakan coba senyawa lain.';

/** Cache bobot molekul per hepatwin_id dari GET /compounds/{id} -- module
 *  scope supaya bertahan lintas render (backend juga meng-cache endpoint ini
 *  via ETag). Nilai null = detail gagal diambil / molecular_weight absent. */
const molecularWeightCache = new Map<string, number | null>();

/** Ambil bobot molekul senyawa (null bila tidak tersedia). Kegagalan fetch
 *  TIDAK memblokir simulasi -- guard bersifat best-effort: bila data tidak
 *  didapat, request tetap diteruskan dan error backend ditangani normal. */
export async function getCompoundMolecularWeight(hepatwinId: string): Promise<number | null> {
  if (molecularWeightCache.has(hepatwinId)) {
    return molecularWeightCache.get(hepatwinId) ?? null;
  }
  try {
    const detail = await fetchCompoundDetail(hepatwinId);
    const mw = typeof detail.molecular_weight === 'number' ? detail.molecular_weight : null;
    molecularWeightCache.set(hepatwinId, mw);
    return mw;
  } catch {
    molecularWeightCache.set(hepatwinId, null);
    return null;
  }
}

/** true bila bobot molekul melebihi ambang simulasi. */
export function isOversizedMolecularWeight(mw: number | null | undefined): boolean {
  return mw != null && mw > TOO_LARGE_MOLECULAR_WEIGHT_DALTON;
}

/** true bila senyawa (dari cache yang sudah terisi) berukuran besar. */
export function isOversizedHepatwinId(hepatwinId: string | null | undefined): boolean {
  if (!hepatwinId) return false;
  return isOversizedMolecularWeight(molecularWeightCache.get(hepatwinId) ?? null);
}

/** Pesan error yang tampil: pesan ramah molekul besar bila error server
 *  terjadi pada senyawa berukuran besar (guard sempat terlewat/gagal);
 *  selain itu pesan asli dari backend. Dipakai di panel kontrol DAN banner
 *  dashboard supaya kedua permukaan error selalu konsisten.
 *
 *  CATATAN: jalur ini bersifat DEFENSIF -- di alur normal, guard preventif
 *  (getCompoundMolecularWeight) sudah memblokir senyawa besar sebelum
 *  runSimulation dipanggil, sehingga error server untuk senyawa besar hanya
 *  mungkin terjadi bila pengambilan bobot molekul sempat gagal (cache null). */
export function largeMoleculeErrorMessageFor(
  error: AppApiError | null,
  hepatwinId?: string | null
): string | null {
  if (!error) return null;
  const isServerLike =
    error.kind === 'server' || error.kind === 'unavailable' || error.kind === 'network';
  if (isServerLike && isOversizedHepatwinId(hepatwinId)) {
    return LARGE_MOLECULE_BACKEND_ERROR_MESSAGE;
  }
  return error.message;
}
