import { Application } from 'express';
import { BatteryHandler } from '../handlers/batteryHandler.js';
import { ChemistryHandler } from '../handlers/chemistryHandler.js';
import { FormFactorHandler } from '../handlers/formfactorHandler.js';
import { ImportExportHandler } from '../handlers/importExportHandler.js';
import { ModelHandler } from '../handlers/modelHandler.js';
import { TestHandler } from '../handlers/testHandler.js';

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
	app.post('/api/create_test_run', testHandler.createTestRun);
	app.post('/api/create_test_run_process', testHandler.createTestRunProcess);
	app.get('/api/test_run_processes', testHandler.getTestRunProcesses);

	app.get('/api/export/all', importExportHandler.exportAll);
	app.post('/api/import/all', importExportHandler.importAll);
	app.get('/api/export/chemistries', importExportHandler.exportChemistries);
	app.post('/api/import/chemistries', importExportHandler.importChemistries);
	app.get('/api/export/formfactors', importExportHandler.exportFormFactors);
	app.post('/api/import/formfactors', importExportHandler.importFormFactors);
	app.get('/api/export/models', importExportHandler.exportModels);
	app.post('/api/import/models', importExportHandler.importModels);
	app.get('/api/export/batteries', importExportHandler.exportBatteries);
	app.post('/api/import/batteries', importExportHandler.importBatteries);
	app.get('/api/export/testruns', importExportHandler.exportTestRuns);
	app.post('/api/import/testruns', importExportHandler.importTestRuns);
	app.get('/api/export/test_run_processes', importExportHandler.exportTestRunProcesses);
	app.post('/api/import/test_run_processes', importExportHandler.importTestRunProcesses);
}
