import { create } from "zustand";
import { Event } from "@/components/interfaces";
import { defaultEventParams, defaultFrequency, defaultFrequencyPassenger } from "@/components/default-values";

interface FunctionalEvents {
	functionalEvents: Event[],
	nextFunctionalEventId: number,

	addFunctionalEvent: (functionalEvent: Event) => void;
	removeFunctionalEvent: (functionalEvent: Event) => void;
	updateEventName: (functionalEvent: Event, newName: string) => void;
	updateEventFrequency: (functionalEvents: Event, newFrequency: number) => void;
	updateEventParam: (functionalEvents: Event, paramName: string, value: number) => void;
	updateNextFunctionalEventId: () => void;
}

export const useFunctionalEventsStore = create<FunctionalEvents>((set) => ({
	functionalEvents: [
		{ id: 1, name: "Growth1", type: "growth", frequency: defaultFrequency, params: { proliferativeAdvantage: defaultEventParams.proliferativeAdvantage } },
		{ id: 2, name: "Competition2", type: "competition", frequency: defaultFrequency, params: { susceptibility: defaultEventParams.susceptibility, offensiveScore: defaultEventParams.offensiveScore } },
		{ id: 3, name: "Passenger3", type: "passenger", frequency: defaultFrequencyPassenger },
	],
	nextFunctionalEventId: 4,

	addFunctionalEvent: (functionalEvent) =>
		set((state) => ({
			functionalEvents: [...state.functionalEvents, functionalEvent],
		})),
	removeFunctionalEvent: (functionalEvent) =>
		set((state) => ({
			functionalEvents: state.functionalEvents.filter(
				(event) => event.id !== functionalEvent.id
			),
		})),
	updateEventName: (functionalEvent, newName) =>
		set((state) => ({
			functionalEvents: state.functionalEvents.map((event) =>
				event.id === functionalEvent.id ? { ...event, name: newName } : event
			),
		})),
	updateEventFrequency: (functionalEvent, newFrequency) =>
		set((state) => ({
			functionalEvents: state.functionalEvents.map((event) =>
				event.id === functionalEvent.id ? { ...event, frequency: newFrequency } : event
			),
		})),
	updateEventParam: (eventToUpdate, paramName, value) =>
		set((state) => ({
			functionalEvents: state.functionalEvents.map((event) =>
				event.id === eventToUpdate.id
					? {
						...event,
						params: {
							...event.params,
							[paramName]: value,
						},
					}
					: event
			),
		})),
	updateNextFunctionalEventId: () =>
		set((state) => ({
			nextFunctionalEventId: state.nextFunctionalEventId + 1,
		})),

}));
