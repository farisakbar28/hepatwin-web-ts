import axios from 'axios';
import type { AxiosError } from 'axios';
import type { SimulationRequest, SimulationResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 10000,
});

export const simulateDILI = async (payload: SimulationRequest): Promise<SimulationResponse> => {
  try {
    const response = await apiClient.post<SimulationResponse>('/simulate', payload);
    return response.data;
  } catch (err: unknown) {
    const error = err as AxiosError;
    if (error.response && error.response.status === 422) {
      console.error("❌ FASTAPI VALIDATION ERROR:", JSON.stringify(error.response.data, null, 2));
      throw error;
    } else if (error.message === 'Network Error') {
      console.error("❌ CORS OR UNREACHABLE:", error.message);
      return mockSimulationResponse(payload);
    } else {
      console.error("❌ AXIOS ERROR:", error.message);
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
  if (payload.mode === 'triase_umum') {
    return {
      mode: 'triase_umum',
      input_smiles: payload.smiles_string || 'CC(=O)NC1=CC=C(O)C=C1',
      dose_mg_kg: null,
      DILI_score: 0.82,
      risk_level: 'high',
      damage_severity: 0.7,
      compound_class: 'unknown_general',
      model_confidence_note: 'skor berbasis model riset, bukan hasil uji klinis',
      disclaimer_permanent: 'HASIL SIMULASI BUKAN DIAGNOSIS MEDIS.',
      disclaimer_hideable: false,
      affected_zone: 'Macro_Generic',
      supports_micro_zoom: false,
      explainability: ['Aromatic ring', 'Hydroxyl group'],
      visual_pattern: 'heatmap_generik',
    };
  }

  const isParacetamol = payload.compound_id?.toLowerCase() === 'paracetamol';
  const dose = payload.dose_mg_kg || 150;
  
  return {
    mode: 'edukasi_mendalam',
    compound_name: isParacetamol ? 'Paracetamol' : 'Amoxicillin-Clavulanate',
    dose_mg_kg: dose,
    DILI_score: isParacetamol ? 0.95 : 0.65,
    risk_level: isParacetamol ? 'high' : 'medium',
    damage_severity: isParacetamol ? 0.9 : 0.6,
    compound_class: isParacetamol ? 'dose_dependent' : 'idiosyncratic',
    model_confidence_note: 'PK/PD Model Simulation',
    disclaimer_permanent: 'HASIL SIMULASI BUKAN DIAGNOSIS MEDIS.',
    disclaimer_hideable: true,
    affected_zone: isParacetamol ? 'Zone_3' : 'Portal_Periportal',
    supports_micro_zoom: true,
    explainability: isParacetamol ? ['NAPQI accumulation'] : ['Immune-mediated idiosyncratic'],
    visual_pattern: isParacetamol ? 'centrilobular_necrosis' : 'portal_inflammation',
    time_series_pkpd: isParacetamol ? [
      { time: 0, concentration: 0, c_liver: 0, napqi: 0, gsh: 100, napqi_gsh_ratio: 0, threshold_exceeded: false },
      { time: 4, concentration: 150, c_liver: 120, napqi: 20, gsh: 80, napqi_gsh_ratio: 0.4, threshold_exceeded: true },
      { time: 12, concentration: 80, c_liver: 50, napqi: 60, gsh: 40, napqi_gsh_ratio: 1.2, threshold_exceeded: true },
    ] : undefined,
    nomogram_data: isParacetamol ? [
      { time: 4, plasma_concentration: 150, rumack_line_150: 150, rumack_line_200: 200 },
      { time: 12, plasma_concentration: 80, rumack_line_150: 67, rumack_line_200: 90 },
    ] : undefined
  };
}
