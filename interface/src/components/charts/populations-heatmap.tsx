import { Box, Group } from "@mantine/core";
import React from "react";
import { colorsPicker } from "@/components/colors";
import { PlotData } from "@/components/interfaces";

export default function PopulationsHeatmap({dataPlot}: {dataPlot: PlotData[]}) {
	return (
		<Group gap={2} wrap="wrap" w={"100%"} mt={"lg"}>
			{dataPlot.map((e, idx) => (
				<React.Fragment key={idx}>
					{Array.from({ length: e.nPop }).map((_, i) => (
						<Box
							key={i}
							w={8}
							h={8}
							bg={colorsPicker[idx]}
							style={{ borderRadius: 1 }}
						/>
					))}
				</React.Fragment>
			))}
		</Group>
	)
}