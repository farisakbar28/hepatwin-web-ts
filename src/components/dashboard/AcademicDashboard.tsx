import React from 'react';
import { useAppStore } from '../../state/store';
import { AlertTriangle, Info } from 'lucide-react';

export const AcademicDashboard: React.FC = () => {
  const { mode, simulationResult } = useAppStore();

  return (
    <div className="h-full bg-slate-900 border-t border-slate-700 p-4 text-slate-200 flex flex-col">
      <div className="flex-1 grid grid-cols-3 gap-6">
        
        {/* Panel 1: Hasil Utama */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" /> Hasil Analisis
          </h3>
          {simulationResult ? (
            <div>
              <div className="text-3xl font-mono font-bold mb-1 flex items-baseline gap-2">
                <span className={simulationResult.DILI_score > 0.7 ? 'text-rose-500' : simulationResult.DILI_score >= 0.3 ? 'text-amber-400' : 'text-emerald-400'}>
                  {(simulationResult.DILI_score * 100).toFixed(1)}%
                </span>
                <span className="text-sm text-slate-400 font-sans font-normal">Risiko DILI</span>
              </div>
              <div className={`mt-2 inline-block px-2 py-1 rounded text-xs font-semibold border ${
                simulationResult.DILI_score > 0.7 ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                simulationResult.DILI_score >= 0.3 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}>
                {simulationResult.DILI_score > 0.7 ? 'Risiko Tinggi / Toksik' : simulationResult.DILI_score >= 0.3 ? 'Risiko Sedang / Waspada' : 'Risiko Rendah / Aman'}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Zona Terdampak: <span className="font-semibold text-slate-300">{simulationResult.affected_zone ? simulationResult.affected_zone.replace('_', ' ') : 'Tidak Spesifik'}</span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Menunggu input simulasi...</p>
          )}
        </div>

        {/* Panel 2: Explainability */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Explainability (SHAP / Substruktur)</h3>
          {simulationResult ? (
            <ul className="space-y-1">
              {simulationResult.explainability.map((item, idx) => (
                <li key={idx} className="text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 italic">-</p>
          )}
        </div>

        {/* Panel 3: PK/PD Data atau Info Model */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Konteks Model</h3>
          {simulationResult ? (
            <p className="text-sm text-slate-300 leading-relaxed">
              {simulationResult.model_confidence_note}
            </p>
          ) : (
            <p className="text-sm text-slate-500 italic">-</p>
          )}
        </div>
      </div>

      {/* MANDATORY DISCLAIMER UNTUK TRIASE UMUM */}
      {mode === 'triase_umum' && (
        <div className="mt-4 bg-rose-500/10 border border-rose-500/30 p-3 rounded flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-rose-300/90 leading-relaxed">
            Skor ini adalah estimasi awal berbasis model riset (AUC eksternal ~0,75–0,85), BUKAN hasil uji toksisitas dan BUKAN dasar keputusan keamanan obat.
          </p>
        </div>
      )}
    </div>
  );
};
