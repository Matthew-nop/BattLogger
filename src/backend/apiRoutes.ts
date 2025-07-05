import { Application } from 'express';
import { Database } from 'sqlite3';

import { createBattery, deleteBattery, getBattery, getData, updateBattery } from './batteryManager';
import { addBatteryTestRunInfo, getBatteryTests } from './testManager';
import { createChemistry, getChemistryDetails } from './chemistryManager';
import { createFormFactor, getFormFactorDetails } from './formfactorManager';
import { createModel, getModelDetails, getModelDetailsForId, getModelMap } from './modelManager';

export function setupApiRoutes(app: Application, db: Database) {
	
	app.get('/api/data', getData(db));
	app.get('/api/model_map', getModelMap);
	app.get('/api/model_details', getModelDetails);
	app.get('/api/chemistry_details', getChemistryDetails);
	app.get('/api/formfactor_details', getFormFactorDetails);
	app.get('/api/model_details_data/:guid', getModelDetailsForId(db));
	app.get('/api/battery_tests/:batteryId', getBatteryTests(db));
	app.get('/api/battery/:batteryId', getBattery(db));

	app.post('/api/create_model', createModel);
	app.post('/api/create_form_factor', createFormFactor);
	app.post('/api/create_chemistry', createChemistry);
	app.post('/api/create_battery', createBattery(db));
	app.put('/api/battery/:batteryId', updateBattery(db));
	app.delete('/api/battery/:batteryId', deleteBattery(db));
	app.post('/api/battery_test', addBatteryTestRunInfo(db));

}
