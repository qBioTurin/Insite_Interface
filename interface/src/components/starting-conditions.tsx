import { Grid, GridCol, NumberInput, Text, Stack, NativeSelect, Fieldset, Badge, ActionIcon } from "@mantine/core";
import { colorsAddButton, colorsAddButtonIcon, colorsPills } from "./colors";
import { Event } from "./interfaces";
import { IconPlus } from "@tabler/icons-react";
import PopulationCombobox from "./population-combobox";
import { useStartingConditionsStore } from "@/lib/starting-conditions-store";

export default function StartingConditions({ functionalEvents }: { functionalEvents: Event[] }) {
	const {
		addMutations,
		updateNextMutationId,
		updateMutations,
		updateNextPopulationId,
		addPopulation,
		updatePopulationNumberCells,
		nextPopulationId,
		populations,
		nextMutationId,
		mutations,
		setStartingNumberOfCells,
		startingNumberOfCells
	} = useStartingConditionsStore();

	return (
		<>
			<h1>Starting Conditions</h1>
			<NumberInput label="Starting number of cells" onChange={(val) => setStartingNumberOfCells(Number(val))} defaultValue={startingNumberOfCells} hideControls w={"40%"} />
			<Grid mt={40}>
				<GridCol span={7}>
					<Fieldset legend="Starting Populations">
						<Stack>
							{populations.map((population, index) => {
								return (
									<Grid key={index} align="flex-end">
										<GridCol span={2}>
											<Text>{population.name}</Text>
										</GridCol>
										<GridCol span={7}>
											<PopulationCombobox population={population} />
										</GridCol>
										<GridCol span={3}>
											<NumberInput onChange={(val) => updatePopulationNumberCells(population, Number(val))} defaultValue={population.numberOfCells} label="Number of cells" hideControls />
										</GridCol>
									</Grid>
								)
							})}
							<ActionIcon onClick={() => {
								addPopulation({ id: nextPopulationId, name: `Pop${nextPopulationId}`, mutations: [], numberOfCells: 1 })
								updateNextPopulationId()
							}} autoContrast aria-label="Settings" radius={"xl"} color={colorsAddButton}>
								<IconPlus style={{ width: '70%', height: '70%', color: colorsAddButtonIcon }} stroke={1.5} />
							</ActionIcon>
						</Stack>
					</Fieldset>
				</GridCol>
				<GridCol span={5}>
					<Fieldset legend="Mutations Phenotypes">
						<Stack>
							{mutations.map((mutation, index) => {
								return (
									<Grid key={index} align="flex-end">
										<GridCol span={4}>
											<Badge color={colorsPills} autoContrast size="lg">{mutation.name}</Badge>
										</GridCol>
										<GridCol span={8}>
											<NativeSelect onChange={(e) => updateMutations(mutation, Number(e.currentTarget.value))} data={functionalEvents.map(event => ({ label: event.name, value: String(event.id) }))} />
										</GridCol>
									</Grid>
								)
							})}
							<ActionIcon onClick={() => {
								addMutations({ name: `Mut${nextMutationId}`, event: functionalEvents[0].id })
								updateNextMutationId()
							}} autoContrast aria-label="Settings" radius={"xl"} color={colorsAddButton}>
								<IconPlus style={{ width: '70%', height: '70%', color: colorsAddButtonIcon }} stroke={1.5} />
							</ActionIcon>
						</Stack>
					</Fieldset>
				</GridCol>
			</Grid>
		</>
	)
}