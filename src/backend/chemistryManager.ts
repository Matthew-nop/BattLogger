import { randomUUID } from 'crypto';
import sqlite3 from 'sqlite3';
import { Request, Response } from 'express';

import { Chemistry, CreateChemistryParams } from '../interfaces/interfaces.js';
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
		for (const [guid, chemistry] of chemistries.entries()) {
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

	public getChemistriesMap = async (req: Request, res: Response<Record<string, Chemistry> | { error: string }>) => {
		try {
			if (!this.cachedChemistries) {
				await this._loadChemistriesFromDb();
			}
			res.json(Object.fromEntries(this.cachedChemistries!));
		} catch (error) {
			console.error('Error fetching chemistries from database:', error);
			res.status(500).json({ error: 'Failed to fetch chemistries map.' });
		}
	};

	public async getChemistryById(id: string): Promise<Chemistry | null> {
		if (!this.cachedChemistries) {
			await this._loadChemistriesFromDb();
		}
		return this.cachedChemistries!.get(id) || null;
	}

	public getChemistryForId = async (req: Request, res: Response<Chemistry | { error: string }>) => {
		const { id } = req.params;

		try {
			if (!this.cachedChemistries) {
				await this._loadChemistriesFromDb();
			}
			const chemistry = this.cachedChemistries!.get(id);

			if (chemistry) {
				res.json(chemistry);
			} else {
				res.status(404).json({ error: 'Chemistry not found.' });
			}
		} catch (error) {
			console.error('Error fetching chemistry from database:', error);
			res.status(500).json({ error: 'Failed to fetch chemistry.' });
		}
	};

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

	public getChemistries = async (req: Request, res: Response<Chemistry[] | { error: string }>) => {
		try {
			const chemistries = await this.getAllChemistries();
			res.json(chemistries);
		} catch (error) {
			console.error('Error fetching chemistries from database:', error);
			res.status(500).json({ error: 'Failed to fetch chemistries.' });
		}
	};

    

	public createChemistry = async (req: Request<{}, {}, CreateChemistryParams>, res: Response) => {
		const db = this.getDb();
		const { name, shortName, nominalVoltage } = req.body;

		if (!name || !shortName || isNaN(nominalVoltage)) {
			res.status(400).json({ error: 'Missing required fields.' });
			return;
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
			res.status(201).json({ message: 'Chemistry created successfully', id: newGuid });
		} catch (error) {
			console.error('Error inserting new chemistry into database:', error);
			res.status(500).json({ error: 'Failed to save chemistry.' });
		}
	};
}
