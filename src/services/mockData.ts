import type { SimulationResponse, PKPDDataPoint, NomogramDataPoint } from '../types';

export const processMockData = (response: unknown, doseScalar: number = 150): SimulationResponse | null => {
  if (!response) return null;
  
  const data = JSON.parse(JSON.stringify(response)) as SimulationResponse;
  const ratio = doseScalar / 150; // Use 150 as baseline dose for scaling
  
  if (data.mode === 'edukasi_mendalam' && data.compound_class === 'dose_dependent') {
    // Generate PKPD Data
    const pkpdData: PKPDDataPoint[] = [];
    for (let t = 0; t <= 24; t += 1) {
      // Fake bell curve for concentration, delayed peak for napqi, scaled by ratio
      const conc = t < 2 ? 0 : t < 6 ? (100 * ratio) * Math.sin((t-2) * Math.PI / 8) : (100 * ratio) * Math.exp(-(t-6)/4);
      const napqi = t < 4 ? 0 : t < 10 ? (120 * ratio) * Math.sin((t-4) * Math.PI / 12) : (120 * ratio) * Math.exp(-(t-10)/6);
      
      pkpdData.push({
        time: t,
        concentration: Math.max(0, conc),
        c_liver: Math.max(0, conc * 0.8),
        napqi: Math.max(0, napqi),
        gsh: Math.max(0, 100 - napqi*0.5),
        napqi_gsh_ratio: napqi / Math.max(1, 100 - napqi*0.5),
        threshold_exceeded: napqi / Math.max(1, 100 - napqi*0.5) > 1
      });
    }
    data.time_series_pkpd = pkpdData;

    // Generate Nomogram Data
    const nomogramData: NomogramDataPoint[] = [];
    for (let t = 4; t <= 24; t += 1) {
      // Rumack-Matthew equations (exponential decay from 4h intercept)
      // 200-line: 200 at 4h, T1/2 = 4h
      const line200 = 200 * Math.exp(-Math.log(2) * (t - 4) / 4);
      // 150-line: 150 at 4h, T1/2 = 4h
      const line150 = 150 * Math.exp(-Math.log(2) * (t - 4) / 4);
      
      // Patient concentration point (e.g. at t=8), scaled by ratio
      const patientConc = t === 8 ? 160 * ratio : null;

      nomogramData.push({
        time: t,
        plasma_concentration: patientConc,
        rumack_line_150: line150,
        rumack_line_200: line200
      });
    }
    data.nomogram_data = nomogramData;
  }
  
  if (data.mode === 'edukasi_mendalam' && data.compound_class === 'idiosyncratic') {
    data.mock_probabilities = [
      { label: 'Tidak toksik', value: 15, color: 'bg-slate-300' },
      { label: 'Risiko rendah', value: 14, color: 'bg-green-500' },
      { label: 'Risiko sedang', value: 63, color: 'bg-yellow-500' },
      { label: 'Risiko tinggi', value: 8, color: 'bg-red-600' }
    ];
    
    const explainMap: Record<string, number> = {
      "Cincin beta-laktam": 0.32,
      "Gugus klavulanat (asam oksazolidin)": 0.24,
      "Gugus amina aromatik": 0.14,
      "Ikatan amida siklik": 0.09
    };
    
    if (data.explainability) {
      data.explainability_with_shap = data.explainability.map((item: string) => ({
        feature: item,
        value: explainMap[item] || Number((Math.random() * 0.3).toFixed(2)),
        percentage: Number(((explainMap[item] || 0.1) * 200).toFixed(0)) 
      }));
    }
  }
  
  if (data.mode === 'triase_umum') {
    data.triase_metrics = {
      accuracy: 0.631,
      sensitivity: 0.79,
      specificity: 0.74,
      auc_range: "0.75-0.85"
    };
    
    if (data.explainability) {
      data.explainability_with_shap = data.explainability.map((item: string) => {
        const value = Number((Math.random() * 0.2 + 0.05).toFixed(2));
        return {
          feature: item,
          value,
          percentage: Number((value * 200).toFixed(0))
        };
      });
    }
  }
  
  return data;
};
