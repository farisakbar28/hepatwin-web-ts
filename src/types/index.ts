export type SimulationMode = 'edukasi_mendalam' | 'triase_umum';
export type AffectedZone = 'Zone_3' | 'Portal_Periportal' | 'Macro_Generic';

export interface SimulationRequest {
  mode: SimulationMode;
  compound_name?: string;
  input_smiles?: string;
  dose_mg_kg?: number;
}

export interface TimeSeriesData {
  time: number;
  concentration: number;
  napqi_gsh_ratio: number;
}

export interface SimulationResponse {
  mode: SimulationMode;
  compound_name?: string;
  input_smiles?: string;
  DILI_score: number; 
  model_confidence_note: string;
  affected_zone?: AffectedZone;
  explainability: string[];
  visual_pattern: string;
  time_series_pkpd?: TimeSeriesData[];
}
