import sqlite3 from 'sqlite3';

import { BatteryData, GetDataQueryParams } from '../interfaces/interfaces.js';

import { loadModelDetails, stmtRunAsync } from './utils/dbUtils.js';
import { LoggingManager, LOG_LEVEL } from './loggingManager.js';

export class BatteryManager {
	private static instance: BatteryManager;
	private db: sqlite3.Database | null = null;
	private logger: LoggingManager;

	private constructor() {
		this.logger = LoggingManager.getInstance(); 
	 }

	public static getInstance(): BatteryManager {
		if (!BatteryManager.instance) {
			BatteryManager.instance = new BatteryManager();
		}
		return BatteryManager.instance;
	}

	public setDb(db: sqlite3.Database): void {
		this.db = db;
	}

	private getDb(): sqlite3.Database {
		if (!this.db) {
			throw new Error("Database not set for BatteryManager.");
		}
		return this.db;
	}

	public async getData(queryParams: GetDataQueryParams): Promise<BatteryData[]> {
		this.logger.log(LOG_LEVEL.INFO, `Attempting to retrieve battery data with query params: ${JSON.stringify(queryParams)}`);
		const db = this.getDb();
		const { sortBy, order = 'asc', name, formfactor, chemistry } = queryParams;
		let query = `
		SELECT
			bd.id AS id,
			bd.model_id AS modelId,
			bt.capacity AS lastTestedCapacity,
			bt.timestamp AS lastTestedTimestamp,
			c.name AS chemistryName,
			c.short_name AS chemistryShortName,
			ff.name AS formfactorName
		FROM
			batteries bd
		LEFT JOIN models m ON bd.model_id = m.id
		LEFT JOIN chemistries c ON m.chemistry_id = c.id
		LEFT JOIN formfactors ff ON m.formfactor_id = ff.id
		LEFT JOIN (
			SELECT
				battery_id,
				capacity,
				timestamp,
				ROW_NUMBER() OVER(PARTITION BY battery_id ORDER BY timestamp DESC) as rn
			FROM
				battery_tests
		) bt ON bd.id = bt.battery_id AND bt.rn = 1
		`;
		const params: any[] = [];
		const conditions = [];

		if (name) {
			conditions.push(`bd.model_id = ?`);
			params.push(name);
		}
		if (formfactor) {
			conditions.push(`m.formfactor_id = ?`);			
			params.push(formfactor);
		}
		if (chemistry) {
			conditions.push(`m.chemistry_id = ?`);
			params.push(chemistry);
		}

		if (conditions.length > 0) {
			query += " WHERE " + conditions.join(" AND ");
		}

		if (sortBy) {
			query += ` ORDER BY ${sortBy} ${order}`;
		}

		return new Promise<BatteryData[]>((resolve, reject) => {
			db.all<BatteryData>(query, params, (err: Error | null, rows: BatteryData[]) => {
				if (err) {
					this.logger.log(LOG_LEVEL.ERROR, `Error retrieving battery data: ${err.message}`);
					reject(err);
				} else {
					this.logger.log(LOG_LEVEL.INFO, `Successfully retrieved ${rows.length} battery data entries.`);
					resolve(rows);
				}
			});
		});
	}

	public async getBattery(batteryId: string): Promise<BatteryData | null> {
		this.logger.log(LOG_LEVEL.INFO, `Attempting to retrieve battery with ID: ${batteryId}`);
		const db = this.getDb();
		return new Promise<BatteryData | null>((resolve, reject) => {
			db.get<BatteryData>("SELECT id, model_id AS modelId FROM batteries WHERE id = ?", [batteryId], (err: Error | null, row: BatteryData) => {
				if (err) {
					this.logger.log(LOG_LEVEL.ERROR, `Error retrieving battery with ID ${batteryId}: ${err.message}`);
					reject(err);
				} else {
					this.logger.log(LOG_LEVEL.INFO, `Successfully retrieved battery with ID: ${batteryId}`);
					resolve(row || null);
				}
			});
		});
	}

	public async getBatteryDetailsForId(batteryId: string): Promise<BatteryData | null> {
		this.logger.log(LOG_LEVEL.INFO, `Attempting to retrieve battery details for ID: ${batteryId}`);
		const db = this.getDb();
		const query = `
			SELECT
				b.id,
				b.model_id AS modelId,
				bt.capacity AS lastTestedCapacity,
				bt.timestamp AS lastTestedTimestamp,
				c.name AS chemistryName,
				ff.name AS formfactorName
			FROM
				batteries b
			LEFT JOIN models m ON b.model_id = m.id
			LEFT JOIN chemistries c ON m.chemistry_id = c.id
			LEFT JOIN formfactors ff ON m.formfactor_id = ff.id
			LEFT JOIN (
				SELECT
					battery_id,
					capacity,
					timestamp,
					ROW_NUMBER() OVER(PARTITION BY battery_id ORDER BY timestamp DESC) as rn
				FROM
					battery_tests
			) bt ON b.id = bt.battery_id AND bt.rn = 1
			WHERE b.id = ?
		`;

		return new Promise<BatteryData | null>((resolve, reject) => {
			db.get<BatteryData>(query, [batteryId], (err: Error | null, row: BatteryData) => {
				if (err) {
					this.logger.log(LOG_LEVEL.ERROR, `Error retrieving battery details for ID ${batteryId}: ${err.message}`);
					reject(err);
				} else {
					this.logger.log(LOG_LEVEL.INFO, `Successfully retrieved battery details for ID: ${batteryId}`);
					resolve(row || null);
				}
			});
		});
	}

	public async createBattery(batteryId: string, modelIdentifier: string): Promise<{ id: string }> {
		this.logger.log(LOG_LEVEL.INFO, `Attempting to create battery with ID: ${batteryId} and model: ${modelIdentifier}`);
		const db = this.getDb();

		const model = loadModelDetails().get(modelIdentifier);
		if (!model) {
			this.logger.log(LOG_LEVEL.ERROR, `Invalid model identifier: ${modelIdentifier}`);
			throw new Error('Invalid model identifier.');
		}

		return new Promise<{ id: string }>((resolve, reject) => {
			db.get("SELECT id FROM batteries WHERE id = ?", [batteryId], (errGet: Error | null, row: any) => {
				if (errGet) {
					this.logger.log(LOG_LEVEL.ERROR, `Error checking for existing battery with ID ${batteryId}: ${errGet.message}`);
					reject(new Error('Failed to check for existing battery.'));
					return;
				}
				if (row) {
					this.logger.log(LOG_LEVEL.WARN, `Battery with ID ${batteryId} already exists.`);
					reject(new Error('Battery with this ID already exists.'));
					return;
				}

				const stmt = db.prepare("INSERT INTO batteries (id, model_id) VALUES (?, ?)");
				stmtRunAsync(stmt, [batteryId, modelIdentifier])
					.then(() => {
						stmt.finalize();
						this.logger.log(LOG_LEVEL.INFO, `Successfully created battery with ID: ${batteryId}`);
						resolve({ id: batteryId });
					})
					.catch ((err) => {
						this.logger.log(LOG_LEVEL.ERROR, `Failed to add battery with ID ${batteryId}: ${err.message}`);
						reject(new Error('Failed to add battery.'));
					});
			});
		});
	}

	public async updateBattery(batteryId: string, modelIdentifier: string): Promise<boolean> {
		const db = this.getDb();

		const model = loadModelDetails().get(modelIdentifier);
		if (!model) {
			throw new Error('Invalid model identifier.');
		}

		return new Promise<boolean>((resolve, reject) => {
			const stmt = db.prepare("UPDATE batteries SET model_id = ? WHERE id = ?");
			stmtRunAsync(stmt, [modelIdentifier, batteryId])
				.then((result) => {
					stmt.finalize();
					if (result.changes === 0) {
						reject(new Error('Battery not found.'));
					} else {
						resolve(true);
					}
				})
				.catch(() => {
					reject(new Error('Failed to update battery.'));
				});
		});
	}

	public async deleteBattery(batteryId: string): Promise<boolean> {
		const db = this.getDb();
		return new Promise<boolean>((resolve, reject) => {
			const stmt = db.prepare("DELETE FROM batteries WHERE id = ?");
			stmtRunAsync(stmt, [batteryId])
				.then((result) => {
					stmt.finalize();
					if (result.changes === 0) {
						reject(new Error('Battery not found.'));
					} else {
						resolve(true);
					}
				})
				.catch(() => {
					reject(new Error('Failed to delete battery.'));
				});
		});
	}
}