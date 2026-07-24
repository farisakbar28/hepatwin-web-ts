import { useState } from 'react';
import { useAppStore } from '../../state/store';
import type { SimulationRequest } from '../../types';

export function ControlPanel() {
  const { mode, setMode, connectionStatus, runSimulation, isSimulating } = useAppStore();
  
  const [compound, setCompound] = useState<'paracetamol' | 'amox_clav'>('paracetamol');
  const [dose, setDose] = useState(150);
  const [smiles, setSmiles] = useState('CC(=O)Oc1ccccc1C(=O)O');
  const [smilesError, setSmilesError] = useState('');

  const sliderProgress = ((dose - 10) / (250 - 10)) * 100;

  const handleSimulate = () => {
    setSmilesError('');
    
    const finalPayload: SimulationRequest = { mode };
    
    if (mode === 'edukasi_mendalam') {
      finalPayload.compound_id = compound || 'paracetamol';
      finalPayload.dose_mg_kg = dose ? Number(dose) : 150;
      finalPayload.smiles_string = null;
    } else {
      if (!smiles.trim()) {
        setSmilesError('SMILES tidak boleh kosong');
        return;
      }
      
      if (smiles.length < 2) {
        setSmilesError('Notasi SMILES terlalu pendek');
        return;
      }
      
      finalPayload.smiles_string = smiles.trim();
      finalPayload.compound_id = null;
      finalPayload.dose_mg_kg = null;
    }

    runSimulation(finalPayload);
  };

  return (
    <>
      {/* SIMULATION MODE TOGGLE */}
      <div>
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block mb-3">Mode Simulasi</span>
          <div className="flex gap-2 w-full">
              <button 
                  className={`flex-1 text-center shadow-sm rounded-full px-2 py-2 text-xs sm:text-sm font-semibold transition-all ${mode === 'edukasi_mendalam' ? 'bg-blue-600 text-white border border-blue-600' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`} 
                  onClick={() => { setMode('edukasi_mendalam'); setSmilesError(''); }}
              >
                  Edukasi Mendalam
              </button>
              <button 
                  className={`flex-1 text-center shadow-sm rounded-full px-2 py-2 text-xs sm:text-sm font-semibold transition-all ${mode === 'triase_umum' ? 'bg-blue-600 text-white border border-blue-600' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`} 
                  onClick={() => setMode('triase_umum')}
              >
                  Triase Umum
              </button>
          </div>
      </div>

      <hr className="border-slate-200" />

      {mode === 'edukasi_mendalam' ? (
        <div className="flex flex-col fade-in">
          {/* Compound Selector */}
          <div className="mb-5 relative">
              <label className="block text-xs font-bold text-slate-700 mb-2">Pilih Senyawa (Flagship)</label>
              <div className="relative">
                  <select 
                      value={compound}
                      onChange={(e) => setCompound(e.target.value as 'paracetamol' | 'amox_clav')}
                      className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-8 appearance-none shadow-sm transition-colors"
                  >
                      <option value="paracetamol">Parasetamol (Acetaminophen)</option>
                      <option value="amox_clav">Amoxicillin-Clavulanate</option>
                  </select>
                  {/* Custom Select Icon */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
              </div>
          </div>

          {/* Dose Slider */}
          <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                  <label className="block text-xs font-bold text-slate-700">Dosis (mg/kg)</label>
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{dose}</span>
              </div>
              <div className="pt-1">
                  <input 
                      type="range" 
                      min="10" 
                      max="250" 
                      value={dose} 
                      onChange={(e) => setDose(Number(e.target.value))}
                      className="w-full h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer" 
                      style={{ '--range-progress': `${sliderProgress}%` } as React.CSSProperties}
                  />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-2 uppercase font-semibold">
                  <span>aman</span>
                  <span>{compound === 'paracetamol' ? 'overdosis' : 'tinggi'}</span>
              </div>
          </div>

          {/* Simulate Button */}
          <button 
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-bold rounded-xl text-sm px-5 py-3 text-center transition-colors mb-6 shadow-sm disabled:opacity-50"
          >
              {isSimulating ? 'Memproses...' : 'Simulasikan'}
          </button>

          {/* Status Indicators */}
          <ul className="space-y-3 text-xs text-slate-600 mb-5">
              <li className="flex items-start gap-3">
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${connectionStatus === 'Connected' ? 'bg-green-500' : 'bg-rose-500'}`}></div>
                  <span className="leading-tight">
                    {connectionStatus === 'Connected' ? 'Terhubung ke Backend AI' : 'Offline / Mock Mode'}
                  </span>
              </li>
              {compound === 'paracetamol' ? (
                <>
                  <li className="flex items-start gap-3"><div className="mt-1.5 w-2 h-2 bg-red-600 rounded-full flex-shrink-0"></div><span className="leading-tight">Hotspot sentrilobuler (Zona 3)</span></li>
                  <li className="flex items-start gap-3"><div className="mt-1.5 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div><span className="leading-tight">Model: PK/PD deterministik + estimasi AI</span></li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-3"><div className="mt-1.5 w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div><span className="leading-tight">Hotspot portal / periportal</span></li>
                  <li className="flex items-start gap-3"><div className="mt-1.5 w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div><span className="leading-tight">Model: skor klasifikasi AI hybrid</span></li>
                </>
              )}
          </ul>

          {/* Information Notes */}
          {compound === 'paracetamol' ? (
              <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-800 border border-blue-100 leading-relaxed">
                  <span className="font-bold block mb-1">Catatan model</span>
                  Untuk Parasetamol, visualisasi digerakkan persamaan PK/PD — AI berperan pelengkap.
              </div>
          ) : (
              <div className="bg-purple-50 rounded-xl p-4 text-xs text-purple-800 border border-purple-100 leading-relaxed">
                  <span className="font-bold block mb-1">Catatan model</span>
                  Idiosinkratik & dose-independent — tanpa AI, tidak ada dasar kalkulasi visual sama sekali untuk senyawa ini.
              </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col fade-in">
             <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2">Notasi SMILES Senyawa</label>
                <textarea 
                    value={smiles}
                    onChange={(e) => { setSmiles(e.target.value); setSmilesError(''); }}
                    className={`w-full bg-white border ${smilesError ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} text-slate-800 text-sm rounded-lg focus:ring-2 block p-3 font-mono h-24 resize-none shadow-sm`} 
                    placeholder="Masukkan SMILES..."
                />
                <p className="text-[10px] text-slate-400 mt-1.5 italic">contoh: CC(=O)Oc1ccccc1C(=O)O (uji cepat)</p>
                {smilesError && <p className="text-[10px] text-rose-500 mt-1">{smilesError}</p>}
            </div>

            <button 
                onClick={handleSimulate}
                disabled={isSimulating}
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-bold rounded-xl text-sm px-5 py-3 text-center transition-colors mb-6 shadow-sm disabled:opacity-50"
            >
                {isSimulating ? 'Memproses...' : 'Simulasikan'}
            </button>

            <ul className="space-y-3 text-xs text-slate-600 mb-5">
                <li className="flex items-start gap-3">
                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${connectionStatus === 'Connected' ? 'bg-green-500' : 'bg-rose-500'}`}></div>
                    <span className="leading-tight">
                        {connectionStatus === 'Connected' ? 'Terhubung ke Backend AI' : 'Offline / Mock Mode'}
                    </span>
                </li>
                <li className="flex items-start gap-3"><div className="mt-1.5 w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div><span className="leading-tight">Heatmap makro generik (bukan zonal)</span></li>
                <li className="flex items-start gap-3"><div className="mt-1.5 w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div><span className="leading-tight">Model: hybrid RDKit-SMARTS + GCN/GAT</span></li>
            </ul>

             <div className="bg-yellow-50 rounded-xl p-4 text-xs text-yellow-800 border border-yellow-200 leading-relaxed">
                <span className="font-bold block mb-1">Batas klaim</span>
                Berlaku untuk sembarang senyawa — skor triase awal, bukan diagnosis mekanisme spesifik (hepatoselular/kolestatik).
            </div>
        </div>
      )}
    </>
  );
};
