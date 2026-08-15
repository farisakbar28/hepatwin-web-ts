import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import type { AppApiError, AutocompleteResponse, CompoundDetail, HealthResponse, SimulationRequest, SimulationResponse } from '../types';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');

/**
 * Batas waktu permintaan data (ms). Backend FastAPI Cloud (free tier)
 * menerapkan scale-to-zero: request pertama setelah idle memicu cold start
 * 30–60 detik, jadi timeout 8 detik yang lama terlalu pendek dan memutus
 * request secara sepihak. Nilai ini sengaja longgar (>= 60 dtk) — request
 * pertama harus sabar menunggu instance backend menyala.
 */
export const REQUEST_TIMEOUT_MS = 60000;

/** Simulasi bisa menanggung cold start SEKALIGUS proses PBPK/SHAP yang panjang
 *  (jalur SHAP tail lebih lama dari permintaan biasa), diberi kelonggaran
 *  lebih dari client default. */
export const SIMULATION_TIMEOUT_MS = 120000;

/** Batas waktu health check (ms). Health check sering menjadi request PERTAMA
 *  setelah idle (pemicu cold start), sehingga ikut dilonggarkan. */
export const HEALTH_TIMEOUT_MS = 60000;

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: REQUEST_TIMEOUT_MS,
});

const healthClient = axios.create({
  baseURL: BASE_URL,
  timeout: HEALTH_TIMEOUT_MS,
});

function extractMessage(detail: unknown): string | null {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (item && typeof item === 'object' && 'msg' in item) {
          return String((item as { msg: unknown }).msg);
        }
        return null;
      })
      .filter(Boolean);
    return messages.length > 0 ? messages.join('; ') : null;
  }
  return null;
}

export function toAppApiError(err: unknown): AppApiError {
  if (!axios.isAxiosError(err)) {
    return {
      kind: 'unknown',
      message: 'Terjadi kesalahan tidak dikenal. Silakan coba lagi.',
      detail: err,
    };
  }

  const error = err as AxiosError<{ detail?: unknown }>;
  const status = error.response?.status;
  const detail = error.response?.data?.detail;
  const serverMessage = extractMessage(detail);

  if (error.code === 'ECONNABORTED') {
    return {
      kind: 'timeout',
      message: 'Permintaan ke backend tidak selesai dalam batas waktu. Silakan coba lagi beberapa saat.',
      detail,
    };
  }

  if (!error.response) {
    return {
      kind: 'network',
      message: 'Tidak dapat terhubung ke backend. Periksa koneksi, URL API, atau CORS.',
      detail: error.message,
    };
  }

  if (status === 400) {
    return {
      kind: 'validation',
      status,
      message: serverMessage || 'Input tidak valid. Periksa kembali parameter simulasi.',
      detail,
    };
  }

  if (status === 422) {
    return {
      kind: 'validation',
      status,
      message: serverMessage || 'Senyawa bertipe biologik atau memiliki struktur yang tidak dapat disimulasikan.',
      detail,
    };
  }

  if (status === 404) {
    return {
      kind: 'not_found',
      status,
      message: serverMessage || 'Senyawa tidak tersedia dalam daftar simulasi HepaTwin.',
      detail,
    };
  }

  if (status === 503) {
    return {
      kind: 'unavailable',
      status,
      message: serverMessage || 'Layanan backend atau model AI sedang tidak tersedia.',
      detail,
    };
  }

  if (status && status >= 500) {
    return {
      kind: 'server',
      status,
      message: serverMessage || 'Terjadi gangguan server. Silakan coba lagi.',
      detail,
    };
  }

  return {
    kind: 'unknown',
    status,
    message: serverMessage || 'Permintaan gagal. Silakan coba lagi.',
    detail,
  };
}

export const fetchCompoundsAutocomplete = async (
  query: string,
  limit: number = 10,
  config?: AxiosRequestConfig
): Promise<AutocompleteResponse> => {
  try {
    const response = await apiClient.get<AutocompleteResponse>('/compounds/autocomplete', {
      ...config,
      params: { q: query, limit, ...config?.params },
    });
    return response.data;
  } catch (err: unknown) {
    throw toAppApiError(err);
  }
};

export const fetchCompoundDetail = async (
  hepatwinId: string,
  config?: AxiosRequestConfig
): Promise<CompoundDetail> => {
  try {
    const response = await apiClient.get<CompoundDetail>(`/compounds/${hepatwinId}`, config);
    return response.data;
  } catch (err: unknown) {
    throw toAppApiError(err);
  }
};

export const simulateDILI = async (payload: SimulationRequest): Promise<SimulationResponse> => {
  try {
    // Timeout longgar untuk simulasi: request ini bisa menanggung cold start
    // sekaligus proses backend yang panjang (jalur SHAP tail lebih lama dari
    // permintaan biasa).
    const response = await apiClient.post<SimulationResponse>('/simulate', payload, { timeout: SIMULATION_TIMEOUT_MS });
    return response.data;
  } catch (err: unknown) {
    throw toAppApiError(err);
  }
};

export interface HealthProbeResult {
  up: boolean;
  /** true bila kegagalan diduga karena cold start (timeout / 5xx saat boot)
   *  dan layak dicoba ulang dengan jeda lebih lama; false bila server
   *  kemungkinan besar benar-benar mati / tidak terjangkau. */
  coldStartLikely: boolean;
}

/** Satu probe GET /health. Tidak melempar error; hasil diklasifikasikan agar
 *  pemanggil bisa membedakan "server sedang dibangunkan" vs "server mati". */
export async function probeHealth(): Promise<HealthProbeResult> {
  try {
    const response = await healthClient.get<HealthResponse>('/health');
    return {
      up: response.data.status === 'ok' && response.data.pkpd_engine_ready === true,
      coldStartLikely: false,
    };
  } catch (err: unknown) {
    const axiosError = axios.isAxiosError(err) ? (err as AxiosError) : null;
    const isTimeout = axiosError?.code === 'ECONNABORTED';
    const status = axiosError?.response?.status;
    // Timeout = request masih menggantung menunggu instance menyala.
    // 5xx (mis. 503 saat warmup) = instance sudah menyala tapi belum siap.
    return { up: false, coldStartLikely: isTimeout || (status !== undefined && status >= 500) };
  }
}

/** Jeda antar percobaan ulang: lama untuk kegagalan mirip cold start, singkat
 *  untuk kegagalan cepat (server mati / CORS). */
const COLD_START_RETRY_GAP_MS = 15000;
const FAST_RETRY_GAP_MS = 3000;
const MAX_PROBES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Probe /health dengan retry terbatas yang sadar cold start: kegagalan yang
 *  mirip cold start (timeout / 5xx) dicoba ulang dengan jeda lebih lama supaya
 *  instance backend punya waktu menyala (30–60 dtk); kegagalan cepat (server
 *  mati / CORS) dicoba ulang singkat lalu menyerah agar UI tidak menunggu
 *  terlalu lama menyatakan backend tidak tersedia. */
export async function probeHealthWithRetries(): Promise<boolean> {
  for (let attempt = 1; attempt <= MAX_PROBES; attempt += 1) {
    const result = await probeHealth();
    if (result.up) return true;
    if (attempt === MAX_PROBES) return false;
    await sleep(result.coldStartLikely ? COLD_START_RETRY_GAP_MS : FAST_RETRY_GAP_MS);
  }
  return false;
}
