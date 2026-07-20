import axios from 'axios';
import type { SimulationRequest, SimulationResponse } from '../types';

export const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 10000,
});

export const simulateDILI = async (payload: SimulationRequest): Promise<SimulationResponse> => {
  try {
    const response = await apiClient.post<SimulationResponse>('/simulate', payload);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      console.error("❌ FASTAPI VALIDATION ERROR:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("❌ AXIOS ERROR:", error.message);
      // Mock fallback if backend is not running
      return mockSimulationResponse(payload);
    }
    throw error;
  }
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    await apiClient.get('/health');
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
      DILI_score: 0.82,
      model_confidence_note: 'skor berbasis model riset, bukan hasil uji klinis',
      affected_zone: 'Macro_Generic',
      explainability: ['Aromatic ring', 'Hydroxyl group'],
      visual_pattern: 'heatmap_generik',
    };
  }

  const isParacetamol = payload.compound_id?.toLowerCase() === 'paracetamol';
  
  return {
    mode: 'edukasi_mendalam',
    compound_name: isParacetamol ? 'Paracetamol' : 'Amoxicillin-Clavulanate',
    DILI_score: isParacetamol ? 0.95 : 0.65,
    model_confidence_note: 'PK/PD Model Simulation',
    affected_zone: isParacetamol ? 'Zone_3' : 'Portal_Periportal',
    explainability: isParacetamol ? ['NAPQI accumulation'] : ['Immune-mediated idiosyncratic'],
    visual_pattern: isParacetamol ? 'centrilobular_necrosis' : 'portal_inflammation',
    time_series_pkpd: isParacetamol ? [
      { time: 0, concentration: 0, napqi_gsh_ratio: 0 },
      { time: 4, concentration: 150, napqi_gsh_ratio: 0.4 },
      { time: 12, concentration: 80, napqi_gsh_ratio: 1.2 },
    ] : undefined
  };
}
