export interface Event {
	id: number;
	name: string;
	type: "growth" | "mutation" | "space" | "competition" | "passenger";
	frequency: number;
	params?: {
		proliferativeAdvantage?: number;
		mutationalAmplificationFactor?: number;
		additionalSpace?: number;
		susceptibility?: number;
		offensiveScore?: number;
	};
}

export interface Mutation {
	name: string;
	event: number;
}

export interface Population {
	id: number;
	name: string;
	mutations: string[];
	numberOfCells: number;
}

export interface TreeNode {
	key: string;
	data: string;
	children?: TreeNode[]
}