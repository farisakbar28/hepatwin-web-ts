import axios from 'axios';
import type { AxiosError } from 'axios';
import type { SimulationRequest, SimulationResponse } from '../types';
import { processMockData } from './mockData';

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
  const dose = payload.dose_mg_kg || 150;
  
  if (payload.mode === 'triase_umum') {
    const rawRes = {
      mode: 'triase_umum',
      input_smiles: payload.smiles_string || 'CC(=O)NC1=CC=C(O)C=C1',
      dose_mg_kg: null,
      DILI_score: 0.82,
      risk_level: 'high',
      damage_severity: 0.7,
      compound_class: 'unknown_general',
      model_confidence_note: 'skor berbasis model riset, bukan hasil uji klinis',
      disclaimer_permanent: 'Skor ini adalah alat bantu triase/prioritisasi awal in-silico, BUKAN pengganti uji toksisitas/klinis pada senyawa apapun. Tidak ada satupun metode in-silico yang dapat menggantikan pengujian pada endpoint toksikologi kompleks (Madden et al., 2020).',
      disclaimer_hideable: false,
      affected_zone: 'Macro_Generic',
      supports_micro_zoom: false,
      explainability: ['Aromatic ring', 'Hydroxyl group'],
      explainability_with_shap: [
        { feature: 'gugus asetil ester', value: 0.21, percentage: 70 },
        { feature: 'cincin aromatik tersubstitusi', value: 0.15, percentage: 50 }
      ],
      mock_probabilities: [
        { label: 'Tidak toksik', value: 15, color: 'bg-slate-300' },
        { label: 'Risiko rendah', value: 14, color: 'bg-green-500' },
        { label: 'Risiko sedang', value: 63, color: 'bg-yellow-500' },
        { label: 'Risiko tinggi', value: 8, color: 'bg-red-600' }
      ],
      triase_metrics: {
        auc_range: '0.75-0.85',
        sensitivity: 0.79,
        specificity: 0.74,
        accuracy: 0.631
      },
      visual_pattern: 'heatmap_generik',
    };
    const processed = processMockData(rawRes, dose);
    if (!processed) throw new Error("Mock processing failed");
    return processed;
  }

  const isParacetamol = payload.compound_id?.toLowerCase() === 'paracetamol';
  
  const rawRes2 = {
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
    explainability_with_shap: isParacetamol ? [
        { feature: 'Cincin fenol', value: 0.45, percentage: 85 },
        { feature: 'Gugus asetamida', value: 0.38, percentage: 70 }
    ] : [
        { feature: 'Cincin beta-laktam (amoxicillin)', value: 0.32, percentage: 75 },
        { feature: 'Gugus klavulanat (asam oksazolidin)', value: 0.24, percentage: 55 }
    ],
    mock_probabilities: !isParacetamol ? [
        { label: 'Tidak toksik', value: 15, color: 'bg-slate-300' },
        { label: 'Risiko rendah', value: 14, color: 'bg-green-500' },
        { label: 'Risiko sedang', value: 63, color: 'bg-yellow-500' },
        { label: 'Risiko tinggi', value: 8, color: 'bg-red-600' }
    ] : null,
    visual_pattern: isParacetamol ? 'centrilobular_necrosis' : 'portal_inflammation'
  };
  
  const processed2 = processMockData(rawRes2, dose);
  if (!processed2) throw new Error("Mock processing failed");
  return processed2;
}
