'use client'
import { useGeneralInformationStore } from "@/lib/general-information-store";
import { Grid, GridCol, NumberInput } from "@mantine/core";

export default function GeneralInformation() {
	const {
		setCellLifeDays,
		setCarryingCapacity,
		setMutationRate,
		setMutableBases,
	} = useGeneralInformationStore();

	return (
		<>

			<h1>General Information</h1>
			<Grid align="flex-end" >
				<GridCol span={6}>
					<NumberInput
						label="Cell Life (days)"
						defaultValue={4}
						hideControls
						onChange={(val) => setCellLifeDays(Number(val))}
					/>
				</GridCol>
				<GridCol span={6}>
					<NumberInput
						label="Basic carrying capacity"
						defaultValue={1e6}
						hideControls
						onChange={(val) => setCarryingCapacity(Number(val))}
					/>
				</GridCol>
				<GridCol span={6}>
					<NumberInput
						label="Basic mutation rate"
						defaultValue={8e-9}
						hideControls
						onChange={(val) => setMutationRate(Number(val))}
					/>
				</GridCol>
				<GridCol span={6}>
					<NumberInput
						label="Number of possibility-to-mutate base pairs of interest"
						defaultValue={5000}
						hideControls
						onChange={(val) => setMutableBases(Number(val))}
					/>
				</GridCol>
			</Grid>

		</>
	)
}