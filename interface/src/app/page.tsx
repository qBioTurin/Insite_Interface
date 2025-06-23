'use client'
import AdvancedInformation from "@/components/advanced-information";
import FunctionalEvents from "@/components/functional-events";
import GeneralInformation from "@/components/general-information";
import { parseJson } from "@/lib/parse-json";
import Image from 'next/image';

import { Button, Center, Container, Divider, Group } from "@mantine/core";
import { useEffect, useState } from "react";
import { IconPlayerPlayFilled } from "@tabler/icons-react";

export default function Home() {
	const [endAnalysis, setEndAnalysis] = useState(false)
	const [loading, setLoading] = useState(false)
	const icon = <IconPlayerPlayFilled size={14} />;
	const [version, setVersion] = useState<number | null>(null);

	async function handleSubmit() {
		setEndAnalysis(false)
		setLoading(true)
		await fetch('/api/proxy', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(parseJson()),
		}).then(() => {
			setVersion(Date.now());
			setEndAnalysis(true)
			setLoading(false)
		});
	}

	return (
		<>
			<Container mb={50}>
				<GeneralInformation />
				<AdvancedInformation />
				<Divider my="md" />
				<FunctionalEvents />
				<Divider my="md" />
				<Group justify="flex-end" >
					<Button leftSection={icon} loading={loading} onClick={() => handleSubmit()} variant="outline">Run Simulation</Button>
				</Group>
				{endAnalysis &&
					<Center mt={"xl"}>
						<div style={{ position: "relative", width: "100%", height: "auto", aspectRatio: "16/9" }}>
							<Image
								key={version}
								src={`/api/image?v=${version}`}
								alt="Analysis Result"
								fill
								sizes="100vw"
								style={{ objectFit: "contain" }}
								unoptimized
							/>
						</div>
					</Center>
				}
			</Container>
		</>
	);
}
