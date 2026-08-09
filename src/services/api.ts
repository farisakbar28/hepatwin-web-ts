import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import type { AppApiError, AutocompleteResponse, HealthResponse, SimulationRequest, SimulationResponse } from '../types';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 8000,
});

const healthClient = axios.create({
  baseURL: BASE_URL,
  timeout: 3000,
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

export const simulateDILI = async (payload: SimulationRequest): Promise<SimulationResponse> => {
  try {
    // Timeout longgar untuk simulasi: proses dibiarkan berjalan selama backend
    // masih bekerja (jalur SHAP tail bisa lebih lama dari permintaan biasa).
    const response = await apiClient.post<SimulationResponse>('/simulate', payload, { timeout: 60000 });
    return response.data;
  } catch (err: unknown) {
    throw toAppApiError(err);
  }
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await healthClient.get<HealthResponse>('/health');
    return response.data.status === 'ok' && response.data.pkpd_engine_ready === true;
  } catch {
    return false;
  }
};
