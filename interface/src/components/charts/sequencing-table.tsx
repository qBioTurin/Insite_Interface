import { Badge, Box, Flex, Grid, GridCol, Text } from "@mantine/core";
import { colors, colorsAddButton, colorsPage } from "../colors";
import React from "react";
import { useSequencingStore } from "@/lib/sequencing-store";
import { useFunctionalEventsStore } from "@/lib/functional-events-store";

export default function SequencingTable() {

	const { dataTableMut } = useSequencingStore()
	const { getEffectByName } = useFunctionalEventsStore()

	return (
		<>
			<Text>
				Composition of the mass
			</Text>
			<Grid columns={24}>
				<GridCol offset={3} span={10}>
					<Text ta="center" >Populations</Text>
				</GridCol>
				<GridCol style={{ borderLeft: "2px solid" }} span={10}>
					<Text ta="center">Number of Cells</Text>
				</GridCol>
			</Grid>
			{dataTableMut.map((row, index) => {
				return (
					<Grid key={index} columns={24}>
						<GridCol span={2} py={"lg"}>
							<Box
								p="lg"
								style={{
									backgroundColor: row.color,
									height: '100%',
									width: '100%',
									borderRadius: 8,
								}}
							/>
						</GridCol>
						<GridCol style={{ borderTop: "2px solid" }} offset={1} span={10}>
							{row.pop_names.map((pop_n, i) => (
								<React.Fragment key={i}>
									{pop_n.length > 1 && (
										<Badge color={colorsAddButton} px={"xs"} py={"md"} mr={"xs"} mt={"xs"}>
											<Flex
												mih={50}
												gap="sm"
												justify="center"
												align="center"
												direction="row"
												wrap="wrap"
											>
												{pop_n.map((p, subIndex) => (
													<Badge color={colors[getEffectByName(row.fun_eff[i][subIndex]) as keyof typeof colors]} key={subIndex}>{p}</Badge>
												))}
											</Flex>
										</Badge>
									)}
									{pop_n.length === 1 && (
										pop_n.map((p, subIndex) => (
											<Badge mr={"xs"} color={colors[getEffectByName(row.fun_eff[i][subIndex]) as keyof typeof colors]} key={subIndex}>{p}</Badge>
										)))}
								</React.Fragment>
							))}
							{row.remaining! > 0 && (<Text c={"gray"}>...{row.remaining} more</Text>)}
						</GridCol>
						<GridCol style={{ borderLeft: "2px solid", borderTop: "2px solid" }} span={10}>
							{row.ncells.map((n, i) => (
								<React.Fragment key={i}>
									<Badge mr={"xs"} autoContrast color={colorsAddButton}>{n}</Badge>
								</React.Fragment>
							))}
							{row.remaining! > 0 && (<Text c={"gray"}>...{row.remaining} more</Text>)}
						</GridCol>
					</Grid>
				)
			})}
		</>
	)
}