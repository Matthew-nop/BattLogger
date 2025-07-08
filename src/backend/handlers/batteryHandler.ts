import { Request, Response } from 'express';
import sqlite3 from 'sqlite3';

import { createBattery, deleteBattery, getBattery, getData, updateBattery, getBatteryDetailsForId } from '../batteryManager.js';
import { BatteryData, CreateBatteryParams, GetDataQueryParams } from '../../interfaces/interfaces.js';

export class BatteryHandler {
	private db: sqlite3.Database;

	constructor(db: sqlite3.Database) {
		this.db = db;
	}

	public getData = (req: Request<{}, {}, {}, GetDataQueryParams>, res: Response<BatteryData[]>) => {
		getData(this.db)(req, res);
	};

	public getBattery = (req: Request<{ batteryId: string }>, res: Response<BatteryData | { error: string }>) => {
		getBattery(this.db)(req, res);
	};

	public getBatteryDetailsForId = (req: Request<{ batteryId: string }>, res: Response<BatteryData | { error: string }>) => {
		getBatteryDetailsForId(this.db)(req, res);
	};

	public createBattery = (req: Request<{}, {}, CreateBatteryParams>, res: Response<{ message: string, id: string } | { error: string }>) => {
		createBattery(this.db)(req, res);
	};

	public updateBattery = (req: Request<{ batteryId: string }, {}, CreateBatteryParams>, res: Response<{ message: string } | { error: string }>) => {
		updateBattery(this.db)(req, res);
	};

	public deleteBattery = (req: Request<{ batteryId: string }>, res: Response<{ message: string } | { error: string }>) => {
		deleteBattery(this.db)(req, res);
	};
}
