import { ActionIcon, Box, Button, ButtonGroup, Grid, GridCol, Group, LoadingOverlay, SegmentedControl, Slider, Stack, Text } from "@mantine/core"
import { IconChevronDown, IconChevronUp, IconDownload, IconMinus, IconPlus } from "@tabler/icons-react"
import Image from "next/image"
import LabelledColorPicker from "./labelledColorPicker"
import { colorMutTable, colorsAddButtonIcon, colorsPage } from "./colors"
import { useState } from "react"
import { useSimulationPlotOptionsStore } from "@/lib/simulation-plot-options"
import { LineChart } from "@mantine/charts"
import arrow_image from '@/assets/side_plot_show.png'
import { useColorsLegendStore } from "@/lib/colors-legend-store"
import { useSimulationStepStore } from "@/lib/simulation-step-store"
import { useSequencingStore } from "@/lib/sequencing-store"
import { RowMutTable } from "./interfaces"

export default function SimulationResults() {
	const [frequence, setFrequence] = useState('absolute')
	const [sequencing, setSequencing] = useState(false)
	const [sliderValue, setSliderValue] = useState(0);
	const [loadSequencing, setLoadSequencing] = useState(false)

	const thumbOffset = (0.17 * sliderValue) - 14

	const { depth, changingDepth, imageVersion, plotBase, plotExponent, updateDepth } = useSimulationPlotOptionsStore()
	const { colors, changingColor } = useColorsLegendStore()
	const { savingCheckpoints, endingTime } = useSimulationStepStore()
	const { setSequenced, setDataPlot, setDataPlotStacked, setSeries, setSequencingDay, setDataTableMut, setNumSeq, updatePlotVersion } = useSequencingStore()

	async function downloadPDF() {
		const response = await fetch(`/api/download_pdf?frequence=${frequence}`);

		if (!response.ok) {
			throw new Error('Errore nel download del PDF');
		}

		const blob = await response.blob();
		const url = window.URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = `plot_download_${frequence}.pdf`;
		document.body.appendChild(a);
		a.click();
		a.remove();

		window.URL.revokeObjectURL(url);
	}

	async function getSequencing() {
		setLoadSequencing(true)
		const numSeq = sliderValue * savingCheckpoints / 100
		const res2 = await fetch(`/api/get_sequencing?numSeq=${numSeq}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		setNumSeq(numSeq)

		const result = await res2.json();
		setLoadSequencing(false)
		setSequenced(true)
		const barplot = result.barplot;
		const data: { nMut: number; nCells: number; nPop: number }[] = Object.keys(barplot.ncells).map((key) => ({
			nMut: parseInt(key),
			nCells: barplot.ncells[key],
			nPop: barplot.npop[key],
		}));
		setDataPlot(data)

		const table_pop: RowMutTable[] = result.pops;
		const data_table = table_pop.map((p, index) => {
			const max_val = Math.floor(10 / p.nmut)
			return { nmut: p.nmut, pop_names: p.pop_names.slice(0, max_val), fun_eff: p.fun_eff.slice(0, max_val), ncells: p.ncells.slice(0, max_val), remaining: p.pop_names.length - max_val, color: colorMutTable[index] }
		})

		setDataTableMut(data_table)

		const output = [
			data.reduce(
				(acc, item) => {
					acc[item.nMut.toString()] = item.nCells;
					return acc;
				},
				{ name: 'mut' } as Record<string, number | string>
			)
		];

		const series = Object.keys(output[0])
			.filter((key) => key !== 'name')
			.map((key, index) => ({
				name: key,
				color: colorMutTable[index]
			}));

		setDataPlotStacked(output)
		setSeries(series)
		setSequencingDay(Math.floor(sliderValue / 100 * endingTime))
		updatePlotVersion()
	}

	return (
		<>
			<h1>Your Simulation</h1>
			<Text c={colorsPage.lightDescription} mb={"lg"}>
				The simulation output is displayed directly as a Muller plot, showing the clonal dynamics of the tumor over time. Each area represents a subclone, evolving and expanding based on the rules you defined.
				You can interact with the plot using the following tools:
				Absolute/Relative Abundance Switch between total number of cells (absolute) and proportion of the tumor mass (relative)
				Granularity Control: subclones below a threshold will be hidden to reduce visual noise and focus on significant populations. The zoom lets you adjust such threshold
				Color Customization
				Virtual Sequencing: select a specific time point to simulate a sequencing experiment
			</Text>
			<Grid align="center" justify="center">
				<GridCol span={"content"}>
					<ActionIcon variant="default" onClick={downloadPDF}>
						<IconDownload />
					</ActionIcon>
				</GridCol>
				<GridCol span={"content"}>
					<SegmentedControl value={frequence} onChange={setFrequence} style={{ backgroundColor: '#ede8e8' }} data={[
						{ label: 'Absolute Frequence', value: 'absolute' },
						{ label: 'Relative Frequence', value: 'relative' }]} />
				</GridCol>
				<GridCol span={"content"}>
					<ButtonGroup>
						<Button disabled={changingDepth || depth <= 2} color={colorsAddButtonIcon} onClick={() => {
							if (depth > 2) updateDepth(depth - 1)
						}} variant="default" size={"xs"} radius="md">
							<IconMinus />
						</Button>
						<Button disabled={changingDepth || depth >= 4} color={colorsAddButtonIcon} onClick={() => {
							if (depth < 4) updateDepth(depth + 1)
						}} variant="default" size={"xs"} radius="md" >
							<IconPlus />
						</Button>
					</ButtonGroup>
				</GridCol>
				<GridCol span={"auto"}>
					<Group justify="flex-end">
						<Button color={"black"} variant="transparent" autoContrast onClick={() => setSequencing(!sequencing)} rightSection={
							(!sequencing && <IconChevronDown size={"15px"} />) || (sequencing && <IconChevronUp size={"15px"} />)
						}>
							<Text size="lg" fw={600}>Sequencing</Text>
						</Button>
					</Group>
				</GridCol>
			</Grid>
			<Stack mt={"xl"}>
				<Grid>
					<GridCol span={1}>
						<Box
							style={{
								height: '100%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Box
								style={{
									transform: 'rotate(-90deg)',
									transformOrigin: 'center',
									whiteSpace: 'nowrap',
								}}
							>
								<Text size="xl">{frequence === 'absolute' && <>Absolute</>} {frequence === 'relative' && <>Relative</>}Frequence</Text>
							</Box>
						</Box>
					</GridCol>
					<GridCol span={10}>
						<div style={{ width: "100%", aspectRatio: "16/9", position: "relative" }}>
							<LoadingOverlay visible={changingDepth} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
							<Image
								key={imageVersion}
								src={`/api/image?v=${imageVersion}&frequence=${frequence}`}
								alt="Analysis Result"
								fill
								sizes="100vw"
								style={{ objectFit: "contain" }}
								unoptimized
							/>
							{sequencing &&
								<div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
									<LineChart
										gridAxis="none"
										withXAxis={false}
										withYAxis={false}
										withDots={false}
										withTooltip={false}
										orientation="vertical"
										yAxisProps={{ domain: [0, 100] }}
										xAxisProps={{ domain: [0, 100] }}
										data={[
											{ date: "A", Apples: sliderValue },
											{ date: "B", Apples: sliderValue }
										]}
										curveType="linear"
										dataKey="date"
										series={[
											{ name: 'Apples', color: 'black' },
										]}
										style={{ width: "100%", height: "100%" }}
									/>
								</div>
							}
						</div>
						{sequencing &&
							<>
								<Slider color={'black'} domain={[0, 100]} step={100 / savingCheckpoints} styles={{
									bar: {
										height: '1px',
										width: '1px'
									},
									thumb: {
										width: '12px',
										height: '12px',
										transform: `translateX(${thumbOffset}px) translateY(-5px)`,
									},
								}} label={null} value={sliderValue} onChange={setSliderValue} />

								<div
									style={{
										transform: `translateX(${sliderValue - 3.5}%)`,
										transition: 'left 0.2s ease',
										marginTop: "1%"
									}}
								>
									<Button w="60px" loading={loadSequencing} color={"black"} onClick={getSequencing} autoContrast variant="filled">GO</Button>
								</div>
							</>
						}
					</GridCol>
					<GridCol span={1}>
						<div style={{ aspectRatio: "1/6.92", position: "relative" }}>
							<Image
								src={arrow_image}
								alt="Analysis Result"
								fill
							/>
							<div
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: "100%",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									pointerEvents: "none",
									fontSize: "1.2rem",
								}}
							>
								<span
									style={{
										backgroundColor: colorsPage.background,
										padding: "0.2em 0.4em",
										borderRadius: "4px",
										color: "black"
									}}
								>
									{frequence === 'absolute' && (
										<>
											{plotBase}&middot;10<sup>{plotExponent}</sup>
										</>
									)}
									{frequence === 'relative' && (
										<>
											100%
										</>
									)}
								</span>
							</div>
						</div>
					</GridCol>
				</Grid>
			</Stack>
			<Grid pos={"relative"} pt={"md"} pb={"md"} px={"md"}>
				<LoadingOverlay visible={changingColor} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
				{colors.map((c, index) => {
					return (
						<GridCol key={index} span="content">
							<LabelledColorPicker label={c.label} c={c.color} />
						</GridCol>
					)
				})}
			</Grid>
		</>
	)
}