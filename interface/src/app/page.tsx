'use client'
import FunctionalEvents from "@/components/functional-events";
import GeneralInformation from "@/components/general-information";
import { parseJson } from "@/lib/parse-json";

import { Button, Container, Divider, Group } from "@mantine/core";

export default function Home() {

	async function handleSubmit() {
		const res = await fetch('/api/proxy', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(parseJson()),
		});

		const data = await res.json();
		console.log(data);
	}

	return (
		<>
			<Container mb={50}>
				<GeneralInformation />
				<Divider my="md" />
				<FunctionalEvents />
				<Divider my="md" />
				<Group justify="flex-end" >
					<Button onClick={() => handleSubmit()} variant="outline">Run Simulation</Button>
				</Group>
			</Container>
		</>
	);
}
