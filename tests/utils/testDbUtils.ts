import { randomUUID } from 'crypto';
import * as sqlite3 from 'sqlite3';
import { loadBuiltinModelDetails, stmtRunAsync } from '../../src/backend/utils/dbUtils.js';
import { ModelData } from '../../src/interfaces/interfaces.js';

export const insertDummyValues = async (db: sqlite3.Database): Promise<void> => {
	let batteryStmt: sqlite3.Statement | undefined;
	let testStmt: sqlite3.Statement | undefined;
	let testProcessStmt: sqlite3.Statement | undefined;

	try {
		const modelDetails: ModelData[] = loadBuiltinModelDetails();

		batteryStmt = db.prepare("INSERT INTO batteries (id, model_id) VALUES (?, ?)");
		testStmt = db.prepare("INSERT INTO battery_tests (id, battery_id, capacity, timestamp, process_id) VALUES (?, ?, ?, ?, ?)");
		testProcessStmt = db.prepare("INSERT INTO battery_tests_processes (id, name, description) VALUES (?, ?, ?)");

		const dummyProcesses = [
			{ id: randomUUID(), name: 'Process A', description: 'Description for Process A' },
			{ id: randomUUID(), name: 'Process B', description: 'Description for Process B' },
			{ id: randomUUID(), name: 'Process C', description: 'Description for Process C' },
		];

		for (const process of dummyProcesses) {
			await stmtRunAsync(testProcessStmt, [process.id, process.name, process.description]);
		}

		for (let i = 0; i < 11; i++) {
			const randomModel: ModelData = modelDetails[Math.floor(Math.random() * modelDetails.length)];
			if (randomModel) {
				const batteryId = randomUUID();
				await stmtRunAsync(batteryStmt, [batteryId, randomModel.id]);

				// Insert 3 test records for each battery
				for (let j = 0; j < 4; j++) {
					const testId = randomUUID();
					const processId = j % 2 === 0 ? dummyProcesses[Math.floor(Math.random() * dummyProcesses.length)].id : null;
					await stmtRunAsync(testStmt, [testId, batteryId, Math.floor(Math.random() * 1000) + 1000, new Date(Date.now() - j * 86400000).toISOString(), processId]);
				}
			}
		}

	} catch (err: any) {
		console.error(err.message);
	} finally {
		if (batteryStmt) {
			batteryStmt.finalize();
		}
		if (testStmt) {
			testStmt.finalize();
		}
		if (testProcessStmt) {
			testProcessStmt.finalize();
		}
	}
};

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
