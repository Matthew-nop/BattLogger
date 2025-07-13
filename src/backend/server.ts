import express from 'express';
import path from 'path';
import sqlite3 from 'sqlite3';

import { setupApiRoutes } from './apiRoutes.js';
import { BatteryManager } from './batteryManager.js';
import { ChemistryManager } from './chemistryManager.js';
import { FormFactorManager } from './formfactorManager.js';
import { ImportExportManager } from './importExportManager.js';
import { ModelManager } from './modelManager.js';
import { setupPageRoutes } from './pageRoutes.js';
import { TestManager } from './testManager.js';

import { BatteryHandler } from './handlers/batteryHandler.js';
import { ChemistryHandler } from './handlers/chemistryHandler.js';
import { FormFactorHandler } from './handlers/formfactorHandler.js';
import { ImportExportHandler } from './handlers/importExportHandler.js';
import { ModelHandler } from './handlers/modelHandler.js';
import { TestHandler } from './handlers/testHandler.js';

const app: any = express();
const frontendPath = path.join(import.meta.dirname, '..', '..', 'dist', 'frontend');
app.use(express.static(frontendPath));
app.use(express.json()); // Enable JSON body parsing

const port = 3000;

const db = new sqlite3.Database('./database.sqlite', (err: Error | null) => {
	if (err) {
		console.error(err.message);
	}
	console.log('Connected to the SQLite database.');
});

// Initialize Managers with the database instance
const chemistryManager = ChemistryManager.getInstance();
chemistryManager.setDb(db);

const formFactorManager = FormFactorManager.getInstance();
formFactorManager.setDb(db);

const modelManager = ModelManager.getInstance();
modelManager.setDb(db);

const batteryManager = BatteryManager.getInstance();
batteryManager.setDb(db);

const testManager = TestManager.getInstance();
testManager.setDb(db);

const importExportManager = new ImportExportManager(
	batteryManager,
	chemistryManager,
	formFactorManager,
	modelManager,
	testManager
);

// Initialize Handlers with their respective Managers
const chemistryHandler = new ChemistryHandler(chemistryManager);
const formFactorHandler = new FormFactorHandler(formFactorManager);
const modelHandler = new ModelHandler(modelManager);
const batteryHandler = new BatteryHandler(batteryManager);
const testHandler = new TestHandler(testManager);
const importExportHandler = new ImportExportHandler(importExportManager);

setupApiRoutes(
	app, 
	batteryHandler, 
	chemistryHandler, 
	formFactorHandler, 
	modelHandler, 
	testHandler, 
	importExportHandler
);
setupPageRoutes(app);

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
