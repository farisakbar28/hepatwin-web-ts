import { useState } from 'react';
import { useAppStore } from '../../state/store';
import { Activity, Beaker, ServerCrash, Server, AlertCircle } from 'lucide-react';
import type { SimulationRequest } from '../../types';

export function ControlPanel() {
  const { mode, setMode, connectionStatus, runSimulation, isSimulating } = useAppStore();
  
  const [compound, setCompound] = useState<'paracetamol' | 'amox_clav'>('paracetamol');
  const [dose, setDose] = useState(150);
  const [smiles, setSmiles] = useState('');
  const [smilesError, setSmilesError] = useState('');

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
      
      // Basic client-side validation
      if (smiles.length < 2) {
        setSmilesError('Notasi SMILES terlalu pendek');
        return;
      }
      
      finalPayload.smiles_string = smiles.trim();
      finalPayload.compound_id = null;
      finalPayload.dose_mg_kg = null;
    }

    console.log("🚀 SENDING SANITIZED PAYLOAD TO FASTAPI:", finalPayload);
    runSimulation(finalPayload);
  };

  return (
    <div className="h-full bg-slate-900 border-r border-slate-700 p-6 flex flex-col text-slate-100">
      <div className="flex items-center gap-3 mb-8">
        <Beaker className="text-emerald-400 w-8 h-8" />
        <h1 className="text-2xl font-bold tracking-tight">HepaTwin</h1>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-400">Status API</span>
          {connectionStatus === 'Connected' ? (
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
              <Server className="w-3 h-3" /> Connected
            </span>
          ) : connectionStatus === 'Disconnected' ? (
            <span className="flex items-center gap-1 text-xs text-rose-400 bg-rose-400/10 px-2 py-1 rounded">
              <ServerCrash className="w-3 h-3" /> Mock Mode
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
              <Activity className="w-3 h-3 animate-spin" /> Ping...
            </span>
          )}
        </div>
      </div>

      <div className="flex bg-slate-800 p-1 rounded-lg mb-8">
        <button
          onClick={() => { setMode('edukasi_mendalam'); setSmilesError(''); }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'edukasi_mendalam' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Edukasi Mendalam
        </button>
        <button
          onClick={() => setMode('triase_umum')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'triase_umum' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Triase Umum
        </button>
      </div>

      <div className="flex-1">
        {mode === 'edukasi_mendalam' ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Senyawa Flagship</label>
              <select 
                value={compound}
                onChange={(e) => setCompound(e.target.value as 'paracetamol' | 'amox_clav')}
                className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="paracetamol">Acetaminophen / Parasetamol</option>
                <option value="amox_clav">Amoxicillin-Clavulanate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Dosis (mg/kg) : <span className="text-emerald-400 font-mono">{dose}</span>
              </label>
              <input 
                type="range" 
                min="10" 
                max="300" 
                step="10"
                value={dose}
                onChange={(e) => setDose(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Input SMILES</label>
              <textarea 
                value={smiles}
                onChange={(e) => { setSmiles(e.target.value); setSmilesError(''); }}
                placeholder="Misal: CC(=O)NC1=CC=C(O)C=C1"
                className={`w-full h-32 bg-slate-800 border ${smilesError ? 'border-rose-500' : 'border-slate-700'} rounded-md py-2 px-3 text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none`}
              />
              {smilesError && (
                <p className="mt-2 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {smilesError}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleSimulate}
        disabled={isSimulating}
        className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isSimulating ? <Activity className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
        {isSimulating ? 'Memproses...' : 'Simulasikan'}
      </button>
    </div>
  );
};
