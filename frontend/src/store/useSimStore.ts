import { create } from 'zustand';

export interface BatteryConfig {
  nSeries: number;
  nParallel: number;
  vNom: number;
  vMax: number;
  vMin: number;
  qNom: number;
  r0: number;
  r1: number;
  c1: number;
}

export interface SolarConfig {
  aPanel: number;
  etaPanel: number;
  etaMppt: number;
  vOcStc: number;
  iScStc: number;
}

export interface MissionPhase {
  name: string;
  durationMin: number;
  powerW: number;
}

export interface EnvironmentalConfig {
  gMin: number;
  gMax: number;
  cloudFactor: number;
  cloudStartMin: number;
  cloudEndMin: number;
}

export interface LCAConfig {
  feGrid: number;
  feSolar: number;
  nCycles: number;
  eeBatterie: number;
  feBatMfg: number;
  etaCharge: number;
}

export interface TimeStep {
  t: number;
  soc: number;
  v_bat: number;
  i_bat: number;
  p_load: number;
  p_solar: number;
  p_bat: number;
  phase: string;
}

export interface LCAMetrics {
  lce_no_solar: number;
  lce_with_solar: number;
  co2_no_solar: number;
  co2_with_solar: number;
  reduction_pct: number;
}

export interface SimResult {
  time_series: TimeStep[];
  lca_metrics: LCAMetrics;
  summary: {
    duration_min: number;
    final_soc: number;
    energy_used_wh: number;
    solar_energy_wh: number;
    max_current_a: number;
  };
}

interface SimState {
  battery: BatteryConfig;
  solar: SolarConfig;
  mission: MissionPhase[];
  environment: EnvironmentalConfig;
  lca: LCAConfig;
  result: SimResult | null;
  loading: boolean;
  isAnalyzing: boolean;
  aiAnalysis: string | null;
  isAuthenticated: boolean;
  userEmail: string | null;
  
  setBattery: (config: Partial<BatteryConfig>) => void;
  setSolar: (config: Partial<SolarConfig>) => void;
  setMission: (mission: MissionPhase[]) => void;
  setEnvironment: (config: Partial<EnvironmentalConfig>) => void;
  setLca: (config: Partial<LCAConfig>) => void;
  runSimulation: () => Promise<void>;
  analyzeResults: () => Promise<void>;
  login: (email: string) => void;
  logout: () => void;
}

export const useSimStore = create<SimState>((set, get) => ({
  battery: {
    nSeries: 4,
    nParallel: 2,
    vNom: 14.8,
    vMax: 16.8,
    vMin: 12.0,
    qNom: 10.0,
    r0: 0.050,
    r1: 0.010,
    c1: 2000.0,
  },
  solar: {
    aPanel: 0.42,
    etaPanel: 0.20,
    etaMppt: 0.95,
    vOcStc: 21.0,
    iScStc: 4.8,
  },
  mission: [
    { name: 'Décollage', durationMin: 3, powerW: 120.0 },
    { name: 'Montée', durationMin: 5, powerW: 90.0 },
    { name: 'Croisière', durationMin: 37, powerW: 55.0 },
    { name: 'Retour', durationMin: 5, powerW: 65.0 },
  ],
  environment: {
    gMin: 400,
    gMax: 850,
    cloudFactor: 0.5,
    cloudStartMin: 25,
    cloudEndMin: 30,
  },
  lca: {
    feGrid: 0.58,
    feSolar: 0.041,
    nCycles: 500,
    eeBatterie: 250.0,
    feBatMfg: 0.120,
    etaCharge: 0.90,
  },
  result: null,
  loading: false,
  isAnalyzing: false,
  aiAnalysis: null,
  isAuthenticated: false,
  userEmail: null,

  setBattery: (config) => set((state) => {
    const newBattery = { ...state.battery, ...config };
    // If nSeries changed, update the voltage thresholds automatically
    if (config.nSeries !== undefined) {
      newBattery.vNom = config.nSeries * 3.7;
      newBattery.vMax = config.nSeries * 4.2;
      newBattery.vMin = config.nSeries * 3.0;
    }
    return { battery: newBattery };
  }),
  setSolar: (config) => set((state) => ({ solar: { ...state.solar, ...config } })),
  setMission: (mission) => set({ mission }),
  setEnvironment: (config) => set((state) => ({ environment: { ...state.environment, ...config } })),
  setLca: (config) => set((state) => ({ lca: { ...state.lca, ...config } })),

  login: (email: string) => set({ isAuthenticated: true, userEmail: email }),
  logout: () => set({ isAuthenticated: false, userEmail: null, result: null, aiAnalysis: null }),

  runSimulation: async () => {
    const state = get();
    set({ loading: true, aiAnalysis: null });
    try {
      const { battery, solar, mission, environment, lca } = state;
      const payload = { battery, solar, mission, environment, lca };
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Simulation failed');
      }

      const data = await response.json();
      set({ result: { ...data, _ts: Date.now() }, loading: false });
      
      // Automatically trigger AI analysis
      get().analyzeResults();
    } catch (error) {
      console.error('Simulation Error:', error);
      set({ loading: false });
    }
  },

  analyzeResults: async () => {
    const { result, battery, solar, mission, environment, lca } = get();
    if (!result) return;

    set({ isAnalyzing: true });
    try {
      const payload = {
        request: { battery, solar, mission, environment, lca },
        results: result
      };

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('AI Analysis failed');

      const data = await response.json();
      set({ aiAnalysis: data.analysis, isAnalyzing: false });
    } catch (error) {
      console.error('AI Analysis Error:', error);
      set({ isAnalyzing: false, aiAnalysis: 'Failed to generate AI insights. Please check your connection.' });
    }
  }
}));
