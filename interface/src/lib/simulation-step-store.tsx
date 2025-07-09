import { create } from "zustand";

interface SimulationStep {
  cellLifeDays: number;
  carryingCapacity: number;
  mutationRate: number;
  mutableBases: number;
  endingTime: number;
  
  savingCheckpoints: number;
  threads: number;

  setCellLifeDays: (v: number) => void;
  setCarryingCapacity: (v: number) => void;
  setMutationRate: (v: number) => void;
  setMutableBases: (v: number) => void;
  setEndingTime:  (v: number) => void;
  
  setSavingCheckpoints:  (v: number) => void;
  setThreads: (v: number) => void;
}

export const useSimulationStepStore = create<SimulationStep>((set) => ({
  cellLifeDays: 4,
  carryingCapacity: 1e6,
  mutationRate: 8e-9,
  mutableBases: 5000,

  endingTime: 2 * 365,
  savingCheckpoints: 50,
  threads: 1,

  setCellLifeDays: (v) => set({ cellLifeDays: v }),
  setCarryingCapacity: (v) => set({ carryingCapacity: v }),
  setMutationRate: (v) => set({ mutationRate: v }),
  setMutableBases: (v) => set({ mutableBases: v }),
  
  setEndingTime: (v) => set({ endingTime: v }),
  setSavingCheckpoints: (v) => set({ savingCheckpoints: v }),
  setThreads: (v) => set({ threads: v })
}));
