'use client';
import { Button, Grid, GridCol, Text, Stack, Divider, Tooltip } from "@mantine/core";
import { colors, colorsPage } from "./colors";
import StartingConditions from "./starting-conditions";
import RelativeFrequencies from "./relative-frequencies";
import { CardCompetition, CardGrowth, CardMutation, CardPassenger, CardSpace } from "./cards";
import { defaultEventParams } from "./default-values";
import { useFunctionalEventsStore } from "@/lib/functional-events-store";
import InputLabel from "./input-label";
import { Event } from "./interfaces";
import { useStartingConditionsStore } from "@/lib/starting-conditions-store";

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
			mutations.map(m => {
				if (m.event === functionalEvent.id) {
					const nearestId = ids.reduce((prev, curr) =>
						Math.abs(curr - functionalEvent.id) < Math.abs(prev - functionalEvent.id) ? curr : prev
					);
					updateMutations(m, nearestId)
				}
			})
		} else {
			resetMutations()
		}
	}

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
						<Tooltip label="Represents a proliferative advantage: cells divide faster, die less, or both. This mimics driver mutations that enhance survival or replication." position="right">
							<Button color={colors.growth} onClick={() => {
								addFunctionalEvent({ id: nextFunctionalEventId, name: `Growth${nextFunctionalEventId}`, type: "growth", frequency: 1, params: { proliferativeAdvantage: defaultEventParams.proliferativeAdvantage } })
								updateNextFunctionalEventId()
							}}>Growth</Button>
						</Tooltip>
						<Tooltip position="right" label="Increases the mutation rate of the clone. This may simulate loss of DNA repair mechanisms or genomic instability, leading to faster evolutionary change.">
							<Button color={colors.mutation} onClick={() => {
								addFunctionalEvent({ id: nextFunctionalEventId, name: `Mutation${nextFunctionalEventId}`, type: "mutation", frequency: 1, params: { mutationalAmplificationFactor: defaultEventParams.mutationalAmplificationFactor } });
								updateNextFunctionalEventId()
							}}>Mutation</Button>
						</Tooltip>
						<Tooltip position="right" label="Allows a clone to overcome spatial or resource limitations. This may reflect tissue invasion, angiogenesis, or access to a new ecological niche.">
							<Button color={colors.space} onClick={() => {
								addFunctionalEvent({ id: nextFunctionalEventId, name: `Space${nextFunctionalEventId}`, type: "space", frequency: 1, params: { additionalSpace: defaultEventParams.additionalSpace } });
								updateNextFunctionalEventId()
							}}>Space</Button>
						</Tooltip>
						<Tooltip position="right" label="Alters the default neutral interaction and fair competition between clones. A clone may gain advantages such as monopolizing resources to help its own lineage.">
							<Button color={colors.competition} onClick={() => {
								addFunctionalEvent({ id: nextFunctionalEventId, name: `Competition${nextFunctionalEventId}`, type: "competition", frequency: 1, params: { susceptibility: defaultEventParams.susceptibility, offensiveScore: defaultEventParams.offensiveScore } });
								updateNextFunctionalEventId()
							}}>Competition</Button>
						</Tooltip>
						<Tooltip
							label={checkPassenger() ?
								"There is no point in having more than one kind of “passenger effect” as neutrality does not come in different shades" :
								"Has no phenotypic effect. These mutations accumulate without altering clone behavior and serve as neutral markers in the evolutionary process."}
							position="right">
							<Button disabled={checkPassenger()} color={colors.passenger} onClick={() => {
								addFunctionalEvent({ id: nextFunctionalEventId, name: `Passenger${nextFunctionalEventId}`, type: "passenger", frequency: 1000 });
								updateNextFunctionalEventId()
							}}>Passenger</Button >
						</Tooltip>
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
										.map((event, index) => {
											const key = `${v}-${index}`;
											switch (event.type) {
												case "growth":
													return (
														<CardGrowth
															key={key}
															removeEvent={removeFunctionEventAndChangeMutations}
															event={event}
															updateEventName={updateEventName}
															updateEventParam={updateEventParam}
														/>
													);
												case "mutation":
													return (
														<CardMutation
															key={key}
															removeEvent={removeFunctionEventAndChangeMutations}
															event={event}
															updateEventName={updateEventName}
															updateEventParam={updateEventParam}
														/>
													);
												case "space":
													return (
														<CardSpace
															key={key}
															removeEvent={removeFunctionEventAndChangeMutations}
															event={event}
															updateEventName={updateEventName}
															updateEventParam={updateEventParam}
														/>
													);
												case "competition":
													return (
														<CardCompetition
															key={key}
															removeEvent={removeFunctionEventAndChangeMutations}
															event={event}
															updateEventName={updateEventName}
															updateEventParam={updateEventParam}
														/>
													);
												case "passenger":
													return (
														<CardPassenger
															key={key}
															removeEvent={removeFunctionEventAndChangeMutations}
															event={event}
															updateEventName={updateEventName}
														/>
													);
												default:
													return null;
											}
										})}
								</Stack>
							</GridCol>
						))}
					</Grid>
				</GridCol>
			</Grid >
			{
				functionalEvents.length > 0 && (
					<>
						
						<RelativeFrequencies events={functionalEvents} updateEventFrequency={updateEventFrequency} />
					</>)
			}
			<Divider my="md" />
			<StartingConditions functionalEvents={functionalEvents} />


		</>
	)
}