'use client'
import { CheckIcon, Combobox, ComboboxDropdownTarget, ComboboxEventsTarget, Group, Pill, PillGroup, PillsInput, PillsInputField, useCombobox } from "@mantine/core";
import { useState } from "react";
import { Mutation, Population } from "./interfaces";
import { colorsPills } from "./colors";
import { useStartingConditionsStore } from "@/lib/starting-conditions-store";

export default function PopulationCombobox({ population }: { population: Population }) {
	const {
		addMutationToPopulation,
		mutations
	} = useStartingConditionsStore();
	const [values, setValues] = useState<string[]>(population.mutations);

	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
		onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
	});

	const handleValueSelect = (val: string) => {
		addMutationToPopulation(population, mutations.filter((mut) => mut.name === val)[0].name)
		setValues((current) =>
			current.includes(val) ? current.filter((v) => v !== val) : [...current, val]
		);
	}

	const handleValueRemove = (val: string) =>
		setValues((current) => current.filter((v) => v !== val));

	const options = mutations
		.map((mutation) => mutation.name)
		.filter((item) => !values.includes(item))
		.map((item) => (
			<Combobox.Option value={item} key={item} active={values.includes(item)}>
				<Group gap="sm">
					{values.includes(item) ? <CheckIcon size={12} /> : null}
					<Pill style={{ backgroundColor: colorsPills }}>{item}</Pill>
				</Group>
			</Combobox.Option>
		));

	const pills = values.map((item) => (
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
										handleValueRemove(values[values.length - 1]);
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