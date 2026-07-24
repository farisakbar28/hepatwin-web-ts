import { useAppStore } from '../../state/store';
import type { ExplainabilityShap, MockProbability } from '../../types';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ComposedChart, Scatter } from 'recharts';

import type { TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

type CustomTooltipProps = TooltipProps<ValueType, NameType> & {
  payload?: Record<string, unknown>[];
  label?: string | number;
};

export function AcademicDashboard() {
  const { mode, simulationResult } = useAppStore();
  const compoundClass = simulationResult?.compound_class || 'dose_dependent';

  // Custom Label for Nomogram
  const NomogramLabel = (props: { x?: number | string, y?: number | string, value?: string, stroke?: string }) => {
    const xPos = Number(props.x) || 0;
    const yPos = Number(props.y) || 0;
    const yOffset = props.value === '200-line' ? -25 : -10;
    return (
      <text x={xPos} y={yPos + yOffset} textAnchor="end" fill={props.stroke} fontSize="11" fontWeight="bold">
        {props.value}
      </text>
    );
  };

  // Custom Tooltip for PKPD
  const PKPDTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-lg border border-slate-700">
          <p className="font-bold mb-1">Waktu: {label} jam</p>
          {payload.map((entry: Record<string, unknown>, index: number) => (
            <p key={index} style={{ color: entry.color as string }}>
              {entry.name as string}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : (entry.value as string)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Nomogram
  const NomogramTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-lg border border-slate-700">
          <p className="font-bold mb-1">Waktu: {label} jam</p>
          {payload.map((entry: Record<string, unknown>, index: number) => {
             // Only show the dot if it exists, or the lines
             if (entry.dataKey === 'plasma_concentration' && entry.value === null) return null;
             const name = entry.dataKey === 'plasma_concentration' ? 'Pasien' : entry.dataKey === 'rumack_line_200' ? '200-line' : '150-line';
             
             // Extract color safely handling potentially undefined fill/stroke
             const payloadObj = entry.payload as Record<string, unknown>;
             const fillCol = payloadObj && typeof payloadObj === 'object' && 'fill' in payloadObj ? (payloadObj as Record<string, string>).fill : undefined;
             const color = (entry.color as string) || fillCol || (entry.stroke as string) || (entry.fill as string) || '#fff';
             
             return (
              <p key={index} style={{ color }}>
                {name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : (entry.value as string)}
              </p>
             )
          })}
        </div>
      );
    }
    return null;
  };


  return (
    <>
        <div className="w-full pt-4 lg:pt-6 border-t border-slate-200 fade-in">
            <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">Panel Data Simulasi</h2>
        </div>

        <div className="w-full flex flex-col gap-6 lg:gap-8 fade-in">
            
            {/* DATA PANELS GRID */}
            <div>
                {mode === 'edukasi_mendalam' ? (
                  compoundClass === 'dose_dependent' ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[100px]">
                            <span className="text-xs text-slate-500 mb-1">Skor Risiko DILI</span>
                            <div className="text-3xl lg:text-4xl font-bold text-red-600 leading-none mb-1 mt-auto">{(simulationResult?.DILI_score || 0.78).toFixed(2)}</div>
                            <span className="text-[11px] text-slate-400">risiko tinggi</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[100px]">
                            <span className="text-xs text-slate-500 mb-1">C plasma (t)</span>
                            <div className="text-3xl lg:text-4xl font-bold text-slate-800 leading-none mb-1 mt-auto">42.6 <span className="text-xl lg:text-2xl font-medium">mg/L</span></div>
                            <span className="text-[11px] text-slate-400">t = 24 jam</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[100px]">
                            <span className="text-xs text-slate-500 mb-1">Rasio NAPQI/GSH</span>
                            <div className="text-3xl lg:text-4xl font-bold text-slate-800 leading-none mb-1 mt-auto">1.34</div>
                            <span className="text-[11px] text-slate-400">rasio &gt; 1 = GSH habis</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[100px]">
                            <span className="text-xs text-slate-500 mb-1">Zona Terdampak</span>
                            <div className="text-2xl lg:text-3xl font-bold text-slate-800 leading-none mb-1 mt-auto">Zona 3</div>
                            <span className="text-[11px] text-slate-400">sentrilobuler</span>
                        </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[100px]">
                            <span className="text-xs text-slate-500 mb-1">Skor Risiko DILI</span>
                            <div className="text-3xl lg:text-4xl font-bold text-yellow-600 leading-none mb-1 mt-auto">{(simulationResult?.DILI_score || 0.63).toFixed(2)}</div>
                            <span className="text-[11px] text-slate-400">risiko sedang</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[100px]">
                            <span className="text-xs text-slate-500 mb-1">Mekanisme</span>
                            <div className="text-2xl lg:text-3xl font-bold text-slate-800 leading-none mb-1 mt-auto">Kolestatik</div>
                            <span className="text-[11px] text-slate-400">idiosinkratik · dose-independent</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[100px]">
                            <span className="text-xs text-slate-500 mb-1">Zona Terdampak</span>
                            <div className="text-2xl lg:text-3xl font-bold text-slate-800 leading-none mb-1 mt-auto">Portal</div>
                            <span className="text-[11px] text-slate-400">periportal - saluran empedu</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[100px]">
                            <span className="text-xs text-slate-500 mb-1">Model</span>
                            <div className="text-xl lg:text-2xl font-bold text-slate-800 leading-tight mb-1 mt-auto">Hybrid GCN+RDKit</div>
                            <span className="text-[11px] text-slate-400">dataset DILIrank (FDA LTKB)</span>
                        </div>
                    </div>
                  )
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                       <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[100px]">
                          <span className="text-xs text-slate-500 mb-1">Skor Risiko DILI</span>
                          <div className="text-3xl lg:text-4xl font-bold text-yellow-600 leading-none mb-1 mt-auto">{(simulationResult?.DILI_score || 0.58).toFixed(2)}</div>
                          <span className="text-[11px] text-slate-400">risiko sedang - AUC {simulationResult?.triase_metrics?.auc_range || '0.75-0.85'}</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[100px]">
                          <span className="text-xs text-slate-500 mb-1">Senyawa Input</span>
                          <div className="text-2xl lg:text-3xl font-bold text-slate-800 leading-none mb-1 mt-auto truncate" title={simulationResult?.input_smiles ?? undefined}>{simulationResult?.input_smiles || 'Aspirin'}</div>
                          <span className="text-[11px] text-slate-400">SMILES tervalidasi RDKit</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[100px]">
                          <span className="text-xs text-slate-500 mb-1">Sensitivity / Specificity</span>
                          <div className="text-2xl lg:text-3xl font-bold text-slate-800 leading-none mb-1 mt-auto">
                            {simulationResult?.triase_metrics?.sensitivity || 0.79} / {simulationResult?.triase_metrics?.specificity || 0.74}
                          </div>
                          <span className="text-[11px] text-slate-400">test set eksternal Xu et al. 2015</span>
                      </div>
                       <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[100px]">
                          <span className="text-xs text-slate-500 mb-1">Baseline Pembanding</span>
                          <div className="text-2xl lg:text-3xl font-bold text-slate-800 leading-none mb-1 mt-auto">Acc {simulationResult?.triase_metrics?.accuracy || 0.631}</div>
                          <span className="text-[11px] text-slate-400">Random Forest, Mostafa et al. 2024</span>
                      </div>
                  </div>
                )}
            </div>

            {/* CHARTS AREA */}
            <div>
                {mode === 'edukasi_mendalam' ? (
                  compoundClass === 'dose_dependent' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Line Chart PK/PD */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:p-6 shadow-sm flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div className="pr-2">
                                    <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Grafik PK/PD</h3>
                                    <p className="text-sm sm:text-base font-bold text-slate-800 mt-1 leading-tight">Kurva C plasma(t) dan NAPQI/GSH</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-[11px] font-semibold text-slate-500 whitespace-nowrap items-end sm:items-center">
                                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"></div><span>C plasma(t)</span></div>
                                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-600 flex-shrink-0"></div><span>NAPQI/GSH</span></div>
                                </div>
                            </div>
                            <div className="flex-1 w-full relative min-h-[220px] lg:min-h-[260px] flex flex-col justify-end">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={simulationResult?.time_series_pkpd || []} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                        <CartesianGrid vertical={false} stroke="#f1f5f9" strokeWidth={1.5} strokeDasharray="4 4" />
                                        <XAxis dataKey="time" axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} ticks={simulationResult?.time_series_pkpd?.map(d => d.time) || [0, 6, 12, 18, 24]} />
                                        <YAxis hide domain={[0, 'auto']} />
                                        <Tooltip content={<PKPDTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '4 4' }} />
                                        <Line name="C plasma(t)" type="monotone" dataKey="concentration" stroke="#3b82f6" strokeWidth={3.5} dot={false} isAnimationActive={true} />
                                        <Line name="NAPQI" type="monotone" dataKey="napqi" stroke="#dc2626" strokeWidth={3.5} dot={false} isAnimationActive={true} />
                                    </LineChart>
                                </ResponsiveContainer>
                                <div className="flex justify-between text-[11px] font-medium text-slate-400 absolute bottom-0 w-full px-2 pb-1 pointer-events-none">
                                    <span>{simulationResult?.time_series_pkpd?.[0]?.time ?? 0} jam</span>
                                    <span>{simulationResult?.time_series_pkpd?.[(simulationResult?.time_series_pkpd?.length ?? 1) - 1]?.time ?? 24} jam</span>
                                </div>
                            </div>
                        </div>

                        {/* Nomogram Chart */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:p-6 shadow-sm flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Referensi Klinis</h3>
                                    <p className="text-sm sm:text-base font-bold text-slate-800 mt-1 leading-tight">Nomogram Rumack-Matthew</p>
                                </div>
                                <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-sm tracking-wide">DI ATAS 150</span>
                            </div>
                            <div className="flex-1 w-full relative min-h-[220px] lg:min-h-[260px] flex">
                                <div className="flex flex-col justify-between text-[11px] font-medium text-slate-400 pr-3 pb-[24px]">
                                    <span>200</span><span>100</span><span>50</span><span>20</span><span>10</span>
                                </div>
                                <div className="flex-1 relative flex flex-col justify-end">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={simulationResult?.nomogram_data || []} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                            <CartesianGrid vertical={false} stroke="#f1f5f9" strokeWidth={1.5} strokeDasharray="4 4" />
                                            <XAxis dataKey="time" axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} ticks={simulationResult?.nomogram_data?.map(d => d.time) || [4, 8, 12, 16, 20, 24]} />
                                            <YAxis hide domain={[0, 250]} />
                                            <Tooltip content={<NomogramTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '4 4' }} />
                                            <Line dataKey="rumack_line_200" stroke="#f59e0b" strokeWidth={2.5} dot={false} isAnimationActive={true} label={(props: { index?: number; x?: number | string; y?: number | string; stroke?: string }) => props.index === (simulationResult?.nomogram_data?.length || 0) - 1 ? <NomogramLabel {...props} value="200-line" stroke="#f59e0b" /> : null} />
                                            <Line dataKey="rumack_line_150" stroke="#dc2626" strokeWidth={2.5} strokeDasharray="6 4" dot={false} isAnimationActive={true} label={(props: { index?: number; x?: number | string; y?: number | string; stroke?: string }) => props.index === (simulationResult?.nomogram_data?.length || 0) - 1 ? <NomogramLabel {...props} value="150-line" stroke="#dc2626" /> : null} />
                                            <Scatter dataKey="plasma_concentration" fill="#0f172a" isAnimationActive={true} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                    <div className="flex justify-between text-[11px] font-medium text-slate-400 absolute bottom-0 w-full px-2 pb-1 pointer-events-none">
                                        <span>{simulationResult?.nomogram_data?.[0]?.time ?? 4} jam</span>
                                        <span>{simulationResult?.nomogram_data?.[(simulationResult?.nomogram_data?.length ?? 1) - 1]?.time ?? 24} jam</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         <div className="bg-white border border-slate-200 rounded-xl p-5 lg:p-6 shadow-sm">
                            <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1">Explainability (SHAP × RDKit SMARTS)</h3>
                            <p className="text-sm lg:text-base font-bold text-slate-800 mb-6">Kontribusi gugus kimia terhadap skor risiko</p>
                            <div className="space-y-5">
                                {simulationResult?.explainability_with_shap ? (
                                  simulationResult.explainability_with_shap.map((item: ExplainabilityShap, idx: number) => (
                                    <div key={idx} className="relative pt-1">
                                      <div className="flex justify-between text-xs lg:text-sm mb-1.5">
                                        <span className="text-slate-600">{item.feature}</span>
                                        <span className="font-bold text-purple-600">+{item.value}</span>
                                      </div>
                                      <div className="overflow-hidden h-2.5 flex rounded-full bg-slate-100">
                                        <div style={{ width: `${item.percentage || 50}%` }} className="bg-violet-500 rounded-full"></div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-sm text-slate-500 italic">Data explainability tidak tersedia.</div>
                                )}
                            </div>
                         </div>

                         <div className="bg-white border border-slate-200 rounded-xl p-5 lg:p-6 shadow-sm">
                            <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1">Model Klasifikasi (Bukan Kurva Waktu)</h3>
                            <p className="text-sm lg:text-base font-bold text-slate-800 mb-6">Distribusi probabilitas klasifikasi AI</p>
                            <div className="space-y-5">
                                {simulationResult?.mock_probabilities ? (
                                  simulationResult.mock_probabilities.map((item: MockProbability, idx: number) => (
                                    <div key={idx} className="relative pt-1">
                                      <div className="flex justify-between text-xs lg:text-sm mb-1.5">
                                        <span className="text-slate-600">{item.label}</span>
                                        <span className={`font-bold ${item.color.replace('bg-', 'text-')}`}>{item.value}%</span>
                                      </div>
                                      <div className="overflow-hidden h-2.5 flex rounded-full bg-slate-100">
                                        <div style={{ width: `${item.value}%` }} className={`${item.color} rounded-full`}></div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-sm text-slate-500 italic">Data probabilitas tidak tersedia.</div>
                                )}
                            </div>
                         </div>
                    </div>
                  )
                ) : (
                  <div className="w-full">
                       <div className="bg-white border border-slate-200 rounded-xl p-5 lg:p-6 shadow-sm w-full">
                          <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1">Explainability Substruktur (SHAP × RDKit SMARTS)</h3>
                          <p className="text-sm lg:text-base font-bold text-slate-800 mb-6">Gugus kimia yang paling memengaruhi skor risiko senyawa ini</p>
                          <div className="flex flex-wrap gap-3">
                              {simulationResult?.explainability_with_shap ? (
                                simulationResult.explainability_with_shap.map((item: ExplainabilityShap, idx: number) => (
                                  <div key={idx} className="border border-violet-200 bg-violet-50 rounded-full px-5 py-2.5 flex items-center gap-3 shadow-sm">
                                      <span className="text-xs sm:text-sm text-slate-700 font-medium">{item.feature}</span>
                                      <span className="text-xs sm:text-sm font-bold text-violet-600">+{item.value}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-sm text-slate-500 italic">Data explainability tidak tersedia.</div>
                              )}
                          </div>
                       </div>
                  </div>
                )}
            </div>

            {/* WARNING BANNER */}
            <div className="w-full fade-in">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-start gap-4 shadow-sm">
                    <svg className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                    <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                        <strong className="font-bold">HepaTwin adalah alat bantu pembelajaran & triase in-silico, bukan pengganti uji klinis/laboratorium.</strong><br/>
                        <span className="block mt-1">
                          {mode === 'triase_umum' 
                            ? 'Skor ini adalah alat bantu triase/prioritisasi awal in-silico, BUKAN pengganti uji toksisitas/klinis pada senyawa apapun. Tidak ada satupun metode in-silico yang dapat menggantikan pengujian pada endpoint toksikologi kompleks (Madden et al., 2020).' 
                            : compoundClass === 'dose_dependent' 
                              ? 'Rasio NAPQI/GSH adalah konstruksi mekanistik riset — bukan alat klinis; nomogram Rumack-Matthew tetap acuan klinis utama.'
                              : 'Pola kolestatik & skor risiko sepenuhnya digerakkan oleh model AI — tidak ada persamaan PK/PD deterministik untuk senyawa idiosinkratik.'}
                        </span>
                    </div>
                </div>
            </div>

        </div>
    </>
  );
};
