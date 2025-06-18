import { Grid, GridCol, NumberInput, SimpleGrid } from "@mantine/core";

export default function GeneralInformation() {
	return (
		<>

			<h1>General Information</h1>
			<Grid align="flex-end" >
				<GridCol span={6}>
					<NumberInput
						label="Cell Life (days)"
						defaultValue={4}
						hideControls
					/>
				</GridCol>
				<GridCol span={6}>
					<NumberInput
						label="Basic carrying capacity"
						defaultValue={1e6}
						hideControls
					/>
				</GridCol>
				<GridCol span={6}>
					<NumberInput
						label="Basic mutation rate"
						defaultValue={8e-9}
						hideControls
					/>
				</GridCol>
				<GridCol span={6}>
					<NumberInput
						label="Number of possibility-to-mutate base pairs of interest"
						defaultValue={5000}
						hideControls
					/>
				</GridCol>
			</Grid>

		</>
	)
}