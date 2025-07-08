import sqlite3 from 'sqlite3';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

import { FormFactor, CreateFormFactorParams } from '../interfaces/interfaces.js';

import { stmtRunAsync } from './utils/dbUtils.js';

export class FormFactorManager {
	private static instance: FormFactorManager;
	private db: sqlite3.Database | null = null;
	private cachedFormFactors: Map<string, FormFactor> | null = null;

	private constructor() { }

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
		const db = this.getDb();
		const formFactorsMap = new Map<string, FormFactor>();
		try {
			const rows = await new Promise<any[]>((resolve, reject) => {
				db.all("SELECT * FROM formfactors", [], (err, rows) => {
					if (err) {
						reject(err);
					} else {
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
			console.error('Error fetching form factors from database:', error);
			throw new Error('Failed to fetch form factors from database.');
		}
	}

	public async populateFormFactorsTable(formFactors: Map<string, FormFactor>): Promise<void> {
		const db = this.getDb();
		const stmt = db.prepare("INSERT OR REPLACE INTO formfactors (id, name) VALUES (?, ?)");
		for (const [guid, formfactor] of formFactors.entries()) {
			await stmtRunAsync(stmt, [
				formfactor.id,
				formfactor.name
			]);
		}
		stmt.finalize();
		console.log('Form Factors table populated.');
		this.cachedFormFactors = null; // Invalidate cache
	}

	public getFormFactorMap = async (req: Request, res: Response<Record<string, FormFactor> | { error: string }>) => {
		try {
			if (!this.cachedFormFactors) {
				await this._loadFormFactorsFromDb();
			}
			res.json(Object.fromEntries(this.cachedFormFactors!));
		} catch (error) {
			console.error('Error fetching form factors from database:', error);
			res.status(500).json({ error: 'Failed to fetch Formfactor map.' });
		}
	};

	public async getFormFactorById(id: string): Promise<FormFactor | null> {
		if (!this.cachedFormFactors) {
			await this._loadFormFactorsFromDb();
		}
		return this.cachedFormFactors!.get(id) || null;
	}

	public createFormFactor = async (req: Request<{}, {}, CreateFormFactorParams>, res: Response) => {
		const db = this.getDb();
		const { name } = req.body;

		if (name === undefined || name === null || name.trim() === '') {
			res.status(400).json({ error: 'Form factor name is required and cannot be empty.' });
			return;
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
			res.status(201).json({ message: 'Form Factor created successfully', id: newGuid });
		} catch (error) {
			console.error('Error inserting new form factor into database:', error);
			res.status(500).json({ error: 'Failed to save form factor.' });
		}
	};
}