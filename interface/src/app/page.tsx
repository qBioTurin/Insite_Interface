'use client'
import AdvancedInformation from "@/components/advanced-information";
import FunctionalEvents from "@/components/functional-events";
import GeneralInformation from "@/components/general-information";
import { parseJson } from "@/lib/parse-json";
import Image from 'next/image';

import { Box, Button, ButtonGroup, Container, Divider, Grid, GridCol, Group, LoadingOverlay, SegmentedControl, Notification, Slider, Stack, Text, Progress } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconChevronUp, IconMinus, IconPlayerPlayFilled, IconPlus } from "@tabler/icons-react";
import { colorsAddButtonIcon, colorsPage, colorsPicker, colorsRunButton } from "@/components/colors";
import LabelledColorPicker from "@/components/labelledColorPicker";
import parseColors from "@/lib/parse-colors";
import { useColorsLegendStore } from "@/lib/colors-legend-store";
import { LineChart } from "@mantine/charts";
import arrow_image from '@/assets/side_plot_show.png'
import { notifications } from "@mantine/notifications";

export default function Home() {
	const [endAnalysis, setEndAnalysis] = useState(false)
	const [loading, setLoading] = useState(false)
	const [version, setVersion] = useState<number | null>(null);
	const [sliderValue, setSliderValue] = useState(0);
	const [sequencing, setSequencing] = useState(false)
	const [frequence, setFrequence] = useState('absolute')
	const isFirstRender = useRef(0);
	const [base, setBase] = useState(0)
	const [exponent, setExponent] = useState(0)
	const [depth, setDepth] = useState(3)
	const [changingDepth, setChangingDepth] = useState(false)
	const [error, setError] = useState(false)
	const [percentage, setPercentage] = useState(0)

	const { colors, addColor, resetColors, changeColor, updateChangingColor, changingColor } = useColorsLegendStore()
	const thumbOffset = (0.17 * sliderValue) - 14

	const sliderPercent = (sliderValue / 100) * 100;

	function addColorsStarting(_colors: { color: string, label: string }[]) {
		resetColors()
		_colors.map((c, i) => addColor({ label: c.label, color: colorsPicker[i % 20] }))
	}

	const pollPercentageUntilComplete = async () => {
		let isComplete = false

		while (!isComplete) {
			try {
				const res = await fetch('/api/check_percentage', {
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
		// console.log(val)
		setBase(val.base)
		setExponent(val.exponent)

		setVersion(Date.now());
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

			setVersion(Date.now());
			setEndAnalysis(true);
			setLoading(false);
			setChangingDepth(false)
		};

		setChangingDepth(true)
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

			setVersion(Date.now());
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
				<GeneralInformation />
				<AdvancedInformation />
				<Divider my="md" />
				<FunctionalEvents />
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
				{endAnalysis &&
					<>
						<h1>Results</h1>
						<Grid align="center">
							<GridCol span={4}>
								<SegmentedControl value={frequence} onChange={setFrequence} style={{ backgroundColor: '#ede8e8' }} data={[
									{ label: 'Absolute Frequence', value: 'absolute' },
									{ label: 'Relative Frequence', value: 'relative' }]} />
							</GridCol>
							<GridCol span={3}>
								<ButtonGroup>
									<Button disabled={changingDepth || depth <= 2} color={colorsAddButtonIcon} onClick={() => {
										if (depth > 2) setDepth(depth - 1)
									}} variant="outline" size={"xs"} radius="md">
										<IconMinus />
									</Button>
									<Button disabled={changingDepth || depth >= 4} color={colorsAddButtonIcon} onClick={() => {
										if (depth < 4) setDepth(depth + 1)
									}} variant="outline" size={"xs"} radius="md" >
										<IconPlus />
									</Button>
								</ButtonGroup>
							</GridCol>
							<GridCol span={3} offset={2}>
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
											key={version}
											src={`/api/image?v=${version}&frequence=${frequence}`}
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
											<Slider color={'black'} domain={[0, 100]} styles={{
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
													transform: `translateX(${sliderPercent - 3.5}%)`,
													transition: 'left 0.2s ease',
													marginTop: "1%"
												}}
											>
												<Button w="60px" color={"black"} autoContrast variant="filled">GO</Button>
											</div>
										</>
									}
								</GridCol>
								<GridCol span={1}>
									<div style={{ aspectRatio: "1/6.92", position: "relative" }}>
										<Image
											key={version}
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
													borderRadius: "4px", // opzionale, per bordi arrotondati
													color: "black" // assicura contrasto leggibile
												}}
											>
												{frequence === 'absolute' && (
													<>
														{base}&middot;10<sup>{exponent}</sup>
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
						</Stack>
					</>
				}
			</Container>
		</>
	);
}
