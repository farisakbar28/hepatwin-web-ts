import { useAppStore } from '../../state/store';
import type { ExplainabilityShap } from '../../types';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { MedicalDisclaimerFooter } from '../common/MedicalDisclaimerFooter';

import type { TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

type CustomTooltipProps = TooltipProps<ValueType, NameType> & {
  payload?: Record<string, unknown>[];
  label?: string | number;
};

export function AcademicDashboard() {
  const { simulationResult } = useAppStore();

  const PKPDTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-lg border border-slate-700">
          <p className="font-bold mb-1">Waktu: {label} jam</p>
          {payload.map((entry: Record<string, unknown>, index: number) => (
            <p key={index} style={{ color: entry.color as string }}>
              {entry.name as string}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : (entry.value as string)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
        <div className="w-full pt-4 lg:pt-6 border-t border-slate-200 fade-in">
            <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">Analisis Risiko DILI - {simulationResult?.compound_name || 'Menunggu Input'}</h2>
        </div>

        <div className="w-full fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Kiri: Grafik PBPK (C_liver vs time) */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 lg:p-6 shadow-sm flex flex-col h-[380px]">
                    <div className="flex justify-between items-start mb-6">
                        <div className="pr-2">
                            <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Farmakokinetika</h3>
                            <p className="text-sm sm:text-base font-bold text-slate-800 mt-1 leading-tight">Kurva Paparan Hati ($C_{"{hati}"}$) 24 Jam</p>
                        </div>
                        <div className="flex text-[11px] font-semibold text-slate-500 whitespace-nowrap items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                                <span>C liver (mg/L)</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full relative flex flex-col justify-end">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={simulationResult?.time_series_pbpk || []} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                <CartesianGrid vertical={false} stroke="#f1f5f9" strokeWidth={1.5} strokeDasharray="4 4" />
                                <XAxis 
                                    dataKey="time" 
                                    axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }} 
                                    tickLine={false} 
                                    tick={{ fontSize: 11, fill: '#94a3b8' }} 
                                    ticks={[0, 4, 8, 12, 16, 20, 24]} 
                                />
                                <YAxis hide domain={[0, 'auto']} />
                                <Tooltip content={<PKPDTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '4 4' }} />
                                <Line 
                                    name="C liver" 
                                    type="monotone" 
                                    dataKey="c_liver" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3.5} 
                                    dot={false} 
                                    isAnimationActive={true} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="flex justify-between text-[11px] font-medium text-slate-400 absolute bottom-0 w-full px-2 pb-1 pointer-events-none">
                            <span>0 jam</span>
                            <span>24 jam</span>
                        </div>
                    </div>
                </div>

                {/* Kanan: SHAP Explainability (100% Murni) */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 lg:p-6 shadow-sm flex flex-col h-[380px]">
                    <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1">Explainability (SHAP × RDKit SMARTS)</h3>
                    <p className="text-sm lg:text-base font-bold text-slate-800 mb-6">Kontribusi substruktur kimia dominan</p>
                    
                    <div className="space-y-5 overflow-y-auto pr-1">
                        {simulationResult?.explainability_shap && simulationResult.explainability_shap.length > 0 ? (
                            simulationResult.explainability_shap.map((item: ExplainabilityShap, idx: number) => (
                            <div key={idx} className="relative pt-1">
                                <div className="flex justify-between text-xs lg:text-sm mb-1.5">
                                <span className="text-slate-600">{item.feature}</span>
                                <span className="font-bold text-purple-600">+{item.value.toFixed(2)}</span>
                                </div>
                                <div className="overflow-hidden h-2.5 flex rounded-full bg-slate-100">
                                <div style={{ width: `${item.percentage || 50}%` }} className="bg-violet-500 rounded-full transition-all duration-500"></div>
                                </div>
                            </div>
                            ))
                        ) : (
                            <div className="text-sm text-slate-500 italic border border-slate-100 p-4 rounded-lg bg-slate-50 text-center">
                                Lakukan simulasi untuk melihat kontribusi fitur kimia.
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Medical Disclaimer Footnote (Full-Width) */}
            <MedicalDisclaimerFooter />
        </div>
    </>
  );
}

