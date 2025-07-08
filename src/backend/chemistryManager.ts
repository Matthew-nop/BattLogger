import { randomUUID } from 'crypto';
import sqlite3 from 'sqlite3';


import { Chemistry } from '../interfaces/interfaces.js';
import { stmtRunAsync } from './utils/dbUtils.js';

export class ChemistryManager {
	private static instance: ChemistryManager;
	private db: sqlite3.Database | null = null;
	private cachedChemistries: Map<string, Chemistry> | null = null;

	private constructor() { }

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
		const db = this.getDb();
		const chemistriesMap = new Map<string, Chemistry>();

		try {
			const rows = await new Promise<any[]>((resolve, reject) => {
				db.all("SELECT * FROM chemistries", [], (err, rows) => {
					if (err) {
						reject(err);
					} else {
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
			console.error('Error fetching chemistries from database:', error);
			throw new Error('Failed to fetch chemistries from database.');
		}
	}

	public async populateChemistriesTable(chemistries: Map<string, Chemistry>): Promise<void> {
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
		console.log('Chemistries table populated.');
		this.cachedChemistries = null; // Invalidate cache
	}

	public async getChemistriesMap(): Promise<Map<string, Chemistry>> {
		if (!this.cachedChemistries) {
			await this._loadChemistriesFromDb();
		}
		return this.cachedChemistries!;
	}

	public async getChemistryById(id: string): Promise<Chemistry | null> {
		if (!this.cachedChemistries) {
			await this._loadChemistriesFromDb();
		}
		return this.cachedChemistries!.get(id) || null;
	}

	

	public async getAllChemistries(): Promise<Chemistry[]> {
		try {
			if (!this.cachedChemistries) {
				await this._loadChemistriesFromDb();
			}
			return Array.from(this.cachedChemistries!.values());
		} catch (error) {
			console.error('Error fetching chemistries from database:', error);
			throw new Error('Failed to fetch chemistries.');
		}
	}

	public async createChemistry(name: string, shortName: string, nominalVoltage: number): Promise<{ id: string }> {
		const db = this.getDb();

		if (!name || !shortName || isNaN(nominalVoltage)) {
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
			return { id: newGuid };
		} catch (error) {
			console.error('Error inserting new chemistry into database:', error);
			throw new Error('Failed to save chemistry.');
		}
	}
}
