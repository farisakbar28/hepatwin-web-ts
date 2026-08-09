import { useState } from 'react';
import { useAppStore } from '../../state/store';
import type { SimulationRequest, CompoundSelection, SexCode } from '../../types';
import { MedicalDisclaimerModal } from '../modals/MedicalDisclaimerModal';
import { CompoundAutocomplete } from './CompoundAutocomplete';

const mapGenderToSexCode = (gender: 'M' | 'F'): SexCode => gender === 'M' ? 'L' : 'P';

export function ControlPanel() {
  const { connectionStatus, runSimulation, isSimulating, simulationError, clearSimulationError, disclaimerConsented, setDisclaimerConsented } = useAppStore();

  const [selectedCompound, setSelectedCompound] = useState<CompoundSelection | null>(null);

  const [dose, setDose] = useState<number | ''>(150);
  const [age, setAge] = useState<number | ''>(35);
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [weight, setWeight] = useState<number | ''>(70);
  const [height, setHeight] = useState<number | ''>(170);

  const [error, setError] = useState('');
  const [pendingPayload, setPendingPayload] = useState<SimulationRequest | null>(null);
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false);

  const handleSimulateClick = () => {
    setError('');
    clearSimulationError();

    if (!selectedCompound) {
      setError('Pilih senyawa dari daftar nama generik (INN).');
      return;
    }
    if (!dose || dose <= 0) {
      setError('Dosis bolus tunggal harus berupa angka positif (mg).');
      return;
    }
    if (age === '' || age < 0 || age > 100) {
      setError('Usia harus berada pada rentang 0–100 tahun.');
      return;
    }
    if (weight === '' || weight < 1 || weight > 350) {
      setError('Berat badan harus berada pada rentang 1–350 kg.');
      return;
    }
    if (height === '' || height < 30 || height > 250) {
      setError('Tinggi badan harus berada pada rentang 30–250 cm.');
      return;
    }

    const payload: SimulationRequest = {
      hepatwin_id: selectedCompound.hepatwin_id,
      dosis_mg: Number(dose),
      covariates: {
        usia: Number(age),
        jenis_kelamin: mapGenderToSexCode(gender),
        berat_badan_kg: Number(weight),
        tinggi_badan_cm: Number(height),
      },
    };

    if (disclaimerConsented) {
      void runSimulation(payload);
    } else {
      setPendingPayload(payload);
      setIsDisclaimerModalOpen(true);
    }
  };

  const handleExecuteSimulation = () => {
    if (!pendingPayload) return;
    setDisclaimerConsented(true);
    void runSimulation(pendingPayload);
    setPendingPayload(null);
  };

  const connectionLabel = connectionStatus === 'Connected'
    ? 'Terhubung ke Backend AI/PBPK'
    : connectionStatus === 'Loading'
      ? 'Memeriksa koneksi backend...'
      : 'Backend tidak tersedia';

  const connectionDot = connectionStatus === 'Connected'
    ? 'bg-green-500'
    : connectionStatus === 'Loading'
      ? 'bg-amber-500'
      : 'bg-rose-500';

  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">Pencarian Senyawa</h2>
        <CompoundAutocomplete selectedCompound={selectedCompound} setSelectedCompound={setSelectedCompound} />
      </div>

      <hr className="border-slate-200" />

      <div>
        <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">Parameter Simulasi</h2>

        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">Dosis Bolus Tunggal (mg)</label>
          <input
            type="number"
            min="0"
            value={dose}
            onChange={(e) => setDose(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block p-2 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Usia (thn)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={age}
              onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
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
              min="1"
              max="350"
              value={weight}
              onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block p-2 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tinggi (cm)</label>
            <input
              type="number"
              min="30"
              max="250"
              value={height}
              onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block p-2 shadow-sm"
            />
          </div>
        </div>

        {error && <p className="text-[10px] text-rose-500 mt-1 mb-2">{error}</p>}
        {simulationError && <p className="text-[10px] text-rose-600 mt-1 mb-2 bg-rose-50 border border-rose-100 rounded-lg p-2">{simulationError.message}</p>}

        <button
          onClick={handleSimulateClick}
          disabled={isSimulating || connectionStatus === 'Loading'}
          className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-bold rounded-xl text-sm px-5 py-3 text-center transition-colors shadow-sm disabled:opacity-50 mt-2"
        >
          {isSimulating ? 'Memproses...' : 'Simulasikan Toksisitas'}
        </button>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-200">
        <ul className="space-y-3 text-xs text-slate-600">
          <li className="flex items-start gap-3">
              <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${connectionDot}`}></div>
              <span className="leading-tight">{connectionLabel}</span>
          </li>
          <li className="flex items-start gap-3">
              <div className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0 bg-blue-500"></div>
              <span className="leading-tight">
                Autocomplete memakai daftar senyawa simulatable dari backend HepaTwin.
              </span>
          </li>
        </ul>
      </div>

      <MedicalDisclaimerModal
        isOpen={isDisclaimerModalOpen}
        onClose={() => {
          setIsDisclaimerModalOpen(false);
          setPendingPayload(null);
        }}
        onConfirm={handleExecuteSimulation}
      />
    </div>
  );
}
