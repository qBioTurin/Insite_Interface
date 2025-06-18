"use client";
import { AppShell, Burger, Group, Menu, Text, UnstyledButton } from "@mantine/core";
import { useDisclosure, useHeadroom } from "@mantine/hooks";
import logo from "@/assets/Logo_QBio_sfondoscuro.png";
import Image from "next/image";
import { colorsPage } from "./colors";

export default function AppShellLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AppShell
			styles={{
				root: { backgroundColor: colorsPage.background },
				header: { backgroundColor: colorsPage.header },
				main: { backgroundColor: colorsPage.background },
			}}
			header={{ height: 80 }}

		>
			<AppShell.Header>
				<Group px={20} py={10}>
					<Image src={logo} alt="QBio Logo" width={120} height={60} />
					<Group justify="flex-end" style={{ flex: 1 }}>
						<Text c="white" size={"xl"} fw={700} style={{ marginLeft: "10px" }}>
							Cancer Simulator
						</Text>
					</Group>
				</Group>
			</AppShell.Header>

			<AppShell.Main
			mt={20}
				style={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}
			>
				<div style={{ flex: "1" }}>{children}</div>
			</AppShell.Main>
		</AppShell>
	);
}