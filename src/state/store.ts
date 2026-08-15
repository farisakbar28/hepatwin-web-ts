import { create } from 'zustand';
import type { AppApiError, SimulationRequest, SimulationResponse } from '../types';
import { simulateDILI, probeHealthWithRetries } from '../services/api';

export type ConnectionStatus = 'Loading' | 'Connected' | 'Disconnected';

export interface CheckConnectionOptions {
  /** true = jangan set status ke 'Loading' saat mulai memeriksa. Dipakai ping
   *  keep-alive latar belakang agar tidak mem-flash UI setiap 5 menit. */
  silent?: boolean;
}

interface AppState {
  connectionStatus: ConnectionStatus;
  isSimulating: boolean;
  simulationResult: SimulationResponse | null;
  simulationError: AppApiError | null;
  activeRequestId: number;
  disclaimerConsented: boolean;
  /** hepatwin_id dari upaya simulasi terakhir -- konteks pesan error (mis. senyawa berukuran besar) di banner dashboard. */
  lastSimulationHepatwinId: string | null;
  /** Payload dari upaya simulasi terakhir (berhasil maupun gagal) -- dasar
   *  tombol "Coba Lagi" setelah error. */
  lastSimulationRequest: SimulationRequest | null;

  checkConnection: (options?: CheckConnectionOptions) => Promise<void>;
  runSimulation: (payload: SimulationRequest) => Promise<void>;
  retryLastSimulation: () => Promise<void>;
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
  lastSimulationRequest: null,

  checkConnection: async (options) => {
    const silent = options?.silent === true;
    if (!silent) set({ connectionStatus: 'Loading' });
    // Probe + retry sadar cold start: health check sering menjadi request
    // pertama setelah idle, jadi harus sabar menunggu instance backend
    // menyala (30–60 dtk) sebelum menyatakan backend tidak tersedia.
    const isUp = await probeHealthWithRetries();
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
      lastSimulationRequest: payload,
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

  retryLastSimulation: async () => {
    const payload = get().lastSimulationRequest;
    if (!payload) return;
    await get().runSimulation(payload);
  },

  clearSimulationError: () => set({ simulationError: null }),
  setDisclaimerConsented: (consented) => set({ disclaimerConsented: consented }),
}));
