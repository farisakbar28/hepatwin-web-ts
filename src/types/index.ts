export type SimulationMode = 'edukasi_mendalam' | 'triase_umum';
export type AffectedZone = 'Zone_3' | 'Portal_Periportal' | 'Macro_Generic';
export type CompoundClass = 'dose_dependent' | 'idiosyncratic' | 'unknown_general';

export interface PKPDDataPoint {
  time: number;
  concentration: number;
  c_liver: number;
  napqi: number;
  gsh: number;
  napqi_gsh_ratio: number;
  threshold_exceeded: boolean;
}

export interface NomogramDataPoint {
  time: number;
  plasma_concentration: number | null;
  rumack_line_150: number;
  rumack_line_200: number;
}

export interface SimulationRequest {
  mode: string;
  compound_id?: 'paracetamol' | 'amox_clav' | null;
  dose_mg_kg?: number | null;
  smiles_string?: string | null;
}

export interface ExplainabilityShap {
  feature: string;
  value: number;
  percentage: number;
}

export interface MockProbability {
  label: string;
  value: number;
  color: string;
}

export interface TriaseMetrics {
  auc_range: string;
  sensitivity: number;
  specificity: number;
  accuracy: number;
}

export interface SimulationResponse {
  mode: string;
  compound_name?: string | null;
  input_smiles?: string | null;
  dose_mg_kg?: number | null;
  DILI_score: number;
  risk_level: 'low' | 'medium' | 'high';
  damage_severity: number;
  compound_class: CompoundClass;
  model_confidence_note: string;
  disclaimer_permanent?: string | null;
  disclaimer_hideable: boolean;
  affected_zone?: string | null;
  supports_micro_zoom: boolean;
  explainability_with_shap?: ExplainabilityShap[] | null;
  mock_probabilities?: MockProbability[] | null;
  triase_metrics?: TriaseMetrics | null;
  explainability: string[];
  visual_pattern: string;
  time_series_pkpd?: PKPDDataPoint[] | null;
  nomogram_data?: NomogramDataPoint[] | null;
}
