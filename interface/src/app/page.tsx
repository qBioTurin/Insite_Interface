'use client'
import FunctionalEvents from "@/components/functional-events";
import GeneralInformation from "@/components/general-information";
import { parseJson } from "@/lib/parse-json";

import { Button, Container, Divider, Group } from "@mantine/core";

export default function Home() {
	return (
		<>
			<Container mb={50}>
				<GeneralInformation />
				<Divider my="md" />
				<FunctionalEvents />
				<Divider my="md" />
				<Group justify="flex-end" >
					<Button onClick={() => parseJson()} variant="outline">Run Simulation</Button>
				</Group>
			</Container>
		</>
	);
}
