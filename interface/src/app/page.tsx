'use client'
import FunctionalEvents from "@/components/functional-events";
import { parseJson } from "@/lib/parse-json";

import { Button, Container, Divider, Grid, GridCol, Group, Progress, Card } from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";
import { IconPlayerPlayFilled } from "@tabler/icons-react";
import { colorsAddButtonIcon, colorsPicker, colorsRunButton } from "@/components/colors";
import parseColors from "@/lib/parse-colors";
import { useColorsLegendStore } from "@/lib/colors-legend-store";
import { BarChart } from "@mantine/charts";
import { notifications } from "@mantine/notifications";
import PopulationsHeatmap from "@/components/charts/populations-heatmap";
import { useStartingConditionsStore } from "@/lib/starting-conditions-store";
import SimulationStep from "@/components/simulation-step";
import { useSimulationStepStore } from "@/lib/simulation-step-store";
import StartingConditions from "@/components/starting-conditions";
import { useSimulationPlotOptionsStore } from "@/lib/simulation-plot-options";
import { useSequencingStore } from "@/lib/sequencing-store";
import SimulationResults from "@/components/simulation-results";

export default function Home() {
	const [endAnalysis, setEndAnalysis] = useState(false)
	const [loading, setLoading] = useState(false)
	const isFirstRender = useRef(0);
	// const [error, setError] = useState(false)
	const [percentage, setPercentage] = useState(0)

	const { colors, addColor, resetColors, changeColor, updateChangingColor, changingColor } = useColorsLegendStore()
	const { sequenced, sequencingDay, setSequenced } = useSequencingStore()

	const { depth, updateImageVersion, setPlotBase, setPlotExponent, updateChangingDepth } = useSimulationPlotOptionsStore()

	const {dataPlot, dataPlotStacked, series} = useSequencingStore()

	function addColorsStarting(_colors: { color: string, label: string }[]) {
		resetColors()
		_colors.map((c, i) => addColor({ label: c.label, color: colorsPicker[i % 20] }))
	}

	const { savingCheckpoints } = useSimulationStepStore()

	const { populations } = useStartingConditionsStore()

	const pollPercentageUntilComplete = async () => {
		let isComplete = false

		while (!isComplete) {
			try {
				const res = await fetch(`/api/check_percentage?checkpoints=${savingCheckpoints}`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				})
				const data = await res.json()
				const percentStr = data.stdout || "0%"
				const percent = parseFloat(percentStr.replace('%', ''))

				setPercentage(Math.max(1, percent - 10))

				if (percent >= 100) {
					isComplete = true
				} else {
					await new Promise(resolve => setTimeout(resolve, 1000))
				}
			} catch (e) {
				console.error("Errore durante il polling:", e)
				await new Promise(resolve => setTimeout(resolve, 2000))
			}
		}
	}


	const handleSubmit = async () => {
		if (populations.length <= 0) {
			notifications.show({
				title: 'Error in starting populations',
				message: 'You should have at least one population',
				color: 'red'
			})
			return
		}
		setSequenced(false)
		setEndAnalysis(false)
		setLoading(true)
		setPercentage(1)
		try {
			await fetch('/api/clean_data', {
				method: "GET",
				headers: {
					'Content-Type': 'application/json',
				},
			})
			const proxyResponsePromise = fetch('/api/proxy', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					sim: parseJson(),
					image: parseColors(),
					depth: depth
				}),
			})

			await pollPercentageUntilComplete()

			const res = await proxyResponsePromise;
			const data = await res.json();
			addColorsStarting(data['stdout']);


		} catch (e) {
			notifications.show({
				title: 'Error in starting populations',
				message: 'The populations should ...',
				color: 'red'
			})
			setLoading(false)
		}

		const res2 = await fetch('/api/draw_plot', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				sim: parseJson(),
				image: parseColors()
			}),
		})

		const val = (await res2.json()).stdout
		setPlotBase(val.base)
		setPlotExponent(val.exponent)

		updateImageVersion()
		setEndAnalysis(true)
		setPercentage(100)
		setLoading(false)
	}

	useEffect(() => {
		if (isFirstRender.current < 2) {
			isFirstRender.current++;
			return;
		}
		const fetchData = async () => {
			const res = await fetch('/api/get_obs_tum', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					depth: depth
				}),
			});

			addColorsStarting((await res.json())['stdout'])

			await fetch('/api/draw_plot', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					sim: parseJson(),
					image: parseColors()
				}),
			});

			updateImageVersion()
			setEndAnalysis(true);
			setLoading(false);
			updateChangingDepth(false)
		};

		updateChangingDepth(true)
		fetchData();
	}, [depth])

	useEffect(() => {
		if (isFirstRender.current < 2) {
			isFirstRender.current++;
			return;
		}
		const fetchData = async () => {
			const res2 = await fetch('/api/draw_plot', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					sim: parseJson(),
					image: parseColors()
				}),
			});

			const result = await res2.json();
			console.log(result);

			updateImageVersion()
			setEndAnalysis(true);
			setLoading(false);
			updateChangingColor()
		};

		updateChangingColor();
		fetchData();
	}, [changeColor])



	return (
		<>
			<Container mb={50}>
				{/* <SequencingTable /> */}
				<SimulationStep />
				<Divider my="md" />
				<FunctionalEvents />
				<Divider my="md" />
				<StartingConditions />
				<Divider my="md" />
				<Grid justify="center" align="center">
					<GridCol span={"auto"}>
						{percentage !== 0 && !endAnalysis && (
							<Progress color={colorsAddButtonIcon} value={percentage} striped animated transitionDuration={200} />
						)}
					</GridCol>
					<GridCol span={"content"}>
						<Group justify="flex-end" >
							<Button color={colorsRunButton}
								autoContrast
								leftSection={<IconPlayerPlayFilled size={14} />}
								loading={loading}
								onClick={() => handleSubmit()}
								variant="filled" size={"xl"} radius={"md"}>
								Run Simulation
							</Button>
						</Group>
					</GridCol>
				</Grid>
				{endAnalysis && <SimulationResults />}
				{sequenced && (
					<Card mt={"lg"} shadow="sm"
						padding="xl">
						<h2>Sequencing at day {sequencingDay}</h2>

						<BarChart
							mt={"md"}
							h={100}
							data={dataPlotStacked}
							tickLine="none"
							gridAxis="none"
							type="stacked"
							orientation="vertical"
							dataKey="name"
							withYAxis={false}
							series={series}
							barProps={{ width: 20 }}
						/>
						<PopulationsHeatmap dataPlot={dataPlot} />
					</Card>
				)}
			</Container>
		</>
	);
}
