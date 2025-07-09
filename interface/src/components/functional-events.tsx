'use client';
import { Button, Grid, GridCol, Text, Stack, Tooltip, ScrollAreaAutosize, Center, Badge, NumberInput } from "@mantine/core";
import { colors, colorsPage } from "./colors";
import { CardCompetition, CardGrowth, CardMutation, CardPassenger, CardSpace } from "./cards";
import { defaultEventParams } from "./default-values";
import { useFunctionalEventsStore } from "@/lib/functional-events-store";
import InputLabel from "./input-label";
import { Event } from "./interfaces";
import { useStartingConditionsStore } from "@/lib/starting-conditions-store";
import React from "react";

export default function FunctionalEvents() {
	const {
		functionalEvents,
		updateNextFunctionalEventId,
		nextFunctionalEventId,
		addFunctionalEvent,
		removeFunctionalEvent,
		updateEventName,
		updateEventFrequency,
		updateEventParam
	} = useFunctionalEventsStore();

	const { mutations, updateMutations, resetMutations } = useStartingConditionsStore()

	function removeFunctionEventAndChangeMutations(functionalEvent: Event) {
		removeFunctionalEvent(functionalEvent)
		const ids = functionalEvents.filter(f => f.id !== functionalEvent.id).map((f) => f.id)
		if (ids.length > 0) {
			mutations
				.filter(m => m.event === functionalEvent.id)
				.forEach(m => {
					const nearestId = ids.reduce((prev, curr) =>
						Math.abs(curr - functionalEvent.id) < Math.abs(prev - functionalEvent.id) ? curr : prev
					);
					updateMutations(m, nearestId);
				});
		} else {
			resetMutations()
		}
	}

	function renderCard(event: Event, key: string) {
		const commonProps = {
			key,
			event,
			removeEvent: removeFunctionEventAndChangeMutations,
			updateEventName,
			updateEventParam,
		};

		switch (event.type) {
			case "growth":
				return <CardGrowth {...commonProps} />;
			case "mutation":
				return <CardMutation {...commonProps} />;
			case "space":
				return <CardSpace {...commonProps} />;
			case "competition":
				return <CardCompetition {...commonProps} />;
			case "passenger":
				return (
					<CardPassenger
						key={key}
						event={event}
						removeEvent={removeFunctionEventAndChangeMutations}
						updateEventName={updateEventName}
					/>
				);
			default:
				return null;
		}
	}

	const eventTypes = [
		{
			type: "growth",
			color: colors.growth,
			label: "Growth",
			tooltip: "Represents a proliferative advantage: cells divide faster, die less, or both. This mimics driver mutations that enhance survival or replication.",
			params: { proliferativeAdvantage: defaultEventParams.proliferativeAdvantage },
			disabled: false,
		},
		{
			type: "mutation",
			color: colors.mutation,
			label: "Mutation",
			tooltip: "Increases the mutation rate of the clone. This may simulate loss of DNA repair mechanisms or genomic instability, leading to faster evolutionary change.",
			params: { mutationalAmplificationFactor: defaultEventParams.mutationalAmplificationFactor },
			disabled: false,
		},
		{
			type: "space",
			color: colors.space,
			label: "Space",
			tooltip: "Allows a clone to overcome spatial or resource limitations. This may reflect tissue invasion, angiogenesis, or access to a new ecological niche.",
			params: { additionalSpace: defaultEventParams.additionalSpace },
			disabled: false,
		},
		{
			type: "competition",
			color: colors.competition,
			label: "Competition",
			tooltip: "Alters the default neutral interaction and fair competition between clones. A clone may gain advantages such as monopolizing resources to help its own lineage.",
			params: {
				susceptibility: defaultEventParams.susceptibility,
				offensiveScore: defaultEventParams.offensiveScore,
			},
			disabled: false,
		},
		{
			type: "passenger",
			color: colors.passenger,
			label: "Passenger",
			tooltip: checkPassenger()
				? "There is no point in having more than one kind of “passenger effect” as neutrality does not come in different shades"
				: "Has no phenotypic effect. These mutations accumulate without altering clone behavior and serve as neutral markers in the evolutionary process.",
			params: undefined,
			disabled: checkPassenger(),
		},
	] as const;


	function checkPassenger() {
		return functionalEvents.filter((e) => e.type === 'passenger').length > 0
	}

	return (
		<>
			<h1>Functional Events</h1>
			<Text c={colorsPage.lightDescription} mb={"lg"}>
				In this section, you can define the potential “powers” that the digital tumor may acquire during its evolutionary trajectory. These powers represent the phenotypic effects of mutations accumulated through natural cell division, and they reflect the biological hypotheses you want to explore: you are free to include only the types of effects relevant to your scenario.
			</Text>
			<Grid mb={"xl"}>
				<GridCol span={3}>
					<Stack>
						<InputLabel fw={700} size="lg" label="Functional Effect" tooltip="Our framework supports five categories of acquirable events, each representing a distinct kind of selective advantage. By clicking the button for a specific category, a new event of that type will be added to the list of possible powers (displayed on the right)." />
						{eventTypes.map(({ type, color, label, tooltip, params, disabled }) => (
							<Tooltip key={type} position="right" label={tooltip}>
								<Button
									disabled={disabled}
									color={color}
									onClick={() => {
										addFunctionalEvent({
											id: nextFunctionalEventId,
											name: `${label}${nextFunctionalEventId}`,
											type,
											frequency: type === "passenger" ? 1000 : 1,
											...(params ? { params } : {}),
										});
										updateNextFunctionalEventId();
									}}
								>
									{label}
								</Button>
							</Tooltip>
						))}
					</Stack >
				</GridCol>
				<GridCol span={"auto"}>
					<InputLabel fw={700} size="lg" label="Functional Effect list" tooltip="For each added event, you can adjust its strength using interactive sliders. By default: If a subclone acquires two different effects, they will be summed. If it acquires multiple mutations of the same effect, the event will only count once (non-cumulative)." />
					<Grid>
						{[0, 1, 2].map((v) => (
							<GridCol span={4} key={v}>
								<Stack>
									{functionalEvents
										.filter((e, i) => i % 3 === v)
										.map((event, index) => renderCard(event, `${v}-${index}`))}
								</Stack>
							</GridCol>
						))}
					</Grid>
				</GridCol>
			</Grid >
			{functionalEvents.length > 0 && (
				<>
					<h3>Relative Frequencies</h3>
					<Text c={colorsPage.lightDescription} mb={"lg"}>
						During the simulation, each new mutation will be randomly associated with one of the defined effects. By default each event is considered equally probable to all the others, exception made for the passenger mutations (if selected) which are assumed to be roughly 1000 times more frequent than any driver effect, reflecting typical real-world genomic data. You can override these assumptions by setting custom relative probabilities, allowing the simulation to reflect more specific scenarios (for example, if you're modeling a known gene set with defined lengths and functional biases).
					</Text>
					<ScrollAreaAutosize mt={10}>
						<div style={{ display: 'flex', gap: 20, width: 'max-content' }}>
							{functionalEvents.map((event, index) => (
								<React.Fragment key={index}>
									<div style={{ padding: 'lg', height: 100 }}>
										<Center mb={5}>
											<Badge color={colors[event.type]} size="xl" >{event.name}</Badge>
										</Center>
										<Center>
											<NumberInput value={event.frequency} w={100} onChange={(value) => updateEventFrequency(event, Number(value))} hideControls />
										</Center>
									</div>
									{functionalEvents.length > index + 1 && (
										<Center>
											<Text>
												:
											</Text>
										</Center >
									)}
								</React.Fragment>
							))}
						</div>
					</ScrollAreaAutosize >
				</>
			)}
		</>
	)
}