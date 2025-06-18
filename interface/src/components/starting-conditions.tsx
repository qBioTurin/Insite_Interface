import { Grid, GridCol, NumberInput, Text, Stack, NativeSelect, Fieldset, Badge, ActionIcon } from "@mantine/core";
import { colorsAddButton, colorsAddButtonIcon, colorsPills } from "./colors";
import { defaultStartingConditions } from "./default-values";
import { Mutation, Population, Event } from "./interfaces";
import { IconPlus } from "@tabler/icons-react";
import PopulationCombobox from "./population-combobox";

export default function StartingConditions({ populations, mutations, functionalEvents, setMutations, nextMutationId, setNextMutationId, setPopulations, setNextPopulationId, nextPopulationId, updatePopulationsNumberCells, addMutationToPopulation, updateMutationEvent }: { populations: Population[]; mutations: Mutation[]; functionalEvents: Event[]; setMutations: React.Dispatch<React.SetStateAction<Mutation[]>>; nextMutationId: number; setNextMutationId: React.Dispatch<React.SetStateAction<number>>; setPopulations: React.Dispatch<React.SetStateAction<Population[]>>; setNextPopulationId: React.Dispatch<React.SetStateAction<number>>; nextPopulationId: number, updatePopulationsNumberCells: (populationToUpdate: Population, newNumberCells: number) => void, addMutationToPopulation: (population: Population, mutation: Mutation) => void, updateMutationEvent: (mutation: Mutation, newEvent: number) => void }) {
	return (
		<>
			<h1>Starting Conditions</h1>
			<NumberInput label="Starting number of cells" defaultValue={defaultStartingConditions} hideControls w={"40%"} />
			<Grid mt={40}>
				<GridCol span={8}>
					<Fieldset legend="Starting Populations">
						<Stack>
							{populations.map((population, index) => {
								return (
									<Grid key={index} align="flex-end">
										<GridCol span={2}>
											<Text>{population.name}</Text>
										</GridCol>
										<GridCol span={7}>
											<PopulationCombobox mutations={mutations} addMutationToPopulation={addMutationToPopulation} population={population} />
										</GridCol>
										<GridCol span={3}>
											<NumberInput onChange={(val) => updatePopulationsNumberCells(population, Number(val))} defaultValue={population.numberOfCells} label="Number of cells" hideControls />
										</GridCol>
									</Grid>
								)
							})}
							<ActionIcon onClick={() => {
								setPopulations([...populations, { id: nextPopulationId, name: `Population${nextPopulationId}`, mutations: [], numberOfCells: 1 }]);
								setNextPopulationId(nextPopulationId + 1);
							}} autoContrast aria-label="Settings" radius={"xl"} color={colorsAddButton}>
								<IconPlus style={{ width: '70%', height: '70%', color: colorsAddButtonIcon }} stroke={1.5} />
							</ActionIcon>
						</Stack>
					</Fieldset>
				</GridCol>
				<GridCol span={4}>
					<Fieldset legend="Mutations Phenotypes">
						<Stack>
							{mutations.map((mutation, index) => {
								return (
									<Grid key={index} align="flex-end">
										<GridCol span={4}>
											<Badge color={colorsPills} autoContrast size="lg">{mutation.name}</Badge>
										</GridCol>
										<GridCol span={8}>
											<NativeSelect onChange={(e) => updateMutationEvent(mutation, Number(e.currentTarget.value))} data={functionalEvents.map(event => ({ label: event.name, value: String(event.id) }))} />
										</GridCol>
									</Grid>
								)
							})}
							<ActionIcon onClick={() => {
								setMutations([...mutations, { name: `Mut${nextMutationId}`, event: functionalEvents[0].id }]);
								setNextMutationId(nextMutationId + 1);
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