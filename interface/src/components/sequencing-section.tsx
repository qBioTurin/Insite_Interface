import { BarChart } from "@mantine/charts";
import { Button, Card, Container, Grid, GridCol, Group, SimpleGrid, Stack, Switch, Text } from "@mantine/core";
import PopulationsHeatmap from "./charts/populations-heatmap";
import { useSequencingStore } from "@/lib/sequencing-store";
import Image from "next/image";
import SequencingTable from "./charts/sequencing-table";
import { colorsPage, colorsRunButton } from "./colors";
import { useState } from "react";
import VCFTable from "./vcf-table";

export default function SequencingSection() {
	const { dataPlot, dataPlotStacked, series, sequencingDay, plotVersion, numSeq, updateSubsampleVersion, subsampleVersion, setVCFObjects } = useSequencingStore()
	const [colored, setColored] = useState(false);
	const [subsample, setSubsample] = useState(false)
	const [loading, setLoading] = useState(false)

	const sequencingSubsample = async () => {
		setSubsample(false)
		setLoading(true)
		const subsample = await fetch(`/api/get_sequencing_subsample?numSeq=${numSeq}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		})

		const data = await subsample.json();
		setVCFObjects(data['data'])
		setSubsample(true)
		setLoading(false)
		updateSubsampleVersion()
	}

	return (
		<Card mt={"lg"} shadow="sm"
			padding="xl">
			<h2>Sequencing at day {sequencingDay}</h2>
			<Text c={colorsPage.lightDescription} mb={"lg"}>
				This is a zoomed view of the composition of the mass at day {sequencingDay}. At the bottom you can realize a realistic sequencing that randomly subsample the mass, performs a PCR and produce a VCF
			</Text>


			<Container>
				<SequencingTable />
				<Text mt={"lg"}>
					Number of cells colored by number of acquired mutations
				</Text>
				<BarChart
					h={100}
					data={dataPlotStacked}
					tickLine="none"
					gridAxis="none"
					type="percent"
					orientation="vertical"
					dataKey="name"
					withYAxis={false}
					series={series}
					barProps={{ width: 20 }}
				/>
				<Text mt={"lg"}>
					Populations colored by number of acquired mutations
				</Text>
				<PopulationsHeatmap dataPlot={dataPlot} />
				<SimpleGrid cols={2} mt={"lg"}>
					<Stack>
						<Text>
							Evolutionary tree
						</Text>
						<Image
							key={plotVersion}
							src={`/api/image_tree?v=${plotVersion}`}
							alt="Tree"
							height={350}
							width={400}
						/>
					</Stack>
					<Stack>
						<Grid>
							<GridCol span={7}>
								<Text>
									Variant prevalence histogram
								</Text>
							</GridCol>
							<GridCol span={2}>
								<Switch
									checked={colored}
									onChange={(event) => setColored(event.currentTarget.checked)}
								/>
							</GridCol>
						</Grid>
						<Image
							src={`/api/histogram?colored=${colored}&v=${plotVersion}`}
							alt="Tree"
							height={350}
							width={400}
						/>
					</Stack>
				</SimpleGrid>
				<Group justify="center" mt={"xl"}>
					<Button onClick={sequencingSubsample} loading={loading} color={colorsRunButton}>Randomly subsample</Button>
				</Group>
				{subsample && !loading && (
					<Grid mt={"lg"} justify="center" align="center">
						<GridCol span={6}>
							<Image
								key={subsampleVersion}
								src={`/api/zoom_sequence?v=${subsampleVersion}`}
								alt=""
								height={350}
								width={400}
							/>
						</GridCol>
						<GridCol span={6}>
							<div>
								<VCFTable />
							</div>
						</GridCol>
					</Grid>
				)}
			</Container>
		</Card>
	)
}