import { Badge, Center, NumberInput, Text, ScrollAreaAutosize } from "@mantine/core";
import { colors, colorsPage } from "./colors";
import { Event } from "./interfaces";
import React from "react";

export default function RelativeFrequencies({ events, updateEventFrequency }: { events: Event[]; updateEventFrequency: (eventToRename: Event, newFrequency: number) => void }) {


	return (
		<>
			<h3>Relative Frequencies</h3>
			<Text c={colorsPage.lightDescription} mb={"lg"}>
				During the simulation, each new mutation will be randomly associated with one of the defined effects. By default each event is considered equally probable to all the others, exception made for the passenger mutations (if selected) which are assumed to be roughly 1000 times more frequent than any driver effect, reflecting typical real-world genomic data. You can override these assumptions by setting custom relative probabilities, allowing the simulation to reflect more specific scenarios (for example, if you're modeling a known gene set with defined lengths and functional biases).
			</Text>
			<ScrollAreaAutosize mt={10}>
				<div style={{ display: 'flex', gap: 20, width: 'max-content' }}>
					{events.map((event, index) => (
						<React.Fragment key={index}>
							<div style={{ padding: 'lg', height: 100 }}>
								<Center mb={5}>
									<Badge color={colors[event.type]} size="xl" >{event.name}</Badge>
								</Center>
								<Center>
									<NumberInput defaultValue={event.frequency} w={100} onChange={(value) => updateEventFrequency(event, Number(value))} hideControls />
								</Center>
							</div>
							{events.length > index + 1 ?
								<Center>
									<Text>
										:
									</Text>
								</Center > : <></>
							}
						</React.Fragment>
					))}
				</div>
			</ScrollAreaAutosize >

		</>
	);
}