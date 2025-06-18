import { Badge, Center, NumberInput, ScrollAreaAutosize } from "@mantine/core";
import { colors } from "./colors";
import { Event } from "./interfaces";

export default function RelativeFrequencies({ events, updateEventFrequency }: { events: Event[]; updateEventFrequency: (eventToRename: Event, newFrequency: number) => void }) {


	return (
		<>
			<h1>Relative Frequencies</h1>
			<ScrollAreaAutosize mt={10}>
				<div style={{ display: 'flex', gap: 20, width: 'max-content' }}>
					{events.map((event, index) => (
						<div key={index} style={{ padding: 'lg', height: 100 }}>
							<Center mb={5}>
								<Badge color={colors[event.type]} size="xl" >{event.name}</Badge>
							</Center>
							<Center>
								<NumberInput defaultValue={event.frequency} w={100} onChange={(value) => updateEventFrequency(event, Number(value))} hideControls />
							</Center>
						</div>
					))}
				</div>
			</ScrollAreaAutosize>

		</>
	);
}