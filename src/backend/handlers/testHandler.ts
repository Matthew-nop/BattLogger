import { Request, Response } from 'express';
import sqlite3 from 'sqlite3';

import { addBatteryTestRunInfo, getBatteryTests } from '../testManager.js';
import { TestRunInfo, CreateTestRunInfoParams } from '../../interfaces/interfaces.js';

export class TestHandler {
	private db: sqlite3.Database;

	constructor(db: sqlite3.Database) {
		this.db = db;
	}

	public getBatteryTests = (req: Request<{ batteryId: string }>, res: Response<TestRunInfo[] | { error: string }>) => {
		getBatteryTests(this.db)(req, res);
	};

	public addBatteryTestRunInfo = (req: Request<{}, {}, CreateTestRunInfoParams>, res: Response<{ message: string, id: number } | { error: string }>) => {
		addBatteryTestRunInfo(this.db)(req, res);
	};
}
