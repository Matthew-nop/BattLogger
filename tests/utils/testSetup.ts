import express from 'express';
import sqlite3 from 'sqlite3';
import { setupApiRoutes } from '../../src/backend/apiRoutes.js';
import { ChemistryManager } from '../../src/backend/chemistryManager.js';
import { FormFactorManager } from '../../src/backend/formfactorManager.js';
import { ModelManager } from '../../src/backend/modelManager.js';
import { setupTestDatabase, teardownTestDatabase } from './testDbUtils.js';
import { BatteryManager } from '../../src/backend/batteryManager.js';
import { TestManager } from '../../src/backend/testManager.js';
import { ImportExportManager } from '../../src/backend/importExportManager.js';
import { ChemistryHandler } from '../../src/backend/handlers/chemistryHandler.js';
import { FormFactorHandler } from '../../src/backend/handlers/formfactorHandler.js';
import { ModelHandler } from '../../src/backend/handlers/modelHandler.js';
import { BatteryHandler } from '../../src/backend/handlers/batteryHandler.js';
import { TestHandler } from '../../src/backend/handlers/testHandler.js';
import { ImportExportHandler } from '../../src/backend/handlers/importExportHandler.js';

interface TestSetup {
	app: express.Application;
	db: sqlite3.Database;
}

export async function setupTestEnvironment(): Promise<TestSetup> {
	const app = express();
	app.use(express.json());

	const db = new sqlite3.Database(':memory:');
	await setupTestDatabase(db);

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

	return { app, db };
}

export function teardownTestEnvironment(db: sqlite3.Database): Promise<void> {
	return teardownTestDatabase(db);
}
