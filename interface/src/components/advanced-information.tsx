import { useGeneralInformationStore } from "@/lib/general-information-store";
import { Accordion, AccordionControl, Text, AccordionItem, AccordionPanel, Grid, GridCol, Group, NumberInput } from "@mantine/core";
import InputLabel from "./input-label";

export default function AdvancedInformation() {
	const {
		savingCheckpoints,
		threads,
		setSavingCheckpoints,
		setThreads
	} = useGeneralInformationStore();

	return (
		<Accordion variant="filled" mt={"md"}>
			<AccordionItem key={'advanced'} value={'advanced'}>
				<AccordionControl>
					<Group justify="flex-end">
						<Text fw={600} mx={"md"}>
							Advanced information
						</Text>
					</Group>
				</AccordionControl>
				<AccordionPanel>
					<Grid align="flex-end" >
						<GridCol span={6}>
							<NumberInput
								label={<InputLabel label="Number of Saving Checkpoints" tooltip="How many times the simulation state will be saved throughout the run. Augmenting this value will give you more definition at memory usage cost." />}
								defaultValue={savingCheckpoints}
								hideControls
								onChange={(val) => setSavingCheckpoints(Number(val))}
							/>
						</GridCol>
						<GridCol span={6}>
							<NumberInput
								label={<InputLabel label="Number of Threads" tooltip="The number of CPU threads to allocate for running the simulation. Increasing this can speed up execution, especially for large-scale simulations, depending on your machine's capabilities." />}
								defaultValue={threads}
								hideControls
								onChange={(val) => setThreads(Number(val))}
							/>
						</GridCol>
					</Grid>

				</AccordionPanel>
			</AccordionItem>
		</Accordion>

	);
}