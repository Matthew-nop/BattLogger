import { randomUUID } from 'crypto';
import sqlite3 from 'sqlite3';
import { CreateTestRunInfoParams, CreateTestRunProcessParams, TestRunInfo, TestRunProcess } from '../interfaces/interfaces.js';
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
			db.all<TestRunInfo>("SELECT id, capacity, timestamp, process_id FROM battery_tests WHERE battery_id = ? ORDER BY timestamp DESC", [batteryId], (err: Error | null, rows: TestRunInfo[]) => {
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
			db.all<TestRunInfo>("SELECT id, battery_id, capacity, timestamp, process_id FROM battery_tests", [], (err: Error | null, rows: TestRunInfo[]) => {
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

	public async createTestRun(params: CreateTestRunInfoParams): Promise<{ id: string }> {
		const db = this.getDb();
		try {
			const id = randomUUID();
			const stmt = db.prepare("INSERT INTO battery_tests (id, battery_id, capacity, timestamp, process_id) VALUES (?, ?, ?, ?, ?)");
			await stmtRunAsync(stmt, [id, params.batteryId, params.capacity, params.timestamp, params.processId]);
			stmt.finalize();
			return { id: id };
		} catch {
			throw new Error('Failed to add battery test.');
		}
	}

	public async createTestRunProcess(params: CreateTestRunProcessParams): Promise<{ id: string }> {
		this.logger.log(LOG_LEVEL.INFO, `Attempting to create test run process with name: ${params.name}`);
		const db = this.getDb();
		try {
			const id = randomUUID();
			const stmt = db.prepare("INSERT INTO battery_tests_processes (id, name, description) VALUES (?, ?, ?)");
			const result = await stmtRunAsync(stmt, [id, params.name, params.description]);
			stmt.finalize();
			this.logger.log(LOG_LEVEL.INFO, `Successfully created test run process with ID: ${id}`);
			return { id: id };
		} catch (error: any) {
			this.logger.log(LOG_LEVEL.ERROR, `Failed to add test run process: ${error.message}`);
			throw new Error('Failed to add test run process.');
		}
	}

	public async populateTestRunsTable(testRuns: TestRunInfo[]): Promise<{ id: string }[]> {
		this.logger.log(LOG_LEVEL.INFO, `Attempting to populate battery tests table with ${testRuns.length} entries.`);
		const db = this.getDb();
		const insertedTestRuns: { id: string }[] = [];

		const stmt = db.prepare("INSERT INTO battery_tests (id, battery_id, capacity, timestamp, process_id) VALUES (?, ?, ?, ?, ?)");
		for (const testRun of testRuns) {
			try {
				const id = testRun.id || randomUUID();
				await stmtRunAsync(stmt, [id, testRun.battery_id, testRun.capacity, testRun.timestamp, testRun.process_id]);
				insertedTestRuns.push({ id: id });
				this.logger.log(LOG_LEVEL.INFO, `Successfully inserted test run for battery ID: ${testRun.battery_id}`);
			} catch (error: any) {
				this.logger.log(LOG_LEVEL.ERROR, `Failed to process test run for battery ID ${testRun.battery_id}: ${error.message}`);
			}
		}
		stmt.finalize();

		this.logger.log(LOG_LEVEL.INFO, `Finished populating battery tests table. Inserted ${insertedTestRuns.length} new test runs.`);
		return insertedTestRuns;
	}

	public async getAllTestRunProcesses(): Promise<TestRunProcess[]> {
		this.logger.log(LOG_LEVEL.INFO, 'Attempting to retrieve all test run processes.');
		const db = this.getDb();
		return new Promise<TestRunProcess[]>((resolve, reject) => {
			db.all<TestRunProcess>("SELECT id, name, description FROM battery_tests_processes", [], (err: Error | null, rows: TestRunProcess[]) => {
				if (err) {
					this.logger.log(LOG_LEVEL.ERROR, `Error retrieving all test run processes: ${err.message}`);
					reject(err);
				} else {
					this.logger.log(LOG_LEVEL.INFO, `Successfully retrieved ${rows.length} test run processes.`);
					resolve(rows);
				}
			});
		});
	}
}