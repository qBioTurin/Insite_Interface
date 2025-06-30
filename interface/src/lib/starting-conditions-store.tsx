import { defaultStartingConditions } from "@/components/default-values";
import { Mutation, Population } from "@/components/interfaces";
import { create } from "zustand";

interface StartingConditions {
	mutations: Mutation[];
	nextMutationId: number;

	populations: Population[];
	nextPopulationId: number;

	addMutations: (mut: Mutation) => void;
	updateMutations: (mut: Mutation, event: number) => void;
	updateNextMutationId: () => void;
	removeMutation: (mut: Mutation) => void;
	resetMutations: () => void;

	addPopulation: (population: Population) => void;
	updateNextPopulationId: () => void;
	updatePopulationNumberCells: (population: Population, newNumberCells: number) => void;
	addMutationToPopulation: (population: Population, mutation: string) => void;
	removeMutationFromPopulation: (population: Population, mutation: string) => void;
}

export const useStartingConditionsStore = create<StartingConditions>((set) => ({
	startingNumberOfCells: defaultStartingConditions,

	mutations: [{ name: "Mut1", event: 1 }],
	nextMutationId: 2,

	populations: [{ id: 1, name: "Pop1", mutations: ["Mut1"], numberOfCells: 1 }],
	nextPopulationId: 2,

	addMutations: (mut) =>
		set((state) => ({
			mutations: [...state.mutations, mut],
		})),
	updateMutations: (mut, eventId) =>
		set((state) => ({
			mutations: state.mutations.map((m) =>
				m.name === mut.name ? { name: m.name, event: eventId } : m
			),
		})),
	updateNextMutationId: () =>
		set((state) => ({
			nextMutationId: state.nextMutationId + 1,
		})),
	removeMutation: (mut) =>
		set((state) => ({
			mutations: state.mutations.filter(
				(m) => mut.name !== m.name
			),
			populations: state.populations.map((p) => {return {...p, mutations: p.mutations.filter(m => mut.name !== m)}})
		})),
	resetMutations: () =>
		set(() => ({
			mutations: []
		})),

	addPopulation: (population) =>
		set((state) => ({
			populations: [...state.populations, population],
		})),
	updateNextPopulationId: () =>
		set((state) => ({
			nextPopulationId: state.nextPopulationId + 1,
		})),
	updatePopulationNumberCells: (population, newNumberCells) =>
		set((state) => ({
			populations: state.populations.map((p) =>
				population.id === p.id ? { ...population, numberOfCells: newNumberCells } : p
			),
		})),
	addMutationToPopulation: (population, mutation) =>
		set((state) => ({
			populations: state.populations.map((p) =>
				population.id === p.id ? { ...population, mutations: [...population.mutations, mutation] } : p
			)
		})),
	removeMutationFromPopulation: (population, mutation) =>
		set((state) => ({
			populations: state.populations.map((p) =>
				population.id === p.id ? { ...population, mutations: population.mutations.filter(mut => mut !== mutation) } : p
			)
		}))
}));
