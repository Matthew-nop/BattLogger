import sqlite3 from 'sqlite3';

import { TestRunInfo } from '../interfaces/interfaces.js';
import { stmtRunAsync } from './utils/dbUtils.js';

export class TestManager {
	private static instance: TestManager;
	private db: sqlite3.Database | null = null;

	private constructor() { }

	public static getInstance(): TestManager {
		if (!TestManager.instance) {
			TestManager.instance = new TestManager();
		}
		return TestManager.instance;
	}

	public setDb(db: sqlite3.Database): void {
		this.db = db;
	}

	private getDb(): sqlite3.Database {
		if (!this.db) {
			throw new Error("Database not set for TestManager.");
		}
		return this.db;
	}

	public async getBatteryTests(batteryId: string): Promise<TestRunInfo[]> {
		const db = this.getDb();
		return new Promise<TestRunInfo[]>((resolve, reject) => {
			db.all<TestRunInfo>("SELECT capacity, timestamp FROM battery_tests WHERE battery_id = ? ORDER BY timestamp DESC", [batteryId], (err: Error | null, rows: TestRunInfo[]) => {
				if (err) {
					reject(err);
				} else {
					resolve(rows);
				}
			});
		});
	}

	public async addBatteryTestRunInfo(batteryId: string, capacity: number, timestamp: number): Promise<{ id: number }> {
		const db = this.getDb();
		try {
			const stmt = db.prepare("INSERT INTO battery_tests (battery_id, capacity, timestamp) VALUES (?, ?, ?)");
			const result = await stmtRunAsync(stmt, [batteryId, capacity, timestamp]);
			stmt.finalize();
			return { id: result.lastID };
		} catch {
			throw new Error('Failed to add battery test.');
		}
	}
}