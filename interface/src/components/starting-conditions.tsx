import { Grid, GridCol, NumberInput, Text, Stack, NativeSelect, Fieldset, Badge, ActionIcon, Button } from "@mantine/core";
import { colors, colorsAddButton, colorsAddButtonIcon, colorsPage, colorsPills } from "./colors";
import { Event } from "./interfaces";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import PopulationCombobox from "./population-combobox";
import { useStartingConditionsStore } from "@/lib/starting-conditions-store";
import InputLabel from "./input-label";
import { useFunctionalEventsStore } from "@/lib/functional-events-store";

export default function StartingConditions() {
	const {
		addMutations,
		updateNextMutationId,
		updateMutations,
		updateNextPopulationId,
		addPopulation,
		updatePopulationNumberCells,
		removeMutation,
		removePopulation,
		nextPopulationId,
		populations,
		nextMutationId,
		mutations
	} = useStartingConditionsStore();

	const { functionalEvents } = useFunctionalEventsStore();

	function getEventTypeById(id: number, events: Event[]) {
		return events.filter(e => e.id === id)[0].type
	}

	return (
		<>
			<h1>Starting Conditions</h1>
			<Text c={colorsPage.lightDescription} mb={"lg"}>
				Define the initial state of your simulation by specifying the number and composition of starting cells.
				By default, tumors are assumed to originate from a single transformed cell carrying an advantageous mutation. However, this simulator also allows for more complex scenarios, such as multiple coexisting populations at time zero.
				For each initial population, you can set the number of cells, define its genotype (i.e., the set of mutations already present) and specify the functional effects of these mutations by associating them with one the events you chose.
			</Text>
			<Grid mt={40}>
				<GridCol span={7}>
					<Fieldset legend={<InputLabel fw={400} label="Starting Populations" tooltip="Mutations are treated as unique events and cannot appear independently in unrelated lineages. This constraint is automatically enforced during the simulation. However, when defining starting conditions manually, you must ensure that:
Shared mutations only occur when one population is a subclone of another.
The genotypes are consistent with a tree-like structure, i.e., no parallel acquisition of the same mutation in distinct branches.
Use the interface to add as many initial populations as needed. The simulator will take care of verifying genotype consistency."/>}>
						<Stack>
							{populations.map((population, index) => {
								return (
									<Grid key={index} align="flex-end">
										<GridCol span={1}>
											<Text>{population.name}</Text>
										</GridCol>
										<GridCol span={6}>
											<PopulationCombobox population={population} />
										</GridCol>
										<GridCol span={3}>
											<NumberInput onChange={(val) => updatePopulationNumberCells(population, Number(val))} defaultValue={population.numberOfCells} label="Number of cells" hideControls />
										</GridCol>
										<GridCol span={2}>
											<ActionIcon onClick={() => {
												removePopulation(population)
											}} autoContrast aria-label="Settings" radius={"xl"} color={colorsAddButton}>
												<IconMinus style={{ width: '70%', height: '70%', color: colorsAddButtonIcon }} stroke={1.5} />
											</ActionIcon>
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
									<Grid key={index} align="center">
										<GridCol span={3}>
											<Badge color={colors[getEventTypeById(mutation.event, functionalEvents)]} autoContrast size="lg">{mutation.name}</Badge>
										</GridCol>
										<GridCol span={7}>
											<NativeSelect onChange={(e) => updateMutations(mutation, Number(e.currentTarget.value))} data={functionalEvents.map(event => ({ label: event.name, value: String(event.id) }))} />
										</GridCol>
										<GridCol span={2}>
											<ActionIcon onClick={() => {
												removeMutation(mutation)
											}} autoContrast aria-label="Settings" radius={"xl"} color={colorsAddButton}>
												<IconMinus style={{ width: '70%', height: '70%', color: colorsAddButtonIcon }} stroke={1.5} />
											</ActionIcon>
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