'use client'
import { CheckIcon, Combobox, ComboboxDropdownTarget, ComboboxEventsTarget, Group, Pill, PillGroup, PillsInput, PillsInputField, useCombobox } from "@mantine/core";
import { Population } from "./interfaces";
import { colorsPills } from "./colors";
import { useStartingConditionsStore } from "@/lib/starting-conditions-store";

export default function PopulationCombobox({ population }: { population: Population }) {
	const {
		addMutationToPopulation,
		removeMutationFromPopulation,
		mutations
	} = useStartingConditionsStore();

	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
		onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
	});

	const handleValueSelect = (val: string) => {
		addMutationToPopulation(population, mutations.filter((mut) => mut.name === val)[0].name)
	}

	const handleValueRemove = (val: string) => {
		removeMutationFromPopulation(population, mutations.filter((mut) => mut.name === val)[0].name)
	}

	const options = mutations
		.map((mutation) => mutation.name)
		.filter((item) => !population.mutations.includes(item))
		.map((item) => (
			<Combobox.Option value={item} key={item} active={population.mutations.includes(item)}>
				<Group gap="sm">
					{population.mutations.includes(item) ? <CheckIcon size={12} /> : null}
					<Pill style={{ backgroundColor: colorsPills }}>{item}</Pill>
				</Group>
			</Combobox.Option>
		));

	const pills = population.mutations.map((item) => (
		<Pill key={item} style={{ backgroundColor: colorsPills }} withRemoveButton onRemove={() => handleValueRemove(item)}>
			{item}
		</Pill>
	));

	return (
		<Combobox store={combobox} onOptionSubmit={handleValueSelect} withinPortal={false}>
			<ComboboxDropdownTarget>
				<PillsInput label="Mutations" onClick={() => combobox.openDropdown()}>
					<PillGroup>
						{pills}
						<ComboboxEventsTarget>
							<PillsInputField
								type="hidden"
								onBlur={() => combobox.closeDropdown()}
								onKeyDown={(event) => {
									if (event.key === 'Backspace') {
										event.preventDefault();
										handleValueRemove(population.mutations[population.mutations.length - 1]);
									}
								}}
							/>
						</ComboboxEventsTarget>
					</PillGroup>
				</PillsInput>
			</ComboboxDropdownTarget>
			<Combobox.Dropdown>
				<Combobox.Options>
					{options.length === 0 ? <Combobox.Empty>All options selected</Combobox.Empty> : options}
				</Combobox.Options>
			</Combobox.Dropdown>
		</Combobox>
	)
}