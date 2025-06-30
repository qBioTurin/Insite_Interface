'use client'
import { useGeneralInformationStore } from "@/lib/general-information-store";
import { Grid, GridCol, NumberInput, Text } from "@mantine/core";
import InputLabel from "./input-label";
import { colorsPage } from "./colors";

export default function GeneralInformation() {
	const {
		cellLifeDays,
		carryingCapacity,
		mutationRate,
		endingTime,
		setCellLifeDays,
		setCarryingCapacity,
		setMutationRate,
		setMutableBases,
		setEndingTime
	} = useGeneralInformationStore();

	return (
		<>
			<h1>Simulation Setup</h1>
			<Text c={colorsPage.lightDescription}>
				In this section, you can configure the fundamental biological parameters that define how your digital tumor initially behaves. These values apply to the baseline (healthy-like) cells before any additional mutations are acquired. As the simulation progresses, cells may accumulate new mutations that alter their behavior (for example, increasing the mutation rate or extending the lifetime) depending on the “powers” you’ll define in the next section. You can keep the default values for a generic baseline scenario or customize them to match specific biological contexts.
			</Text>
			<Grid align="flex-end" mt={"lg"} >
				<GridCol span={4}>
					<NumberInput
						label={<InputLabel label="Expected Cell Lifetime" tooltip="The average time (in days) an healthy cell of the kind of interest lives in standard conditions." />}
						defaultValue={cellLifeDays}
						hideControls
						onChange={(val) => setCellLifeDays(Number(val))}
					/>
				</GridCol>
				<GridCol span={4}>
					<NumberInput
						label={<InputLabel label="Basic carrying capacity" tooltip="The maximum number of cells that the simulated environment can sustain at once without further. This represents limitations due to space, nutrients, or immune system pressure in a standard healthy condition." />}
						defaultValue={carryingCapacity}
						hideControls
						onChange={(val) => setCarryingCapacity(Number(val))}
					/>
				</GridCol>
				<GridCol span={4}>
					<NumberInput
						label={<InputLabel label="Basic mutation rate" tooltip="Rate at which mutations occur per base pair per cell division in healthy tissue. Default value is set according to literature results " />}
						defaultValue={mutationRate}
						hideControls
						onChange={(val) => setMutationRate(Number(val))}
					/>
				</GridCol>
				<GridCol span={4}>
					<NumberInput
						label={<InputLabel label="Number of base pairs of interest" tooltip="The total number of genomic base pairs monitored for mutations. This allows you to restrict the simulation to a specific genomic region or the entire exome/genome, depending on your focus." />}
						defaultValue={5000}
						hideControls
						onChange={(val) => setMutableBases(Number(val))}
					/>
				</GridCol>
				<GridCol span={4}>
					<NumberInput
						label={<InputLabel label="Time span to be simulated" tooltip="The total duration of the simulation, which defines how many days the virtual tumor will evolve."/>}
						defaultValue={endingTime}
						hideControls
						onChange={(val) => setEndingTime(Number(val))}
					/>
				</GridCol>
			</Grid>
		</>
	)
}