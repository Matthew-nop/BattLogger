export interface BatteryData {
	id: string;
	modelId: string;
  lastTestedCapacity: number;
  lastTestedTimestamp: string;
  chemistryName: string;
  chemistryShortName: string;
  formfactorName: string;
}