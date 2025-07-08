import { Application } from 'express';
import { Database } from 'sqlite3';

import { createBattery, deleteBattery, getBattery, getData, updateBattery, getBatteryDetailsForId } from './batteryManager';
import { addBatteryTestRunInfo, getBatteryTests } from './testManager';
import { ChemistryManager } from './chemistryManager';
import { FormFactorManager } from './formfactorManager';
import { createModel, getModelDetails, getModelDetailsForId, getModelMap } from './modelManager';

export function setupApiRoutes(app: Application, db: Database, chemistryManager: ChemistryManager, formFactorManager: FormFactorManager) {
	
	app.get('/api/data', getData(db));
	app.get('/api/model_map', getModelMap);
	app.get('/api/model_details', getModelDetails);
	app.get('/api/chemistry_details', (req, res) => chemistryManager.getChemistriesMap(req, res));
	app.get('/api/formfactor_details', (req, res) => formFactorManager.getFormFactorMap(req, res));
	app.get('/api/model_details_data/:guid', getModelDetailsForId(db));
	app.get('/api/battery_tests/:batteryId', getBatteryTests(db));
	app.get('/api/battery/:batteryId', getBattery(db));
	app.get('/api/battery_details_data/:batteryId', getBatteryDetailsForId(db));

	app.post('/api/create_model', (req, res) => createModel(db, req, res));
	app.post('/api/create_formfactor', (req, res) => formFactorManager.createFormFactor(req, res));
	app.post('/api/create_chemistry', (req, res) => chemistryManager.createChemistry(req, res));
	app.post('/api/create_battery', createBattery(db));
	app.put('/api/battery/:batteryId', updateBattery(db));
	app.delete('/api/battery/:batteryId', deleteBattery(db));
	app.post('/api/battery_test', addBatteryTestRunInfo(db));

}
