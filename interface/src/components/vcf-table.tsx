import { useSequencingStore } from "@/lib/sequencing-store";
import { Table } from "@mantine/core";

export default function VCFTable() {

	const { vcfObjects } = useSequencingStore()

	const rows = vcfObjects.map((vcfObject) => (
		<Table.Tr key={vcfObject.mut}>
			<Table.Td>{vcfObject.mut}</Table.Td>
			<Table.Td>{vcfObject.sample_DP}</Table.Td>
			<Table.Td>{vcfObject.sample_AD}</Table.Td>
			<Table.Td>{vcfObject.VAF}</Table.Td>
			<Table.Td>{vcfObject.fun_eff}</Table.Td>
		</Table.Tr>
	));
	return (
		<Table highlightOnHover withColumnBorders>
			<Table.Thead>
				<Table.Tr style={{ backgroundColor: 'black', color: 'white' }}>
					<Table.Th colSpan={5} style={{ textAlign: "center", fontWeight: "bold", fontSize: "1.2rem" }}>
						VCF
					</Table.Th>
				</Table.Tr>
				<Table.Tr>
					<Table.Th>mut</Table.Th>
					<Table.Th>DP</Table.Th>
					<Table.Th>AD_ALT</Table.Th>
					<Table.Th>VAF</Table.Th>
					<Table.Th>functional effect</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>{rows}</Table.Tbody>
		</Table>
	)
}