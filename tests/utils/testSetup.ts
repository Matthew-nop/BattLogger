import express from 'express';
import { setupApiRoutes } from '../../src/backend/apiRoutes';
import { ChemistryManager } from '../../src/backend/chemistryManager.js';
import { FormFactorManager } from '../../src/backend/formfactorManager.js';
import { ModelManager } from '../../src/backend/modelManager.js';
import sqlite3 from 'sqlite3';
import { setupTestDatabase, teardownTestDatabase } from './testDbUtils.js';

interface TestSetup {
    app: express.Application;
    db: sqlite3.Database;
}

export async function setupTestEnvironment(): Promise<TestSetup> {
	const app = express();
	app.use(express.json());

	const db = new sqlite3.Database(':memory:');
	await setupTestDatabase(db);
	const chemistryManager = ChemistryManager.getInstance();
	chemistryManager.setDb(db);
	const formFactorManager = FormFactorManager.getInstance();
	formFactorManager.setDb(db);
	const modelManager = ModelManager.getInstance();
	modelManager.setDb(db);
	setupApiRoutes(app, db, chemistryManager, formFactorManager, modelManager);

	return { app, db };
}

export function teardownTestEnvironment(db: sqlite3.Database): Promise<void> {
	return teardownTestDatabase(db);
}
