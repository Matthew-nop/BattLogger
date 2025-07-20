import sqlite3 from 'sqlite3';
import { CreateTestRunInfoParams, TestRunInfo } from '../interfaces/interfaces.js';
import { LOG_LEVEL, LoggingManager } from './loggingManager.js';
import { stmtRunAsync } from './utils/dbUtils.js';

export class TestManager {
	private static instance: TestManager;
	private db: sqlite3.Database | null = null;
	private logger: LoggingManager;

	private constructor() {
		this.logger = LoggingManager.getInstance();
	}

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
		this.logger.log(LOG_LEVEL.INFO, `Attempting to retrieve test runs for battery ID: ${batteryId}`);
		const db = this.getDb();
		return new Promise<TestRunInfo[]>((resolve, reject) => {
			db.all<TestRunInfo>("SELECT capacity, timestamp FROM battery_tests WHERE battery_id = ? ORDER BY timestamp DESC", [batteryId], (err: Error | null, rows: TestRunInfo[]) => {
				if (err) {
					this.logger.log(LOG_LEVEL.ERROR, `Error retrieving test runs for battery ID ${batteryId}: ${err.message}`);
					reject(err);
				} else {
					this.logger.log(LOG_LEVEL.INFO, `Successfully retrieved ${rows.length} test runs for battery ID: ${batteryId}`);
					resolve(rows);
				}
			});
		});
	}


	public async getAllTestRuns(): Promise<TestRunInfo[]> {
		this.logger.log(LOG_LEVEL.INFO, 'Attempting to retrieve all test runs.');
		const db = this.getDb();
		return new Promise<TestRunInfo[]>((resolve, reject) => {
			db.all<TestRunInfo>("SELECT id, battery_id, capacity, timestamp FROM battery_tests", [], (err: Error | null, rows: TestRunInfo[]) => {
				if (err) {
					this.logger.log(LOG_LEVEL.ERROR, `Error retrieving all test runs: ${err.message}`);
					reject(err);
				} else {
					this.logger.log(LOG_LEVEL.INFO, `Successfully retrieved ${rows.length} test runs.`);
					resolve(rows);
				}
			});
		});
	}

	public async createTestRun(params: CreateTestRunInfoParams): Promise<{ id: number }> {
		const db = this.getDb();
		try {
			const stmt = db.prepare("INSERT INTO battery_tests (battery_id, capacity, timestamp) VALUES (?, ?, ?)");
			const result = await stmtRunAsync(stmt, [params.batteryId, params.capacity, params.timestamp]);
			stmt.finalize();
			return { id: result.lastID };
		} catch {
			throw new Error('Failed to add battery test.');
		}
	}

	public async populateTestRunsTable(testRuns: TestRunInfo[]): Promise<{ id: number }[]> {
		this.logger.log(LOG_LEVEL.INFO, `Attempting to populate battery tests table with ${testRuns.length} entries.`);
		const db = this.getDb();
		const insertedTestRuns: { id: number }[] = [];

		const stmt = db.prepare("INSERT INTO battery_tests (battery_id, capacity, timestamp) VALUES (?, ?, ?)");
		for (const testRun of testRuns) {
			try {
				const result = await stmtRunAsync(stmt, [testRun.battery_id, testRun.capacity, testRun.timestamp]);
				insertedTestRuns.push({ id: result.lastID });
				this.logger.log(LOG_LEVEL.INFO, `Successfully inserted test run for battery ID: ${testRun.battery_id}`);
			} catch (error: any) {
				this.logger.log(LOG_LEVEL.ERROR, `Failed to process test run for battery ID ${testRun.battery_id}: ${error.message}`);
			}
		}
		stmt.finalize();

		this.logger.log(LOG_LEVEL.INFO, `Finished populating battery tests table. Inserted ${insertedTestRuns.length} new test runs.`);
		return insertedTestRuns;
	}
}