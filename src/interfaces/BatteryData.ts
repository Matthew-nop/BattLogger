export interface BatteryData {
	id: string;
	model_id: string;
  last_tested_capacity: number;
  last_tested_timestamp: string;
  chemistry_name: string;
  formfactor_name: string;
}