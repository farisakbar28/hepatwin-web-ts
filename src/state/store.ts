import { create } from 'zustand';
import type { AppApiError, SimulationRequest, SimulationResponse } from '../types';
import { simulateDILI, checkHealth } from '../services/api';

export type ConnectionStatus = 'Loading' | 'Connected' | 'Disconnected';

interface AppState {
  connectionStatus: ConnectionStatus;
  isSimulating: boolean;
  simulationResult: SimulationResponse | null;
  simulationError: AppApiError | null;
  activeRequestId: number;
  disclaimerConsented: boolean;
  /** hepatwin_id dari upaya simulasi terakhir -- konteks pesan error (mis. senyawa berukuran besar) di banner dashboard. */
  lastSimulationHepatwinId: string | null;

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
  activeRequestId: 0,
  disclaimerConsented: false,
  lastSimulationHepatwinId: null,

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
      lastSimulationHepatwinId: payload.hepatwin_id,
    });

    try {
      const result = await simulateDILI(payload);
      if (get().activeRequestId !== requestId) return;
      set({
        simulationResult: result,
        isSimulating: false,
        simulationError: null,
      });
    } catch (error) {
      if (get().activeRequestId !== requestId) return;
      set({
        simulationError: error as AppApiError,
        simulationResult: null,
        isSimulating: false,
      });
      void get().checkConnection();
    }
  },

  clearSimulationError: () => set({ simulationError: null }),
  setDisclaimerConsented: (consented) => set({ disclaimerConsented: consented }),
}));
