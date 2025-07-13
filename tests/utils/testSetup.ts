import express from 'express';
import sqlite3 from 'sqlite3';
import { bootstrap } from '../../src/backend/utils/bootstrap.js';
import { insertDummyValues, teardownTestDatabase } from './testDbUtils.js';

interface TestSetup {
	app: express.Application;
	db: sqlite3.Database;
}

export async function setupTestEnvironment(): Promise<TestSetup> {
	const app = express();
	app.use(express.json());
	const db = new sqlite3.Database(':memory:');
	
	await bootstrap(app, db, true);
	
	await insertDummyValues(db);

	return { app, db }
}

export function teardownTestEnvironment(db: sqlite3.Database): Promise<void> {
	return teardownTestDatabase(db);
}
