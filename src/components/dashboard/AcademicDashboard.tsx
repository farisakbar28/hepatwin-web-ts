import { useAppStore } from '../../state/store';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { MedicalDisclaimerFooter } from '../common/MedicalDisclaimerFooter';

import type { TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

type CustomTooltipProps = TooltipProps<ValueType, NameType> & {
    payload?: Record<string, unknown>[];
    label?: string | number;
};

const exposureLabel: Record<string, string> = {
    LOW_EXPOSURE: 'Paparan rendah',
    MODERATE_EXPOSURE: 'Paparan sedang',
    HIGH_EXPOSURE: 'Paparan tinggi',
};

const riskPriorityLabel: Record<string, string> = {
    low: 'Prioritas rendah in-silico',
    medium: 'Prioritas sedang in-silico',
    high: 'Prioritas tinggi untuk kajian lanjut',
};

export function AcademicDashboard() {
    const { simulationResult, isSimulating, simulationError } = useAppStore();
    const hasSeries = Boolean(simulationResult?.time_series_pbpk?.length);

    const PKPDTooltip = ({ active, payload, label }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-lg border border-slate-700">
                    <p className="font-bold mb-1">Waktu: {label} jam</p>
                    {payload.map((entry: Record<string, unknown>, index: number) => (
                        <p key={index} style={{ color: entry.color as string }}>
                            {entry.name as string}: {typeof entry.value === 'number' ? entry.value.toFixed(3) : (entry.value as string)} mg/L
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
                <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">Analisis DILI In-Silico - {simulationResult?.compound_name || 'Menunggu Input'}</h2>
            </div>

            <div className="w-full fade-in">
                {simulationError && (
                    <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 text-sm">
                        {simulationError.message}
                    </div>
                )}

                {isSimulating && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-4 text-sm">
                        Simulasi AI/PBPK sedang berjalan. Target respons PRD NFR-02: maksimal 5 detik.
                    </div>
                )}

                {simulationResult && (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">Probabilitas DILI</p>
                                <p className="text-lg font-bold text-slate-800">{(simulationResult.dili_score * 100).toFixed(1)}%</p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">Prioritas</p>
                                <p className="text-sm font-bold text-slate-800">{riskPriorityLabel[simulationResult.risk_level]}</p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">Exposure Category</p>
                                <p className="text-sm font-bold text-slate-800">{exposureLabel[simulationResult.exposure_category]}</p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">Model</p>
                                <p className="text-sm font-bold text-slate-800">{simulationResult.model_status || 'unavailable'}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 bg-slate-100/80 rounded-lg px-3 py-1.5 mb-6 border border-slate-200/60">
                            <span>Sumber Kalibrasi: <strong>{simulationResult.exposure_category_source || 'INTERNAL_DISTRIBUTIONAL_CALIBRATION'}</strong> ({simulationResult.exposure_calibration_version || 'v2.3'})</span>
                            <span className="italic">Warna &amp; prioritas visual DSS in-silico, bukan keputusan terapi.</span>
                        </div>
                    </>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-5 lg:p-6 shadow-sm flex flex-col h-[420px]">
                        <div className="flex justify-between items-start mb-5">
                            <div className="pr-2">
                                <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Farmakokinetika PBPK</h3>
                                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1 leading-tight">Kurva Paparan Hati C_hati(t) 24 Jam</p>
                                <p className="text-[11px] text-slate-500 mt-1">Tidak memakai threshold klinis absolut.</p>
                            </div>
                            <div className="flex text-[11px] font-semibold text-slate-500 whitespace-nowrap items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                                    <span>C_hati (mg/L)</span>
                                </div>
                            </div>
                        </div>

                        {simulationResult && (
                            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                                <div className="bg-slate-50 rounded-lg p-2"><span className="text-slate-500">Cmax_L:</span> <strong>{simulationResult.cmax_liver_mg_l.toFixed(3)} mg/L</strong></div>
                                <div className="bg-slate-50 rounded-lg p-2"><span className="text-slate-500">AUC_L:</span> <strong>{simulationResult.auc_liver_mg_h_l.toFixed(3)} mg·h/L</strong></div>
                                <div className="bg-slate-50 rounded-lg p-2"><span className="text-slate-500">shape_ratio_h_inv:</span> <strong>{simulationResult.shape_ratio_h_inv.toFixed(4)} h⁻¹</strong></div>
                                <div className="bg-slate-50 rounded-lg p-2"><span className="text-slate-500">exposure_index:</span> <strong>{simulationResult.exposure_index.toFixed(3)}</strong></div>
                            </div>
                        )}

                        <div className="flex-1 w-full relative flex flex-col justify-end">
                            {hasSeries ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={simulationResult?.time_series_pbpk || []} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                        <CartesianGrid vertical={false} stroke="#f1f5f9" strokeWidth={1.5} strokeDasharray="4 4" />
                                        <XAxis
                                            dataKey="time"
                                            axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                                            unit=" jam"
                                        />
                                        <YAxis domain={[0, 'auto']} tick={{ fontSize: 11, fill: '#94a3b8' }} width={44} />
                                        <Tooltip content={<PKPDTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '4 4' }} />
                                        <Line
                                            name="C_hati"
                                            type="monotone"
                                            dataKey="c_hati"
                                            stroke="#3b82f6"
                                            strokeWidth={3.5}
                                            dot={false}
                                            isAnimationActive={true}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-sm text-slate-500 italic border border-slate-100 rounded-lg bg-slate-50 text-center px-4">
                                    {isSimulating ? 'Menunggu kurva PBPK dari backend...' : 'Lakukan simulasi untuk melihat kurva C_hati(t).'}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-5 lg:p-6 shadow-sm flex flex-col h-[420px]">
                        <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1">Explainability SHAP</h3>
                        <p className="text-sm lg:text-base font-bold text-slate-800 mb-2">Attribution komputasional fitur kimia</p>
                        <p className="text-[11px] text-slate-500 mb-5">Attribution ini bukan bukti biokimia dan bukan dasar keputusan klinis.</p>

                        <div className="space-y-3 overflow-y-auto pr-1">
                            {simulationResult?.explainability_shap && simulationResult.explainability_shap.length > 0 ? (
                                simulationResult.explainability_shap.map((item, idx) => (
                                    <div key={`${item}-${idx}`} className="border border-slate-100 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                                        {item}
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-slate-500 italic border border-slate-100 p-4 rounded-lg bg-slate-50 text-center">
                                    {isSimulating ? 'Menunggu attribution SHAP dari backend...' : 'Lakukan simulasi untuk melihat attribution fitur kimia.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <MedicalDisclaimerFooter />
            </div>
        </>
    );
}
