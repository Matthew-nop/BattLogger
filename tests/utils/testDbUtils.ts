import * as sqlite3 from 'sqlite3';

import { loadModelDetails } from '../../src/backend/utils/dbUtils.js';
import { stmtRunAsync } from '../../src/backend/utils/dbUtils.js';
import { createTables } from '../../src/backend/utils/createTables.js';
import { initializeDatabase } from '../../src/backend/utils/dbUtils.js';

import { ModelData } from '../../src/interfaces/interfaces.js';
import { randomUUID } from 'crypto';

export const insertDummyValues = async (db: sqlite3.Database): Promise<void> => {
	try {
		const modelDetails: Map<string, ModelData> = loadModelDetails();
		

		// Insert dummy battery and test data as part of application setup
		const batteryStmt = db.prepare("INSERT INTO batteries (id, model_id) VALUES (?, ?)");
		const testStmt = db.prepare("INSERT INTO battery_tests (battery_id, capacity, timestamp) VALUES (?, ?, ?)");

		const modelKeys = Array.from(modelDetails.keys());
		

		for (let i = 0; i < 11; i++) {
			const randomModelKey = modelKeys[Math.floor(Math.random() * modelKeys.length)];
			const model: ModelData | undefined = modelDetails.get(randomModelKey);
			if (model) {
				const batteryId = randomUUID();
				await stmtRunAsync(batteryStmt, [batteryId, model.id]);

				// Insert 3 test records for each battery
				for (let j = 0; j < 4; j++) {
					await stmtRunAsync(testStmt, [batteryId, Math.floor(Math.random() * 1000) + 1000, new Date(Date.now() - j * 86400000).toISOString()]);
				}
			}
		}

		batteryStmt.finalize();
		testStmt.finalize();

	} catch (err: any) {
		console.error(err.message);
	}
};

export async function setupTestDatabase(db: sqlite3.Database): Promise<void> {
	await createTables(db);
	await initializeDatabase(db);
	await insertDummyValues(db);
}

export function teardownTestDatabase(db: sqlite3.Database | undefined): Promise<void> {
	return new Promise((resolve, reject) => {
		if (db) {
			db.close((err) => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		} else {
			resolve();
		}
	});
}
