export interface CompoundSelection {
  hepatwin_id: string;
  compound_name: string;
  dili_concern?: string | null;
  is_simulatable: boolean;
}

export interface AutocompleteResponse {
  query: string;
  total: number;
  results: CompoundSelection[];
}

export type SexCode = 'L' | 'P';
export type RiskLevel = 'low' | 'medium' | 'high';
export type VisualColor = 'green' | 'yellow' | 'red';
export type BlinkingSpeed = 'none' | 'slow' | 'fast';
export type ExposureCategory = 'LOW_EXPOSURE' | 'MODERATE_EXPOSURE' | 'HIGH_EXPOSURE';
export type ModelStatus = 'trained' | 'unavailable' | null;
export type SegmentMappingType = 'PEDAGOGICAL_HEURISTIC';

export interface PatientCovariates {
  usia: number;
  jenis_kelamin: SexCode;
  berat_badan_kg: number;
  tinggi_badan_cm: number;
}

export interface SimulationRequest {
  hepatwin_id: string;
  dosis_mg: number;
  covariates: PatientCovariates;
}

export interface PKPDDataPoint {
  time: number;
  c_plasma: number;
  c_hati: number;
}

export interface SimulationResponse {
  hepatwin_id: string;
  compound_name: string;
  dili_score: number;
  risk_level: RiskLevel;
  visual_color: VisualColor;
  blinking_speed: BlinkingSpeed;
  affected_segments: string[];
  injury_pattern: string;
  segment_mapping_type: SegmentMappingType;
  segment_mapping_not_clinical_localization: boolean;
  explainability_shap: string[];
  cmax_liver_mg_l: number;
  auc_liver_mg_h_l: number;
  cmax_hati?: number;
  auc_hati?: number;
  shape_ratio_h_inv: number;
  cmax_auc_ratio: number;
  exposure_index: number;
  exposure_category: ExposureCategory;
  exposure_category_source: string;
  exposure_calibration_version: string;
  time_series_pbpk: PKPDDataPoint[];
  disclaimer_permanent: string;
  shap_detail?: Record<string, unknown> | null;
  model_version?: string | null;
  model_status?: ModelStatus;
  score_is_calibrated?: boolean | null;
}

export type AppApiErrorKind = 'validation' | 'not_found' | 'timeout' | 'network' | 'server' | 'unavailable' | 'unknown';

export interface AppApiError {
  kind: AppApiErrorKind;
  status?: number;
  message: string;
  detail?: unknown;
}

export interface HealthResponse {
  status: string;
  version: string;
  ai_engine_ready: boolean;
  pkpd_engine_ready: boolean;
}
