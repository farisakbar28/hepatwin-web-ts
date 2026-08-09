import { useAppStore } from '../../state/store';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { MedicalDisclaimerFooter } from '../common/MedicalDisclaimerFooter';
import { largeMoleculeErrorMessageFor } from '../../services/compoundMeta';
import { MODEL_UNAVAILABLE_LABEL, exposureCategoryLabel, injuryPatternLabel, labelOrRaw, riskPriorityLabel, shapGroupLabel } from '../../constants/labels';

import type { TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

type CustomTooltipProps = TooltipProps<ValueType, NameType> & {
    payload?: Record<string, unknown>[];
    label?: string | number;
};

export function AcademicDashboard() {
    const { simulationResult, isSimulating, simulationError, lastSimulationHepatwinId } = useAppStore();
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
                        {largeMoleculeErrorMessageFor(simulationError, lastSimulationHepatwinId)}
                    </div>
                )}

                {isSimulating && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-4 text-sm">
                        Simulasi AI/PBPK sedang berjalan...
                    </div>
                )}

                {simulationResult && (
                    <>
                        {simulationResult.model_status !== 'trained' && (
                            <div className="mb-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2 text-xs">
                                {MODEL_UNAVAILABLE_LABEL}
                            </div>
                        )}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">Probabilitas Cedera Hati Akibat Obat (DILI)</p>
                                <p className="text-lg font-bold text-slate-800">{(simulationResult.dili_score * 100).toFixed(1)}%</p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">Prioritas</p>
                                <p className="text-sm font-bold text-slate-800">{riskPriorityLabel[simulationResult.risk_level]}</p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">Kategori Paparan</p>
                                <p className="text-sm font-bold text-slate-800">{exposureCategoryLabel[simulationResult.exposure_category]}</p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">Pola Cedera</p>
                                <p className="text-sm font-bold text-slate-800">{labelOrRaw(injuryPatternLabel, simulationResult.injury_pattern)}</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-wrap text-[11px] text-slate-500 bg-slate-100/80 rounded-lg px-3 py-1.5 mb-6 border border-slate-200/60">
                            <span title="Kalibrasi distribusi internal - ambang dari data internal, bukan ambang klinis tervalidasi">Sumber: Kalibrasi distribusi internal HepaTwin</span>
                            <span className="italic">Warna &amp; prioritas visual DSS in-silico, bukan keputusan terapi.</span>
                        </div>
                    </>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col h-[380px] lg:h-[420px]">
                        <div className="flex justify-between items-start mb-5">
                            <div className="pr-2">
                                <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Simulasi Farmakokinetika (PBPK)</h3>
                                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1 leading-tight">Kurva Paparan Konsentrasi di Hati (24 Jam)</p>
                                <p className="text-[11px] text-slate-500 mt-1">Tanpa ambang batas klinis absolut.</p>
                            </div>
                            <div className="flex text-[11px] font-semibold text-slate-500 whitespace-nowrap items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                                    <span>Konsentrasi di Hati (mg/L)</span>
                                </div>
                            </div>
                        </div>

                        {simulationResult && (
                            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                                <div className="bg-slate-50 rounded-lg p-2" title="Konsentrasi puncak obat di hati (mg/L) - hasil simulasi, bukan ukuran klinis"><span className="text-slate-500">Cmax hati:</span> <strong>{simulationResult.cmax_liver_mg_l.toFixed(3)} mg/L</strong></div>
                                <div className="bg-slate-50 rounded-lg p-2" title="Luas area di bawah kurva konsentrasi di hati (mg·h/L) - hasil simulasi, bukan ukuran klinis"><span className="text-slate-500">AUC hati:</span> <strong>{simulationResult.auc_liver_mg_h_l.toFixed(3)} mg·h/L</strong></div>
                                <div className="bg-slate-50 rounded-lg p-2" title="Bentuk kurva / kecepatan decay relatif (h⁻¹) - bukan ambang risiko dan bukan ukuran tinggi-rendah paparan"><span className="text-slate-500">Rasio kurva (Cmax/AUC):</span> <strong>{simulationResult.shape_ratio_h_inv.toFixed(4)} h⁻¹</strong></div>
                                <div className="bg-slate-50 rounded-lg p-2" title="Indeks komputasional tanpa satuan - bukan kadar obat klinis"><span className="text-slate-500">Indeks paparan in-silico:</span> <strong>{simulationResult.exposure_index.toFixed(3)}</strong></div>
                            </div>
                        )}

                        <div className="flex-1 w-full relative flex flex-col justify-end min-h-[140px] sm:min-h-[180px]">
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
                                            name="Konsentrasi Hati"
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
                                    {isSimulating ? 'Menunggu kurva PBPK dari backend...' : 'Lakukan simulasi untuk melihat kurva konsentrasi di hati.'}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col h-[380px] lg:h-[420px]">
                        <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1">Penjelasan Model AI (SHAP)</h3>
                        <p className="text-sm lg:text-base font-bold text-slate-800 mb-2">Kontribusi komputasional fitur kimia</p>
                        <p className="text-[11px] text-slate-500 mb-5">Kontribusi ini bukan bukti biokimia dan bukan dasar keputusan klinis.</p>

                        <div className="space-y-3 overflow-y-auto pr-1">
                            {simulationResult?.explainability_shap && simulationResult.explainability_shap.length > 0 ? (
                                simulationResult.explainability_shap.map((item, idx) => (
                                    <div key={`${item}-${idx}`} className="border border-slate-100 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                                        {labelOrRaw(shapGroupLabel, item)}
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-slate-500 italic border border-slate-100 p-4 rounded-lg bg-slate-50 text-center">
                                    {isSimulating ? 'Menunggu kontribusi SHAP dari backend...' : 'Lakukan simulasi untuk melihat kontribusi fitur kimia.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <MedicalDisclaimerFooter />

                {/* Lampiran Teknis — hanya tampil saat print/PDF.
                    UI interaktif menampilkan label terjemahan; nilai teknis
                    dokumentasi tetap hadir di laporan PDF. */}
                {simulationResult && (
                    <div className="hidden print:block mt-6 text-[10px] text-slate-600 border border-slate-300 rounded-lg p-4 bg-white">
                        <p className="font-bold mb-2 uppercase tracking-wide">Lampiran Teknis - Asumsi &amp; Nilai Simulasi</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Tanggal simulasi: {new Date().toLocaleString('id-ID')}</li>
                            <li>segment_mapping_type = {simulationResult.segment_mapping_type}</li>
                            <li>exposure_category_source = {simulationResult.exposure_category_source}</li>
                            <li>Asumsi aktif PBPK: model linear bolus tunggal; tanpa absorpsi oral, tanpa protein binding, tanpa Km/Vmax, tanpa NAPQI/glutathione, tanpa parameter IVIVE compound-specific penuh.</li>
                            <li>Disclaimer: hasil simulasi bukan keputusan klinis / rekomendasi terapi; bukan pengganti uji in-vitro, in-vivo, uji klinis, atau penilaian regulator.</li>
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
}
