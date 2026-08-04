import axios from 'axios';
import type { AxiosError } from 'axios';
import type { SimulationRequest, SimulationResponse, PKPDDataPoint, ExplainabilityShap } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 10000,
});

export const fetchCompoundsAutocomplete = async (query: string, limit: number = 10) => {
  try {
    const response = await apiClient.get('/compounds/autocomplete', {
      params: { q: query, limit }
    });
    return response.data;
  } catch (err: unknown) {
    const error = err as AxiosError;
    console.error("Autocomplete fetch error:", error.message);
    throw error;
  }
};

export const simulateDILI = async (payload: SimulationRequest): Promise<SimulationResponse> => {
  try {
    const response = await apiClient.post<SimulationResponse>('/simulate', payload);
    return response.data;
  } catch (err: unknown) {
    const error = err as AxiosError;
    if (error.response && error.response.status === 422) {
      console.error("❌ FASTAPI VALIDATION ERROR:", JSON.stringify(error.response.data, null, 2));
      throw error;
    } else {
      console.error("❌ NETWORK/AXIOS ERROR, FALLING BACK TO MOCK:", error.message);
      return mockSimulationResponse(payload);
    }
  }
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    const healthClient = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
    });
    await healthClient.get('/health');
    return true;
  } catch {
    return false;
  }
};

// Mock response generation for Sprint 0 Placeholder when backend is off
function mockSimulationResponse(payload: SimulationRequest): SimulationResponse {
  const dose = payload.dose_mg || 150;
  const isParacetamol = payload.hepatwin_id?.toLowerCase() === 'paracetamol';
  
  // Create dummy time series
  const time_series_pbpk: PKPDDataPoint[] = [];
  for (let t = 0; t <= 24; t++) {
    // Generate some fake curve
    const c_liver = (dose / 100) * 10 * Math.exp(-Math.pow(t - 6, 2) / 20) + (Math.random() * 0.5);
    time_series_pbpk.push({ time: t, c_liver: Math.max(0, c_liver) });
  }

  const explainability_shap: ExplainabilityShap[] = isParacetamol ? [
    { feature: 'Cincin fenol', value: 0.45, percentage: 85 },
    { feature: 'Gugus asetamida', value: 0.38, percentage: 70 }
  ] : [
    { feature: 'Gugus asetal', value: 0.22, percentage: 55 },
    { feature: 'Cincin aromatik', value: 0.15, percentage: 40 }
  ];

  return {
    compound_name: isParacetamol ? 'Paracetamol' : (payload.hepatwin_id || 'Unknown Compound'),
    risk_level: isParacetamol ? 'high' : 'medium',
    affected_segments: isParacetamol ? ['V', 'VI', 'VII', 'VIII'] : ['ALL_DIFFUSE'],
    DILI_probability: isParacetamol ? 0.85 : 0.45,
    time_series_pbpk,
    explainability_shap
  };
}
