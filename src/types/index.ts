export interface PatientCovariates {
  age: number;
  weight: number;
  height: number;
  gender: 'M' | 'F';
}

export interface CompoundSelection {
  hepatwin_id: string;
  compound_name: string;
}

export interface PKPDDataPoint {
  time: number;
  c_liver: number;
}

export interface ExplainabilityShap {
  feature: string;
  value: number;
  percentage: number;
}

export interface SimulationRequest {
  hepatwin_id: string;
  dose_mg: number;
  patient_covariates: PatientCovariates;
}

export interface SimulationResponse {
  compound_name: string;
  risk_level: 'low' | 'medium' | 'high';
  affected_segments: string[];
  DILI_probability: number;
  time_series_pbpk: PKPDDataPoint[];
  explainability_shap: ExplainabilityShap[];
}
