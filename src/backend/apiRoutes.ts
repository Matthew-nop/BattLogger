import { Application } from 'express';
import sqlite3 from 'sqlite3';

import { ChemistryManager } from './chemistryManager.js';
import { FormFactorManager } from './formfactorManager.js';
import { ModelManager } from './modelManager.js';
import { BatteryManager } from './batteryManager.js';
import { TestManager } from './testManager.js';

import { ChemistryHandler } from './handlers/chemistryHandler.js';
import { FormFactorHandler } from './handlers/formfactorHandler.js';
import { ModelHandler } from './handlers/modelHandler.js';
import { BatteryHandler } from './handlers/batteryHandler.js';
import { TestHandler } from './handlers/testHandler.js';

export function setupApiRoutes(app: Application, db: sqlite3.Database, chemistryManager: ChemistryManager, formFactorManager: FormFactorManager, modelManager: ModelManager) {
	const batteryManager = BatteryManager.getInstance();
	batteryManager.setDb(db);
	const testManager = TestManager.getInstance();
	testManager.setDb(db);

	const chemistryHandler = new ChemistryHandler(chemistryManager);
	const formFactorHandler = new FormFactorHandler(formFactorManager);
	const modelHandler = new ModelHandler(modelManager);
	const batteryHandler = new BatteryHandler(batteryManager);
	const testHandler = new TestHandler(testManager);

	app.get('/api/data', batteryHandler.getData);
	app.get('/api/model_map', modelHandler.getModelMap);
	app.get('/api/model_details', modelHandler.getModelDetails);
	app.get('/api/chemistry_details', chemistryHandler.getChemistriesMap);
	app.get('/api/formfactor_details', formFactorHandler.getFormFactorMap);
	app.get('/api/model_details_data/:guid', modelHandler.getModelDetailsForId);
	app.get('/api/battery_tests/:batteryId', testHandler.getBatteryTests);
	app.get('/api/battery/:batteryId', batteryHandler.getBattery);
	app.get('/api/battery_details_data/:batteryId', batteryHandler.getBatteryDetailsForId);

	app.post('/api/create_model', modelHandler.createModel);
	app.post('/api/create_formfactor', formFactorHandler.createFormFactor);
	app.post('/api/create_chemistry', chemistryHandler.createChemistry);
	app.post('/api/create_battery', batteryHandler.createBattery);
	app.put('/api/battery/:batteryId', batteryHandler.updateBattery);
	app.delete('/api/battery/:batteryId', batteryHandler.deleteBattery);
	app.post('/api/battery_test', testHandler.addBatteryTestRunInfo);

}
