'use client';
import { Button, Grid, GridCol, SimpleGrid, Stack, Divider } from "@mantine/core";
import { colors } from "./colors";
import StartingConditions from "./starting-conditions";
import RelativeFrequencies from "./relative-frequencies";
import { CardCompetition, CardGrowth, CardMutation, CardPassenger, CardSpace } from "./cards";
import { defaultEventParams} from "./default-values";
import { useFunctionalEventsStore } from "@/lib/functional-events-store";

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

	return (
		<>
			<h1>Functional Events</h1>
			<Grid>
				<GridCol span={3}>
					<Stack>
						<Button color={colors.growth} onClick={() => {
							addFunctionalEvent({ id: nextFunctionalEventId, name: `Growth${nextFunctionalEventId}`, type: "growth", frequency: 1, params: { proliferativeAdvantage: defaultEventParams.proliferativeAdvantage } })
							updateNextFunctionalEventId()
						}}>Growth</Button>
						<Button color={colors.mutation} onClick={() => {
							addFunctionalEvent({ id: nextFunctionalEventId, name: `Mutation${nextFunctionalEventId}`, type: "mutation", frequency: 1, params: { mutationalAmplificationFactor: defaultEventParams.mutationalAmplificationFactor } });
							updateNextFunctionalEventId()
						}}>Mutation</Button>
						<Button color={colors.space} onClick={() => {
							addFunctionalEvent({ id: nextFunctionalEventId, name: `Space${nextFunctionalEventId}`, type: "space", frequency: 1, params: { additionalSpace: defaultEventParams.additionalSpace } });
							updateNextFunctionalEventId()
						}}>Space</Button>
						<Button color={colors.competition} onClick={() => {
							addFunctionalEvent({ id: nextFunctionalEventId, name: `Competition${nextFunctionalEventId}`, type: "competition", frequency: 1, params: { susceptibility: defaultEventParams.susceptibility, offensiveScore: defaultEventParams.offensiveScore } });
							updateNextFunctionalEventId()
						}}>Competition</Button>
						<Button color={colors.passenger} onClick={() => {
							addFunctionalEvent({ id: nextFunctionalEventId, name: `Passenger${nextFunctionalEventId}`, type: "passenger", frequency: 1 });
							updateNextFunctionalEventId()
						}}>Passenger</Button >
					</Stack >
				</GridCol >
				<GridCol span={9}>
					<SimpleGrid cols={3} spacing="md" mb="md" verticalSpacing={"xl"}>
						{functionalEvents.map((event, index) => {
							switch (event.type) {
								case "growth":
									return <CardGrowth key={index} removeEvent={removeFunctionalEvent} event={event} updateEventName={updateEventName} updateEventParam={updateEventParam} />;
								case "mutation":
									return <CardMutation key={index} removeEvent={removeFunctionalEvent} event={event} updateEventName={updateEventName} updateEventParam={updateEventParam} />;
								case "space":
									return <CardSpace key={index} removeEvent={removeFunctionalEvent} event={event} updateEventName={updateEventName} updateEventParam={updateEventParam} />;
								case "competition":
									return <CardCompetition key={index} removeEvent={removeFunctionalEvent} event={event} updateEventName={updateEventName} updateEventParam={updateEventParam} />;
								case "passenger":
									return <CardPassenger key={index} removeEvent={removeFunctionalEvent} event={event} updateEventName={updateEventName} />;
								default:
									return null;
							}
						})}

					</SimpleGrid>
				</GridCol>
			</Grid >
			<Divider my="md" />
			<RelativeFrequencies events={functionalEvents} updateEventFrequency={updateEventFrequency} />

			{
				functionalEvents.length > 0 && (
					<>
						<Divider my="md" />
						<StartingConditions functionalEvents={functionalEvents} />
					</>
				)
			}
		</>
	)
}