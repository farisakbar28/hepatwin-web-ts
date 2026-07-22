import { useAppStore } from '../../state/store';
import { Info, ShieldAlert, FlaskConical, LineChart as LineChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AcademicDashboard() {
  const { mode, simulationResult } = useAppStore();

  const getSeverityBadge = (severity: number) => {
    if (severity > 0.7) return { text: 'Kerusakan Parah', colors: 'bg-rose-500/10 border-rose-500/20 text-rose-500' };
    if (severity >= 0.3) return { text: 'Kerusakan Sedang', colors: 'bg-amber-500/10 border-amber-500/20 text-amber-400' };
    return { text: 'Kerusakan Ringan/Aman', colors: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' };
  };

  const formatCompoundClass = (cls: string) => {
    switch (cls) {
      case 'dose_dependent': return 'Dose Dependent (Intrinsik)';
      case 'idiosyncratic': return 'Idiosyncratic (Imunologis/Genetik)';
      default: return 'Klasifikasi Umum';
    }
  };

  return (
    <div className="h-full bg-slate-900 border-t border-slate-700 p-4 text-slate-200 flex flex-col overflow-y-auto">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        
        {/* Panel 1: Hasil Utama */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 overflow-y-auto min-h-[160px]">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" /> Hasil Analisis
          </h3>
          {simulationResult ? (
            <div>
              <div className="text-3xl font-mono font-bold mb-1 flex items-baseline gap-2">
                <span className={simulationResult.DILI_score > 0.7 ? 'text-rose-500' : simulationResult.DILI_score >= 0.3 ? 'text-amber-400' : 'text-emerald-400'}>
                  {(simulationResult.DILI_score * 100).toFixed(1)}%
                </span>
                <span className="text-sm text-slate-400 font-sans font-normal hidden lg:inline">Probabilitas DILI</span>
              </div>
              <div className={`mt-2 inline-block px-2 py-1 rounded text-xs font-semibold border ${getSeverityBadge(simulationResult.damage_severity).colors}`}>
                {getSeverityBadge(simulationResult.damage_severity).text}
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-xs text-slate-400 truncate" title={simulationResult.compound_name || simulationResult.input_smiles || 'Unknown'}>
                  Senyawa: <span className="font-semibold text-slate-300">{simulationResult.compound_name || simulationResult.input_smiles || 'Unknown'}</span>
                </p>
                <p className="text-xs text-slate-400 truncate" title={formatCompoundClass(simulationResult.compound_class)}>
                  Tipe: <span className="font-semibold text-slate-300">{formatCompoundClass(simulationResult.compound_class)}</span>
                </p>
                <p className="text-xs text-slate-400 truncate" title={simulationResult.affected_zone ? simulationResult.affected_zone.replace('_', ' ') : 'Tidak Spesifik'}>
                  Zona: <span className="font-semibold text-slate-300">{simulationResult.affected_zone ? simulationResult.affected_zone.replace('_', ' ') : 'Tidak Spesifik'}</span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Menunggu input simulasi...</p>
          )}
        </div>

        {/* Panel 2: Explainability */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 overflow-y-auto min-h-[160px]">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <FlaskConical className="w-4 h-4" /> Explainability
          </h3>
          {simulationResult ? (
            <div className="flex flex-wrap gap-2">
              {simulationResult.explainability.map((item, idx) => (
                <span key={idx} className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded border border-slate-600 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                  <span className="truncate max-w-[150px]" title={item}>{item}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">-</p>
          )}
        </div>

        {/* Panel 3: PK/PD Data atau Info Model */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 overflow-hidden flex flex-col min-h-[160px]">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2 shrink-0">
            <LineChartIcon className="w-4 h-4" /> {simulationResult?.time_series_pkpd ? 'Dinamika PK/PD' : 'Konteks Model'}
          </h3>
          {simulationResult ? (
            simulationResult.time_series_pkpd && simulationResult.time_series_pkpd.length > 0 ? (
              <div className="flex-1 w-full text-[10px] sm:text-xs min-h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simulationResult.time_series_pkpd} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 10}} tickMargin={5} />
                    <YAxis yAxisId="left" stroke="#94a3b8" tick={{fontSize: 10}} width={30} />
                    <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tick={{fontSize: 10}} width={30} />
                    <Tooltip contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px', fontSize: '12px'}} />
                    <Line yAxisId="left" type="monotone" dataKey="gsh" name="GSH" stroke="#34d399" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line yAxisId="right" type="monotone" dataKey="napqi" name="NAPQI" stroke="#f43f5e" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-slate-300 leading-relaxed overflow-y-auto">
                {simulationResult.model_confidence_note}
              </p>
            )
          ) : (
            <p className="text-sm text-slate-500 italic">-</p>
          )}
        </div>
      </div>

      {/* MANDATORY DISCLAIMER UNTUK TRIASE UMUM */}
      {mode === 'triase_umum' && simulationResult?.disclaimer_permanent && (
        <div className="mt-4 bg-rose-500/10 border border-rose-500/30 p-3 rounded flex gap-3 items-start shrink-0">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-medium text-rose-300/90 leading-relaxed">
            {simulationResult.disclaimer_permanent}
          </p>
        </div>
      )}
    </div>
  );
};
