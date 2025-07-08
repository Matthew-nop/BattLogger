import express from 'express';
import { setupApiRoutes } from '../../src/backend/apiRoutes';
import { ChemistryManager } from '../../src/backend/chemistryManager.js';
import { FormFactorManager } from '../../src/backend/formfactorManager.js';
import { Database } from 'sqlite3';
import { setupTestDatabase, teardownTestDatabase } from './testDbUtils.js';

interface TestSetup {
    app: express.Application;
    db: Database;
}

export async function setupTestEnvironment(): Promise<TestSetup> {
	const app = express();
	app.use(express.json());

	const db = new Database(':memory:');
	await setupTestDatabase(db);
	const chemistryManager = ChemistryManager.getInstance();
	chemistryManager.setDb(db);
	const formFactorManager = FormFactorManager.getInstance();
	formFactorManager.setDb(db);
	setupApiRoutes(app, db, chemistryManager, formFactorManager);

	return { app, db };
}

export function teardownTestEnvironment(db: Database): Promise<void> {
	return teardownTestDatabase(db);
}
