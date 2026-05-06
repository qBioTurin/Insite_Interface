import { BarChart } from "@mantine/charts";
import { Button, Card, Container, Grid, GridCol, Group, SimpleGrid, Stack, Switch, Text } from "@mantine/core";
import PopulationsHeatmap from "./charts/populations-heatmap";
import { useSequencingStore } from "@/lib/sequencing-store";
import Image from "next/image";
import SequencingTable from "./charts/sequencing-table";
import { colorsAddButtonIcon, colorsPage, colorsRunButton } from "./colors";
import { useState } from "react";
import VCFTable from "./vcf-table";
import InnerImageZoom from "react-inner-image-zoom";
import 'react-inner-image-zoom/lib/styles.min.css';
import InputLabel from "./input-label";
import CellsPlot from "./charts/cells-plot";

export default function SequencingSection() {
	const { dataPlot, dataPlotStacked, series, sequencingDay, firstSubsampled, plotVersion, numSeq, updateSubsampleVersion, setFirstSubsampled, subsampleVersion, setVCFObjects, subsampled, setSubsampled } = useSequencingStore()
	const [colored, setColored] = useState(false);
	const [loading, setLoading] = useState(false)

	const sequencingSubsample = async () => {
		setSubsampled(false)
		setLoading(true)
		var subsample: any
		if (firstSubsampled) {
			subsample = await fetch(`/api/get_sequencing_subsample?numSeq=${numSeq}&first=true`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				}
			})
		} else {
			subsample = await fetch(`/api/get_sequencing_subsample?numSeq=${numSeq}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				}
			})
		}

		const data = await subsample.json();
		setVCFObjects(data['data'])
		updateSubsampleVersion()
		setSubsampled(true)
		setLoading(false)
		setFirstSubsampled(false)
	}

	return (
		<>
			<Card mt={"lg"} shadow="sm"
				padding="xl">
				<h2>Sequencing at day {sequencingDay}</h2>
				<Text c={colorsPage.lightDescription} mb={"lg"}>
					Inspect the true state of the tumor at a specific timepoint. This includes a full snapshot of the clonal composition: which populations are present, their mutational profiles, and the evolutionary tree connecting them. This is an idealized view of the tumor, directly extracted from the simulation, free from experimental biases or limitations: a precise look inside the simulated biology.
				</Text>


				<Container>
					<SequencingTable />
					<CellsPlot />
					<PopulationsHeatmap />
					<SimpleGrid cols={2} mt={"lg"}>
						<Stack>
							<Text>
								Evolutionary tree
							</Text>
							<InnerImageZoom
								src={`/api/image_tree?v=${plotVersion}`}
								zoomSrc={`/api/image_tree?v=${plotVersion}`}
								width={400}
								height={350}
								zoomType="hover"
								zoomPreload={true}
							/>
						</Stack>
						<Stack>
							<Grid align="center">
								<GridCol span={7}>
									<Text>
										Variant prevalence histogram
									</Text>
								</GridCol>
								<GridCol span={"auto"}>
									<Switch
										color={colorsAddButtonIcon}
										checked={colored}
										onChange={(event) => setColored(event.currentTarget.checked)}
									/>
								</GridCol>
							</Grid>
							<InnerImageZoom
								src={`/api/histogram?colored=${colored}&v=${plotVersion}`}
								zoomSrc={`/api/histogram?colored=${colored}&v=${plotVersion}`}
								width={400}
								height={350}
								zoomType="hover"
								zoomPreload={true}
							/>
						</Stack>
					</SimpleGrid>

				</Container>
			</Card>
			<Card mt={"lg"} shadow="sm"
				padding="xl">
				<Group justify="center">
					<Button onClick={sequencingSubsample} loading={loading} color={colorsRunButton}>Randomly subsample</Button>
				</Group>
				<Text c={colorsPage.lightDescription} mt={"md"}>
					Emulate the limitations of real-world sequencing. A small subset of the tumor is randomly sampled, mimicking a tissue biopsy. Mutations are detected based on depth and allelic coverage: for each site, sequencing depth is drawn randomly, and the number of mutated reads is sampled with probability proportional to the clonal fraction. This introduces biological and technical noise, producing a VCF-like output that resembles actual experimental data.
				</Text>
				{subsampled && !loading && (
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
			</Card>
		</>
	)
}