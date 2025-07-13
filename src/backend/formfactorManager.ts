import sqlite3 from 'sqlite3';
import { randomUUID } from 'crypto';

import { FormFactor } from '../interfaces/interfaces.js';

import { stmtRunAsync } from './utils/dbUtils.js';
import { LoggingManager, LOG_LEVEL } from './loggingManager.js';

export class FormFactorManager {
	private static instance: FormFactorManager;
	private db: sqlite3.Database | null = null;
	private cachedFormFactors: Map<string, FormFactor> | null = null;
	private logger: LoggingManager;

	private constructor() {
		this.logger = LoggingManager.getInstance();
	}

	public static getInstance(): FormFactorManager {
		if (!FormFactorManager.instance) {
			FormFactorManager.instance = new FormFactorManager();
		}
		return FormFactorManager.instance;
	}

	public setDb(db: sqlite3.Database): void {
		this.db = db;
	}

	private getDb(): sqlite3.Database {
		if (!this.db) {
			throw new Error("Database not set for FormFactorManager.");
		}
		return this.db;
	}

	private async _loadFormFactorsFromDb(): Promise<Map<string, FormFactor>> {
		this.logger.log(LOG_LEVEL.INFO, 'Loading form factors from database.');
		const db = this.getDb();
		const formFactorsMap = new Map<string, FormFactor>();
		try {
			const rows = await new Promise<any[]>((resolve, reject) => {
				db.all("SELECT * FROM formfactors", [], (err, rows) => {
					if (err) {
						this.logger.log(LOG_LEVEL.ERROR, `Error loading form factors from database: ${err.message}`);
						reject(err);
					} else {
						this.logger.log(LOG_LEVEL.INFO, `Successfully loaded ${rows.length} form factors from database.`);
						resolve(rows);
					}
				});
			});

			for (const row of rows) {
				formFactorsMap.set(row.id, {
					id: row.id,
					name: row.name,
				});
			}
			this.cachedFormFactors = formFactorsMap;
			return formFactorsMap;
		} catch (error) {
			this.logger.log(LOG_LEVEL.ERROR, `Error fetching form factors from database: ${error}`);
			throw new Error('Failed to fetch form factors from database.');
		}
	}

	public async populateFormFactorsTable(formFactors: Map<string, FormFactor>): Promise<void> {
		this.logger.log(LOG_LEVEL.INFO, 'Populating form factors table.');
		const db = this.getDb();
		const stmt = db.prepare("INSERT OR REPLACE INTO formfactors (id, name) VALUES (?, ?)");
		for (const [, formfactor] of formFactors.entries()) {
			await stmtRunAsync(stmt, [
				formfactor.id,
				formfactor.name
			]);
		}
		stmt.finalize();
		this.logger.log(LOG_LEVEL.INFO, 'Form Factors table populated.');
		this.cachedFormFactors = null; // Invalidate cache
	}

	public async getFormFactorMap(): Promise<Map<string, FormFactor>> {
		this.logger.log(LOG_LEVEL.INFO, 'Attempting to retrieve form factor map.');
		if (!this.cachedFormFactors) {
			await this._loadFormFactorsFromDb();
		}
		this.logger.log(LOG_LEVEL.INFO, `Successfully retrieved ${this.cachedFormFactors!.size} form factors for map.`);
		return this.cachedFormFactors!;
	}

	public async getFormFactorById(id: string): Promise<FormFactor | null> {
		this.logger.log(LOG_LEVEL.INFO, `Attempting to retrieve form factor by ID: ${id}`);
		if (!this.cachedFormFactors) {
			await this._loadFormFactorsFromDb();
		}
		const formFactor = this.cachedFormFactors!.get(id) || null;
		if (formFactor) {
			this.logger.log(LOG_LEVEL.INFO, `Successfully retrieved form factor for ID: ${id}`);
		} else {
			this.logger.log(LOG_LEVEL.WARN, `Form factor with ID: ${id} not found.`);
		}
		return formFactor;
	}

	public async createFormFactor(name: string): Promise<{ id: string }> {
		this.logger.log(LOG_LEVEL.INFO, `Attempting to create form factor with name: ${name}`);
		const db = this.getDb();

		if (name === undefined || name === null || name.trim() === '') {
			this.logger.log(LOG_LEVEL.ERROR, 'Form factor name is required and cannot be empty.');
			throw new Error('Form factor name is required and cannot be empty.');
		}

		const newGuid = randomUUID();
		const newFormFactor = {
			id: newGuid,
			name: name,
		};

		try {
			const stmt = db.prepare("INSERT INTO formfactors (id, name) VALUES (?, ?)");
			await stmtRunAsync(stmt, [
				newFormFactor.id,
				newFormFactor.name
			]);
			stmt.finalize();
			this.cachedFormFactors = null; // Invalidate cache
			this.logger.log(LOG_LEVEL.INFO, `Successfully created form factor with ID: ${newGuid}`);
			return { id: newGuid };
		} catch (error) {
			this.logger.log(LOG_LEVEL.ERROR, `Error inserting new form factor into database: ${error}`);
			throw new Error('Failed to save form factor.');
		}
	}
}