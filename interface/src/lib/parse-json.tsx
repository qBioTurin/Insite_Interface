import { useFunctionalEventsStore } from "./functional-events-store";
import { useGeneralInformationStore } from "./general-information-store";
import { useStartingConditionsStore } from "./starting-conditions-store";

export function parseJson() {
	const {
		functionalEvents,
	} = useFunctionalEventsStore.getState();
	const {
		cellLifeDays,
		carryingCapacity,
		mutationRate,
		mutableBases
	} = useGeneralInformationStore.getState();

	const {
		startingNumberOfCells,
		mutations,
		populations
	} = useStartingConditionsStore.getState();

	const jsonObject = {
		functionalEvents,
		generalInformation: {
			cellLifeDays,
			carryingCapacity,
			mutationRate,
			mutableBases
		},
		startingConditions: {
			startingNumberOfCells,
			mutations,
			populations
		}
	};

	console.log(jsonObject)
}