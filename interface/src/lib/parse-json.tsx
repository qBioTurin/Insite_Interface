import { TreeNode } from "@/components/interfaces";
import { useFunctionalEventsStore } from "./functional-events-store";
import { useGeneralInformationStore } from "./general-information-store";
import { useStartingConditionsStore } from "./starting-conditions-store";

function groupSets(sets: Set<string>[]): Set<string>[][] {
	const groups: Set<string>[][] = [];

	for (const currentSet of sets) {
		let merged = false;

		for (const group of groups) {
			if (group.some(s => hasIntersection(s, currentSet))) {
				group.push(currentSet);
				merged = true;
				break;
			}
		}

		if (!merged) {
			groups.push([currentSet]);
		}
	}

	return mergeOverlappingGroups(groups);
}

function hasIntersection(a: Set<string>, b: Set<string>): boolean {
	for (const el of a) {
		if (b.has(el)) {
			return true;
		}
	}
	return false;
}

function mergeOverlappingGroups(groups: Set<string>[][]): Set<string>[][] {
	let changed: boolean;

	do {
		changed = false;
		outer: for (let i = 0; i < groups.length; i++) {
			for (let j = i + 1; j < groups.length; j++) {
				if (groups[i].some(a => groups[j].some(b => hasIntersection(a, b)))) {
					// Unisce j in i
					groups[i].push(...groups[j]);
					groups.splice(j, 1);
					changed = true;
					break outer;
				}
			}
		}
	} while (changed);

	return groups;
}

function generateTree(sets: Set<string>[]): TreeNode[] {
	if (sets.length === 0) return [];

	const [firstSet, ...restSets] = sets;
	const commonItems = new Set(
		[...firstSet].filter(item =>
			restSets.every(set => set.has(item))
		)
	);

	const [itemToRemove] = commonItems;
	if (itemToRemove !== undefined) {
		for (const set of sets) {
			set.delete(itemToRemove);
		}

		return [{ key: itemToRemove, data: itemToRemove, children: generateTree(sets) }]
	} else {
		const disjointSets = groupSets(sets).map(sets => sets.filter(set => set.size > 0)).filter(sets => sets.length > 0)

		return disjointSets.flatMap(set => {
			return generateTree(set)
		})
	}
}

function renameTreeNodes(nodes: TreeNode[], prefix: string = ''): TreeNode[] {
	return nodes.map((node, index) => {
		// const currentId = prefix ? `${prefix}_${index + 1}` : `${index + 1}`;
		const currentId = `${index + 1}`
		return {
			key: node.key,
			data: currentId,
			children: node.children ? renameTreeNodes(node.children, currentId) : undefined
		};
	});
}

function findDataByKey(nodes: TreeNode[], key: string): string | undefined {
	for (const node of nodes) {
		if (node.key === key) {
			return node.data;
		}
		if (node.children) {
			const found = findDataByKey(node.children, key);
			if (found !== undefined) {
				return found;
			}
		}
	}
	return undefined;
}



export function parseJson() {
	const {
		functionalEvents,
	} = useFunctionalEventsStore.getState();
	const {
		cellLifeDays,
		carryingCapacity,
		mutationRate,
		mutableBases,
		endingTime,
		savingCheckpoints
	} = useGeneralInformationStore.getState();

	const {
		mutations,
		populations
	} = useStartingConditionsStore.getState();

	const tree = renameTreeNodes(generateTree((populations.map(p => new Set(p.mutations)))))

	const genotype: number[][] = []
	const phenotype: any[] = []
	const numCells: number[] = []

	populations.filter(p => p.mutations.length > 0).map((p) => {
		genotype.push(p.mutations.map(m => Number(findDataByKey(tree, m))))
		phenotype.push(p.mutations.map(m => mutations.filter(m1 => m1.name === m)[0].event))
		numCells.push(p.numberOfCells)
	})

	const jsonObject = {
		cellLife: cellLifeDays,
		carryingCapacity,
		mutationRate,
		mutableBases,
		endingTime,
		savingCheckpoints,
		functionalEvents,
		populations: {
			genotype,
			phenotype,
			numCells
		}
	};

	return jsonObject
}