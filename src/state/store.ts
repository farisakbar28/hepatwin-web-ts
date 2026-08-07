import { create } from 'zustand';
import type { AppApiError, SimulationRequest, SimulationResponse } from '../types';
import { simulateDILI, checkHealth } from '../services/api';

export type ConnectionStatus = 'Loading' | 'Connected' | 'Disconnected';

type ResultSource = 'backend' | null;

interface AppState {
  connectionStatus: ConnectionStatus;
  isSimulating: boolean;
  simulationResult: SimulationResponse | null;
  simulationError: AppApiError | null;
  resultSource: ResultSource;
  activeRequestId: number;
  disclaimerConsented: boolean;

  checkConnection: () => Promise<void>;
  runSimulation: (payload: SimulationRequest) => Promise<void>;
  clearSimulationError: () => void;
  setDisclaimerConsented: (consented: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  connectionStatus: 'Loading',
  isSimulating: false,
  simulationResult: null,
  simulationError: null,
  resultSource: null,
  activeRequestId: 0,
  disclaimerConsented: false,

  checkConnection: async () => {
    set({ connectionStatus: 'Loading' });
    const isUp = await checkHealth();
    set({ connectionStatus: isUp ? 'Connected' : 'Disconnected' });
  },

  runSimulation: async (payload) => {
    const requestId = get().activeRequestId + 1;
    set({
      activeRequestId: requestId,
      isSimulating: true,
      simulationError: null,
      simulationResult: null,
      resultSource: null,
    });

    try {
      const result = await simulateDILI(payload);
      if (get().activeRequestId !== requestId) return;
      set({
        simulationResult: result,
        resultSource: 'backend',
        isSimulating: false,
        simulationError: null,
      });
    } catch (error) {
      if (get().activeRequestId !== requestId) return;
      set({
        simulationError: error as AppApiError,
        simulationResult: null,
        resultSource: null,
        isSimulating: false,
      });
      void get().checkConnection();
    }
  },

  clearSimulationError: () => set({ simulationError: null }),
  setDisclaimerConsented: (consented) => set({ disclaimerConsented: consented }),
}));
