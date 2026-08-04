import { create } from 'zustand';
import type { SimulationRequest, SimulationResponse } from '../types';
import { simulateDILI, checkHealth } from '../services/api';

type ConnectionStatus = 'Loading' | 'Connected' | 'Disconnected';

interface AppState {
  connectionStatus: ConnectionStatus;
  isSimulating: boolean;
  simulationResult: SimulationResponse | null;
  
  checkConnection: () => Promise<void>;
  runSimulation: (payload: SimulationRequest) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  connectionStatus: 'Loading',
  isSimulating: false,
  simulationResult: null,

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
