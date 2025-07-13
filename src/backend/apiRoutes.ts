import { Application } from 'express';

import { BatteryHandler } from './handlers/batteryHandler.js';
import { ChemistryHandler } from './handlers/chemistryHandler.js';
import { FormFactorHandler } from './handlers/formfactorHandler.js';
import { ImportExportHandler } from './handlers/importExportHandler.js';
import { ModelHandler } from './handlers/modelHandler.js';
import { TestHandler } from './handlers/testHandler.js';

export function setupApiRoutes(
	app: Application, 
	batteryHandler: BatteryHandler,
	chemistryHandler: ChemistryHandler, 
	formFactorHandler: FormFactorHandler,
	modelHandler: ModelHandler, 
	testHandler: TestHandler, 
	importExportHandler: ImportExportHandler
) {
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
	app.post('/api/battery_test', testHandler.createTestRun);

	app.get('/api/export', importExportHandler.exportAll);
	app.post('/api/import', importExportHandler.importAll);
	app.get('/api/export/chemistries', importExportHandler.exportChemistries);
	app.post('/api/import/chemistries', importExportHandler.importChemistries);
	app.get('/api/export/formfactors', importExportHandler.exportFormFactors);
	app.post('/api/import/formfactors', importExportHandler.importFormFactors);
	app.get('/api/export/models', importExportHandler.exportModels);
	app.post('/api/import/models', importExportHandler.importModels);
}
