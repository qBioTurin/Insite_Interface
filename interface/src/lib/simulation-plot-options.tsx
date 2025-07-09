import { create } from "zustand";

interface SimulationPlotOptions {
	depth: number,
	changingDepth: boolean,
	imageVersion: number,

	plotBase: number,
	plotExponent: number,

	updateDepth: (newDepth: number) => void;
	updateChangingDepth: (newChangingDepth: boolean) => void;
	updateImageVersion: () => void;

	setPlotBase: (newPlotBase: number) => void;
	setPlotExponent: (newPlotExponent: number) => void;
}

export const useSimulationPlotOptionsStore = create<SimulationPlotOptions>((set) => ({
	depth: 3,
	changingDepth: false,
	imageVersion: 0,

	plotBase: 0,
	plotExponent: 0,

	updateDepth: (newDepth) => set(() => ({
		depth: newDepth,
	})),
	updateChangingDepth: (newChangingDepth) => set(() => ({
		changingDepth: newChangingDepth,
	})),
	updateImageVersion: () => set((state) => ({
		imageVersion: state.imageVersion + 1
	})),
	setPlotBase: (newPlotBase: number) => set(() => ({
		plotBase: newPlotBase
	})),
	setPlotExponent: (newPlotExponent: number) => set(() => ({
		plotExponent: newPlotExponent
	})),
}));
