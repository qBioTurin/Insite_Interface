import { RowMutTable } from "@/components/interfaces";
import { create } from "zustand";

interface Sequencing {
	sequenced: boolean;
	sequencingDay: number;
	plotVersion: number;

	dataPlot: { nMut: number, nCells: number, nPop: number }[];
	dataPlotStacked: Record<string, string | number>[];
	dataTableMut: RowMutTable[];
	series: { name: string; color: string }[];

	numSeq: number;
	subsampleVersion: number;
	vcfObjects: { fun_eff: string, sample_DP: number, sample_AD: number, VAF: number, mut: string }[];

	setSequenced: (newSequenced: boolean) => void;
	setSequencingDay: (newSequencingDay: number) => void;

	setDataPlot: (newDataPlot: { nMut: number, nCells: number, nPop: number }[]) => void;
	setDataPlotStacked: (newDataPlotStacked: Record<string, string | number>[]) => void;
	setDataTableMut: (newDataTableMut: RowMutTable[]) => void;
	setSeries: (newSeries: { name: string; color: string }[]) => void;
	updatePlotVersion: () => void;
	setNumSeq: (newNumSeq: number) => void;
	updateSubsampleVersion: () => void;
	setVCFObjects: (newVCFObjects: { fun_eff: string, sample_DP: number, sample_AD: number, VAF: number, mut: string }[]) => void;
}

export const useSequencingStore = create<Sequencing>((set) => ({
	sequenced: false,
	sequencingDay: 0,
	dataPlot: [],
	dataPlotStacked: [],
	dataTableMut: [],
	series: [],
	numSeq: 0,

	plotVersion: 0,
	subsampleVersion: 0,
	vcfObjects: [],

	setSequenced: (newSequenced: boolean) => set(() => ({ sequenced: newSequenced })),
	setSequencingDay: (newSequencingDay: number) => set(() => ({ sequencingDay: newSequencingDay })),

	setNumSeq: (newNumSeq: number) => set(() => ({ numSeq: newNumSeq })),

	setDataPlot: (newDataPlot: { nMut: number, nCells: number, nPop: number }[]) => set(() => ({ dataPlot: newDataPlot })),
	setDataPlotStacked: (newDataPlotStacked: Record<string, string | number>[]) => set(() => ({ dataPlotStacked: newDataPlotStacked })),
	setSeries: (newSeries: { name: string; color: string }[]) => set(() => ({ series: newSeries })),
	setDataTableMut: (newDataTableMut: RowMutTable[]) => set(() => ({ dataTableMut: newDataTableMut })),
	updatePlotVersion: () => set((state) => ({
		plotVersion: state.plotVersion + 1
	})),
	updateSubsampleVersion: () => set((state) => ({
		subsampleVersion: state.subsampleVersion + 1
	})),
	setVCFObjects: (newVCFObjects) => set({
		vcfObjects: newVCFObjects
	})
}));
