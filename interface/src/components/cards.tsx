'use client'
import { Card, CloseButton, TextInput, Text, Slider, Group, Grid, GridCol } from "@mantine/core";
import { colors } from "./colors";
import { defaultEventParams } from "./default-values";
import { Event } from "./interfaces";

export function CardGrowth({ event, removeEvent, updateEventName, updateEventParam }: { event: Event; removeEvent: (eventToRemove: Event) => void; updateEventName: (eventToRename: Event, newName: string) => void; updateEventParam: (eventToUpdate: Event, paramName: keyof NonNullable<Event["params"]>, value: number) => void }) {
	return (
		<Card shadow="sm" radius="md" withBorder>
			<Grid justify="center" gutter="xs" align="center">
				<GridCol span={"auto"}>
					<TextInput value={event.name} radius={"xl"} onChange={(e) => updateEventName(event, e.target.value)} />
				</GridCol>
				<GridCol span={'content'}>
					<CloseButton onClick={() => removeEvent(event)} />
				</GridCol>
			</Grid>
			<Text mt="md" size="sm" mb={"xs"}>
				Proliferative advantage:
			</Text>
			<Slider mb={"md"} color={colors.growth} onChange={(value) => updateEventParam(event, "proliferativeAdvantage", value)} value={event.params?.proliferativeAdvantage} min={0} max={0.1} step={0.001} marks={[
				{ value: 0.02, label: '0.02' },
				{ value: 0.05, label: '0.05' },
				{ value: 0.08, label: '0.08' },
			]} />
		</Card>
	)
}

export function CardMutation({ event, removeEvent, updateEventName, updateEventParam }: { event: Event; removeEvent: (eventToRemove: Event) => void; updateEventName: (eventToRename: Event, newName: string) => void; updateEventParam: (eventToUpdate: Event, paramName: keyof NonNullable<Event["params"]>, value: number) => void }) {
	return (
		<Card shadow="sm" padding="lg" radius="md" withBorder>
			<Grid justify="center" gutter="xs" align="center">
				<GridCol span={"auto"}>
					<TextInput value={event.name} radius={"xl"} onChange={(e) => updateEventName(event, e.target.value)} />
				</GridCol>
				<GridCol span={'content'}>
					<CloseButton onClick={() => removeEvent(event)} />
				</GridCol>
			</Grid>
			<Text mt="md" size="sm" mb={"xs"}>
				Mutational amplification factor:
			</Text>
			<Slider mb="md" onChange={(value) => updateEventParam(event, "mutationalAmplificationFactor", value)} color={colors.mutation} value={event.params?.mutationalAmplificationFactor} min={0} max={2} scale={(v: number) => 10 ** v} step={0.1} restrictToMarks label={(value) => value.toFixed(0)} marks={[
				{ value: Math.log10(1), label: '1' },
				{ value: Math.log10(2), label: '2' },
				{ value: Math.log10(3) },
				{ value: Math.log10(4) },
				{ value: Math.log10(5), label: '5' },
				{ value: Math.log10(10), label: '10' },
				{ value: Math.log10(20), label: '20' },
				{ value: Math.log10(30) },
				{ value: Math.log10(40) },
				{ value: Math.log10(50), label: '50' },
				{ value: Math.log10(100), label: '100' },
			]} />
		</Card>
	)
}

export function CardSpace({ event, removeEvent, updateEventName, updateEventParam }: { event: Event; removeEvent: (eventToRemove: Event) => void; updateEventName: (eventToRename: Event, newName: string) => void; updateEventParam: (eventToUpdate: Event, paramName: keyof NonNullable<Event["params"]>, value: number) => void }) {
	return (
		<Card shadow="sm" padding="lg" radius="md" withBorder>
			<Grid justify="center" gutter="xs" align="center">
				<GridCol span={"auto"}>
					<TextInput value={event.name} radius={"xl"} onChange={(e) => updateEventName(event, e.target.value)} />
				</GridCol>
				<GridCol span={'content'}>
					<CloseButton onClick={() => removeEvent(event)} />
				</GridCol>
			</Grid>
			<Text mt="md" size="sm" mb={"xs"}>
				Additional space or resources:
			</Text>
			<Slider mb={"md"} onChange={(value) => updateEventParam(event, "additionalSpace", value)} restrictToMarks color={colors.space} value={event.params?.additionalSpace} min={1} max={7} step={1} label={(value) => <span>10<sup>{value}</sup></span>} marks={[
				{ value: 1, label: <span>10<sup>1</sup></span> },
				{ value: 2 },
				{ value: 3, label: <span>10<sup>3</sup></span> },
				{ value: 4 },
				{ value: 5, label: <span>10<sup>5</sup></span> },
				{ value: 6 },
				{ value: 7, label: <span>10<sup>7</sup></span> },
			]} />
		</Card>
	)
}

export function CardCompetition({ event, removeEvent, updateEventName, updateEventParam }: { event: Event; removeEvent: (eventToRemove: Event) => void; updateEventName: (eventToRename: Event, newName: string) => void; updateEventParam: (eventToUpdate: Event, paramName: keyof NonNullable<Event["params"]>, value: number) => void }) {
	return (
		<Card shadow="sm" padding="lg" radius="md" withBorder>
			<Grid justify="center" gutter="xs" align="center">
				<GridCol span={"auto"}>
					<TextInput value={event.name} radius={"xl"} onChange={(e) => updateEventName(event, e.target.value)} />
				</GridCol>
				<GridCol span={'content'}>
					<CloseButton onClick={() => removeEvent(event)} />
				</GridCol>
			</Grid>
			<Text mt="md" size="sm" mb={"xs"}>
				Susceptibility index:
			</Text>
			<Slider mb={"md"} onChange={(value) => updateEventParam(event, "susceptibility", value)} color={colors.competition} value={event.params?.susceptibility} min={-2} max={2} step={0.1} marks={[
				{ value: -2, label: '-2' },
				{ value: -1, label: '-1' },
				{ value: 0, label: '0' },
				{ value: 1, label: '1' },
				{ value: 2, label: '2' },
			]} />
			<Text mt="lg" size="sm" mb={"xs"}>
				Offensive score:
			</Text>
			<Slider mb={'md'} onChange={(value) => updateEventParam(event, "offensiveScore", value)} color={colors.competition} value={event.params?.offensiveScore} min={-2} max={2} step={0.1} marks={[
				{ value: -2, label: '-2' },
				{ value: -1, label: '-1' },
				{ value: 0, label: '0' },
				{ value: 1, label: '1' },
				{ value: 2, label: '2' },
			]} />
		</Card>
	)
}

export function CardPassenger({ event, removeEvent, updateEventName }: { event: Event; removeEvent: (eventToRemove: Event) => void; updateEventName: (eventToRename: Event, newName: string) => void }) {
	return (
		<Card shadow="sm" padding="lg" radius="md" withBorder>
			<Grid justify="center" gutter="xs" align="center">
				<GridCol span={"auto"}>
					<TextInput defaultValue={event.name} radius={"xl"} onChange={(e) => updateEventName(event, e.target.value)} />
				</GridCol>
				<GridCol span={'content'}>
					<CloseButton onClick={() => removeEvent(event)} />
				</GridCol>
			</Grid>
		</Card>
	)
}