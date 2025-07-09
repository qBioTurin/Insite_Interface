'use client'
import { Accordion, AccordionControl, AccordionItem, AccordionPanel, Grid, GridCol, Group, NumberInput, Text } from "@mantine/core";
import InputLabel from "./input-label";
import { colorsPage } from "./colors";
import { useSimulationStepStore } from "@/lib/simulation-step-store";

export default function SimulationStep() {
	const {
		cellLifeDays,
		carryingCapacity,
		mutationRate,
		endingTime,
		mutableBases,
		savingCheckpoints,
		threads,
		setCellLifeDays,
		setCarryingCapacity,
		setMutationRate,
		setMutableBases,
		setEndingTime,
		setSavingCheckpoints,
		setThreads
	} = useSimulationStepStore();

	const generalInputs = [
		{
			label: "Expected Cell Lifetime",
			tooltip: "The average time (in days) an healthy cell of the kind of interest lives in standard conditions.",
			value: cellLifeDays,
			onChange: setCellLifeDays,
		},
		{
			label: "Basic carrying capacity",
			tooltip: "The maximum number of cells that the simulated environment can sustain at once without further. This represents limitations due to space, nutrients, or immune system pressure in a standard healthy condition.",
			value: carryingCapacity,
			onChange: setCarryingCapacity,
		},
		{
			label: "Basic mutation rate",
			tooltip: "Rate at which mutations occur per base pair per cell division in healthy tissue. Default value is set according to literature results.",
			value: mutationRate,
			onChange: setMutationRate,
		},
		{
			label: "Number of base pairs of interest",
			tooltip: "The total number of genomic base pairs monitored for mutations. This allows you to restrict the simulation to a specific genomic region or the entire exome/genome, depending on your focus.",
			value: mutableBases,
			onChange: setMutableBases,
		},
		{
			label: "Time span to be simulated",
			tooltip: "The total duration of the simulation, which defines how many days the virtual tumor will evolve.",
			value: endingTime,
			onChange: setEndingTime,
		},
	];

	const advancedInputs = [
		{
			label: "Number of Saving Checkpoints",
			tooltip: "How many times the simulation state will be saved throughout the run. Augmenting this value will give you more definition at memory usage cost.",
			value: savingCheckpoints,
			onChange: setSavingCheckpoints,
		},
		{
			label: "Number of Threads",
			tooltip: "The number of CPU threads to allocate for running the simulation. Increasing this can speed up execution, especially for large-scale simulations, depending on your machine's capabilities.",
			value: threads,
			onChange: setThreads,
		},
	]

	return (
		<>
			<h1>Simulation Setup</h1>
			<Text c={colorsPage.lightDescription}>
				In this section, you can configure the fundamental biological parameters that define how your digital tumor initially behaves. These values apply to the baseline (healthy-like) cells before any additional mutations are acquired. As the simulation progresses, cells may accumulate new mutations that alter their behavior (for example, increasing the mutation rate or extending the lifetime) depending on the “powers” you’ll define in the next section. You can keep the default values for a generic baseline scenario or customize them to match specific biological contexts.
			</Text>
			<Grid align="flex-end" mt={"lg"}>
				{generalInputs.map((input, index) => (
					<GridCol key={index} span={4}>
						<NumberInput
							label={<InputLabel label={input.label} tooltip={input.tooltip} />}
							value={input.value}
							hideControls
							onChange={(val) => input.onChange(Number(val))}
						/>
					</GridCol>
				))}
			</Grid>
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
						<Grid align="flex-end">
							{advancedInputs.map((input, index) => (
								<GridCol key={index} span={6}>
									<NumberInput
										label={<InputLabel label={input.label} tooltip={input.tooltip} />}
										value={input.value}
										hideControls
										onChange={(val) => input.onChange(Number(val))}
									/>
								</GridCol>
							))}
						</Grid>
					</AccordionPanel>
				</AccordionItem>
			</Accordion>
		</>
	)
}