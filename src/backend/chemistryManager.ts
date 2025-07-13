import { randomUUID } from 'crypto';
import sqlite3 from 'sqlite3';


import { Chemistry } from '../interfaces/interfaces.js';
import { stmtRunAsync } from './utils/dbUtils.js';
import { LoggingManager, LOG_LEVEL } from './loggingManager.js';

export class ChemistryManager {
	private static instance: ChemistryManager;
	private db: sqlite3.Database | null = null;
	private cachedChemistries: Map<string, Chemistry> | null = null;
	private logger: LoggingManager;

	private constructor() {
		this.logger = LoggingManager.getInstance();
	}

	public static getInstance(): ChemistryManager {
		if (!ChemistryManager.instance) {
			ChemistryManager.instance = new ChemistryManager();
		}
		return ChemistryManager.instance;
	}

	public setDb(db: sqlite3.Database): void {
		this.db = db;
	}

	private getDb(): sqlite3.Database {
		if (!this.db) {
			throw new Error("Database not set for ChemistryManager.");
		}
		return this.db;
	}

	private async _loadChemistriesFromDb(): Promise<Map<string, Chemistry>> {
		this.logger.log(LOG_LEVEL.INFO, 'Loading chemistries from database.');
		const db = this.getDb();
		const chemistriesMap = new Map<string, Chemistry>();

		try {
			const rows = await new Promise<any[]>((resolve, reject) => {
				db.all("SELECT * FROM chemistries", [], (err, rows) => {
					if (err) {
						this.logger.log(LOG_LEVEL.ERROR, `Error loading chemistries from database: ${err.message}`);
						reject(err);
					} else {
						this.logger.log(LOG_LEVEL.INFO, `Successfully loaded ${rows.length} chemistries from database.`);
						resolve(rows);
					}
				});
			});

			for (const row of rows) {
				chemistriesMap.set(row.id, {
					id: row.id,
					name: row.name,
					shortName: row.short_name,
					nominalVoltage: row.nominal_voltage
				});
			}
			this.cachedChemistries = chemistriesMap;
			return chemistriesMap;
		} catch (error) {
			this.logger.log(LOG_LEVEL.ERROR, `Error fetching chemistries from database: ${error}`);
			throw new Error('Failed to fetch chemistries from database.');
		}
	}

	public async populateChemistriesTable(chemistries: Map<string, Chemistry>): Promise<void> {
		this.logger.log(LOG_LEVEL.INFO, 'Populating chemistries table.');
		const db = this.getDb();
		const stmt = db.prepare("INSERT OR REPLACE INTO chemistries (id, name, short_name, nominal_voltage) VALUES (?, ?, ?, ?)");
		for (const [, chemistry] of chemistries.entries()) {
			await stmtRunAsync(stmt, [
				chemistry.id,
				chemistry.name,
				chemistry.shortName,
				chemistry.nominalVoltage
			]);
		}
		stmt.finalize();
		this.logger.log(LOG_LEVEL.INFO, 'Chemistries table populated.');
		this.cachedChemistries = null; // Invalidate cache
	}

	public async getChemistriesMap(): Promise<Map<string, Chemistry>> {
		this.logger.log(LOG_LEVEL.INFO, 'Attempting to retrieve chemistries map.');
		if (!this.cachedChemistries) {
			await this._loadChemistriesFromDb();
		}
		this.logger.log(LOG_LEVEL.INFO, `Successfully retrieved ${this.cachedChemistries!.size} chemistries for map.`);
		return this.cachedChemistries!;
	}

	public async getChemistryById(id: string): Promise<Chemistry | null> {
		this.logger.log(LOG_LEVEL.INFO, `Attempting to retrieve chemistry by ID: ${id}`);
		if (!this.cachedChemistries) {
			await this._loadChemistriesFromDb();
		}
		const chemistry = this.cachedChemistries!.get(id) || null;
		if (chemistry) {
			this.logger.log(LOG_LEVEL.INFO, `Successfully retrieved chemistry for ID: ${id}`);
		} else {
			this.logger.log(LOG_LEVEL.WARN, `Chemistry with ID: ${id} not found.`);
		}
		return chemistry;
	}

	

	public async getAllChemistries(): Promise<Chemistry[]> {
		this.logger.log(LOG_LEVEL.INFO, 'Attempting to retrieve all chemistries.');
		try {
			if (!this.cachedChemistries) {
				await this._loadChemistriesFromDb();
			}
			this.logger.log(LOG_LEVEL.INFO, `Successfully retrieved ${this.cachedChemistries!.size} chemistries.`);
			return Array.from(this.cachedChemistries!.values());
		} catch (error) {
			this.logger.log(LOG_LEVEL.ERROR, `Error fetching chemistries from database: ${error}`);
			throw new Error('Failed to fetch chemistries.');
		}
	}

	public async createChemistry(name: string, shortName: string, nominalVoltage: number): Promise<{ id: string }> {
		this.logger.log(LOG_LEVEL.INFO, `Attempting to create chemistry with name: ${name}, shortName: ${shortName}, nominalVoltage: ${nominalVoltage}`);
		const db = this.getDb();

		if (!name || !shortName || isNaN(nominalVoltage)) {
			this.logger.log(LOG_LEVEL.ERROR, 'Missing required fields for chemistry creation.');
			throw new Error('Missing required fields.');
		}

		const newGuid = randomUUID();
		const newChemistry = {
			id: newGuid,
			name,
			shortName,
			nominalVoltage
		};

		try {
			const stmt = db.prepare("INSERT INTO chemistries (id, name, short_name, nominal_voltage) VALUES (?, ?, ?, ?)");
			await stmtRunAsync(stmt, [
				newChemistry.id,
				newChemistry.name,
				newChemistry.shortName,
				newChemistry.nominalVoltage
			]);
			stmt.finalize();
			this.cachedChemistries = null; // Invalidate cache
			this.logger.log(LOG_LEVEL.INFO, `Successfully created chemistry with ID: ${newGuid}`);
			return { id: newGuid };
		} catch (error) {
			this.logger.log(LOG_LEVEL.ERROR, `Error inserting new chemistry into database: ${error}`);
			throw new Error('Failed to save chemistry.');
		}
	}
}
