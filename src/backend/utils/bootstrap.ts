import express from 'express';
import path from "path";
import sqlite3 from 'sqlite3';
import { BatteryManager } from '../batteryManager.js';
import { ChemistryManager } from '../chemistryManager.js';
import { FormFactorManager } from '../formfactorManager.js';
import { BatteryHandler } from '../handlers/batteryHandler.js';
import { ChemistryHandler } from '../handlers/chemistryHandler.js';
import { FormFactorHandler } from '../handlers/formfactorHandler.js';
import { ImportExportHandler } from '../handlers/importExportHandler.js';
import { ModelHandler } from '../handlers/modelHandler.js';
import { TestHandler } from '../handlers/testHandler.js';
import { ImportExportManager } from '../importExportManager.js';
import { ModelManager } from '../modelManager.js';
import { TestManager } from '../testManager.js';
import { setupApiRoutes } from './apiRoutes.js';
import { createTables } from "./createTables.js";
import { insertBuiltInData } from "./dbUtils.js";
import { setupPageRoutes } from './pageRoutes.js';

export const bootstrap = async (
	app: express.Application,
	db: sqlite3.Database,
	initDb: boolean
): Promise<void> => {

	const chemistryManager = ChemistryManager.getInstance();
	chemistryManager.setDb(db);
	const formFactorManager = FormFactorManager.getInstance();
	formFactorManager.setDb(db)
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

	if (initDb) {
		await createTables(db);
		await insertBuiltInData(db);
	}	

	const chemistryHandler = new ChemistryHandler(chemistryManager);
	const formFactorHandler = new FormFactorHandler(formFactorManager);
	const modelHandler = new ModelHandler(modelManager);
	const batteryHandler = new BatteryHandler(batteryManager);
	const testHandler = new TestHandler(testManager);
	const importExportHandler = new ImportExportHandler(importExportManager);

	const frontendPath = path.join(import.meta.dirname, '..', '..', 'dist', 'frontend');
	app.use(express.static(frontendPath));
	app.use(express.json()); // Enable JSON body parsing

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
}

