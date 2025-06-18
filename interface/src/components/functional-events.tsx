'use client';
import { Button, CloseButton, Grid, GridCol, SimpleGrid, Slider, Text, Stack, TextInput, Card, Group, NumberInput, NativeSelect, PillsInput, Pill, PillGroup, PillsInputField, Divider } from "@mantine/core";
import { colors } from "./colors";
import StartingConditions from "./starting-conditions";
import RelativeFrequencies from "./relative-frequencies";
import { CardCompetition, CardGrowth, CardMutation, CardPassenger, CardSpace } from "./cards";
import { useState } from "react";
import { defaultEventParams, defaultFrequency, defaultFrequencyPassenger } from "./default-values";
import { Population, Event, Mutation } from "./interfaces";
import DownloadJsonButton from "@/lib/parse-json";

export default function FunctionalEvents() {
	const [functionalEvents, setFunctionalEvents] = useState<Event[]>([
		{ id: 1, name: "Growth1", type: "growth", frequency: defaultFrequency, params: { proliferativeAdvantage: defaultEventParams.proliferativeAdvantage } },
		{ id: 2, name: "Competition1", type: "competition", frequency: defaultFrequency, params: { susceptibility: defaultEventParams.susceptibility, offensiveScore: defaultEventParams.offensiveScore } },
		{ id: 3, name: "Passenger1", type: "passenger", frequency: defaultFrequencyPassenger },
	]);

	const [mutations, setMutations] = useState<Mutation[]>([{ name: "Mut1", event: functionalEvents[0].id }]);
	const [populations, setPopulations] = useState<Population[]>([{ id: 1, name: "Population1", mutations: mutations.map((mut) => mut.name), numberOfCells: 1 }]);
	const [nextId, setNextId] = useState(4);
	const [nextMutationId, setNextMutationId] = useState(2);
	const [nextPopulationId, setNextPopulationId] = useState(2);

	const removeEvent = (eventToRemove: Event) => {
		setFunctionalEvents((prevEvents) =>
			prevEvents.filter(
				(event) =>
					!(event.id === eventToRemove.id)
			)
		);
	};

	const updateEventName = (eventToRename: Event, newName: string) => {
		setFunctionalEvents((prevEvents) =>
			prevEvents.map((event) =>
				event.id === eventToRename.id ? { ...event, name: newName } : event
			)
		);
	};

	const updateEventFrequency = (eventToRename: Event, newFrequency: number) => {
		setFunctionalEvents((prevEvents) =>
			prevEvents.map((event) =>
				event.id === eventToRename.id ? { ...event, frequency: newFrequency } : event
			)
		);
	};

	const updatePopulationsNumberCells = (populationToUpdate: Population, newNumberCells: number) => {
		setPopulations((prevPopulations) =>
			prevPopulations.map((pop) =>
				pop.id === populationToUpdate.id ? { ...pop, numberOfCells: newNumberCells } : pop
			)
		)
	}

	const addMutationToPopulation = (population: Population, newMutation: Mutation) => {
		setPopulations((prev) =>
			prev.map((pop) =>
				pop.id === population.id
					? {
						...pop,
						mutations: [...pop.mutations, newMutation.name],
					}
					: pop
			)
		);
	};

	const updateMutationEvent = (mutation: Mutation, newEvent: number) => {
		setMutations((prev) =>
			prev.map((mut) =>
				mut.name === mutation.name ? {
					...mut,
					event: newEvent
				} : mut
			)
		);
	};


	const updateEventParam = (
		eventToUpdate: Event,
		paramName: keyof NonNullable<Event["params"]>,
		value: number
	) => {
		setFunctionalEvents((prevEvents) =>
			prevEvents.map((event) =>
				event.id === eventToUpdate.id
					? {
						...event,
						params: {
							...event.params,
							[paramName]: value,
						},
					}
					: event
			)
		);
	};

	return (
		<>
			<h1>Functional Events</h1>
			<Grid>
				<GridCol span={3}>
					<Stack>
						<Button color={colors.growth} onClick={() => {
							setFunctionalEvents([...functionalEvents, { id: nextId, name: "Growth1", type: "growth", frequency: 1, params: { proliferativeAdvantage: defaultEventParams.proliferativeAdvantage } }]);
							setNextId(nextId + 1);
						}}>Growth</Button>
						<Button color={colors.mutation} onClick={() => {
							setFunctionalEvents([...functionalEvents, { id: nextId, name: "Mutation1", type: "mutation", frequency: 1, params: { mutationalAmplificationFactor: defaultEventParams.mutationalAmplificationFactor } }]);
							setNextId(nextId + 1);
						}}>Mutation</Button>
						<Button color={colors.space} onClick={() => {
							setFunctionalEvents([...functionalEvents, { id: nextId, name: "Space1", type: "space", frequency: 1, params: { additionalSpace: defaultEventParams.additionalSpace } }]);
							setNextId(nextId + 1);
						}}>Space</Button>
						<Button color={colors.competition} onClick={() => {
							setFunctionalEvents([...functionalEvents, { id: nextId, name: "Competition1", type: "competition", frequency: 1, params: { susceptibility: defaultEventParams.susceptibility, offensiveScore: defaultEventParams.offensiveScore } }]);
							setNextId(nextId + 1);
						}}>Competition</Button>
						<Button color={colors.passenger} onClick={() => {
							setFunctionalEvents([...functionalEvents, { id: nextId, name: "Passenger1", type: "passenger", frequency: 1 }]);
							setNextId(nextId + 1);
						}}>Passenger</Button>
					</Stack>
				</GridCol>
				<GridCol span={9}>
					<SimpleGrid cols={3} spacing="md" mb="md" verticalSpacing={"xl"}>
						{functionalEvents.map((event, index) => {
							switch (event.type) {
								case "growth":
									return <CardGrowth key={index} removeEvent={removeEvent} event={event} updateEventName={updateEventName} updateEventParam={updateEventParam} />;
								case "mutation":
									return <CardMutation key={index} removeEvent={removeEvent} event={event} updateEventName={updateEventName} updateEventParam={updateEventParam} />;
								case "space":
									return <CardSpace key={index} removeEvent={removeEvent} event={event} updateEventName={updateEventName} updateEventParam={updateEventParam} />;
								case "competition":
									return <CardCompetition key={index} removeEvent={removeEvent} event={event} updateEventName={updateEventName} updateEventParam={updateEventParam} />;
								case "passenger":
									return <CardPassenger key={index} removeEvent={removeEvent} event={event} updateEventName={updateEventName} />;
								default:
									return null;
							}
						})}

					</SimpleGrid>
				</GridCol>
			</Grid>
			<Divider my="md" />
			<RelativeFrequencies events={functionalEvents} updateEventFrequency={updateEventFrequency} />

			{functionalEvents.length > 0 && (
				<>
					<Divider my="md" />
					<StartingConditions populations={populations} mutations={mutations} functionalEvents={functionalEvents} setMutations={setMutations} nextMutationId={nextMutationId} setNextMutationId={setNextMutationId} setPopulations={setPopulations} nextPopulationId={nextPopulationId} setNextPopulationId={setNextPopulationId} updatePopulationsNumberCells={updatePopulationsNumberCells} addMutationToPopulation={addMutationToPopulation} updateMutationEvent={updateMutationEvent}/>
				</>
			)}
		</>
	)
}