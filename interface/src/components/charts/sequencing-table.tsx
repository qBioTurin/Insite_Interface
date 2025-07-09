import { Badge, Box, Grid, GridCol, Text } from "@mantine/core";
import { colorsPicker } from "../colors";

export default function SequencingTable() {
	return (
		<>
			<Grid>
				<GridCol offset={1} style={{ borderBottom: "2px solid" }} span={5}>
					<Text ta="center" >Populations</Text>
				</GridCol>
				<GridCol style={{ borderLeft: "2px solid", borderBottom: "2px solid" }} span={4}>
					<Text ta="center">Number of Cells</Text>
				</GridCol>
			</Grid>
			<Grid>
				<GridCol span={1}>
					<Box
						mt={"xs"}
						mb={"xs"}
						h={80}
						w={30}
						bg={colorsPicker[0]}
					/>
				</GridCol>
				<GridCol style={{ borderBottom: "2px solid" }} span={5}>
					<Badge>Mut1</Badge>
				</GridCol>
				<GridCol style={{ borderLeft: "2px solid", borderBottom: "2px solid" }} span={4}>
					<Badge>213</Badge>
				</GridCol>
			</Grid>
			<Grid style={{ border: '10px' }}>
				<GridCol span={1}>
					<Box
						mt={"xs"}
						mb={"xs"}
						h={80}
						w={30}
						bg={colorsPicker[1]}
					/>
				</GridCol>
				<GridCol py={"sm"} span={5}>
					<Badge color="red" px={"xs"} py={"md"}>
						<Badge mr={"xs"}>Mut1</Badge>
						<Badge>Mut1</Badge>
					</Badge>
					<Badge>Mut1</Badge>
					<Badge>Mut1</Badge>
					<Badge>Mut1</Badge>
				</GridCol>
				<GridCol style={{ borderLeft: "2px solid" }} span={4}>
					<Badge>213</Badge>
					<Badge>213</Badge>
					<Badge>213</Badge>
					<Badge>213</Badge>
					<Badge>213</Badge>
				</GridCol>
			</Grid>
		</>
	)
}