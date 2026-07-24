import { create } from 'zustand';
import type { SimulationRequest, SimulationResponse, SimulationMode } from '../types';
import { simulateDILI, checkHealth } from '../services/api';

type ConnectionStatus = 'Loading' | 'Connected' | 'Disconnected';

interface AppState {
  mode: SimulationMode;
  connectionStatus: ConnectionStatus;
  isSimulating: boolean;
  simulationResult: SimulationResponse | null;
  
  setMode: (mode: SimulationMode) => void;
  checkConnection: () => Promise<void>;
  runSimulation: (payload: SimulationRequest) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  mode: 'edukasi_mendalam',
  connectionStatus: 'Loading',
  isSimulating: false,
  simulationResult: null,

  setMode: (mode) => set({ mode, simulationResult: null }),
  
  checkConnection: async () => {
    set({ connectionStatus: 'Loading' });
    const isUp = await checkHealth();
    set({ connectionStatus: isUp ? 'Connected' : 'Disconnected' });
  },

  runSimulation: async (payload) => {
    set({ isSimulating: true });
    try {
      const result = await simulateDILI(payload);
      set({ simulationResult: { ...result }, isSimulating: false });
    } catch (error) {
      console.error('Simulation failed', error);
      set({ isSimulating: false });
    }
  }
}));
