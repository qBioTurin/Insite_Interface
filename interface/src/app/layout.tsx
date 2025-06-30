import type { Metadata } from "next";
import "./globals.css";
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import { MantineProvider } from '@mantine/core';
import AppShellLayout from "@/components/app-shell";
import '@mantine/notifications/styles.css';
import { Notifications } from "@mantine/notifications";

export const metadata: Metadata = {
	title: "Cancer Simulator",
	description: "",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<MantineProvider>
					<Notifications />
					<AppShellLayout>{children}</AppShellLayout>
				</MantineProvider>
			</body>
		</html>
	);
}
