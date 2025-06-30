import { Group, Text, Tooltip } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

export default function InputLabel({ label, tooltip, size="sm", fw=300 }: { label: string, tooltip: string, size?: string, fw?: number }) {
	return (
		<Group gap="3">
			<Text size={size} fw={fw}>{label}</Text>
			<Tooltip
				label={tooltip}
				position={"right"}
				multiline
				w={350}
				transitionProps={{ duration: 200 }}
				withArrow
			>
				<IconInfoCircle size={14} style={{ color: "gray" }} />
			</Tooltip>
		</Group>
	)
}