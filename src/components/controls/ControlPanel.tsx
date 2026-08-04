import { useState, useMemo } from 'react';
import { useAppStore } from '../../state/store';
import type { SimulationRequest, CompoundSelection } from '../../types';
import { MedicalDisclaimerModal } from '../modals/MedicalDisclaimerModal';

// Mock list of 1231 compounds, we just provide a few for demonstration
const mockCompounds: CompoundSelection[] = [
  { hepatwin_id: 'paracetamol', compound_name: 'Paracetamol' },
  { hepatwin_id: 'amoxicillin', compound_name: 'Amoxicillin' },
  { hepatwin_id: 'ibuprofen', compound_name: 'Ibuprofen' },
  { hepatwin_id: 'isoniazid', compound_name: 'Isoniazid' },
  { hepatwin_id: 'rifampicin', compound_name: 'Rifampicin' }
];

export function ControlPanel() {
  const { connectionStatus, runSimulation, isSimulating } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompound, setSelectedCompound] = useState<CompoundSelection | null>(null);
  
  const [dose, setDose] = useState<number | ''>(150);
  const [age, setAge] = useState<number | ''>(35);
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [weight, setWeight] = useState<number | ''>(70);
  const [height, setHeight] = useState<number | ''>(170);

  const [error, setError] = useState('');
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false);

  const filteredCompounds = useMemo(() => {
    if (!searchTerm) return [];
    return mockCompounds.filter(c => c.compound_name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const handleSimulateClick = () => {
    setError('');
    
    if (!selectedCompound) {
      setError('Pilih senyawa dari daftar (Autocomplete INN).');
      return;
    }
    if (!dose || dose <= 0) {
      setError('Dosis harus berupa angka positif (mg).');
      return;
    }
    if (!age || age <= 0 || !weight || weight <= 0 || !height || height <= 0) {
      setError('Harap isi semua kovariat pasien dengan benar.');
      return;
    }

    // Open Modal Informed Consent before API call
    setIsDisclaimerModalOpen(true);
  };

  const handleExecuteSimulation = () => {
    if (!selectedCompound) return;

    const payload: SimulationRequest = {
      hepatwin_id: selectedCompound.hepatwin_id,
      dose_mg: Number(dose),
      patient_covariates: {
        age: Number(age),
        weight: Number(weight),
        height: Number(height),
        gender
      }
    };

    runSimulation(payload);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Simulation Setup */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">Pencarian Senyawa</h2>
        <div className="relative">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedCompound(null);
            }}
            placeholder="Ketik nama INN obat..."
            className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm"
          />
          {filteredCompounds.length > 0 && !selectedCompound && (
            <ul className="absolute z-10 w-full bg-white border border-slate-200 mt-1 max-h-40 overflow-y-auto rounded-lg shadow-lg">
              {filteredCompounds.map(c => (
                <li 
                  key={c.hepatwin_id}
                  onClick={() => {
                    setSelectedCompound(c);
                    setSearchTerm(c.compound_name);
                  }}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-slate-700"
                >
                  {c.compound_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Inputs */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">Parameter Simulasi</h2>
        
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">Dosis Bolus Tunggal (mg)</label>
          <input 
            type="number" 
            value={dose}
            onChange={(e) => setDose(Number(e.target.value))}
            className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block p-2 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Usia (thn)</label>
            <input 
              type="number" 
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block p-2 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
            <select 
              value={gender}
              onChange={(e) => setGender(e.target.value as 'M' | 'F')}
              className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block p-2 shadow-sm"
            >
              <option value="M">Laki-Laki</option>
              <option value="F">Perempuan</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Berat (kg)</label>
            <input 
              type="number" 
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block p-2 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tinggi (cm)</label>
            <input 
              type="number" 
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block p-2 shadow-sm"
            />
          </div>
        </div>

        {error && <p className="text-[10px] text-rose-500 mt-1 mb-2">{error}</p>}
        
        <button 
          onClick={handleSimulateClick}
          disabled={isSimulating}
          className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-bold rounded-xl text-sm px-5 py-3 text-center transition-colors shadow-sm disabled:opacity-50 mt-2"
        >
          {isSimulating ? 'Memproses...' : 'Simulasikan Toksisitas'}
        </button>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-200">
        <ul className="space-y-3 text-xs text-slate-600">
          <li className="flex items-start gap-3">
              <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${connectionStatus === 'Connected' ? 'bg-green-500' : 'bg-rose-500'}`}></div>
              <span className="leading-tight">
                {connectionStatus === 'Connected' ? 'Terhubung ke Backend AI' : 'Offline / Mock Mode'}
              </span>
          </li>
          <li className="flex items-start gap-3">
              <div className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0 bg-blue-500"></div>
              <span className="leading-tight">
                Data divalidasi ke 1.231 senyawa DILIrank 2.0
              </span>
          </li>
        </ul>
      </div>

      {/* Popup Modal Informed Consent */}
      <MedicalDisclaimerModal 
        isOpen={isDisclaimerModalOpen}
        onClose={() => setIsDisclaimerModalOpen(false)}
        onConfirm={handleExecuteSimulation}
      />
    </div>
  );
}
